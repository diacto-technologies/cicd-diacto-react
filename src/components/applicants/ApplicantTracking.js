import React, { useContext, useEffect, useState } from "react";
import "react-step-progress-bar/styles.css";
import { ProgressBar, Step } from "react-step-progress-bar";
import { useParams } from "react-router-dom";
import ReactSelect from "react-select";
import AuthContext from "../../context/AuthContext";
import { CheckCircleIcon, MinusCircleIcon } from "@heroicons/react/24/outline";
import { selectStyle } from "../../constants/constants";
import Select from "react-select";

const ApplicantTracking = ({setStages, jobId, jobTitle }) => {
  const { authTokens, userDetails } = useContext(AuthContext);
  const { applicantId } = useParams();

  // State Variables
  const [loadingAnswers, setLoadingAnswers] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [loadingTestStatus, setLoadingTestStatus] = useState(false);
  const [loadingResults, setLoadingResults] = useState(false);
  const [loadingTestLog, setLoadingTestLog] = useState(true);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(null);
  const [percent, setPercent] = useState(0);
  const [candidateScore, setCandidateScore] = useState(0);
  const [testLogs, setTestLogs] = useState([]);
  const [testLogOptions, setTestLogOptions] = useState([]);
  const [selectedTestLog, setSelectedTestLog] = useState(null);
  const [testData, setTestData] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [testResults, setTestResults] = useState([]);
  const [candidateTime, setCandidateTime] = useState(0);
  const [testStatusData, setTestStatusData] = useState([]);
  const [candidateAnswers, setCandidateAnswers] = useState([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [statusText, setStatusText] = useState("Review Pending");
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [testQuestions, setTestQuestions] = useState([]);
  const [questionsNextPage, setQuestionsNextPage] = useState(null);
  const [answersNextPage, setAnswersNextPage] = useState(null);

  const [resumeScreeningStatuses, SetResumeScreeningStatuses] = useState([
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
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchTestLogs();
  }, [jobId]);

  useEffect(() => {
    if (selectedTest) {
      // console.log('attempted',selectedTest?.total_question?.length,selectedTest)
      fetchTestQuestion(selectedTest?.id, selectedTest?.type);
    }
  }, [selectedTest]);

  useEffect(() => {
    if (testQuestions) {
      // console.log('test question',testQuestions.flatMap((q)=>q.id))

      const questionIds = testQuestions.flatMap((q) => q.id) || [];
      //   console.log(questionIds)
      if (questionIds.length > 0) {
        fetchCandidateAnswers(
          questionIds,
          selectedTestLog?.id,
          selectedTest?.type,
          selectedTest?.id,
          answersNextPage
        );
      }
    }
  }, [testQuestions]);
  // Runs when a test group is selected
  useEffect(() => {
    if (selectedTestLog) {
      setSelectedStatus(null)
      setTestQuestions([]);
      setAnswersNextPage(null);
      setQuestionsNextPage(null);
      console.log(selectedTestLog);
      updateProgress(selectedTestLog);
      const tests =
        (selectedTestLog?.test.length &&
          selectedTestLog.test.map((item) => ({
            ...item,
            type: "user-owned-assessment",
          }))) ||
        [];
      const preBuiltAssessments =
        (selectedTestLog?.prebuilt_assessment.length &&
          selectedTestLog.prebuilt_assessment.map((item) => ({
            ...item,
            type: "prebuilt-assessment",
          }))) ||
        [];
      const combinedAssessments = [...tests, ...preBuiltAssessments];
      // console.log(tests,'tests',preBuiltAssessments,'prebuilt',combinedAssessments,'combine')
      const questionsTotal = combinedAssessments.reduce(
        (sum, assessment) => sum + assessment.total_question,
        0
      );
      if (combinedAssessments.length) {
        setTestData(combinedAssessments);
        setSelectedTest(combinedAssessments[0] || []);
        fetchResults(
          selectedTestLog?.id,
          combinedAssessments.map((test) => test.id)
        );
        fetchTestStatus(selectedTestLog?.id);
      }
      setTotalQuestions(questionsTotal);

      setStatusText(selectedTestLog?.status_text);
    }
  }, [selectedTestLog]);

  useEffect(() => {
    if (selectedStatus) {
      updateStatus(selectedStatus.label)
    }
  },[selectedStatus])

  // Calculate Correct Count

  useEffect(() => {
    if (testStatusData && testResults && selectedTest) {
      const test = testStatusData.find((test) =>
        test.test
          ? Number(test.test) === selectedTest.id
          : test.prebuilt_assessment === selectedTest.id
      );
      const result = testResults.find((r) =>
        r.test
          ? Number(r.test) === selectedTest.id
          : r.prebuilt_assessment === selectedTest.id
      );

      setCandidateScore(result?.score || 0);
      setCandidateTime(test?.duration || 0);
      // fetchResults(selectedTestLog?.id,selectedTest?.id)
      const correct =
        testResults?.find(
          (result) =>
            result.test === selectedTest?.id ||
            result.prebuilt_assessment === selectedTest?.id
        )?.correct_answer_count || 0;

      setCorrectCount(correct);
    }
  }, [testStatusData, testResults, selectedTest]);

  // Fetch Test Logs
  async function fetchTestLogs() {
    setLoadingTestLog(true);
    try {
      const response = await fetch(
        `/test/testlog-for-report/?job_id=${jobId}&candidate_id=${applicantId}`,
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
      if (data.length) {
        setTestLogs(data);

        const options = data.map((testLog) => {
          const testTitles =
            testLog.test.length > 0
              ? testLog.test.map((test) => test.title).join(", ")
              : "";
          const prebuiltAssessmentTitles =
            testLog.prebuilt_assessment.length > 0
              ? testLog.prebuilt_assessment
                  .map((assessment) => assessment.title)
                  .join(", ") // Fetching id here
              : "";
          const combinedTitles = [testTitles, prebuiltAssessmentTitles]
            .filter(Boolean)
            .join(", ");

          // Generate the final label
          const label = `${jobTitle}${
            combinedTitles ? ` (${combinedTitles})` : ""
          }`;
          return {
            ...testLog,
            value: testLog.id,
            label: label,
          };
        });
        setTestLogOptions(options);
        setSelectedTestLog(options[0]);
        updateProgress(options[0]);
        setLoadingTestLog(false);
      }
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setLoadingTestLog(false);
    }
  }

  // Fetch Test Results
  async function fetchResults(testLogId, testId) {
    // console.log(testId,'fetch result')
    setLoadingResults(true);
    try {
      const response = await fetch(
        `/test/result/?candidate_id=${applicantId}&test_log_id=${testLogId}&test_id=${testId}`,
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

      setTestResults(data);
      if (data.length > 0) {
        setCandidateScore(data[0].score);
      }
      setLoadingResults(false);
    } catch (error) {
      console.error(error);
      setLoadingResults(false);
      setError(error.message);
    } finally {
      setLoadingResults(false);
    }
  }

  // Fetch Test Status
  async function fetchTestStatus(testLogId) {
    setLoadingTestStatus(true);
    try {
      const response = await fetch(`/test/test-status/?test_log=${testLogId}`, {
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
      setTestStatusData(data);
      setLoadingTestStatus(false);
    } catch (error) {
      console.error(error);
      setLoadingTestStatus(false);
      setError(error.message);
    } finally {
      setLoadingTestStatus(false);
    }
  }
  async function fetchTestQuestion(testId, assessmentType, pageUrl = null) {
    setLoadingQuestions(true);
    try {
      const url = pageUrl
        ? pageUrl
        : `/test/questions/?test_id=${testId}&type=${assessmentType}`;
      const response = await fetch(url, {
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
      // console.log(data,'test question')
      setTestQuestions((previousQuestions) => [
        ...previousQuestions,
        ...data.results,
      ]);
      setQuestionsNextPage(data.next);
      // setPreviousPage(data.previous);
      setLoadingQuestions(false);
    } catch (error) {
      console.error(error);
      setLoadingQuestions(false);

      setError(error.message);
    } finally {
      setLoadingQuestions(false);
    }
  }
  // console.log(testQuestions,'questions')
  // Fetch Candidate Answers
  async function fetchCandidateAnswers(
    questionIds,
    testLogId,
    assessmentType,
    testId,
    pageUrl
  ) {
    // console.log(testId,'fetch candidateanswer',assessmentType)
    setLoadingAnswers(true);
    try {
      // const query = `question_id=` + questionIds.map((id) => `${id}`).join(",");
      const response = await fetch(
        pageUrl
          ? pageUrl
          : `/test/answers/?candidate_id=${applicantId}&job_id=${jobId}&test_log_id=${testLogId}&test_id=${testId}&type=${assessmentType}`,
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
      setAnswersNextPage(data.next);

      const correct = data?.results?.filter((answer) => answer.correct).length;
      setCorrectCount(correct);
      setCandidateAnswers((previousAnswer) => [
        ...previousAnswer,
        ...data?.results,
      ]);
      setLoadingAnswers(false);
    } catch (error) {
      console.error(error);
      setError(error.message);
      setLoadingAnswers(false);
    } finally {
      setLoadingAnswers(false);
    }
  }

  // Handle Test Selection
  const handleTestClick = (testItem) => {
    if (testItem?.id !== selectedTest?.id) {
      setTestQuestions([]);
      setQuestionsNextPage(null);
      setCandidateAnswers([]);
      setAnswersNextPage(null);
      setSelectedTest(testItem);
    }
  };

  // Update Progress Percentage
  const updateProgress = (testLogData) => {
    const { link_opened, is_approved, completed, started } = testLogData;
    const currentProgress = [];

    if (testLogData.assigned_at) {
      const item = {
        label: "Invited On",
        percent: 1,
        field: "assigned_at",
        date: testLogData["assigned_at"],
      };
      currentProgress.push(item);
      setPercent(item.percent);
    }
    if (link_opened) {
      const item = {
        label: "Link Opened",
        percent: 25,
        field: "link_opened_at",
        date: testLogData["link_opened_at"],
      };
      currentProgress.push(item);
      setPercent(item.percent);
    }

    if (started) {
      const item = {
        label: "Started",
        percent: 50,
        field: "started_at",
        date: testLogData["started_at"],
      };
      currentProgress.push(item);
      setPercent(item.percent);
    }
    if (completed) {
      const item = {
        label: "Completed",
        percent: 75,
        field: "completed_at",
        date: testLogData["completed_at"],
      };
      currentProgress.push(item);
      setPercent(item.percent);
    }
    if (link_opened && is_approved) {
      const item = {
        label: "Shortlisted",
        percent: 100,
        field: "approved_at",
        date: testLogData["approved_at"],
      };
      currentProgress.push(item);
      setPercent(item.percent);
    }
    setProgress(currentProgress);
  };

  // Handle Shortlist Action
  async function updateStatus(status_text) {
    setUpdatingStatus(true)
    const testLogId = selectedTestLog?.id;
    const payload = {
      status_text: status_text,
      updated_by: userDetails?.id,
      updated_at : new Date()
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
      const response = await fetch(`/test/testlog/${testLogId}/`, {
        method: "PUT",
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
        updateProgress(data);
        setStatusText(data.status_text);
        setSelectedTestLog((prev) => ({
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
        setUpdatingStatus(false)
      }
    } catch (error) {
      console.error(error);
      setError(error.message);
      setUpdatingStatus(false)

    }
  }

  // Handle TestLog Selection Change
  const handleSelectChange = (selectedOption) => {
    setSelectedTestLog(selectedOption);
  };

  // Custom Styles for ReactSelect
  const customStyles = {
    control: (provided) => ({
      ...provided,
      width: "300px",
    }),
  };

  const getDifficultyIcon = (difficulty) => {
    if (difficulty === "medium") {
      return (
        <i className="fa-solid fa-fire-flame-curved me-1 text-orange-400"></i>
      );
    } else if (difficulty === "hard") {
      return (
        <span className="space-x-1 me-1.5">
          <i className="fa-solid fa-fire-flame-curved text-orange-400"></i>
          <i className="fa-solid fa-fire-flame-curved text-orange-400"></i>
        </span>
      );
    }
    return null;
  };

  const getChoiceClasses = (choice, isChoiceSelected) => {
    let baseClasses = "inline-block px-4 py-2 rounded-lg";

    if (choice.correct && isChoiceSelected) {
      return `${baseClasses} bg-green-500 text-white font-semibold`; // Correct and selected
    } else if (choice.correct) {
      return `${baseClasses} bg-green-100 text-green-800 font-semibold`; // Correct but not selected
    } else if (isChoiceSelected) {
      return `${baseClasses} bg-red-100 text-red-800 font-semibold`; // Selected but incorrect
    }

    return `${baseClasses} bg-gray-100 text-gray-800`; // Default for unselected and incorrect
  };

  // console.log(selectedTest,candidateAnswers,'details')

  const loadNextPage = () => {
    if (questionsNextPage) {
      fetchTestQuestion(
        selectedTest?.id,
        selectedTest?.type,
        questionsNextPage
      );
      // fetchCandidateAnswers(testQuestions[0],selectedTestLog.id,selectedTest.type,selectedTest.id,answersNextPage)
    }
  };
  // const loadPreviousPage = () => {
  //   if (previousPage) {
  //     fetchTestQuestion(selectedTest?.id, selectedTest?.type, previousPage); // Pass the previousPage URL
  //   }
  // };
  return (
    <>
      {!loadingTestLog ? (
        <>
          {testLogs.length > 0 ? (
            <>
              <div className="transition-all mt-3  bg-white w-full">
                <div className="flex items-center justify-start  p-4 border rounded-md space-x-4 w-full">
                  <label
                    htmlFor="Jobs"
                    className="text-base font-semibold leading-8 text-gray-900"
                  >
                    Assigned Tests
                  </label>
                  <ReactSelect
                    className="text-sm  min-w-fit"
                    placeholder="Select Testlog"
                    value={selectedTestLog}
                    onChange={handleSelectChange}
                    isLoading={loadingTestLog}
                    options={testLogOptions}
                    styles={selectStyle}
                  />
                </div>
              </div>

              {/* Candidate Test Timeline */}
              <div className="transition-all flex justify-between items-center mb-1 rounded-md px-10  mt-10">
                <div>
                  <h3 className="text-2xl font-semibold leading-7 text-gray-900 ">
                    {jobTitle}
                  </h3>
                  <p className="flex gap-2 items-center mt-1">
                    <span className="text-sm text-gray-500">
                      {" "}
                      {(selectedTestLog?.test?.length || 0) +
                        (selectedTestLog?.prebuilt_assessment?.length ||
                          0)}{" "}
                      Tests
                    </span>
                    <div className="h-1 w-1 rounded-full bg-gray-500"></div>
                    <span className="text-sm text-gray-500">
                      {totalQuestions} Questions
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <label
                    className={`flex bg-blue-50 ring-1 me-3 my-2 px-3 py-1 rounded-lg font-normal
                      ${selectedTestLog?.status_text === "Under Review" &&
                        "bg-yellow-50 text-yellow-700 ring-yellow-700/40"
                       }
                        ${selectedTestLog?.status_text === "Shortlisted" &&
                        "bg-green-50 text-green-700 ring-green-700/40"
                       }
                        ${selectedTestLog?.status_text === "Not Shortlisted" &&
                        "bg-red-50 text-red-700 ring-red-700/40"
                       }
                        ${selectedTestLog?.status_text === "On Hold" &&
                        "bg-orange-50 text-orange-700 ring-orange-700/40"
                       }
                        ${selectedTestLog?.status_text === "Completed" &&
                        "bg-green-50 text-green-700 ring-green-700/40"
                       }
            `}
                  >
                    Status :{" "}
                    {updatingStatus ? (
                      <span className="px-1"> Updating</span>
                    ) : (
                      selectedTestLog?.status_text
                    )}
                  </label>
                  <Select
                    isDisabled={updatingStatus || !selectedTestLog?.completed}
                    className="w-5/6 md:w-72"
                    styles={selectStyle}
                    value={selectedStatus}
                    isSearchable={false}
                    onChange={(selectedOption) =>
                      setSelectedStatus(selectedOption)
                    }
                    options={resumeScreeningStatuses}
                    placeholder={ selectedTestLog?.completed ? "Mark as" : "Not Completed Yet"}
                  />
                </div>
              </div>
              <div className="border rounded-lg mx-10 my-6">
                <div className="transition-all px-10 w-full py-3  flex flex-col justify-center ">
                  <h3 className="mb-2 text-base font-semibold leading-7 text-gray-900">
                    Timeline
                  </h3>
                  <div className="w-full transition-all px-10 py-6 border-b flex justify-center bg-white">
                    {!loadingTestStatus ? (
                      <div className="px-8 py-2 h-11 mb-2 w-[90%] ">
                        {percent && progress ? (
                          <ProgressBar
                            percent={percent}
                            filledBackground="#7474f4"
                          >
                            {[
                              "Invited On",
                              "Open Invite",
                              "Started Test",
                              "Ended Test",
                              "Shortlisted",
                            ].map((label, index) => (
                              <Step key={index} transition="scale">
                                {({ accomplished }) => (
                                  <div className="flex mt-10 flex-col items-center justify-end ">
                                    <div
                                      className={`flex items-center justify-center  rounded-full bg-white  font-bold`}
                                    >
                                      {accomplished ? (
                                        <CheckCircleIcon className="w-6 h-6 " />
                                      ) : (
                                        <MinusCircleIcon className="w-6 h-6 text-gray-600" />
                                      )}
                                    </div>
                                    <div
                                      className={`flex flex-col items-center justify-end mt-1 text-xs ${"text-gray-400"}`}
                                    >
                                      <span className="text-gray-600">
                                        {progress[index]?.label || label}
                                      </span>
                                      <p className="text-nowrap">
                                        {progress[index]?.date
                                          ? new Date(
                                              progress[index]?.date
                                            ).toLocaleString("en-US", {
                                              day: "numeric",
                                              month: "short", // "short" for abbreviated month (e.g., "Sept")
                                              year: "numeric",
                                              hour: "numeric",
                                              minute: "numeric",
                                              hour12: true, // AM/PM format
                                            })
                                          : "NA"}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </Step>
                            ))}
                          </ProgressBar>
                        ) : (
                          <div className="w-full h-full text-center">
                            No Data available
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="px-8 py-2 h-11 mb-2 w-[90%] text-center">
                        Loading Status
                      </div>
                    )}
                  </div>
                </div>

                {/* Candidate Tests */}
                <div className="transition-all w-full mb-1 rounded-md px-10  mt-5">
                  <h3 className="mb-2 text-base font-semibold leading-7 text-gray-900">
                    Assessments
                    <p className="text-gray-500 font-normal text-sm">
                      Click on the assessment to see a detailed submission
                      report
                    </p>
                  </h3>
                  {!loadingResults ? (
                    <div className="transition-all mb-3 px-10 border-b  p-4 bg-white ">
                      {testData.map((test) => {
                        const isSelected = selectedTest?.id === test.id;
                        const correctAnswers =
                          testResults.find(
                            (result) =>
                              result.test === test.id ||
                              result.prebuilt_assessment === test.id
                          )?.correct_answer_count || 0;

                        const totalQuestions = test?.total_question || 0;
                        const correctPercent =
                          totalQuestions > 0
                            ? (correctAnswers / totalQuestions) * 100
                            : 0;
                        return (
                          <div
                            key={test.id}
                            className={`flex items-center mb-3 justify-between w-full p-4 bg-white rounded-lg shadow-lg transition-all duration-300 cursor-pointer hover:bg-gray-100 ${
                              isSelected ? "border-2 border-blue-500" : ""
                            }`}
                            onClick={() => handleTestClick(test)}
                          >
                            <div className="flex items-center space-x-2 w-1/6">
                              <span className="text-gray-700 font-medium">
                                {test.title}
                              </span>
                            </div>
                            {/* Progress Bar Section */}
                            <div className="relative w-2/3">
                              <div className="relative w-full bg-gray-200 h-6 rounded-full overflow-hidden">
                                {/* Correct Portion */}
                                <div
                                  className="absolute top-0 left-0 h-full bg-green-400 flex justify-center items-center text-white text-sm font-medium"
                                  style={{ width: `${correctPercent}%` }}
                                >
                                  {correctAnswers}
                                </div>
                                {/* Incorrect Portion */}
                                {totalQuestions - correctAnswers > 0 && (
                                  <div
                                    className="absolute top-0 left-0 h-full bg-red-400 flex justify-center items-center text-white text-sm font-medium"
                                    style={{
                                      width: `${100 - correctPercent}%`,
                                      marginLeft: `${correctPercent}%`,
                                    }}
                                  >
                                    {totalQuestions - correctAnswers}
                                  </div>
                                )}
                              </div>
                            </div>
                            {/* Stats Section */}
                            <div className="flex items-center justify-end w-1/6 space-x-4">
                              <span className="text-gray-700 font-medium text-lg">
                                {correctPercent.toFixed(0)}%
                              </span>
                              <span className="text-gray-500 text-sm">
                                {correctAnswers}/{totalQuestions}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="w-full h-full text-center transition-all mb-3 px-10 border-b  p-4 bg-white animate-pulse">
                      Loading
                    </div>
                  )}
                </div>

                {/* Candidate Test Score */}
                <div className="transition-all mb-1 rounded-md px-10  mt-10">
                  <h3 className="text-2xl font-semibold leading-7 text-gray-900 py-3">
                    {selectedTest?.title}
                  </h3>
                </div>

                {/* Detailed Submission Report */}
                <div className="transition-all px-10 mb-5">
                  <div className="bg-white rounded-md p-6 ring-2 ring-indigo-600">
                    <div className="mt-2 text-sm text-gray-900">
                      <div className=" flex justify-between items-center mb-5">
                        <div className="">
                          <h3 className=" text-xl font-medium leading-2 text-gray-900">
                            Detailed Submission Report
                          </h3>
                          <p className="m-0 text-sm leading-8 text-gray-500">
                            Multiple Choice Questions
                          </p>
                        </div>

                        <label className="text-gray-700 ">
                          <span className="text-2xl">
                            {candidateScore || 0}
                          </span>{" "}
                          / 100%
                        </label>
                      </div>
                      <div className="flex p-3 items-center justify-between gap-2 rounded-md border border-gray-200">
                        <div>
                          <span className="">Time Taken : </span>
                          <span className="">
                            <strong className="text-lg">
                              {parseFloat(candidateTime || 0).toFixed(2) || 0}
                            </strong>{" "}
                            /{" "}
                            {(
                              parseInt(selectedTest?.time_duration) / 60
                            )?.toFixed(2)}{" "}
                            mins
                          </span>
                        </div>

                        <div className="space-x-4">
                          <label className=" ml-auto italic">
                            attempted{" "}
                            <strong className="text-gray-600 text-base font-normal ">
                              {selectedTest?.total_question}{" "}
                            </strong>
                          </label>
                          <label className=" ml-auto italic">
                            correct{" "}
                            <strong className="text-gray-600 text-base font-normal">
                              {correctCount}{" "}
                            </strong>
                          </label>
                        </div>
                      </div>
                      <div className="flex flex-col gap-5 mt-3">
                        {testQuestions?.map((question) => {
                          const parsedChoices = JSON.parse(question.choices);
                          const candidateAnswer = candidateAnswers?.find(
                            (ans) => ans.question === question.id
                          );

                          return (
                            <li
                              key={question.id}
                              className={`flex flex-col p-4 bg-white rounded-lg shadow-md border border-gray-300 ${
                                loadingQuestions && "animate-pulse w-full"
                              }`}
                            >
                              <div className="flex w-full justify-between items-center mb-4">
                                <span className="font-medium">
                                  {question.text}
                                </span>
                                <div className="flex items-center gap-3">
                                  <span>
                                    {candidateAnswer?.duration || 0} /{" "}
                                    {question.time_limit} secs
                                  </span>
                                  <span className="font-light px-2 py-1 rounded-md bg-blue-950 text-white">
                                    {getDifficultyIcon(
                                      question?.difficulty?.difficulty
                                    )}
                                    {question?.difficulty?.difficulty}
                                  </span>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                {(question.type.toLowerCase() === "single" ||
                                  question.type.toLowerCase() === "multiple") &&
                                  parsedChoices.map((choice, idx) => {
                                    const isChoiceSelected =
                                      candidateAnswer?.selected_choice?.some(
                                        (selected) =>
                                          selected.value === choice.value
                                      );
                                    const choiceClasses = getChoiceClasses(
                                      choice,
                                      isChoiceSelected
                                    );

                                    return (
                                      <span key={idx} className={choiceClasses}>
                                        {choice.value}
                                      </span>
                                    );
                                  })}
                                {(question.type.toLowerCase() === "single" ||
                                  question.type.toLowerCase() === "multiple") &&
                                  candidateAnswer?.selected_choice?.length ===
                                    0 && (
                                    <span className="w-full text-red-500">
                                      No answer was selected.
                                    </span>
                                  )}
                                {question?.type.toLowerCase() === "text" && (
                                  <span
                                    className={`${
                                      candidateAnswer?.text
                                        ? "bg-teal-50/70 ring-green-200/80"
                                        : "bg-red-50/70 ring-red-200/80"
                                    }  ring-2  rounded-md p-3 w-1/2`}
                                  >
                                    {candidateAnswer?.text ||
                                      "No response available"}
                                  </span>
                                )}
                              </div>
                            </li>
                          );
                        })}
                        <div>
                          {/* {previousPage && (
                          <button onClick={loadPreviousPage}>Load Previous Questions</button>
                        )} */}
                          {questionsNextPage && (
                            <button onClick={loadNextPage}>
                              Load More Questions
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              No Assessments found for the candidate
            </div>
          )}
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          Loading Assessments
        </div>
      )}
    </>
  );
};
export default ApplicantTracking;
//  const correctCount = candidateanswer.filter(answer => answer.correct).length;
