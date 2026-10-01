import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";
import ErrorAlert from "../components/ErrorAlert";
import { useAuth } from "../hooks/useAuth";
import { getErrorMessage } from "../services/api";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,64}$/;

function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;
  const authPrompt = location.state?.authPrompt;
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
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
    const normalizedName = form.name.trim().replace(/\s+/g, " ");
    const normalizedEmail = form.email.trim().toLowerCase();

    if (!normalizedName) {
      nextErrors.name = "Full name is required";
    } else if (normalizedName.length < 2 || normalizedName.length > 60) {
      nextErrors.name = "Full name must be between 2 and 60 characters";
    }

    if (!normalizedEmail) {
      nextErrors.email = "Email is required";
    } else if (!emailRegex.test(normalizedEmail)) {
      nextErrors.email = "Enter a valid email address";
    }

    if (!form.password) {
      nextErrors.password = "Password is required";
    } else if (!passwordRegex.test(form.password)) {
      nextErrors.password = "Use 8-64 chars with uppercase, lowercase, number, and special character";
    }

    if (!form.confirmPassword) {
      nextErrors.confirmPassword = "Please confirm your password";
    } else if (form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match";
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
      await register({
        name: form.name.trim().replace(/\s+/g, " "),
        email: form.email.trim().toLowerCase(),
        password: form.password
      });
      navigate("/login", {
        replace: true,
        state: {
          from,
          authPrompt,
          registered: true
        }
      });
    } catch (err) {
      setError(getErrorMessage(err, "Unable to register"));
    }
  };

  return (
    <div className="auth-shell">
      <div className="card-surface w-full max-w-2xl p-8 sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-600">Member Signup</p>
        <h1 className="mt-4 text-3xl font-bold text-app-text">Create your library account</h1>
        <p className="mt-2 text-sm text-app-copy">
          Registration is enabled for members. Librarians and admins can add users from the admin tools.
        </p>
        {authPrompt ? (
          <div className="mt-4 rounded-2xl border border-primary-200 bg-primary-50 px-4 py-3 text-sm text-primary-800">
            {authPrompt}
          </div>
        ) : null}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <ErrorAlert message={error} />

          <div>
            <label className="mb-2 block text-sm font-medium text-app-label">Full Name</label>
            <input
              type="text"
              name="name"
              className={`input-field ${fieldErrors.name ? "border-red-400 focus:border-red-500" : ""}`}
              value={form.name}
              onChange={handleChange}
              required
            />
            {fieldErrors.name ? <p className="mt-2 text-sm text-red-600">{fieldErrors.name}</p> : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-app-label">Email</label>
            <input
              type="email"
              name="email"
              className={`input-field ${fieldErrors.email ? "border-red-400 focus:border-red-500" : ""}`}
              value={form.email}
              onChange={handleChange}
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
              required
            />
            {fieldErrors.password ? (
              <p className="mt-2 text-sm text-red-600">{fieldErrors.password}</p>
            ) : (
              <p className="mt-2 text-xs text-app-copy">
                Use 8-64 characters with uppercase, lowercase, number, and special character.
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-app-label">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              className={`input-field ${fieldErrors.confirmPassword ? "border-red-400 focus:border-red-500" : ""}`}
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
            {fieldErrors.confirmPassword ? <p className="mt-2 text-sm text-red-600">{fieldErrors.confirmPassword}</p> : null}
          </div>

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="mt-6 text-sm text-app-copy">
          Already have an account?{" "}
          <Link
            to="/login"
            state={{ from, authPrompt }}
            className="font-semibold text-primary-600 hover:text-primary-700"
          >
            Login here
          </Link>
        </p>

        <div className="mt-6">
          <BackButton />
        </div>
      </div>
    </div>
  );
}

export default Register;
