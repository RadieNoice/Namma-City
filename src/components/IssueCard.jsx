// src/components/IssueCard.jsx
import React from "react";
import '../styles/IssueCard.css'
function IssueCard({ issue, index = 0 }) {
  const getSeverityEmoji = (severity) => {
    if (!severity) return "⚪️";
    const s = String(severity).toLowerCase();
    if (s.includes("low")) return "🟢";
    if (s.includes("medium")) return "🟡";
    if (s.includes("high")) return "🔴";
    return "🏷️";
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

  const mediaUrl = issue.image_url || issue.media_url || null;
  let mediaType = issue.media_type || null;
  if (!mediaType && mediaUrl) {
    mediaType = mediaUrl.endsWith(".mp4") ? "video" : "image";
  }

  return (
    <div
      id={`issue-card-${issue.id}`}
      className="issue-card"
      data-index={index}
      style={{
        border: "1px solid #e6e6e6",
        padding: 12,
        marginBottom: 12,
        borderRadius: 8,
        background: "#fff",
      }}
    >
      {/* Issue Header */}
      <div id={`issue-header-${issue.id}`} className="issue-header" style={{ marginBottom: 8 }}>
        <h3 id={`issue-title-${issue.id}`} style={{ margin: 0 }}>
          Issue #{index + 1}: {title}
        </h3>
      </div>

      {/* Issue Info */}
      <div id={`issue-info-${issue.id}`} className="issue-info" style={{ marginBottom: 8 }}>
        <p id={`issue-desc-${issue.id}`} style={{ margin: "6px 0" }}>
          <strong>Description:</strong> {desc}
        </p>
        <p id={`issue-time-${issue.id}`} style={{ margin: "6px 0" }}>
          <strong>Time:</strong> {time}
        </p>
        <p id={`issue-severity-${issue.id}`} style={{ margin: "6px 0" }}>
          <strong>Severity:</strong> {getSeverityEmoji(severity)} {severity ?? "N/A"}
        </p>
        <p id={`issue-city-${issue.id}`} style={{ margin: "6px 0" }}>
          <strong>City:</strong> {city}
        </p>
        <p id={`issue-department-${issue.id}`} style={{ margin: "6px 0" }}>
          <strong>Department:</strong> {deptName ?? "N/A"}
        </p>
      </div>

      {/* Media */}
      {mediaUrl && (
        <div id={`issue-media-${issue.id}`} className="issue-media" style={{ marginTop: 8 }}>
          {mediaType === "video" ? (
            <video controls style={{ maxWidth: "100%", borderRadius: 6 }}>
              <source src={mediaUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <img id={`issue-image-${issue.id}`} src={mediaUrl} alt="Issue media" style={{ maxWidth: "100%", borderRadius: 6 }} />
          )}
        </div>
      )}
    </div>
  );
}

export default IssueCard;
