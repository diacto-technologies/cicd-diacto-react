import {
  BriefcaseIcon,
  DocumentIcon,
  InformationCircleIcon,
  UsersIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";
import { PhotoIcon, UserCircleIcon } from "@heroicons/react/24/solid";
import { useEffect, useState, useRef } from "react";
import AudioInput from "../inputs/AudioInput";
import PersonalInfoForm from "./PersonalInfoForm.js";
import QuestionTestForm from "./QuestionTestForm.js";
import ProfessionalInfoForm from "./ProfessionalInfoForm.js";
import CriteriaForm from "../../components/candidate-form/CriteriaForm.js";
import { api } from "../../constants/constants.js";

const CandidateQuestions = ({
  setUserName,
  preference,
  jobDetail,
  city,
  state,
  country,
  jobkey,
  setIsSubmitted,
  workflow_id,
}) => {
  const [resumeFile, setResumeFile] = useState(null);
  const [profilePic, setProfilePic] = useState(null);
  const [introVideo, setIntroVideo] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [candidateToEdit, setCandidateToEdit] = useState(null);
  const [error, setError] = useState({});
  const [questions, setQuestions] = useState([]);
  const [maxRetriesExceeded, setMaxRetriesExceeded] = useState(false);
  const [criteriaPayload, setCriteriaPayload] = useState({
    "candidate_id": null,
    "job_id": null,
    "responses": []
  });
  const [userFormData, setUserFormData] = useState({
    name: "",
    email: "",
    contact: "",
    location: {
      city: "",
      state: "",
    },
    linkedin: "",
    github: "",
    personal_website: "",
    last_increment: "",
    expected_ctc: "",
    current_ctc: "",
    notice_period: "",
    notice_period_in_months: "",
    relevant_experience_in_months: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [responses, setResponses] = useState([]);
  const [criteriaResponses, setCriteriaResponses] = useState({});
  const [criteriaErrors, setCriteriaErrors] = useState(null);
  const [formValidationResponse, setFormValidationResponse] = useState(null);
  // Reference to the input element
  const fileInputRef = useRef(null);
  const [step, setStep] = useState(0);
  // const stepTitles = ["Personal Info", "Professional Information", "Questions"]
  const [stepTitles, setStepTitles] = useState(["Personal Info"]);


  useEffect(() => {
    let updatedTitles = [];
    if (
      (preference?.include_current_ctc ||
        preference?.include_expected_ctc ||
        preference?.include_github ||
        preference?.include_linkedin ||
        preference?.include_personal_website ||
        preference?.include_notice_period ||
        preference?.include_relevant_experience ||
        preference?.last_increment) &&
      !stepTitles.includes("Professional Info")
    ) {
      updatedTitles.push("Professional Info");
    }
    if (questions && questions.length > 0) {
      updatedTitles.push("Questions");
    }
    setStepTitles((prev) => [...prev, ...updatedTitles]);
  }, [preference, questions]);

  useEffect(() => {
    if (city) {
      setUserFormData({
        ...userFormData,
        location: {
          ...userFormData.location,
          city: city,
          state: state,
        },
      });
    }
  }, [city, state]);

  useEffect(() => {
    if (preference && preference.questions) {
      let random_questions;
      if (preference.random_questions) {
        const no_of_questions = parseInt(preference.random_questions_count);
        random_questions = shuffleAndPick(
          preference.questions,
          no_of_questions
        );
      } else {
        random_questions = preference.questions;
      }
      setQuestions(random_questions);
    }
  }, [preference]);

  useEffect(() => {
    const payload = {
      //   candidate_id: candidateId,
      job_id: jobDetail?.id,
      responses: Object.entries(criteriaResponses).map(([criteriaId, response]) => ({
        criteria_id: criteriaId,
        response: response,
      })),
    };

    setCriteriaPayload(payload)
  }, [criteriaResponses])

  const handleInputChange = (field, value) => {
    if (field === "city" || field === "state") {
      setUserFormData({
        ...userFormData,
        location: {
          ...userFormData.location,
          [field]: value,
        },
      });
    } else if (field === "contact") {
      // Limit phone input to 10 digits
      // if (value.length > 10 && value !== '') {
      //   return; // Prevent further input if already 10 digits
      // }

      setUserFormData({
        ...userFormData,
        [field]: value,
      });
    } else {
      setUserFormData({
        ...userFormData,
        [field]: value,
      });
    }
  };

  const handleKeyDown = (e) => {
    // Allow only numbers and control keys (Backspace, Delete, Arrow keys)
    const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight"];
    if (!/[0-9]/.test(e.key) && !allowedKeys.includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const fileExtension = file.name.split(".").pop().toLowerCase();
    if (event.target.name === "resume-upload") {
      if (fileExtension === "pdf") {
        setResumeFile(file);
      } else {
        setResumeFile(null);
        setFormValidationResponse({
          error: "Please upload the file in PDF format",
        });
        // Reset the input field value so that user can re-select the same file
        if (fileInputRef.current) {
          fileInputRef.current.value = ""; // Clear the input value
        }
      }
    }
    else if (event.target.name === "profile-pic-upload") {
      if (fileExtension === "jpg" || fileExtension === "jpeg" || fileExtension === "png") {
        setProfilePic(file);
      } else {
        setProfilePic(null);
        setFormValidationResponse({
          error: "Please upload the file in JPG, JPEG or PNG format",
        });
        // Reset the input field value so that user can re-select the same file
        if (fileInputRef.current) {
          fileInputRef.current.value = ""; // Clear the input value
        }
      }
    }
    else if (event.target.name === "intro-video-upload") {
      if (fileExtension === "mp4" || fileExtension === "mov") {
        setIntroVideo(file);
      } else {
        setIntroVideo(null);
        setFormValidationResponse({
          error: "Please upload the file in MP3 or MOV format",
        });
        // Reset the input field value so that user can re-select the same file
        if (fileInputRef.current) {
          fileInputRef.current.value = ""; // Clear the input value
        }
      }
    }
  };

  const check_email_exists = async () => {
    try {
      const response = await fetch(
        `${api}/candidates/check-email/${jobDetail.id}/${userFormData.email}/`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // Authorization: "Bearer " + String(authTokens.access),
          },
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(error);
    }
  };

  function shuffleAndPick(arr, length) {
    const shuffledArray = [...arr];

    // Shuffle the array using Fisher-Yates algorithm
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledArray[i], shuffledArray[j]] = [
        shuffledArray[j],
        shuffledArray[i],
      ];
    }

    // Return a subset of the shuffled array with the given length
    return shuffledArray.slice(0, length);
  }

  const updateResume = async () => {
    try {
      if (
        resumeFile &&
        userFormData.name &&
        userFormData.email &&
        jobkey &&
        responses.length === questions.length
      ) {
        setSubmitting(true);
        setError(null);
        setShowModal(false);
        const formData = new FormData();
        formData.append("name", userFormData.name);
        formData.append("email", userFormData.email);
        formData.append("location", JSON.stringify(userFormData.location));
        formData.append("linkedin", userFormData.linkedin);
        formData.append("file", resumeFile);
        if (profilePic) {
          formData.append("profile_pic", profilePic);
        }
        if (introVideo) {
          formData.append("intro_video", introVideo);
        }
        
        formData.append("applied_job", candidateToEdit.applied_job);
        formData.append("resume", candidateToEdit.resume);

        formData.append("linkedin", userFormData.linkedin);
        formData.append("github", userFormData.github);
        formData.append("personal_website", userFormData.personal_website);
        formData.append("last_increment", userFormData.last_increment);
        formData.append("expected_ctc", userFormData.expected_ctc);
        formData.append("current_ctc", userFormData.current_ctc);
        formData.append(
          "notice_period_in_months",
          userFormData.notice_period_in_months
        );
        formData.append(
          "relevant_experience_in_months",
          userFormData.relevant_experience_in_months
        );
        formData.append("responses", JSON.stringify(responses));

        responses.forEach((r) => {
          if (r.type === "audio") {
            formData.append(
              r.questionId,
              r.answer,
              `${userFormData?.name}-ResumeScreening-${r.questionId}.mp3`
            );
          }
        });

        const response = await fetch(
          `${api}/candidates/candidate/${candidateToEdit.id}/`,
          {
            method: "PATCH",
            body: formData,
          }
        );

        if (response.ok) {
          setSubmitting(false);
          setIsSubmitted(true);
          const data = await response.json();
          handleSetCriteria(data.id);
        } else {
          setSubmitting(false);
          console.error("Update failed");
        }
      }
    } catch (error) {
      setSubmitting(false);
      setError(error);
      console.error("Error uploading file:", error);
    }
  };

  const handleUpload = async () => {
    const error = getValidationErrors(step);
    if (error) {
      setFormValidationResponse({ error });
      return;
    }

    if(validateCriteria()){
      return
    }

    try {
      if (
        resumeFile &&
        userFormData.name &&
        userFormData.email &&
        jobkey &&
        responses.length === questions.length
      ) {
        setSubmitting(true);
        setError(null);

        const formData = new FormData();
        formData.append("name", userFormData.name);
        formData.append("email", userFormData.email);
        formData.append("location", JSON.stringify(userFormData.location));
        formData.append("contact", userFormData.contact);
        formData.append("file", resumeFile);
        formData.append("profile_pic", profilePic);
        formData.append("intro_video", introVideo);
        formData.append("job_key", jobkey);
        formData.append("workflow_id", workflow_id);
        formData.append("linkedin", userFormData.linkedin);
        formData.append("github", userFormData.github);
        formData.append("personal_website", userFormData.personal_website);
        formData.append("last_increment", userFormData.last_increment);
        formData.append("expected_ctc", userFormData.expected_ctc);
        formData.append("current_ctc", userFormData.current_ctc);
        formData.append(
          "notice_period_in_months",
          userFormData.notice_period_in_months
        );
        formData.append(
          "relevant_experience_in_months",
          userFormData.relevant_experience_in_months
        );
        formData.append("responses", JSON.stringify(responses));

        responses.forEach((r) => {
          if (r.type === "audio") {
            formData.append(
              r.questionId,
              r.answer,
              `${userFormData?.name}-ResumeScreening-${r.questionId}.mp3`
            );
          }
        });

        const data = await check_email_exists(jobDetail.id, userFormData.email);

        if (!data.exists) {
          const response = await fetch(`${api}/candidates/candidate/`, {
            method: "POST",
            body: formData,
          });

          if (response.ok) {
            // await logFeature(jobDetail?.organization?.id, 1);
            const data = await response.json();
            handleSetCriteria(data.candidate_id);
            setSubmitting(false);
            setIsSubmitted(true);
          } else {
            console.error("File upload failed");
          }
        } else {
          setSubmitting(false);
          // Only check if recruiter has set max retries value
          if (preference?.max_retries && preference?.max_retries >= 0) {
            // If candidate's retries is greater than max_retries then dont allow to upload.
            if (!(data.retries > preference?.max_retries)) {
              setCandidateToEdit(data);
              setError("You have already applied to this job");
            } else {
              setMaxRetriesExceeded(true);
              // console.log("You have exceeded the number of retries for this job")
            }
          } else {
            setCandidateToEdit(data);
            setError("You have already applied to this job");
          }

          setShowModal(true);
        }
      } else {
        const err = {};
        if (!jobkey) {
          err.jobkey = "Unable to fetch job details. Please try again later";
        }
        if (!resumeFile) {
          err.resumeFile = "Please upload your resume";
        }
        if (!profilePic && preference?.include_profile_pic) {
          err.profilePic = "Please upload your profile picture";
        }
        if (!introVideo && preference?.include_intro_video) {
          err.introVideo = "Please upload a 1 min introduction video";
        }
        if (!userFormData.name) {
          err.name = "Full Name is mandatory";
        }
        if (!userFormData.email) {
          err.email = "Please enter your verified email address";
        }
        if (responses.length < questions.length) {
          const notAnsweredQuestions = questions.filter(
            (question) =>
              !responses.some((response) => response.questionId === question.id)
          );
          if (notAnsweredQuestions.length) {
            notAnsweredQuestions.forEach((question) => {
              if (question.type === "audio") {
                err["audio"] = {
                  ...err["audio"],
                  [question.id]: "Audio response is required",
                };
              }
            });
          }
        }

        setSubmitting(false);

        setError(err);
      }
    } catch (error) {
      setSubmitting(false);

      setError(error);
      console.error("Error uploading file:", error);
    }
  };

  const handleSetCriteria = async (candidate_id) => {
    const payload = {
      "candidate_id": candidate_id,
      ...criteriaPayload
    }
    try {
      const response = await fetch(`${api}/jobs/candidate-responses/bulk-create/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Authorization: "Bearer " + String(authTokens.access),
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        // await logFeature(jobDetail?.organization?.id, 1);
        const data = await response.json();
      } else {
        console.error("Not able to set criteria");
      }
    } catch (error) {
      setSubmitting(false);
      setError(error);
      console.error("Error uploading file:", error);
    }
  }


  const responseChange = (questionId, answer, type) => {
    setResponses((prevResponses) => {
      const existingResponseIndex = prevResponses.findIndex(
        (response) => response.questionId === questionId
      );

      if (existingResponseIndex !== -1) {
        // Update the existing response if it is not empty
        if (answer !== "") {
          const updatedResponses = [...prevResponses];
          updatedResponses[existingResponseIndex] = {
            ...updatedResponses[existingResponseIndex],
            answer,
            type: type,
          };
          return updatedResponses;
        } else {
          // Remove the question from the response
          return prevResponses.filter((res) => res.questionId !== questionId);
        }
      } else {
        // Create a new response object
        return [
          ...prevResponses,
          {
            questionId,
            answer,
            type: type,
          },
        ];
      }
    });
  };

  const getValidationErrors = (step) => {
    let validationFields = [];

    if (stepTitles[step] === "Personal Info") {
      validationFields = [
        { value: userFormData.name, message: "Please enter full name" },
        { value: userFormData.email, message: "Please enter email" },
        { value: userFormData.contact, message: "Please enter contact details" },
        { value: userFormData.location.city, message: "Please enter city" },
        { value: userFormData.location.state, message: "Please enter state" },
        { value: resumeFile, message: "Please upload a resume" },
        (preference?.include_profile_pic && { value: profilePic, message: "Please upload a profile picture" }),
        (preference?.include_intro_video && { value: introVideo, message: "Please upload a 1 min introduction video" }),
      ];
    } else if (stepTitles[step] === "Professional Info") {
      validationFields = [
        ...(preference.include_notice_period
          ? [
            {
              value: userFormData.notice_period_in_months,
              message: "Please enter notice period",
            },
          ]
          : []),
        ...(preference.include_relevant_experience
          ? [
            {
              value: userFormData.relevant_experience_in_months,
              message: "Please enter relevant experience (in months)",
            },
          ]
          : []),
        ...(preference.include_current_ctc
          ? [
            {
              value: userFormData.current_ctc,
              message: "Please enter Current Annual Salary",
            },
          ]
          : []),
        ...(preference.include_expected_ctc
          ? [
            {
              value: userFormData.expected_ctc,
              message: "Please enter Expected Annual Salary",
            },
          ]
          : []),
        ...(preference.include_linkedin
          ? [
            {
              value: userFormData.linkedin,
              message: "Please provide your LinkedIn profile link",
            },
          ]
          : []),
        ...(preference.include_github
          ? [
            {
              value: userFormData.github,
              message: "Please provide your Github profile link",
            },
          ]
          : []),
        ...(preference.include_personal_website
          ? [
            {
              value: userFormData.personal_website,
              message: "Please provide your personal website link",
            },
          ]
          : []),
      ];
    } else if (stepTitles[step] === "Questions") {
      let queIdWhoHaveResp = responses.map((res) => res.questionId);
      questions.forEach((question) => {
        if (!queIdWhoHaveResp.includes(question.id)) {
          validationFields = [
            { value: null, message: "Please answer all the questions" },
          ];
        }
      });
    }

    if (userFormData.email) {
      const filter =
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if (!filter.test(userFormData.email)) {
        return "Please provide a valid email address";
      }
    }

    if (userFormData.linkedin && !validateWebsiteURL(userFormData.linkedin)) {
      return "Please give a valid link in LinkedIn"
    }
    if (userFormData.github && !validateWebsiteURL(userFormData.github)) {
      return "Please give a valid link in Github"
    }
    if (userFormData.personal_website && !validateWebsiteURL(userFormData.personal_website)) {
      return "Please give a valid link in Personal website"
    }

    // Collect and return any errors
    for (const field of validationFields) {
      if (field?.value === "" || field?.value === null) {
        return field.message;
      }
    }

    return null; // No errors
  };

  const validateCriteria = () => {
    let error = {...criteriaErrors}
    if (Object.entries(criteriaResponses).length) {
      Object.entries(criteriaResponses).forEach(([criteriaId, criteriaRes]) => {
        if (criteriaRes === "" || criteriaRes === null || (Array.isArray(criteriaRes) && criteriaRes?.length === 0)) {
          // setCriteriaErrors({ [criteriaId]: "This field is mandatory" })
          error[criteriaId] = "This field is mandatory"
        }
        else {
          delete error[criteriaId]
        }
      })
    }

    setCriteriaErrors(error);
    return Object.keys(error).length>0 ? true : false;
  }

  function validateWebsiteURL(url) {
    const urlPattern = /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]{1,63}\.)+([a-zA-Z]{2,})(\/[^\s]*)?$/;

    return urlPattern.test(url);
  }

  const handleNextButton = () => {
    const error = getValidationErrors(step);
    if(validateCriteria() && step===1){
      return
    }
    if (error) {
      setFormValidationResponse({ error });
    } else {
      if (formValidationResponse) {
        setFormValidationResponse(null);
      }
      setStep((currStep) => currStep + 1);
    }
  };

  const handleBackButton = () => {
    if (formValidationResponse) {
      setFormValidationResponse(null);
    }
    setStep((currStep) => currStep - 1);
  };

  return (
    <>
      <div className=" w-full mt-5 md:mt-0">
        <div className="flex items-center w-full gap-3">
          <div className="h-[8px] bg-[#baccff] w-[95%] rounded-3xl">
            <div
              className="h-[8px] bg-[#1E57FE] rounded-3xl"
              style={{ width: `${((step + 1) / stepTitles.length) * 100}%` }}
            ></div>
          </div>

          <label className="text-blue-700/80">{step + 1}/{stepTitles.length}</label>

        </div>
        <h2 className="font-bold mt-4 text-base tracking-normal text-gray-900">
          {/* Contact Details */}
          {stepTitles[step]}
        </h2>
        {/* {formValidationResponse &&
          Object.keys(formValidationResponse)[0] === "error" && (
            <div
              className="flex flex-grow items-center p-4 m-3 text-sm text-red-800 border border-red-300 rounded-lg bg-red-50"
              role="alert"
            >
              <svg
                className="flex-shrink-0 inline w-4 h-4 me-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
              </svg>
              <span className="sr-only">Info</span>
              <div>
                {formValidationResponse[Object.keys(formValidationResponse)[0]]}
              </div>
            </div>
          )} */}
        {/* 
        {formValidationResponse &&
          Object.keys(formValidationResponse)[0] === "success" && (
            <div
              class="flex items-center p-4 m-3 mb-4 text-sm text-green-800 border border-green-300 rounded-lg bg-green-50"
              role="alert"
            >
              <svg
                class="flex-shrink-0 inline w-4 h-4 me-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
              </svg>
              <span class="sr-only">Info</span>
              <div>
                {
                  formValidationResponse[
                  Object.keys(formValidationResponse)[0]
                  ]
                }
              </div>
            </div>
          )} */}
      </div>

      <form
        id="candidate-question-form"
        className="flex flex-col h-[80%] overflow-auto grow justify-between w-full"
      >
        <div className="py-3">
          {stepTitles[step] === "Personal Info" && (
            <PersonalInfoForm
              userFormData={userFormData}
              handleInputChange={handleInputChange}
              setUserName={setUserName}
              handleKeyDown={handleKeyDown}
              preference={preference}
              PhotoIcon={PhotoIcon}
              resumeFile={resumeFile}
              profilePic={profilePic}
              introVideo={introVideo}
              handleFileChange={handleFileChange}
              fileInputRef={fileInputRef}
              country={country}
              formValidationResponse={formValidationResponse}
            />
          )}
          {stepTitles[step] === "Professional Info" && (
            <>
              <ProfessionalInfoForm
                userFormData={userFormData}
                handleInputChange={handleInputChange}
                setUserName={setUserName}
                handleKeyDown={handleKeyDown}
                preference={preference}
                PhotoIcon={PhotoIcon}
                handleFileChange={handleFileChange}
                fileInputRef={fileInputRef}
                formValidationResponse={formValidationResponse}
              />
              <CriteriaForm
                setFormValidationResponse={setFormValidationResponse}
                jobId={jobDetail?.id}
                criteriaResponses={criteriaResponses}
                setCriteriaResponses={setCriteriaResponses}
                criteriaErrors={criteriaErrors} />
            </>
          )}
          {stepTitles[step] === "Questions" && (
            <QuestionTestForm
              questions={questions}
              InformationCircleIcon={InformationCircleIcon}
              responseChange={responseChange}
              AudioInput={AudioInput}
              setError={setError}
              responses={responses}
              setResponses={setResponses}
              error={error}
              jobDetail={jobDetail}
              formValidationResponse={formValidationResponse}
            />
            // <CriteriaForm jobId={jobDetail?.id} />
          )}
        </div>
      </form>

      <div className="flex h-10p items-center justify-end gap-x-6">
        {step !== 0 && (
          <button
            type="button"
            className="text-sm font-semibold leading-6 text-gray-900"
            // onClick={() => (setStep((currStep) => currStep - 1))}
            onClick={handleBackButton}
          >
            Back
          </button>
        )}

        {step === stepTitles.length - 1 ? (
          <button
            disabled={submitting}
            onClick={handleUpload} // Change to regular button and call handleUpload directly
            className="rounded-md disabled:bg-opacity-40 bg-blue-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            {submitting ? (
              <label className="inline-flex items-center justify-center gap-x-2 ">
                <svg
                  aria-hidden="true"
                  className="inline w-5 h-5 text-gray-200 animate-spin fill-blue-600"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                  />
                </svg>
                Submitting
              </label>
            ) : (
              "Submit"
            )}
          </button>
        ) : (
          <button
            className="rounded-md disabled:bg-opacity-40 bg-blue-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            onClick={handleNextButton} // Regular button for 'Next' action
          >
            Next
          </button>
        )}
      </div>

      {showModal && (
        <div
          class="relative  z-10"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div class="fixed  inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

          <div class="fixed h-full  inset-0 z-10 w-screen overflow-y-auto">
            <div class="flex min-h-full h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
              <div class="relative lg:min-w-96  h-auto transform flex-col justify-evenly rounded-lg bg-white text-left shadow-xl transition-all my-8">
                {/* Header  */}
                <div className="border-b rounded-t-lg bg-gray-50 flex justify-between px-5 py-4">
                  <div className="flex items-center space-x-3">
                    <i class="fa-solid p-3 bg-yellow-300 text-gray-700 rounded-full fa-triangle-exclamation"></i>
                    <h3
                      class="text-base font-semibold leading-6 text-gray-900"
                      id="modal-title"
                    >
                      Alert
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setIsSubmitted(false);
                    }}
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                {/* Body  */}
                <div class="bg-white  px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div class="sm:flex sm:items-start h-5/6 ">
                    <div class="mt-3 text-center  h-full w-full sm:ml-4 sm:mt-0 sm:text-left">
                      <div className="col-span-full">
                        {!maxRetriesExceeded ? (
                          <label
                            htmlFor="cover-photo"
                            className="block text-sm text-start font-medium leading-6 text-gray-900"
                          >
                            You have already applied for this job.<br></br> Do
                            you wish to update your resume?
                          </label>
                        ) : (
                          <label
                            htmlFor="cover-photo"
                            className="block text-sm text-start font-medium leading-6 text-gray-900 p-10"
                          >
                            You have exceeded the number of retries for this job
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer  */}
                <div class="bg-gray-50 rounded-b-lg ms-auto px-4 py-3 flex justify-end items-center sm:px-6 space-x-3">
                  {!maxRetriesExceeded && (
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={updateResume}
                      className="h-10  rounded-md disabled:bg-opacity-40 bg-blue-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                      {submitting ? "Submitting" : "Yes"}
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setShowModal(false);
                      setIsSubmitted(false);
                    }}
                    type="button"
                    class=" w-20 h-10  justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                  >
                    {!maxRetriesExceeded ? "Cancel" : "Okay"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CandidateQuestions;
