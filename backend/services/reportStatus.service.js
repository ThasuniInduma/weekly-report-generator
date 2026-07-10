const DAY_MS = 24 * 60 * 60 * 1000;

// Weeks run Monday 00:00:00 -> Sunday 23:59:59.999
function getWeekBounds(dateInput) {
    const date = new Date(dateInput);
    const day = date.getDay(); // 0 = Sunday .. 6 = Saturday
    const diffToMonday = day === 0 ? -6 : 1 - day;

    const weekStart = new Date(date);
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(weekStart.getDate() + diffToMonday);

    const weekEnd = new Date(weekStart.getTime() + 6 * DAY_MS);
    weekEnd.setHours(23, 59, 59, 999);

    return { weekStart, weekEnd };
}

// Reports are due the Monday after the week they cover, end of day.
function getDeadline(weekEnd) {
    const deadline = new Date(weekEnd.getTime() + DAY_MS);
    deadline.setHours(23, 59, 59, 999);
    return deadline;
}

function deriveStatus({ hasSubmitted, weekEnd, now = new Date() }) {
    if (hasSubmitted) return "submitted";
    return now > getDeadline(new Date(weekEnd)) ? "late" : "pending";
}

module.exports = { getWeekBounds, getDeadline, deriveStatus };
