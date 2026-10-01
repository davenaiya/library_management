import { useEffect, useMemo, useState } from "react";
import EmptyState from "../components/EmptyState";
import ErrorAlert from "../components/ErrorAlert";
import LoadingSpinner from "../components/LoadingSpinner";
import StatusBadge from "../components/StatusBadge";
import AppShell from "../layouts/AppShell";
import { getErrorMessage } from "../services/api";
import { getAllIssues } from "../services/adminService";
import { approveIssue, rejectIssue, returnIssue } from "../services/issueService";
import { formatCurrency, formatDate } from "../utils/formatters";

function Requests() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchIssues = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getAllIssues();
      setIssues(response || []);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to fetch requests"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const filteredIssues = useMemo(() => {
    if (statusFilter === "all") {
      return issues;
    }
    return issues.filter((issue) => issue.status === statusFilter);
  }, [issues, statusFilter]);

  const handleAction = async (type, id) => {
    try {
      if (type === "approve") {
        await approveIssue(id);
      } else if (type === "reject") {
        await rejectIssue(id);
      } else {
        await returnIssue(id);
      }
      await fetchIssues();
    } catch (err) {
      setError(getErrorMessage(err, `Unable to ${type} request`));
    }
  };

  const handleResetFilter = () => {
    setStatusFilter("all");
  };

  const statusSymbols = { all: "▦", requested: "◷", approved: "✓", returned: "↩", rejected: "×" };

  return (
    <AppShell
      title="Issue Requests"
      subtitle="Review request queues, approve or reject submissions, and mark issued books as returned."
    >
      <div className="mb-6 flex flex-wrap gap-3">
        {["all", "requested", "approved", "returned", "rejected"].map((status) => (
          <button
            key={status}
            type="button"
            className={statusFilter === status ? "btn-primary" : "btn-secondary"}
            onClick={() => setStatusFilter(status)}
          >
            <span className="mr-2" aria-hidden="true">{statusSymbols[status]}</span>{status}
          </button>
        ))}
        <button type="button" className="btn-secondary" onClick={handleResetFilter}>
          <span className="mr-2" aria-hidden="true">↺</span>Reset
        </button>
      </div>

      <ErrorAlert message={error} />

      {loading ? (
        <LoadingSpinner label="Loading requests..." />
      ) : filteredIssues.length === 0 ? (
        <EmptyState title="No requests" description="There are no requests matching the selected status." />
      ) : (
        <div className="space-y-4">
          {filteredIssues.map((issue) => (
            <div
              key={issue._id}
              className="card-surface flex flex-col gap-4 p-5 xl:flex-row xl:items-center xl:justify-between"
            >
              <div className="grid flex-1 gap-4 md:grid-cols-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-app-meta"><span aria-hidden="true">♙ </span>Member</p>
                  <p className="mt-2 font-semibold text-app-text">{issue.user?.name || "-"}</p>
                  <p className="text-sm text-app-copy">{issue.user?.email || "-"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-app-meta"><span aria-hidden="true">▤ </span>Book</p>
                  <p className="mt-2 font-semibold text-app-text">{issue.book?.title || "-"}</p>
                  <p className="text-sm text-app-copy">{issue.book?.author || "-"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-app-meta"><span aria-hidden="true">◷ </span>Dates</p>
                  <p className="mt-2 text-sm text-app-copy">Issue: {formatDate(issue.issueDate)}</p>
                  <p className="text-sm text-app-copy">Due: {formatDate(issue.dueDate)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-app-meta"><span aria-hidden="true">◉ </span>Status</p>
                  <div className="mt-2 flex items-center gap-3">
                    <StatusBadge status={issue.status} />
                    <span className="text-sm font-semibold text-primary-800">
                      {formatCurrency(issue.currentFine)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {issue.status === "requested" ? (
                  <>
                    <button type="button" className="btn-success" onClick={() => handleAction("approve", issue._id)}>
                      <span className="mr-2" aria-hidden="true">✓</span>Approve
                    </button>
                    <button type="button" className="btn-danger" onClick={() => handleAction("reject", issue._id)}>
                      <span className="mr-2" aria-hidden="true">×</span>Reject
                    </button>
                  </>
                ) : null}
                {issue.status === "approved" ? (
                  <button type="button" className="btn-secondary" onClick={() => handleAction("return", issue._id)}>
                    <span className="mr-2" aria-hidden="true">↩</span>Mark Return
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}

export default Requests;
