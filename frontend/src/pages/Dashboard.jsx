import { useEffect, useState } from "react";
import EmptyState from "../components/EmptyState";
import ErrorAlert from "../components/ErrorAlert";
import LoadingSpinner from "../components/LoadingSpinner";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../hooks/useAuth";
import AppShell from "../layouts/AppShell";
import { getErrorMessage } from "../services/api";
import { getAllIssues, getDashboard, getInventorySummary } from "../services/adminService";
import { getLowStockBooks } from "../services/bookService";
import { getFineList, getMyBooks, getOverdueIssues } from "../services/issueService";
import { formatCurrency, formatDate } from "../utils/formatters";

function SectionHeading({ title, description, icon }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-xl font-semibold text-[#5C3A21]">{title}</h2>
        {description ? <p className="mt-1 text-sm text-[#5C3A21]/65">{description}</p> : null}
      </div>
      <div className="rounded-lg bg-[#F5EDE6] p-2 text-[#8B5E3C]">{icon}</div>
    </div>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError("");
      try {
        if (user?.role === "member") {
          const response = await getMyBooks({ page: 1, limit: 50 });
          const items = response.data || [];
          setData({
            stats: {
              total: items.length,
              requested: items.filter((item) => item.status === "requested").length,
              approved: items.filter((item) => item.status === "approved").length,
              fines: items.reduce((sum, item) => sum + Number(item.currentFine || 0), 0)
            },
            items
          });
          return;
        }

        if (user?.role === "librarian") {
          const [inventory, issues, overdue, fines, lowStock] = await Promise.all([
            getInventorySummary(),
            getAllIssues(),
            getOverdueIssues(),
            getFineList(),
            getLowStockBooks()
          ]);

          setData({
            stats: {
              totalBooks: inventory.totalBooks || 0,
              available: inventory.totalAvailable || 0,
              issued: inventory.totalIssued || 0,
              pendingRequests: (issues || []).filter((item) => item.status === "requested").length
            },
            issues,
            overdue: overdue.data || [],
            fines: fines.data || [],
            lowStock: lowStock.data || [],
            memberActivity: (issues || []).slice(0, 8)
          });
          return;
        }

        const [dashboard, inventory, issues] = await Promise.all([getDashboard(), getInventorySummary(), getAllIssues()]);

        setData({
          dashboard,
          inventory,
          issues: issues || []
        });
      } catch (err) {
        setError(getErrorMessage(err, "Unable to load dashboard"));
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [user?.role]);

  if (loading) {
    return (
      <AppShell title="Dashboard" subtitle="Preparing your workspace overview.">
        <LoadingSpinner label="Loading dashboard..." />
      </AppShell>
    );
  }

  const sectionCard = "card-surface p-7";
  const mutedCard =
    "rounded-2xl bg-[#F5EDE6]/55 p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md";
  const reportMetricCard = mutedCard;
  const tableHeader = "bg-[#F5EDE6] text-[#5C3A21]";
  const sectionIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 19h16M7 16V8m5 8V5m5 11v-3" />
    </svg>
  );
  const listIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />
    </svg>
  );

  return (
    <AppShell
      title="Dashboard"
      subtitle="A quick view of circulation, inventory, members, librarians, and fines based on your role."
    >
      <ErrorAlert message={error} />

      {!data ? <EmptyState title="No dashboard data" description="Try refreshing again." /> : null}

      {user?.role === "member" && data ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Requested" value={data.stats.requested} tone="light" />
            <StatCard label="Approved" value={data.stats.approved} tone="brand" />
            <StatCard label="Total Books" value={data.stats.total} tone="dark" />
            <StatCard label="Current Fine" value={formatCurrency(data.stats.fines)} tone="amber" />
          </div>

          <div className={sectionCard}>
            <SectionHeading title="My Activity" description="Your latest borrowing history, request status, due dates, and fines." icon={listIcon} />
            <div className="table-shell mt-5 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className={tableHeader}>
                  <tr>
                    <th className="px-4 py-3"><span aria-hidden="true">▤ </span>Book</th>
                    <th className="px-4 py-3"><span aria-hidden="true">◉ </span>Status</th>
                    <th className="px-4 py-3"><span aria-hidden="true">⌛ </span>Due Date</th>
                    <th className="px-4 py-3"><span aria-hidden="true">₹ </span>Fine</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.slice(0, 8).map((item) => (
                    <tr key={item._id} className="table-row">
                      <td className="px-4 py-3 font-medium text-app-text">{item.book?.title || "Unknown book"}</td>
                      <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                      <td className="px-4 py-3 text-app-copy">{["approved", "returned"].includes(item.status) ? formatDate(item.dueDate) : "—"}</td>
                      <td className="px-4 py-3 text-lg font-bold text-[#8B5E3C]">{formatCurrency(item.currentFine)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}

      {user?.role === "librarian" && data ? (
          <div className="space-y-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Books" value={data.stats.totalBooks} tone="dark" />
            <StatCard label="Available" value={data.stats.available} tone="light" />
            <StatCard label="Issued" value={data.stats.issued} tone="brand" />
            <StatCard label="Pending Requests" value={data.stats.pendingRequests} tone="amber" />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className={sectionCard}>
              <SectionHeading title="Low Stock" description="Books that may need replenishment soon." icon={sectionIcon} />
              <div className="mt-4 space-y-3">
                {data.lowStock.length ? (
                  data.lowStock.map((book) => (
                    <div key={book._id} className={mutedCard}>
                      <p className="font-semibold text-app-text">{book.title}</p>
                      <p className="text-sm text-app-copy">{book.author}</p>
                      <p className="mt-2 text-base font-bold text-[#8B5E3C]">Available: {book.available}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-app-copy">No low-stock books right now.</p>
                )}
              </div>
            </div>

            <div className={sectionCard}>
              <SectionHeading title="Overdue" description="Items currently past their due date." icon={sectionIcon} />
              <div className="mt-4 space-y-3">
                {data.overdue.length ? (
                  data.overdue.slice(0, 6).map((item) => (
                    <div key={item._id} className={mutedCard}>
                      <p className="font-semibold text-app-text">{item.book?.title}</p>
                      <p className="text-sm text-app-copy">{item.user?.name}</p>
                      <p className="mt-2 text-base font-bold text-[#8B5E3C]">Due: {formatDate(item.dueDate)}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-app-copy">No overdue issues.</p>
                )}
              </div>
            </div>

            <div className={sectionCard}>
              <SectionHeading title="Fine Monitor" description="Outstanding fines that need attention." icon={sectionIcon} />
              <div className="mt-4 space-y-3">
                {data.fines.length ? (
                  data.fines.slice(0, 6).map((item) => (
                    <div key={item._id} className={mutedCard}>
                      <p className="font-semibold text-app-text">{item.user?.name}</p>
                      <p className="text-sm text-app-copy">{item.book?.title}</p>
                      <p className="mt-2 text-base font-bold text-[#8B5E3C]">
                        {formatCurrency(item.currentFine)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-app-copy">No fines recorded.</p>
                )}
              </div>
            </div>
          </div>

          <div className={sectionCard}>
            <SectionHeading title="Activity" description="Recent member requests, approvals, returns, and queue updates." icon={listIcon} />
            <div className="table-shell mt-5 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className={tableHeader}>
                  <tr>
                    <th className="px-4 py-3">Member</th>
                    <th className="px-4 py-3">Book</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Approved By</th>
                    <th className="px-4 py-3">Returned By</th>
                    <th className="px-4 py-3">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {data.memberActivity.slice(0, 8).map((issue) => (
                    <tr key={issue._id} className="table-row">
                      <td className="px-4 py-3 font-medium text-app-text">{issue.user?.name || "-"}</td>
                      <td className="px-4 py-3 text-app-copy">{issue.book?.title || "-"}</td>
                      <td className="px-4 py-3 capitalize text-app-copy">{issue.status}</td>
                      <td className="px-4 py-3 text-app-copy">{issue.approvedBy?.name || "-"}</td>
                      <td className="px-4 py-3 text-app-copy">{issue.returnedBy?.name || "-"}</td>
                      <td className="px-4 py-3 text-app-copy">
                        {formatDate(issue.returnedAt || issue.approvedAt || issue.rejectedAt || issue.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}

      {user?.role === "admin" && data ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Users" value={data.dashboard.users.totalUsers} tone="dark" />
            <StatCard label="Members" value={data.dashboard.users.totalMembers} tone="light" />
            <StatCard label="Librarians" value={data.dashboard.users.totalLibrarians} tone="brand" />
            <StatCard label="Fines" value={formatCurrency(data.dashboard.fines)} tone="amber" />
          </div>

          <div className={sectionCard}>
            <SectionHeading
              title="Full Report"
              description="Complete overview of users, inventory, circulation, and fines for the admin dashboard."
              icon={sectionIcon}
            />
            <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
              <div className={reportMetricCard}>
                <p className="text-sm text-app-copy">Total Users</p>
                <p className="mt-3 text-4xl font-extrabold text-[#6B4527]">{data.dashboard.users.totalUsers}</p>
              </div>
              <div className={reportMetricCard}>
                <p className="text-sm text-app-copy">Members</p>
                <p className="mt-3 text-4xl font-extrabold text-[#6B4527]">{data.dashboard.users.totalMembers}</p>
              </div>
              <div className={reportMetricCard}>
                <p className="text-sm text-app-copy">Librarians</p>
                <p className="mt-3 text-4xl font-extrabold text-[#6B4527]">{data.dashboard.users.totalLibrarians}</p>
              </div>
              <div className={reportMetricCard}>
                <p className="text-sm text-app-copy">Books</p>
                <p className="mt-3 text-4xl font-extrabold text-[#6B4527]">{data.inventory.totalBooks}</p>
              </div>
              <div className={reportMetricCard}>
                <p className="text-sm text-app-copy">Available Books</p>
                <p className="mt-3 text-4xl font-extrabold text-[#6B4527]">{data.inventory.totalAvailable}</p>
              </div>
            </div>
          </div>

          <div className={sectionCard}>
            <SectionHeading title="Inventory Snapshot" description="Current availability across the library catalog." icon={sectionIcon} />
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className={mutedCard}>
                <p className="text-sm text-app-copy">Books</p>
                <p className="mt-3 text-4xl font-extrabold text-[#6B4527]">{data.inventory.totalBooks}</p>
              </div>
              <div className={mutedCard}>
                <p className="text-sm text-app-copy">Available</p>
                <p className="mt-3 text-4xl font-extrabold text-[#6B4527]">{data.inventory.totalAvailable}</p>
              </div>
            </div>
          </div>

          <div className={sectionCard}>
            <SectionHeading
              title="Activity"
              description="Recent member requests, approvals, returns, and circulation updates across the system."
              icon={listIcon}
            />
            <div className="mt-5 grid gap-4 sm:grid-cols-4">
              <div className={mutedCard}>
                <p className="text-sm text-app-copy">Requested</p>
                <p className="mt-3 text-4xl font-extrabold text-[#6B4527]">
                  {data.issues.filter((issue) => issue.status === "requested").length}
                </p>
              </div>
              <div className={mutedCard}>
                <p className="text-sm text-app-copy">Approved</p>
                <p className="mt-3 text-4xl font-extrabold text-[#6B4527]">
                  {data.issues.filter((issue) => issue.status === "approved").length}
                </p>
              </div>
              <div className={mutedCard}>
                <p className="text-sm text-app-copy">Returned</p>
                <p className="mt-3 text-4xl font-extrabold text-[#6B4527]">
                  {data.issues.filter((issue) => issue.status === "returned").length}
                </p>
              </div>
              <div className={mutedCard}>
                <p className="text-sm text-app-copy">Rejected</p>
                <p className="mt-3 text-4xl font-extrabold text-[#6B4527]">
                  {data.issues.filter((issue) => issue.status === "rejected").length}
                </p>
              </div>
            </div>

            <div className="table-shell mt-5 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className={tableHeader}>
                  <tr>
                    <th className="px-4 py-3">Book</th>
                    <th className="px-4 py-3">Member</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Approved By</th>
                    <th className="px-4 py-3">Rejected By</th>
                    <th className="px-4 py-3">Returned By</th>
                    <th className="px-4 py-3">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {data.issues.slice(0, 12).map((issue) => (
                    <tr key={issue._id} className="table-row">
                      <td className="px-4 py-3">
                        <p className="font-medium text-app-text">{issue.book?.title || "-"}</p>
                        <p className="text-xs text-app-copy">{issue.book?.author || "-"}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-app-text">{issue.user?.name || "-"}</p>
                        <p className="text-xs text-app-copy">{issue.user?.email || "-"}</p>
                      </td>
                      <td className="px-4 py-3 capitalize text-app-copy">{issue.status}</td>
                      <td className="px-4 py-3 text-app-copy">{issue.approvedBy?.name || "-"}</td>
                      <td className="px-4 py-3 text-app-copy">{issue.rejectedBy?.name || "-"}</td>
                      <td className="px-4 py-3 text-app-copy">{issue.returnedBy?.name || "-"}</td>
                      <td className="px-4 py-3 text-app-copy">
                        {formatDate(issue.returnedAt || issue.approvedAt || issue.rejectedAt || issue.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}

export default Dashboard;
