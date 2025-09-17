import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import supabase from "../helper/supabaseClient";

function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("Loading...");
  const [loading, setLoading] = useState(false);
  const [canReset, setCanReset] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setCanReset(true);
        setMessage("");
      } else {
        setMessage("Invalid or expired password reset link. Please try again.");
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      setLoading(false);
      return;
    }
    
    // Optional: Add a password strength check
    if (newPassword.length < 6) {
      setMessage("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setMessage("Error updating password: " + error.message);
    } else {
      setMessage("Password updated successfully! Redirecting...");
      setTimeout(() => {
        navigate("/Dashboard");
      }, 2000);
    }
    setLoading(false);
  };

  if (!canReset) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="text-center p-5">
          <h4 className="text-danger">{message}</h4>
          <Link to="/ForgotPassword" className="btn btn-primary mt-3">
            Back to Forgot Password
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            <div className="card shadow-lg border-0">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <h2 className="fw-bold text-primary mb-2">Reset Password</h2>
                  <p className="text-muted">Enter your new password below.</p>
                </div>

                {message && (
                  <div className={`alert ${message.includes("successfully") ? "alert-success" : "alert-danger"}`} role="alert">
                    {message}
                  </div>
                )}

                <form onSubmit={handleUpdatePassword}>
                  <div className="mb-3">
                    <label htmlFor="new-password" className="form-label fw-medium">
                      New Password
                    </label>
                    <input
                      id="new-password"
                      type="password"
                      className="form-control form-control-lg"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="confirm-password" className="form-label fw-medium">
                      Confirm New Password
                    </label>
                    <input
                      id="confirm-password"
                      type="password"
                      className="form-control form-control-lg"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg w-100"
                    disabled={loading}
                  >
                    {loading ? "Updating..." : "Update Password"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;