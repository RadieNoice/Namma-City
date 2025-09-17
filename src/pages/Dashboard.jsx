import { useState, useEffect } from "react";
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
  const [departmentUsers, setDepartmentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

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
      setError("No department assigned to this profile. Please update your profile.");
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

    const { data: usersData, error: usersError } = await supabase
      .from("profiles")
      .select("id, username")
      .eq("department_id", profileData.department_id);

    if (usersError) {
      console.error("Failed to load department users:", usersError);
    } else {
      setDepartmentUsers(usersData || []);
    }

    let query = supabase
      .from("issues")
      .select(
        "id, title, description, issue_type, created_at, latitude, longitude, status, department_id, user_id, image_url, departments(id,department_name), profiles(id, username)"
      )
      .eq("department_id", profileData.department_id);

    if (filterStatus !== "all") {
      query = query.eq("status", filterStatus);
    }

    if (sortOrder === "newest") {
      query = query.order("created_at", { ascending: false });
    } else if (sortOrder === "oldest") {
      query = query.order("created_at", { ascending: true });
    } else if (sortOrder === "alphabetical") {
      query = query.order("title", { ascending: true });
    }

    const { data: issuesData, error: issuesError } = await query;

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

  useEffect(() => {
    fetchAll();
  }, [user, authLoading, filterStatus, sortOrder]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout error:", error.message);
      return;
    }
    navigate("/Login");
  };

  if (authLoading || loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="alert alert-danger text-center" role="alert">
                <i className="bi bi-exclamation-triangle-fill fs-1 text-danger mb-3"></i>
                <h4 className="alert-heading">Error</h4>
                <p>{error}</p>
                <hr />
                <button className="btn btn-outline-danger" onClick={() => navigate("/Login")}>
                  Back to Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      {/* Dashboard Header */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
        <div className="container-fluid">
          <button className="btn btn-outline-light d-lg-none me-2" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <i className="bi bi-list"></i>
          </button>

          <span className="navbar-brand fw-bold">
            <i className="bi bi-speedometer2 me-2"></i>
            <span className="d-none d-sm-inline">NammaCity Dashboard</span>
            <span className="d-sm-none">Dashboard</span>
          </span>

          <div className="navbar-nav ms-auto">
            <div className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle text-white d-flex align-items-center"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
              >
                <i className="bi bi-person-circle me-2"></i>
                <span className="d-none d-md-inline">{userProfile?.username ?? user?.email}</span>
              </a>
              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <span className="dropdown-item-text">
                    <small className="text-muted">Department:</small>
                    <br />
                    <strong>{department?.department_name}</strong>
                  </span>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <button className="dropdown-item text-danger" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="container-fluid py-4">
        <div className="row">
          {/* Sidebar */}
          <div className={`col-lg-3 col-xl-2 mb-4 ${sidebarOpen ? "d-block" : "d-none d-lg-block"}`}>
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h6 className="card-title text-muted text-uppercase fw-bold mb-3">Quick Stats</h6>
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                    <i className="bi bi-exclamation-triangle text-primary"></i>
                  </div>
                  <div>
                    <div className="fw-bold">{issues.length}</div>
                    <small className="text-muted">Total Issues</small>
                  </div>
                </div>
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-success bg-opacity-10 rounded-circle p-2 me-3">
                    <i className="bi bi-check-circle text-success"></i>
                  </div>
                  <div>
                    <div className="fw-bold">{issues.filter((issue) => issue.status === "resolved").length}</div>
                    <small className="text-muted">Resolved</small>
                  </div>
                </div>
                <div className="d-flex align-items-center">
                  <div className="bg-warning bg-opacity-10 rounded-circle p-2 me-3">
                    <i className="bi bi-clock text-warning"></i>
                  </div>
                  <div>
                    <div className="fw-bold">{issues.filter((issue) => issue.status !== "resolved").length}</div>
                    <small className="text-muted">Pending</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-lg-9 col-xl-10">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
              <div>
                <h2 className="fw-bold text-dark mb-1">Welcome back, {userProfile?.username ?? "User"}!</h2>
                <p className="text-muted mb-0">
                  Managing issues for <strong>{department?.department_name}</strong>
                </p>
              </div>
              <div className="d-flex gap-2 flex-wrap">
                {/* Filter Buttons */}
                <div className="btn-group" role="group">
                  <button
                    type="button"
                    className={`btn ${filterStatus === "all" ? "btn-primary" : "btn-outline-primary"}`}
                    onClick={() => setFilterStatus("all")}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    className={`btn ${filterStatus === "pending" ? "btn-primary" : "btn-outline-primary"}`}
                    onClick={() => setFilterStatus("pending")}
                  >
                    Pending
                  </button>
                  <button
                    type="button"
                    className={`btn ${filterStatus === "resolved" ? "btn-primary" : "btn-outline-primary"}`}
                    onClick={() => setFilterStatus("resolved")}
                  >
                    Resolved
                  </button>
                </div>
                
                {/* Sorting Dropdown */}
                <div className="btn-group">
                  <button
                    type="button"
                    className="btn btn-outline-secondary dropdown-toggle"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    Sort
                  </button>
                  <ul className="dropdown-menu">
                    <li>
                      <a className="dropdown-item" href="#" onClick={() => setSortOrder("newest")}>
                        Newest First
                      </a>
                    </li>
                    <li>
                      <a className="dropdown-item" href="#" onClick={() => setSortOrder("oldest")}>
                        Oldest First
                      </a>
                    </li>
                    <li>
                      <a className="dropdown-item" href="#" onClick={() => setSortOrder("alphabetical")}>
                        A-Z
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {issues.length === 0 ? (
              <div className="text-center py-5">
                <div
                  className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                  style={{ width: "80px", height: "80px" }}
                >
                  <i className="bi bi-inbox text-muted fs-1"></i>
                </div>
                <h4 className="text-muted mb-2">No Issues Found</h4>
                <p className="text-muted">
                  No issues have been reported for your department ({department?.department_name}) yet.
                </p>
              </div>
            ) : (
              <div className="row g-4">
                {issues.map((issue, index) => (
                  <div key={issue.id} className="col-12 col-xl-6">
                    <IssueCard 
                        issue={issue} 
                        index={index} 
                        onUpdate={fetchAll} 
                        departmentUsers={departmentUsers} 
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;