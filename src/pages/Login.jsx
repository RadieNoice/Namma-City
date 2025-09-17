import React, { useState } from "react";
import supabase from "../helper/supabaseClient";
import { useNavigate, Link } from "react-router-dom"; 
import '../styles/Login.css';

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
            setLoading(false);
            return;
        }
        if (data) {
            navigate("/Dashboard");
        }
        setLoading(false);
    };

    return (
        <div id="login-container">
            <h2 id="login-title">Login</h2>
            <br />
            {message && <span id="login-message">{message}</span>}
            <form id="login-form" onSubmit={handlelogin}>
                <input
                    id="email-input"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    id="password-input"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button id="login-button" type="submit" disabled={loading}>
                    {loading ? "Logging in ..." : "Login"}
                </button>
            </form>
            <span id="signup-text">Don't have an account??</span>
            <Link id="signup-link" to="/Signup">Signup</Link>
        </div>
    );
}

export default Login;
