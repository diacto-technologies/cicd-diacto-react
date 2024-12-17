import { useContext, useEffect, useRef, useState } from "react";
import {
  useAssignAssessment,
  useFetchPreBuiltAssessments,
  useFetchUserOwnedAssessments,
} from "../../constants/test/constants";
import AuthContext from "../../context/AuthContext";
import { useFetchJobs } from "../../constants/jobs/constants";
import { useFetchApplicants } from "../../constants/candidates/constants";
import { api, selectStyle } from "../../constants/constants";
import ReactSelect from "react-select";
import Switch2 from "../../utils/swtiches/Switch2";
import { XMarkIcon } from "@heroicons/react/24/outline";

const AssignModal = ({ handleClose }) => {
  const [assigningTest, setAssigningTest] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const { fetchJobs, loadingJobs, jobOptions } = useFetchJobs();
  const { fetchApplicants, loadingApplicants, candidateOptions } =
    useFetchApplicants();
  const debounceTimeout1 = useRef(null);
  const { isSuperUser, authTokens, userDetails } = useContext(AuthContext);

  const [prebuiltAssessmentoptions, setPrebuiltAssessmentOptions] =
    useState(null);
  const [prebuiltAssessmentSelected, setPrebuiltAssessmentSelected] = useState(
    []
  );
  const [selectedAssessmentType, setSelectedAssessmentType] = useState(
    "prebuilt-assessment"
  );
  const {
    fetchPreBuiltAssessments,
    preBuiltAssessments,
    loadingPreBuiltAssessments,
  } = useFetchPreBuiltAssessments();
  const { fetchAssessments, assessments, loadingAssessments } =
    useFetchUserOwnedAssessments();
  const { assignAssessment, assigningAssessment } = useAssignAssessment();

  const [CandidateSelected, setCandidateSelected] = useState([]);
  const [TestSelected, setTestSelected] = useState([]);
  const [validFrom, setValidFrom] = useState(null);
  const [validTo, setValidTo] = useState(null);
  const currentDate = new Date().toISOString().split("T")[0];

  const [formSteps, setFormSteps] = useState([
    {
      id: 1,
      label: "Select Candidates",
      description: "Select a job and multiple candidates to assign a test",
      completed: false,
    },
    {
      id: 2,
      label: "Assessments",
      description: "pick multiple assessments from the prebuilt assessments or created by your team members.",
      completed: false,
    },
    {
      id: 3,
      label: "Configurations",
      description: "Additional configuration for ultimate flexibility",
      completed: false,
    },
  ]);
  const [currentStep, setCurrentStep] = useState(formSteps[0]);

  useEffect(() => {
    fetchJobs();
    fetchAssessments();
    fetchPreBuiltAssessments();
  }, []);

  const debounce = (func, delay) => {
    return (...args) => {
      if (debounceTimeout1.current) {
        clearTimeout(debounceTimeout1.current);
      }
      debounceTimeout1.current = setTimeout(() => {
        console.log("args : ",args)
        func(...args);
      }, delay);
    };
  };

  const debouncedFetchCandidates = debounce(fetchApplicants, 300); // Adjust the delay as needed (e.g., 500ms)
  const debouncedFetchJobs = debounce(fetchJobs, 500);
  const debouncedFetchAssessments = debounce(fetchAssessments,500)
  const debouncedFetchPrebuiltAssessments = debounce(fetchPreBuiltAssessments,500)
  // Handle input change in ReactSelect
  const handleInputChange = (newValue, actionMeta) => {
    if (actionMeta?.action === "input-change") {
      const shouldFetchShortlisted = true; 
      console.log("shouldFetchShortlisted : ",shouldFetchShortlisted)
      debouncedFetchCandidates(newValue, selectedJob.value,shouldFetchShortlisted); // Use the debounced function
    }
  };

  const handleSearch = (title,assessmentType) => {
    
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

  const handleValidFromChange = (event) => {
    setValidFrom(event.target.value);
  };

  const handleValidToChange = (event) => {
    setValidTo(event.target.value);
  };

  async function ShareTest() {
    
    setAssigningTest(true);
    if (
      selectedJob &&
      CandidateSelected &&
      (TestSelected || prebuiltAssessmentSelected)
    ) {
     
      const updateObject = (array) => {
        return array?.map((item) => {
          const { id, label, ...rest } = item; // Destructure to remove 'value' and 'label'
          return { ...rest, id: id }; // Add 'id' using the value of 'value'
        });
      };

      const updatedTestSelected = TestSelected?.length
        ? updateObject(TestSelected)
        : [];
      const updatedPrebuiltAssessmentSelected =
        prebuiltAssessmentSelected?.length
          ? updateObject(prebuiltAssessmentSelected)
          : [];
      const assessments = [
        ...updatedTestSelected,
        ...updatedPrebuiltAssessmentSelected,
      ];
      // console.log(assessments, 'assign the following test');
      try {
        const postData = {
          job: selectedJob?.value,
          candidate_id: CandidateSelected?.map((candidate) => candidate.value),
          assessments: assessments,
          valid_from: new Date(validFrom),
          valid_to: new Date(validTo),
          preferences: {},
        };
        const response = await fetch(`${api}/test/share/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + String(authTokens.access),
          },
          body: JSON.stringify(postData),
        });
        if (!response.ok) {
          const data = await response.json();
          // alert(data)
          setAssigningTest(false);
          handleClose();
        }
        if (response.status === 200) {
          setAssigningTest(false);
          handleClose();
        }
      } catch (error) {
        setAssigningTest(false);
        console.error(error);
      }
    }
  }

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
    console.log(e.target.value, testId, testType);
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

  return (
    <>
      <div
        className="relative  z-30"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
      >
        <div className="fixed  inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

        <div className="fixed h-full  inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
            <div
              // style={{ maxWidth: "60%", border: "1px solid red" }}
              className=" flex flex-col h-[90%] justify-between rounded-lg overflow-y-auto bg-white text-left shadow-xl transition-all max-w-[90%] md:max-w-[80%] lg:min-w-[60%]"
            >
              {/* Header  */}
              <div className="border-b rounded-t-lg bg-gray-50 flex justify-between py-2 px-3">
                <h3
                  className="text-2xl p-4 font-semibold leading-6 text-gray-700"
                  id="modal-title"
                >
                  Assign Test
                </h3>
                <button onClick={() => handleClose()}>
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Body  */}
              {/* Body  */}

              <div className="bg-white h-[70%] w-full flex flex-grow relative">
                <div className="bg-gray-50 w-[250px] h-full flex-col  border-r py-5 hidden md:flex">
                  <label className="px-4 mb-2 font-semibold pb-3 border-b">Steps</label>
                  {formSteps.map((step) => (
                    <div
                        // onClick={() => setCurrentStep(step)}
                      className={`p-4 text-start border-b w-full ${
                        currentStep.id === step.id && "bg-sky-100"
                      }`}
                    >
                      <label className="text-base font-medium text-sky-600">
                        {step.label}
                      </label>
                      <p className="text-sm text-gray-500">
                        {step.description}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex-grow p-5">
                  {currentStep.id === 1 && (
                    <div class="p-4 md:p-5 mb-4">
                      <form
                        // id="create-test-form"
                        class="space-y-6"
                        // onSubmit={ShareTest}
                      >
                        <div >
                          <label
                            class="block mb-2  font-medium text-gray-900 "
                          >
                            <span>
                              Job<span className="text-red-600">*</span>
                            </span>
                            <p className="text-[0.8rem] text-gray-500 font-light">
                              Select the job opening that the candidate has
                              applied for
                            </p>
                          </label>

                          <ReactSelect
                            className=" md:w-[90%] min-w-fit"
                            placeholder="Select a job.."
                            isLoading={loadingJobs}
                            value={selectedJob}
                            onChange={(selectedOption) => {
                              if (selectedOption) {
                                debouncedFetchCandidates(
                                  null,
                                  selectedOption.value,
                                  true
                                );
                                setSelectedJob(selectedOption);
                              }
                            }}
                            options={jobOptions}
                            styles={selectStyle}
                            
                          />
                        </div>

                        <div>
                          <label
                            class="block mb-2  font-medium text-gray-900 "
                          >
                            <span>
                              Candidates<span className="text-red-600">*</span>
                            </span>
                            <p className="text-[0.8rem] text-gray-500 font-light">
                              Select shortlisted candidates for the selected job
                            </p>
                          </label>
                          <ReactSelect
                            className="text-sm md:w-[90%] min-w-fit"
                            placeholder="Select candidates to share"
                            noOptionsMessage={() => "No shortlisted candidates found"}
                            isMulti
                            isDisabled={!selectedJob}
                            isLoading={loadingApplicants}
                            value={CandidateSelected}
                            onChange={(selectedOption) =>
                              setCandidateSelected(selectedOption)
                            }
                            options={candidateOptions}
                            onInputChange={(value, actionMeta) =>
                              handleInputChange(value, actionMeta)
                            }
                            styles={selectStyle}
                          />
                        </div>
                      </form>
                    </div>
                  )}
                  {currentStep.id === 2 && (
                    <div className="p-3 h-full flex flex-col">
                      <div className="flex border rounded-xl mb-4">
                        <button
                          onClick={() =>
                            setSelectedAssessmentType("prebuilt-assessment")
                          }
                          className={`w-1/2 p-2 h-full rounded-l-xl border-r hover:bg-indigo-500 hover:text-white ${
                            selectedAssessmentType === "prebuilt-assessment"
                              ? "bg-brand-purple text-white"
                              : "bg-white"
                          }`}
                        >
                          Pre-built Assessments
                        </button>
                        <button
                          onClick={() =>
                            setSelectedAssessmentType("user-owned-assessment")
                          }
                          className={`w-1/2 p-2 h-full rounded-r-xl hover:bg-indigo-500 hover:text-white ${
                            selectedAssessmentType === "user-owned-assessment"
                              ? "bg-brand-purple text-white"
                              : "bg-white"
                          }`}
                        >
                          For your Organization
                        </button>
                      </div>
                      

                      <div className="flex flex-wrap bg-gray-50 rounded-lg mt-3 p-4 flex-grow overflow-auto">
                        <ul className="flex flex-col gap-2 bg-gray-50 rounded-lg flex-grow">
                          {selectedAssessmentType === "prebuilt-assessment" && (
                            <>
                              {preBuiltAssessments &&
                                preBuiltAssessments.length > 0 &&
                                <>
                                <div className="mb-2">
                                <input type="text" onChange={(e) => handleSearch(e.target.value,"prebuilt-assessment")} className="w-full ring-2 ring-gray-200 rounded-md p-2 font-normal" placeholder="Search assessments" />
                                </div>
                                {loadingPreBuiltAssessments && <label className="text-center w-full mt-2 text-gray-500">Loading</label>}
                                {
                                  preBuiltAssessments.map((item) => (
                                    <li key={item.id} className="w-full">
                                      <div className="relative flex items-center justify-between gap-4 w-full h-auto border-2 rounded-md bg-white p-3">
                                        <div className="flex flex-row gap-4">
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
                                              (assessment) =>
                                                assessment.id == item.id
                                            )} // Keep checkbox state in sync
                                          />
  
                                          <div className="flex flex-col justify-center ms-1">
                                            <label className="">
                                              {item?.title}
                                            </label>
                                            <div className="flex gap-2 items-center">
                                              <label className="text-gray-500 text-sm self-center">
                                                {" "}
                                                Total Questions -{" "}
                                                {item?.total_question}{" "}
                                              </label>
                                              <div className="h-1 w-1 rounded-full bg-gray-500"></div>
                                              <label className="text-gray-500 text-sm self-center">
                                                {" "}
                                                {item?.difficulty.difficulty}{" "}
                                              </label>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="flex flex-row gap-2">
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
                                                        (test) =>
                                                          test?.id == item?.id
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
                                                      (test) =>
                                                        test?.id == item?.id
                                                    ).question_count
                                                      ? prebuiltAssessmentSelected?.find(
                                                          (test) =>
                                                            test?.id == item?.id
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
                                      </div>
                                    </li>
                                  ))
                                }
                                </>
                                }
                            </>
                          )}

                          {selectedAssessmentType ===
                            "user-owned-assessment" && (
                            <>
                              {assessments &&
                                assessments.length > 0 &&
                               <>
                               <div className="mb-2 w-full ">
                                <input type="text" onChange={(e) => handleSearch(e.target.value,"user-owned-assessment")} className="block w-full ring-2 ring-gray-200 rounded-md p-2 font-normal" placeholder="Search assessments" />
                               
                                </div>
                                {loadingAssessments && <label className="text-center w-full mt-2 text-gray-500">Loading</label>}
                               { assessments.map((item) => (
                                  <li key={item.id} className="w-full">
                                    <div className="relative flex items-center justify-between gap-4 w-full h-auto border-2 rounded-md bg-white p-3">
                                      <div className="flex flex-row gap-4">
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
                                          checked={TestSelected?.find(
                                            (assessment) =>
                                              assessment.id == item.id
                                          )} // Keep checkbox state in sync
                                        />
                                        <div className="flex flex-col justify-center ms-1">
                                          <label className="text-[0.95rem]">
                                            {item?.title}
                                          </label>
                                          <div className="flex flex-row gap-2">
                                            <label className="text-gray-500 text-sm self-center">
                                              
                                              Created By -
                                              {item?.created_by.name}
                                            </label>
                                            <div className="h-1 w-1 bg-gray-500 rounded-full self-center"></div>
                                            <label className="text-gray-500 text-sm self-center">
                                              
                                              Total Questions -
                                              {item?.total_question}
                                            </label>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex flex-row gap-2">
                                        {TestSelected?.find(
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
                                                    TestSelected?.find(
                                                      (test) =>
                                                        test?.id == item?.id
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
                                                name="price"
                                                id="price"
                                                class="rounded-md py-1.5 pl-2 w-36 text-gray-900 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                value={
                                                  TestSelected?.find(
                                                    (test) =>
                                                      test?.id == item?.id
                                                  ).question_count
                                                    ? TestSelected?.find(
                                                        (test) =>
                                                          test?.id == item?.id
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
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </li>
                                ))}
                               </>
                                }
                            </>
                          )}
                        </ul>
                      </div>
                    </div>
                  )}
                  {currentStep.id === 3 && (
                    <>
                      <div className="mb-3">
                        <label
                          htmlFor="valid_from"
                          class="block mb-2 text-sm font-medium text-gray-900 "
                        >
                          Valid From
                        </label>
                        <div className="mt-2">
                          <input
                            type="datetime-local"
                            name="valid_from"
                            id="valid_from"
                            value={validFrom}
                            min={currentDate}
                            onChange={handleValidFromChange}
                            autoComplete="valid_from"
                            className="block w-full md:w-1/2 rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                          />
                        </div>
                      </div>
                      <div className="mb-3">
                        <label
                          htmlFor="valid_to"
                          class="block mb-2 text-sm font-medium text-gray-900 "
                        >
                          Valid To
                        </label>
                        <div className="mt-2">
                          <input
                            type="datetime-local"
                            name="valid_to"
                            id="valid_to"
                            min={currentDate}
                            value={validTo}
                            onChange={handleValidToChange}
                            autoComplete="valid_to"
                            className="block w-full md:w-1/2 rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Footer  */}
              <div className="bg-gray-50 w-full rounded-b-lg ms-auto px-4 py-3 flex justify-end sm:px-6 space-x-3">
                {currentStep.id === 1 && (
                  <>
                    <button
                      onClick={() => {
                        setCurrentStep(formSteps[1]);
                        // setCandidateSelected()
                        // setSelectedJob()
                      }}
                      disabled={!(selectedJob && CandidateSelected.length)}
                      className="h-10  justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto disabled:cursor-not-allowed disabled:bg-blue-200"
                    >
                      Next
                    </button>
                  </>
                )}
                {currentStep.id === 2 && (
                  <>
                    <button
                        disabled={!TestSelected.length && !prebuiltAssessmentSelected.length}
                      onClick={() => setCurrentStep(formSteps[2])}
                      className="h-10  justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:bg-blue-200 sm:ml-3 sm:w-auto"
                    >
                      Next
                    </button>
                    <button
                      onClick={() => setCurrentStep(formSteps[0])}
                      className="h-10  justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold  text-gray-700 ring-2 ring-gray-500 shadow-sm hover:bg-gray-50 sm:ml-3 sm:w-auto"
                    >
                      Back
                    </button>
                  </>
                )}
                {currentStep.id === 3 && (
                  <>
                    <button
                        type="button"
                        disabled={!validFrom || !validTo || assigningTest}
                        onClick={ShareTest}
                        className="h-10  justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 disabled:bg-blue-200 sm:ml-3 sm:w-auto"
                    >
                      Send Assessment Link
                    </button>
                    <button
                      onClick={() => setCurrentStep(formSteps[1])}
                      className="h-10  justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold  text-gray-700 ring-2 ring-gray-500 shadow-sm hover:bg-gray-50 sm:ml-3 sm:w-auto"
                    >
                      Back
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AssignModal;
