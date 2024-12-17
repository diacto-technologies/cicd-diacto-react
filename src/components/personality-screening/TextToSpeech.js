import React, { useState, useEffect } from "react";

const TextToSpeech = ({ text, isSpeaking, setIsSpeaking,  }) => {
  const [isPaused, setIsPaused] = useState(false);
  const [utterance, setUtterance] = useState(null);
  const [voice, setVoice] = useState(null);
  const [pitch, setPitch] = useState(1.2); // Adjusted for more natural tone
  const [rate, setRate] = useState(1); // Normal speed
  const [volume, setVolume] = useState(1); // Full volume
  const [voices, setVoices] = useState([]);

  // Fetch available voices
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);

      // Select a default voice, e.g., a female voice if available
      const defaultVoice = availableVoices.find((v) => v.name.includes("Google US English"));
      setVoice(defaultVoice || availableVoices[0]);
    };

    if (window.speechSynthesis) {
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices; // Load voices when they change
    }
  }, []);

  // Cleanup on unmount or when text changes
  useEffect(() => {
    if (text) {
      textToSpeech(text);
    }
    return () => {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    };
  }, [text, voice, pitch, rate, volume]);

  // Text-to-speech function
  const textToSpeech = (text) => {
    if (!text || !voice) return;

    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.voice = voice; // Set selected voice
    u.pitch = pitch; // Set pitch
    u.rate = rate; // Set rate
    u.volume = volume; // Set volume

    setIsSpeaking(true);

    u.onend = () => {
      setIsSpeaking(false); // Reset speaking state when done
    };

    u.onerror = (e) => {
      console.error("Speech synthesis error:", e);
      setIsSpeaking(false);
    };

    setUtterance(u);
    window.speechSynthesis.speak(u);
  };

  // Pause or resume speech
  const togglePause = () => {
    if (isPaused) {
      window.speechSynthesis.resume();
    } else {
      window.speechSynthesis.pause();
    }
    setIsPaused(!isPaused);
  };

  return <div className="flex space-x-4 items-center text-sm"></div>;
};

export default TextToSpeech;
