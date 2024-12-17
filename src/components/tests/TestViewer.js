import { PlusIcon } from "@heroicons/react/20/solid";
import { useContext, useEffect, useState } from "react";
import "../../utils/react-quill/Toolbar.css";
import CustomToolbar from "../../utils/react-quill/CustomToolbar";
// import crossIcon from "../../assets/icons8-cross-64.png";
import Select from "react-select";
import ReactQuill from "react-quill";
import 'react-quill/dist/quill.bubble.css';
import "./css.css";
import ReactSelect from "react-select";
import AuthContext from "../../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import {
  DocumentIcon,
  PhotoIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import DownloadTemplateButton from "./excel-upload/DownloadTemplateButton";
import axios from "axios";
import { TrashIcon } from "@heroicons/react/24/outline";

const TestViewer = () => {
    const navigate = useNavigate();
  const { authTokens, userDetails } = useContext(AuthContext);
  const { assessmentType,testId } = useParams();
  const [newQuestionSetName, setNewQuestionSetName] = useState("");
  const [formValidationResponse, setFormValidationResponse] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(null);
  const [value, setValue] = useState("");
  const [text, setText] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [timeLimit, setTimeLimit] = useState("");
  const [difficulties, setDifficulties] = useState([]);

  const [testTitle, setTestTitle] = useState("");
  const [testDesc, setTestDesc] = useState("");
  const [testCreationDate, setTestCreationDate] = useState("");
  const [testDifficuty, setTestDifficuty] = useState("");

  const [choices, setChoices] = useState([
    { id: 1, value: "", correct: false },
  ]);
  const [selectedAnswerFormat, setSelectedAnswerFormat] = useState(null);

  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const [questionSets, setQuestionSets] = useState(null);
  const [questionSetLoading, setQuestionSetLoading] = useState(false);
  const [selectedQuestionSet, setSelectedQuestionSet] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getDifficulties();
  }, []);

  useEffect(() => {
    if (difficulties.length) getQuestions();
  }, [difficulties]);

  

  const selectStyle = {
    menu: (provided, state) => ({
      ...provided,
      zIndex: 9999, // Adjust the zIndex as needed
    }),
    dropdownIndicator: (styles) => ({
      ...styles,
      color: "black",
      fontSize: "0px",
    }),
    indicatorSeparator: (styles) => ({
      ...styles,
      width: "0px",
    }),
    placeholder: (base) => ({
      ...base,
      fontSize: "1em",
      fontWeight: 400,
    }),
  };

  const modules = {
    toolbar: { container: "#toolbar" },
  };

  const formats = [
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "color",
    "background",
    "script",
    "header",
    "blockquote",
    "code-block",
    "indent",
    "list",
    "direction",
    "align",
    "link",
    "image",
    "video",
    "formula",
  ];

  const answerFormats = [
    { value: "single", label: "Single Choice" },
    { value: "multiple", label: "Multiple Choice" },
    { value: "text", label: "Text" },
    { value: "audio", label: "Audio" },
  ];

  function clearForm() {
    setHtmlContent("");
    setTimeLimit("");
    setChoices([{ id: 1, value: "", correct: false }]);
    setSelectedAnswerFormat(null);
    setSelectedDifficulty(null);
  }

  async function deleteQuestion() {
    // Replace 'http://example.com/api/interviews/' with your actual API endpoint
    const apiUrl = `/test/questions/${selectedQuestion.id}/`;

    // Headers to be included in the request
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + String(authTokens.access),
    };
    try {
      const response = await fetch(apiUrl, {
        method: "DELETE",
        headers: headers,
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

     

      // setSelectedQuestion(null);
      // setSelectedQuestion(questions[1]);
      setFormValidationResponse({ success: "Question has been deleted" });
      setTimeout(() => {
        setFormValidationResponse(null);
      }, 3000);

      setQuestions((prevQuestions) => {
        const updatedQuestions = prevQuestions.filter(
          (question) => question.id !== selectedQuestion.id
        );

     

        if (
          selectedQuestionIndex === updatedQuestions.length &&
          updatedQuestions.length > 0
        ) {
          setSelectedQuestion(updatedQuestions[updatedQuestions.length - 1]);
          setSelectedQuestionIndex(updatedQuestions.length - 1);
          showQuestion(
            updatedQuestions[updatedQuestions.length - 1],
            updatedQuestions.length - 1
          );
        } else if (
          selectedQuestionIndex >= 0 &&
          selectedQuestionIndex < updatedQuestions.length
        ) {
          setSelectedQuestion(updatedQuestions[selectedQuestionIndex]);
          showQuestion(
            updatedQuestions[selectedQuestionIndex],
            selectedQuestionIndex
          );
        } else if (selectedQuestionIndex === 0 && !updatedQuestions.length) {
          clearForm();
          addQuestion();
        } 

        return updatedQuestions;
      });
    } catch (error) {
      console.error("Error creating interview module:", error);
    }
  }

  async function removeQuestion() {
    if (selectedQuestion.id === null) {
      if (selectedQuestionIndex === 0 && questions.length === 1) {
        // Optionally reset selectedQuestion and index
        setFormValidationResponse({
          error: "You can't delete a single new question",
        });
        setTimeout(() => {
          setFormValidationResponse(null);
        }, 3000);
      } else {
        setQuestions((prevQue) => {
          const updatedQuestions = prevQue.filter(
            (_, index) => index !== selectedQuestionIndex
          );
          return updatedQuestions;
        });
        const newIndex =
          selectedQuestionIndex === 0 ? 0 : selectedQuestionIndex - 1;
        setSelectedQuestionIndex(newIndex);
        setSelectedQuestion(questions[newIndex]);
        showQuestion(questions[newIndex], newIndex);
      }
    }
  }

  async function updateQuestion() {
    const formattedData = {
      text: text,
      html_content: htmlContent,
      type: selectedAnswerFormat.value,
      time_limit: timeLimit,
      difficulty: selectedDifficulty.value,
      domain: "analytics",
      choices: JSON.stringify(choices),
      test_id: testId,
    };


    const validationResponse = validateFormData(formattedData, "update");
    if (Object.keys(validationResponse)[0] === "error") {
      setFormValidationResponse(validationResponse);
      setTimeout(() => {
        setFormValidationResponse(null);
      }, 3000);
      return;
    } else if (Object.keys(validationResponse)[0] === "success") {
      // setTimeout(setFormValidationResponse(null), 5000);
    }

    // Replace 'http://example.com/api/interviews/' with your actual API endpoint
    const apiUrl = `/test/questions/${selectedQuestion.id}/`;

    // Headers to be included in the request
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + String(authTokens.access),
    };
    try {
      const response = await fetch(apiUrl, {
        method: "PATCH",
        headers: headers,
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      setFormValidationResponse(validationResponse);
      setTimeout(() => {
        setFormValidationResponse(null);
      }, 3000);

      if (data) {
        setQuestions((prevQuestions) => {
          return prevQuestions.map((question) => {
            // If the id matches, return the updated question
            if (question.id === data.id) {
              return data;
            }
            // Otherwise, return the question unchanged
            return question;
          });
        });
        // getQuestions();
        showQuestion(data, selectedQuestionIndex);
      }
    } catch (error) {
      console.error("Error creating interview module:", error);
    }
  }


  async function saveQuestion() {
    const formattedData = {
      text: text,
      html_content: htmlContent,
      type: selectedAnswerFormat?.value,
      time_limit: timeLimit,
      difficulty: selectedDifficulty?.value,
      domain: "analytics",
      choices: JSON.stringify(choices),
      test_id: testId,
    };


    const validationResponse = validateFormData(formattedData, "save");
    if (Object.keys(validationResponse)[0] === "error") {
      setFormValidationResponse(validationResponse);
      setTimeout(() => {
        setFormValidationResponse(null);
      }, 3000);
      return;
    } else if (Object.keys(validationResponse)[0] === "success") {
      // setTimeout(setFormValidationResponse(null), 5000);
    }

    // Replace 'http://example.com/api/interviews/' with your actual API endpoint
    const apiUrl = "/test/questions/";

    // Headers to be included in the request
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + String(authTokens.access),
    };
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      // setDisableAddQueBtn(false);

      const data = await response.json();
      setFormValidationResponse(validationResponse);
      setTimeout(() => {
        setFormValidationResponse(null);
      }, 3000);

      if (data) {
        setSelectedQuestion(data);

        setQuestions((prevQue) => {
          return prevQue.map((question, index) => {
            // If the id matches, return the updated question
            if (index === selectedQuestionIndex) {
              return data;
            }
            // Otherwise, return the question unchanged
            return question;
          });
        });
        // setQuestions((prevQue)=> [...prevQue, data]);
      }
    } catch (error) {
      console.error("Error creating interview module:", error);
    }
  }

  async function getQuestions() {
    // Replace 'http://example.com/api/interviews/' with your actual API endpoint
    // const apiUrl = `/test/prebuiltassessments/${testId}/`;
    const path =  assessmentType === "test" ? "tests" : assessmentType === "prebuilt-assessment" ? "prebuiltassessments" : ""
    const apiUrl = `/test/${path}/${testId}/`;

    // Headers to be included in the request
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + String(authTokens.access),
    };
    try {
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: headers,
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();

      if (data) {
        setTestTitle(data?.title);
        setTestDesc(data?.description);
        setTestCreationDate(data?.created_at);
        setTestDifficuty(data?.difficulty.difficulty);
        if (data?.question?.length > 0) {
          setQuestions(data?.question);
          // if (selectedQuestion) {
          setSelectedQuestion(data.question[0]);
          setSelectedQuestionIndex(0);
          showQuestion(data.question[0], 0);
          // } else {
          //   showQuestion(data?.question[0]);
          // }
        } else {
          if (data?.question.length === 0) {
            // addQuestion();
          }
        }
      }
    } catch (error) {
      console.error("Error creating interview module:", error);
    }
  }

  async function getDifficulties() {
    // Replace 'http://example.com/api/interviews/' with your actual API endpoint
    const apiUrl = `/test/difficulties/`;

    // Headers to be included in the request
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + String(authTokens.access),
    };
    try {
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: headers,
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();

      if (data) {
        setDifficulties(
          data.results.map((difficulty) => {
            // console.log("Difficulty: ",
            //   difficulty.difficulty[0].toUpperCase() +
            //     difficulty.difficulty.slice(1, difficulty.difficulty.length)
            // );
            return {
              value: difficulty.id,
              label:
                difficulty.difficulty[0].toUpperCase() +
                difficulty.difficulty.slice(1, difficulty.difficulty.length),
            };
          })
        );
      }
    } catch (error) {
      console.error("Error creating interview module:", error);
    }
  }

  const validateFormData = (data, validateFor) => {
    let successMsg;
    //console.log(JSON.parse(data.choices));
    const choices = JSON.parse(data.choices);
    if (data.html_content === "" || data.html_content === "<p><br></p>") {
      //console.log("Please Enter the Question");
      return { error: "Please Enter a Question" };
    }
    if (data.time_limit === "") {
      //console.log("Please Enter Time Limit");
      return { error: "Please Enter Time Limit" };
    }
    if (!data.type || data.type === "") {
      //console.log("Please Enter Answer Format");
      return { error: "Please Enter Answer Format" };
    }
    if (!data.difficulty || data.difficulty === "") {
      //console.log("Please Enter Difficulty");
      return { error: "Please Enter Difficulty" };
    }
    if (choices?.length) {
      const atleastOneTrue = choices?.find(
        (choice) => choice?.correct === true
      );
      //console.log(choices);
      if (atleastOneTrue === undefined) {
        return { error: "Please Select Correct Option" };
      }
      let returnError;
      choices.forEach((element) => {
        if (element.value === "") {
          returnError = true;
        }
      });

      //console.log("returnError: ", returnError);

      if (returnError === true) {
        return { error: "Please Do Not Leave Any Response Empty" };
      }
    } else {
      return { error: "Please Enter A Response" };
    }

    if (validateFor === "save") {
      successMsg = "Saved Successfully";
    }
    if (validateFor === "update") {
      successMsg = "Updated Successfully";
    }

    return { success: successMsg };
  };


  const handleChange = (content, delta, source, editor) => {
    // console.log(content, delta, source, editor.getText())
    setHtmlContent(content);
    setText(editor.getText());
  };

  const handleChoiceChange = (id, value) => {
    setChoices(
      choices.map((choice) =>
        choice.id === id ? { ...choice, value } : choice
      )
    );
  };

  const handleCorrectChange = (id) => {
    if (selectedAnswerFormat.value === "single") {
      setChoices(
        choices.map((choice) => ({ ...choice, correct: choice.id === id }))
      );
    } else {
      setChoices(
        choices.map((choice) =>
          choice.id === id ? { ...choice, correct: !choice.correct } : choice
        )
      );
    }
  };

  function showQuestion(question, index) {
    setSelectedQuestionIndex(
      index !== null && index !== "" && index !== undefined
        ? index
        : question.length
        ? question.length - 1
        : 0
    );
    // setSelectedDifficulty(question.difficulty)
    if (question.difficulty) {
      setSelectedDifficulty(
        difficulties.find(
          (difficultyLevel) =>
            parseInt(difficultyLevel.value) === question.difficulty.id
        )
      );
    } else {
      setSelectedDifficulty(null);
    }
    if (question.type) {
      setSelectedAnswerFormat(
        answerFormats.find((format) => format.value === question.type.toLowerCase())
      );
    } else {
      setSelectedAnswerFormat(null);
    }
    setSelectedQuestion(question);
    setHtmlContent(question.html_content);
    setText(question.text);

    if (question.type?.toLowerCase() === "single" || question.type?.toLowerCase() === "multiple") {
      setChoices(JSON.parse(question.choices));
    } else {
      setChoices([{ id: 1, value: "", correct: false }]);
    }
    setTimeLimit(question.time_limit);
  }

  const addChoice = () => {
    setChoices([
      ...choices,
      { id: choices.length + 1, value: "", correct: false },
    ]);
  };

  const removeChoice = (id) => {
    setChoices(choices.filter((choice) => choice.id != id));
  };

  const addQuestion = () => {
    const emptyQuestion = {
      id: null,
      text: "",
      html_content: "",
      type: "",
      domain: "",
      choices: [],
      photo: null,
      query: null,
      time_limit: "",
      difficulty: null,
    };
    setChoices([{ id: 1, value: "", correct: false }]);

    setQuestions((prevQuestions) => {
      const updatedQuestions = [...prevQuestions, emptyQuestion];

     

      setSelectedQuestionIndex(updatedQuestions.length - 1);
      setSelectedQuestion(updatedQuestions[updatedQuestions.length - 1]);
      showQuestion(emptyQuestion, updatedQuestions.length - 1);

      return updatedQuestions;
    });
    clearForm();
  };

  const handleModalOpen = () => {
    fetchQuestionSet();
    setShowUploadModal(true);
  };

  const handleClose = () => {
    setShowUploadModal(false);
  };

  const fetchQuestionSet = async () => {
    try {
      setQuestionSetLoading(true);
      const response = await fetch(`/interview/question-sets/`, {
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

  function handleSelectChange(selectedOption) {
    if (selectedOption) {
      setSelectedQuestionSet(selectedOption);
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file to upload");
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("question_set", selectedQuestionSet?.value || "");
    formData.append("test", testId);
    formData.append("new_question_set_name", newQuestionSetName);

    try {
      const response = await axios.post("/test/upload-questions/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: "Bearer " + String(authTokens.access),
        },
      });

      getQuestions();
      setUploading(false);
      setShowUploadModal(false);
      setSelectedFile(null)
      setNewQuestionSetName('')
      // alert("Questions uploaded successfully");
    } catch (error) {
      setUploading(false);
      console.error("Error uploading questions:", error);
      alert("Failed to upload questions");
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && !file.name.match(/\.(xlsx|xls)$/)) {
      event.target.value = null; // Reset the file input
      setError("Only .xlsx and .xls file is accepted");
      // alert("Please upload a valid Excel file (xlsx or xls).");
      return;
    }

    setSelectedFile(file);
  };


  return (
    <>
      <div className="h-screen w-full flex">
        {/* sidebar  */}
        <div className="w-1/6 py-5 bg-white text-black border-r">
          <div className="w-full p-3 ps-5 ">
            {/* <label className="font-medium text-xl leading-8 text-black">
              Test Builder
            </label> */}
          </div>
          <div className="w-full p-3 pb-4 ps-5 mt-5 border-b cursor-default">
            <span>Difficulty</span>
            <div className="p-3 mt-2 bg-white border border-[#1E57FE] rounded font-semibold text-[#1E57FE] text-center shadow-inner">
              {testDifficuty === "" && testDifficuty === null
                ? "NA"
                : testDifficuty[0]?.toUpperCase() + testDifficuty?.slice(1)}
            </div>
          </div>
          <div className="w-full p-3 pb-4 ps-5 mt-5 border-b">
            <span>Questions</span>
            <div className="p-3 mt-2 flex flex-wrap gap-3 font-bold text-white">
              {questions?.length > 0 &&
                questions?.map((question, index) => (
                  <button
                    type="button"
                    onClick={() => showQuestion(question, index)}
                  >
                    <div
                      className={`w-[30px] h-[30px] flex items-center justify-center rounded-full  ${
                        selectedQuestionIndex === index
                          ? "bg-brand-purple ring-2 ring-gray-500"
                          : "bg-white text-gray-500 ring-1 ring-gray-500"
                      }  hover:border hover:border-white cursor-pointer shadow-sm`}
                    >
                      {index + 1}
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </div>

        {/* body  */}
        <div className="h-full w-5/6 bg-gray-50 flex flex-col">
          <div className="w-full flex flex-wrap gap-2 items-center justify-between p-3 ps-5 mt-5 border-b">
            <div className="flex gap-4">
             
              <div>
                <label className=" font-semibold text-2xl leading-8 text-slate-900 flex items-center gap-3">
                  {testTitle !== "" ? testTitle : "No Title Available"}
                </label>
                
                <div className="flex gap-2 items-center mt-1">
                <label className="text-sm font-normal text-gray-500">
                  {testDesc !== "" ? testDesc : "No Description Available"}
                </label>
                <div className="w-1.5 h-1.5 mr-1 rounded-xl bg-gray-400"></div>
                  <label class=" text-gray-500 text-sm font-normal inline-flex items-center rounded">
                    {new Date(testCreationDate).toString().slice(4, 15)}
                  </label>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate(`/app/user/test/3/`)}
              className="px-3 py-2 border border-gray-500 text-sm rounded-md"
            >
              Cancel
            </button>
          </div>
          <div className="w-full p-3 ps-7 border-b flex justify-between items-center">
            <label className="font-medium text-xl leading-8 text-slate-700">
              Questions
            </label>
            
          </div>
          <div
            id="question-editor"
            className="w-full p-5 ps-7 flex-grow flex flex-col transition-all"
          >
            
           
              <div id="question" className="w-full  rounded-lg p-5 ">
                {/* <CustomToolbar /> */}
                <ReactQuill
                  theme="bubble"
                  value={htmlContent || text}
                  readOnly={true}
                  className="h-24 bg-white rounded-lg ring-2 ring-indigo-200"
                 
                />

                <div className="flex gap-4 mt-3 bg-gray-50 p-2 rounded-md border shadow-sm flex-wrap">
                  <div className="flex gap-3 items-center">
                    <label className="text-sm text-gray-600 font-medium">
                      Time Limit
                    </label>
                    <div className="relative overflow-hidden flex items-center w-32 rounded-lg ring-2 ring-gray-400/50 ">
                      <label
                        className=" w-16 focus:outline-0 ps-3 py-1"
                      >{timeLimit}</label>
                      <span className="absolute h-full flex items-center  bg-transparent right-2 text-xs text-gray-500 italic">
                        seconds
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-3 items-center">
                    <label className="text-sm text-gray-600 font-medium">
                      Answer Format
                    </label>
                    
                    <div className="relative overflow-hidden flex items-center rounded-lg px-4 py-1 ring-2 ring-gray-400/50 ">
                     
                      <label className="">
                        {selectedAnswerFormat?.label}
                      </label>
                    </div>
                  </div>
                  <div className="flex gap-3 items-center">
                  <label className="text-sm text-gray-600 font-medium">
                      Difficulty
                    </label>
                  <div className="relative overflow-hidden flex items-center rounded-lg px-4 py-1 ring-2 ring-gray-400/50 ">
                     
                     <label className="">
                       {selectedDifficulty?.label}
                     </label>
                   </div>
                  </div>
                </div>

                <div className="w-full flex flex-col items-start flex-grow justify-center gap-6 p-8 rounded-md border shadow-sm mt-5">
                  <label className="block w-full">Response</label>
                  <div className="grid grid-cols-2 w-full gap-5 justify-start">
                    {selectedAnswerFormat === null && (
                      <label className="text-sm text-gray-400">
                        Please select an answer format to view the response
                        options
                      </label>
                    )}
                    {selectedQuestion?.type?.toLowerCase() === "single" &&
                      choices.map((choice) => (
                        <div
                          key={choice.id}
                          // className="flex w-[45%] gap-x-3 items-center border rounded-md p-2 bg-slate-100 shadow-sm"
                          className={`flex gap-x-3 h-16 items-center border-2 rounded-xl p-2 ${choice.correct ? "bg-brand-purple ring-2 ring-indigo-300" : "bg-white"} shadow-sm`}
                        >
                          <div className="p-3 flex h-full items-center bg-transparent">
                            <input
                              type="radio"
                              className="accent-[#3D73FD]"
                              checked={choice.correct}
                            //   onChange={() => handleCorrectChange(choice.id)}
                            ></input>
                          </div>
                          <label
                            className={`ps-2 w-5/6 flex-grow border-t-0 p-1 rounded-md focus:outline-1 ${choice.correct ? "text-white" : "text-black"}`}
                            placeholder={`Option ${choice.id}`}
                          >{choice.value}</label>
                         
                        </div>
                      ))}

                    {selectedQuestion?.type?.toLowerCase() === "multiple" &&
                      choices.map((choice) => (
                        <div
                          key={choice.id}
                          className="flex gap-x-3 items-center border rounded-md p-2 bg-white shadow-sm"
                        >
                          <div className="p-3 flex h-full items-center">
                            <input
                              type="checkbox"
                              className="accent-[#3D73FD]"
                              checked={choice.correct}
                            //   onChange={() => handleCorrectChange(choice.id)}
                            />
                          </div>
                          <input
                            type="text"
                            value={choice.value}
                            // onChange={(e) =>
                            //   handleChoiceChange(choice.id, e.target.value)
                            // }
                            className="ps-2 w-5/6 flex-grow p-1 rounded-md"
                            placeholder={`Option ${choice.id}`}
                          />
                          {/* <button
                            type="button"
                            className="w-6"
                            onClick={() => removeChoice(choice.id)}
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button> */}
                        </div>
                      ))}

                    {selectedAnswerFormat?.value === "text" && (
                      <label className="text-sm text-gray-400 ">
                        The text response will be recorded on the applicant's side
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </div>
          
        </div>
      </div>
    
    </>
  );
};
 
export default TestViewer;