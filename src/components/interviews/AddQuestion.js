import React, { useContext, useState } from "react";
import Select from "react-select";
import AuthContext from "../../context/AuthContext";
import { selectStyle } from "../../constants/constants";

const AddQuestion = ({
  selectedQuestionSet,
  handleTypeChange,
  answerTypes,
  questions,
  setQuestions,
  setSelectedAnswerType,
  selectedAnswerType,
  selectTheme,
}) => {
  const { authTokens, userDetails } = useContext(AuthContext);
  const [question, setQuestion] = useState({
    text: "",
    time_limit: 30,
  });

  async function addQuestion(e) {
    e.preventDefault();
    if (question.text && question.time_limit) {
      const postData = {
        type: selectedAnswerType.value,
        text: question?.text,
        time_limit: question?.time_limit,
        created_by: userDetails?.id,
        question_set: selectedQuestionSet ? selectedQuestionSet?.id : null,
      };

      const headers = {
        "Content-Type": "application/json",
        Authorization: "Bearer " + String(authTokens.access),
      };
      try {
        const apiUrl = "/interview/questions/";

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: headers,
          body: JSON.stringify(postData),
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();

        if (data) {
          data["label"] = data.text || "";
          data["value"] = data.id;
          setQuestions([...questions, data]); // Add new question to the list
          setSelectedAnswerType(answerTypes[0]);
          setQuestion({
            text: "",
            time_limit: 30,
          });
          setSelectedAnswerType(answerTypes[0]);
        }
      } catch (error) {
        console.error("Error creating interview module:", error);
      }
    }
  }

    return (
        <form onSubmit={addQuestion} className="bg-[#f8f8ff] space-y-3 rounded-sm px-3 py-1 shadow-md ring-1 ring-blue-600/20">
            <label className="text-sm font-medium text-gray-900">Add questions to your questionnaire</label>
            <div className="inline-flex w-full items-center space-x-4 ">
                <img className="w-6 h-6" src="https://cdn-icons-png.flaticon.com/128/8898/8898945.png" alt="icon" />
                <input
                    type="text"
                    onChange={(e) => setQuestion({ ...question, text: e.target.value })}
                    value={question.text}
                    name="text"
                    id="text"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full py-1 px-2"
                    placeholder="Type your question here.."
                    required
                />
            </div>
            <div className="">
                <div className="flex flex-wrap items-center gap-4 pb-1 border-b">
                    {/* Timer */}
                    <div className="flex items-center space-x-2">
                        <label className="text-sm">Duration</label>
                        <div className="relative">
                            <input
                                min={0}
                                type="text"
                                inputMode="numeric"
                                style={{ WebkitAppearance: 'none', margin: 0 }}
                                onChange={(e) => setQuestion({ ...question, time_limit: e.target.value })}
                                value={question.time_limit}
                                name="time_limit"
                                id="time_limit"
                                className="block w-28 px-2 py-1  bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-primary-400 focus:border-primary-400"
                                placeholder="3"
                                required
                            />
                            <div className="absolute inset-y-0 end-4 flex items-center ps-1.5 pointer-events-none">
                                <span className="text-gray-600 text-sm italic ps-2">seconds</span>
                            </div>
                        </div>
                    </div>
                    {/* <div className="w-px bg-gray-300 h-8"></div> */}
                    {/* Answer type */}
                    <div className="flex flex-wrap items-center gap-2">
                        <label className="text-sm">Answer Format</label>
                        <Select
                            className="text-xs w-56 "
                            styles={selectStyle}
                            theme={selectTheme}
                            onChange={handleTypeChange}
                            options={answerTypes}
                            defaultValue={answerTypes[0]}
                            value={selectedAnswerType}
                        />
                    </div>
                </div>
                <button
                    type="submit"
                    className="inline-flex mb-1 w-full justify-center items-center px-3 py-1 text-sm font-medium text-center text-white bg-brand-purple rounded-lg focus:ring-4 focus:ring-primary-200 hover:bg-primary-800"
                >
                    Add
                </button>
            </div>
        </form>

    );
};

export default AddQuestion;
