import React, { useState } from 'react';
import './TextInputOutput.css';

const TextInputOutput = ({ onSubmit }) => {
    const [inputText, setInputText] = useState('');

    const handleSubmit = () => {
        if (inputText.trim()) {
            onSubmit(inputText);
            setInputText('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="text-io-container">
            <textarea
                className="text-input"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here..."
                rows={3}
            />
            <button 
                className="submit-button"
                onClick={handleSubmit}
                disabled={!inputText.trim()}
            >
                Send
            </button>
        </div>
    );
};

export default TextInputOutput;