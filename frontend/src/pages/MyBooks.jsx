import { useEffect, useState } from "react";
import EmptyState from "../components/EmptyState";
import ErrorAlert from "../components/ErrorAlert";
import LoadingSpinner from "../components/LoadingSpinner";
import Pagination from "../components/Pagination";
import StatusBadge from "../components/StatusBadge";
import AppShell from "../layouts/AppShell";
import { getErrorMessage } from "../services/api";
import { getMyBooks } from "../services/issueService";
import { formatCurrency, formatDate, toImageUrl } from "../utils/formatters";

function MyBooks() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const fetchMyBooks = async (pageNumber = 1) => {
    setLoading(true);
    setError("");
    try {
      const response = await getMyBooks({ page: pageNumber, limit: 6 });
      setIssues(response.data || []);
      setPage(response.page || 1);
      setPages(response.pages || 1);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to load your issued books"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBooks();
  }, []);

  return (
    <AppShell
      title="My Books"
      subtitle="Track requested, approved, returned, and overdue books with due dates and live fines."
    >
      <ErrorAlert message={error} />

      {loading ? (
        <LoadingSpinner label="Loading your books..." />
      ) : issues.length === 0 ? (
        <EmptyState title="No books yet" description="Once you request a book, it will appear here." />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {issues.map((issue) => (
              <div key={issue._id} className="card-surface overflow-hidden">
                <div className="grid md:grid-cols-[180px_1fr]">
                  <img
                    src={toImageUrl(issue.book?.image)}
                    alt={issue.book?.title || "Book cover"}
                    className="h-full min-h-48 w-full object-cover"
                  />
                  <div className="space-y-4 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-semibold text-app-text">{issue.book?.title || "Deleted Book"}</h3>
                        <p className="text-sm text-app-copy">{issue.book?.author || "Unknown author"}</p>
                      </div>
                      <StatusBadge status={issue.status} />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="panel-muted p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-app-meta"><span aria-hidden="true">◷ </span>{issue.status === "requested" ? "Requested" : "Issue Date"}</p>
                        <p className="mt-2 font-semibold text-app-text">{formatDate(issue.status === "requested" ? issue.createdAt : issue.issueDate)}</p>
                      </div>
                      <div className="panel-muted p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-app-meta"><span aria-hidden="true">⌛ </span>Due Date</p>
                        <p className="mt-2 font-semibold text-app-text">{["approved", "returned"].includes(issue.status) ? formatDate(issue.dueDate) : "Set when approved"}</p>
                      </div>
                      <div className="panel-muted p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-app-meta"><span aria-hidden="true">↩ </span>Returned</p>
                        <p className="mt-2 font-semibold text-app-text">{formatDate(issue.returnDate)}</p>
                      </div>
                      <div className="rounded-2xl border border-primary-200 bg-primary-50 p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-primary-700"><span aria-hidden="true">₹ </span>Fine</p>
                        <p className="mt-2 font-semibold text-primary-800">{formatCurrency(issue.currentFine)}</p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-[#8B5E3C]/10 bg-white/70 p-4">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-app-meta">Request activity</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2 text-app-copy">
                          <span className="w-5 text-center text-[#8B5E3C]" aria-hidden="true">◷</span>
                          <span>Requested · {formatDate(issue.createdAt)}</span>
                        </div>
                        {issue.approvedBy && <div className="flex items-start gap-2 text-app-copy">
                          <span className="w-5 text-center text-[#8B5E3C]" aria-hidden="true">✓</span>
                          <span>Approved by <strong className="font-semibold text-app-text">{issue.approvedBy.name}</strong> <span className="capitalize">({issue.approvedBy.role})</span>{issue.approvedAt ? ` · ${formatDate(issue.approvedAt)}` : ""}</span>
                        </div>}
                        {issue.rejectedBy && <div className="flex items-start gap-2 text-app-copy">
                          <span className="w-5 text-center text-[#8B5E3C]" aria-hidden="true">×</span>
                          <span>Declined by <strong className="font-semibold text-app-text">{issue.rejectedBy.name}</strong> <span className="capitalize">({issue.rejectedBy.role})</span>{issue.rejectedAt ? ` · ${formatDate(issue.rejectedAt)}` : ""}</span>
                        </div>}
                        {issue.returnedBy && <div className="flex items-start gap-2 text-app-copy">
                          <span className="w-5 text-center text-[#8B5E3C]" aria-hidden="true">↩</span>
                          <span>Return handled by <strong className="font-semibold text-app-text">{issue.returnedBy.name}</strong> <span className="capitalize">({issue.returnedBy.role})</span>{issue.returnedAt ? ` · ${formatDate(issue.returnedAt)}` : ""}</span>
                        </div>}
                        {issue.status === "requested" && <p className="pl-7 text-xs text-app-copy">Waiting for library staff to review your request.</p>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Pagination page={page} pages={pages} onPageChange={fetchMyBooks} />
        </div>
      )}
    </AppShell>
  );
}

export default MyBooks;
