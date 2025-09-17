import React from 'react';

function IssueCard({ issue, index }) {
  // We assume the 'issue' object also has a 'media_url' property
  // to link to the image or video, and 'media_type' to distinguish between them.
  // The 'index' prop is passed from the parent to show the issue count.

  // Function to determine severity emoji
  const getSeverityEmoji = (severity) => {
    switch (severity.toLowerCase()) {
      case 'low':
        return '🟢';
      case 'medium':
        return '🟡';
      case 'high':
        return '🔴';
      default:
        return '⚪️';
    }
  };

  return (
    <div className="issue-card">
      <div className="issue-header">
        {/* Display the issue count (index + 1) */}
        <h3>Issue #{index + 1}: {issue.issue_name}</h3>
      </div>
      <div className="issue-info">
        <p><strong>Description:</strong> {issue.issue_desc}</p>
        <p><strong>Time:</strong> {new Date(issue.issue_time).toLocaleString()}</p>
        {/* Display severity with an emoji */}
        <p>
          <strong>Severity:</strong> {getSeverityEmoji(issue.issue_severity)} {issue.issue_severity}
        </p>
        <p><strong>City:</strong> {issue.issue_city}</p>
        <p><strong>Department:</strong> {issue.issue_department}</p>
      </div>
      
      {/* Conditionally render image or video if a media_url exists */}
      {issue.media_url && (
        <div className="issue-media">
          {issue.media_type === 'image' && (
            <img src={issue.media_url} alt="Issue media" className="issue-image" />
          )}
          {issue.media_type === 'video' && (
            <video controls className="issue-video">
              <source src={issue.media_url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      )}
    </div>
  );
}

export default IssueCard;