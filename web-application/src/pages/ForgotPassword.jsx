import { useState } from "react";
import { Link } from "react-router-dom";
import supabase from "../helper/supabaseClient";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://localhost:5173/ResetPassword", // Change this URL to your app's live domain if you deploy
    });

    if (error) {
      setMessage("Error: " + error.message);
    } else {
      setMessage("Password reset email sent. Check your inbox!");
      setEmail("");
    }
    setLoading(false);
  };

  return (
    <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            <div className="card shadow-lg border-0">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <h2 className="fw-bold text-primary mb-2">Forgot Password</h2>
                  <p className="text-muted">Enter your email to receive a password reset link.</p>
                </div>

                {message && (
                  <div className={`alert ${message.includes("sent") ? "alert-success" : "alert-danger"}`} role="alert">
                    {message}
                  </div>
                )}

                <form onSubmit={handleResetPassword}>
                  <div className="mb-3">
                    <label htmlFor="email-input" className="form-label fw-medium">
                      Email Address
                    </label>
                    <input
                      id="email-input"
                      type="email"
                      className="form-control form-control-lg"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg w-100"
                    disabled={loading}
                  >
                    {loading ? "Sending..." : "Send Reset Link"}
                  </button>
                </form>

                <div className="text-center mt-3">
                  <Link to="/Login" className="text-primary text-decoration-none fw-medium">
                    Back to Sign In
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;