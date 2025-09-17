import React, { useState, useEffect } from "react";
import supabase from "../helper/supabaseClient";
import { useNavigate, Link } from "react-router-dom";
import '../styles/Signup.css'

function Signup() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [city, setCity] = useState(""); 
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDepartments = async () => {
      const { data, error } = await supabase.from("departments").select("*");
      if (data) setDepartments(data);
      if (error) console.error(error);
    };
    fetchDepartments();
  }, []);

  const handleregister = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      const userId = data.user.id;

      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: userId,
          username: name,
          is_official: false,
          department_id: city,
          role: "city_head",
        },
      ]);

      if (profileError) {
        setMessage("Account created, but could not save profile data.");
        console.error("Profile insertion error:", profileError);
      } else {
        setMessage("User account created successfully!");
        navigate("/Login");
      }
    }

    setLoading(false);
  };

  return (
    <div id="signup-container">
      <h2 id="signup-title">Signup</h2>
      <br />
      {message && <span id="signup-message">{message}</span>}
      <form id="signup-form" onSubmit={handleregister}>
        <input
          id="name-input"
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
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
        <select
          id="city-select"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          required
        >
          <option value="">Select your city</option>
          {departments.map((dep) => (
            <option key={dep.id} value={dep.id}>
              {dep.department_name}
            </option>
          ))}
        </select>

        <button id="signup-button" type="submit" disabled={loading}>
          {loading ? "Signing up..." : "Submit"}
        </button>
      </form>

      <span id="login-text">Already a user? </span>
      <Link id="login-link" to="/Login">Login</Link>
    </div>
  );
}

export default Signup;
