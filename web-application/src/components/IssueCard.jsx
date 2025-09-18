import { useState } from "react";
import supabase from "../helper/supabaseClient";
import { useAuth } from "../helper/AuthContext";

function IssueCard({ issue, index = 0, onUpdate, departmentUsers, isAdmin }) {
  const { user } = useAuth();
  const [showResolveConfirm, setShowResolveConfirm] = useState(false);
  const [message, setMessage] = useState("");

  const getSeverityBadge = (severity) => {
    if (!severity) return { emoji: "⚪️", class: "bg-secondary" };
    const s = String(severity).toLowerCase();
    if (s.includes("low")) return { emoji: "🟢", class: "bg-success" };
    if (s.includes("medium")) return { emoji: "🟡", class: "bg-warning" };
    if (s.includes("high")) return { emoji: "🔴", class: "bg-danger" };
    return { emoji: "🏷️", class: "bg-info" };
  };

  const getStatusBadge = (status) => {
    if (!status) return "bg-secondary";
    const s = String(status).toLowerCase();
    if (s.includes("resolved") || s.includes("completed") || s.includes("done")) return "bg-success";
    if (s.includes("progress") || s.includes("working")) return "bg-warning";
    if (s.includes("pending") || s.includes("new")) return "bg-primary";
    return "bg-secondary";
  };

  const handleUpdateStatus = async (newStatus) => {
    setMessage("");

    // Check permissions: ONLY Admin OR assigned user can change status
    const isAssignedUser = user?.id === issue.user_id;
    
    console.log("Permission check:", { 
      isAdmin, 
      isAssignedUser, 
      userId: user?.id, 
      issueUserId: issue.user_id 
    });
    
    if (!isAdmin && !isAssignedUser) {
        setMessage("Only the department administrator or the assigned user can change the status of this task.");
        return;
    }

    try {
      const { error } = await supabase
        .from("issues")
        .update({ status: newStatus })
        .eq("id", issue.id);

      if (error) {
        setMessage("Failed to update status: " + error.message);
        console.error("Error updating status:", error);
      } else {
        setMessage("Status updated successfully!");
        onUpdate();
        setShowResolveConfirm(false);
      }
    } catch (err) {
      setMessage("An unexpected error occurred.");
      console.error("Unexpected error:", err);
    }
  };

  const handleAssignUser = async (userId) => {
    setMessage("");

    // Only admin can assign tasks
    if (!isAdmin) {
      setMessage("Only department administrators can assign tasks.");
      return;
    }

    try {
      const { error } = await supabase
        .from("issues")
        .update({ user_id: userId })
        .eq("id", issue.id);

      if (error) {
        setMessage("Failed to assign task: " + error.message);
        console.error("Error assigning user:", error);
      } else {
        setMessage("Task assigned successfully!");
        onUpdate();
      }
    } catch (err) {
      setMessage("An unexpected error occurred.");
      console.error("Unexpected error:", err);
    }
  };

  const deptName =
    (issue.departments &&
      (issue.departments.department_name ||
        (Array.isArray(issue.departments) ? issue.departments[0]?.department_name : null))) ||
    issue.issue_department ||
    issue.department_name ||
    null;

  const city = issue.issue_city || deptName || "N/A";
  const title = issue.title || issue.issue_name || "Unnamed Issue";
  const desc = issue.description || issue.issue_desc || "No description provided";
  const time = issue.created_at ? new Date(issue.created_at).toLocaleString() : "N/A";
  const severity = issue.issue_type || issue.issue_severity || null;
  const status = issue.status || "pending";
  const assignedUser = issue.profiles?.username || "Unassigned";

  const mediaUrl = issue.image_url || issue.media_url || null;
  let mediaType = issue.media_type || null;
  if (!mediaType && mediaUrl) {
    mediaType = mediaUrl.endsWith(".mp4") ? "video" : "image";
  }

  const severityBadge = getSeverityBadge(severity);

  // Permission checks - Be very explicit about permissions
  const isAssignedUser = user?.id === issue.user_id;
  const canChangeStatus = isAdmin || (isAssignedUser && issue.user_id !== null);
  const canAssignTasks = isAdmin; // Only admins can assign tasks

  return (
    <div className="card border-0 shadow-sm h-100">
      <div className="card-header bg-white border-bottom-0 pb-0">
        <div className="d-flex justify-content-between align-items-start">
          <div className="d-flex align-items-center">
            <span className="badge bg-light text-dark me-2">#{index + 1}</span>
            <h5 className="card-title mb-0 fw-bold text-truncate" style={{ maxWidth: "300px" }}>
              {title}
            </h5>
          </div>
          <div className="d-flex gap-2">
            <span className={`badge ${severityBadge.class} text-white`}>{severity ?? "N/A"}</span>
            <span className={`badge ${getStatusBadge(status)} text-white`}>{status}</span>
          </div>
        </div>
      </div>

      <div className="card-body">
        <p className="card-text text-muted mb-3 line-clamp-2">{desc}</p>

        <div className="row g-3 mb-3">
          <div className="col-sm-6">
            <div className="d-flex align-items-center">
              <i className="bi bi-clock text-muted me-2"></i>
              <div>
                <small className="text-muted d-block">Reported</small>
                <small className="fw-medium">{time}</small>
              </div>
            </div>
          </div>

          <div className="col-sm-6">
            <div className="d-flex align-items-center">
              <i className="bi bi-geo-alt text-muted me-2"></i>
              <div>
                <small className="text-muted d-block">Location</small>
                <small className="fw-medium">{city}</small>
              </div>
            </div>
          </div>

          <div className="col-sm-6">
            <div className="d-flex align-items-center">
              <i className="bi bi-building text-muted me-2"></i>
              <div>
                <small className="text-muted d-block">Department</small>
                <small className="fw-medium">{deptName ?? "N/A"}</small>
              </div>
            </div>
          </div>

          <div className="col-sm-6">
            <div className="d-flex align-items-center">
              <i className="bi bi-exclamation-triangle text-muted me-2"></i>
              <div>
                <small className="text-muted d-block">Priority</small>
                <small className="fw-medium d-flex align-items-center">
                  <span className="me-1">{severityBadge.emoji}</span>
                  {severity ?? "N/A"}
                </small>
              </div>
            </div>
          </div>
          <div className="col-12">
            <div className="d-flex align-items-center">
                <i className="bi bi-person-fill text-muted me-2"></i>
                <div>
                    <small className="text-muted d-block">Assigned To</small>
                    <small className="fw-medium">{assignedUser}</small>
                </div>
            </div>
          </div>
        </div>

        {/* Media Section */}
        {mediaUrl && (
          <div className="mb-3">
            <small className="text-muted d-block mb-2">Attached Media</small>
            {mediaType === "video" ? (
              <video controls className="w-100 rounded" style={{ maxHeight: "200px", objectFit: "cover" }}>
                <source src={mediaUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <img
                src={mediaUrl || "/placeholder.svg"}
                alt="Issue media"
                className="w-100 rounded"
                style={{ maxHeight: "200px", objectFit: "cover" }}
              />
            )}
          </div>
        )}
      </div>

      <div className="card-footer bg-white border-top-0">
        <div className="d-flex justify-content-between align-items-center">
          <small className="text-muted">Issue ID: {issue.id}</small>
          <div className="btn-group btn-group-sm">
            {/* Status Change Buttons - Available to Admin OR Assigned User */}
            {canChangeStatus && (
              <>
                {status === "pending" && (
                  <button 
                    className="btn btn-outline-warning" 
                    onClick={() => handleUpdateStatus("in_progress")}
                  >
                    <i className="bi bi-arrow-right-circle me-1"></i> Start Progress
                  </button>
                )}
                {status === "in_progress" && (
                  <button 
                    className="btn btn-outline-success" 
                    onClick={() => setShowResolveConfirm(true)}
                  >
                    <i className="bi bi-check-lg me-1"></i> Mark Done
                  </button>
                )}
                {status === "resolved" && (
                  <button 
                    className="btn btn-outline-primary" 
                    onClick={() => handleUpdateStatus("pending")}
                  >
                    <i className="bi bi-arrow-counterclockwise me-1"></i> Reopen
                  </button>
                )}
              </>
            )}

            {/* Confirmation Dialog */}
            {showResolveConfirm && (
                <div className="position-absolute top-50 start-50 translate-middle alert alert-info py-2 px-3 m-0" style={{ zIndex: 10 }}>
                    <small className="d-block mb-1">Mark as completed?</small>
                    <button 
                      className="btn btn-sm btn-success me-1" 
                      onClick={() => handleUpdateStatus("resolved")}
                    >
                      Yes
                    </button>
                    <button 
                      className="btn btn-sm btn-danger" 
                      onClick={() => setShowResolveConfirm(false)}
                    >
                      No
                    </button>
                </div>
            )}
            
            {/* Assignment Dropdown - ONLY for Admin */}
            {canAssignTasks && (
                <div className="btn-group">
                    <button 
                        type="button" 
                        className="btn btn-outline-secondary dropdown-toggle" 
                        data-bs-toggle="dropdown" 
                        aria-expanded="false"
                    >
                        <i className="bi bi-person-plus me-1"></i> Assign
                    </button>
                    <ul className="dropdown-menu">
                        {departmentUsers && departmentUsers.length > 0 ? (
                            departmentUsers.map((departmentUser) => (
                                <li key={departmentUser.id}>
                                    <a 
                                        className="dropdown-item" 
                                        href="#" 
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleAssignUser(departmentUser.id);
                                        }}
                                    >
                                        {departmentUser.username}
                                        {departmentUser.id === issue.user_id && <span className="badge bg-primary ms-2">Current</span>}
                                    </a>
                                </li>
                            ))
                        ) : (
                            <li><span className="dropdown-item-text">No users available</span></li>
                        )}
                    </ul>
                </div>
            )}

            {/* Show permission info if user can't change status */}
            {!canChangeStatus && (
              <small className="text-muted">
                {!issue.user_id ? "Task not assigned yet" : "Only admin or assigned user can modify"}
              </small>
            )}
          </div>
        </div>
        {message && (
          <div className={`alert ${message.includes("successfully") ? "alert-success" : "alert-warning"} mt-3 text-center`} role="alert">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default IssueCard;