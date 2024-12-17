import {
  CheckBadgeIcon,
  HandThumbUpIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";
import { useContext, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { maskNumber, selectStyle } from "../../constants/constants";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import UpdateStatusAndEmailModal from "./action-modals/UpdateStatusAndEmailModal";
import Select from "react-select";
import AuthContext from "../../context/AuthContext";
import TranscriptTimeline from "./TranscriptTimeline";

const ApplicantResume = ({
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
    const answerUrl = `/interview/candidate/${applicantId}/job/${jobId}/service/${serviceId}/answers/`;
    try {
      const [answersResponse] = await Promise.all([
        fetch(answerUrl),
        // fetch(`/personality-screening/detail/${applicantId}/`)
      ]);

      if (!answersResponse.ok) {
        throw new Error("Failed to fetch answers data");
      }

      const data = await answersResponse.json();

      console.log(data?.results);
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
    console.log("statusText : ", userDetails, statusText, resumeDetail);

    const payload = {
      status_text: statusText,
    };

    payload["is_approved"] = statusText === "Shortlisted" ? true : false;
    payload["updated_by"] = user.id;
    payload["updated_at"] = new Date();

    if (resumeDetail?.id) {
      try {
        const response = await fetch(
          `/resume_parser/resumes/${resumeDetail?.id}/`,
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
            console.log("data", data);
            setResumeDetail((prev) => ({
              ...prev,
              status_text: data.status_text,
            }));
            setStages((prev) =>
              prev.map((stage) => {
                if (stage?.key === "resume-screening") {
                  console.log(stage)
                  return {
                    ...stage,
                    completed: data["completed"] ?? false,
                    is_approved: data["is_approved"] ?? false,
                    approved_by: data["approved_by"] ?? null,
                    updated_by: data["updated_by"] ?? null,
                    updated_at: data["updated_at"] || null,
                    status_text : data["status_text"] ?? "",
                  };
                }else{
                  return stage
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
      <div className="w-5/6">
        <div className="md:h-3/4 p-3">
          <div className="transition-all w-full  md:h-40 flex flex-col md:flex-row border mb-3 mt-3 bg-white  shadow-md rounded-md ">
            {scores &&
              scores?.length > 0 &&
              scores.map((score, index) => (
                <div className="w-full md:w-1/6 h-full border-b sm:border-e ">
                  <div className="  flex justify-end ">
                    <span
                      className={`${score.summary.summaryClass} me-3 my-2 px-3 py-2 rounded-lg text-xs font-medium`}
                    >
                      {score.label === "Total Score" && (
                        <i className={`${score.summary.iconClass} me-1`}></i>
                      )}
                      {score.summary.summaryText}
                    </span>
                  </div>
                  <div className=" flex flex-col justify-center items-center">
                    <label className="font-bold text-5xl text-primary-600">
                      {score.value.toFixed(1) || 0}
                      {/* {score.label !== "Total Score" && <><span className='inline-flex text-sm text-gray-500 pe-1'>/</span><span className='text-sm text-gray-500'>{score.weight}%</span></>} */}
                    </label>
                    <p className="text-gray-800 text-sm">{score.label}</p>
                  </div>
                  {score.label !== "Total Score" && (
                    <div className="text-end text-xs px-2 mb-2 sm:mb-0 mt-3 text-gray-500">
                      Weightage{" "}
                      <span className="text-blue-900 font-semibold">
                        {score.weight}%
                      </span>
                    </div>
                  )}
                </div>
              ))}
          </div>

          <div className="mb-3 w-full p-3 flex justify-between items-start  bg-blue-50 rounded-xl shadow-md">
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
          </div>

          {/* Work Details  */}
          <div className=" p-4 bg-white">
            <div className="px-4 sm:px-0">
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
            <div className="mt-6 border-t border-gray-100">
              <dl className="divide-y divide-gray-100">
                <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                  <dt className=" font-medium leading-6 text-gray-900">
                    Responses
                  </dt>
                  <dd className="mt-1  flex flex-col gap-3 leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                  {/* <div className="mb-2">
                          <dt className=" mb-1 flex font-semibold leading-6 text-gray-900">
                            
                          </dt>
                          <dd className=" ms-3  leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                            <>
                                <div className="flex p-2 gap-3 items-center border rounded-lg">
                                  <div className="w-full h-full overflow-auto text-sky-700">
                                  <TranscriptTimeline />
                                  </div>
                                </div>
                            </>
                          </dd>
                        </div> */}
                    
                    {answers.length > 0 &&
                      answers.map((answer) => (
                        <div className="mb-2">
                          <dt className=" mb-1 flex font-semibold leading-6 text-gray-900">
                            {answer.question.text}{" "}
                          </dt>
                          <dd className=" ms-3  leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                            {/* <label className='mb-1 block text-sm font-semibold'>  {answer.type === "text" && answer.text} </label> */}

                            <>
                              {answer.type === "text" && answer.text}
                              {answer.type === "audio" && (
                                <div className="flex p-2 gap-3 items-center border rounded-lg">
                                  {/* <button onClick={() => !audioURL[answer.id] && getAnswerMedia(answer.id, "audio")} className={`hover:bg-sky-200 h-8 p-1 rounded-md ${answerMode[answer.id] === "audio" && 'bg-sky-300'}`}><SpeakerWaveIcon className="w-5 h-5 " /></button> */}

                                  {/* {
                                                                    answerMode[answer.id] === "audio" && audioURL && */}
                                  <div className="w-full h-full overflow-auto text-sky-700">
                                    <audio
                                      className="h-8"
                                      controls
                                      ref={audioRef}
                                      src={answer?.audio_file}
                                      type="audio/wav"
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
                  <dt className="font-medium leading-6 text-gray-900">
                    Relevant Experience
                  </dt>
                  <dd className="mt-1  leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                    {resumeDetail.relevant_experience_in_months ? (
                      <>
                        {resumeDetail.relevant_experience_in_months}
                        <span className="text-sm italic text-gray-500 mx-1">
                          months
                        </span>
                      </>
                    ) : (
                      <span className="text-xs italic text-gray-500">
                        No data
                      </span>
                    )}{" "}
                  </dd>
                </div>
                <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                  <dt className=" font-medium leading-6 text-gray-900">
                    Expected Annual Salary{" "}
                  </dt>
                  <dd className="mt-1  leading-6 text-gray-700 sm:col-span-2 sm:mt-0 flex items-center">
                    {resumeDetail.expected_ctc ? (
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
                  </dd>
                </div>
                <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                  <dt className=" font-medium leading-6 text-gray-900">
                    Skills
                  </dt>
                  {resumeDetail?.skills?.length > 0 ? (
                    <dd className="mt-1 flex flex-wrap items-center  leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                      {resumeDetail.skills.map((skill, index) => {
                        const skillName =
                          typeof skill === "object" && skill !== null
                            ? skill.name || ""
                            : skill;
                        const relevant =
                          typeof skill === "object" && skill !== null
                            ? skill.relevance || ""
                            : null;
                        return resumeDetail.skills_matched.some(
                          (s) => s.name === skillName
                        ) ? (
                          <span
                            title={skill}
                            key={index}
                            className={`cursor-default flex h-10 items-center rounded-md me-2 mb-2 px-2 py-1 text-xs font-medium  text-indigo-500 ring-2 ring-inset ring-indigo-700/50 `}
                          >
                            <span className=" truncate inline-flex items-center justify-start gap-1">
                              <HandThumbUpIcon className=" h-5 w-5 flex-shrink-0 brand-text" />{" "}
                              <CheckBadgeIcon className=" h-5 w-5 flex-shrink-0 brand-text" />{" "}
                              {skillName}
                            </span>
                          </span>
                        ) : (
                          <span
                            title={skill}
                            key={index}
                            className={`cursor-default flex h-10  items-center rounded-md me-2 mb-2 pe-2 ps-3 py-1 text-xs font-medium ${
                              relevant
                                ? " text-sky-700 ring-2 ring-inset ring-sky-700/10 "
                                : "bg-gray-50 text-gray-700 ring-2 ring-inset ring-gray-700/10 "
                            }`}
                          >
                            <span className=" truncate inline-flex items-center justify-start gap-1">
                              {(relevant === "high" ||
                                relevant === "medium") && (
                                <CheckBadgeIcon
                                  className={`mx-1.5 h-5 w-5 flex-shrink-0 ${
                                    (relevant === "high" ||
                                      relevant === true) &&
                                    "brand-text"
                                  } ${
                                    relevant === "medium" && "text-blue-400"
                                  }`}
                                />
                              )}
                              {skillName}
                            </span>
                          </span>
                        );
                      })}
                    </dd>
                  ) : (
                    <dd className="text-gray-500">
                      Could not extract skills or not found
                    </dd>
                  )}
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
                                  {edu.relevance && edu.relevance !== "low" && (
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

export default ApplicantResume;
