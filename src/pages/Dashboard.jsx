import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../helper/supabaseClient";
import IssueCard from "../components/IssueCard";
import { useAuth } from "../helper/AuthContext";

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

      // 1) fetch profile (grab department_id)
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

      // 2) ensure department_id exists
      if (!profileData.department_id) {
        setError("No department assigned to this profile. Please update your profile.");
        setLoading(false);
        return;
      }

      // 3) fetch department row to get department_name (city)
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

      // 4) fetch issues matching department_id (recommended)
      const { data: issuesData, error: issuesError } = await supabase
        .from("issues")
        .select("*")
        .eq("department_id", profileData.department_id)   // reliable UUID match
        .order("created_at", { ascending: false });

      if (issuesError) {
        setError(issuesError.message);
        setIssues([]);
      } else {
        setIssues(issuesData || []);
      }

      setLoading(false);
    };

    fetchAll();
  }, [user, authLoading]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/Login");
  };

  if (authLoading || loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="dashboard-container">
      <h2>
        Welcome, {userProfile?.username ?? user?.email} —
        <small style={{ marginLeft: 8 }}>{department?.department_name}</small>
      </h2>

      <button onClick={handleLogout} style={{ marginBottom: "20px" }}>
        Logout
      </button>

      {issues.length === 0 ? (
        <div>No issues for your department ({department.department_name}).</div>
      ) : (
        <div className="issues-grid">
          {issues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
