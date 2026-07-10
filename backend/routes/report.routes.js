const express = require("express");
const { body } = require("express-validator");
const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const validate = require("../middleware/validate.middleware");
const {
    createReport,
    listMyReports,
    getReport,
    updateReport,
    submitReport,
    deleteReport,
    listReports,
    getTeamStatus,
} = require("../controllers/report.controller");

const router = express.Router();

router.use(protect);

const reportBodyRules = [
    body("tasksCompleted").trim().notEmpty().withMessage("Tasks completed is required"),
    body("tasksPlanned").trim().notEmpty().withMessage("Tasks planned is required"),
    body("hoursWorked").optional({ nullable: true }).isFloat({ min: 0, max: 168 }),
];

router.get("/", authorize("manager"), listReports);
router.get("/team-status", authorize("manager"), getTeamStatus);
router.get("/me", listMyReports);

router.post(
    "/",
    [
        body("project").notEmpty().withMessage("Project is required"),
        body("week").notEmpty().withMessage("Week is required").isISO8601(),
        ...reportBodyRules,
    ],
    validate,
    createReport
);

router.get("/:id", getReport);
router.put("/:id", reportBodyRules, validate, updateReport);
router.patch("/:id/submit", submitReport);
router.delete("/:id", deleteReport);

module.exports = router;
