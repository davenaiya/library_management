import { useCallback, useEffect, useState } from "react";
import EmptyState from "../components/EmptyState";
import ErrorAlert from "../components/ErrorAlert";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../hooks/useAuth";
import AppShell from "../layouts/AppShell";
import { getErrorMessage } from "../services/api";
import { createUser, deleteUser, downloadLibraryReport, getUsers, updateUser } from "../services/adminService";
import { formatDate } from "../utils/formatters";

const blankForm = { name: "", email: "", password: "", role: "member" };
const tabs = [
  { id: "members", label: "Members", icon: "♙", description: "Member directory" },
  { id: "librarians", label: "Librarians", icon: "♟", description: "Staff accounts" },
  { id: "reports", label: "Reports", icon: "▤", description: "Library insights" }
];

function AdminPanel() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [activeTab, setActiveTab] = useState(isAdmin ? "members" : "members");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [editingId, setEditingId] = useState("");
  const [form, setForm] = useState(blankForm);
  const selectedRole = activeTab === "librarians" && isAdmin ? "librarian" : "member";
  const heading = isAdmin ? "Admin Workspace" : "Librarian Workspace";

  const loadUsers = useCallback(async (nextPage, query) => {
    setLoading(true);
    setError("");
    try {
      const result = await getUsers({ page: nextPage, limit: 20, search: query || undefined, role: selectedRole });
      setUsers(result.data || []);
      setTotal(result.total || 0);
      setPages(Math.max(result.pages || 1, 1));
      setPage(result.page || nextPage);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to load accounts"));
    } finally {
      setLoading(false);
    }
  }, [selectedRole]);

  useEffect(() => {
    setPage(1);
    setSearch("");
    setAppliedSearch("");
    setEditingId("");
    setForm({ ...blankForm, role: activeTab === "librarians" && isAdmin ? "librarian" : "member" });
  }, [activeTab, isAdmin]);

  useEffect(() => {
    if (activeTab !== "reports") loadUsers(1, "");
  }, [activeTab, loadUsers]);

  const submitSearch = (event) => {
    event.preventDefault();
    setAppliedSearch(search.trim());
    setPage(1);
    loadUsers(1, search.trim());
  };

  const resetSearch = () => {
    setSearch("");
    setAppliedSearch("");
    setPage(1);
    loadUsers(1, "");
  };

  const resetForm = () => {
    setEditingId("");
    setForm({ ...blankForm, role: selectedRole });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editingId) await updateUser(editingId, { name: form.name, email: form.email });
      else await createUser({ ...form, role: selectedRole });
      resetForm();
      await loadUsers(page, appliedSearch);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to save account"));
    } finally {
      setSaving(false);
    }
  };

  const editUser = (account) => {
    setEditingId(account._id);
    setForm({ name: account.name || "", email: account.email || "", password: "", role: account.role });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const removeUser = async (account) => {
    if (account._id === user?._id) return;
    if (!window.confirm(`Remove ${account.name}'s account? This is a soft delete.`)) return;
    try {
      await deleteUser(account._id);
      if (users.length === 1 && page > 1) await loadUsers(page - 1, appliedSearch);
      else await loadUsers(page, appliedSearch);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to remove account"));
    }
  };

  const generateReport = async () => {
    setError("");
    try {
      const blob = await downloadLibraryReport();
      const url = window.URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = "library-report.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to generate report"));
    }
  };

  return (
    <AppShell title={heading} subtitle={isAdmin ? "Manage your library team, member directory, and reports." : "Search and manage member accounts."}>
      <ErrorAlert message={error} />
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {(isAdmin ? tabs : tabs.filter((tab) => tab.id === "members")).map((tab) => (
          <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition ${activeTab === tab.id ? "border-[#8B5E3C] bg-[#5C3A21] text-white shadow-lg" : "border-[#8B5E3C]/15 bg-white/80 text-[#5C3A21] hover:bg-white"}`}>
            <span className={`flex h-11 w-11 items-center justify-center rounded-xl text-2xl ${activeTab === tab.id ? "bg-white/15" : "bg-[#F5EDE6]"}`} aria-hidden="true">{tab.icon}</span>
            <span><span className="block font-semibold">{tab.label}</span><span className={`mt-1 block text-xs ${activeTab === tab.id ? "text-white/75" : "text-[#8B5E3C]"}`}>{tab.description}</span></span>
          </button>
        ))}
      </div>

      {activeTab === "reports" && isAdmin ? (
        <section className="card-surface flex flex-col items-start gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex items-start gap-4"><span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#F5EDE6] text-3xl text-[#8B5E3C]" aria-hidden="true">▤</span><div><h2 className="text-xl font-semibold text-app-text">Library summary report</h2><p className="mt-2 max-w-xl text-sm leading-6 text-app-copy">Download a PDF with member and staff counts, inventory, circulation activity, and fines.</p></div></div>
          <button type="button" className="btn-primary shrink-0" onClick={generateReport}><span className="mr-2" aria-hidden="true">↓</span>Download PDF report</button>
        </section>
      ) : loading ? <LoadingSpinner label="Loading directory..." /> : (
        <div className="space-y-6">
          <section className="grid gap-4 sm:grid-cols-3">
            <div className="card-surface flex items-center gap-4 p-5"><span className="text-3xl" aria-hidden="true">{selectedRole === "member" ? "♙" : "♟"}</span><div><p className="text-sm text-app-copy">Total {selectedRole === "member" ? "members" : "librarians"}</p><p className="text-2xl font-bold text-app-text">{total}</p></div></div>
            <div className="card-surface flex items-center gap-4 p-5"><span className="text-3xl" aria-hidden="true">⌕</span><div><p className="text-sm text-app-copy">Directory view</p><p className="text-lg font-semibold text-app-text">{appliedSearch ? "Filtered results" : "All accounts"}</p></div></div>
            <div className="card-surface flex items-center gap-4 p-5"><span className="text-3xl" aria-hidden="true">▦</span><div><p className="text-sm text-app-copy">Current page</p><p className="text-lg font-semibold text-app-text">{page} of {pages}</p></div></div>
          </section>

          <div className="grid items-start gap-6 xl:grid-cols-[0.8fr_1.2fr]">
            <form className="card-surface space-y-4 p-5 sm:p-6" onSubmit={handleSubmit}>
              <div className="flex items-start justify-between gap-3"><div><h2 className="text-xl font-semibold text-app-text">{editingId ? "Update" : "Add"} {selectedRole === "member" ? "member" : "librarian"}</h2><p className="mt-1 text-sm text-app-copy">Create and maintain {selectedRole} accounts.</p></div>{editingId && <button type="button" className="btn-secondary px-3 py-2" onClick={resetForm}>Cancel</button>}</div>
              <label className="block text-sm font-medium text-app-label">Full name<input className="input-field mt-2" name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" required /></label>
              <label className="block text-sm font-medium text-app-label">Email address<input className="input-field mt-2" type="email" name="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" required /></label>
              {!editingId && <label className="block text-sm font-medium text-app-label">Temporary password<input className="input-field mt-2" type="password" name="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} minLength={6} autoComplete="new-password" required /><span className="mt-1 block text-xs font-normal text-app-copy">At least 6 characters.</span></label>}
              <button type="submit" className="btn-primary w-full" disabled={saving}><span className="mr-2" aria-hidden="true">{saving ? "◌" : editingId ? "✓" : "+"}</span>{saving ? "Saving..." : editingId ? "Save changes" : `Add ${selectedRole}`}</button>
            </form>

            <section className="card-surface min-w-0 p-5 sm:p-6">
              <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-xl font-semibold text-app-text">{selectedRole === "member" ? "Member directory" : "Librarian directory"}</h2><p className="mt-1 text-sm text-app-copy">{total} {selectedRole}{total === 1 ? " account" : " accounts"} · latest registrations first</p></div></div>
              <form className="mt-5 flex flex-col gap-3 sm:flex-row" onSubmit={submitSearch}>
                <label className="sr-only" htmlFor="account-search">Search accounts</label><input id="account-search" className="input-field min-w-0 flex-1" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="⌕  Search by name or email" />
                <button className="btn-primary sm:px-5" type="submit"><span className="mr-2" aria-hidden="true">⌕</span>Search</button><button className="btn-secondary sm:px-5" type="button" onClick={resetSearch}>Reset</button>
              </form>
              <div className="mt-5">
                {users.length ? <div className="table-shell overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-[#F5EDE6] text-app-meta"><tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Joined</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Actions</th></tr></thead><tbody>{users.map((account) => <tr key={account._id} className="table-row"><td className="whitespace-nowrap px-4 py-3 font-medium text-app-text">{account.name}{account._id === user?._id && <span className="ml-2 rounded-full bg-[#F5EDE6] px-2 py-1 text-xs text-[#8B5E3C]">You</span>}</td><td className="px-4 py-3 text-app-copy">{account.email}</td><td className="whitespace-nowrap px-4 py-3 text-app-copy">{formatDate(account.createdAt)}</td><td className="px-4 py-3"><span className="rounded-full bg-[#F5EDE6] px-2.5 py-1 text-xs font-semibold capitalize text-[#8B5E3C]">{account.role}</span></td><td className="px-4 py-3"><div className="flex gap-2"><button type="button" className="btn-secondary px-3 py-2" onClick={() => editUser(account)} aria-label={`Edit ${account.name}`}><span aria-hidden="true">✎</span><span className="ml-1">Edit</span></button><button type="button" className="btn-danger px-3 py-2" onClick={() => removeUser(account)} disabled={account._id === user?._id} aria-label={`Delete ${account.name}`}><span aria-hidden="true">⌫</span><span className="ml-1">Delete</span></button></div></td></tr>)}</tbody></table></div> : <EmptyState title={`No ${selectedRole}s found`} description="Try a different search or add a new account." />}
              </div>
              {pages > 1 && <div className="mt-5 flex items-center justify-between gap-3"><p className="text-sm text-app-copy">Page {page} of {pages}</p><div className="flex gap-2"><button type="button" className="btn-secondary px-3 py-2" disabled={page <= 1} onClick={() => loadUsers(page - 1, appliedSearch)} aria-label="Previous page">← Previous</button><button type="button" className="btn-secondary px-3 py-2" disabled={page >= pages} onClick={() => loadUsers(page + 1, appliedSearch)} aria-label="Next page">Next →</button></div></div>}
            </section>
          </div>
        </div>
      )}
    </AppShell>
  );
}

export default AdminPanel;
