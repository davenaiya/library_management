import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ErrorAlert from "../components/ErrorAlert";
import AppShell from "../layouts/AppShell";
import { getErrorMessage } from "../services/api";
import { changePassword } from "../services/authService";

function ChangePassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

    if (form.newPassword !== form.confirmPassword) {
      setError("New password and confirm password do not match");
      setLoading(false);
      return;
    }

    try {
      await changePassword({
        oldPassword: form.oldPassword,
        newPassword: form.newPassword
      });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "Unable to change password"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell
      title="Change Password"
      subtitle="Enter your current password, then choose and confirm your new password."
    >
      <div className="mx-auto max-w-2xl">
        <form className="card-surface space-y-5 p-6" onSubmit={handleSubmit}>
          <div>
            <h2 className="text-2xl font-semibold text-app-text">Update Password</h2>
            <p className="mt-1 text-sm text-app-copy">
              Use at least 6 characters for your new password.
            </p>
          </div>

          <ErrorAlert message={error} />

          <div>
            <label className="mb-2 block text-sm font-medium text-app-label">Old Password</label>
            <input
              type="password"
              name="oldPassword"
              className="input-field"
              value={form.oldPassword}
              onChange={handleChange}
              required
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
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-app-label">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              className="input-field"
              value={form.confirmPassword}
              onChange={handleChange}
              minLength="6"
              required
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="button" className="btn-secondary flex-1" onClick={() => navigate("/profile")}>
              Back to Profile
            </button>
            <button type="submit" className="btn-primary flex-1" disabled={loading}>
              {loading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}

export default ChangePassword;
