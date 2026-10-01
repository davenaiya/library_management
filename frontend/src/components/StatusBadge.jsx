const statusClasses = {
  requested: "bg-primary-100 text-primary-800",
  approved: "bg-primary-200 text-primary-800",
  returned: "bg-primary-50 text-primary-700",
  rejected: "bg-primary-100 text-primary-700"
};

const statusSymbols = {
  requested: "◷",
  approved: "✓",
  returned: "↩",
  rejected: "×"
};

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${
        statusClasses[status] || "bg-primary-50 text-primary-700"
      }`}
    >
      <span className="mr-1.5" aria-hidden="true">{statusSymbols[status] || "•"}</span>
      {status}
    </span>
  );
}

export default StatusBadge;
