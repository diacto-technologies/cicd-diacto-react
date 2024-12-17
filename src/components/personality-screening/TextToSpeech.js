import React, { useState, useEffect } from "react";

const TextToSpeech = ({ text, isSpeaking, setIsSpeaking,  }) => {
  const [isPaused, setIsPaused] = useState(false);
  const [utterance, setUtterance] = useState(null);
  const [voice, setVoice] = useState(null);
  const [pitch, setPitch] = useState(1.8);
  const [rate, setRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [voices, setVoices] = useState([]);
  

  useEffect(() => {
    if (text) {
        textToSpeech(text)
      return () => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      };
    }
  }, [text, voices]);




  const textToSpeech = (text) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    setIsSpeaking(true);


    const handleEnd = () => {
        setIsSpeaking(false); // Set speaking to false when speaking is done
      };

    u.onend = handleEnd;
    window.speechSynthesis.speak(u);
  }

  return <div className="flex space-x-4 items-center text-sm"></div>;
};

export default TextToSpeech;
