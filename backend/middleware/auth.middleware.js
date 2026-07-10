const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { verifyToken, COOKIE_NAME } = require("../services/token.service");
const User = require("../models/User");

const protect = asyncHandler(async (req, res, next) => {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) throw new ApiError(401, "Not authenticated");

    let payload;
    try {
        payload = verifyToken(token);
    } catch {
        throw new ApiError(401, "Invalid or expired session");
    }

    const user = await User.findById(payload.id);
    if (!user) throw new ApiError(401, "User no longer exists");

    req.user = user;
    next();
});

module.exports = protect;
