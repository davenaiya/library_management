import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="auth-shell">
      <div className="card-surface max-w-xl p-10 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-600">404</p>
        <h1 className="mt-4 text-4xl font-bold text-app-text">Page not found</h1>
        <p className="mt-3 text-sm text-app-copy">The page you’re looking for does not exist.</p>
        <Link to="/dashboard" className="btn-primary mt-6">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
