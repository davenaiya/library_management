import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import AppShell from "../layouts/AppShell";

function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <AppShell
      title="Profile"
      subtitle="Review your account details and manage your security settings from one place."
    >
      <div className="space-y-6">
        <div className="card-surface overflow-hidden">
          <div className="bg-gradient-to-br from-primary-600 via-primary-500 to-primary-700 p-8 text-white">
            <p className="text-sm uppercase tracking-[0.3em] text-white/80"><span aria-hidden="true">◎ </span>Account Overview</p>
            <h2 className="mt-4 text-3xl font-bold">{user?.name}</h2>
            <p className="mt-2 text-sm text-primary-100">{user?.email}</p>
          </div>
          <div className="grid gap-4 p-6 sm:grid-cols-3">
            <div className="panel-muted p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-app-meta"><span aria-hidden="true">♟ </span>Role</p>
              <p className="mt-2 text-lg font-semibold capitalize text-app-text">{user?.role || "-"}</p>
            </div>
            <div className="panel-muted p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-app-meta"><span aria-hidden="true">♙ </span>Name</p>
              <p className="mt-2 text-lg font-semibold text-app-text">{user?.name || "-"}</p>
            </div>
            <div className="panel-muted p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-app-meta"><span aria-hidden="true">✉ </span>Email</p>
              <p className="mt-2 break-all text-sm font-semibold text-app-text">{user?.email || "-"}</p>
            </div>
          </div>
          <div className="px-6 pb-6">
            <button type="button" className="btn-primary w-full sm:w-auto" onClick={() => navigate("/change-password")}>
            <span className="mr-2" aria-hidden="true">⌑</span>Change Password
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default Profile;
