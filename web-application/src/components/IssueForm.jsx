import { useState } from 'react';
import supabase from '../helper/supabaseClient';

function IssueForm({ departmentId, userId, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    issueType: '',
    latitude: null,
    longitude: null
  });
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [message, setMessage] = useState('');

  const issueTypes = [
    'Roads and Infrastructure',
    'Sanitation and Cleanliness', 
    'Electricity and Power',
    'Water Supply',
    'Traffic and Transportation',
    'Public Safety',
    'Other Issues'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getCurrentLocation = () => {
    setLocationLoading(true);
    setLocationError('');

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser.');
      setLocationLoading(false);
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }));
        setLocationLoading(false);
        setMessage('Location captured successfully!');
        setTimeout(() => setMessage(''), 3000);
      },
      (error) => {
        setLocationLoading(false);
        switch(error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location access denied by user. Please enable location access in your browser settings.');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location information is unavailable.');
            break;
          case error.TIMEOUT:
            setLocationError('Location request timed out. Please try again.');
            break;
          default:
            setLocationError('An unknown error occurred while retrieving location.');
            break;
        }
      },
      options
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const issueData = {
        title: formData.title,
        description: formData.description,
        issue_type: formData.issueType,
        latitude: formData.latitude,
        longitude: formData.longitude,
        department_id: departmentId,
        user_id: userId,
        status: 'pending',
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('issues')
        .insert([issueData])
        .select()
        .single();

      if (error) throw error;

      setMessage('Issue reported successfully!');
      onSubmit(data);
    } catch (error) {
      setMessage('Error submitting issue: ' + error.message);
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-header bg-primary text-white">
        <h5 className="card-title mb-0">
          <i className="bi bi-plus-circle me-2"></i>
          Report New Issue
        </h5>
      </div>
      
      <div className="card-body">
        {message && (
          <div className={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-danger'}`} role="alert">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="title" className="form-label fw-medium">
                Issue Title *
              </label>
              <input
                type="text"
                className="form-control"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Brief description of the issue"
                required
              />
            </div>

            <div className="col-md-6 mb-3">
              <label htmlFor="issueType" className="form-label fw-medium">
                Issue Type *
              </label>
              <select
                className="form-select"
                id="issueType"
                name="issueType"
                value={formData.issueType}
                onChange={handleInputChange}
                required
              >
                <option value="">Select issue type</option>
                {issueTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="description" className="form-label fw-medium">
              Description *
            </label>
            <textarea
              className="form-control"
              id="description"
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Detailed description of the issue..."
              required
            ></textarea>
          </div>

          <div className="mb-3">
            <label className="form-label fw-medium">Location</label>
            <div className="d-flex align-items-center gap-3">
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={getCurrentLocation}
                disabled={locationLoading}
              >
                {locationLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Getting Location...
                  </>
                ) : (
                  <>
                    <i className="bi bi-geo-alt me-2"></i>
                    Get Current Location
                  </>
                )}
              </button>
              
              {formData.latitude && formData.longitude && (
                <span className="text-success">
                  <i className="bi bi-check-circle me-1"></i>
                  Location captured
                </span>
              )}
            </div>
            
            {locationError && (
              <div className="alert alert-warning mt-2" role="alert">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {locationError}
                <hr />
                <small>
                  <strong>How to enable location access:</strong><br />
                  • Click the location icon in your browser's address bar<br />
                  • Select "Allow" for location permissions<br />
                  • Make sure you're using HTTPS (not HTTP)<br />
                  • Check your browser's privacy/security settings
                </small>
              </div>
            )}
            
            {formData.latitude && formData.longitude && (
              <small className="text-muted">
                Coordinates: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
              </small>
            )}
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Submitting...
                </>
              ) : (
                <>
                  <i className="bi bi-send me-2"></i>
                  Submit Issue
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default IssueForm;