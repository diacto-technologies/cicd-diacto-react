import { useContext, useEffect, useRef, useState } from "react";
import {
  useAssignAssessment,
  useFetchPreBuiltAssessments,
  useFetchUserOwnedAssessments,
} from "../../../../constants/test/constants";
import Switch2 from "../../../../utils/swtiches/Switch2";
import AuthContext from "../../../../context/AuthContext";
import RulesBuilder from "../../../interviews/RulesBuilder";
import AlertManager from "../AlertBuilder";
import { api } from "../../../../constants/constants";

const AssessmentSetup = ({ jobId,stage,workflowId,order,setWorkflowStages }) => {
  const [currentTab, setCurrentTab] = useState("Setup");
  const { authTokens, } = useContext(AuthContext);
  const {
    fetchPreBuiltAssessments,
    preBuiltAssessments,
    loadingPreBuiltAssessments,
  } = useFetchPreBuiltAssessments();
  const { fetchAssessments, assessments, loadingAssessments } =
    useFetchUserOwnedAssessments();
  const { assignAssessment, assigningAssessment } = useAssignAssessment();
  const [validTo, setValidTo] = useState(null);
  const [TestSelected, setTestSelected] = useState([]);
  const [prebuiltAssessmentSelected, setPrebuiltAssessmentSelected] = useState(
    []
  );
  const [selectedAssessmentType, setSelectedAssessmentType] = useState(
    "prebuilt-assessment"
  );
  const debounceTimeout = useRef(null);
  const [payload, setPayload] = useState({
    job_id: jobId,
  });

  console.log("assessment stage : ",stage)
  console.log(prebuiltAssessmentSelected,TestSelected)
  useEffect(() => {
    // if (selectedAssessmentType === "prebuilt-assessment") {
      fetchPreBuiltAssessments();
    // }
    // if (selectedAssessmentType === "user-owned-assessment") {
      fetchAssessments();
    // }
  }, []);

  useEffect(() => {
    if (stage?.stage_configuration?.assessments?.length) {
      setValidTo(parseInt(stage.stage_configuration.valid_till_days) || 3)
      const filteredPrebuiltAssessments = []
      const filteredUserOwnedAssessment = []
      stage?.stage_configuration?.assessments.forEach(a => {
        if (a.type === "prebuilt-assessment") {
          filteredPrebuiltAssessments.push(a)
        }
        if (a.type === "user-owned-assessment") {
          filteredUserOwnedAssessment.push(a)
        }
      })

      setPrebuiltAssessmentSelected(filteredPrebuiltAssessments)
      setTestSelected(filteredUserOwnedAssessment)
      
    }
  },[])

  const debounce = (func, delay) => {
    return (...args) => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
      debounceTimeout.current = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  const debouncedFetchAssessments = debounce(fetchAssessments, 500);
  const debouncedFetchPrebuiltAssessments = debounce(
    fetchPreBuiltAssessments,
    500
  );

  

  const handleSearch = (title, assessmentType) => {
    if (assessmentType === "user-owned-assessment") {
      debouncedFetchAssessments(title); // Use the debounced function
    }
    if (assessmentType === "prebuilt-assessment") {
      debouncedFetchPrebuiltAssessments(title); // Use the debounced function
    }
  };

  const handleCheckboxChange = (event, item, type) => {
    if (event.target.checked) {
      if (type === "prebuilt-assessment") {
        if (prebuiltAssessmentSelected)
          setPrebuiltAssessmentSelected([
            ...prebuiltAssessmentSelected,
            { id: item.id, type: type, randomize_question: false },
          ]);
        else
          setPrebuiltAssessmentSelected([
            { id: item.id, type: type, randomize_question: false },
          ]);
      } else if (type === "user-owned-assessment") {
        if (TestSelected)
          setTestSelected([
            ...TestSelected,
            { id: item.id, type: type, randomize_question: false },
          ]);
        else
          setTestSelected([
            { id: item.id, type: type, randomize_question: false },
          ]);
      }
    } else {
      // Remove the unselected assessment ID from the state
      if (type === "prebuilt-assessment") {
        setPrebuiltAssessmentSelected(
          prebuiltAssessmentSelected.filter(
            (assessment) => assessment.id !== item.id
          )
        );
      } else if (type === "user-owned-assessment") {
        setTestSelected(
          TestSelected.filter((assessment) => assessment.id !== item.id)
        );
      }
    }
  };

 



  function handleRandomizeSwitch(e, testId, type, total_questions) {
    if (type === "user-owned-assessment") {
      setTestSelected(
        TestSelected.map((test) => {
          if (test.id === testId) {
            return {
              ...test,
              randomize_question: e.target.checked ? true : false,
              question_count: e.target.checked ? total_questions : null,
            };
          } else return test;
        })
      );
    } else if (type === "prebuilt-assessment") {
      setPrebuiltAssessmentSelected(
        prebuiltAssessmentSelected.map((test) => {
          if (test.id === testId) {
            return {
              ...test,
              randomize_question: e.target.checked ? true : false,
              question_count: e.target.checked ? total_questions : null,
            };
          } else return test;
        })
      );
    }
  }

  function questionsCount(e, testId, testType, total_questions) {
    if (testType === "user-owned-assessment") {
      setTestSelected(
        TestSelected.map((test) => {
          if (test.id === testId) {
            return {
              ...test,
              question_count:
                e.target.value > total_questions
                  ? total_questions
                  : e.target.value,
            };
          } else return test;
        })
      );
    } else if (testType === "prebuilt-assessment") {
      setPrebuiltAssessmentSelected(
        prebuiltAssessmentSelected.map((test) => {
          if (test.id === testId) {
            return {
              ...test,
              question_count:
                e.target.value > total_questions
                  ? total_questions
                  : e.target.value,
            };
          } else return test;
        })
      );
    }
  }

  const handleSaveClick = async () => {
    const updateObject = (array) => {
      return array?.map((item) => {
        const { label, ...rest } = item; // Destructure to remove 'value' and 'label'
        return { ...rest }; // Add 'id' using the value of 'value'
      });
    };

    const updatedTestSelected = TestSelected?.length
      ? updateObject(TestSelected)
      : [];
    const updatedPrebuiltAssessmentSelected = prebuiltAssessmentSelected?.length
      ? updateObject(prebuiltAssessmentSelected)
      : [];
    const assessments = [
      ...updatedTestSelected,
      ...updatedPrebuiltAssessmentSelected,
    ];

    try {
      const finalPayload = {
        order: order,
        stage_name: "Assessment",
        stage_configuration: {
          job: jobId,
          assessments: assessments,
          valid_till_days: validTo,
          preferences: {},
        },
        workflow_id: workflowId,
      };

      const response = await fetch( stage ? `${api}/workflow/stage/${stage.id}/` : `${api}/workflow/stage/`, {
        method: stage ? "PATCH": "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + String(authTokens.access),
        },
        body: JSON.stringify(finalPayload),
      });
      if (!response.ok) {
        console.error("Something went wrong");
      }
      if (response.ok) {
        const data = await response.json();
        setWorkflowStages((prev) => {
          const existingStageIndex = prev.findIndex((stage) => stage.name === "Assessment");
          console.log(existingStageIndex)
          if (existingStageIndex === -1) {
            // Add the new stage if it doesn't exist
            return [...prev, data.result];
          } else {
            // Update the existing stage
            const updatedStages = [...prev];
            updatedStages[existingStageIndex] = { ...data.result };
            return updatedStages;
          }
        });
        return data;  
      }
    } catch (error) {
      console.error(error);
    }
  };


  return (
    <>
      <div className="w-5/6 bg-white min-h-80 mx-auto rounded-md shadow-sm">
        <div className="bg-[#e4e5f9] px-16 flex flex-row-reverse justify-between items-end  rounded-t-md">
          <h1 className="text-lg font-semibold text-gray-700 p-3">
            Assessments
          </h1>
          <div className="flex gap-3 items-end justify-start">
            <button
              type="button"
              onClick={() => setCurrentTab("Setup")}
              className={`p-2 border-b-4 font-medium text-gray-600 ${
                currentTab === "Setup" &&
                "border-b-4 border-b-indigo-500 text-indigo-600"
              }`}
            >
              Setup
            </button>
            <button
              type="button"
              onClick={() => setCurrentTab("Rules")}
              className={`p-2 border-b-4 font-medium text-gray-600 ${
                currentTab === "Rules" &&
                "border-b-4 border-b-indigo-500 text-indigo-600"
              }`}
            >
              Rules
            </button>
            <button
              type="button"
              onClick={() => setCurrentTab("Alerts")}
              className={`p-2 border-b-4 font-medium text-gray-600 ${
                currentTab === "Alerts" &&
                "border-b-4 border-b-indigo-500 text-indigo-600"
              }`}
            >
              Alerts
            </button>
          </div>
        </div>
        {currentTab === "Rules" && 
        <RulesBuilder serviceId={3} serviceKey={"test"} stageId={stage?.id || null}  />}
        {currentTab === "Alerts" && 
        <AlertManager serviceId={3} serviceKey={"test"} stageId={stage?.id || null}  />}
        {currentTab === "Setup" && (
          <div className="p-5 w-full h-full mt-8 flex flex-col">
            <label className="mb-6 text-lg">
              <strong>Step 1 </strong> : Select Assessments and set validity of
              assessment link
            </label>
            <div className="flex w-1/2 border rounded-xl h-10 mb-4">
              <button
                onClick={() => setSelectedAssessmentType("prebuilt-assessment")}
                className={`w-1/2 p-2 h-full border-r hover:bg-indigo-500 hover:text-white rounded-s-xl ${
                  selectedAssessmentType === "prebuilt-assessment"
                    ? "bg-brand-purple text-white ring-2 ring-indigo-400"
                    : "bg-white"
                }`}
              >
                Pre-built Assessments
              </button>
              <button
                onClick={() =>
                  setSelectedAssessmentType("user-owned-assessment")
                }
                className={`w-1/2 p-2 h-full hover:bg-indigo-500 hover:text-white rounded-e-xl ${
                  selectedAssessmentType === "user-owned-assessment"
                    ? "bg-brand-purple text-white ring-4 ring-indigo-400"
                    : "bg-white"
                }`}
              >
                For your Organization
              </button>
            </div>

            <div className="flex flex-wrap bg-gray-50 h-5/6 max-h-96 rounded-lg flex-grow mt-3 p-4 overflow-auto ">
              <ul className="flex flex-col gap-2 bg-gray-50 rounded-lg flex-grow">
                {selectedAssessmentType === "prebuilt-assessment" && (
                  <>
                    {preBuiltAssessments && preBuiltAssessments.length > 0 && (
                      <>
                        <div className="mb-2">
                          <input
                            type="text"
                            onChange={(e) =>
                              handleSearch(
                                e.target.value,
                                "prebuilt-assessment"
                              )
                            }
                            className="w-full ring-2 ring-gray-200 rounded-md p-2 font-normal"
                            placeholder="Search assessments"
                          />
                        </div>
                        {loadingPreBuiltAssessments && (
                          <label className="text-center w-full mt-2 text-gray-500">
                            Loading
                          </label>
                        )}
                        {preBuiltAssessments.map((item) => (
                          <li key={item.id} className="w-full">
                            <div className="relative flex justify-between items-center gap-3 w-full h-16 border-2 rounded-md bg-white p-3 flex-wrap">
                              <div className="flex gap-2 grow">
                                <input
                                  type="checkbox"
                                  className="p-3"
                                  onChange={(e) =>
                                    handleCheckboxChange(
                                      e,
                                      item,
                                      "prebuilt-assessment"
                                    )
                                  }
                                  checked={prebuiltAssessmentSelected.find(
                                    (assessment) => assessment.id == item.id
                                  )} // Keep checkbox state in sync
                                />
                                {/* <div className="">
                                            <label className="text-[0.95rem] w-full">
                                              {item?.title}
                                            </label>
                                          </div> */}
                                <div className="flex flex-col justify-center ms-1">
                                  <label className="">{item?.title}</label>
                                  <div className="flex gap-2 items-center">
                                    <label className="text-gray-500 text-sm self-center">
                                      {" "}
                                      Total Questions - {
                                        item?.total_question
                                      }{" "}
                                    </label>
                                    <div className="h-1 w-1 rounded-full bg-gray-500"></div>
                                    <label className="text-gray-500 text-sm self-center">
                                      {" "}
                                      {item?.difficulty?.difficulty[0]?.toUpperCase() +
                                        item?.difficulty?.difficulty?.slice(
                                          1
                                        )}{" "}
                                    </label>
                                  </div>
                                </div>
                              </div>
                              {/* <div className="w-1/4 text-center flex flex-col justify-center items-start overflow-hidden">
                                        <label className="text-[0.8rem] text-gray-500">Category</label>
                                        <div className="flex gap-3 overflow-hidden">
                                          {item.category?.map((cat, index) => (
                                            index < 3 && <span key={index} className="inline-flex text-nowrap items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">{cat.name  || "No data available"}</span>
                                          ))}
                                        </div>
                                      </div> */}
                              {/* <div className="text-start">
                                          <label className="text-[0.85rem] text-gray-500">Difficulty</label>
                                          <div>
                                            {item?.difficulty?.difficulty ? (
                                              <span className="text-[0.9rem] font-medium">{item.difficulty.difficulty[0].toUpperCase() + item.difficulty.difficulty.slice(1)}</span>
                                            ) : (
                                              <span className="text-[0.85rem]">Not available</span>
                                            )}
                                          </div>
                                        </div> */}
                              {prebuiltAssessmentSelected?.find(
                                (test) => test?.id == item?.id
                              ) && (
                                <>
                                  <div className="self-center text-[0.9rem] text-gray-500">
                                    Randomize Questions
                                  </div>
                                  <div class="relative rounded-md flex flex-row shadow-sm border">
                                    <div class="inset-y-0 left-0 flex items-center border-r px-3">
                                      <Switch2
                                        checked={
                                          prebuiltAssessmentSelected?.find(
                                            (test) => test?.id == item?.id
                                          ).randomize_question
                                        }
                                        onChange={(e) =>
                                          handleRandomizeSwitch(
                                            e,
                                            item.id,
                                            "prebuilt-assessment",
                                            item.total_question
                                          )
                                        }
                                      />
                                      {/* <Switch size="small" onChange={(e) => handleRandomizeSwitch(e, item.id, "prebuilt-assessment", item.total_question)} defaultChecked={TestSelected?.find(test => test?.id == item?.id).randomize_question} className=" z-50" /> */}
                                    </div>
                                    <input
                                      type="number"
                                      name="question_count"
                                      id="question_count"
                                      class="rounded-md py-1.5 pl-2 w-36 text-gray-900 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                      value={
                                        prebuiltAssessmentSelected?.find(
                                          (test) => test?.id == item?.id
                                        ).question_count
                                          ? prebuiltAssessmentSelected?.find(
                                              (test) => test?.id == item?.id
                                            ).question_count
                                          : ""
                                      }
                                      min={1}
                                      max={item.total_question}
                                      disabled={
                                        !prebuiltAssessmentSelected?.find(
                                          (test) =>
                                            test?.id == item?.id &&
                                            test.randomize_question
                                        )
                                      }
                                      onChange={(e) =>
                                        questionsCount(
                                          e,
                                          item.id,
                                          "prebuilt-assessment",
                                          item.total_question
                                        )
                                      }
                                      placeholder="no. of questions"
                                    />
                                  </div>
                                </>
                              )}
                            </div>
                          </li>
                        ))}
                      </>
                    )}
                  </>
                )}

                {selectedAssessmentType === "user-owned-assessment" && (
                  <>
                    {assessments && assessments.length > 0 && (
                      <>
                        <div className="mb-2 w-full ">
                          <input
                            type="text"
                            onChange={(e) =>
                              handleSearch(
                                e.target.value,
                                "user-owned-assessment"
                              )
                            }
                            className="block w-full ring-2 ring-gray-200 rounded-md p-2 font-normal"
                            placeholder="Search assessments"
                          />
                        </div>
                        {loadingAssessments && (
                          <label className="text-center w-full mt-2 text-gray-500">
                            Loading
                          </label>
                        )}
                        {assessments.map((item) => (
                          <li key={item.id} className="w-full">
                            <div className="relative flex justify-between items-center gap-4 w-full h-16 border-2 rounded-md bg-white p-3 flex-wrap">
                              <div className="flex gap-2 flex-grow">
                                <input
                                  type="checkbox"
                                  className="p-3"
                                  onChange={(e) =>
                                    handleCheckboxChange(
                                      e,
                                      item,
                                      "user-owned-assessment"
                                    )
                                  }
                                  checked={TestSelected.find(
                                    (assessment) => assessment.id == item.id
                                  )} // Keep checkbox state in sync
                                />
                                {/* <div className="">
                                            <label className="text-[0.95rem]">
                                              {item?.title}
                                            </label>
                                          </div> */}
                                <div className="flex flex-col justify-center ms-1">
                                  <label className="">{item?.title}</label>
                                  <div className="flex gap-2 items-center">
                                    <label className="text-gray-500 text-sm self-center">
                                      {" "}
                                      Total Questions - {
                                        item?.total_question
                                      }{" "}
                                    </label>
                                    <div className="h-1 w-1 rounded-full bg-gray-500"></div>
                                    <label className="text-gray-500 text-sm self-center">
                                      {" "}
                                      {item?.difficulty?.difficulty[0]?.toUpperCase() +
                                        item?.difficulty?.difficulty?.slice(
                                          1
                                        )}{" "}
                                    </label>
                                  </div>
                                </div>
                              </div>
                              {/* <div className="w-1/4 text-center flex flex-col justify-center items-start overflow-hidden">
                                          <label className="text-[0.8rem] text-gray-500">Category</label>
                                          <div className="flex gap-1 overflow-hidden">
                                            {item.category?.map((cat, index) => (
                                              index < 3 && <span key={index} className="inline-flex text-nowrap items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">{cat.name ? cat.name : "No data available"}</span>
                                            ))}
                                            {item.category.length == 0 && <span className="text-[0.85rem]">No data</span>}
                                          </div>
                                        </div> */}
                              {/* <div className="text-start">
                                          <label className="text-[0.85rem] text-gray-500">Difficulty</label>
                                          <div>
                                            {item?.difficulty?.difficulty ? (
                                              <span className="text-[0.9rem] font-medium">{item.difficulty.difficulty[0].toUpperCase() + item.difficulty.difficulty.slice(1)}</span>
                                            ) : (
                                              <span className="text-[0.85rem]">Not available</span>
                                            )}
                                          </div>
                                        </div> */}
                              {TestSelected?.find(
                                (test) => test?.id == item?.id
                              ) && (
                                <div className="flex gap-2">
                                  <div className="self-center text-[0.9rem] text-gray-500 w-min">
                                    Randomize Questions
                                  </div>
                                  <div class="relative rounded-md flex flex-row shadow-sm border">
                                    <div class="inset-y-0 left-0 flex items-center border-r px-3">
                                      <Switch2
                                        checked={
                                          TestSelected?.find(
                                            (test) => test?.id == item?.id
                                          ).randomize_question
                                        }
                                        onChange={(e) =>
                                          handleRandomizeSwitch(
                                            e,
                                            item.id,
                                            "user-owned-assessment",
                                            item.total_question
                                          )
                                        }
                                      />
                                      {/* <Switch size="small" onChange={(e) => handleRandomizeSwitch(e, item.id, "user-owned-assessment", item.total_question)} defaultChecked={TestSelected?.find(test => test?.id == item?.id).randomize_question} className=" z-50" /> */}
                                    </div>
                                    <input
                                      type="number"
                                      name="question_count"
                                      id="question_count"
                                      class="rounded-md py-1.5 pl-2 w-36 text-gray-900 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                      value={
                                        TestSelected?.find(
                                          (test) => test?.id == item?.id
                                        ).question_count
                                          ? TestSelected?.find(
                                              (test) => test?.id == item?.id
                                            ).question_count
                                          : ""
                                      }
                                      min={1}
                                      max={item.total_question}
                                      disabled={
                                        !TestSelected?.find(
                                          (test) =>
                                            test?.id == item?.id &&
                                            test.randomize_question
                                        )
                                      }
                                      onChange={(e) =>
                                        questionsCount(
                                          e,
                                          item.id,
                                          "user-owned-assessment",
                                          item.total_question
                                        )
                                      }
                                      placeholder="no. of questions"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </li>
                        ))}
                      </>
                    )}
                  </>
                )}
              </ul>

              {/* You can also display the selected IDs here for debugging */}
            </div>

            <div className="mt-10 py-10 border-t">
              <label className="text-lg">
                <strong>Step 2 </strong> : Set Validity of the link
              </label>

              <div className=" mt-8">
                Valid till{" "}
                <span className="text-blue-400">
                  (Since the day of assignment)
                </span>
              </div>
              <div className="flex mt-4 pb-7  w-full">
                <input
                  onChange={(e) => setValidTo(e.target.value)}
                  value={validTo}
                  className={`w-1/3 p-2 h-full rounded-xl ring-2 ring-gray-400  focus:outline-indigo-500  `}
                  type="number"
                  min={1}
                  max={30}
                  placeholder="Enter no of days..."
                />
              </div>
            </div>

            <div className="w-full mx-8 my-4 px-8 flex justify-end gap-3">
              <button type="button" className="border rounded-md px-6 py-2">
                Back
              </button>
              <button
                onClick={() => handleSaveClick()}
                type="button"
                className="bg-brand-purple text-white border rounded-md px-6 py-2"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AssessmentSetup;
