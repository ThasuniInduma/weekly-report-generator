// Wipes and re-seeds Users/Projects/Reports with demo data for local development.
// Run with: npm run seed  (from backend/)
require("dotenv").config();
const connectDB = require("../config/db");
const User = require("../models/User");
const Project = require("../models/Project");
const Report = require("../models/Report");
const { getWeekBounds } = require("../services/reportStatus.service");

const MEMBER_NAMES = ["Alice Chen", "Bob Martinez", "Carol Nguyen", "Dave Patel"];
const PROJECT_DEFS = [
    { name: "Client A", description: "External client engagement" },
    { name: "Internal Tooling", description: "Internal dev tooling and platform work" },
    { name: "R&D", description: "Exploratory research and prototypes" },
    { name: "Marketing", description: "Marketing site and campaigns" },
];
const BLOCKERS = [
    "",
    "",
    "Waiting on design sign-off",
    "Blocked by third-party API rate limits",
    "Need clarification on requirements",
];

function randomFrom(list) {
    return list[Math.floor(Math.random() * list.length)];
}

async function seed() {
    await connectDB();

    await Promise.all([User.deleteMany({}), Project.deleteMany({}), Report.deleteMany({})]);

    const manager = await User.create({
        name: "Priya Sharma",
        email: "manager@demo.com",
        password: "password123",
        role: "manager",
    });

    const members = await Promise.all(
        MEMBER_NAMES.map((name, i) =>
            User.create({
                name,
                email: `member${i + 1}@demo.com`,
                password: "password123",
                role: "member",
            })
        )
    );

    const projects = await Promise.all(
        PROJECT_DEFS.map((p) => Project.create({ ...p, createdBy: manager._id, members: members.map((m) => m._id) }))
    );

    const WEEKS_BACK = 6;
    const today = new Date();
    let reportCount = 0;

    for (let w = WEEKS_BACK; w >= 0; w -= 1) {
        const refDate = new Date(today);
        refDate.setDate(refDate.getDate() - 7 * w);
        const { weekStart, weekEnd } = getWeekBounds(refDate);

        for (const member of members) {
            // Leave a couple of gaps in the most recent weeks so the dashboard shows pending/late too.
            const skip = w <= 1 && Math.random() < 0.4;
            if (skip) continue;

            const project = randomFrom(projects);
            const submittedAt = new Date(weekEnd);
            submittedAt.setDate(submittedAt.getDate() + (Math.random() < 0.15 ? 2 : 1));

            await Report.create({
                user: member._id,
                project: project._id,
                weekStart,
                weekEnd,
                tasksCompleted: `Completed key deliverables for ${project.name} this week.`,
                tasksPlanned: `Continue progress on ${project.name} next week.`,
                blockers: randomFrom(BLOCKERS),
                hoursWorked: 30 + Math.round(Math.random() * 12),
                notes: "",
                status: "submitted",
                submittedAt,
            });
            reportCount += 1;
        }
    }

    console.log("Seed complete:");
    console.log(`  Manager:  manager@demo.com / password123`);
    console.log(`  Members:  member1@demo.com .. member${members.length}@demo.com / password123`);
    console.log(`  Projects: ${projects.length}`);
    console.log(`  Reports:  ${reportCount}`);

    process.exit(0);
}

seed().catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
});
