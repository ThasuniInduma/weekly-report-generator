const express = require("express");
const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const { listUsers } = require("../controllers/user.controller");

const router = express.Router();

router.get("/", protect, authorize("manager"), listUsers);

module.exports = router;
