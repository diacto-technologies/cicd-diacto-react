import {
  ClockIcon,
  VideoCameraIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import AddQuestion from "../../../interviews/AddQuestion";
import { useContext, useEffect, useRef, useState, useCallback } from "react";
import ReactSelect from "react-select";
import { api, selectStyle } from "../../../../constants/constants";
import AuthContext from "../../../../context/AuthContext";

const VideoInterviewSetup = ({
  jobId,
  stage,
  workflowId,
  order,
  setWorkflowStages,
}) => {
  const answerTypes = [{ label: "Video", value: "video" }];
  const [selectedQuestionsIds, setSelectedQuestionsIds] = useState([]);
  const [selectedAnswerType, setSelectedAnswerType] = useState(answerTypes[0]);
  const { orgServices, authTokens, userDetails } = useContext(AuthContext);
  const [questionSets, setQuestionSets] = useState(null);
  const [questionSetLoading, setQuestionSetLoading] = useState(false);
  const [selectedQuestionSet, setSelectedQuestionSet] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [sharingLinks, setSharingLinks] = useState(false);
  const [validTo, setValidTo] = useState(null);

  useEffect(() => {
    // console.log("selectedQuestionSet -----------------------",selectedQuestionSet)
    if (selectedQuestionSet) {
      fetchQuestions();
    }
  }, [selectedQuestionSet]);

  useEffect(() => {
    console.log(
      "stage?.stage_configuration?.questions? : ",
      stage?.stage_configuration?.questions,
      questions?.length
    );
    if (stage?.stage_configuration?.questions?.length && questions?.length) {
      setValidTo(parseInt(stage.stage_configuration.expired_at) || 3);
      fetchQuestionsByIds(stage?.stage_configuration?.questions);
    }
  }, [questions]);

  useEffect(() => {
    fetchQuestionSet();
  }, []);

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

      if (data && data.results.length) {
        setQuestions(
          data.results.map((item) => ({
            ...item,
            label: item.text,
            value: item.id,
          }))
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchQuestionsByIds = async (question_ids) => {
    try {
      const response = await fetch(
        `${api}/interview/questions/?question_ids=${question_ids}`,
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

      if (data && data.results.length) {
        const formattedQuestions = data.results.map((item) => ({
          ...item,
          label: item.text,
          value: item.id,
        }));
        setSelectedQuestions(formattedQuestions);
        return formattedQuestions;
      }
    } catch (error) {
      console.log(error);
    }
  };

  const removeQuestion = (questionId) => {
    const updatedSelectedQuestions = selectedQuestions.filter(
      (q) => q.id !== questionId
    );
    const selectedIds = updatedSelectedQuestions.map((q) => q.id);

    setSelectedQuestionsIds(selectedIds);
    // setOptionsData(prevState => ({ ...prevState, questions_ids: selectedIds, questions: updatedSelectedQuestions }))
    setSelectedQuestions(updatedSelectedQuestions);
  };

  const handleTypeChange = (selectedOption) => {
    setSelectedAnswerType(selectedOption);
  };

  console.log(selectedQuestions, selectedQuestionsIds);

  const handleSaveClick = async () => {
    const ids = selectedQuestions?.map((question) => question.value);

    setSharingLinks(true);
    const formattedData = {
      stage_name: "Automated Video Interview",
      stage_configuration: {
        job: jobId || null,
        question_set: selectedQuestionSet.value || null,
        questions: ids || [],
        expired_at: 2,
        preferences: {},
      },
      workflow_id: workflowId,
      order: order,
    };

    const response = await fetch(
      stage ? `${api}/workflow/stage/${stage.id}/` : `${api}/workflow/stage/`,
      {
        method: stage ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + String(authTokens.access),
        },
        body: JSON.stringify(formattedData),
      }
    );
    if (!response.ok) {
      console.error("Something went wrong");
    }
    if (response.ok) {
      const data = await response.json();

      setSelectedQuestions([]);
      setSelectedQuestionSet(null);
      setValidTo(null);
      setSharingLinks(false);

      setWorkflowStages((prev) => {
        const existingStageIndex = prev.findIndex(
          (stage) => stage.name === "Automated Video Interview"
        );

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
  };

  return (
    <>
      <div className="bg-white h-full px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
        <div className="p-4 md:p-5 mb-4">
          <form
            id="create-test-form"
            className="space-y-4"
            // onSubmit={sendScreeningLink}
          >
            <div>
              <label
                htmlFor="description"
                className="block mb-2 text-sm font-medium text-gray-900 "
              >
                Question Set
              </label>
              <ReactSelect
                className="text-sm md:w-1/2 min-w-fit"
                placeholder="Select a question set"
                styles={selectStyle}
                isLoading={questionSetLoading}
                value={selectedQuestionSet}
                onChange={(selectedOption) =>
                  setSelectedQuestionSet(selectedOption)
                }
                options={questionSets}
              />
            </div>
            <div>
              <label
                htmlFor="description"
                className="block mb-2 text-sm font-medium text-gray-900 "
              >
                Questions
              </label>
              <ReactSelect
                classNamePrefix={"select"}
                className="select w-full text-sm  min-w-fit"
                placeholder="Select questions"
                isMulti
                styles={selectStyle}
                maxTagCount={1}
                value={selectedQuestions}
                onChange={(selectedOption) =>
                  setSelectedQuestions(selectedOption)
                }
                options={questions}
              />
            </div>
          </form>
        </div>
        <div className="mb-5">
          <AddQuestion
            selectedQuestionSet={selectedQuestionSet}
            handleTypeChange={handleTypeChange}
            answerTypes={answerTypes}
            selectStyle={selectStyle}
            questions={selectedQuestions}
            setQuestions={setSelectedQuestions}
            setSelectedAnswerType={setSelectedAnswerType}
            selectedAnswerType={selectedAnswerType}
          />
        </div>
        {!selectedQuestionSet && "No question set selected"}
        {selectedQuestions.length > 0 && (
          <div className="h-[80%] ">
            <label className="">
              Selected Questions{" "}
              {selectedQuestions.length > 0 && (
                <span className="ms-2 bg-sky-50 rounded-2xl px-2 py-1">
                  {selectedQuestions.length}
                </span>
              )}
            </label>
            <div
              className="flex flex-col gap-2 p-3 mt-3 overflow-auto border rounded-lg "
              style={{ maxHeight: "90%" }}
            >
              {selectedQuestions.map((question) => (
                <li
                  key={question?.value}
                  id={question?.value}
                  style={{ minWidth: "80%" }}
                  className="min-w-0 w-full h-[20%] flex justify-between items-start bg-white text-sky-800 border-2 border-blue-400/20  shadow-md rounded-md p-3"
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
                      {/* {question.type === "text" && (
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
                                      )} */}
                      {/* {question.type === "video" && ( */}
                      <VideoCameraIcon
                        title={`${question.type} format`}
                        className="w-5 h-5 text-blue-300  hover:text-blue-400"
                      />
                      {/* )} */}
                    </label>
                    <label className="  space-x-1 inline-flex items-center justify-end text-sm">
                      <ClockIcon
                        title={`duration`}
                        className="w-5 h-5 text-blue-300  hover:text-blue-400"
                      />
                      <span className="text-sky-900 font-medium">
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
            </div>
          </div>
        )}

        <div className="w-full mx-8 my-4 px-8 flex justify-end gap-3">
          <button
            onClick={() => handleSaveClick()}
            type="button"
            className="bg-brand-purple text-white border rounded-md px-6 py-2"
          >
            Save Changes
          </button>
        </div>
      </div>
    </>
  );
};

export default VideoInterviewSetup;
