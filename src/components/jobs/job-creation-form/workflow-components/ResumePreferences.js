import Select from "react-select";
import Checkbox from "../../../../utils/checkbox/Checkbox";
import { api, selectStyle, selectTheme } from "../../../../constants/constants";
import PreferenceSwitch from "../../../../utils/swtiches/PreferenceSwitch";
import { useContext, useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import AddQuestion from "../../../interviews/AddQuestion";
import {
  ChatBubbleBottomCenterTextIcon,
  ClockIcon,
  MicrophoneIcon,
  VideoCameraIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import AuthContext from "../../../../context/AuthContext";

const ResumePreferences = ({jobId,}) => {
    const { authTokens, user, userDetails, domain } = useContext(AuthContext);
    const currencies = [
      { value: "INR", label: "INR - Indian Rupees" },
      { value: "USD", label: "USD - US Dollar" },
      { value: "EUR", label: "EUR - Euro" },
      { value: "GBP", label: "GBP - British Pound" },
      { value: "JPY", label: "JPY - Japanese Yen" },
      // Add more currency options as needed
    ];
    const answerTypes = [
      { label: "Text", value: "text" },
      { label: "Audio", value: "audio" },
      // { label: "Video", value: "video" },
    ];
    const [filterCriteria, setfilterCriteria] = useState([]);
    const [selectedCurrency, setSelectedCurrency] = useState(currencies[0]);
    const [loading, setLoading] = useState(false);
    const [questionSets, setQuestionSets] = useState(null);
    const [selectedQuestionSet, setSelectedQuestionSet] = useState(null);
    const [questions, setQuestions] = useState(null);
    const [selectedAnswerType, setSelectedAnswerType] = useState(null);
    const [selectedQuestionsIds, setSelectedQuestionsIds] = useState([]);
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [optionsData, setOptionsData] = useState({ job: jobId });
    const [unsavedChanges, setUnsavedChanges] = useState(false);
    const [saving, setSaving] = useState(false);
    const [preference, setPreference] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [questionSetName, setQuestionSetName] = useState("");
    const [formData, setFormData] = useState({
      job: jobId,
      max_retries: 0,
      max_resume_size: 0,
      max_applicants: 0,
      location_to_exclude: null,
      include_github: false,
      include_linkedin: true,
      include_questions: false,
      question_set: null,
      include_notice_period: false,
      include_current_ctc: false,
      include_expected_ctc: false,
      include_relevant_experience: false,
      last_increment: false,
      currency: currencies[0],
      questions: [],
    });

    
  
    useEffect(() => {
      fetchPreference();
      fetchQuestionSet();
      if (jobId) {
          fetchCriteria()
      }
    }, [jobId]);
  
    useEffect(() => {
      // console.log("selectedQuestionSet -----------------------",selectedQuestionSet)
      if (selectedQuestionSet) {
        fetchQuestions();
      }
    }, [selectedQuestionSet]);
  
    const fetchPreference = async () => {
      setLoading(true);
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
          // setPreference(preferenceData)
          if (preferenceData) {
            setFormData(() => ({
              ...preferenceData,
              questions: preferenceData?.questions?.length
                ? preferenceData.questions.map((q) => q.id)
                : [],
            }));
  
            setSelectedQuestions(preferenceData.questions);
  
            const selectedIds = preferenceData.questions.map((q) => q.id);
            setSelectedQuestionsIds(selectedIds);
  
            setSelectedCurrency(preferenceData.currency);
          }
          setLoading(false);
          // Assuming data.results contains the preference array
        }
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
  
    const fetchQuestionSet = async () => {
      try {
        //   setQuestionSetLoading(true);
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
        //   setQuestionSetLoading(false);
      } catch (error) {
        //   setQuestionSetLoading(false);
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
  
    const handleSelectChange = (selectedOption) => {
      setSelectedQuestionSet(selectedOption);
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
  
      setFormData((prevState) => ({
        ...prevState,
        include_questions: true,
        questions: selectedIds,
        questions_detail: updatedSelectedQuestions,
      }));
  
      setSelectedQuestions(updatedSelectedQuestions);
    };
  
    async function deleteQuestion(questionId) {
      const headers = {
        "Content-Type": "application/json",
        Authorization: "Bearer " + String(authTokens.access),
      };
      try {
        // setDeleting(true)
        const apiUrl = `${api}/interview/questions/${questionId}/`;
  
        const response = await fetch(apiUrl, {
          method: "PATCH",
          headers: headers,
          body: JSON.stringify({ is_deleted: true }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(response.statusText);
        }
  
        if (data) {
          setQuestions((prev) => prev.filter((q) => q.id !== questionId)); // Add new question to the list
          // setDeleting(false)
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
        console.error("Could not delete question :", error);
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
  
    const handleClose = () => {
      setQuestionSetName(null);
      setShowModal(false);
    };
  
    async function createQuestionSet(e) {
      e.preventDefault();
      if (questionSetName) {
        const postData = {
          name: questionSetName,
          created_by: userDetails.id,
        };
  
        const headers = {
          "Content-Type": "application/json",
          Authorization: "Bearer " + String(authTokens.access),
        };
        try {
          const apiUrl = `${api}/interview/question-sets/`;
  
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
            const modifiedData = {
              value: data.id,
              label: data.name,
              ...data, // Copy other properties from the original object
            };
  
            setQuestionSets((q) => [...q, modifiedData]);
            setOptionsData((prev) => ({ ...prev, question_set: data.id }));
            setSelectedQuestionSet(modifiedData);
            setShowModal(false);
          }
        } catch (error) {
          setShowModal(false);
        }
      }
    }
  
  
    const updatePreference = async (updatedData) => {
      const apiUrl = updatedData?.id
        ? `${api}/resume_parser/resume-screening-preferences/${updatedData?.id}/`
        : `${api}/resume_parser/resume-screening-preferences/`;
      const headers = {
        "Content-Type": "application/json",
        Authorization: "Bearer " + String(authTokens.access),
      };
  
      if (updatedData) {
        setSaving(true);
        try {
          const response = await fetch(apiUrl, {
            method: updatedData?.id ? "PATCH" : "POST",
            headers: headers,
            body: JSON.stringify(updatedData),
          });
          bulkCreateOrUpdateCriteria(jobId,filterCriteria)
  
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
  
          const data = await response.json();
  
          if (data) {
            setPreference(data);
            setFormData(data);
            // setOptionsData(data)
            setSaving(false);
          }
        } catch (error) {
          setSaving(false);
          console.error("Error creating interview steps:", error);
        }
      }
    };
  
    const handleRandomCount = async (random_count) => {
      setFormData((prev) => ({
        ...prev,
        random_questions_count:
          random_count !== null && random_count !== "" ? random_count : null,
      }));
    };
  
    const removeQuestion = async (questionId) => {
      const updatedSelectedQuestions = selectedQuestions.filter(
        (q) => q.id !== questionId
      );
      const selectedIds = updatedSelectedQuestions.map((q) => q.id);
  
      setSelectedQuestionsIds(selectedIds);
      // await updateQuestions({ ...optionsData, questions: selectedIds,questions_detail: updatedSelectedQuestions, });
      setFormData((prevState) => ({
        ...prevState,
        questions: selectedIds,
        questions_detail: updatedSelectedQuestions,
      }));
      setSelectedQuestions(updatedSelectedQuestions);
    };
  
    async function fetchCriteria() {
      try {
        const response = await fetch(`${api}/jobs/criteria/job/${jobId}/`);
        if (!response.ok) {
          throw new Error("Failed to fetch criteria");
        }
        const data = await response.json();
        setfilterCriteria(data);
      } catch (error) {
        console.error("Error fetching criteria:", error);
      } finally {
        setLoading(false);
      }
    }
  
    async function bulkCreateOrUpdateCriteria(jobId, criteriaList) {
      const url = `${api}/jobs/criteria/bulk-create-or-update/`;
      const payload = criteriaList.map((criterion) => ({
        job_id: jobId,
        question: criterion.question,
        response_type: criterion.response_type,
        options: criterion.options,
        expected_response: criterion.expected_response
      }));
    
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
    
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Failed to create or update criteria:', errorData);
          alert('There was an error processing your request. Please try again.');
          return { success: false, errors: errorData };
        }
    
        const responseData = await response.json();
        alert('Criteria created or updated successfully!');
        return { success: true, data: responseData };
      } catch (error) {
        console.error('Network error:', error);
        alert('A network error occurred. Please check your connection and try again.');
        return { success: false, error: error.message };
      }
    }
  
    return (
      <>
         
  
          {!loading ? (
            <>
              <div className="px-16 py-6">
                <dl className="divide-y divide-gray-100">
                  <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm font-medium leading-6 text-gray-900">
                      Max Resume Size (mb)
                    </dt>
                    <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                      <input
                        type="number"
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            max_resume_size: e.target.value,
                          })
                        }
                        value={formData.max_resume_size}
                        name="max_resume_size"
                        id="max_resume_size"
                        className="w-full lg:w-1/2 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block p-2.5 "
                        placeholder="2MB"
                        required=""
                      />
                    </dd>
                  </div>
                  <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt class="text-sm font-medium leading-6 text-gray-900">
                      Max Retries
                    </dt>
                    <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                      <input
                        type="number"
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            max_retries: e.target.value,
                          })
                        }
                        value={formData.max_retries}
                        name="max_retries"
                        id="max_retries"
                        className="w-full lg:w-1/2 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block p-2.5 "
                        placeholder="3"
                        required=""
                      />
                    </dd>
                  </div>
                  <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt class="text-sm font-medium leading-6 text-gray-900">
                      Max Applicants
                    </dt>
                    <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                      <input
                        type="number"
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            max_applicants: e.target.value,
                          })
                        }
                        value={formData.max_applicants}
                        name="max_applicants"
                        id="max_applicants"
                        className="w-full lg:w-1/2 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block p-2.5 "
                        placeholder="200"
                        required=""
                      />
                    </dd>
                  </div>
                  <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt class="text-sm font-medium leading-6 text-gray-900">
                      Currency
                    </dt>
                    <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                      <Select
                        className="text-sm md:w-1/2 min-w-fit"
                        styles={selectStyle}
                        value={selectedCurrency}
                        theme={selectTheme}
                        onChange={(selectedOption) => {
                          setSelectedCurrency(selectedOption);
                          setFormData({
                            ...formData,
                            currency: selectedOption,
                          });
                        }}
                        options={currencies}
                        placeholder="Select a currency format..."
                      />
                    </dd>
                  </div>
                  <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt class="text-sm font-medium leading-6 text-gray-900">
                      Social Accounts
                    </dt>
                    <dd class="mt-1 flex gap-4 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                      <div className="flex gap-3 items-center">
                        <Checkbox
                          className={""}
                          checked={formData.include_github}
                          setChecked={(e) =>
                            setFormData({
                              ...formData,
                              include_github: e.target.checked,
                            })
                          }
                        />
                        <label
                          htmlFor="include_github"
                          className="block text-sm font-medium text-gray-900 "
                        >
                          Github
                        </label>
                      </div>
                      <div className=" flex gap-3 items-center">
                        <Checkbox
                          className={""}
                          checked={formData.include_linkedin}
                          setChecked={(e) =>
                            setFormData({
                              ...formData,
                              include_linkedin: e.target.checked,
                            })
                          }
                        />
  
                        <label
                          htmlFor="include_linkedin"
                          className="block text-sm font-medium text-gray-900 "
                        >
                          LinkedIn
                        </label>
                      </div>
                    </dd>
                  </div>
                  <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt class="text-sm font-medium leading-6 text-gray-900">
                      Relevant Experience in Months
                    </dt>
                    <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                      <PreferenceSwitch
                        checked={formData.include_relevant_experience}
                        setChecked={(e) =>
                          setFormData({
                            ...formData,
                            include_relevant_experience: e.target.checked,
                          })
                        }
                      />
                    </dd>
                  </div>
                  <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt class="text-sm font-medium leading-6 text-gray-900">
                      Notice Period
                    </dt>
                    <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                      <PreferenceSwitch
                        checked={formData.include_notice_period}
                        setChecked={(e) =>
                          setFormData({
                            ...formData,
                            include_notice_period: e.target.checked,
                          })
                        }
                      />
                    </dd>
                  </div>
                  <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt class="text-sm font-medium leading-6 text-gray-900">
                      Expected Annual Salary
                    </dt>
                    <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                      <PreferenceSwitch
                        checked={formData.include_expected_ctc}
                        setChecked={(e) =>
                          setFormData({
                            ...formData,
                            include_expected_ctc: e.target.checked,
                          })
                        }
                      />
                    </dd>
                  </div>
                  <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt class="text-sm font-medium leading-6 text-gray-900">
                      Current Annual Salary
                    </dt>
                    <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                      <PreferenceSwitch
                        checked={formData.include_current_ctc}
                        setChecked={(e) =>
                          setFormData({
                            ...formData,
                            include_current_ctc: e.target.checked,
                          })
                        }
                      />
                    </dd>
                  </div>
  
                  <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt class="text-sm font-medium leading-6 text-gray-900">
                      Last Increment
                    </dt>
                    <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                      <PreferenceSwitch
                        checked={formData.last_increment}
                        setChecked={(e) =>
                          setFormData({
                            ...formData,
                            last_increment: e.target.checked,
                          })
                        }
                      />
                    </dd>
                  </div>
                </dl>
              </div>
  
              {/* <div className="w-full px-16 py-6 border-y">
                  <div className="w-full flex justify-between items-center mb-3">
                      <div className="w-full mb-2 py-3 border-b">
                          <label className=" w-full">Filter Criteria</label>
                          <p></p>
                      </div>
                     
                  </div>
                  <div className="w-full">
                        <FilterCriteria criteria={filterCriteria} setCriteria={setfilterCriteria} />
                  </div>
              </div> */}
  
              <div className="px-16 py-6 border-y">
                <h2>Questions</h2>
  
                <div className="border rounded-sm bg-white mt-4">
                  <div className="p-3 flex items-center justify-between">
                    <div>
                      <label className="text-gray-900 font-semibold">
                        Assigned Questions
                      </label>
                      <p className="text-sm text-gray-500">
                        Customize your screening process by handpicking specific
                        questions or opting for a random selection from
                        questionnaires created by you.
                      </p>
                    </div>
                    <div className="flex gap-2 items-center">
                      {unsavedChanges && (
                        <span className="text-sm text-orange-500">
                          You have some unsaved changes
                        </span>
                      )}
                      {/* <button disabled={saving} onClick={() => updateQuestions(formData)} className="px-2.5 py-2 text-sm text-white bg-primary-600 rounded-md">{saving ? "Saving" : "Save Changes"}</button> */}
                    </div>
                  </div>
                  {selectedQuestions.length > 0 && (
                    <div class="mt-1 p-3 border-t flex items-center space-x-3">
                      <div class="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          onChange={(e) =>
                            setFormData((prevState) => ({
                              ...prevState,
                              random_questions: e.target.checked,
                            }))
                          }
                          checked={formData.random_questions}
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
                      {formData?.random_questions && (
                        <>
                          <div class="w-px bg-gray-300 h-8"></div>
                          <div class="flex items-center space-x-3">
                            <input
                              type="number"
                              onChange={(e) => handleRandomCount(e.target.value)}
                              value={formData.random_questions_count}
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
                  )}
                  <ul className="mt-1 p-3 space-y-2 border-t">
                    {selectedQuestions.length > 0 ? (
                      <>
                        <label>Selected Questions</label>
                        {selectedQuestions.length > 0 &&
                          selectedQuestions.map((question, index) => (
                            <li
                              key={question?.id}
                              id={question?.id}
                              style={{ minWidth: "90%" }}
                              className="min-w-0 w-full h-5/6 flex justify-between items-start bg-white text-sky-800 border-2 border-[#e4e5f9]  shadow-md rounded-md p-3"
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
                                      className="w-5 h-5 text-brand-purple  hover:text-blue-400"
                                    />
                                  )}
                                  {question.type === "audio" && (
                                    <MicrophoneIcon
                                      title={`${question.type} format`}
                                      className="w-5 h-5 text-brand-purple  hover:text-blue-400"
                                    />
                                  )}
                                  {question.type === "video" && (
                                    <VideoCameraIcon
                                      title={`${question.type} format`}
                                      className="w-5 h-5 text-brand-purple  hover:text-blue-400"
                                    />
                                  )}
                                </label>
                                <label className="  space-x-1 inline-flex items-center justify-end text-sm">
                                  <ClockIcon
                                    title={`duration`}
                                    className="w-5 h-5 text-brand-purple  hover:text-blue-400"
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
                      </>
                    ) : (
                      <div className="text-sm text-gray-500">
                        No Questions selected
                      </div>
                    )}
                  </ul>
                </div>
  
                <div className="w-full mt-6 border p-3 rounded-sm bg-white h-5/6 ">
                  <div className="flex pb-2 mb-1 justify-between items-center space-x-4 w-full border-b ">
                    <h2 class="text-base font-medium text-gray-900 ">
                      {/* {selectedQuestionSet
                                              ? selectedQuestionSet?.name
                                              : "Questionnaire"} */}
                      Available Question Sets
                    </h2>
  
                    <div class="sm:col-span-2 flex space-x-5 h-full w-1/2">
                      <div className="w-full flex justify-end gap-2 items-center">
                        <button
                          onClick={() => setShowModal(true)}
                          class=" px-3 py-2 text-sm text-center text-nowrap text-blue-600 bg-white hover:bg-blue-50/60 hover:text-blue-700 rounded-lg ring-2"
                        >
                          Create Questionnaire
                        </button>
                        <Select
                          className="text-sm w-72"
                          styles={selectStyle}
                          // components={{ Option }}
                          value={selectedQuestionSet}
                          onChange={handleSelectChange}
                          options={questionSets}
                          theme={selectTheme}
                          // defaultValue={fields[0]}
                          // isLoading={questionSetLoading}
                        />
                      </div>
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
                        selectTheme={selectTheme}
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
                        <label className="block font-medium">
                          {questions?.length} Questions
                        </label>
                        <p className=" text-sm text-gray-500">
                          Pick the questions below to include in the resume
                          screening process.
                        </p>
                      </div>
                      <ul
                        className="overflow-auto p-3 flex flex-col gap-3"
                        style={{ height: "calc(405px)" }}
                      >
                        {questions?.map((question, index) => (
                          <li
                            key={question?.id}
                            id={question?.id}
                            style={{ minWidth: "90%" }}
                            className="min-w-0 w-full h-auto flex justify-between items-center border-2 border-[#e4e5f9]  shadow-md rounded-md p-3"
                          >
                            <div className={`w-5/6 h-full flex space-x-3`}>
                              <input
                                type="checkbox"
                                value={question.id}
                                checked={selectedQuestionsIds.includes(
                                  question.id
                                )}
                                onChange={() => handleQuestionSelection(question)}
                              />
                              <div className="w-5/6  ">
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
                                  <ChatBubbleBottomCenterTextIcon className="w-5 h-5 text-brand-purple  hover:text-blue-600" />
                                )}
                                {question.type === "audio" && (
                                  <MicrophoneIcon className="w-5 h-5 text-brand-purple  hover:text-blue-600" />
                                )}
                                {question.type === "video" && (
                                  <VideoCameraIcon className="w-5 h-5 text-brand-purple  hover:text-blue-600" />
                                )}
                              </label>
                              <label className=" gap-1 inline-flex items-center justify-end text-sm">
                                <ClockIcon className="w-5 h-5 text-brand-purple  hover:text-blue-600" />
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
            </>
          ) : (
            <h2 className="px-16 py-6 h-72 flex items-center justify-center">
              Loading....
            </h2>
          )}
  
          <div className="px-16 py-6 flex justify-end gap-3">
          
              <button
                onClick={() => updatePreference(formData)}
                disabled={loading || saving}
                className="border bg-brand-purple text-white rounded-md px-6 py-2 disabled:bg-indigo-200"
              >
                Save
              </button>
           
          </div>
        
  
        {showModal && (
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
                  style={{ minWidth: "40%" }}
                  className="relative  h-auto transform flex-col justify-evenly rounded-lg bg-white text-left shadow-xl transition-all my-8"
                >
                  {/* Header  */}
                  <div className="border-b rounded-t-lg bg-gray-50 flex justify-between py-2 px-3">
                    <h3
                      className="text-base p-4 font-semibold leading-6 text-gray-900"
                      id="modal-title"
                    >
                      Create Question Set
                    </h3>
                    <button onClick={() => handleClose()}>
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  </div>
  
                  {/* Body  */}
                  <div className="bg-white h-auto px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                    <div className="p-4 md:p-5">
                      <form
                        id="question-set-form"
                        className="space-y-4"
                        onSubmit={createQuestionSet}
                      >
                        <div>
                          <label
                            htmlFor="question_set_name"
                            className="block mb-2 text-sm font-medium text-gray-900 "
                          >
                            Name your Question Set
                          </label>
                          <input
                            required
                            onChange={(e) => setQuestionSetName(e.target.value)}
                            value={questionSetName}
                            type="text"
                            name="question_set_name"
                            id="question_set_name"
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                            placeholder="Questions for Trainee Analysts"
                          />
                        </div>
                      </form>
                    </div>
                  </div>
  
                  {/* Footer  */}
                  <div className="bg-gray-50 rounded-b-lg ms-auto px-4 py-3 flex justify-end sm:px-6 space-x-3">
                    <button
                      type="submit"
                      form="question-set-form"
                      className="h-10  justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 sm:ml-3 sm:w-auto"
                    >
                      Save
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
}
 
export default ResumePreferences;