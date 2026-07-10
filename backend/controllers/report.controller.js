const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const Report = require("../models/Report");
const Project = require("../models/Project");
const User = require("../models/User");
const { getWeekBounds, deriveStatus } = require("../services/reportStatus.service");

const REPORT_POPULATE = [
    { path: "user", select: "name email" },
    { path: "project", select: "name" },
];

const createReport = asyncHandler(async (req, res) => {
    const { project, week, tasksCompleted, tasksPlanned, blockers, hoursWorked, notes, status } =
        req.body;

    const projectDoc = await Project.findById(project);
    if (!projectDoc) throw new ApiError(404, "Project not found");

    const { weekStart, weekEnd } = getWeekBounds(week);

    const existing = await Report.findOne({ user: req.user._id, project, weekStart });
    if (existing) {
        throw new ApiError(409, "A report for this project and week already exists. Edit it instead.");
    }

    const submitNow = status === "submitted";

    const report = await Report.create({
        user: req.user._id,
        project,
        weekStart,
        weekEnd,
        tasksCompleted,
        tasksPlanned,
        blockers,
        hoursWorked,
        notes,
        status: submitNow ? "submitted" : "draft",
        submittedAt: submitNow ? new Date() : undefined,
    });

    await report.populate(REPORT_POPULATE);
    res.status(201).json({ success: true, data: report });
});

const listMyReports = asyncHandler(async (req, res) => {
    const query = { user: req.user._id };

    if (req.query.week) {
        const { weekStart } = getWeekBounds(req.query.week);
        query.weekStart = weekStart;
    }

    const reports = await Report.find(query).populate(REPORT_POPULATE).sort({ weekStart: -1 });
    res.json({ success: true, data: reports });
});

const getReport = asyncHandler(async (req, res) => {
    const report = await Report.findById(req.params.id).populate(REPORT_POPULATE);
    if (!report) throw new ApiError(404, "Report not found");

    const isOwner = report.user._id.equals(req.user._id);
    if (!isOwner && req.user.role !== "manager") {
        throw new ApiError(403, "You do not have permission to view this report");
    }

    res.json({ success: true, data: report });
});

const updateReport = asyncHandler(async (req, res) => {
    const report = await Report.findById(req.params.id);
    if (!report) throw new ApiError(404, "Report not found");
    if (!report.user.equals(req.user._id)) {
        throw new ApiError(403, "You can only edit your own reports");
    }

    const { tasksCompleted, tasksPlanned, blockers, hoursWorked, notes } = req.body;
    if (tasksCompleted !== undefined) report.tasksCompleted = tasksCompleted;
    if (tasksPlanned !== undefined) report.tasksPlanned = tasksPlanned;
    if (blockers !== undefined) report.blockers = blockers;
    if (hoursWorked !== undefined) report.hoursWorked = hoursWorked;
    if (notes !== undefined) report.notes = notes;

    await report.save();
    await report.populate(REPORT_POPULATE);
    res.json({ success: true, data: report });
});

const submitReport = asyncHandler(async (req, res) => {
    const report = await Report.findById(req.params.id);
    if (!report) throw new ApiError(404, "Report not found");
    if (!report.user.equals(req.user._id)) {
        throw new ApiError(403, "You can only submit your own reports");
    }
    if (report.status === "submitted") {
        throw new ApiError(409, "Report has already been submitted");
    }

    report.status = "submitted";
    report.submittedAt = new Date();
    await report.save();
    await report.populate(REPORT_POPULATE);
    res.json({ success: true, data: report });
});

const deleteReport = asyncHandler(async (req, res) => {
    const report = await Report.findById(req.params.id);
    if (!report) throw new ApiError(404, "Report not found");
    if (!report.user.equals(req.user._id)) {
        throw new ApiError(403, "You can only delete your own reports");
    }
    if (report.status === "submitted") {
        throw new ApiError(409, "Submitted reports cannot be deleted");
    }

    await report.deleteOne();
    res.json({ success: true, data: null });
});

// Manager: raw report listing with filters
const listReports = asyncHandler(async (req, res) => {
    const { member, project, status, from, to, week } = req.query;
    const query = {};

    if (member) query.user = member;
    if (project) query.project = project;
    if (status) query.status = status;

    if (week) {
        const { weekStart } = getWeekBounds(week);
        query.weekStart = weekStart;
    } else if (from || to) {
        query.weekStart = {};
        if (from) query.weekStart.$gte = getWeekBounds(from).weekStart;
        if (to) query.weekStart.$lte = getWeekBounds(to).weekStart;
    }

    const reports = await Report.find(query).populate(REPORT_POPULATE).sort({ weekStart: -1 });
    res.json({ success: true, data: reports });
});

// Manager: derived submitted/pending/late status per team member for a given week
const getTeamStatus = asyncHandler(async (req, res) => {
    const { weekStart, weekEnd } = getWeekBounds(req.query.week || new Date());

    const [members, submittedUserIds] = await Promise.all([
        User.find({ role: "member" }).select("name email"),
        Report.find({ weekStart, status: "submitted" }).distinct("user"),
    ]);

    const submittedSet = new Set(submittedUserIds.map((id) => id.toString()));

    const data = members.map((member) => ({
        user: { id: member._id, name: member.name, email: member.email },
        status: deriveStatus({ hasSubmitted: submittedSet.has(member._id.toString()), weekEnd }),
    }));

    res.json({ success: true, data: { weekStart, weekEnd, members: data } });
});

module.exports = {
    createReport,
    listMyReports,
    getReport,
    updateReport,
    submitReport,
    deleteReport,
    listReports,
    getTeamStatus,
};
