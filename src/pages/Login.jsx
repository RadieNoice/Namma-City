import React from "react";
import { useState } from "react";
import supabase from "../helper/supabaseClient";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom"; 
function Login() {
    const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handlelogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (error) {
        setMessage(error.message);
        setEmail("");
        setPassword("");
      return;
    }
    if (data) {
      navigate("/Dashboard")
    }
    setLoading(false);
  };
  return (
    <div>
      <h2>Login</h2>
      <br />
      {message && <span>{message}</span>}
      <form onSubmit={handlelogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Logging in  ..." : "Login"}
        </button>
          </form>
          <span>Dont have an account ??</span>
          <Link to="/Signup">Signup</Link>
    </div>
  );
}

export default Login;
