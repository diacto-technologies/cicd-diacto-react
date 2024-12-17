import { MicrophoneIcon, TrashIcon } from '@heroicons/react/20/solid';
import { PauseIcon } from '@heroicons/react/24/solid';
import React, { useState, useRef, useEffect } from 'react';
import './audioInput.css';

const AudioInput = ({ setError, question, responseChange, responses, setResponses, recordingAllowed, onStartRecording, onStopRecording, activeRecordingId }) => {
    const [recording, setRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [remainingTime, setRemainingTime] = useState(question.time_limit);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const timerRef = useRef(null);
    const audioRefs = useRef([]);  // Refs for audio elements

    useEffect(() => {
        const response = responses.find((res) => res.questionId === question.id);
        if (response) {
            setAudioBlob(response.answer);
        }
    }, [question]);

    useEffect(() => {
        if (!recording && audioBlob) {
            setResponses((prevResponses) => {
                const existingResponseIndex = prevResponses.findIndex((r) => r.questionId === question.id);

                if (existingResponseIndex !== -1) {
                    return prevResponses.map((r, index) => {
                        if (r.questionId === question.id) {
                            return { ...r, answer: audioBlob, type: 'audio' };
                        } else {
                            return r;
                        }
                    });
                } else {
                    return [
                        ...prevResponses,
                        {
                            questionId: question.id,
                            answer: audioBlob,
                            type: 'audio',
                        },
                    ];
                }
            });
        }
    }, [recording, audioBlob]);

    const handleStartRecording = () => {
        if (!recordingAllowed) return; // Prevent starting if not allowed

        navigator?.mediaDevices
            ?.getUserMedia({ audio: true })
            .then((stream) => {
                const mediaRecorder = new MediaRecorder(stream);
                mediaRecorderRef.current = mediaRecorder;

                mediaRecorder.addEventListener('dataavailable', (event) => {
                    audioChunksRef?.current?.push(event.data);
                });

                mediaRecorder.addEventListener('stop', () => {
                    const audioBlob = new Blob(audioChunksRef?.current, { type: 'audio/wav' });
                    setAudioBlob(audioBlob);
                    onStopRecording(); // Stop the recording globally
                });

                mediaRecorder.start();
                setRecording(true);
                onStartRecording(); // Notify parent that recording has started
                setRemainingTime(question.time_limit);

                timerRef.current = setInterval(() => {
                    setRemainingTime((prevTime) => {
                        if (prevTime <= 1) {
                            handleStopRecording();
                            clearInterval(timerRef?.current);
                            return 0;
                        }
                        return prevTime - 1;
                    });
                }, 1000);
            })
            .catch((error) => console.error('Error accessing microphone:', error));
    };

    const handleStopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
        }
        setRecording(false);
        clearInterval(timerRef.current);
    };

    const handleClearRecording = () => {
        setAudioBlob(null);
        audioChunksRef.current = [];
        setRemainingTime(question.time_limit);
        clearInterval(timerRef.current);
        setResponses((prevResponses) => prevResponses.filter((res) => res.questionId !== question.id));
    };

    // Handle play event
    const handlePlay = (id) => {
        // Pause the previous audio if different from the current one
        if (activeRecordingId) {
            // console.log(audioRefs)
            audioRefs.current[id].pause(); // Pause the previously playing audio
        }
    };

    // Handle pause event
    // const handlePause = (id) => {
    //     // console.log("Pause pressed by ", id);
    //     // // Reset the currentAudio when audio is paused
    //     // if (currentAudio === id) {
    //     //     setCurrentAudio(null);
    //     // }
    // };

    return (
        <div className={`flex gap-3 py-1.5 md:px-3 ${recording && 'bg-gray-50 rounded-lg'}`}>
            {!audioBlob ? (
                <>
                    {recording ? (
                        <button
                            type='button'
                            onClick={handleStopRecording}
                            className='rounded-full p-2 bg-slate-200'
                        >
                            <PauseIcon className='w-5 h-5 text-blue-500' />
                        </button>
                    ) : (
                        <button
                            type='button'
                            onClick={handleStartRecording}
                            className={`rounded-full p-2 bg-slate-200 ${!recordingAllowed && 'cursor-not-allowed'}`}
                            disabled={!recordingAllowed}
                        >
                            <MicrophoneIcon className='w-5 h-5 text-blue-500' />
                        </button>
                    )}
                </>
            ) : (
                <>
                    <audio
                        controls
                        ref={(el) => (audioRefs.current[question.id] = el)}
                        onPlay={() => handlePlay(question.id)}
                        // onPause={() => handlePause(question.id)}
                        src={URL.createObjectURL(audioBlob)}
                        className='audio-player'
                    />
                    <button type='button' onClick={handleClearRecording}>
                        <TrashIcon className='w-5 h-5 text-red-500' />
                    </button>
                </>
            )}

            {remainingTime > 0 && recording && (
                <div className='flex items-center justify-between w-full gap-2'>
                    <div className='w-2 h-2 rounded-full shadow-md bg-red-500 animate-pulse'></div>
                    <span className='text-gray-500 text-[.85rem]'>Recording</span>
                    <div className='flex ms-auto gap-1'>
                        <span className='text-sm self-center text-gray-500'>Time left</span>
                        <span className='self-center'> : {remainingTime}s</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AudioInput;
