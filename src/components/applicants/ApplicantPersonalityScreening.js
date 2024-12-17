import {
  PauseIcon,
  PlayIcon,
} from "@heroicons/react/20/solid";
import { useContext, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { ClockIcon } from "@heroicons/react/24/outline";
import { api, selectStyle } from "../../constants/constants";
import Select from "react-select";
import AuthContext from "../../context/AuthContext";

const ApplicantPersonalityScreening = ({  setStages, jobTitle, jobId }) => {
  const { authTokens, userDetails } = useContext(AuthContext);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [screeningDetails, setScreeningDetails] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const { applicantId, serviceId } = useParams();
  const [statusText, setStatusText] = useState("Review Pending");

  const audioRef = useRef(null);
  const [answerMode, setAnswerMode] = useState({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioURL, setAudioURL] = useState({});
  const [videoURL, setVideoURL] = useState({});
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(null);

  const [statuses, SetStatuses] = useState([
    {
      label: "Shortlisted",
      value: "shortlist",
    },
    {
      label: "Not Shortlisted",
      value: "unshortlist",
    },
    {
      label: "Under Review",
      value: "under-review",
    },
    {
      label: "On Hold",
      value: "on-hold",
    },
  ]);

  useEffect(() => {
    if (applicantId && jobId) {
      setAnswers([]);
      setSelectedAnswer(null);
      setScreeningDetails([]);
      fetchCandidateAnswers(applicantId);
    }
  }, [applicantId, jobId]);

  useEffect(() => {
    if (selectedStatus) {
      updateStatus(selectedStatus.label);
    }
  }, [selectedStatus]);

  useEffect(() => {
    const audio = audioRef?.current;

    // Sync isPlaying state when audio is manually paused or played
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    // Add event listeners to keep isPlaying state in sync with actual audio state
    audio?.addEventListener("play", handlePlay);
    audio?.addEventListener("pause", handlePause);

    // Cleanup event listeners on unmount
    return () => {
      audio?.removeEventListener("play", handlePlay);
      audio?.removeEventListener("pause", handlePause);
    };
  }, [jobId]);

  async function updateStatus(status_text) {
    setUpdatingStatus(true);
    const testLogId = screeningDetails?.id;
    const payload = {
      status_text: status_text,
      updated_by: userDetails?.id,
      updated_at: new Date(),
    };

    if (status_text && status_text === "Shortlisted") {
      payload["approved_by"] = userDetails?.id;
      payload["approved_at"] = new Date();
      payload["is_approved"] = true;
    }
    if (status_text && status_text === "Not Shortlisted") {
      payload["approved_by"] = null;
      payload["approved_at"] = null;
      payload["is_approved"] = false;
    }

    try {
      const response = await fetch(`${api}/personality-screening/personality-screenings/${screeningDetails?.id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + String(authTokens.access),
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      if (data) {
        setStatusText(data.status_text);
        setScreeningDetails((prev) => ({
          ...prev,
          status_text: data.status_text,
          is_approved: data.is_approved,
          approved_by: data.approved_by,
          approved_at: data.approved_at,
          updated_by: data.updated_by,
          updated_at: data.updated_at,
        }));
        setStages((prev) =>
          prev.map((stage) => {
            if (stage?.key === "assessment") {
              return {
                ...stage,
                completed: data["completed"] ?? false,
                is_approved: data["is_approved"] ?? false,
                approved_by: data["approved_by"] ?? null,
                updated_by: data["updated_by"] ?? null,
                updated_at: data["updated_at"] || null,
                status_text: data["status_text"] ?? "",
              };
            } else {
              return stage;
            }
          })
        );
        setUpdatingStatus(false);
      }
    } catch (error) {
      console.error(error);
      setError(error.message);
      setUpdatingStatus(false);
    }
  }


  const colorMap = {
    Angry: "#d62828",
    Sad: "#eae2b7",
    Fear: "#fcbf49",
    Happy: "#06d6a0",
    Neutral: "#778da9",
    Surprise: "#70d6ff",
  };

  async function fetchCandidateAnswers(applicantId) {
    // Define the URL for the API endpoint
    const answerUrl = `${api}/interview/candidate/${applicantId}/job/${jobId}/service/${serviceId}/answers/`;
    try {
      const [answersResponse, screeningDetailsResponse] = await Promise.all([
        fetch(answerUrl),
        fetch(`${api}/personality-screening/detail/${applicantId}/`),
      ]);

      if (!answersResponse.ok) {
        throw new Error("Failed to fetch answers data");
      }

      const data = await answersResponse.json();

      // console.log(answersResponse);
      if (data?.results?.length) {
        setAnswers(data.results);
        setSelectedAnswer(data.results[data.results.length - 1]);
      }
      if (!screeningDetailsResponse.ok) {
        setError(screeningDetailsResponse.json()["error"]);
        throw new Error("Failed to fetch screening details data");
      }
      const screeningDetailsData = await screeningDetailsResponse.json();
      setScreeningDetails(screeningDetailsData);
    } catch (error) {
      // Handle errors
      console.error(error);
    }
  }

  // console.log("answerMode : ", answerMode);

  function getAnswerMedia(answerId, format) {
    setAnswerMode({ ...answerMode, [answerId]: format });

    // if (format === "audio") {
    //     console.log(audioURL[answerId], answerId)
    //     if (!audioURL[answerId]) {
    //         fetchAudio(answerId)
    //     }
    // }
    // if (format === "video") {
    //     if (!videoURL[answerId]) {
    //         fetchVideo(answerId)
    //     }
    // }
  }

  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <>
      <div className=" p-4 h-full w-full ">
        <div className="px-2 flex justify-between items-center">
          <div>
          <h3 className="mt-2 text-base font-semibold leading-7 text-gray-900">
            Automated Video Interview Analysis
          </h3>
          <p className=" max-w-2xl text-sm leading-6 text-gray-500">
            Review video, audio, transcript and insights powered by AI
          </p>
          </div>

          <div className="flex items-center gap-2">
                  <label
                    className={`flex bg-blue-50 ring-1 me-3 my-2 px-3 py-1 rounded-lg font-normal
                      ${
                        screeningDetails?.status_text === "Under Review" &&
                        "bg-yellow-50 text-yellow-700 ring-yellow-700/40"
                      }
                        ${
                          screeningDetails?.status_text === "Shortlisted" &&
                          "bg-green-50 text-green-700 ring-green-700/40"
                        }
                        ${
                          screeningDetails?.status_text === "Not Shortlisted" &&
                          "bg-red-50 text-red-700 ring-red-700/40"
                        }
                        ${
                          screeningDetails?.status_text === "On Hold" &&
                          "bg-orange-50 text-orange-700 ring-orange-700/40"
                        }
                        ${
                          screeningDetails?.status_text === "Completed" &&
                          "bg-green-50 text-green-700 ring-green-700/40"
                        }
            `}
                  >
                    Status :{" "}
                    {updatingStatus ? (
                      <span className="px-1"> Updating</span>
                    ) : (
                      screeningDetails?.status_text
                    )}
                  </label>
                  <Select
                    isDisabled={updatingStatus || !screeningDetails?.completed}
                    className="w-5/6 md:w-72"
                    styles={selectStyle}
                    value={selectedStatus}
                    isSearchable={false}
                    onChange={(selectedOption) =>
                      setSelectedStatus(selectedOption)
                    }
                    options={statuses}
                    placeholder={
                      screeningDetails?.completed
                        ? "Mark as"
                        : "Not Completed Yet"
                    }
                  />
                </div>
        </div>
        {answers && answers.length > 0 && (
          <>
            <div className="flex gap-x-2 mt-6 border-t  border-gray-100 h-auto ">
              <div className="w-[60%] h-full">
                <div className="w-full p-4 flex bg-white flex-col gap-4 rounded-lg overflow-auto shadow-md h-full mt-3">
                  {selectedAnswer ? (
                    <>
                      <div className="pt-2 pb-3 border-b flex justify-between items-center h-auto">
                        <div className="flex items-center gap-1">
                          <ClockIcon className="w-4 h-4 me-1" />
                          <span>
                            {parseInt(selectedAnswer.duration || 0)}s /{" "}
                            {selectedAnswer.question.time_limit}s
                          </span>
                        </div>
                      </div>
                      <div className="w-full overflow-auto p-3 flex flex-col gap-4 mt-2">
                        {/* Video Section */}
                        <div className="w-full ">
                          <video
                            src={selectedAnswer.video_file}
                            controls
                            className="w-full bg-black flex items-center rounded-xl shadow-lg ring-2 ring-gray-400"
                            aria-label="Video response"
                          ></video>
                        </div>

                        {/* Audio and Transcript Section */}
                        <div className="w-full flex flex-col gap-4">
                          {/* Transcript */}

                          <label className="font-medium text-normal ">
                            <span className="block text-gray-500 text-sm">
                              Question
                            </span>
                            {selectedAnswer.question.text}
                          </label>
                          <label className="block text-gray-500 text-sm">
                            Response
                          </label>
                          <div className="border rounded-lg p-4 flex items-start justify-start gap-2 overflow-auto shadow-sm text-sm text-gray-700">
                            <audio
                              className="w-full"
                              // controls
                              ref={audioRef}
                              src={selectedAnswer.audio_file}
                              type="audio/wav"
                              aria-label="Audio response"
                            />
                            <button
                              type="button"
                              onClick={togglePlayPause}
                              className={` bg-gray-100/80 flex items-center justify-center hover:bg-gray-200 ring-1 p-1 ring-gray-300 hover:ring-2 hover:ring-gray-500 rounded-full ${
                                isPlaying ? "glowing" : ""
                              }`}
                            >
                              {isPlaying ? (
                                <PauseIcon className="w-6 h-6" />
                              ) : (
                                <PlayIcon className="w-6 h-6" />
                              )}
                            </button>
                            <p>{selectedAnswer.text}</p>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
              <div className="w-[40%] p-4 rounded-lg bg-white shadow-md  mt-3 h-full">
                <label className="font-medium">Questions List</label>
                <div className=" mt-3 flex flex-col gap-2  h-[90%] overflow-auto p-2">
                  {answers.length > 0 &&
                    answers.map((answer, index) => (
                      <div
                        className={` gap-2 p-2 flex items-start justify-start rounded-lg ${
                          selectedAnswer.id === answer.id
                            ? "bg-sky-50 ring-2 ring-sky-200"
                            : "bg-gray-50"
                        }`}
                      >
                        <div>
                          <video
                            controls
                            className="w-64 max-w-56 h-32 bg-black flex items-center rounded-xl shadow-lg ring-2 ring-gray-400"
                            aria-label="Video response"
                            src={answer?.video_file || ""}
                          ></video>
                        </div>
                        <div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedAnswer(answer);
                              setIsPlaying(false);
                            }}
                            className={`gap-2 p-2 flex items-start justify-start `}
                          >
                            <span className="text-start text-[0.9rem] text-blue-700">
                              {answer.question.text}
                            </span>
                          </button>
                          <p className="px-2 m-0 text-gray-500 text-sm">
                          {parseFloat(answer.duration || 0).toFixed(2)}s
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
            {/* Analytics */}
            {/* <div className="w-full p-4  rounded-lg mt-3">
              <div className="flex flex-wrap  gap-5 justify-start">
                {selectedAnswer?.audio_analysis?.length > 0 &&
                  selectedAnswer.audio_analysis.map((metric, index) => {
                    if (index < 4) {
                      return (
                        <div
                          key={index}
                          className="bg-white hover:scale-[1.02]  hover:shadow-lg transition-all duration-500 ease-out transform rounded-lg shadow-md p-5 w-full lg:w-1/2 max-w-2xl lg:max-w-1/3 h-80 flex flex-col justify-between"
                        >
                          <label className="font-semibold flex items-center gap-x-2 text-base text-gray-700">
                            {metric.field}{" "}
                            <InformationCircleIcon
                              title={metric.description}
                              className="w-5 h-5"
                            />
                          </label>

                          <div className="mt-4 flex items-center justify-center w-full gap-4">
                            <div className="h-32 w-1/2 flex justify-center">
                              <MetricPie data={metric} />
                            </div>
                            <div className="w-1/2 h-32 flex flex-col gap-2">
                              <label className="flex items-center gap-x-2 text-sm text-gray-500">
                                <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                                <span>Ideal Range</span>
                                <span className="text-gray-600">
                                  {metric?.ideal_range?.min} -{" "}
                                  {metric?.ideal_range?.max}
                                </span>
                              </label>
                              <label className="flex items-center gap-x-2 text-sm text-gray-500">
                                <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                                <span>Units</span>
                                <span className="text-gray-600">
                                  {metric?.units}
                                </span>
                              </label>
                            </div>
                          </div>

                          <div className="mt-4 p-3 border rounded-lg bg-gray-50 h-24">
                            <label className="text-sm font-medium text-gray-600">
                              AI Summary
                            </label>
                            <p className="text-gray-500 text-sm  text-ellipsis max-h-12 overflow-auto">
                              {metric.ai_summary || "No summary available."}
                            </p>
                          </div>
                        </div>
                      );
                    }
                  })}
              </div>
            </div> */}
          </>
        )}
      </div>

      {/* <SlideOver
        open={open}
        selectedAnswer={selectedAnswer}
        onClose={onDetailViewClose}
      /> */}
    </>
  );
};

export default ApplicantPersonalityScreening;
