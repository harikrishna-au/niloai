import React, { useState, useRef } from "react";
import { GoogleGenAI } from "@google/genai";
import VisemeDisplay from "./components/VisemeDisplay";
import ChatDisplay from "./components/ChatDisplay";
import { AssemblyAI } from 'assemblyai';
import "./App.css";

function App() {
    const [messages, setMessages] = useState([]);
    const [isRecording, setIsRecording] = useState(false);
    const [textToSpeak, setTextToSpeak] = useState("");
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    
    const assemblyClient = new AssemblyAI({
        apiKey: "3795dcebb08c4b5d91553c5765b6a30a",
    });

    const genAI = new GoogleGenAI({
        apiKey: "AIzaSyB9k1UcICHRzyVGRi8WwVR4niB7XPHqEXM"
    });

    const handleRecordingToggle = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    const processWithGemini = async (userText) => {
        try {
            const response = await genAI.models.generateContent({
                model: "gemini-2.0-flash",
                contents: `${userText} 
                            Please provide a response in exactly 2 lines.
        Keep it brief and concise. You are NILO, an avatar designed to provide real-time lip-sync responses, overcoming delays and enhancing the user experience with multilingual support and 24/7 availability.`
            });

            // Extract only the first two lines if response is longer
            const aiResponse = response.text
                .split('\n')
                .filter(line => line.trim() !== '')
                .slice(0, 2)
                .join('\n');

            setMessages(prev => [...prev, {
                text: aiResponse,
                type: 'bot'
            }]);

            setTextToSpeak(aiResponse);
        } catch (error) {
            console.error("Error processing with Gemini:", error);
            setMessages(prev => [...prev, {
                text: "Sorry, I couldn't process that request.",
                type: 'bot'
            }]);
        }
    };

    const processAudio = async (audioBlob) => {
        try {
            const data = {
                audio: audioBlob,
            };

            const transcript = await assemblyClient.transcripts.transcribe(data);
            const transcribedText = transcript.text;

            // Add user message
            setMessages(prev => [...prev, {
                text: transcribedText,
                type: 'user'
            }]);

            // Process with Gemini AI
            await processWithGemini(transcribedText);

        } catch (error) {
            console.error("Error processing audio:", error);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            chunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
                await processAudio(audioBlob);
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (error) {
            console.error("Error accessing microphone:", error);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    return (
        <div className="app-container">
            <div className="content-wrapper">
                <div className="chat-section">
                    <ChatDisplay 
                        messages={messages} 
                        isRecording={isRecording}
                        onRecordingToggle={handleRecordingToggle}
                    />
                </div>
                <div className="avatar-section">
                    <VisemeDisplay text={textToSpeak} />
                </div>
            </div>
        </div>
    );
}

export default App;
