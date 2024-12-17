import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SpinLoader from "../../utils/loaders/SpinLoader";
import { api } from "../../constants/constants";

const Completed = () => {
  const { testlogId, candidateId, uniqueId, testId, assessmentType } = useParams();
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [tests, setTests] = useState([]);
  const [nextTest, setNextTest] = useState(null);

  useEffect(() => {
    testStatus()
  }, [])

  async function testStatus() {
    // console.log('Fetching test status');
    setLoading(true);

    try {
      const response = await fetch(`${api}/test/test-status/?test_log=${testlogId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);

      const data = await response.json();
      // console.log('Test status data:', data);

      if (data) {
        const pendingTests = data.filter(test => !test.completed);
        if (pendingTests.length) {
          // Check for remaining tests and its type
          const remainingTests = pendingTests.map((test) => {
            if (test.test) {
              return { id: test.test, type: "u" }
            } else if (test.prebuilt_assessment) {
              return { id: test.prebuilt_assessment, type: "p" }
            }
          });

          // console.log("next test", remainingTests[0])
          setNextTest(remainingTests[0])
          setLoading(false);
        } else {

          const payload = {
            completed_at: new Date(),
            completed: true,
            status_text: "Completed"
          };

          // mark testgroup as complete and redirect
          testLogApi(payload, "PUT", testlogId)
          navigate(`/app/candidate/${candidateId}/test/${testlogId}/${uniqueId}/completed/200/`)
          // console.log('All tests are completed');
          setLoading(false);
        }
      }
    } catch (error) {
      console.error('Error fetching test status:', error);
      setError(error);
      setLoading(false);
    }
  }


  async function testLogApi(payload, method, pk) {
    // console.log(CompleteTime, 'called');
    setLoading(true);

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
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-[#7474f4] to-[#a5a5fa] px-6 py-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 z-0"></div>
        <div class="background-svg bottom-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
            <path fill="#7474f4" fill-opacity="1" d="M0,64L48,53.3C96,43,192,21,288,64C384,107,480,213,576,229.3C672,245,768,171,864,165.3C960,160,1056,224,1152,234.7C1248,245,1344,203,1392,181.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
        <div className="relative z-10 bg-white shadow-lg rounded-lg overflow-hidden w-full max-w-3xl p-8 flex justify-center items-center min-h-40">
          {loading ? <SpinLoader loadingText={"Loading..."}/> : <div className="mx-auto max-w-2xl lg:max-w-4xl z-40">
            {/* <img className="mx-auto h-12" src="https://tailwindui.com/img/logos/workcation-logo-indigo-600.svg" alt="" /> */}
            <div className="h-56 flex flex-col justify-center items-center">
              <div className="text-center text-2xl font-semibold text-gray-900 sm:text-3xl">
                <label className="mb-5 block">This Test has been successfully completed</label>
                {nextTest && (
                  <div>
                    <button
                      type="button"
                      onClick={() => navigate(`/app/candidate/${candidateId}/test/${testlogId}/${uniqueId}/start/${nextTest?.type}/${nextTest?.id}/`)}
                      className=" w-40 text-base text-white font-medium px-2.5 py-2 rounded-md bg-brand-purple hover:bg-indigo-500"
                    >
                      Start Next Test
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>}
        </div>
      </div >
    </>
  );
}

export default Completed;