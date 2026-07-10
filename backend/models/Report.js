const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
        weekStart: { type: Date, required: true },
        weekEnd: { type: Date, required: true },
        tasksCompleted: { type: String, required: true, trim: true },
        tasksPlanned: { type: String, required: true, trim: true },
        blockers: { type: String, trim: true, default: "" },
        hoursWorked: { type: Number, min: 0, max: 168 },
        notes: { type: String, trim: true, default: "" },
        status: { type: String, enum: ["draft", "submitted"], default: "draft" },
        submittedAt: { type: Date },
    },
    { timestamps: true }
);

reportSchema.index({ user: 1, project: 1, weekStart: 1 }, { unique: true });

module.exports = mongoose.model("Report", reportSchema);
