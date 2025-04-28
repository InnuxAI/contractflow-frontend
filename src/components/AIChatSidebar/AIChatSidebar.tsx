import React, { useState } from 'react';
import './AIChatSidebar.css';

const AIChatSidebar: React.FC = () => {
    const [message, setMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle message submission
        setMessage('');
    };

    return (
        <div className="ai-sidebar">
            <div className="ai-sidebar-header">
                <h2>AI Assistant</h2>
            </div>
            
            <div className="ai-sidebar-messages">
                <div className="message">
                    <p className="message-content">Welcome!<br></br>How can I help you with your document?</p>
                    <span className="message-sender">AI Assistant</span>
                </div>
            </div>
            
            <form className="ai-sidebar-input" onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Ask AI..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <button type="submit">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="currentColor"/>
                    </svg>
                </button>
            </form>
        </div>
    );
};

export default AIChatSidebar; 