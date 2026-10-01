import { useState } from "react";
import { Link } from "react-router-dom";
import ErrorAlert from "../components/ErrorAlert";
import { forgotPassword } from "../services/authService";
import { getErrorMessage } from "../services/api";

function ForgotPassword() {
  const [mode, setMode] = useState("otp");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await forgotPassword({
        email,
        type: mode
      });
      setMessage(response.msg || "Reset instructions sent");
    } catch (err) {
      setError(getErrorMessage(err, "Unable to send reset instructions"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="card-surface w-full max-w-2xl p-8 sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-600">Password Recovery</p>
        <h1 className="mt-4 text-3xl font-bold text-app-text">Forgot your password?</h1>
        <p className="mt-2 text-sm text-app-copy">
          Choose whether to receive a 6-digit OTP or a reset link by email.
        </p>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            className={mode === "otp" ? "btn-primary flex-1" : "btn-secondary flex-1"}
            onClick={() => setMode("otp")}
          >
            Send OTP
          </button>
          <button
            type="button"
            className={mode === "link" ? "btn-primary flex-1" : "btn-secondary flex-1"}
            onClick={() => setMode("link")}
          >
            Send Link
          </button>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <ErrorAlert message={error} />
          {message ? (
            <div className="rounded-2xl border border-primary-200 bg-primary-50 px-4 py-3 text-sm text-primary-800">
              {message}
            </div>
          ) : null}

          <div>
            <label className="mb-2 block text-sm font-medium text-app-label">Email</label>
            <input
              type="email"
              className="input-field"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@example.com"
              required
            />
          </div>

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? "Sending..." : mode === "otp" ? "Send OTP" : "Send Reset Link"}
          </button>
        </form>

        <div className="mt-6 flex flex-wrap gap-4 text-sm text-app-copy">
          <Link to="/reset-password" className="font-semibold text-primary-600 hover:text-primary-700">
            Already have OTP or token?
          </Link>
          <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
