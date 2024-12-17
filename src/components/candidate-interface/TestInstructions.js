import React, { useEffect, useRef, useState } from "react";
import TestEnd from "./TestEnd";
import { useNavigate, useParams } from "react-router-dom";
import { api, currentDate } from "../../constants/constants";
import LinkExpired from "./LinkExpired";

const TestInstructions = () => {
  const { testlogId, uniqueId, candidateId } = useParams();
  const [testGroupData, setTestGroupData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [remainingTests, setRemainingTests] = useState([]);
  const [validFrom, setValidFrom] = useState(null);
  const [validTo, setValidTo] = useState(null);
  const [isValid, setIsValid] = useState(false);
  const [readGuidelines, setReadGuidelines] = useState(false)
  const navigate = useNavigate();

  useEffect(() => {
    // fetchTestGroup();
    testStatus();
  }, []);


  const startTest = async () => {

    const currentTest = remainingTests.length > 0 ? remainingTests[0] : null;
    if (currentTest) {
      const payload = {
        started_at: new Date(),
        started: true,
        status_text: "Started",
      };

      const data = await testLogApi(payload, "PUT", testlogId);
      if (data && data.started) {
        navigate(
          `/app/candidate/${candidateId}/test/${testlogId}/${uniqueId}/start/${currentTest?.type}/${currentTest.id}`
        );
      }
    } else {
      console.error("Could not fetch test..");
    }
  };

  async function testLogApi(payload, method, pk) {
    // console.log(CompleteTime, 'called');

    try {
      const response = await fetch(`${api}/test/testlog/${pk}/`, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Network response was not ok");

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error updating test log:", error);
      setError(error);
    }
  }

  async function testStatus() {
    // console.log('Fetching test status');
    setLoading(true);

    try {
      const response = await fetch(`${api}/test/test-status/?test_log=${testlogId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok)
        throw new Error(`Network response was not ok: ${response.statusText}`);

      const data = await response.json();

      if (data) {
        setTestGroupData(data[0]?.test_log);
        if (!data[0]?.test_log.link_opened) {
          const payload = {
            link_opened_at: new Date(),
            link_opened: true,
            status_text: "Link Opened",
          };
      
          testLogApi(payload, "PUT", testlogId);
        }
        setIsValid(true)
        if (data[0]?.test_log.valid_to && data[0]?.test_log.valid_from) {
          const validFrom = data[0]?.test_log?.valid_from
            ? new Date(data[0].test_log.valid_from)
            : null;
          const validTo = data[0]?.test_log?.valid_to
            ? new Date(data[0].test_log.valid_to)
            : null;

          console.log(data[0]?.test_log.valid_from,data[0]?.test_log.valid_to)
          setValidFrom(validFrom);
          setValidTo(validTo);

          if (validFrom && validTo) {
            setIsValid(currentDate > validFrom && currentDate < validTo);
          } else {
            // Handle cases where valid_from or valid_to are missing
            setIsValid(false);
          }
          // navigate(`/app/candidate/${candidateId}/test/${testlogId}/${uniqueId}/completed/`)
        }

        const pendingTests = data.filter((test) => !test.completed);
        if (pendingTests.length) {
          // console.log('Remaining tests:', completedTests);
          const updatedRemainingTests = pendingTests.map((test) => {
            if (test.test) {
              return { id: test.test, type: "u" }
            } else if (test.prebuilt_assessment) {
              return { id: test.prebuilt_assessment, type: "p" }
            }
          });
          setRemainingTests(updatedRemainingTests);
        } else {
          navigate(
            `/app/candidate/${candidateId}/test/${testlogId}/${uniqueId}/completed/204/`
          );
        }

        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.error("Error fetching test status:", error);
      setError(error);
    }
  }

  function formatTimestamp(timestamp) {
    const date = new Date(timestamp);

    // Get individual components
    const options = { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true };
    const formattedDate = date.toLocaleString('en-US', options);

    return formattedDate;
  }
  return (
    <>
      {!loading && (
        <>
          {isValid && !testGroupData?.started ? (
            <>
              <div className="min-h-screen w-full hidden md:flex items-center justify-center bg-gradient-to-b from-[#7474f4] to-[#a5a5fa] px-6 py-12 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 z-0"></div>
                <div className="relative z-10 bg-white shadow-lg rounded-lg overflow-hidden w-full max-w-3xl p-8">
                  <h2 className="text-3xl font-bold text-gray-800 mb-3 text-center">
                    Test Instructions
                  </h2>
                  <p className=" text-gray-500 mb-8 text-center">
                    Please follow the instructions carefully before starting your
                    test.
                  </p>

                  <ul className="flex flex-col gap-3  text-gray-700 mb-8 py-8">
                    <li>
                      <i class="fa-solid fa-angle-right me-2 text-blue-800"></i>Do not refresh the page, close the window, exit fullscreen mode, or switch tabs during the test, as this will result in a violation and mark the assessment as complete
                    </li>
                    <li>
                      <i class="fa-solid fa-angle-right me-2 text-blue-800"></i>
                      Each test consists of multiple questions with a timer.
                    </li>
                    <li>
                      <i class="fa-solid fa-angle-right me-2 text-blue-800"></i>
                      You must complete each question within the given time.
                    </li>
                    <li>
                      <i class="fa-solid fa-angle-right me-2 text-blue-800"></i>
                      Your progress will be saved automatically.
                    </li>
                    <li>
                      <i class="fa-solid fa-angle-right me-2 text-blue-800"></i>
                      This test will be active from <span className="text-blue-500 font-medium">{formatTimestamp(validFrom)}</span> to <span className="font-medium text-blue-500">{formatTimestamp(validTo)}</span>.
                    </li>
                    <li className="mt-4 text-blue-500">

                      <input onChange={(e) => setReadGuidelines(e.target.checked)} type="checkbox" className="me-2" /> I have read the above guidelines
                    </li>
                  </ul>

                  <div className="flex justify-center">
                    <button
                      disabled={testGroupData?.started || testGroupData?.completed || !readGuidelines}
                      onClick={startTest}
                      className="px-8 py-3 bg-blue-600 disabled:bg-blue-200 disabled:cursor-not-allowed hover:bg-blue-700 text-white font-semibold text-lg rounded-md focus:outline-none focus:ring-4 focus:ring-blue-300 transition duration-300"
                    >
                      Start Test
                    </button>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 z-0"></div>
              </div>

              <div className="min-h-screen w-full md:hidden flex items-center justify-center bg-gradient-to-b from-[#7474f4] to-[#a5a5fa] px-6 py-12 relative overflow-hidden">
               
                <div className="relative z-10 bg-white shadow-lg rounded-lg overflow-hidden w-full max-w-3xl p-8">
                  <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                    CandidHR
                  </h2>
                  <p className=" text-gray-500 mb-8 text-center">
                    Thank you for your interest! Our test is designed to provide the best experience on larger screens, such as laptops, desktops, or tablets. Unfortunately, it is not supported on smaller devices like mobile phones. Please switch to a compatible device to continue.
                  </p>
                </div>
              </div>
            </>
          ) : (

            <LinkExpired error={testGroupData?.started ? "The Assessment has already started" : "Assessment Link Invalid"} validFrom={validFrom} validTo={validTo} />
          )}
        </>
      )}
    </>
  );
};

export default TestInstructions;
