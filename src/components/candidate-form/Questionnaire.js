import React, { useState, useEffect, useRef } from "react";
import { ClockIcon, Bars4Icon } from "@heroicons/react/24/outline";
import WebcamRec from "../personality-screening/react-webcam/WebcamRec";
import ReactQuill from "react-quill";
import ProgressBar from "../../utils/progress-bar/ProgressBar";

const Questionnaire = ({
  panel,
  questions,
  candidateId,
  testId,
  assessmentType,
  testLogId,
  testStartTime,
  setIsCompleted,
  jobId,
  markTestAsComplete
}) => {
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [textAnswer, setTextAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(-1);
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState([]);
  const [selectedChoiceIds, setSelectedChoiceIds] = useState([]);
  const selectedChoiceRef = useRef(selectedChoice);

  const timerRef = useRef(null); // Ref to store the interval ID

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      console.log("Event triggered: ", event)
      event.preventDefault();
      
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    selectedChoiceRef.current = selectedChoice;
  }, [selectedChoice]);

  useEffect(() => {
    if (timeLeft === 0) {
      handleSubmit();
    }
  }, [timeLeft])

  useEffect(() => {
    if (questions.length === 0) return;

    // Initialize timeLeft and questionStartTime when the question changes
    setTimeLeft(questions[currentQuestionIndex].time_limit);
    setQuestionStartTime(new Date());
    // startTime = new Date()

    // Start recording if the question type is 'video'
    if (currentQuestion.type === "video") {
      handleStartRecording();
    }

    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Set up the timer
    timerRef.current = setInterval(() => {
      setTimeLeft((prevTimeLeft) => {
        if (prevTimeLeft <= 1) {
          clearInterval(timerRef.current);
          // handleTimeout();
          return 0;
        }
        return prevTimeLeft - 1;
      });
    }, 1000);

    // Cleanup function to clear the timer when the component unmounts or when the effect runs again
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentQuestionIndex, questions]);

  const handleTimeout = () => {
    if (currentQuestion.type === "video") {
      handleStopRecording();
    }
    handleSubmit();
  };

  const handleSubmit = async () => {
    // console.log("Start Time>>>>>>>", questionStartTime)
    // Submit the answer to the API
    const payload = {
      question_id: currentQuestion.id,
      candidate_id: candidateId,
      choices: selectedChoiceRef.current || [],
      type: currentQuestion.type,
      text: textAnswer || "",
      audio_file: [], // Assumed to be handled elsewhere
      started_at: questionStartTime,
      // started_at: startTime,
      submitted_at: new Date(),

      test_log: testLogId,
      job: jobId,
    };


    if (assessmentType === "u") {
      payload["test"] = testId
    }
    if (assessmentType === "p") {
      payload["prebuilt_assessment"] = testId
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/test/answers/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        // Load next question or mark test as complete
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
          resetAnswerState();
        } else {
          resetAnswerState();
          await markTestAsComplete();
          setIsSubmitted(true);
        }
      } else {
        console.error("Failed to submit answer");
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const resetAnswerState = () => {
    setTextAnswer("");
    setSelectedChoice([]);
    setSelectedChoiceIds([]);
  };

  const handleCorrectChange = (choice, e) => {
    const { type, checked } = e.target;

    // console.log("Type: ", type, "Checked: ", checked, "Choice: ", choice, "Selected Choice: ", selectedChoice)
    if (type === "radio") {
      setSelectedChoice([choice]);
      setSelectedChoiceIds([choice.id]);
    } else if (type === "checkbox") {
      setSelectedChoice((prevChoices) =>
        checked
          ? [...prevChoices, choice]
          : prevChoices.filter((c) => c.id !== choice.id)
      );
      setSelectedChoiceIds((prevChoiceIds) =>
        checked
          ? [...prevChoiceIds, choice.id]
          : prevChoiceIds.filter((id) => id !== choice.id)
      );
    }
  };

  const handleAnswerChange = (e) => {
    setTextAnswer(e.target.value);
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    // Start recording logic
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    // Stop recording logic
  };

  if (questions.length === 0) {
    return <div>Loading questions...</div>;
  }

  return (
    <>
      <div
        ref={panel}
        className="h-screen w-full flex items-center justify-center bg-transparent md:bg-gray-50 lg:px-14 lg:py-5"
      >
        <div className="background-svg bottom-0">{/* Background SVG */}</div>
        <div className="relative w-full bg-transparent md:bg-white  z-10 flex flex-col justify-start md:justify-start h-90 rounded-3xl overflow-auto md:overflow-hidden">
          {!isSubmitted ? (
            <>
              {submitting && (
                <div className="h-full w-full bg-gray-50/80 absolute flex items-center justify-center z-50">
                  Submitting
                </div>
              )}
              <div className="absolute top-0 w-full">
                <ProgressBar currentIndex={currentQuestionIndex} length={questions?.length} />
              </div>
              <div className="p-10">

                <div className="w-full py-3 mb-2">

                  <label className="text-xl font-medium text-gray-900">
                    Questions{" "}
                    <span className="ms-2 bg-gray-50 py-1 px-2 ring-1 font-normal ring-gray-200 text-sm rounded-md text-gray-500">
                      Total questions: {questions.length || 0}
                    </span>
                  </label>
                </div>
                <div className="flex-grow flex flex-col gap-3 ">
                  <div className="flex justify-between items-center gap-3 w-full  rounded-md ">
                    <div className=" w-full rounded-md text-gray-900">
                      {/* {currentQuestion.html_content || currentQuestion.text} */}
                      <ReactQuill
                        theme="bubble"
                        value={currentQuestion.html_content || currentQuestion.text}
                        className="overflow-auto rounded-md bg-blue-50 select-none cursor-default	"
                        readOnly={true}
                      />
                    </div>
                    <div className="flex gap-x-1.5 items-center p-2 px-3 bg-sky-100  rounded-md text-blue-800">
                      <span>{currentQuestion.type[0].toUpperCase() + currentQuestion.type.slice(1)}</span>
                    </div>
                    <div className="flex gap-x-1.5 items-center p-2 px-3 w-24 bg-sky-100  rounded-md text-blue-800">
                      <ClockIcon className="w-5 h-5 text-sky-800 " />{" "}
                      <span className={`font-medium transition-all duration-75 ${timeLeft && timeLeft < 10 ? "text-red-500" : 'text-gray-600'}`}>{timeLeft}s</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 border w-full flex-grow rounded-md p-8 relative mt-8">
                    <div className="flex w-full items-center justify-between border-b pb-4 mb-5">
                      <label className="text-gray-700">Response</label>
                      <button
                        onClick={handleSubmit}
                        className="px-3 py-2 rounded-md text-white shadow-sm ring-2 ring-indigo-400 bg-brand-purple"
                      >
                        Submit Response
                      </button>
                    </div>
                    {/* Render input fields based on question type */}
                    {currentQuestion.type.toLowerCase() === "text" && (
                      <textarea
                        rows={3}
                        placeholder="Type your answer here..."
                        className="rounded-md p-2 text-sm ring-2 text-gray-800 outline-gray-700 focus:outline-indigo-400 w-full"
                        value={textAnswer}
                        onChange={handleAnswerChange}
                      ></textarea>
                    )}
                    {currentQuestion.type.toLowerCase() === "single" && (
                      <div className="grid grid-cols-2 w-full gap-5 justify-start">
                        {JSON.parse(currentQuestion.choices).map(
                          (choice, index) => (
                            <div
                              key={choice.id}
                              onClick={() => handleCorrectChange(choice, { target: { "type": "radio", "checked": true } })}
                              className={`flex gap-x-3 h-16 items-center border-2 rounded-xl p-2 shadow-sm ${selectedChoiceIds.includes(parseInt(choice.id))
                                ? "bg-brand-purple text-white ring-2 ring-indigo-600"
                                : "text-black bg-white"
                                }`}
                            >
                              <div className="p-3 flex h-full items-center">
                                <input
                                  type="radio"
                                  className="accent-[#b6e0ed]"
                                  checked={selectedChoiceIds.includes(
                                    parseInt(choice.id)
                                  )}
                                  onChange={(e) =>
                                    handleCorrectChange(choice, e)
                                  }
                                />
                              </div>
                              <label
                                className="ps-2 w-5/6 flex-grow border-t-0 p-1 rounded-md focus:outline-1"
                                placeholder={`Option ${index}`}
                              >
                                {choice.value}
                              </label>
                            </div>
                          )
                        )}
                      </div>
                    )}

                    {currentQuestion.type.toLowerCase() === "multiple" && (
                      <div className="grid grid-cols-2 w-full gap-5 justify-start">
                        {JSON.parse(currentQuestion.choices).map(
                          (choice, index) => (
                            <div
                              key={choice.id}
                              // onClick={()=>handleCorrectChange(choice, {target:{"type": "checkbox", "checked": true}})}
                              onClick={() => {
                                const isSelected = selectedChoiceIds.includes(parseInt(choice.id));
                                handleCorrectChange(choice, { target: { type: "checkbox", checked: !isSelected } });
                              }}
                              className={`flex gap-x-3 h-16 items-center border-2 rounded-xl p-2 shadow-sm ${selectedChoiceIds.includes(parseInt(choice.id))
                                ? "bg-brand-purple text-white ring-2 ring-indigo-600"
                                : "text-black bg-white"
                                }`}
                            >
                              <div className="p-3 flex h-full items-center">
                                <input
                                  type="checkbox" // Use checkbox type for multiple choices
                                  className="accent-[#b6e0ed]"
                                  checked={selectedChoiceIds.includes(
                                    parseInt(choice.id)
                                  )}
                                // onChange={(e) =>
                                //   handleCorrectChange(choice, e)
                                // }
                                />
                              </div>
                              <label className="ps-2 select-none w-5/6 flex-grow border-t-0 p-1 rounded-md focus:outline-1">
                                {choice.value}
                              </label>
                            </div>
                          )
                        )}
                      </div>
                    )}

                    {/* Add other question types as needed */}
                    {currentQuestion.type === "audio" && (
                      <div>
                        <button
                          onClick={
                            isRecording
                              ? handleStopRecording
                              : handleStartRecording
                          }
                          className={`px-3 py-2 rounded-md text-white shadow-sm ring-2 ${isRecording ? "bg-red-600/70" : "bg-green-600/70"
                            }`}
                        >
                          {isRecording ? "Stop Recording" : "Start Recording"}
                        </button>
                      </div>
                    )}
                    {currentQuestion.type === "video" && (
                      <div>
                        <button
                          onClick={
                            isRecording
                              ? handleStopRecording
                              : handleStartRecording
                          }
                          className={`px-3 py-2 rounded-md text-white shadow-sm ring-2 ${isRecording ? "bg-red-600/70" : "bg-green-600/70"
                            }`}
                        >
                          {isRecording ? "Stop Recording" : "Start Recording"}
                        </button>
                        {isRecording && <WebcamRec isRecording={isRecording} />}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <section className="relative h-full w-full isolate overflow-hidden sm:py-32 lg:px-12 flex items-center justify-center">
              <div className="mx-auto max-w-2xl lg:max-w-4xl ">
                <figure className="mt-10">
                  <blockquote className="text-center text-2xl font-semibold leading-8 text-gray-900 sm:text-3xl sm:leading-9">
                    <p className="text-3xl">Your response has been submitted</p>
                    <p className="text-base text-gray-500 mt-5">
                      Our team will update you with further steps.
                    </p>
                  </blockquote>
                </figure>
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
};

export default Questionnaire;
