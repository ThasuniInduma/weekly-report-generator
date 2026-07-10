const asyncHandler = require("../utils/asyncHandler");
const User = require("../models/User");

const listUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select("name email role createdAt").sort({ name: 1 });
    res.json({ success: true, data: users });
});

module.exports = { listUsers };
