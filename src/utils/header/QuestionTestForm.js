import React, { useEffect } from "react";
import { useState } from "react";
import { api } from "../../constants/constants";

function QuestionTestForm({
  questions,
  InformationCircleIcon,
  responseChange,
  AudioInput,
  setError,
  setResponses,
  responses,
  error,
  jobDetail,
  formValidationResponse
}) {
  const [activeRecordingId, setActiveRecordingId] = useState(null);
  const [criteria, setCriteria] = useState(null)
  const [loadingCriterias, setLoadingCriterias] = useState(false)
  useEffect(() => {
    if (jobDetail?.id) {
      fetchCriteria()
    }
  }, [jobDetail])

  async function fetchCriteria() {
    try {
      setLoadingCriterias(true)
      const response = await fetch(`${api}/jobs/criteria/job/${jobDetail?.id}/`);
      if (!response.ok) {
        throw new Error("Failed to fetch criteria");
      }
      const data = await response.json();
      setCriteria(data);
      setLoadingCriterias(false)
    } catch (error) {
      setLoadingCriterias(false)
      console.error("Error fetching criteria:", error);
    }
  }



  const handleStartRecording = (id) => {
    if (activeRecordingId === null) {
      setActiveRecordingId(id); // Allow recording if none is active
    }
  };

  const handleStopRecording = () => {
    setActiveRecordingId(null); // Stop any active recording
  };
  return (
    <>
      {formValidationResponse &&
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
        )}
      <div className="px-0 md:px-4 grid grid-cols-1 md:grid-cols-2 gap-4 gap-y-4">

        {questions && questions.length > 0 && (
          <div className="col-span-full py-5">
            <section className="mb-4 bg-blue-50 border border-blue-200 w-full p-4 rounded-lg shadow-md">
              <div className="flex items-center mb-3">
                <InformationCircleIcon className="w-5 h-5 text-blue-600 mr-2" />
                <h2 className="text-blue-700/70 font-semibold text-base">
                  Important Guidelines for Audio Responses
                </h2>
              </div>

              <ul className="list-disc list-inside text-sm text-gray-600 space-y-2">
                <li>
                  <strong>All questions are mandatory.</strong> Each question must
                  be answered to complete the application process.
                </li>
                <li>
                  <strong>
                    Audio responses should be at least 30 seconds long.
                  </strong>{" "}
                  Provide thoughtful and complete answers.
                </li>
                <li>
                  <strong>Original responses only.</strong> Please avoid reading
                  from prepared or AI-generated responses. Authenticity is
                  essential and will be taken into account during evaluation.
                </li>
                <li className="text-red-500/80 font-medium">
                  Violation of these guidelines, including reading responses
                  verbatim, may result in disqualification.
                </li>
              </ul>
            </section>

            {questions.map((question) => (
              <div className="w-full mb-4 pt-3">
                <label className="mb-2 block text-base leading-6 text-gray-900 no-select">
                  {question.text} <span className="text-red-500">*</span>
                </label>
                {question.type === "text" && (
                  <input
                    onPaste={(event) => event.preventDefault()}
                    id={question.id}
                    name={"question-" + question.id}
                    type="text"
                    required
                    onChange={(e) =>
                      responseChange(question.id, e.target.value, "text")
                    }
                    value={
                      responses.filter(
                        (resQuestion) => resQuestion?.questionId === question?.id
                      )[0]?.answer
                    }
                    className="px-2 text-sm block w-full rounded-md border-1 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm sm:leading-6"
                  />
                )}
                {question.type === "audio" && (
                  <div>
                    <AudioInput
                      setError={setError}
                      question={question}
                      responses={responses}
                      setResponses={setResponses}
                      responseChange={responseChange}
                      recordingAllowed={
                        activeRecordingId === null ||
                        activeRecordingId === question.id
                      }
                      onStartRecording={() => handleStartRecording(question.id)}
                      onStopRecording={handleStopRecording}
                      activeRecordingId={activeRecordingId}
                    />
                    {error && error.audio && error.audio[question.id] && (
                      <p className="text-red-500 text-sm">
                        {error.audio[question.id]}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default QuestionTestForm;
