const express = require("express");
const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const { summary, charts, activity } = require("../controllers/dashboard.controller");

const router = express.Router();

router.use(protect, authorize("manager"));

router.get("/summary", summary);
router.get("/charts", charts);
router.get("/activity", activity);

module.exports = router;
