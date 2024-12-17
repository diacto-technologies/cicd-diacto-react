import "./ApplicantProfile.css";

import { useContext, useEffect, useRef, useState } from "react";
import AuthContext from "../../context/AuthContext";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { pdfjs } from "react-pdf";
import Tab from "./Tab";
import ApplicantResume from "./ApplicantResume";
import ApplicantOverview from "./ApplicantOverview";
import ApplicantPersonalityScreening from "./ApplicantPersonalityScreening";
import {
  ArrowSmallRightIcon,
  BriefcaseIcon,
} from "@heroicons/react/24/outline";
import ProfileComments from "./ProfileComments";
import { getServiceIcon, selectStyle } from "../../constants/constants";
import ApplicantTracking from "./ApplicantTracking";
import Select from "react-select";

const ApplicantProfile = () => {
  const navigate = useNavigate()
  const location = useLocation();
  const [tabs, setTabs] = useState([]);
  const [currentStage, setCurrentStage] = useState("overview");
  const [scores, setScores] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const { orgServices, authTokens, userDetails } = useContext(AuthContext);
  const { applicantId, serviceId } = useParams();
  const contentRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({});

  const [takeScreenshot, setTakeScreenshot] = useState(false);
  const [applicant, setApplicant] = useState(null);

  const [selectedJob, setSelectedJob] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [resumeDetail, setResumeDetail] = useState(null);
  const [stages, setStages] = useState([]);

  // const [numPages, setNumPages] = useState();
  // const [pageNumber, setPageNumber] = useState(1);

  const defaultTabs = ["overview", "comments"];

  // useEffect(() => {
  //   const formattedStages = [];
  //   const formattedTabs = [
  //     {
  //       name: "Overview",
  //       id: "overview",
  //       key: "overview",
  //       href: `/app/user/applicants/applicant/${applicantId}/profile/overview/`,
  //       current: true,
  //       icon: "fa-solid fa-file-lines",
  //       show: true,
  //       isLocked: false,
  //       lockIcon: "fa-solid fa-lock",
  //     },
  //     // {
  //     //   name: "Comments",
  //     //   id: "comments",
  //     //   href: `/app/user/applicants/applicant/${applicantId}/profile/comments/`,
  //     //   current: false,
  //     //   icon: "fa-solid fa-tv",
  //     //   isLocked: false,
  //     //   show: true,
  //     //   lockIcon: "fa-solid fa-lock",
  //     // },
  //   ];

  //   if (orgServices.length) {
  //     orgServices.forEach((s) => {
  //       const tab = {
  //         name: s.name,
  //         id: s.id,
  //         key: s.key,
  //         href: `/app/user/applicants/applicant/${applicantId}/profile/${s.key}/${s.id}/`,
  //         show: true,
  //         current: false,
  //         locked: false,
  //         icon: getServiceIcon(s.key),
  //       };
  //       // formattedTabs.push(tab)
  //       formattedStages.push(tab);
  //     });
  //   }

  //   setTabs(formattedTabs);
  // }, [orgServices]);

  useEffect(() => {
    fetchApplicants();
  }, []);

  //console.log("current tab",currentStage)

  useEffect(() => {
    const paths = location.pathname.split("/");
    console.log(paths[paths.length - 2] !== "" &&
      !defaultTabs.includes(paths[paths.length - 2])
      ? paths[paths.length - 3]
      : paths[paths.length - 2])
    setCurrentStage(
      paths[paths.length - 2] !== "" &&
        !defaultTabs.includes(paths[paths.length - 2])
        ? paths[paths.length - 3]
        : paths[paths.length - 2]
    );
  }, [location]);

  useEffect(() => {
    if (selectedJob) {
      fetchApplicantStagesByJob();
      const updatedResume = applicant.resumes.find(
        (r) => r.job === selectedJob.id
      );
      if (updatedResume) {
        setResumeDetail(updatedResume);

        const applicant_score = [
          {
            label: "Skill",
            value: parseFloat(updatedResume.resume_score?.skills_score),
            weight: parseFloat(updatedResume.score_weight?.skills) * 100,
            summary: getScoreSummary(
              parseFloat(updatedResume.resume_score?.skills_score),
              parseFloat(updatedResume.score_weight?.skills) * 10
            ),
          },
          {
            label: "Work Experience",
            value: parseFloat(updatedResume.resume_score?.work_exp_score || 0),
            weight:
              parseFloat(updatedResume.score_weight?.work_experience || 0) *
              100,
            summary: getScoreSummary(
              parseFloat(updatedResume.resume_score?.work_exp_score || 0),
              parseFloat(updatedResume.score_weight?.work_experience || 0) * 10
            ),
          },
          {
            label: "Projects ",
            value: parseFloat(updatedResume.resume_score?.projects_score || 0),
            weight: parseFloat(updatedResume.score_weight?.projects || 0) * 100,
            summary: getScoreSummary(
              parseFloat(updatedResume.resume_score?.projects_score || 0),
              parseFloat(updatedResume.score_weight?.projects || 0) * 10
            ),
          },
          {
            label: "Education ",
            value: parseFloat(updatedResume.resume_score?.education_score || 0),
            weight:
              parseFloat(updatedResume.score_weight?.education || 0) * 100,
            summary: getScoreSummary(
              parseFloat(updatedResume.resume_score?.education_score || 0),
              parseFloat(updatedResume.score_weight?.education || 0) * 10
            ),
          },
          {
            label: "Certification ",
            value: parseFloat(
              updatedResume.resume_score?.certifications_score || 0
            ),
            weight:
              parseFloat(updatedResume.score_weight?.certifications || 0) * 100,
            summary: getScoreSummary(
              parseFloat(updatedResume.resume_score?.certifications_score || 0),
              parseFloat(updatedResume.score_weight?.certifications || 0) * 10
            ),
          },
          {
            label: "Total Score",
            value: parseFloat(updatedResume.resume_score?.overall_score || 0),
            weight: null,
            summary: getOverallSummary(
              parseFloat(updatedResume.resume_score?.overall_score || 0)
            ),
          },
        ];

        //console.log("Hellow world")
        setScores(applicant_score);
      }
    }
  }, [selectedJob]);

  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

  // function onDocumentLoadSuccess({ numPages }) {
  //     setNumPages(numPages);
  // }

  const handleTabClick = (tab) => {


    const serviceMapping = {
      "assessment" : "test",
      "automated-video-interview" : "personality-screening",
      "resume-screening" : "resume-screening"
    }
    const service = orgServices.find(s => s.key === serviceMapping[tab])

    if (service) {
      console.log(service)
      navigate(`/app/user/applicants/applicant/${applicantId}/profile/${tab}/${service?.id}/`)
    }

    setCurrentStage(tab);
    
  };

  const fetchApplicants = async () => {
    //console.log("fetching dataset")
    try {
      const response = await fetch(`/candidates/candidate/${applicantId}/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + String(authTokens.access),
        },
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();

      if (data) {
        setApplicant(data);
        setResumeDetail(data.resumes[0]);
        const formatted_jobs = data.applied_jobs?.map((job) => ({
          ...job,
          label: job.title,
          value: job.id,
        }));
        setAppliedJobs(formatted_jobs);
        setSelectedJob(formatted_jobs[0]);
      }

      const applicant_score = [
        {
          label: "Skill",
          value: parseFloat(data.resumes[0].resume_score.skills_score),
          weight: parseFloat(data.resumes[0].score_weight.skills) * 100,
          summary: getScoreSummary(
            parseFloat(data.resumes[0].resume_score.skills_score),
            parseFloat(data.resumes[0].score_weight.skills) * 10
          ),
        },
        {
          label: "Work Experience",
          value: parseFloat(data.resumes[0].resume_score.work_exp_score),
          weight:
            parseFloat(data.resumes[0].score_weight.work_experience) * 100,
          summary: getScoreSummary(
            parseFloat(data.resumes[0].resume_score.work_exp_score),
            parseFloat(data.resumes[0].score_weight.work_experience) * 10
          ),
        },
        {
          label: "Projects ",
          value: parseFloat(data.resumes[0].resume_score.projects_score),
          weight: parseFloat(data.resumes[0].score_weight.projects) * 100,
          summary: getScoreSummary(
            parseFloat(data.resumes[0].resume_score.projects_score),
            parseFloat(data.resumes[0].score_weight.projects) * 10
          ),
        },
        {
          label: "Education ",
          value: parseFloat(data.resumes[0].resume_score.education_score),
          weight: parseFloat(data.resumes[0].score_weight.education) * 100,
          summary: getScoreSummary(
            parseFloat(data.resumes[0].resume_score.education_score),
            parseFloat(data.resumes[0].score_weight.education) * 10
          ),
        },
        {
          label: "Certification ",
          value: parseFloat(data.resumes[0].resume_score.certifications_score),
          weight: parseFloat(data.resumes[0].score_weight.certifications) * 100,
          summary: getScoreSummary(
            parseFloat(data.resumes[0].resume_score.certifications_score),
            parseFloat(data.resumes[0].score_weight.certifications) * 10
          ),
        },
        {
          label: "Total Score",
          value: parseFloat(data.resumes[0].resume_score.overall_score),
          weight: null,
          summary: getOverallSummary(
            parseFloat(data.resumes[0].resume_score.overall_score)
          ),
        },
      ];

      //console.log("Hellow world")
      setScores(applicant_score);
      // getListData(data)
      //console.log(applicant_score)
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplicantStagesByJob = async () => {
    console.log("fetching selectedJob", selectedJob);
    if (selectedJob && applicantId) {
      try {
        const response = await fetch(
          `/candidates/stages/?candidate_id=${applicantId}&job_id=${selectedJob?.id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + String(authTokens.access),
            },
          }
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();

        if (data) {
          const existingStages = [];

          Object.keys(data["stages"]).forEach((key) => {
            const item = data["stages"][key];

            if (item["exists"] == true) {
              existingStages.push({
                id: item["details"]["id"],
                key: item["key"],
                name: item["stage_name"],
                completed: item["details"]["completed"] || false,
                is_approved: item["details"]["is_approved"] || false,
                approved_by: item["details"]["approved_by"] || false,
                updated_by: item["details"]["updated_by"] || false,
                updated_at: item["details"]["updated_at"] || null,
                status_text : item["details"]["status_text"] || ""
              });
            }
          });

          setStages(existingStages);
          console.log("stages : ", existingStages);
        }
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    }
  };

  function getScoreSummary(score, max) {
    let summary = "";
    let summaryClass = "";
    if (score === max / 2) {
      summary = "Avg";
      summaryClass = "bg-yellow-200 text-yellow-800";
    } else if (score < max / 2) {
      summary = "Below Avg";
      summaryClass = "bg-red-200 text-red-800";
    }
    if (score > max / 2) {
      summary = "Good";
      summaryClass = "bg-green-200 text-green-800";
    }
    if (score === max) {
      summary = "Match";
      summaryClass = "bg-blue-200 text-blue-800";
    }
    if (score > max) {
      summary = "Perfect";
      summaryClass = "bg-teal-200 text-teal-800";
    }
    return { summaryText: summary, summaryClass: summaryClass };
  }

  function getOverallSummary(totalScore) {
    let summary = "";
    let summaryClass = "";
    let iconClass = "";
    if (totalScore >= 10) {
      summary = "Perfect Match";
      summaryClass = "bg-teal-200 text-teal-800";
      iconClass = "fa-solid fa-star";
    } else if (totalScore >= 7) {
      summary = "Excellent";
      summaryClass = "bg-emerald-200 text-emerald-600";
      iconClass = "fa-solid fa-thumbs-up";
    } else if (totalScore >= 5) {
      summary = "Good";
      summaryClass = "bg-green-200 text-green-800";
      iconClass = "fa-solid fa-thumbs-up";
    } else if (totalScore >= 3) {
      summary = "Fair";
      summaryClass = "bg-yellow-200 text-yellow-800";
      iconClass = "fa-solid fa-thumbs-up";
    } else {
      summary = "Poor";
      summaryClass = "bg-red-200 text-red-800";
      iconClass = "fa-solid fa-thumbs-down";
    }

    return {
      summaryText: summary,
      summaryClass: summaryClass,
      iconClass: iconClass,
    };
  }

  console.log(stages)

  return (
    <>
      <div ref={contentRef} id="test1" className="w-full ">
        {/* <button onClick={handleExportPDF}>Export to PDF</button> */}
        {applicant ? (
          <div
            id="applicant-profile-card"
            style={{ height: "calc(100dvh - 60px)" }}
            className="applicant-profile-card rounded-2xl flex flex-col"
          >
            <div className=" border-b pt-1">
              <div className="h-full relative ">
                {/* <div class=" profile-wave-svg h-full flex justify-end ">
                  <img src={BlobSVG} className="h-full" />
                </div> */}

                <div class="w-full flex flex-col justify-end items-start relative z-10 pt-8 bg-white">
                  <h1 class=" truncate text-2xl z-20 font-bold tracking-tight text-gray-900 sm:text-4xl ps-5 pe-10 ">
                    {applicant.name}
                  </h1>
                  <p class="z-0 text-sm w-5/6 truncate leading-7 text-gray-600 ps-5 pe-10 ">
                    {applicant.resumes[0].summary}
                  </p>
                  <div className="w-full  flex items-center p-2 mt-3 gap-4 ps-5 pe-10 border-y">
                    {applicant.applied_jobs.length > 0 && (
                      // <button
                      //   key={job.id}
                      //   onClick={() => setSelectedJob(job)}
                      //   className={`flex items-center gap-1 px-3 py-1.5 rounded-md ${
                      //     selectedJob.id === job.id
                      //       ? " bg-blue-50 ring-2 ring-blue-600/60 hover:ring-blue-400"
                      //       : "bg-gray-50 ring-1  ring-blue-200 hover:ring-blue-400"
                      //   } text-xs font-medium text-gray-700/80 shadow-sm hover:ring-2 transition-all duration-200 ease-out`}
                      // >
                      //   <BriefcaseIcon className="w-5 h-5 " /> {job.title}
                      // </button>
                      <>
                        <label>Jobs Applied</label>
                        <Select
                          className="w-5/6 md:w-72 text-xs"
                          styles={selectStyle}
                          value={selectedJob}
                          onChange={(selectedOption) =>
                            setSelectedJob(selectedOption)
                          }
                          options={appliedJobs}
                          placeholder="Filter by Job"
                        />
                      </>
                    )}
                  </div>
                  {/* <div class="flex mt-3 w-full">
                    {tabs.map((tab, index) => (
                      <Tab
                        key={index}
                        link={tab.href}
                        title={tab.name}
                        // iconClass={tab.icon}
                        isActive={currentStage === tab.key.toLowerCase()}
                        isLocked={tab.isLocked}
                        lockIcon={tab.lockIcon}
                        show={tab.show}
                        onClick={() => handleTabClick(tab.id)}
                      />
                    ))}
                  </div> */}
                </div>
              </div>
            </div>

            {/* Stages and Content  */}
            <div style={{ height: "calc(100dvh - 120px)" }} className=" w-full overflow-auto">
              <div className="w-full ps-5 pe-10 mt-5 pb-3 bg-gray-50 mb-3 border-b">
                <div className="w-full  bg-white border rounded-md">
                  <div className="flex items-center justify-between p-3 mb-2 border-b">
                    <div>
                    <label className="">Stages</label>
                    <p className="text-sm text-gray-500">Click on a stage below to see more details</p>
                    </div>
                    <button
                      onClick={() => {
                        setCurrentStage("overview");
                      }}
                      className="text-blue-500 flex items-center gap-2 "
                    >
                      <ArrowSmallRightIcon className="w-5 h-5" /> Go to Overview
                    </button>
                  </div>

                  {stages && stages.length > 0 && (
                    <div class="timeline flex gap-5 mt-2 p-3 pb-4">
                      {stages.map((stage) => (
                        <button
                          onClick={() => handleTabClick(stage.key)}
                          className={`stage-arrow flex justify-evenly items-center font-medium transition-transform duration-100 inactive
                           ${
                             currentStage === stage.key.toLowerCase() &&
                             "border-b-4"
                           }
                           ${stage.status_text === "Completed" && "active"}
                           ${stage.status_text === "Under Review" && "pending"}
                           ${stage.status_text === "On Hold"  && "on-hold"}
                           ${stage.status_text === "Not Shortlisted"  && "rejected"}
                           ${stage.status_text === "Shortlisted"  && "cleared"}
                          `}
                        >
                          {stage?.updated_by?.profile_pic && <img title={stage?.updated_by?.name} className="ms-2 rounded-full w-8 h-8 ring-2 ring-gray-400" src={stage?.updated_by?.profile_pic} />}
                          <div className="flex flex-col items-start justify-start">
                          <span className="stage-name w-full text-start text-ellipsis">
                            {stage.name}
                          </span>
                          <span className="stage-name w-full text-start text-ellipsis text-xs font-normal">
                            {stage.updated_at && new Date(stage.updated_at).toLocaleString()}
                          </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {/* Body  */}

              <div className="overflow-auto grow w-full flex flex-col items-center justify-start">
                {currentStage === "overview" && (
                  <div className="w-5/6">
                    <ApplicantOverview
                      jobId={selectedJob?.id}
                      applicant={applicant}
                      resumeDetail={resumeDetail}
                    />
                  </div>
                )}
                {currentStage === "resume-screening" && (
                  <>
                    <ApplicantResume
                      setStages={setStages}
                      setResumeDetail={setResumeDetail}
                      jobId={selectedJob?.id}
                      scores={scores}
                      applicant={applicant}
                      resumeDetail={resumeDetail}
                    />
                  </>
                )}
                {currentStage === "automated-video-interview" && (
                  <>
                    <div className="w-5/6 h-full">
                      <ApplicantPersonalityScreening jobId={selectedJob?.id} />
                    </div>
                  </>
                )}
                {currentStage === "assessment" && (
                  <>
                    <div className="w-5/6">
                      <ApplicantTracking
                        setStages={setStages}
                        jobTitle={selectedJob?.title}
                        jobId={selectedJob?.id}
                      />
                    </div>
                  </>
                )}
                {currentStage === "comments" && (
                  <>
                    <ProfileComments
                      jobId={selectedJob?.id}
                      applicant={applicant}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          false
        )}
      </div>
    </>
  );
};

export default ApplicantProfile;
