import React, { useState, useRef, useEffect } from 'react';
import aiAgent from '../helper/AIAgentService';

const ChatWidget = ({ onSubmit }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Get user's location when component mounts
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(`${position.coords.latitude},${position.coords.longitude}`);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  useEffect(() => {
    // Scroll to bottom whenever messages update
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    addMessage('user', userMessage);
    setIsLoading(true);

    try {
      const response = await aiAgent.handleUserMessage(userMessage, null, location);

      addMessage('assistant', response.message);

      if (response.action === 'confirm_new' || response.action === 'confirm_duplicate') {
        onSubmit?.(response);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      addMessage('assistant', "I'm having trouble processing your request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const addMessage = (role, content) => {
    setMessages(prev => [...prev, { role, content }]);
  };

  return (
    <div className="chat-widget card border-0 shadow-sm">
      <div className="card-body">
        <div className="chat-messages p-3" style={{ height: '300px', overflowY: 'auto' }}>
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message mb-2 ${msg.role === 'user' ? 'text-end' : ''}`}
            >
              <div
                className={`d-inline-block p-2 rounded ${
                  msg.role === 'user' 
                    ? 'bg-primary text-white' 
                    : 'bg-light text-dark'
                }`}
                style={{ maxWidth: '80%' }}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message mb-2">
              <div className="d-inline-block p-2 rounded bg-light">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="mt-3">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading || !input.trim()}
            >
              <i className="bi bi-send"></i>
            </button>
          </div>
        </form>

        {location && (
          <small className="text-muted d-block mt-2">
            <i className="bi bi-geo-alt me-1"></i>
            Location enabled
          </small>
        )}
      </div>

      <style jsx>{`
        .typing-indicator {
          display: flex;
          gap: 4px;
        }
        
        .typing-indicator span {
          width: 8px;
          height: 8px;
          background: #90949c;
          border-radius: 50%;
          animation: bounce 1s infinite;
        }
        
        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }
        
        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
};

export default ChatWidget;