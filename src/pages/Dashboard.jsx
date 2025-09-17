// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../helper/supabaseClient";
import IssueCard from "../components/IssueCard";
import { useAuth } from "../helper/AuthContext";
import '../styles/Dashboard.css';

function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [userProfile, setUserProfile] = useState(null);
  const [department, setDepartment] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      if (authLoading) return;
      if (!user) {
        setError("You must be logged in to view your issues.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, username, department_id")
        .eq("id", user.id)
        .single();

      if (profileError || !profileData) {
        setError("Failed to load user profile.");
        setLoading(false);
        return;
      }
      setUserProfile(profileData);

      if (!profileData.department_id) {
        setError(
          "No department assigned to this profile. Please update your profile."
        );
        setLoading(false);
        return;
      }

      const { data: deptData, error: deptError } = await supabase
        .from("departments")
        .select("id, department_name")
        .eq("id", profileData.department_id)
        .single();

      if (deptError || !deptData) {
        setError("Failed to load department data.");
        setLoading(false);
        return;
      }
      setDepartment(deptData);

      const { data: issuesData, error: issuesError } = await supabase
        .from("issues")
        .select(
          "id, title, description, issue_type, created_at, latitude, longitude, status, department_id, user_id, image_url, departments(id,department_name)"
        )
        .eq("department_id", profileData.department_id)
        .order("created_at", { ascending: false });

      if (issuesError) {
        setError(issuesError.message);
        setIssues([]);
      } else {
        const normalized = (issuesData || []).map((i) => {
          let deptName = null;
          if (i.departments) {
            if (Array.isArray(i.departments)) {
              deptName = i.departments[0]?.department_name ?? null;
            } else if (typeof i.departments === "object") {
              deptName = i.departments.department_name ?? null;
            }
          }
          deptName = deptName || i.issue_department || i.department_name || null;
          const city = i.issue_city || deptName || null;

          return {
            ...i,
            department_name: deptName,
            issue_city: city,
          };
        });

        setIssues(normalized);
      }

      setLoading(false);
    };

    fetchAll();
  }, [user, authLoading]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/Login");
  };

  if (authLoading || loading) return <div id="dashboard-loading">Loading...</div>;
  if (error) return <div id="dashboard-error" style={{ color: "red" }}>Error: {error}</div>;

  return (
    <div id="dashboard-container" className="dashboard-container">
      <h2 id="dashboard-welcome">
        Welcome, {userProfile?.username ?? user?.email} —
        <small id="dashboard-department" style={{ marginLeft: 8 }}>
          {department?.department_name}
        </small>
      </h2>

      <button id="logout-button" onClick={handleLogout} style={{ marginBottom: "20px" }}>
        Logout
      </button>

      {issues.length === 0 ? (
        <div id="no-issues-message">
          No issues for your department ({department.department_name}).
        </div>
      ) : (
        <div id="issues-grid" className="issues-grid">
          {issues.map((issue, index) => (
            <IssueCard key={issue.id} issue={issue} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
