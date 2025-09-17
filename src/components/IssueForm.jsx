import React, { useState } from 'react';
import VoiceInput from './VoiceInput';
import supabase from '../helper/supabaseClient';
import { ISSUE_CATEGORIES } from '../helper/issueClassifier';

const IssueForm = ({ onSubmit, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleVoiceInput = (data) => {
    setDescription(data.description);
    setLocation(data.location);
  };

  const handleVoiceError = (error) => {
    setError(error);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const { data: issue, error: submitError } = await supabase
        .from('issues')
        .insert([{
          title,
          description,
          location,
          status: 'pending',
          issue_severity: severity,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (submitError) throw submitError;
      
      onSubmit(issue);
      resetForm();
    } catch (err) {
      setError('Failed to submit issue. Please try again.');
      console.error('Error submitting issue:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSeverity('medium');
    setLocation('');
    setError('');
  };

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body">
        <h5 className="card-title mb-4">Report New Issue</h5>
        
        {error && (
          <div className="alert alert-danger" role="alert">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="title" className="form-label">Issue Title</label>
            <input
              type="text"
              className="form-control"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Brief title describing the issue"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="description" className="form-label">Description</label>
            <textarea
              className="form-control"
              id="description"
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="Detailed description of the issue"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="severity" className="form-label">Severity</label>
            <select
              className="form-select"
              id="severity"
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              required
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="location" className="form-label">Location</label>
            <input
              type="text"
              className="form-control"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              placeholder="Address or location description"
            />
          </div>

          <div className="mb-4">
            <VoiceInput
              onTranscriptComplete={handleVoiceInput}
              onError={handleVoiceError}
            />
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Submitting...
                </>
              ) : (
                'Submit Issue'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IssueForm;