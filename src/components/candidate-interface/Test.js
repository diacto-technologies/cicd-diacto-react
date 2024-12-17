import React, { useState, useEffect, useRef } from "react";
import Question from "./Question";
import { useNavigate, useParams } from "react-router-dom";
import Questionnaire from "../candidate-form/Questionnaire";
import LinkExpired from "./LinkExpired";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { api } from "../../constants/constants";

const Test = () => {
  const { testlogId, candidateId, uniqueId, assessmentType, testId } = useParams();
  const [testGroupData, setTestGroupData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState([]);
  const [currentTest, setCurrentTest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [tests, setTests] = useState([]);
  const [testStartTime, setTestStartTime] = useState(new Date());
  const [isCompleted, setIsCompleted] = useState(false);
  const navigate = useNavigate();
  const panelRef = useRef(null);
  const [fetchingAnswers, setFetchingAnswers] = useState(true)
  const [fullscreenExitCount, setFullscreenExitCount] = useState(0);
  const [tabSwitchCount, setTabSwitchCount] = useState(0)
  const [proctoringId, setProctoringId] = useState(null)
  const [showFullScreenModal, setShowFullScreenModal] = useState(false)
  const [showTabChangeModal, setShowTabChangeModal] = useState(false)
  const [proctoringActive, setProctoringActive] = useState(true); // Tracks whether listeners should remain active

  useEffect(() => {
    fetchTestStatus();
    fetchTestGroup();
    fetchTest();
  }, []);

  useEffect(() => {
    if (testGroupData && testlogId && testId && questions) {
      fetchCandidateAnswers([], testlogId, assessmentType, testId)
    }
  }, [testGroupData, testlogId, testId, assessmentType])



  useEffect(() => {
    if (isCompleted && currentTest) {
      redirectToCompletion();
    }
  }, [isCompleted, currentTest]);

  useEffect(() => {
    const disableKeys = (event) => {
      if (
        event.key === "Tab" ||
        event.altKey || // Alt
        event.ctrlKey || // Ctrl
        event.key === "F5" ||                 // F5
        event.key === "Escape"
      ) {
        event.preventDefault();
        event.stopPropagation();
        // alert("This key combination is disabled during the assessment.");
      }
    };

    window.addEventListener('keydown', disableKeys);

    return () => {
      window.removeEventListener('keydown', disableKeys);
    };
  }, []);


  // useEffect(() => {
  //   const handleFullscreenChange = () => {
  //     // Check if the document is no longer in fullscreen mode
  //     if (!document.fullscreenElement) {
  //       setFullscreenExitCount((prevCount) => prevCount + 1);
  //       setShowFullScreenModal(true)
  //       // proctorTest(fullscreenExitCount + 1, tabSwitchCount);
  //       if (localStorage.getItem('proctor')) {
  //         console.log('Proctor exists in local storage');
  //         const proctorData = JSON.parse(localStorage.getItem('proctor'))
  //         proctorData.fullscreenExitCount += 1
  //         proctorTest(proctorData.fullscreenExitCount, proctorData.tabSwitchCount)
  //         localStorage.setItem('proctor', JSON.stringify(proctorData))
  //       } else {
  //         console.log('Proctor does not exist');
  //         const proctorData = { fullscreenExitCount: 1, tabSwitchCount: 0 };
  //         localStorage.setItem('proctor', JSON.stringify(proctorData));
  //         proctorTest(proctorData.fullscreenExitCount, proctorData.tabSwitchCount)
  //       }
  //     }
  //     else {
  //       setShowFullScreenModal(false)
  //     }
  //   };

  //   const handleVisibilityChange = () => {
  //     // Check if the tab becomes hidden
  //     if (document.visibilityState === 'hidden') {
  //       setTabSwitchCount((prevCount) => prevCount + 1);
  //       setShowTabChangeModal(true)
  //       // proctorTest(fullscreenExitCount, tabSwitchCount + 1);
  //       if (localStorage.getItem('proctor')) {
  //         console.log('Proctor exists in local storage');
  //         const proctorData = JSON.parse(localStorage.getItem('proctor'))
  //         proctorData.tabSwitchCount += 1
  //         proctorTest(proctorData.fullscreenExitCount, proctorData.tabSwitchCount)
  //         localStorage.setItem('proctor', JSON.stringify(proctorData))
  //       } else {
  //         console.log('Proctor does not exist');
  //         const proctorData = { fullscreenExitCount: 0, tabSwitchCount: 1 };
  //         localStorage.setItem('proctor', JSON.stringify(proctorData));
  //         proctorTest(proctorData.fullscreenExitCount, proctorData.tabSwitchCount)
  //       }
  //     }
  //   };

  //   if (proctoringActive) {
  //     // Add event listeners only if proctoring is active
  //     document.addEventListener('fullscreenchange', handleFullscreenChange);
  //     document.addEventListener('visibilitychange', handleVisibilityChange);
  //   }

  //   // Cleanup event listeners on component unmount
  //   return () => {
  //     document.removeEventListener('fullscreenchange', handleFullscreenChange);
  //     document.removeEventListener('visibilitychange', handleVisibilityChange);
  //   };
  // }, [fullscreenExitCount, tabSwitchCount, proctoringId, proctoringActive]);

  const removeListeners = () => {
    document.removeEventListener('fullscreenchange', handleFullscreenChange);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    console.log('Event listeners removed');
  };

  const handleFullscreenChange = () => {
    if (!document.fullscreenElement) {
      setFullscreenExitCount((prevCount) => prevCount + 1);
      setShowFullScreenModal(true);
      if (localStorage.getItem('proctor')) {
        const proctorData = JSON.parse(localStorage.getItem('proctor'));
        proctorData.fullscreenExitCount += 1;
        proctorTest(proctorData.fullscreenExitCount, proctorData.tabSwitchCount);
        localStorage.setItem('proctor', JSON.stringify(proctorData));
      } else {
        const proctorData = { fullscreenExitCount: 1, tabSwitchCount: 0 };
        localStorage.setItem('proctor', JSON.stringify(proctorData));
        proctorTest(proctorData.fullscreenExitCount, proctorData.tabSwitchCount);
      }
    }
  };

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      setTabSwitchCount((prevCount) => prevCount + 1);
      setShowTabChangeModal(true);
      if (localStorage.getItem('proctor')) {
        const proctorData = JSON.parse(localStorage.getItem('proctor'));
        proctorData.tabSwitchCount += 1;
        proctorTest(proctorData.fullscreenExitCount, proctorData.tabSwitchCount);
        localStorage.setItem('proctor', JSON.stringify(proctorData));
      } else {
        const proctorData = { fullscreenExitCount: 0, tabSwitchCount: 1 };
        localStorage.setItem('proctor', JSON.stringify(proctorData));
        proctorTest(proctorData.fullscreenExitCount, proctorData.tabSwitchCount);
      }
    }
  };

  useEffect(() => {
    if (proctoringActive) {
      // Add event listeners if proctoring is active
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    // Cleanup function to ensure listeners are removed when proctoring becomes inactive
    return () => {
      removeListeners();
    };
  }, [fullscreenExitCount, tabSwitchCount, proctoringId, proctoringActive]); // Depend on proctoringActive

  const proctorTest = async (fullscreenExitCount, tabSwitchCount) => {

    //console.log("inside proctorTest")
    const payload = {
      "fullscreen_exit_count": fullscreenExitCount,
      "tab_switch_count": tabSwitchCount,
    };

    if (proctoringId) {
      try {
        const response = await fetch(`${api}/test/proctoring/${proctoringId}/`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        //console.log(data)

        if (data.message === "The test has been submitted due to repeated fullscreen exits, which is against the test rules.") handleCandidateDisqualified("202");
        if (data.message === "The test has been submitted due to repeated tab switching, which is against the test rules.") handleCandidateDisqualified("203");
      } catch (error) {
        console.error("Error marking test as complete:", error);
      }
    }
    else {
      console.log("Proctoring ID not available")
    }
  }

  const enterFullScreen = () => {
    const element = panelRef.current;
    // console.log(element)
    if (element) {
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.mozRequestFullScreen) { // Firefox
        element.mozRequestFullScreen();
      } else if (element.webkitRequestFullscreen) { // Chrome, Safari, Opera
        element.webkitRequestFullscreen();
      } else if (element.msRequestFullscreen) { // IE/Edge
        element.msRequestFullscreen();
      }
    }
  };

  const fetchTestStatus = async () => {
    try {
      // Fetch the test status data
      const response = await fetch(`${api}/test/test-status/?test_log=${testlogId}`);
      if (!response.ok) throw new Error("Failed to fetch test data");

      // Parse the JSON response
      const data = await response.json();

      // Check if data exists and has valid content
      if (!data || data.length === 0) {
        throw new Error("No test data available.");
      }


      // Extract the first item from the data
      const testData = data.find((item) => {
        if (assessmentType === "u") {
          return item.test == testId
        }
        if (assessmentType === "p") {
          return item.prebuilt_assessment == testId
        }
      });
      if (testData) {
        const { test, prebuilt_assessment, test_type, question_count, randomize_question } = testData;

        // Check if the test is completed
        if (testData?.completed) {
          setIsCompleted(true);
          redirectToCompletion();
        } else {
          const test_id = assessmentType === "u" ? testData.test : testData.prebuilt_assessment
          // Determine the correct testId and fetch questions
          fetchTestQuestions(test_id, test_type, question_count, randomize_question);
        }
      }

    } catch (err) {
      // Handle any errors gracefully
      console.error('Error fetching test status:', err);
      setError(err.message);
    } finally {
      // Set loading state to false once the process is done
      setLoading(false);
    }
  };

  const fetchTestQuestions = async (testId, assessmentType, questionCount, randomizeQuestion) => {
    // console.log("FetchTestquestion Called")
    try {
      const response = await fetch(`${api}/test/assessment-questions/?test_id=${testId}&type=${assessmentType}&question_count=${questionCount}&randomize_question=${randomizeQuestion}`);
      if (!response.ok) throw new Error("Failed to fetch test data");
      const data = await response.json();
      // console.log(data.questions,'questions')
      setQuestions(data.questions)
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const markTestAsComplete = async () => {
    const payload = {
      candidate_id: candidateId,
      test_log_id: testlogId,
      started_at: testStartTime,
      completed_at: new Date(),
    };

    if (assessmentType === "u") {
      payload["test_id"] = testId
    }
    if (assessmentType === "p") {
      payload["prebuilt_assessment_id"] = testId
    }


    try {
      const response = await fetch(`${api}/test/result/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      // setIsCompleted(true);
      setProctoringActive(false); // Disable listeners
      removeListeners(); // Explicitly remove listeners
      redirectToCompletion();
    } catch (error) {
      console.error("Error marking test as complete:", error);
    }
  };

  const handleCandidateDisqualified = async (statusCode) => {
    const payload = {
      completed: true,
      status_text: "Disqualified",
      candidate_id: candidateId,
      test_log_id: testlogId,
      started_at: testStartTime,
      completed_at: new Date(),
    }

    try {
      const response = await fetch(`${api}/test/testlog/${testlogId}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      navigate(`/app/candidate/${candidateId}/test/${testlogId}/${uniqueId}/completed/${statusCode}`)
    } catch (error) {
      console.error("Error marking test as complete:", error);
    }
  }

  const fetchTestGroup = async () => {
    try {
      const response = await fetch(`${api}/test/testlog/${testlogId}/`);
      if (!response.ok) throw new Error("Failed to fetch test data");
      const data = await response.json();
      setTestGroupData(data);
      setProctoringId(data.proctoring)
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTest = async () => {
    try {
      const response = await fetch(`${api}/test/${assessmentType === "u" ? "tests" : "prebuiltassessments"}/${testId}/`);
      if (!response.ok) throw new Error("Failed to fetch test data");
      const data = await response.json();
      // // console.log("data : ", data);
      setCurrentTest(data);
      // setQuestions(data.question.length > 0 ? data.question : []);
      // Fetch candidate data based on assigned_to
      // fetchCandidateData(data.assigned_to);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const redirectToCompletion = () => {
    navigate(
      `/app/candidate/${candidateId}/test/${testlogId}/${uniqueId}/completed/${assessmentType}/${currentTest.id}/`
    );

  };

  async function fetchCandidateAnswers(questionIds, testLogId, assessmentType, testId) {
    setFetchingAnswers(true);
    try {
      const query = `question_id=` + questionIds.map((id) => `${id}`).join(",");
      const response = await fetch(
        `${api}/test/answers/?candidate_id=${candidateId}&type=${assessmentType === "u" ? "user-owned-assessment" : "prebuilt-assessment"}&job_id=${testGroupData?.job}&test_log_id=${testLogId}&test_id=${testId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();

      if (data.results.length) {
        handleCandidateDisqualified("201");
      }

      setFetchingAnswers(false)

    } catch (error) {
      console.error(error);
      setError(error.message);
      setFetchingAnswers(false)
    } finally {
      setLoading(false);
    }
  }

  // const handleNextQuestion = (response) => {
  //   setResponses([...responses, response]);

  //   // If it’s the last question, move to the next test
  //   if (currentQuestionIndex === currentTest.question.length - 1) {
  //     if (currentTestIndex < tests.length - 1) {
  //       setCurrentTestIndex(currentTestIndex + 1);
  //     } else {
  //       // All tests completed
  //       // console.log("All tests completed");
  //     }
  //   } else {
  //     setCurrentQuestionIndex(currentQuestionIndex + 1);
  //   }
  // };

  // console.log("No of exits: ", fullscreenExitCount, proctoringId)
  // console.log("showModal: ", showModal)

  // {200: ok, 201: reloaded, }
  return (
    <>
      {currentTest && !isCompleted && testGroupData && !fetchingAnswers && (
        <div onClick={() => enterFullScreen()} className="test w-full h-screen ">
          {/* <h2>{currentTest?.title}</h2>
          <div className="w-full p-2 h-20 bg-sky-100"></div> */}
          <Questionnaire
            panel={panelRef}
            questions={questions}
            candidateId={candidateId}
            testId={testId}
            assessmentType={assessmentType}
            testLogId={testlogId}
            tests={tests}
            testStartTime={testStartTime}
            jobId={testGroupData?.job}
            setIsCompleted={setIsCompleted}
            markTestAsComplete={markTestAsComplete}
          />
          {/* <Question
        question={currentTest?.question[currentQuestionIndex]}
        // onNextQuestion={handleNextQuestion}
        candidateId={candidateId}
        testlogId={testlogId}
      /> */}
        </div>
      )}

      {
        showFullScreenModal &&
        <div
          className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-50"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          {/* Modal Background Overlay */}
          <div className="fixed inset-0 bg-gray-900 bg-opacity-75"></div>

          {/* Modal Content */}
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md z-20">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b px-4 py-3 bg-gray-50 rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-800" id="modal-title">
                Warning
              </h3>
              <button
                onClick={() => enterFullScreen()}
                className="text-gray-500 hover:text-gray-800"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-8 text-gray-800">
              <p className="text-sm">
                You have exited fullscreen mode during the assessment. This behavior is
                being monitored and may lead to disqualification.
              </p>
              <p className="mt-3 text-sm font-medium text-red-600">
                Please return to fullscreen mode to continue.
              </p>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end items-center border-t px-4 py-3 bg-gray-50 rounded-b-lg space-x-3">
              <button
                type="button"
                onClick={() => enterFullScreen()}
                className="h-10 justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:ring-4 focus:ring-blue-300"
              >
                Enter Fullscreen
              </button>
              {/* <button
                onClick={() => setShowFullScreenModal(false)}
                className="h-10 justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button> */}
            </div>
          </div>
        </div>
      }
      {
        showTabChangeModal &&
        <div
          className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-50"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          {/* Modal Background Overlay */}
          <div className="fixed inset-0 bg-gray-900 bg-opacity-75"></div>

          {/* Modal Content */}
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md z-20">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b px-4 py-3 bg-gray-50 rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-800" id="modal-title">
                Tab Switching Detected
              </h3>
              <button
                onClick={() => setShowTabChangeModal(false)}
                className="text-gray-500 hover:text-gray-800"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-4 py-5 text-gray-800">
              <p className="text-sm">
                We noticed that you switched tabs during the assessment. This behavior
                is being monitored and recorded.
              </p>
              <p className="mt-3 text-sm font-medium text-red-600">
                Please stay on the assessment tab to avoid penalties or disqualification.
              </p>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end items-center border-t px-4 py-3 bg-gray-50 rounded-b-lg space-x-3">
              <button
                type="button"
                onClick={() => setShowTabChangeModal(false)}
                className="h-10 justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:ring-4 focus:ring-blue-300"
              >
                Acknowledge & Continue
              </button>
            </div>
          </div>
        </div>
      }



      {/* <div className="absolute inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-50">
        <div id="alert-additional-content-2" class="p-4 mb-4 text-red-800 border border-red-300 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400 dark:border-red-800" role="alert">
          <div class="flex items-center mb-5">
            <svg class="flex-shrink-0 w-4 h-4 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
            </svg>
            <span class="sr-only">Info</span>
            <h3 class="text-lg font-medium">Please don't exit fullscreen or change the tab</h3>
          </div>
          <div class="flex">
            <button type="button" class="text-white bg-red-800 hover:bg-red-900 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-xs px-3 py-1.5 me-2 text-center inline-flex items-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800" onClick={enterFullScreen}> */}
      {/* <svg class="me-2 h-3 w-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 14">
                <path d="M10 0C4.612 0 0 5.336 0 7c0 1.742 3.546 7 10 7 6.454 0 10-5.258 10-7 0-1.664-4.612-7-10-7Zm0 10a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" />
              </svg> */}
      {/* Enter Full Screen
            </button> */}
      {/* <button type="button" class="text-red-800 bg-transparent border border-red-800 hover:bg-red-900 hover:text-white focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-xs px-3 py-1.5 text-center dark:hover:bg-red-600 dark:border-red-600 dark:text-red-500 dark:hover:text-white dark:focus:ring-red-800" data-dismiss-target="#alert-additional-content-2" aria-label="Close">
              Dismiss
            </button> */}
      {/* </div>
        </div>
      </div> */}
    </>
  );
};

export default Test;
