import { useEffect, useRef, useState } from "react";
import VideoNavbar from "../../utils/navbar/VideoNavbar";
import "./Video.css";
import { useNavigate, useParams } from "react-router-dom";
import TextToSpeech from "./TextToSpeech";
import ChatBubble from "../../utils/chat-bubbles/ChatBubble";
import AudioBubble from "../../utils/chat-bubbles/AudioBubble";
import CountdownTimer from "./CountdownTimer";
import StartTimer from "./StartTimer";
import Axel from "../../assets/axel.jpg";
import SpinLoader from "../../utils/loaders/SpinLoader";
import VoiceAnimation from "./VoiceAnimation";
import { ExclamationCircleIcon } from "@heroicons/react/20/solid";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { api } from "../../constants/constants";
const VideoComponent = () => {
  const { candidateId, screeningId } = useParams();
  const [showStructure, setShowStructure] = useState(false);
  const videoRef = useRef(null);
  const audioRef = useRef(null); // Add a ref for the audio element
  const imageRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);

  const [audioChunks, setAudioChunks] = useState([]);

  const audioMediaRecorder = useRef(null);
  const videoMediaRecorder = useRef(null);
  const [audioStream, setAudioStream] = useState(null);
  const [videoStream, setVideoStream] = useState(null);
  const [audioAnswers, setAudioAnswers] = useState({});
  const [submittedAnswers, setSubmittedAnswers] = useState({});

  const [videoQuality, setVideoQuality] = useState("medium");
  const [candidate, setCandidate] = useState(null);
  const [screeningDetails, setScreeningDetails] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [askedQuestions, setAskedQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false) ;
  const [isCompleted, setIsCompleted] = useState(false);
  const [completedText, setCompletedText] = useState("");
  const [estimatedTime, setEstimatedTime] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [startTimer, setStartTimer] = useState(false);
  const [started, setStarted] = useState(false);
  const navigate = useNavigate();
  const [isSpeaking, setIsSpeaking] = useState(false);

  const [submittingAnswer, setSubmittingAnswer] = useState(false);

  useEffect(() => {
    // markAsStarted()
    fetchCandidateAndScreeningDetails();
  }, [candidateId, screeningId]);

  useEffect(() => {
    if (currentQuestion && !isSpeaking) {
      startRecording();
    }
  }, [isSpeaking]);

  useEffect(() => {
    if (!isRecording && recordedChunks.length > 0 && currentQuestion) {
      submitAnswer();
    }
  }, [recordedChunks, isRecording, currentQuestion]);

  //   useEffect(() => {
  //     console.log(!isRecording, recordedChunks.length, currentQuestion);

  //     if (!isRecording && recordedChunks.length > 0 && currentQuestion) {
  //         setSubmittingAnswer(true); // Set to true initially

  //         // After 5 seconds, set it back to false
  //         const timeoutId = setTimeout(() => {
  //             setSubmittingAnswer(false);
  //         }, 5000);

  //         // Cleanup timeout if dependencies change or component unmounts
  //         return () => clearTimeout(timeoutId);
  //     }
  // }, [recordedChunks, isRecording, currentQuestion, setSubmittingAnswer]);

  useEffect(() => {
    if (
      askedQuestions.length > 0 &&
      questions.length > 0 &&
      askedQuestions.length === questions.length
    ) {
      videoStream.getTracks().forEach((track) => track.stop());
      audioStream.getTracks().forEach((track) => track.stop());
      setCurrentQuestion(null);
      setCurrentQuestionIndex(null);
      stopRecording();

      markScreeningAsCompleted()
      setIsCompleted(true);
      setCompletedText("You have successfully completed the tour!");
    }
  }, [askedQuestions, questions]);

  const markAsStarted = async () => {
    const headers = {
      "Content-Type": "application/json",
      // Authorization: "Bearer " + String(authTokens.access),
    };


    try {
      const screeningResponse = await fetch(
        `${api}/personality-screening/personality-screenings/${screeningId}/`,
        {
          method: "PATCH",
          headers: headers,
          body: JSON.stringify({ started: new Date(), status_text: "Started" }),
        }
      );

      if (!screeningResponse.ok) {
        if (screeningResponse.status === 404) {

          navigate("/page-not-found/");
        } else {
          throw new Error("One or more network responses were not ok");
        }
      }
      const screeningData = await screeningResponse.json();
      // navigate(`/candidate/personality-screening/${candidateId}/${screeningId}/start/`)
      setLoading(false);
      // Process both candidateData and screeningData as needed
    } catch (error) {
      setLoading(false);
      setError(error);
    }
  };

  const startRecording = async () => {
    const startTime = performance.now(); // Record the start time
    if (!audioStream && !videoStream) {
      const streamData1 = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });

      setAudioStream(streamData1);

      const streamData2 = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });

      setVideoStream(streamData2);

      videoRef.current.srcObject = streamData2;
      //create new Media recorder instance using the stream
      const audiomedia = new MediaRecorder(streamData1, { type: "audio/webm" });
      const videomedia = new MediaRecorder(streamData2, { type: "video/webm" });

      //set the MediaRecorder instance to the mediaRecorder ref
      audioMediaRecorder.current = audiomedia;
      videoMediaRecorder.current = videomedia;
    } else {
      videoRef.current.srcObject = videoStream;
      //create new Media recorder instance using the stream
      const audiomedia = new MediaRecorder(audioStream, { type: "audio/webm" });
      const videomedia = new MediaRecorder(videoStream, { type: "video/webm" });

      //set the MediaRecorder instance to the mediaRecorder ref
      audioMediaRecorder.current = audiomedia;
      videoMediaRecorder.current = videomedia;
    }

    //invokes the start method to start the recording process
    audioMediaRecorder.current.start();
    videoMediaRecorder.current.start();

    setIsRecording(true);

    let localAudioChunks = [];
    audioMediaRecorder.current.ondataavailable = (event) => {
      if (typeof event.data === "undefined") return;
      if (event.data.size === 0) return;
      localAudioChunks.push(event.data);
      setAudioChunks(localAudioChunks);
    };

    let localVideoChunks = [];
    videoMediaRecorder.current.ondataavailable = (event) => {
      if (typeof event.data === "undefined") return;
      if (event.data.size === 0) return;
      localVideoChunks.push(event.data);
      setRecordedChunks(localVideoChunks);
    };
    const endTime = performance.now();
    const timeTaken = endTime - startTime;
   
    // streamData2.getTracks().forEach(track => track.stop());
  };

  const stopRecording = async () => {
    //stops the recording instance
    //console.log("stopping");
    if (audioMediaRecorder.current && videoMediaRecorder.current) {
      await videoMediaRecorder.current.stop();
      await audioMediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  const fetchCandidateAndScreeningDetails = async () => {
    setLoading(true);

    if (candidateId && screeningId) {
      const headers = {
        "Content-Type": "application/json",
        // Authorization: "Bearer " + String(authTokens.access),
      };

      try {
        const [candidateResponse, screeningResponse] = await Promise.all([
          fetch(`${api}/candidates/candidate-details/${candidateId}/`, {
            method: "GET",
            headers: headers,
          }),
          fetch(
            `${api}/personality-screening/personality-screenings/${screeningId}/`,
            {
              method: "GET",
              headers: headers,
            }
          ),
        ]);

        if (!candidateResponse.ok || !screeningResponse.ok) {
          //console.log(screeningResponse);
          if (screeningResponse.status === 404) {
            navigate("/page-not-found/");
          } else {
            throw new Error("One or more network responses were not ok");
          }
        }

        const [candidateData, screeningData] = await Promise.all([
          candidateResponse.json(),
          screeningResponse.json(),
        ]);

        setCandidate(candidateData);
        setScreeningDetails(screeningData);
        //console.log(screeningData?.completed);
        if (
          screeningData &&
          !screeningData?.completed &&
          screeningData.questions
        ) {
          //console.log(screeningData.questions);
          setQuestions(screeningData.questions);

          setEstimatedTime(
            screeningData.questions.reduce((total, currentValue) => {
              const timeLimit = currentValue["time_limit"];
              return total + (typeof timeLimit === "number" ? timeLimit : 0);
            }, 0)
          );
          // await fetchQuestions(screeningData?.step?.question_set)
        } else if (screeningData?.completed) {
          setIsCompleted(true);
          setCompletedText("We have already received your response.");
        }
        // Process both candidateData and screeningData as needed

        setLoading(false);
        // Update state or perform further actions
      } catch (error) {
        setLoading(false);
        setError("Page not found");
      }
    }
  };

  const fetchQuestions = async (questionSetId) => {
    try {
      const response = await fetch(
        `${api}/interview/questions/?question_set_id=${questionSetId}`
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      if (data.results.length) {
        //console.log(" setQuestions ", data);
        setQuestions(data.results);

        setEstimatedTime(
          data.reduce((total, currentValue) => {
            const timeLimit = currentValue["time_limit"];
            return total + (typeof timeLimit === "number" ? timeLimit : 0);
          }, 0)
        );
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  const startScreening = async () => {
    try {
      setStarted(true);
      setStartTime(new Date());
      setStartTimer(false);
      await startRecording();
      setCurrentQuestionIndex(0);
      setCurrentQuestion(questions[0]);
    } catch (error) {
      toast.error(`${error}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });

      //console.log(error, Object.values(error));
    }
  };

  const downloadRecording = async () => {
    try {
      //console.log("Recorded chunks:", recordedChunks);
      if (recordedChunks.length) {
        const blob = new Blob(recordedChunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "recording.webm";
        a.click();
        URL.revokeObjectURL(url);
        setRecordedChunks([]);
      }
    } catch (error) {
      console.error("Error downloading recording:", error);
    }
  };

  const nextQuestion = async () => {
    setIsSubmitted(false);
    if (
      currentQuestionIndex !== null &&
      currentQuestionIndex < questions.length - 1
    ) {
      setStartTime(new Date());
      // await startRecording()
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1); // Move to the next question index
      setCurrentQuestion(questions[currentQuestionIndex + 1]); // Set the next question
      //console.log(questions[currentQuestionIndex + 1], currentQuestionIndex);
    } else {
      // Handle the case when there are no more questions (end of questionnaire)
      //console.log("End of questionnaire reached");
    }
  };

  const submitAnswer = async () => {
    try {
      // if (recordedChunks.length) {
      setSubmittingAnswer(true);
      const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
      const url = URL.createObjectURL(audioBlob);
      // Convert audio Blob to MP3
      const audioFile = new File(
        [audioBlob],
        `${candidate?.name}-PersonalityScreening-${screeningDetails.id}.mp3`
      );
      const formattedStartTime = new Date(startTime).toISOString();
      const blob = new Blob(recordedChunks, { type: "video/webm" });

      // Log each field value
      // console.log("question:", currentQuestion?.id); // ID of the question
      // console.log("question_set:", screeningDetails?.question_set || ""); // ID of the question set or an empty string if not available
      // console.log("candidate:", parseInt(candidateId)); // ID of the candidate
      // console.log("type:", "video"); // Type of the answer
      // console.log("video_file:", blob); // Video blob
      // console.log(
      //   "video_file_name:",
      //   `${candidate?.name}-PersonalityScreening-${screeningDetails.id}.webm`
      // ); // Filename for the video blob
      // console.log("audio_file:", audioFile); // Audio file
      // console.log("started:", formattedStartTime); // Start time
      // console.log("submitted_at:", new Date()); // Current date and time
      // console.log("step:", screeningDetails?.step?.id || ""); // ID of the step or an empty string if not available

      const answerData = new FormData();
      answerData.append("question", currentQuestion?.id); // ID of the question
      answerData.append("question_set", screeningDetails?.question_set || ""); // ID of the question set or an empty string if not available
      answerData.append("candidate", parseInt(candidateId)); // ID of the candidate
      answerData.append("type", "video");
      answerData.append(
        "video_file",
        blob,
        `${candidate?.name}-PersonalityScreening-${screeningDetails.id}.webm`
      ); // Provide a filename for the blob
      answerData.append("audio_file", audioFile); // Add audio file
      answerData.append("started", formattedStartTime);
      answerData.append("submitted_at", new Date());
      answerData.append("step", screeningDetails?.step?.id || "");

      answerData.append("screening_type", "personality-screening");
      answerData.append("screening_id", screeningDetails?.id);
      //   console.log(answerData);

      const response = await fetch(`${api}/interview/answers/`, {
        method: "POST",
        body: answerData,
      });

      if (!response.ok) {
        const errorData = await response.json(); // Parse the error response body
        throw new Error(
          errorData.error ||
            "Something went wrong while submitting your response"
        );
      }

      const responseData = await response.json();
      setRecordedChunks([]);
      setAudioChunks([]);
      if (
        currentQuestionIndex !== null &&
        currentQuestionIndex < questions.length
      ) {
        setAudioAnswers((prev) => ({ ...prev, [currentQuestion.id]: url }));
        setAskedQuestions((prev) => [...prev, currentQuestion]); // Add the next question to the asked questions
        setSubmittedAnswers((prev) => ({
          ...prev,
          [currentQuestion.id]: true,
        }));
        setIsSubmitted(true);
        setStartTime(null);
      } else {
        // Handle the case when there are no more questions (end of questionnaire)

        setCurrentQuestion(null);

        //console.log("End of questionnaire reached");
      }
      setSubmittingAnswer(false);
    } catch (error) {
      console.error("Error creating answer:", error);
      // You can display this error to the user
      setError(error.message); // Set the error message to be displayed
      setSubmittingAnswer(false);
    }
  };

  const markAsComplete = async () => {
    const currentStep = screeningDetails?.step;
    if (currentStep) {
      const stepdata = {
        action: "Complete",
        order: currentStep.order,
        candidate_id: candidateId,
        job_id: currentStep.job,
        workflow_id: currentStep.module,
        step_id: currentStep.id,
        service: "Personality Screening",
      };

      const response = await fetch(`${api}/interview/update-step/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(stepdata),
      });

      if (!response.ok) {
        throw new Error("Failed to create answer");
      }

      const responseData = await response.json();
      markScreeningAsCompleted();
      //console.log(responseData);
    }
  };

  const markScreeningAsCompleted = async () => {
    const headers = {
      "Content-Type": "application/json",
      // Authorization: "Bearer " + String(authTokens.access),
    };

    try {
      const screeningResponse = await fetch(
        `/personality-screening/personality-screenings/${screeningId}/`,
        {
          method: "PATCH",
          headers: headers,
          body: JSON.stringify({
            completed: true,
            completed_time: new Date(),
            status_text: "Completed",
          }),
        }
      );

      if (!screeningResponse.ok) {
        if (screeningResponse.status === 404) {
          navigate("/page-not-found/");
        } else {
          throw new Error("One or more network responses were not ok");
        }
      }

      const screeningData = await screeningResponse.json();
      return screeningData;

      // Process both candidateData and screeningData as needed

      // Update state or perform further actions
    } catch (error) {
      setError("Something went wrong!");
    }
  };

  const handleVideoQualityChange = (e) => {
    const quality = e.target.value;
    setVideoQuality(quality);
  };

  const getUserMediaConstraintsForQuality = (quality) => {
    let constraints = { audio: true };
    switch (quality) {
      case "low":
        constraints.video = {
          facingMode: "user",
          width: { ideal: 320 },
          height: { ideal: 240 },
          frameRate: { ideal: 15 },
        };
        break;
      case "medium":
        constraints.video = {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 30 },
        };
        break;
      case "high":
        constraints.video = {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 60 },
        };
        break;
      default:
        constraints.video = {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 30 },
        };
    }
    return constraints;
  };

  //   console.log(estimatedTime, questions[0]);

  return (
    <>
      <div
        className={`h-screen w-full bg-transparent ${
          isCompleted && "bg-gradient-to-b from-[#7474f4] to-[#a5a5fa]"
        } overflow-hidden`}
      >
        {submittingAnswer && (
          <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 h-72 animate-fadeIn">
              <div className="flex h-full w-full flex-col items-center justify-center space-y-4">
                {/* Loader icon or animation */}

                {/* Text information */}
                <div className="text-center flex flex-col items-center justify-center">
                  <p className="text-xl font-semibold text-gray-700">
                    Submitting your response...
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    This will take a few moments. Please wait.
                  </p>
                </div>
                {/* Optional animated dots to show progress */}
                <div className="mt-4">
                  <span className="inline-block w-2.5 h-2.5 bg-blue-600 rounded-full animate-pulse"></span>
                  <span className="inline-block w-2.5 h-2.5 bg-blue-600 rounded-full animate-pulse delay-150 ml-1"></span>
                  <span className="inline-block w-2.5 h-2.5 bg-blue-600 rounded-full animate-pulse delay-300 ml-1"></span>
                </div>
              </div>
            </div>
          </div>
        )}
        {error && (
          <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-10 animate-fadeIn space-y-6">
              <div className="flex flex-col items-center justify-center space-y-4">
                {/* Error icon or alert indicator */}
                <div className="flex items-center mt-3 justify-center">
                  {/* <svg
                    className="w-12 h-12 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01M12 12a9 9 0 110-18 9 9 0 010 18z"
                    ></path>
                  </svg> */}
                  <ExclamationCircleIcon className="text-red-600 w-20 h-20" />
                </div>

                {/* Error title and description */}
                <div className="text-center flex flex-col items-center justify-center">
                  <p className="text-2xl font-semibold text-gray-800">
                    Oops! Something went wrong
                  </p>
                  <p className="text-base text-gray-600 mt-2">{error}</p>
                </div>

                {/* Support message with link */}
                <div className="text-center">
                  <p className="text-sm text-gray-500">
                    Please contact us at{" "}
                    <a
                      href="mailto:support@candidhr.ai"
                      className="text-blue-600 underline"
                    >
                      support@candidhr.ai
                    </a>{" "}
                    for further assistance.
                  </p>
                </div>

                {/* Close button
                <div className="text-center">
                  <button
                    onClick={() => setError(null)} // Close error on button click
                    className="px-6 py-2 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    Close
                  </button>
                </div> */}
              </div>
            </div>
          </div>
        )}

        <header className="bg-gradient-to-b from-[#7474f4] to-[#a5a5fa]">
          <VideoNavbar
            isCompleted={isCompleted}
            candidateName={candidate?.name || "No data"}
          />
        </header>

        <div className="p-4 ">
          {!loading && (
            <main className="mt-4 w-full flex justify-between items-center space-x-4 ">
              {isCompleted ? (
                <div
                  className="w-full flex items-center justify-center rounded-lg  relative overflow-hidden"
                  style={{ height: "calc(100dvh - 110px)" }}
                >
                  <section className="relative h-full w-full isolate overflow-hidden flex items-center justify-center">
                    <div className="background-svg absolute bottom-0">
                      {/* <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 1440 320"
                      >
                        <path
                          fill="#7474f4"
                          fillOpacity={1}
                          d="M0,64L48,53.3C96,43,192,21,288,64C384,107,480,213,576,229.3C672,245,768,171,864,165.3C960,160,1056,224,1152,234.7C1248,245,1344,203,1392,181.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                        ></path>
                      </svg> */}
                    </div>
                    <div className="mx-auto max-w-2xl lg:max-w-4xl z-40">
                      {/* <img className="mx-auto h-12" src="https://tailwindui.com/img/logos/workcation-logo-indigo-600.svg" alt="" /> */}
                      <div className="mt-10 ">
                        <div className="text-center text-2xl font-semibold text-gray-900 sm:text-3xl">
                          <h2 className="mb-5 text-white">
                            Thank You for Completing the Video Interview
                          </h2>
                          <p className="text-base text-gray-100">
                            We appreciate your effort. Our team will review your
                            submission and contact you soon with the next steps.
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              ) : (
                <div
                  className="mt-14 w-full flex justify-between items-center space-x-4 "
                  style={{ height: "calc(100dvh - 110px)" }}
                >
                  <section
                    id="videoContainer"
                    className="w-4/5 h-full rounded-xl border-2 overflow-hidden"
                  >
                    {/* <button onClick={markAsComplete}>Complete</button> */}
                    <div
                      className="bg-white"
                      style={{
                        position: "relative",
                        width: "100%",
                        height: "100%",
                      }}
                    >
                      {!started && (
                        <div
                          className="flex items-center justify-center bg-sky-50/50 shadow-inner"
                          style={{
                            position: "absolute",
                            width: "100%",
                            height: "100%",
                          }}
                        >
                          {!startTimer && (
                            <label className="text-2xl font-semibold text-gray-900">
                              Click on "Start" to begin your screening
                            </label>
                          )}
                          <StartTimer
                            onComplete={startScreening}
                            started={startTimer}
                          />
                        </div>
                      )}

                      <div
                        id="video"
                        className="h-full"
                        style={{ width: "100%" }}
                      >
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          style={{ width: "100%" }}
                        />
                        <audio
                          ref={audioRef}
                          autoPlay
                          muted
                          style={{ display: "none" }}
                        />
                      </div>

                      <div
                        className="flex w-full justify-end space-x-4 px-4"
                        style={{
                          position: "absolute",
                          bottom: "3%",
                          right: "0%",
                          zIndex: 1,
                        }}
                      >
                        <div
                          id="questionBox"
                          className={`${
                            showStructure && "bg-indigo-300"
                          } flex items-center w-5/6 justify-end min-w-0 gap-x-4 `}
                        >
                          <div
                            id="questionBubble"
                            style={{ minWidth: "90%" }}
                            className="min-w-0 bg-gray-50  w-full h-28 flex justify-between border-2 border-blue-400/55 rounded-se-none shadow-md rounded-2xl p-3"
                          >
                            <div
                              className={`w-4/5 h-full ${
                                showStructure && "bg-amber-300"
                              }`}
                            >
                              <div className="flex gap-x-2">
                                <span className="me-2 text-sm font-medium text-gray-600">
                                  Interviewer{" "}
                                  <span className="text-sky-500 font-semibold">
                                    Axel
                                  </span>
                                </span>
                                <div class="w-px bg-gray-300 h-5"></div>
                                <span className="me-2 text-sm font-medium text-gray-600">
                                  Total Questions{" "}
                                  <span className="text-sky-500 font-semibold">
                                    {questions?.length || 0}
                                  </span>
                                </span>
                                <div class="w-px bg-gray-300 h-5"></div>
                                <span className="me-2 text-sm font-medium text-gray-600">
                                  Total Estimated time{" "}
                                  <span className="text-sky-500 font-semibold">
                                    {estimatedTime}s
                                  </span>
                                </span>
                                <div class="w-px bg-gray-300 h-5"></div>
                                <span className="me-2 text-sm font-medium text-gray-600">
                                  Format{" "}
                                  <span className="text-sky-500 font-semibold">
                                    video
                                  </span>
                                </span>
                              </div>
                              <>
                                <div className="flex gap-x-4 mt-2">
                                  <span className="me-2 text-sm font-medium text-gray-600">
                                    Question
                                  </span>
                                  {/* <span className="text-sm text-gray-600 inline-flex space-x-3">11:15pm </span> */}
                                  <span>
                                    <TextToSpeech
                                      isSpeaking={isSpeaking}
                                      setIsSpeaking={setIsSpeaking}
                                      text={currentQuestion?.text}
                                    />
                                  </span>
                                </div>
                                <label className=" text-base block font-bold  text-gray-800">
                                  {currentQuestion && currentQuestion?.text}
                                </label>
                              </>
                            </div>
                            <div
                              className={`w-1/6 flex flex-col justify-between items-end h-full px-2 ${
                                showStructure && "bg-green-300"
                              }`}
                            >
                              <label className=" w-full space-x-1 inline-flex items-center justify-end text-sm">
                                {currentQuestion && (
                                  <span className="text-blue-600 font-medium">
                                    {!isSpeaking && isRecording && (
                                      <CountdownTimer
                                        submittingAnswer={submittingAnswer}
                                        initialTime={currentQuestion.time_limit}
                                        onTimerFinish={stopRecording}
                                        currentQuestionIndex={
                                          currentQuestionIndex
                                        }
                                        isSubmitted={isSubmitted}
                                      />
                                    )}
                                  </span>
                                )}
                              </label>
                              {currentQuestionIndex === null ? (
                                <button
                                  disabled={error}
                                  onClick={() => setStartTimer(true)}
                                  className="bg-brand-purple text-white w-32 px-3 py-2 rounded-xl shadow-sm "
                                >
                                  Start
                                </button>
                              ) : (
                                askedQuestions &&
                                questions &&
                                askedQuestions.length !== questions.length && (
                                  <>
                                    {isSubmitted ? (
                                      <button
                                        disabled={error}
                                        onClick={nextQuestion}
                                        className="bg-emerald-500 text-white w-32 px-3 py-2 rounded-xl shadow-md ring-1 ring-emerald-400 "
                                      >
                                        Next
                                      </button>
                                    ) : (
                                      <button
                                        disabled={isSpeaking || error}
                                        onClick={stopRecording}
                                        className="bg-primary-600 disabled:bg-sky-400 text-white w-32 px-3 py-2 rounded-xl shadow-sm "
                                      >
                                        Submit
                                      </button>
                                    )}
                                  </>
                                )
                              )}
                              {/* <button onClick={stopRecording} className="bg-primary-600 text-white w-32 px-3 py-2 rounded-xl shadow-sm ">Stop</button> */}
                            </div>
                          </div>
                        </div>

                        <div className=" rounded-lg pe-4">
                          {isSpeaking ? (
                            <div className="w-32 h-32 rounded-full shadow-xl ring-4 overflow-hidden flex items-center justify-center">
                              <VoiceAnimation />
                            </div>
                          ) : (
                            <div className="w-32 h-32 bg-gray-200 rounded-full shadow-xl ring-4 overflow-hidden flex items-center justify-center">
                            <div id="bars" className="">
                              <div class="bar2"></div>
                              <div class="bar2"></div>
                              <div class="bar2"></div>
                              <div class="bar2"></div>
                              {/* <div class="bar"></div> */}
                            </div>
                          </div>
                          )}
                          {/* {/* <img
                            ref={imageRef}
                            className=" w-32 h-32 rounded-full shadow-xl ring-4"
                            src={Axel}
                            alt="Image"
                          /> */}
                          {/* <div className="w-32 h-32 rounded-full shadow-xl ring-4 overflow-hidden flex items-center justify-center">
                            <VoiceAnimation />
                          </div> */}
                        </div>
                      </div>
                    </div>
                  </section>
                  <section
                    id="chatContainer"
                    className="w-1/4  h-full rounded-xl border overflow-hidden ring-2 ring-sky-400/70 bg-white"
                  >
                    <div id="chat-header" className="px-5 py-4 border-b ">
                      <label className="text-lg pe-2 font-medium ">
                        Questions Asked{" "}
                      </label>
                      <label className="text-sm text-gray-500">
                        {askedQuestions.length}/{questions.length}
                      </label>
                      {/* <SpeechToText /> */}
                    </div>
                    <div id="chat-body" className=" h-full  ">
                      <ul className="chat h-5/6 overflow-auto px-2 flex flex-col items-start w-full pt-5">
                        {askedQuestions &&
                          askedQuestions.length > 0 &&
                          askedQuestions.map((question, index) => (
                            <>
                              <ChatBubble
                                key={index + "chat"}
                                question={question}
                                index={index}
                              />
                              <AudioBubble
                                key={index + "audio"}
                                question={question}
                                index={index}
                                audioURL={audioAnswers[question.id]}
                                submitted={submittedAnswers[question.id]}
                              />
                            </>
                          ))}
                      </ul>
                    </div>
                  </section>
                </div>
              )}
            </main>
          )}

          {/* <footer style={{ height: '82px' }} className="mt-3 w-full rounded-xl bg-indigo-400">

                    </footer> */}
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export default VideoComponent;
