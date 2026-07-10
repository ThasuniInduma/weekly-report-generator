const jwt = require("jsonwebtoken");

const COOKIE_NAME = process.env.COOKIE_NAME || "wrg_token";

function signToken(user) {
    return jwt.sign(
        { id: user._id.toString(), role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );
}

function verifyToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
}

function cookieOptions() {
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    };
}

function setAuthCookie(res, user) {
    const token = signToken(user);
    res.cookie(COOKIE_NAME, token, cookieOptions());
}

function clearAuthCookie(res) {
    res.clearCookie(COOKIE_NAME, { ...cookieOptions(), maxAge: undefined });
}

module.exports = {
    COOKIE_NAME,
    signToken,
    verifyToken,
    setAuthCookie,
    clearAuthCookie,
};
