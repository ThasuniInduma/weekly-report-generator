const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const User = require("../models/User");
const { setAuthCookie, clearAuthCookie } = require("../services/token.service");

const register = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) throw new ApiError(409, "An account with this email already exists");

    const user = await User.create({
        name,
        email,
        password,
        role: role === "manager" ? "manager" : "member",
    });

    setAuthCookie(res, user);
    res.status(201).json({
        success: true,
        data: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
});

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
        throw new ApiError(401, "Invalid email or password");
    }

    setAuthCookie(res, user);
    res.json({
        success: true,
        data: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
});

const logout = asyncHandler(async (req, res) => {
    clearAuthCookie(res);
    res.json({ success: true, data: null });
});

const me = asyncHandler(async (req, res) => {
    const user = req.user;
    res.json({
        success: true,
        data: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
});

module.exports = { register, login, logout, me };
