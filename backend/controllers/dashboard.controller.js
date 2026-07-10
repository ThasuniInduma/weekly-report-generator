const asyncHandler = require("../utils/asyncHandler");
const Report = require("../models/Report");
const User = require("../models/User");
const Project = require("../models/Project");
const { getWeekBounds, deriveStatus } = require("../services/reportStatus.service");

const summary = asyncHandler(async (req, res) => {
    const { weekStart, weekEnd } = getWeekBounds(req.query.week || new Date());

    const [totalMembers, submittedReports, openBlockersCount] = await Promise.all([
        User.countDocuments({ role: "member" }),
        Report.find({ weekStart, status: "submitted" }).distinct("user"),
        Report.countDocuments({
            weekStart,
            status: "submitted",
            blockers: { $exists: true, $nin: ["", null] },
        }),
    ]);

    const submittedCount = submittedReports.length;
    const complianceRate = totalMembers === 0 ? 0 : Math.round((submittedCount / totalMembers) * 100);

    res.json({
        success: true,
        data: {
            weekStart,
            weekEnd,
            totalMembers,
            submittedCount,
            pendingCount: totalMembers - submittedCount,
            complianceRate,
            openBlockers: openBlockersCount,
        },
    });
});

const charts = asyncHandler(async (req, res) => {
    const weeksBack = Math.min(Number(req.query.weeks) || 8, 26);
    const { weekStart: currentWeekStart, weekEnd: currentWeekEnd } = getWeekBounds(
        req.query.week || new Date()
    );

    // Tasks completed trend: submitted report count per week, team-wide, over the trailing N weeks.
    const earliestWeekStart = new Date(currentWeekStart);
    earliestWeekStart.setDate(earliestWeekStart.getDate() - 7 * (weeksBack - 1));

    const trendReports = await Report.find({
        status: "submitted",
        weekStart: { $gte: earliestWeekStart, $lte: currentWeekStart },
    }).select("weekStart");

    const trendMap = new Map();
    for (let i = 0; i < weeksBack; i += 1) {
        const ws = new Date(earliestWeekStart);
        ws.setDate(ws.getDate() + 7 * i);
        trendMap.set(ws.toISOString().slice(0, 10), 0);
    }
    trendReports.forEach((r) => {
        const key = new Date(r.weekStart).toISOString().slice(0, 10);
        if (trendMap.has(key)) trendMap.set(key, trendMap.get(key) + 1);
    });
    const tasksCompletedTrend = Array.from(trendMap.entries()).map(([week, count]) => ({
        week,
        reportsSubmitted: count,
    }));

    // Submission status by member, for the selected week.
    const [members, submittedUserIds] = await Promise.all([
        User.find({ role: "member" }).select("name"),
        Report.find({ weekStart: currentWeekStart, status: "submitted" }).distinct("user"),
    ]);
    const submittedSet = new Set(submittedUserIds.map((id) => id.toString()));
    const submissionStatusByMember = members.map((m) => ({
        member: m.name,
        status: deriveStatus({ hasSubmitted: submittedSet.has(m._id.toString()), weekEnd: currentWeekEnd }),
    }));

    // Workload / task distribution by project, for the selected week.
    const workloadAgg = await Report.aggregate([
        { $match: { weekStart: currentWeekStart, status: "submitted" } },
        { $group: { _id: "$project", count: { $sum: 1 } } },
    ]);
    const projectIds = workloadAgg.map((w) => w._id);
    const projects = await Project.find({ _id: { $in: projectIds } }).select("name");
    const projectNameById = new Map(projects.map((p) => [p._id.toString(), p.name]));
    const workloadByProject = workloadAgg.map((w) => ({
        project: projectNameById.get(w._id.toString()) || "Unknown",
        count: w.count,
    }));

    res.json({
        success: true,
        data: { tasksCompletedTrend, submissionStatusByMember, workloadByProject },
    });
});

const activity = asyncHandler(async (req, res) => {
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const reports = await Report.find({ status: "submitted" })
        .sort({ submittedAt: -1 })
        .limit(limit)
        .populate([
            { path: "user", select: "name" },
            { path: "project", select: "name" },
        ]);

    res.json({ success: true, data: reports });
});

module.exports = { summary, charts, activity };
