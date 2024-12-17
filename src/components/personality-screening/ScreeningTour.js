import { Fragment, useEffect, useRef, useState } from "react";
import VideoNavbar from "../../utils/navbar/VideoNavbar";
import ChatBubble from "../../utils/chat-bubbles/ChatBubble";
import "./Video.css";
import { useNavigate, useParams } from "react-router-dom";
import TextToSpeech from "./TextToSpeech";
import AudioBubble from "../../utils/chat-bubbles/AudioBubble";
import CountdownTimer from "./CountdownTimer";
import StartTimer from "./StartTimer";
import Axel from "../../assets/axel.jpg";
import SpinLoader from "../../utils/loaders/SpinLoader";
const ScreeningTour = () => {
  const { candidateId, screeningId } = useParams();
  const [showStructure, setShowStructure] = useState(false);
  const videoRef = useRef(null);
  const audioRef = useRef(null); // Add a ref for the audio element
  const imageRef = useRef(null);

  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);

  const [audioChunks, setAudioChunks] = useState([]);
  const [permission, setPermission] = useState(false);
  const audioMediaRecorder = useRef(null);
  const videoMediaRecorder = useRef(null);
  const [audioStream, setAudioStream] = useState(null);
  const [videoStream, setVideoStream] = useState(null);
  const [audioAnswers, setAudioAnswers] = useState({});
  const [submittedAnswers, setSubmittedAnswers] = useState({});
  const [video, setVideo] = useState(null);

  const [videoQuality, setVideoQuality] = useState("medium");
  const [candidate, setCandidate] = useState(null);
  const [screeningDetails, setScreeningDetails] = useState(null);
  const [questions, setQuestions] = useState([
    {
      id: 4,
      text: "How much is 1 + 1?",
      type: "text",
      time_limit: 5,
      created_at: "2024-03-18T13:30:07.610592Z",
      question_set: 2,
      created_by: 1,
    },
    {
      id: 5,
      text: "How was your day?",
      type: "text",
      time_limit: 5,
      created_at: "2024-03-18T13:31:52.184905Z",
      question_set: 2,
      created_by: 1,
    },
    {
      id: 8,
      text: "Talk about pizza for 30 seconds.",
      type: "video",
      time_limit: 5,
      created_at: "2024-04-08T09:19:51.370981Z",
      question_set: 2,
      created_by: 1,
    },
  ]);
  const [askedQuestions, setAskedQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completedText, setCompletedText] = useState("");

  const [startTimer, setStartTimer] = useState(false);
  const [started, setStarted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const [submittingAnswer, setSubmittingAnswer] = useState(false);

  const navigate = useNavigate();
  console.count("<<< Screening Tour >>>");
  let estimatedTime = 30;

  useEffect(() => {
    // console.count("fetching data");
    fetchCandidateAndScreeningDetails();
  }, [candidateId, screeningId]);

  useEffect(() => {
    if (currentQuestion && !isSpeaking) {
      // console.log(
      //   "recording started aagain........................................."
      // );
      startRecording();
    }
  }, [isSpeaking]);

  useEffect(() => {
    if (!isRecording && recordedChunks.length > 0) {
      // console.log("useeffect run")
      submitAnswer();
    } else {
      // console.log("useeffect else :::", recordedChunks.length, isRecording)
    }
  }, [recordedChunks, isRecording]);

  useEffect(() => {
    if (
      askedQuestions &&
      questions &&
      askedQuestions.length === questions.length
    ) {
      // markAsComplete()
      videoStream.getTracks().forEach((track) => track.stop());
      audioStream.getTracks().forEach((track) => track.stop());

      setCurrentQuestion(null);
      setCurrentQuestionIndex(null);
      stopRecording();
      // console.log(audioStream, videoStream);
      setIsCompleted(true);
      setCompletedText("You have successfully completed the tour!");
    }
  }, [askedQuestions, questions]);

  const startRecording = async () => {
    const startTime = performance.now(); // Record the start time
    if (!audioStream && !videoStream) {
      // console.log("creating new stream...............................");
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
      // console.log("audio ", event.data);
      if (typeof event.data === "undefined") return;
      if (event.data.size === 0) return;
      localAudioChunks.push(event.data);
      setAudioChunks(localAudioChunks);
    };

    let localVideoChunks = [];
    videoMediaRecorder.current.ondataavailable = (event) => {
      // console.log("video ", event.data);
      if (typeof event.data === "undefined") return;
      if (event.data.size === 0) return;
      localVideoChunks.push(event.data);
      setRecordedChunks(localVideoChunks);
    };
    const endTime = performance.now();
    const timeTaken = endTime - startTime;
    // console.log(
    //   "Time taken to complete startRecording:",
    //   timeTaken,
    //   "milliseconds"
    // );
    // streamData2.getTracks().forEach(track => track.stop());
  };

  const stopRecording = async () => {
    //stops the recording instance
    if (audioMediaRecorder.current && videoMediaRecorder.current) {
      await videoMediaRecorder.current.stop();
      await audioMediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  // const stopRecording = () => {
  //     if (audioMediaRecorder.current && videoMediaRecorder.current) {
  //         audioMediaRecorder.current.stop();
  //         videoMediaRecorder.current.stop();
  //         setAudioStream(null);
  //         setVideoStream(null);
  //         setAudioChunks([]);
  //         setRecordedChunks([]);
  //         setIsRecording(false);
  //     }
  // };

  const fetchCandidateAndScreeningDetails = async () => {
    setLoading(true);

    if (candidateId && screeningId) {
      const headers = {
        "Content-Type": "application/json",
        // Authorization: "Bearer " + String(authTokens.access),
      };

      try {
        const [candidateResponse, screeningResponse] = await Promise.all([
          fetch(`/candidates/candidate-details/${candidateId}/`, {
            method: "GET",
            headers: headers,
          }),
          fetch(
            `/personality-screening/personality-screenings/${screeningId}/`,
            {
              method: "GET",
              headers: headers,
            }
          ),
        ]);

        if (!candidateResponse.ok || !screeningResponse.ok) {
          // console.log(screeningResponse);
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
        // console.log(screeningData?.step?.completed);

        if (screeningData?.step?.completed) {
          setIsCompleted(true);
          setCompletedText("We have already received your response.");
          setLoading(false);
        } else {
          setLoading(false);
        }
        // Process both candidateData and screeningData as needed

        // Update state or perform further actions
      } catch (error) {
        setLoading(false);
        console.log(error);
        setError(error);
      }
    }
  };

  const startScreening = async () => {
    try {
      setStartTimer(false);
      setStarted(true);
      await startRecording();
      setCurrentQuestionIndex(0);
      setCurrentQuestion(questions[0]);
     
    } catch (error) {
      console.log(error);
    }
  };

  const nextQuestion = async () => {
    setIsSubmitted(false);
    if (
      currentQuestionIndex !== null &&
      currentQuestionIndex < questions.length - 1
    ) {
      // await startRecording()
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1); // Move to the next question index
      setCurrentQuestion(questions[currentQuestionIndex + 1]); // Set the next question
    } else {
      // Handle the case when there are no more questions (end of questionnaire)

    }
  };

  const submitAnswer = async () => {
    try {
      setSubmittingAnswer(true);
      // if (recordedChunks.length) {
      const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
      const url = URL.createObjectURL(audioBlob);

      // console.log("audioFile :", audioChunks, recordedChunks)

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
      } else {
        // Handle the case when there are no more questions (end of questionnaire)
        setCurrentQuestion(null);
      }

      setSubmittingAnswer(false);
    } catch (error) {
      console.error("Error creating answer:", error);
      setSubmittingAnswer(false);

      throw error;
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

      // const response = await fetch(`/interview/update-step/`, {
      //     method: 'POST',
      //     headers: {
      //         "Content-Type": "application/json",
      //     },
      //     body: JSON.stringify(stepdata),
      // });

      // if (!response.ok) {
      //     throw new Error('Failed to create answer');
      // }

      // const responseData = await response.json();
      // console.log(responseData)
    }
  };

  const redirectToScreening = async () => {
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

      navigate(
        `/app/candidate/personality-screening/${candidateId}/${screeningId}/start/`
      );
      setLoading(false);
      // Process both candidateData and screeningData as needed

      // Update state or perform further actions
    } catch (error) {
      setLoading(false);
      console.error(error);
      setError(error);
    }
  };

  // console.log(currentQuestionIndex, questions?.length, askedQuestions?.length, screeningDetails)
 

  return (
    <>
      <div className="h-screen w-full bg-transparent md:bg-gray-50 overflow-hidden">
        {submittingAnswer && (
          <div className="absolute bg-gray-200 opacity-70 w-full h-full z-20 flex items-center justify-center">
            <SpinLoader loadingText={"Submitting Answer"} fill={"blue"} />
          </div>
        )}
        <header>
          <VideoNavbar candidateName={candidate?.name || ""} />
        </header>
        <div className="p-4 ">
          {!loading && (
            <main
              style={{ height: "calc(100dvh - 90px)" }}
              className="mt-14 w-full flex justify-between items-center space-x-4 "
            >
              {isCompleted ? (
                <div className="absolute top-0 left-0 min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-[#7474f4] to-[#a5a5fa] px-6 py-12 overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 z-0"></div>
                  <div class="background-svg bottom-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 1440 320"
                    >
                      <path
                        fill="#7474f4"
                        fill-opacity="1"
                        d="M0,64L48,53.3C96,43,192,21,288,64C384,107,480,213,576,229.3C672,245,768,171,864,165.3C960,160,1056,224,1152,234.7C1248,245,1344,203,1392,181.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                      ></path>
                    </svg>
                  </div>
                  <div className="relative z-10 bg-white  shadow-lg rounded-lg overflow-hidden w-full h-52 max-w-3xl p-8 ">
                    {/* <img className="mx-auto h-12" src="https://tailwindui.com/img/logos/workcation-logo-indigo-600.svg" alt="" /> */}
                    <div class="text-container h-full w-full relative z-10 text-center flex flex-col items-center justify-center">
                      <label className="mb-5 block">{completedText}</label>
                      {started ? (
                        <div>
                          <button
                            type="button"
                            onClick={() => redirectToScreening()}
                            className=" w-40 text-base text-white font-medium px-2.5 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500"
                          >
                            Start Screening
                          </button>
                        </div>
                      ) : (
                        <p className="text-base text-gray-500 ">
                          Our team will update you with further steps.
                        </p>
                      )}
                    </div>
                   
                  </div>
                </div>
              ) : (
                <>
                  <section
                    id="videoContainer"
                    className="w-4/5 h-full rounded-xl border-2 overflow-hidden "
                  >
                    <div
                      className=""
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
                        className="h-full "
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
                        {/* <button onClick={markAsComplete}>Complete</button> */}
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
                          } flex items-end w-5/6 justify-end min-w-0 gap-x-4 `}
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
                                <div className="w-px bg-gray-300 h-5"></div>
                                <span className="me-2 text-sm font-medium text-gray-600">
                                  Total Questions{" "}
                                  <span className="text-sky-500 font-semibold">
                                    {questions.length}
                                  </span>
                                </span>
                                <div className="w-px bg-gray-300 h-5"></div>
                                <span className="me-2 text-sm font-medium text-gray-600">
                                  Total Estimated time{" "}
                                  <span className="text-sky-500 font-semibold">
                                    {estimatedTime}s
                                  </span>
                                </span>
                                <div className="w-px bg-gray-300 h-5"></div>
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
                              className={`w-1/5 flex flex-col justify-between items-end h-full px-2 ${
                                showStructure && "bg-green-300"
                              }`}
                            >
                              <label className=" w-full space-x-1 inline-flex items-center justify-end text-sm">
                                {currentQuestion && (
                                  <span className="text-blue-600 font-medium">
                                    {!isSpeaking && isRecording && (
                                      <CountdownTimer
                                        initialTime={currentQuestion.time_limit}
                                        onTimerFinish={stopRecording}
                                        currentQuestionIndex={
                                          currentQuestionIndex
                                        }
                                        isSubmitted={isSubmitted}
                                      />
                                    )}{" "}
                                  </span>
                                )}
                              </label>
                              {currentQuestionIndex === null ? (
                                <button
                                  onClick={() => setStartTimer(true)}
                                  className="bg-primary-600 text-white w-32 px-3 py-2 rounded-xl shadow-sm "
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
                                        onClick={nextQuestion}
                                        className="bg-emerald-500 text-white w-32 px-3 py-2 rounded-xl shadow-md ring-1 ring-emerald-400 "
                                      >
                                        Next
                                      </button>
                                    ) : (
                                      <button
                                        disabled={isSpeaking}
                                        onClick={stopRecording}
                                        className="bg-primary-600 disabled:bg-sky-300 text-white w-32 px-3 py-2 rounded-xl shadow-sm "
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
                          <img
                            ref={imageRef}
                            className=" w-32 h-32 rounded-full shadow-xl ring-4"
                            src={Axel}
                            alt="Image"
                          />
                        </div>
                      </div>
                    </div>
                  </section>
                  <section
                    id="chatContainer"
                    className="w-1/4 h-full rounded-xl border overflow-hidden ring-2 ring-sky-400/70"
                  >
                    <div
                      id="chat-header"
                      className="px-5 py-4 border-b bg-white"
                    >
                      <label className="text-lg font-medium text-gray-700">
                        Questions Asked{" "}
                      </label>
                      <label className="text-sm text-gray-500">
                        {askedQuestions.length}/{questions.length}
                      </label>
                      {/* <SpeechToText /> */}
                    </div>
                    <div id="chat-body" className=" h-full  bg-gray-100/60">
                      <ul className="chat h-5/6 overflow-auto px-2 flex flex-col items-start w-full pt-5">
                        {askedQuestions &&
                          askedQuestions.length > 0 &&
                          askedQuestions.map((question, index) => (
                            <Fragment key={question.id}>
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
                            </Fragment>  
                          ))}
                      </ul>
                    </div>
                  </section>
                </>
              )}
            </main>
          )}
        </div>
      </div>
    </>
  );
};

export default ScreeningTour;
