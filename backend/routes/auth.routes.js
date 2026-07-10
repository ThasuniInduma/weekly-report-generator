const express = require("express");
const { body } = require("express-validator");
const validate = require("../middleware/validate.middleware");
const protect = require("../middleware/auth.middleware");
const { register, login, logout, me } = require("../controllers/auth.controller");

const router = express.Router();

router.post(
    "/register",
    [
        body("name").trim().notEmpty().withMessage("Name is required"),
        body("email").isEmail().withMessage("A valid email is required").normalizeEmail(),
        body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
        body("role").optional().isIn(["member", "manager"]),
    ],
    validate,
    register
);

router.post(
    "/login",
    [
        body("email").isEmail().withMessage("A valid email is required").normalizeEmail(),
        body("password").notEmpty().withMessage("Password is required"),
    ],
    validate,
    login
);

router.post("/logout", logout);
router.get("/me", protect, me);

module.exports = router;
