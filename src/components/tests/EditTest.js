import { PlusIcon } from "@heroicons/react/20/solid";
import { useContext, useEffect, useState } from "react";
import "../../utils/react-quill/Toolbar.css";
import CustomToolbar from "../../utils/react-quill/CustomToolbar";
// import crossIcon from "../../assets/icons8-cross-64.png";
import Select from "react-select";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
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
import { api } from "../../constants/constants";

const EditTest = () => {
  const navigate = useNavigate();
  const { authTokens, userDetails } = useContext(AuthContext);
  const { testId } = useParams();
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
    if (difficulties.length) {
      getTestDetails();
      getQuestions();
    }
  }, [difficulties]);

  // useEffect(() => {
  //   console.log(questions)
  // if (questions.length > 0) {
  //   console.log("Displaying 1st question");
  //   showQuestion(questions[0]);
  // } else {
  //   addQuestion();
  // }
  // }, [questions]);

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
    const apiUrl = `${api}/test/questions/${selectedQuestion.id}/`;


    // Headers to be included in the request
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + String(authTokens.access),
    };
    try {
      const response = await fetch(apiUrl, {
        method: "PATCH",
        headers: headers,
        body: JSON.stringify({ is_deleted: true })
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
    // if (selectedAnswerFormat === "text") {
    //   setChoices([])
    // }
    const formattedData = {
      text: text,
      html_content: htmlContent,
      type: selectedAnswerFormat?.value,
      time_limit: timeLimit,
      difficulty: selectedDifficulty?.value,
      domain: "analytics",
      choices: selectedAnswerFormat.value === "text" ? "[]" : JSON.stringify(choices),
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
    const apiUrl = `${api}/test/questions/${selectedQuestion.id}/`;

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
      choices: selectedAnswerFormat.value === "text" ? "[]" : JSON.stringify(choices),
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
    const apiUrl =`${api}/test/questions/`;

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

  async function getTestDetails() {
    // Replace 'http://example.com/api/interviews/' with your actual API endpoint
    const apiUrl = `${api}/test/tests/${testId}/`;

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
      }
    } catch (error) {
      console.error("Error creating interview module:", error);
    }
  }

  async function getQuestions() {
    // Replace 'http://example.com/api/interviews/' with your actual API endpoint
    const apiUrl = `${api}/test/questions/?test_id=${testId}`;

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
        if (data?.results?.length > 0) {
          setQuestions(data?.results);
          // if (selectedQuestion) {
          setSelectedQuestion(data.results[0]);
          setSelectedQuestionIndex(0);
          showQuestion(data.results[0], 0);
        } else {
          if (questions?.length === 0) {
            addQuestion();
          }
        }
      }
    } catch (error) {
      console.error("Error creating interview module:", error);
    }
  }

  async function getDifficulties() {
    // Replace 'http://example.com/api/interviews/' with your actual API endpoint
    const apiUrl = `${api}/test/difficulties/`;

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
    const choices = data?.choices?.length ? JSON.parse(data?.choices) : null;
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
    if (choices?.length && (selectedAnswerFormat?.value === "single" || selectedAnswerFormat?.value === "multiple")) {
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
    } else if (selectedAnswerFormat?.value === "single" || selectedAnswerFormat?.value === "multiple") {
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
        : questions.length
          ? questions.length - 1
          : 0
    );
    // setSelectedDifficulty(question.difficulty)
    if (question.difficulty) {
      setSelectedDifficulty(
        difficulties.find(
          (difficultyLevel) =>
            parseInt(difficultyLevel.value) === (question.difficulty?.id || question.difficulty)
        )
      );
    } else {
      setSelectedDifficulty(null);
    }
    if (question.type) {
      setSelectedAnswerFormat(
        answerFormats.find((format) => format.value === question.type)
      );
    } else {
      setSelectedAnswerFormat(null);
    }
    setSelectedQuestion(question);
    setHtmlContent(question.html_content);
    setText(question.text);

    if (question.type === "single" || question.type === "multiple") {
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

  // console.log(selectedQuestion, selectedDifficulty, difficulties)

  return (
    <>
      <div className="h-screen w-full flex">
        {/* sidebar  */}
        <div className="w-1/6 py-5 bg-white text-black border-r">
          <div className="w-full p-3 ps-5 ">
            <label className="font-medium text-xl leading-8 text-black">
              Test Builder
            </label>
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
                      className={`w-[30px] h-[30px] flex items-center justify-center rounded-full  ${selectedQuestionIndex === index
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
              {/* <div>
                <label className="font-medium text-2xl leading-8 text-slate-900">
                  {testTitle !== "" ? testTitle : "No Title Available"}
                </label>
                <p className="text-xs font-light text-gray-500">
                  {testDesc !== "" ? testDesc : "No Description Available"}
                </p>
              </div>
              <span class=" min-w-fit h-fit self-center text-gray-800 text-[10px] font-medium inline-flex items-center px-1 py-1 rounded me-2">
                <div className="w-1.5 h-1.5 mr-1 rounded-xl bg-black"></div>
                {new Date(testCreationDate).toString().slice(4, 15)}
              </span> */}
              <div>
                <label className=" font-medium text-2xl leading-8 text-slate-900 flex items-center gap-3">
                  {testTitle !== "" ? testTitle : "No Title Available"}
                </label>
                <label className="text-xs font-light text-gray-500">
                  {testDesc !== "" ? testDesc : "No Description Available"}
                </label>
                <div className="flex gap-1">
                  <label class=" min-w-fit h-fit self-center text-gray-400 text-[12px] font-medium inline-flex items-center px-1 py-1 rounded">
                    <div className="w-1.5 h-1.5 mr-1 rounded-xl bg-gray-400"></div>
                    {/* {new Date(testCreationDate).toLocaleString("en-US")} */}
                    {new Date(testCreationDate).toString().slice(4, 15)}
                  </label>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate(`/user/test/3/`)}
              className="px-3 py-2 border border-gray-500 text-sm rounded-md"
            >
              Cancel
            </button>
          </div>
          <div className="w-full p-3 ps-7 border-b flex justify-between items-center">
            <label className="font-medium text-xl leading-8 text-slate-700">
              Questions
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => addQuestion()}
                className="text-white inline-flex btn-brand-blue px-3 py-2 text-sm rounded-md transition-colors"
              >
                <PlusIcon className="w-5 h-5 text-white group-hover:text-gray-950" />{" "}
                Add Question
              </button>
              <button
                onClick={() => handleModalOpen()}
                className="text-white btn-brand-blue px-3 py-2 text-sm rounded-md transition-colors"
              >
                Upload via Excel
              </button>
            </div>
          </div>
          <div
            id="question-editor"
            className="w-full p-5 ps-7 flex-grow flex flex-col transition-all"
          >
            {formValidationResponse &&
              Object.keys(formValidationResponse)[0] === "error" && (
                <div
                  className="flex flex-grow items-center p-4 m-3 text-sm text-red-800 border border-red-300 rounded-lg bg-red-50"
                  role="alert"
                >
                  <svg
                    className="flex-shrink-0 inline w-4 h-4 me-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                  </svg>
                  <span className="sr-only">Info</span>
                  <div>
                    {/* <span className="font-medium">Danger alert!</span>  */}
                    {
                      formValidationResponse[
                      Object.keys(formValidationResponse)[0]
                      ]
                    }
                  </div>
                </div>
              )}

            {formValidationResponse &&
              Object.keys(formValidationResponse)[0] === "success" && (
                <div
                  class="flex items-center p-4 m-3 mb-4 text-sm text-green-800 border border-green-300 rounded-lg bg-green-50"
                  role="alert"
                >
                  <svg
                    class="flex-shrink-0 inline w-4 h-4 me-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                  </svg>
                  <span class="sr-only">Info</span>
                  <div>
                    {/* <span class="font-medium">Success alert!</span>  */}
                    {
                      formValidationResponse[
                      Object.keys(formValidationResponse)[0]
                      ]
                    }
                  </div>
                </div>
              )}
            <div className="bg-white w-full h-full shadow-md rounded-lg grow">
              {/* {selectedQuestion?.id ? ( */}
              <div className="w-full flex gap-3 items-center justify-end px-5 pt-4">
                <button
                  onClick={() =>
                    selectedQuestion?.id ? deleteQuestion() : removeQuestion()
                  }
                  className="text-sm rounded-md bg-transperent"
                >
                  <TrashIcon className="w-6 h-6 text-red-700" />
                </button>
                <button
                  onClick={() =>
                    selectedQuestion?.id ? updateQuestion() : saveQuestion()
                  }
                  className="text-white btn-brand-blue px-3 py-2 text-sm rounded-md transition-colors"
                >
                  {selectedQuestion?.id ? "Update" : "Save"}
                </button>
              </div>
              {/* ) : ( */}
              {/* <div className="w-full flex gap-3 items-center justify-end px-5 pt-4">
                  <button
                    onClick={saveQuestion}
                    className="px-3 py-1.5 border text-sm text-white rounded-md bg-[#1E57FE] hover:bg-white hover:border hover:border-gray-950 hover:text-gray-950 transition-colors"
                  >
                    Save
                  </button>
                </div> */}
              {/* )} */}
              <div id="question" className="w-full h-40 rounded-lg p-5">
                <CustomToolbar />
                <ReactQuill
                  theme="snow"
                  value={htmlContent || text}
                  placeholder="Enter test question here."
                  onChange={handleChange}
                  modules={modules}
                  className="h-24"
                  formats={formats}
                // preserveWhitespace={true}
                />

                <div className="flex gap-4 mt-3 bg-gray-50 p-2 rounded-md border shadow-sm flex-wrap">
                  <div className="flex gap-3 items-center">
                    <label className="text-sm text-gray-600 font-medium">
                      Time Limit
                    </label>
                    <div className="relative overflow-hidden flex items-center w-32 rounded-lg ring-2 ring-gray-400/50 ">
                      <input
                        value={timeLimit}
                        onChange={(e) => setTimeLimit(e.target.value)}
                        className=" w-16 focus:outline-0 ps-3 py-1"
                      />
                      <span className="absolute h-full flex items-center  bg-transparent right-2 text-xs text-gray-500 italic">
                        seconds
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-3 items-center">
                    <label className="text-sm text-gray-600 font-medium">
                      Answer Format
                    </label>
                    <ReactSelect
                      className="text-sm rounded-lg"
                      placeholder="Select Answer format"
                      styles={selectStyle}
                      value={selectedAnswerFormat}
                      theme={(theme) => ({
                        ...theme,
                        borderRadius: 0,
                        colors: {
                          ...theme.colors,
                          primary50: "rgb(203 213 225))",
                          primary25: "rgb(226 232 250)",
                          primary: "#1E57FE",
                        },
                      })}
                      onChange={(selectedOption) =>
                        setSelectedAnswerFormat(selectedOption)
                      }
                      options={answerFormats}
                      classNames={{
                        control: (state) =>
                          state.isFocused
                            ? "border-red-600"
                            : "border-grey-300",
                      }}
                    />
                  </div>
                  <div className="flex gap-3 items-center">
                    <label className="text-sm text-gray-600 font-medium">
                      Difficulty
                    </label>
                    <ReactSelect
                      className="text-sm rounded-md"
                      placeholder="Select Difficulty"
                      styles={selectStyle}
                      value={selectedDifficulty}
                      theme={(theme) => ({
                        ...theme,
                        borderRadius: 0,
                        colors: {
                          ...theme.colors,
                          primary50: "rgb(203 213 225))",
                          primary25: "rgb(226 232 250)",
                          primary: "#1E57FE",
                        },
                      })}
                      // value={{ value: 1, label: "Beginner" }}
                      onChange={(selectedOption) =>
                        setSelectedDifficulty(selectedOption)
                      }
                      options={difficulties}
                    />
                  </div>
                </div>

                <div className="w-full flex flex-col items-start flex-grow justify-center gap-6 p-8 mt-3 rounded-md border shadow-sm">
                  <label className="block w-full">Response</label>
                  {/* <div className="grid grid-cols-2 w-full gap-5 justify-start"> */}
                  {selectedAnswerFormat === null && (
                    <label className="text-sm text-gray-400">
                      Please select an answer format to view the response
                      options
                    </label>
                  )}
                  {selectedAnswerFormat?.value === "single" &&
                    (<div className="grid grid-cols-2 w-full gap-5 justify-start">
                      {choices.map((choice) => (
                        <div
                          key={choice.id}
                          // className="flex w-[45%] gap-x-3 items-center border rounded-md p-2 bg-slate-100 shadow-sm"
                          className="flex gap-x-3 h-16 items-center border-2 rounded-xl p-2 bg-white shadow-sm"
                        >
                          <div className="p-3 flex h-full items-center">
                            <input
                              type="radio"
                              className="accent-[#3D73FD]"
                              checked={choice.correct}
                              onChange={() => handleCorrectChange(choice.id)}
                            />
                          </div>
                          <input
                            type="text"
                            value={choice.value}
                            onChange={(e) =>
                              handleChoiceChange(choice.id, e.target.value)
                            }
                            className="ps-2 w-5/6 flex-grow border-t-0 p-1 rounded-md focus:outline-1"
                            placeholder={`Option ${choice.id}`}
                          />
                          <button
                            type="button"
                            className="w-6"
                            onClick={() => removeChoice(choice.id)}
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>)}

                  {selectedAnswerFormat?.value === "multiple" &&
                    choices.map((choice) => (
                      <div className="grid grid-cols-2 w-full gap-5 justify-start">
                        <div
                          key={choice.id}
                          className="flex gap-x-3 items-center border rounded-md p-2 bg-white shadow-sm"
                        >
                          <div className="p-3 flex h-full items-center">
                            <input
                              type="checkbox"
                              className="accent-[#3D73FD]"
                              checked={choice.correct}
                              onChange={() => handleCorrectChange(choice.id)}
                            />
                          </div>
                          <input
                            type="text"
                            value={choice.value}
                            onChange={(e) =>
                              handleChoiceChange(choice.id, e.target.value)
                            }
                            className="ps-2 w-5/6 flex-grow p-1 rounded-md"
                            placeholder={`Option ${choice.id}`}
                          />
                          <button
                            type="button"
                            className="w-6"
                            onClick={() => removeChoice(choice.id)}
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}

                  {selectedAnswerFormat?.value === "text" &&
                    <label className="text-sm text-gray-400 ">
                      The text response will be recorded on the applicant's side
                    </label>
                  }

                  {selectedAnswerFormat?.value === "audio" && (
                    <div className="flex items-center justify-start gap-3 w-full">
                      <button className="p-3 bg-slate-800 text-white rounded-full">
                        <i className="fas fa-microphone"></i>
                      </button>
                      <span className=" p-3 rounded-md bg-slate-100 text-sm text-gray-500">
                        {" "}
                        Applicant's response will be recorded in audio format
                      </span>
                    </div>
                  )}
                </div>

                {(selectedAnswerFormat?.value === "single" ||
                  selectedAnswerFormat?.value === "multiple") &&
                  choices.length < 6 && (
                    <div className=" w-full">
                      <button
                        onClick={addChoice}
                        className="text-sm mt-4 px-3 py-2 bg-[#1E57FE] text-white rounded-md"
                      >
                        Add Option
                      </button>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {showUploadModal && (
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
                style={{ minWidth: "35%" }}
                className="relative  h-auto transform flex-col justify-evenly rounded-lg bg-white text-left shadow-xl transition-all my-8"
              >
                {/* Header  */}
                <div className="border-b rounded-t-lg bg-gray-50 flex justify-between py-2 px-3">
                  <h3
                    className="text-base p-4 font-semibold leading-6 text-gray-900"
                    id="modal-title"
                  >
                    Upload via Excel
                  </h3>
                  <button onClick={() => handleClose()}>
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                {/* Body  */}
                <div className="bg-white h-auto px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div class="p-4 md:p-5">
                    <div className="md:col-span-1 mb-8">
                      <label className="block  font-medium leading-6 text-gray-900">
                        Download the sample template
                      </label>

                      <div className="relative mt-2 rounded-md">
                        <DownloadTemplateButton />
                      </div>
                    </div>
                    <div className="col-span-full mb-8">
                      <label className="block  font-medium leading-6 text-gray-900">
                        Upload your excel file with questions
                      </label>
                      <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-8">
                        <div className="text-center">
                          <DocumentIcon
                            className="mb-1 mx-auto h-12 w-12 text-gray-300"
                            aria-hidden="true"
                          />
                          {selectedFile ? (
                            <>
                              <span className="text-sky-600 text-sm">
                                {selectedFile?.name}
                              </span>
                            </>
                          ) : (
                            error && (
                              <span className="text-red-600 text-sm">
                                {error}
                              </span>
                            )
                          )}
                          <div className="mt-4 flex text-sm leading-6 text-gray-600">
                            <label
                              htmlFor="file-upload"
                              className="relative cursor-pointer rounded-md bg-white font-semibold text-sky-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-sky-600 focus-within:ring-offset-2 hover:text-sky-500"
                            >
                              <span>Upload a file</span>
                              <input
                                onChange={handleFileChange}
                                id="file-upload"
                                name="file-upload"
                                type="file"
                                accept=".xlsx,.xls"
                                className="sr-only"
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs leading-5 text-gray-600">
                            xlsx up to 2MB
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="col-span-full mb-5">
                      <label className="block  font-medium leading-6 text-gray-900">
                        Select a Question Set
                      </label>
                      <p className="text-sm text-gray-600">
                        Add these questions to an existing questionset for
                        future use
                      </p>
                      <Select
                        className="mt-3 text-sm w-56"
                        styles={selectStyle}
                        // components={{ Option }}
                        value={selectedQuestionSet}
                        onChange={handleSelectChange}
                        options={questionSets}
                        // defaultValue={fields[0]}
                        isLoading={questionSetLoading}
                      />
                    </div>
                    <label className="p-3">OR</label>
                    <div className="col-span-full mt-5">
                      <label className="block  font-medium leading-6 text-gray-900">
                        Create a new Question Set
                      </label>
                      <p className="text-sm text-gray-600">
                        Create a question set to share questions with other team
                        members
                      </p>
                      <div className="mt-3  items-center ">
                        <input
                          id="newQuestionSetName"
                          name="newQuestionSetName"
                          type="text"
                          onChange={(e) => {
                            setSelectedQuestionSet(null)
                            setNewQuestionSetName(e.target.value || "")
                          }
                          }
                          value={newQuestionSetName}
                          className="px-2 text-sm block w-96 rounded-e border-0 pl-5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm sm:leading-6"
                          placeholder="MYSQL Advanced Questions"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer  */}
                <div className="bg-gray-50 rounded-b-lg ms-auto px-4 py-3 flex justify-end sm:px-6 space-x-3">
                  <button
                    disabled={uploading}
                    onClick={() => handleUpload()}
                    className={`h-10  justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm disabled:bg-blue-400/80 sm:ml-3 sm:w-auto`}
                  >
                    {uploading ? (
                      <label className="inline-flex items-center justify-center gap-x-2 ">
                        <svg
                          aria-hidden="true"
                          class="inline w-5 h-5 text-gray-200 animate-spin  fill-blue-600"
                          viewBox="0 0 100 101"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                            fill="currentColor"
                          />
                          <path
                            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                            fill="currentFill"
                          />
                        </svg>
                        Uploading
                      </label>
                    ) : (
                      "Upload Questions"
                    )}
                  </button>
                  <button
                    onClick={() => handleClose()}
                    type="button"
                    className="h-10 justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EditTest;
