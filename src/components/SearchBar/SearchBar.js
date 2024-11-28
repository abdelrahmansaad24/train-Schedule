import React, { useEffect, useState } from 'react';
import './SearchBar.css';

const SearchBar = (props) => {
    const [listening, setListening] = useState(false);
    const [command, setCommand] = useState('');
    const readScreen = () => {
        const content = document.body.innerText;
        const utterance = new SpeechSynthesisUtterance(content);

        utterance.lang = 'en-US';
        utterance.rate = 1;
        utterance.pitch = 1;

        window.speechSynthesis.speak(utterance);
    };

    const pauseReading = () => {
        if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
            window.speechSynthesis.pause();
        }
    };

    const resumeReading = () => {
        if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
        }
    };

    const stopReading = () => {
        window.speechSynthesis.cancel();
    };
    useEffect(() => {

        // Check if SpeechRecognition is supported
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            console.warn('SpeechRecognition is not supported in this browser.');
            return;
        }

        // Function to handle key press

        const recognition = new SpeechRecognition();
        recognition.continuous = false; // Stop after recognizing one command
        recognition.lang = 'en-US'; // Language for recognition

        recognition.onstart = () => {
            setListening(true);
        };

        recognition.onend = () => {
            setListening(false);
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript.toLowerCase();
            setCommand(transcript);
            handleVoiceCommand(transcript);
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
        };

        const startListening = () => recognition.start();
        const stopListening = () => recognition.stop();

        // Expose start/stop functions
        window.startSpeechRecognition = startListening;
        window.stopSpeechRecognition = stopListening;

        const handleKeyPress = (event) => {
            if (event.key === "c" || event.key === "C") {
                try {
                    startListening()
                }catch (error) {
                    stopListening()
                }
            }

            if (event.key === "r" || event.key === "R") {
                try {
                    readScreen();
                }catch (error) {
                    pauseReading();
                }
            }
            if (event.key === "s" || event.key === "S") {
                try {
                    stopReading();
                }catch (error) {
                    pauseReading();
                }
            }
            if (event.key === " ") {
                try {
                    resumeReading();
                }catch (error) {
                    pauseReading();
                }
            }
        };

        // Attach event listener to the document
        document.addEventListener("keydown", handleKeyPress);


        return () => {
            recognition.stop();
        };
    }, []);

    const handleVoiceCommand = (command) => {
        console.log(`Recognized command: ${command}`);

        if (command.includes('1st') || command.includes('number 1') || command.includes('first')) {
            props.onChange({ value: 'AIN', label: 'Ainola' });
        } else if (command.includes('2nd') || command.includes('number 2') || command.includes('second')) {
            props.onChange({ value: 'HKI', label: 'Helsinki' });
        } else if (command.includes('3rd') || command.includes('number 3') || command.includes('third')) {
            props.onChange({ value: 'ITA', label: 'Iittala' });
        } else if (command.includes('fourth') || command.includes('number 4') || command.includes('4th')) {
            props.onChange({ value: 'JK', label: 'Jokela' });
        } else if (command.includes('fifth') || command.includes('number 5') || command.includes('5th')) {
            props.onChange({ value: 'KNS', label: 'Kannus' });
        } else {
            console.log('Unknown command');
        }
    };

    return (
        <div className="SearchBar">
            <div className="nav">
                <button type="button" onClick={() => props.onChange({value: 'AIN', label: 'Ainola'})}>
                    First
                </button>
                <button type="button" onClick={() => props.onChange({value: 'HKI', label: 'Helsinki'})}>
                    Second
                </button>
                <button type="button" onClick={() => props.onChange({value: 'ITA', label: 'Iittala'})}>
                    Third
                </button>
                <button type="button" onClick={() => props.onChange({value: 'JK', label: 'Jokela'})}>
                    Fourth
                </button>
                <button type="button" onClick={() => props.onChange({value: 'KNS', label: 'Kannus'})}>
                    Fifth
                </button>
            </div>
            <div className="voice-controls">
                <button className="submit" type="button" onClick={window.startSpeechRecognition} disabled={listening}>
                    Start Voice Command
                </button>
                <button className="cancel" type="button" onClick={window.stopSpeechRecognition} disabled={!listening}>
                    Stop Voice Command
                </button>
            </div>
            <p className="command">Recognized Command: {command}</p>
        </div>
    );
};

export default SearchBar;
