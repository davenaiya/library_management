import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";
import ErrorAlert from "../components/ErrorAlert";
import { useAuth } from "../hooks/useAuth";
import { getErrorMessage } from "../services/api";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;
  const authPrompt = location.state?.authPrompt;
  const registered = location.state?.registered;
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: ""
  });
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value
    }));
    setFieldErrors((current) => ({
      ...current,
      [name]: ""
    }));
  };

  const validateForm = () => {
    const nextErrors = {};
    const email = form.email.trim().toLowerCase();

    if (!email) {
      nextErrors.email = "Email is required";
    } else if (!emailRegex.test(email)) {
      nextErrors.email = "Enter a valid email address";
    }

    if (!form.password) {
      nextErrors.password = "Password is required";
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (!validateForm()) {
      return;
    }

    try {
      const response = await login({
        email: form.email.trim().toLowerCase(),
        password: form.password
      });
      const nextPath = location.state?.from?.pathname || "/dashboard";
      if (response?.token) {
        navigate(nextPath, { replace: true });
      }
    } catch (err) {
      setError(getErrorMessage(err, "Unable to login"));
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card w-full max-w-xl">
        <div className="p-8 sm:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-600">Welcome Back</p>
          <h2 className="mt-4 text-3xl font-bold text-app-text">Login to your account</h2>
          <p className="mt-2 text-sm text-app-copy">
            Use your member, librarian, or admin credentials to continue.
          </p>
          {authPrompt ? (
            <div className="mt-4 rounded-2xl border border-primary-200 bg-primary-50 px-4 py-3 text-sm text-primary-800">
              {authPrompt}
            </div>
          ) : null}
          {registered ? (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              Registration completed. Login now to continue with book issuing.
            </div>
          ) : null}

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <ErrorAlert message={error} />

            <div>
              <label className="mb-2 block text-sm font-medium text-app-label">Email</label>
              <input
                type="email"
                name="email"
                className={`input-field ${fieldErrors.email ? "border-red-400 focus:border-red-500" : ""}`}
                value={form.email}
                onChange={handleChange}
                placeholder="name@example.com"
                required
              />
              {fieldErrors.email ? <p className="mt-2 text-sm text-red-600">{fieldErrors.email}</p> : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-app-label">Password</label>
              <input
                type="password"
                name="password"
                className={`input-field ${fieldErrors.password ? "border-red-400 focus:border-red-500" : ""}`}
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
              {fieldErrors.password ? <p className="mt-2 text-sm text-red-600">{fieldErrors.password}</p> : null}
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm font-semibold text-primary-600 hover:text-primary-700">
                Forgot password?
              </Link>
            </div>

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              <span className="mr-2" aria-hidden="true">{loading ? "◌" : "⇥"}</span>{loading ? "Signing in..." : "Login"}
            </button>
          </form>

          <p className="mt-6 text-sm text-app-copy">
            New member?{" "}
            <Link
              to="/register"
              state={{ from, authPrompt }}
              className="font-semibold text-primary-600 hover:text-primary-700"
            >
              <span aria-hidden="true">＋ </span>Create an account
            </Link>
          </p>

          <div className="mt-6">
            <BackButton />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
