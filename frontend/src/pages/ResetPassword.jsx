import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ErrorAlert from "../components/ErrorAlert";
import { resetPassword } from "../services/authService";
import { getErrorMessage } from "../services/api";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    otpOrToken: token || "",
    newPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isOtpMode = useMemo(() => /^\d{6}$/.test(String(form.otpOrToken || "")), [form.otpOrToken]);

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        otpOrToken: form.otpOrToken,
        newPassword: form.newPassword
      };

      if (isOtpMode) {
        payload.email = form.email;
      }

      await resetPassword(payload);
      navigate("/login", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "Unable to reset password"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="card-surface w-full max-w-2xl p-8 sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-600">Reset Password</p>
        <h1 className="mt-4 text-3xl font-bold text-app-text">Set a new password</h1>
        <p className="mt-2 text-sm text-app-copy">
          Use the 6-digit OTP from email or paste the reset token from the reset link.
        </p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <ErrorAlert message={error} />

          <div>
            <label className="mb-2 block text-sm font-medium text-app-label">OTP or Reset Token</label>
            <input
              type="text"
              name="otpOrToken"
              className="input-field"
              value={form.otpOrToken}
              onChange={handleChange}
              placeholder="Enter OTP or token"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-app-label">Email</label>
            <input
              type="email"
              name="email"
              className="input-field"
              value={form.email}
              onChange={handleChange}
              placeholder="Required for OTP reset"
              required={isOtpMode}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-app-label">New Password</label>
            <input
              type="password"
              name="newPassword"
              className="input-field"
              value={form.newPassword}
              onChange={handleChange}
              minLength="6"
              placeholder="Enter new password"
              required
            />
          </div>

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <div className="mt-6 flex flex-wrap gap-4 text-sm text-app-copy">
          <Link to="/forgot-password" className="font-semibold text-primary-600 hover:text-primary-700">
            Request new OTP or link
          </Link>
          <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
