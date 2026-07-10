const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const Project = require("../models/Project");
const Report = require("../models/Report");

const listProjects = asyncHandler(async (req, res) => {
    const projects = await Project.find().sort({ name: 1 });
    res.json({ success: true, data: projects });
});

const createProject = asyncHandler(async (req, res) => {
    const { name, description, members } = req.body;

    const existing = await Project.findOne({ name });
    if (existing) throw new ApiError(409, "A project with this name already exists");

    const project = await Project.create({
        name,
        description,
        members: members || [],
        createdBy: req.user._id,
    });
    res.status(201).json({ success: true, data: project });
});

const updateProject = asyncHandler(async (req, res) => {
    const { name, description, isActive, members } = req.body;

    const project = await Project.findById(req.params.id);
    if (!project) throw new ApiError(404, "Project not found");

    if (name !== undefined) project.name = name;
    if (description !== undefined) project.description = description;
    if (isActive !== undefined) project.isActive = isActive;
    if (members !== undefined) project.members = members;

    await project.save();
    res.json({ success: true, data: project });
});

const deleteProject = asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id);
    if (!project) throw new ApiError(404, "Project not found");

    const reportCount = await Report.countDocuments({ project: project._id });
    if (reportCount > 0) {
        throw new ApiError(
            409,
            `Cannot delete: ${reportCount} report(s) reference this project. Deactivate it instead.`
        );
    }

    await project.deleteOne();
    res.json({ success: true, data: null });
});

module.exports = { listProjects, createProject, updateProject, deleteProject };
