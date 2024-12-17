import {
  ChatBubbleBottomCenterTextIcon,
  ClockIcon,
  MicrophoneIcon,
  VideoCameraIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useContext, useEffect, useState } from "react";
import AddQuestion from "../interviews/AddQuestion";
import Select from "react-select";
import { api, selectStyle } from "../../constants/constants";
import AuthContext from "../../context/AuthContext";
import { useFetcher, useParams } from "react-router-dom";
import SpinLoader from "../../utils/loaders/SpinLoader";
import {  toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const JobQuestions = () => {
  const { jobId } = useParams();
  const { authTokens } = useContext(AuthContext);
  const [preference, setPreference] = useState(null);
  const [questionSetName, setQuestionSetName] = useState("");
  const [questionSets, setQuestionSets] = useState(null);
  const [questionSetLoading, setQuestionSetLoading] = useState(false);
  const [selectedQuestionSet, setSelectedQuestionSet] = useState(null);

  const [optionsData, setOptionsData] = useState({ job: jobId });
  const [initialQuestions, setInitialQuestions] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedQuestionsIds, setSelectedQuestionsIds] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [deleting,setDeleting] = useState(false)
  const [saving, setSaving] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false)
  const answerTypes = [
    { label: "Text", value: "text" },
    { label: "Audio", value: "audio" },
    // { label: "Video", value: "video" },
  ];

  const [selectedAnswerType, setSelectedAnswerType] = useState(answerTypes[0]);

  useEffect(() => {
    // console.log("selectedQuestionSet -----------------------",selectedQuestionSet)
    if (selectedQuestionSet) {
      fetchQuestions();
    }
  }, [selectedQuestionSet]);

  useEffect(() => {
    fetchPreference();
    fetchQuestionSet();
  }, []);

  useEffect(() => {
    if (optionsData && initialQuestions.length && !arraysMatch(selectedQuestionsIds,initialQuestions)) {
      setUnsavedChanges(true)
    }else{
      setUnsavedChanges(false)
    }
  },[optionsData,selectedQuestionsIds])

  const fetchQuestionSet = async () => {
    try {
      setQuestionSetLoading(true);
      const response = await fetch(`${api}/interview/question-sets/`, {
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

      const modifiedData = data.results?.map((item) => ({
        value: item.id,
        label: item.name,
        ...item, // Copy other fields from the original item
      }));

      setQuestionSets(modifiedData);
      setSelectedQuestionSet(modifiedData[0]);
      setQuestionSetLoading(false);
    } catch (error) {
      setQuestionSetLoading(false);
    }
  };

  function arraysMatch(arr1, arr2) {
    // Check if they have the same length
    if (arr1.length !== arr2.length) {
        return false;
    }

    // Check if every element matches the same index
    return arr1.every((value, index) => value === arr2[index]);
}

  const fetchPreference = async () => {
    try {
      const response = await fetch(
        `${api}/resume_parser/resume-screening-preferences/?job_id=${jobId}`, // No trailing slash after jobId
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
        const preferenceData = data.results.length ? data.results[0] : null;
        if (preferenceData) {
          setPreference(preferenceData);
          setOptionsData(() => ({
            ...preferenceData,
            questions: preferenceData.questions.length
              ? preferenceData.questions.map((q) => q.id)
              : [],
          }));
          const questionIds = preferenceData.questions && preferenceData.questions?.length > 0
          ? preferenceData.questions.map((q) => q.id)
          : []
          setSelectedQuestionsIds(questionIds);
          setInitialQuestions(questionIds)
          setSelectedQuestions(preferenceData.questions);
        }

        // Assuming data.results contains the preference array
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchQuestions = async () => {
    try {
      const response = await fetch(
        `${api}/interview/questions/?question_set_id=${selectedQuestionSet?.id}`,
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
        setQuestions(data.results);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleTypeChange = (selectedOption) => {
    setSelectedAnswerType(selectedOption);
  };

  const handleQuestionSelection = async (selectedQuestion) => {
    // Toggle selection
    const isSelected = selectedQuestions.find(
      (q) => q.id === selectedQuestion.id
    );
    // console.log(isSelected, selectedQuestions, selectedQuestion, "isSelected :::::::::::::")
    let updatedSelectedQuestions;
    if (isSelected) {
      updatedSelectedQuestions = selectedQuestions.filter(
        (q) => q.id !== selectedQuestion.id
      );
    } else {
      updatedSelectedQuestions = [...selectedQuestions, selectedQuestion];
    }

    // Updated list of ids and questions
    const selectedIds = updatedSelectedQuestions.map((q) => q.id);
    setSelectedQuestionsIds(selectedIds);
   
    setOptionsData((prevState) => ({
      ...prevState,
      include_questions: true,
      questions: selectedIds,
      questions_detail: updatedSelectedQuestions,
    }));

    setSelectedQuestions(updatedSelectedQuestions);
  };

  const removeQuestion = async (questionId) => {
    const updatedSelectedQuestions = selectedQuestions.filter(
      (q) => q.id !== questionId
    );
    const selectedIds = updatedSelectedQuestions.map((q) => q.id);

    setSelectedQuestionsIds(selectedIds);
    // await updateQuestions({ ...optionsData, questions: selectedIds,questions_detail: updatedSelectedQuestions, });
    setOptionsData((prevState) => ({
      ...prevState,
      questions: selectedIds,
      questions_detail: updatedSelectedQuestions,
    }));
    setSelectedQuestions(updatedSelectedQuestions);
  };

  const handleRandomCount = async (random_count) => {

    setOptionsData((prev) => ({
      ...prev,
      random_questions_count: random_count !== null && random_count !== "" ? random_count : null,
    }));
  };

  function handleSelectChange(selectedOption) {
    if (selectedOption) {
      setSelectedQuestionSet(selectedOption);
    }
  }

  async function updateQuestions(updatedData) {
    const apiUrl = preference
      ? `${api}/resume_parser/resume-screening-preferences/${preference.id}/`
      : `${api}/resume_parser/resume-screening-preferences/`;
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + String(authTokens.access),
    };

    if (updatedData) {
      setSaving(true);
      try {
        const response = await fetch(apiUrl, {
          method: preference ? "PATCH" : "POST",
          headers: headers,
          body: JSON.stringify(updatedData),
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();

        if (data) {
          setPreference(data);
          setOptionsData(data);
          setUnsavedChanges(false)
          // setOptionsData(data)
          setSaving(false);
        }
      } catch (error) {
        setSaving(false);
        console.error("Error creating interview steps:", error);
      }
    }
  }

  async function deleteQuestion(questionId) {
    
      const headers = {
          'Content-Type': 'application/json',
          Authorization: "Bearer " + String(authTokens.access),
      };
      try {
        setDeleting(true)
          const apiUrl = `${api}/interview/questions/${questionId}/`;

          const response = await fetch(apiUrl, {
              method: 'PATCH',
              headers: headers,
              body : JSON.stringify({is_deleted : true})
          })
          const data = await response.json();
          if (!response.ok) {
              throw new Error(response.statusText);
          }

          

          if (data) {
              setQuestions((prev) => prev.filter((q) => q.id !== questionId)); // Add new question to the list
              setDeleting(false)
              toast.success(`Question Deleted`, {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                // transition: Bounce,
                });
          }

      } catch (error) {
          console.error('Could not delete question :', error);
          toast.error(`${error}`, {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
            // transition: Bounce,
            });

      }
 
  }

  const selectAllQuestions = (questions) => {

  }

  return (
    <>
    <ToastContainer />
      <div
        className="mt-5 overflow-auto w-full description-card bg-white p-5 rounded-3xl shadow-md "
        style={{ height: "calc(100vh - 245px)" }}
      >
       
        {/* Add question  */}
        <div className="flex gap-4 py-3 ">
          <div className="w-4/6 border  rounded-sm bg-white ">
            <div className="p-3 flex items-center justify-between">
              <div>
              <label className="text-sky-800 font-semibold">
                Assigned Questions
              </label>
              <p className="text-sm text-gray-500">
                Customize your screening process by handpicking specific
                questions or opting for a random selection from questionnaires
                created by you.
              </p>
              </div>
              <div className="flex gap-2 items-center">
                {unsavedChanges && <span className="text-sm text-orange-500">You have some unsaved changes</span>}
                <button disabled={saving} onClick={() => updateQuestions(optionsData)} className="px-2.5 py-2 text-sm text-white bg-primary-600 rounded-md">{saving ? "Saving" : "Save Changes"}</button>
              </div>
            
            </div>
            <div class="mt-4 p-3 border-t border-b flex items-center space-x-3">
              <div class="flex items-center space-x-3">
                <input
                  type="checkbox"
                  onChange={(e) =>
                    setOptionsData((prevState) => ({
                      ...prevState,
                      random_questions: e.target.checked,
                    }))
                  }
                  checked={optionsData.random_questions}
                  name="random_questions"
                  id="random_questions"
                  class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block  p-2.5 "
                  placeholder="2MB"
                  required=""
                />
                <label
                  for="random_questions"
                  class="block text-sm font-medium text-gray-900 "
                >
                  Random Questions
                </label>
              </div>
              {optionsData?.random_questions && (
                <>
                  <div class="w-px bg-gray-300 h-8"></div>
                  <div class="flex items-center space-x-3">
                    <input
                      type="number"
                      onChange={(e) => handleRandomCount(e.target.value)}
                      value={optionsData.random_questions_count}
                      name="questions_count"
                      id="questions_count"
                      class="w-20 block p-1.5  bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 "
                      placeholder="3"
                    />
                    <label
                      for="questions_count"
                      class="block text-sm font-medium text-gray-900 "
                    >
                      No. of questions
                    </label>
                  </div>
                </>
              )}
            </div>
            <ul className="mt-4 p-3 space-y-2">
              <label>Selected Questions</label>
              {selectedQuestions.length > 0 &&
                selectedQuestions.map((question, index) => (
                  <li
                    key={question?.id}
                    id={question?.id}
                    style={{ minWidth: "90%" }}
                    className="min-w-0 w-full h-5/6 flex justify-between items-start bg-white text-sky-800 border-2 border-blue-600/40  shadow-md rounded-md p-3"
                  >
                    <div className={`w-5/6 h-full `}>
                      <label
                        title={question.text}
                        className="mt-1 text-sm block font-normal w-5/6 truncate"
                      >
                        {question.text}
                      </label>
                    </div>
                    <div
                      className={`w-1/6 flex space-x-3 justify-end items-end h-full px-2 `}
                    >
                      <label className=" space-x-1 inline-flex items-center justify-end text-sm">
                        {question.type === "text" && (
                          <ChatBubbleBottomCenterTextIcon
                            title={`${question.type} format`}
                            className="w-5 h-5 text-blue-300  hover:text-blue-400"
                          />
                        )}
                        {question.type === "audio" && (
                          <MicrophoneIcon
                            title={`${question.type} format`}
                            className="w-5 h-5 text-blue-300  hover:text-blue-400"
                          />
                        )}
                        {question.type === "video" && (
                          <VideoCameraIcon
                            title={`${question.type} format`}
                            className="w-5 h-5 text-blue-300  hover:text-blue-400"
                          />
                        )}
                      </label>
                      <label className="  space-x-1 inline-flex items-center justify-end text-sm">
                        <ClockIcon
                          title={`duration`}
                          className="w-5 h-5 text-blue-300  hover:text-blue-400"
                        />
                        <span className="text-sky-800 font-medium">
                          {question.time_limit}
                        </span>
                        s
                      </label>
                    </div>
                    <button onClick={() => removeQuestion(question.id)}>
                      <XMarkIcon className="w-5 h-5 text-red-400 hover:text-red-600" />
                    </button>
                  </li>
                ))}
            </ul>
          </div>
          <div className="w-2/6 border p-3 rounded-sm bg-white h-5/6">
            <div className="flex pb-2 mb-1 justify-between items-center space-x-4 w-full border-b ">
              <h2 class="text-base font-medium text-gray-900 ">
                {selectedQuestionSet
                  ? selectedQuestionSet?.name
                  : "Questionnaire"}
              </h2>

              <div class="sm:col-span-2 flex space-x-5 h-full">
                <div className="">
                  <Select
                    className=" text-sm w-56"
                    styles={selectStyle}
                    // components={{ Option }}
                    value={selectedQuestionSet}
                    onChange={handleSelectChange}
                    options={questionSets}
                    // defaultValue={fields[0]}
                    isLoading={questionSetLoading}
                  />
                </div>

                {/* <div>
                  <button
                    onClick={() => setShowModal(true)}
                    class=" px-3 py-2 text-sm text-center text-blue-600 bg-white hover:bg-blue-50/60 hover:text-blue-700 rounded-lg ring-2"
                  >
                    Create Questionnaire
                  </button>
                </div> */}
              </div>
            </div>
            <div className="mb-5">
              {!selectedQuestionSet && "No question set selected"}
              {selectedQuestionSet && (
                <AddQuestion
                  selectedQuestionSet={selectedQuestionSet}
                  handleTypeChange={handleTypeChange}
                  answerTypes={answerTypes}
                  selectStyle={selectStyle}
                  questions={questions}
                  setQuestions={setQuestions}
                  setSelectedAnswerType={setSelectedAnswerType}
                  selectedAnswerType={selectedAnswerType}
                />
              )}
            </div>

            {selectedQuestionSet && (
              <>
                <div className=" w-full text-gray-600">
                  <label className="block font-medium">{questions.length} Questions</label>
                  <p className=" text-sm text-gray-500">Pick the questions below to include in the resume screening process.</p>
                  {/* <button onClick={() => } className="text-sm text-blue-500 hover:text-blue-600">
                    Select all
                  </button> */}
                </div>
                <ul
                  className="overflow-auto p-3 flex flex-col gap-3"
                  style={{ height: "calc(100vh - 685px)" }}
                >
                  {questions.map((question, index) => (
                    <li
                      key={question?.id}
                      id={question?.id}
                      style={{ minWidth: "90%" }}
                      className="min-w-0 w-full h-auto flex justify-between items-center border-2 border-blue-400/20  shadow-md rounded-md p-3"
                    >
                      <div className={`w-5/6 h-full flex space-x-3`}>
                        <input
                          type="checkbox"
                          value={question.id}
                          checked={selectedQuestionsIds.includes(question.id)}
                          onChange={() => handleQuestionSelection(question)}
                        />
                        <div className="w-5/6  ">
                          {/* <span className="me-2 text-sm font-normal text-gray-500">Question</span><span className="text-sm text-gray-600"></span> */}
                          <label className="mt-1  text-sm block font-medium  text-gray-800">
                            {question.text}
                          </label>
                        </div>
                      </div>
                      <div
                        className={` flex w-1/6 space-x-4 justify-end items-center h-full px-2 `}
                      >
                        <label className="space-x-1 inline-flex items-center justify-end text-sm ">
                          {question.type === "text" && (
                            <ChatBubbleBottomCenterTextIcon className="w-5 h-5 text-blue-300  hover:text-blue-600" />
                          )}
                          {question.type === "audio" && (
                            <MicrophoneIcon className="w-5 h-5 text-blue-300  hover:text-blue-600" />
                          )}
                          {question.type === "video" && (
                            <VideoCameraIcon className="w-5 h-5 text-blue-300  hover:text-blue-600" />
                          )}
                        </label>
                        <label className=" gap-1 inline-flex items-center justify-end text-sm">
                          <ClockIcon className="w-5 h-5 text-blue-300  hover:text-blue-600" />
                          <span className="text-start text-gray-600 font-medium w-7">
                            {question.time_limit}s 
                          </span>
                          
                        </label>
                      </div>
                      <button onClick={() => deleteQuestion(question.id)}>
                        <XMarkIcon className="w-5 h-5 hover:text-red-600" />
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default JobQuestions;
