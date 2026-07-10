const express = require("express");
const { body } = require("express-validator");
const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const validate = require("../middleware/validate.middleware");
const {
    listProjects,
    createProject,
    updateProject,
    deleteProject,
} = require("../controllers/project.controller");

const router = express.Router();

router.use(protect);

router.get("/", listProjects);

router.post(
    "/",
    authorize("manager"),
    [body("name").trim().notEmpty().withMessage("Project name is required")],
    validate,
    createProject
);

router.put(
    "/:id",
    authorize("manager"),
    [body("name").optional().trim().notEmpty().withMessage("Project name cannot be empty")],
    validate,
    updateProject
);

router.delete("/:id", authorize("manager"), deleteProject);

module.exports = router;
