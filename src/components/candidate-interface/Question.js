import React, { useState, useEffect } from 'react';

const Question = ({ question, onNextQuestion, candidateId, testlogId }) => {
  const [timeLeft, setTimeLeft] = useState(question.time_limit || 60); // Default to 60 seconds if not provided
  const [selectedAnswer, setSelectedAnswer] = useState(null); // For single-choice questions
  const [selectedChoices, setSelectedChoices] = useState([]); // For multiple-choice questions
  const [textAnswer, setTextAnswer] = useState(""); // For text-based questions
  const [audioBlob, setAudioBlob] = useState(null); // For audio recording
  const [isRecording, setIsRecording] = useState(false); // To manage audio recording state
  const [mediaRecorder, setMediaRecorder] = useState(null); // MediaRecorder instance for audio recording
  const [questionStartTime, setQuestionStartTime] = useState(null); // Track when the question starts

  useEffect(() => {
    // Set the start time when the question is displayed
    setQuestionStartTime(new Date());

    // Timer logic
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [question]);

  // Handle answer selection for single choice
  const handleAnswerChange = (answer) => {
    setSelectedAnswer(answer);
  };

  // Handle multiple choices (checkbox)
  const handleMultipleChoiceChange = (choiceId) => {
    setSelectedChoices((prevChoices) =>
      prevChoices.includes(choiceId)
        ? prevChoices.filter((id) => id !== choiceId) // Remove if already selected
        : [...prevChoices, choiceId] // Add if not selected
    );
  };

  // Handle text input change
  const handleTextChange = (e) => {
    setTextAnswer(e.target.value);
  };

  // Start audio recording
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    setMediaRecorder(recorder);

    const audioChunks = [];
    recorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };

    recorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      setAudioBlob(audioBlob); // Store the recorded audio
    };

    recorder.start();
    setIsRecording(true);
  };

  // Stop audio recording
  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  // Handle submission
  const handleSubmit = async () => {
    let payload = {
      question_id: question.id,
      candidate_id: candidateId,
      started_at: questionStartTime.toISOString(), // Add the start time of the question
      testlog_id: testlogId,
    };

    if (question.type === 'single') {
      payload.choices = selectedAnswer ? [selectedAnswer] : [];
    } else if (question.type === 'multiple') {
      payload.choices = selectedChoices;
    } else if (question.type === 'text') {
      payload.text = textAnswer;
    } else if (question.type === 'audio') {
      const formData = new FormData();
      formData.append('candidate_id', candidateId);
      formData.append('question_id', question.id);
      formData.append('audio_file', audioBlob, 'audio.webm');
      formData.append('started_at', questionStartTime.toISOString());
      formData.append('testlog_id', testlogId);
      payload = formData; // Use FormData for multipart audio file
    }

    try {
      const response = await fetch(`/test/answers/`, {
        method: 'POST',
        headers: question.type === 'audio' ? {} : { 'Content-Type': 'application/json' },
        body: question.type === 'audio' ? payload : JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to submit answer');

      onNextQuestion(); // Proceed to the next question after submission
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <div className="question">
      <h3>{question.text}</h3>

      <div className="answers">
        {/* Single Choice */}
        {question.type === 'single' &&
          JSON.parse(question?.choices)?.map((choice) => (
            <div key={choice.id}>
              <input
                type="radio"
                value={choice.id}
                checked={selectedAnswer === choice.id}
                onChange={() => handleAnswerChange(choice.id)}
              />
              <label>{choice.text}</label>
            </div>
          ))}

        {/* Multiple Choice */}
        {question.type === 'multiple' &&
          JSON.parse(question?.choices)?.map((choice) => (
            <div key={choice.id}>
              <input
                type="checkbox"
                value={choice.id}
                checked={selectedChoices.includes(choice.id)}
                onChange={() => handleMultipleChoiceChange(choice.id)}
              />
              <label>{choice.text}</label>
            </div>
          ))}

        {/* Text Input */}
        {question.type === 'text' && (
          <div>
            <textarea
              value={textAnswer}
              onChange={handleTextChange}
              className="w-full p-2 border rounded"
              placeholder="Enter your answer here"
            />
          </div>
        )}

        {/* Audio Recording */}
        {question.type === 'audio' && (
          <div className="audio-recorder">
            {isRecording ? (
              <button onClick={stopRecording} className="stop-recording-button">
                Stop Recording
              </button>
            ) : (
              <button onClick={startRecording} className="start-recording-button">
                Start Recording
              </button>
            )}
          </div>
        )}
      </div>

      <div className="question-footer">
        <p>Time remaining: {timeLeft} seconds</p>
        <button onClick={handleSubmit} className="submit-button">
          Submit
        </button>
      </div>
    </div>
  );
};

export default Question;
