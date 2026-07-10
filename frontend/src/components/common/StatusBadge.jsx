const LABELS = {
    draft: "Draft",
    submitted: "Submitted",
    pending: "Pending",
    late: "Late",
};

export default function StatusBadge({ status }) {
    return <span className={`status-badge status-${status}`}>{LABELS[status] || status}</span>;
}
