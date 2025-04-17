import React from 'react';
import './ChatDisplay.css';

const ChatDisplay = ({ messages, isRecording, onRecordingToggle }) => {
    return (
        <div className="chat-container">
            <div className="chat-header">
                <h2>Chat History</h2>
            </div>
            <div className="messages-container">
                {messages.map((message, index) => (
                    <div key={index} className={`message ${message.type}`}>
                        <div className="message-content">
                            {message.text}
                        </div>
                    </div>
                ))}
            </div>
            <div className="record-button-container">
                <button 
                    className={`record-button ${isRecording ? 'recording' : ''}`}
                    onClick={onRecordingToggle}
                >
                    {isRecording ? 'Stop Recording' : 'Start Recording'}
                </button>
            </div>
        </div>
    );
};

export default ChatDisplay;

