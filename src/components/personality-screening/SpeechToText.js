import React from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

function SpeechToText() {
  const { transcript, resetTranscript } = useSpeechRecognition();

  const handleStartListening = () => {
    SpeechRecognition.startListening({ continuous: true });
  };

  const handleStopListening = () => {
    SpeechRecognition.stopListening();
  };

  return (
    <div>
      <button onClick={handleStartListening}>Start Listening</button>
      <button onClick={handleStopListening}>Stop Listening</button>
      <button onClick={resetTranscript}>Reset Transcript</button>
      <p>{transcript}</p>
    </div>
  );
}

export default SpeechToText;
