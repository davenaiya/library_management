import { Link } from "react-router-dom";

function PasswordUpdated() {
  return (
    <div className="auth-shell">
      <div className="card-surface max-w-2xl p-10 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-600">Security Updated</p>
        <h1 className="mt-4 text-4xl font-bold text-app-text">Password changed successfully</h1>
        <p className="mt-3 text-sm text-app-copy">
          Your account password has been updated. You can continue using the system with your new password.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/profile" className="btn-secondary">
            Back to Profile
          </Link>
          <Link to="/dashboard" className="btn-primary">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PasswordUpdated;
