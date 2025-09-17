import React, { useState, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const VoiceInput = ({ onTranscriptComplete, onError }) => {
  const [isListening, setIsListening] = useState(false);
  const [location, setLocation] = useState(null);
  
  const {
    transcript,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  useEffect(() => {
    // Get user's location when component mounts
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          onError?.('Location access denied');
        }
      );
    }
  }, []);

  const startListening = async () => {
    try {
      resetTranscript();
      setIsListening(true);
      await SpeechRecognition.startListening({ continuous: true });
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      onError?.('Could not start voice recording');
    }
  };

  const stopListening = async () => {
    try {
      await SpeechRecognition.stopListening();
      setIsListening(false);
      if (transcript && location) {
        onTranscriptComplete({
          description: transcript,
          location: `${location.latitude}, ${location.longitude}`,
          source: 'voice'
        });
      }
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
      onError?.('Error processing voice input');
    }
  };

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="alert alert-warning">
        <i className="bi bi-exclamation-triangle me-2"></i>
        Your browser doesn't support voice input.
      </div>
    );
  }

  return (
    <div className="voice-input-container">
      <button
        className={`btn ${isListening ? 'btn-danger' : 'btn-primary'} d-flex align-items-center`}
        onClick={isListening ? stopListening : startListening}
      >
        <i className={`bi ${isListening ? 'bi-mic-fill' : 'bi-mic'} me-2`}></i>
        {isListening ? 'Stop Recording' : 'Start Voice Input'}
      </button>
      
      {isListening && (
        <div className="alert alert-info mt-3">
          <p className="mb-0"><strong>Recording:</strong> {transcript || 'Speak now...'}</p>
        </div>
      )}
      
      {location && (
        <small className="text-muted d-block mt-2">
          <i className="bi bi-geo-alt me-1"></i>
          Location detected
        </small>
      )}
    </div>
  );
};

export default VoiceInput;