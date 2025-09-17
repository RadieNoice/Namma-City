import React, { useState, useEffect } from "react";
import supabase from "../helper/supabaseClient";
import { useNavigate, Link } from "react-router-dom";

function Signup() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [city, setCity] = useState(""); // new state for city/department
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]); // fetch departments from DB

  const navigate = useNavigate();

  // Fetch available departments/cities from Supabase
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

      // Insert into profiles with selected city/department
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: userId,
          username: name,
          is_official: false, // regular user
          department_id: city, // selected department/city
          role: "city_head", // user role
        },
      ]);

      if (profileError) {
        setMessage(
          "Account created, but could not save profile data."
        );
        console.error("Profile insertion error:", profileError);
      } else {
        setMessage("User account created successfully!");
        navigate("/Login"); // redirect to login after signup
      }
    }

    setLoading(false);
  };

  return (
    <div>
      <h2>Signup</h2>
      <br />
      {message && <span>{message}</span>}
      <form onSubmit={handleregister}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
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

        {/* City / Department Dropdown */}
        <select
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

        <button type="submit" disabled={loading}>
          {loading ? "Signing up..." : "Submit"}
        </button>
      </form>

      <span>Already a user? </span>
      <Link to="/Login">Login</Link>
    </div>
  );
}

export default Signup;
