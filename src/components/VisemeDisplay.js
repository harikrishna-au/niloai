import React, { useState, useEffect, useRef } from "react";
import cartoonAvatarVideo from "../AvatarImages/3.png"; // base image
import blinkGif from "../AvatarImages/blink.gif"; // Add this import for your blink GIF
import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import { config } from "../config";
import { cartoonVisemes } from "../visemes/cartoonVisemes";
import "./VisemeDisplay.css";

const VisemeDisplay = ({ text }) => {
    const [imageIndex, setImageIndex] = useState(0);
    const [isVisemesActive, setIsVisemesActive] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [shouldBlink, setShouldBlink] = useState(false);
    const synthesizerRef = useRef(null);
    const timeoutsRef = useRef([]);
    const blinkTimeoutRef = useRef(null);

    // Function to trigger blink
    const triggerBlink = () => {
        setShouldBlink(true);
        setTimeout(() => setShouldBlink(false), 500); // Duration of blink GIF
    };

    // Handle regular blinking when not speaking
    useEffect(() => {
        const handleRegularBlink = () => {
            if (!isSpeaking) {
                triggerBlink();
            }
        };

        const startRegularBlinking = () => {
            handleRegularBlink();
            blinkTimeoutRef.current = setInterval(handleRegularBlink, 5000);
        };

        if (!isSpeaking) {
            startRegularBlinking();
        }

        return () => {
            if (blinkTimeoutRef.current) {
                clearInterval(blinkTimeoutRef.current);
            }
        };
    }, [isSpeaking]);

    // Modified handleVisemes function to include blinking
    function handleVisemes(text) {
        setIsSpeaking(true);
        const speechConfig = sdk.SpeechConfig.fromSubscription(
            config.SpeechKey,
            config.SpeechRegion
        );
        const audioConfig = sdk.AudioConfig.fromDefaultSpeakerOutput();
        const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);
        let visemesArr = [];
        let lastPunctuationTime = 0;
        const punctuationMarks = ['.', ',', '!', '?', ';', ':'];

        synthesizer.visemeReceived = function (s, e) {
            visemesArr.push(e);
            
            // Get the current text position
            const currentTextPosition = e.audioOffset / 10000;
            
            // Check for punctuation and trigger blink if needed
            const textUpToCurrentPosition = text.slice(0, Math.floor(currentTextPosition));
            const lastChar = textUpToCurrentPosition.slice(-1);
            
            if (punctuationMarks.includes(lastChar) && 
                currentTextPosition - lastPunctuationTime > 1000) { // Prevent too frequent blinking
                setTimeout(() => triggerBlink(), currentTextPosition);
                lastPunctuationTime = currentTextPosition;
            }
        };

        synthesizer.speakTextAsync(
            text,
            (result) => {
                if (result.errorDetails) {
                    console.error(result.errorDetails);
                } else {
                    visemesArr.forEach((e) => {
                        const duration = e.audioOffset / 10000;
                        setTimeout(() => {
                            setImageIndex(e.visemeId);
                        }, duration);
                    });

                    // Trigger blink at the end of sentence
                    const totalDuration = visemesArr[visemesArr.length - 1]?.audioOffset / 10000 || 0;
                    setTimeout(() => {
                        triggerBlink();
                        setIsSpeaking(false);
                    }, totalDuration);
                }

                visemesArr = [];
                synthesizer.close();
            },
            (error) => {
                console.error(error);
                visemesArr = [];
                synthesizer.close();
                setIsSpeaking(false);
            }
        );
    }

    useEffect(() => {
        if (text) {
            handleVisemes(text);
        }
    }, [text]);

    return (
        <div className="faces-container">
            <div className="face-container cartoon-face">
                <div className="avatar-wrapper">
                    {/* Base layer */}
                    <img
                        src={cartoonAvatarVideo}
                        alt="Base Avatar"
                        className="avatar-base"
                    />
                    
                    {/* Blink overlay */}
                    <img
                        src={blinkGif}
                        alt="Blinking"
                        className={`blink-overlay ${shouldBlink ? 'show' : 'hide'}`}
                    />
                    
                    {/* Viseme overlay */}
                    <img
                        src={cartoonVisemes[imageIndex] || cartoonVisemes[0]}
                        alt="Cartoon Viseme"
                        className={`viseme-image cartoon-viseme ${isVisemesActive ? 'animate' : ''}`}
                    />
                </div>
            </div>
        </div>
    );
};

export default VisemeDisplay;
