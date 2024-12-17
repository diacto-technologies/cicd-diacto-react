import {
  CheckBadgeIcon,
  HandThumbUpIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";
import { useContext, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { api, maskNumber, selectStyle } from "../../constants/constants";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  MinusCircleIcon,
} from "@heroicons/react/24/outline";
import UpdateStatusAndEmailModal from "./action-modals/UpdateStatusAndEmailModal";
import Select from "react-select";
import AuthContext from "../../context/AuthContext";
import TranscriptTimeline from "./TranscriptTimeline";
import AudioPlayer from "./AudioPlayer";
import { StarIcon } from "@heroicons/react/24/solid";

const ApplicantResumeCopy = ({
  setStages,
  jobId,
  scores,
  applicant,
  resumeDetail,
  setResumeDetail,
}) => {
  const [errorMessage, setErrorMessage] = useState("");
  const { authTokens, userDetails, user } = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);
  const [showScoringInfo, setShowScoringInfo] = useState(true);
  const [answers, setAnswers] = useState([]);
  const [criteriaResponses, setCriteriaResponses] = useState([]);
  const [isMasked, setIsMasked] = useState(true);
  const { applicantId, serviceId } = useParams();

  const audioRef = useRef(null);
  const [answerMode, setAnswerMode] = useState({});
  const [audioURL, setAudioURL] = useState({});

  const [resumeScreeningStatuses, SetResumeScreeningStatuses] = useState([
    {
      label: "Shortlist",
      value: "shortlist",
    },
    {
      label: "Not Shortlist",
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
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const relevanceOrder = {
    high: 1,
    medium: 2,
    low: 3,
  };

  useEffect(() => {
    if (applicant && jobId) {
      fetchCandidateAnswers(applicant.id);
      fetchCandidateCriteriaResponse();
    }
  }, [applicant, jobId]);

  useEffect(() => {
    if (
      selectedStatus &&
      (selectedStatus.value === "shortlist" ||
        selectedStatus.value === "unshortlist")
    ) {
      setShowModal(true);
    } else if (
      selectedStatus &&
      (selectedStatus.value === "under-review" ||
        selectedStatus.value === "on-hold")
    ) {
      updateCandidateStatus(selectedStatus.label, resumeDetail);
    }
  }, [selectedStatus]);

  async function fetchCandidateAnswers(applicantId) {
    // Define the URL for the API endpoint
    const answerUrl = `${api}/interview/candidate/${applicantId}/job/${jobId}/service/${serviceId}/answers/`;
    try {
      const [answersResponse] = await Promise.all([fetch(answerUrl)]);

      if (!answersResponse.ok) {
        throw new Error("Failed to fetch answers data");
      }

      const data = await answersResponse.json();

      if (data?.results?.length) {
        setAnswers(data.results);
        setAnswerMode((prev) => {
          const newData = data?.results?.reduce((acc, answer) => {
            acc[answer.id] = "text";
            return acc;
          }, {});
          //console.log(newData);
          return { ...prev, ...newData };
        });
      }

      // if (!screeningDetailsResponse.ok) {
      //     throw new Error('Failed to fetch screening details data');
      // }
      // const screeningDetailsData = await screeningDetailsResponse.json();
      // setScreeningDetails(screeningDetailsData);
    } catch (error) {
      // Handle errors
      console.error(error);
    }
  }

  const updateCandidateStatus = async (statusText, resumeDetail) => {
    setUpdatingStatus(true);

    const payload = {
      status_text: statusText,
    };

    payload["is_approved"] = statusText === "Shortlisted" ? true : false;
    payload["updated_by"] = user.id;
    payload["updated_at"] = new Date();

    if (resumeDetail?.id) {
      try {
        const response = await fetch(
          `${api}/resume_parser/resumes/${resumeDetail?.id}/`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + String(authTokens.access),
            },
            body: JSON.stringify(payload),
          }
        );
        const data = await response.json();
        if (response.ok) {
          //console.log("successfully updated : ", data)
          if (data) {
            setResumeDetail((prev) => ({
              ...prev,
              status_text: data.status_text,
            }));
            setStages((prev) =>
              prev.map((stage) => {
                if (stage?.key === "resume-screening") {
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
          // setMessage(data.message);
        } else {
          setErrorMessage(data.error);
          setUpdatingStatus(false);
        }
      } catch (error) {
        console.error("Error updating status:", error);
        setErrorMessage("An error occurred while updating status.");
        setUpdatingStatus(false);
      }
    }
  };

  const fetchCandidateCriteriaResponse = async () => {
    const answerUrl = `${api}/jobs/candidate-responses/?candidate_id=${applicant?.id}`;
    try {
      const response = await fetch(answerUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + String(authTokens.access),
        },
      });

      if (!response.ok) {
        throw setErrorMessage;
      }

      const data = await response.json();
      setCriteriaResponses(data.results);
      console.log("Criteria Response: ", data);
    } catch (error) {
      console.error("Error fetching criteria response:", error);
      setErrorMessage("An error occurred while fetching criteria response.");
    }
  };

  const getStarsForRelevance = (relevance) => {
    const stars = [];
    let starColor = "";

    switch (relevance) {
      case "high":
        starColor = "text-yellow-500"; // Green for High Relevance
        stars.push(
          ...Array(3).fill(<StarIcon className={`h-5 w-5 ${starColor}`} />)
        );
        break;
      case "medium":
        starColor = "text-yellow-500"; // Blue for Medium Relevance
        stars.push(
          ...Array(2).fill(<StarIcon className={`h-5 w-5 ${starColor}`} />)
        );
        break;
      case "low":
        starColor = "text-yellow-500"; // Gray for Low Relevance
        stars.push(<StarIcon className={`h-5 w-5 ${starColor}`} />);
        break;
      default:
        starColor = "text-yellow-400"; // Default case (no relevance)
        break;
    }

    return stars;
  };

  return (
    <>
      <div className="p-3 w-5/6 text-start flex items-center justify-between">
        <label className="font-semibold text-lg text-sky-700 ">
          Resume Screening
        </label>
        <div className="flex items-center gap-2">
          <label
            className={`flex bg-blue-50 ring-1 me-3 my-2 px-3 py-1 rounded-lg font-normal
             ${
               resumeDetail?.status_text === "Under Review" &&
               "bg-yellow-50 text-yellow-700 ring-yellow-700/40"
             }
               ${
                 resumeDetail?.status_text === "Shortlisted" &&
                 "bg-green-50 text-green-700 ring-green-700/40"
               }
               ${
                 resumeDetail?.status_text === "Not Shortlisted" &&
                 "bg-red-50 text-red-700 ring-red-700/40"
               }
               ${
                 resumeDetail?.status_text === "On Hold" &&
                 "bg-orange-50 text-orange-700 ring-orange-700/40"
               }
              `}
          >
            Status :{" "}
            {updatingStatus ? (
              <span className="px-1"> Updating</span>
            ) : (
              resumeDetail?.status_text
            )}
          </label>
          <Select
            isDisabled={updatingStatus}
            className="w-5/6 md:w-72"
            styles={selectStyle}
            value={selectedStatus}
            isSearchable={false}
            onChange={(selectedOption) => setSelectedStatus(selectedOption)}
            options={resumeScreeningStatuses}
            placeholder="Mark as"
          />
        </div>
      </div>
      <div className="w-5/6 ">
        <div className="md:h-3/4 flex flex-row-reverse gap-5 p-3">
          {/* Score  */}
          <div className="w-2/6 h-full transition-all flex flex-col gap-5">
            {resumeDetail?.introduction_video && (
              <>
                <div className="w-full overflow-x-auto h-fit bg-white border shadow-md rounded-md p-5">
                  <label className="text-base font-semibold leading-7 text-gray-900">
                    Introduction Video
                  </label>
                  <div className="mt-4 w-full flex items-center justify-center">
                    <video
                      src={resumeDetail.introduction_video}
                      controls
                      className="w-5/6  h-48 bg-black flex items-center rounded-xl shadow-lg ring-2 ring-gray-400"
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>
              </>
            )}

            <div className="w-full overflow-x-auto overflow-hidden h-fit bg-white border shadow-md rounded-md  p-5">
              <label className="text-base font-semibold leading-7 text-gray-900 ">
                Score
              </label>
              <div className="mt-4 bg-white shadow-md overflow-hidden rounded-md border">
                <table className="table-auto w-full text-left border-collapse">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 border-b text-sm font-medium text-gray-700">
                        Label
                      </th>
                      <th className="px-4 py-2 border-b text-sm font-medium text-gray-700">
                        Value
                      </th>
                      <th className="px-4 py-2 border-b text-sm font-medium text-gray-700">
                        Weightage
                      </th>
                      <th className="px-4 py-2 border-b text-sm font-medium text-gray-700 text-right">
                        Summary
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {scores &&
                      scores.length > 0 &&
                      scores.map((score, index) => (
                        <tr
                          key={index}
                          className={`${
                            score.label === "Total Score"
                              ? "bg-indigo-500 text-white font-semibold"
                              : ""
                          }`}
                        >
                          {/* Label */}
                          <td className="px-4 py-3 border-b ">{score.label}</td>
                          {/* Value */}
                          <td className="px-4 py-3 border-b  font-bold text-lg">
                            {score.value.toFixed(1) || 0}
                          </td>
                          {/* Weightage */}
                          <td className="px-4 py-3 border-b ">
                            {score.label !== "Total Score" ? (
                              <>{score.weight}%</>
                            ) : (
                              "-"
                            )}
                          </td>
                          {/* Summary */}
                          <td className="px-4 py-3 border-b text-right">
                            <span
                              className={`${score.summary.summaryClass} px-3 py-1 rounded-lg text-xs font-medium`}
                            >
                              {score.label === "Total Score" && (
                                <i
                                  className={`${score.summary.iconClass} me-1`}
                                ></i>
                              )}
                              {score.summary.summaryText}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="w-full overflow-x-auto overflow-hidden h-fit bg-white border shadow-md rounded-md  p-5">
              <label className="text-base font-semibold leading-7 text-gray-900 ">
                Skills
              </label>
              <div className="mt-4 bg-white shadow-md overflow-auto rounded-md border max-h-80">
                <table className="table-auto w-full text-left border-collapse  ">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 border-b text-sm font-medium text-gray-700">
                        Skill Name
                      </th>
                      <th className="px-4 py-2 border-b text-sm font-medium text-gray-700">
                        Relevance
                      </th>
                      <th className="px-4 py-2 border-b text-sm font-medium text-gray-700">
                        Matches with Job
                      </th>
                    </tr>
                  </thead>
                  <tbody className="">
                    {resumeDetail?.skills?.length > 0 &&
                      resumeDetail.skills
                        .sort((a, b) => {
                          const aName =
                            typeof a === "object" && a !== null
                              ? a.name || ""
                              : a;
                          const bName =
                            typeof b === "object" && b !== null
                              ? b.name || ""
                              : b;

                          const isAMatched = resumeDetail.skills_matched.some(
                            (s) => s.name === aName
                          );
                          const isBMatched = resumeDetail.skills_matched.some(
                            (s) => s.name === bName
                          );

                          return isBMatched - isAMatched;
                        })
                        .map((skill, index) => {
                          const skillName =
                            typeof skill === "object" && skill !== null
                              ? skill.name || ""
                              : skill;
                          const relevant =
                            typeof skill === "object" && skill !== null
                              ? skill.relevance || ""
                              : null;

                          const isMatched = resumeDetail.skills_matched.some(
                            (s) => s.name === skillName
                          );

                          return (
                            <tr key={index} className="text-sm">
                              {/* Skill Name */}
                              <td className="px-4 py-3  border-b text-gray-800">
                                {skillName}
                              </td>

                              {/* Relevance */}
                              <td className="px-4 py-3 border-b text-gray-600">
                                {getStarsForRelevance(relevant).map(
                                  (star, index) => (
                                    <span key={index} className="inline-block">
                                      {star}
                                    </span>
                                  )
                                )}
                              </td>

                              {/* Matches with Job */}
                              <td className="px-4 py-3 border-b text-center">
                                {isMatched ? (
                                  <HandThumbUpIcon
                                    className="h-5 w-5 text-indigo-500 inline-block"
                                    title="Matched"
                                  />
                                ) : null}
                              </td>
                            </tr>
                          );
                        })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* <div className="mb-3 w-full p-3 flex justify-between items-start  bg-blue-50 rounded-xl shadow-md">
              <label className="text-xs text-slate-500 font-light w-5/6">
                We utilize a weighted scoring system to compute the overall score,
                which takes into account various factors. The default weights
                assigned to these factors are as follows: <br />
                Skill : <span className="font-bold text-sky-700 mx-1">30%</span> |
                Work Experience :{" "}
                <span className="font-bold text-sky-700 mx-1">30%</span> |
                Projects :{" "}
                <span className="font-bold text-sky-700 mx-1"> 20%</span> |
                Education :{" "}
                <span className="font-bold text-sky-700 mx-1">10%</span> |
                Certifications :{" "}
                <span className="font-bold text-sky-700 mx-1">10%</span>
              </label>
              <button onClick={() => setShowScoringInfo(false)}>
                <XMarkIcon className=" w-4 h-4 " />
              </button>
            </div> */}

          {/* Work Details  */}
          <div className="w-4/6 flex flex-col gap-3">
            <div className="w-full overflow-x-auto overflow-hidden h-fit  bg-white  p-5  border shadow-md rounded-md">
              <h3 className="text-base font-semibold leading-7 text-gray-900">
                Quick Info
              </h3>
              <div className="mt-3 flex gap-6 items-start">
                <div>
                  <label className="text-sm">Relevant Experience</label>
                  <h3 className="mt-2">
                    {resumeDetail?.relevant_experience_in_months ? (
                      <>
                        {resumeDetail.relevant_experience_in_months}
                        <span className="italic text-gray-500 mx-1">
                          months
                        </span>
                      </>
                    ) : (
                      <span className="text-sm italic text-gray-500">
                        No data
                      </span>
                    )}
                  </h3>
                </div>
                <div>
                  <label className="text-sm">Expected Annual Salary</label>
                  <h3 className="mt-2">
                    {resumeDetail?.expected_ctc ? (
                      isMasked ? (
                        maskNumber(resumeDetail.expected_ctc?.toLocaleString())
                      ) : (
                        resumeDetail.expected_ctc?.toLocaleString()
                      )
                    ) : (
                      <span className="text-sm italic text-gray-500">
                        No data
                      </span>
                    )}
                    <button
                      onClick={() => setIsMasked(!isMasked)}
                      className="inline-flex mx-2"
                    >
                      {isMasked ? (
                        <EyeIcon className="w-4 h-4" />
                      ) : (
                        <EyeSlashIcon className="w-4 h-4" />
                      )}
                    </button>
                  </h3>
                </div>
              </div>
            </div>
            <div className="p-6 bg-white shadow rounded-lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Criteria Responses
              </h2>
              {criteriaResponses.length > 0 ? (
                <div className="overflow-x-auto rounded-lg overflow-y-hidden border-collapse border border-gray-200">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b"
                          style={{ width: "50%" }}
                        >
                          Question
                        </th>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b"
                          style={{ width: "25%" }}
                        >
                          Response
                        </th>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b"
                          style={{ width: "25%" }}
                        >
                          Expected Response
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {criteriaResponses.map((r, index) => (
                        <tr
                          key={r.id}
                          className={`hover:bg-gray-50 ${
                            index % 2 === 0 ? "bg-gray-50" : "bg-white"
                          }`}
                        >
                          <td
                            className="px-6 py-4 text-sm text-gray-700 border-b truncate"
                            style={{ maxWidth: "50%" }}
                            title={r.criteria?.question || "No question found"}
                          >
                            {r.criteria?.question || "No question found"}
                          </td>
                          <td
                            className="px-6 py-4 text-sm text-gray-900 border-b font-medium truncate"
                            style={{ maxWidth: "25%" }}
                            title={r.response || "No response available"}
                          >
                            {r.response || "No response available"}
                          </td>
                          <td
                            className={`px-6 py-4 text-sm  text-blue-600 border-b truncate ${
                              r.criteria?.expected_response === r.response &&
                              "text-green-500 font-medium"
                            }`}
                            style={{ maxWidth: "25%" }}
                            title={
                              r.criteria?.expected_response || "Not available"
                            }
                          >
                            {r.criteria?.expected_response || "Not available"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  No criteria responses available.
                </p>
              )}
            </div>

            <div className="w-full bg-white  border shadow-md rounded-md">
              <div className="p-4  flex justify-between items-center ">
                <div>
                  <h3 className="text-base font-semibold leading-7 text-gray-900">
                    Detailed Resume Information
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
                    Work experience, skills and projects.
                  </p>
                </div>
                <div>
                  <div className="ms-auto flex lg:items-center lg:justify-between">
                    <div
                      className="w-full flex gap-x-4 justify-end p-2 mb-1"
                      style={{ fontSize: ".8rem" }}
                    >
                      <span className="flex items-center gap-x-1  text-gray-600 font-medium">
                        {/* <div className={`w-2 h-2 rounded-full bg-brand-purple`}></div> */}
                        <HandThumbUpIcon className=" h-5 w-5 me-1 flex-shrink-0 brand-text" />
                        Matched
                      </span>
                      <span className="flex items-center gap-x-1  text-gray-600 font-medium">
                        {/* <div className={`w-2 h-2 rounded-full bg-brand-purple`}></div> */}
                        <CheckBadgeIcon className=" h-5 w-5 me-1 flex-shrink-0 brand-text" />
                        Highly Relevant
                      </span>
                      <span className="flex items-center gap-x-1 text-gray-600 font-medium">
                        <CheckBadgeIcon className=" h-5 w-5 me-1 flex-shrink-0 text-sky-400" />
                        Relevant
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 px-6 mt-6 border-t border-gray-100">
                <dl className="divide-y divide-gray-100">
                  <div className="p-4">
                    <dt className="text-base mb-7 font-semibold leading-7 text-gray-900">
                      Screening Responses
                    </dt>
                    <dd className="mt-1  flex flex-col gap-3 leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                      {answers.length > 0 &&
                        answers.map((answer, index) => (
                          <div className="mb-2">
                            <dt className=" mb-1 flex leading-6 text-gray-900">
                              <span className="me-2 font-medium text-gray-600">
                                {index + 1})
                              </span>{" "}
                              {answer.question.text}{" "}
                            </dt>
                            <dd className=" ms-3  text-indigo-600 ">
                              {/* <label className='mb-1 block text-sm font-semibold'>  {answer.type === "text" && answer.text} </label> */}

                              <>
                                {answer.type === "text" && answer.text}
                                {answer.type === "audio" && (
                                  <div className="flex p-2 gap-3 w-96 items-center border rounded-lg audio-ui shadow-sm">
                                    {/* <button onClick={() => !audioURL[answer.id] && getAnswerMedia(answer.id, "audio")} className={`hover:bg-sky-200 h-8 p-1 rounded-md ${answerMode[answer.id] === "audio" && 'bg-sky-300'}`}><SpeakerWaveIcon className="w-5 h-5 " /></button> */}

                                    {/* {
                                                                      answerMode[answer.id] === "audio" && audioURL && */}
                                    <div className="w-full h-full overflow-auto ">
                                      {/* <audio
                                      className="h-8 bg-transparent"
                                      controls
                                      ref={audioRef}
                                      src={answer?.audio_file}
                                      type="audio/wav"
                                    /> */}
                                      <AudioPlayer
                                        audioUrl={answer?.audio_file}
                                      />
                                    </div>
                                    {/* } */}
                                  </div>
                                )}
                              </>
                            </dd>
                          </div>
                        ))}
                    </dd>
                  </div>
                  

                  <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className=" font-medium leading-6 text-gray-900">
                      Work Experience
                    </dt>
                    <dd className="mt-1  leading-6 flex flex-col gap-3 text-gray-700 sm:col-span-2 sm:mt-0">
                      {applicant?.experience?.length > 0 &&
                        applicant.experience
                          .sort((a, b) => {
                            return (
                              relevanceOrder[a.relevance] -
                              relevanceOrder[b.relevance]
                            );
                          })
                          .map((exp) => (
                            <div className="mb-2">
                              <dt className="mb-1 flex font-bold leading-6 text-gray-900">
                                {exp.position}{" "}
                                {exp.relevance && exp.relevance !== "low" && (
                                  <CheckBadgeIcon
                                    className={`mx-1.5 h-5 w-5 flex-shrink-0 ${
                                      (exp.relevance === "high" ||
                                        exp.relevance === true) &&
                                      "brand-text"
                                    } ${
                                      exp.relevance === "medium" &&
                                      "text-blue-400"
                                    }`}
                                  />
                                )}
                              </dt>
                              <dd className=" ms-3 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                                <label className="mb-1 text-base block  font-medium">
                                  {" "}
                                  {exp.company} |{" "}
                                  <span className="text-sm font-normal">
                                    {exp.startDate} - {exp.endDate}
                                  </span>
                                </label>

                                {exp.description}
                              </dd>
                            </div>
                          ))}
                    </dd>
                  </div>
                  <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm font-medium leading-6 text-gray-900">
                      Projects
                    </dt>
                    <dd className="mt-1 leading-6 flex flex-col gap-3 text-gray-700 sm:col-span-2 sm:mt-0">
                      {resumeDetail?.projects?.length > 0 &&
                        resumeDetail?.projects
                          .sort((a, b) => {
                            return (
                              relevanceOrder[a.relevance] -
                              relevanceOrder[b.relevance]
                            );
                          })
                          .map((project, index) => (
                            <>
                              <div className="mb-3">
                                <label className="font-bold flex mb-1">
                                  {index + 1} {project.name}{" "}
                                  {project.relevance &&
                                    project.relevance !== "low" && (
                                      <CheckBadgeIcon
                                        className={`mx-1.5 h-5 w-5 flex-shrink-0 ${
                                          (project.relevance === "high" ||
                                            project.relevance === true) &&
                                          "brand-text"
                                        } ${
                                          project.relevance === "medium" &&
                                          "text-blue-400"
                                        }`}
                                      />
                                    )}
                                </label>
                                {project.description ? (
                                  <label className="ps-2">
                                    {project.description}
                                  </label>
                                ) : (
                                  false
                                )}
                              </div>
                            </>
                          ))}
                    </dd>
                  </div>
                  <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm font-medium leading-6 text-gray-900">
                      Education
                    </dt>
                    <dd className="mt-1  leading-6 flex flex-col gap-3 text-gray-700 sm:col-span-2 sm:mt-0">
                      {resumeDetail?.education?.length > 0 &&
                        resumeDetail?.education
                          .sort((a, b) => {
                            return (
                              relevanceOrder[a.relevance] -
                              relevanceOrder[b.relevance]
                            );
                          })
                          .map((edu, index) => (
                            <>
                              <ul className="mb-2">
                                <li>
                                  <label className="leading-6 ext-base flex font-bold">
                                    {edu.school}{" "}
                                    {edu.relevance &&
                                      edu.relevance !== "low" && (
                                        <CheckBadgeIcon
                                          className={`mx-1.5 h-5 w-5 flex-shrink-0 ${
                                            (edu.relevance === "high" ||
                                              edu.relevance === true) &&
                                            "brand-text"
                                          } ${
                                            edu.relevance === "medium" &&
                                            "text-blue-400"
                                          }`}
                                        />
                                      )}
                                  </label>
                                </li>
                                <li className="font-medium text-base text-gray-600 mt-1">
                                  {edu.degree}{" "}
                                  {edu.startDate && (
                                    <span className="text-xs italic font-normal text-gray-500">
                                      {edu.startDate} - {edu.endDate}
                                    </span>
                                  )}
                                </li>
                                {edu["percent"] && (
                                  <li>
                                    <span className="">
                                      Percentage - {edu["percent"]}%
                                    </span>
                                  </li>
                                )}
                                {edu["cgpa"] && (
                                  <li>
                                    <span>CGPA - {edu["cgpa"]}</span>
                                  </li>
                                )}
                              </ul>
                            </>
                          ))}
                    </dd>
                  </div>
                  <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm font-medium leading-6 text-gray-900">
                      Certifications
                    </dt>
                    <dd className="mt-1 leading-6 flex flex-col gap-3 text-gray-700 sm:col-span-2 sm:mt-0">
                      {resumeDetail?.certifications?.length > 0 &&
                        resumeDetail?.certifications
                          ?.sort((a, b) => {
                            return (
                              relevanceOrder[a.relevance] -
                              relevanceOrder[b.relevance]
                            );
                          })
                          .map((cert, index) => (
                            <>
                              <ul className="mb-2">
                                <li>
                                  <label className="leading-6 flex font-bold">
                                    {cert.name}{" "}
                                    {cert.relevance &&
                                      cert.relevance !== "low" && (
                                        <CheckBadgeIcon
                                          className={`mx-1.5 h-5 w-5 flex-shrink-0 ${
                                            (cert.relevance === "high" ||
                                              cert.relevance === true) &&
                                            "brand-text"
                                          } ${
                                            cert.relevance === "medium" &&
                                            "text-blue-400"
                                          }`}
                                        />
                                      )}
                                  </label>
                                </li>
                                <li>{cert.description}</li>
                              </ul>
                            </>
                          ))}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <UpdateStatusAndEmailModal
          setStages={setStages}
          setStatus={setSelectedStatus}
          status={selectedStatus?.value}
          setShowModal={setShowModal}
          setResumeDetail={setResumeDetail}
          resumeDetail={resumeDetail}
        />
      )}
    </>
  );
};

export default ApplicantResumeCopy;
