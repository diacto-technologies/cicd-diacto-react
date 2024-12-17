import { XMarkIcon, MicrophoneIcon, VideoCameraIcon, ChatBubbleBottomCenterTextIcon, ClockIcon } from "@heroicons/react/20/solid";
import { useContext, useEffect, useState } from "react";
import AuthContext from "../../context/AuthContext";
import Select from 'react-select';
import "../questionnaires/Questions.css"
import AddQuestion from "./AddQuestion";


const Questions = ({ selectedQuestionSet, setSelectedQuestionSet, showQuestions, setShowQuestions, questionSets, handleSelectChange, questionSetLoading, selectStyle, setShowModal, currentContainer, optionsData, setOptionsData }) => {
    const { authTokens } = useContext(AuthContext);
    const [questions, setQuestions] = useState([]);
    const [selectedQuestionsIds, setSelectedQuestionsIds] = useState([]);
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    

    const answerTypes = [
        { label: "Text", value: "text" },
        { label: "Audio", value: "audio" },
        { label: "Video", value: "video" },
    ]

    const [selectedAnswerType, setSelectedAnswerType] = useState(answerTypes[0])


    // console.log("optionsData : ",optionsData)

    useEffect(() => {
        // console.log("selectedQuestionSet -----------------------",selectedQuestionSet)
        if (selectedQuestionSet) {
            fetchQuestions()
        }
    }, [selectedQuestionSet])

    useEffect(() => {

        console.log("useeffect run")
        if (currentContainer && currentContainer?.content?.preference) {


            const preferenceData = currentContainer?.content?.preference
            // console.log("preferenceData", preferenceData)
            if (preferenceData) {
                setShowQuestions(true)
                setSelectedQuestions(preferenceData?.questions || [])
                setSelectedQuestionsIds(preferenceData?.questions_ids || [])
            }

            // console.log("updating preference", questionSets)
            const updatedFormData = { ...currentContainer }
            const questionSet = currentContainer?.content?.preference.question_set?.id ? questionSets?.find(set => parseInt(set.id) === parseInt(currentContainer?.content?.preference.question_set.id)) : questionSets?.find(set => parseInt(set.id) === parseInt(currentContainer?.content?.preference.question_set))


            if (questionSet) {
                updatedFormData.content.preference.question_set = questionSet.id
            }
            console.log("questionSet: ", questionSets, currentContainer.content?.preference)
            setSelectedQuestionSet(questionSet)
            // setFormData(updatedFormData.content.preference)

        } else {

            setSelectedQuestions([])
            setSelectedQuestionsIds([])
            setSelectedQuestionSet(null)
            setOptionsData({
                max_retries: "",
                max_resume_size: "",
                max_applicants: "",
                locations_to_exclude: null,
                include_github: false,
                include_linkedin: true,
                random_questions: false,
                questions: [],
                questions_count: null,
                // include_questions: false,
                question_set: null
            })
        }
    }, [currentContainer])

    // console.log("currentContainer : ", currentContainer.id)

    const fetchQuestions = async () => {
        try {
            const response = await fetch(`/interview/questions/?question_set_id=${selectedQuestionSet?.id}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + String(authTokens.access),
                    },
                });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();

            if (data) {
                setQuestions(data.results)
            }

        } catch (error) {
            console.log(error)
        }
    };

    const handleTypeChange = (selectedOption) => {
        setSelectedAnswerType(selectedOption)
    }


    

    async function deleteQuestion(id) {
        const headers = {
            'Content-Type': 'application/json',
            Authorization: "Bearer " + String(authTokens.access),
        };
        try {
            const apiUrl = `/interview/questions/${id}`;

            const response = await fetch(apiUrl, {
                method: 'DELETE',
                headers: headers,
            })

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            if (data) {


                console.log("modified data:", data);

                setQuestions((prev) => prev.filter((q) => q.id !== id)); // Add new question to the list

            }

        } catch (error) {
            console.error('Error creating interview module:', error);
        }
    }

    const handleQuestionSelection = (selectedQuestion) => {
        // Toggle selection
        const isSelected = selectedQuestions.find(q => q.id === selectedQuestion.id);
        // console.log(isSelected, selectedQuestions, selectedQuestion, "isSelected :::::::::::::")
        let updatedSelectedQuestions;
        if (isSelected) {
            updatedSelectedQuestions = selectedQuestions.filter(q => q.id !== selectedQuestion.id);
        } else {
            updatedSelectedQuestions = [...selectedQuestions, selectedQuestion];
        }

        // Updated list of ids and questions 
        const selectedIds = updatedSelectedQuestions.map(q => q.id)
        setSelectedQuestionsIds(selectedIds)
        setOptionsData(prevState => ({ ...prevState, questions_ids: selectedIds, questions: updatedSelectedQuestions }))
        setSelectedQuestions(updatedSelectedQuestions);
    };

    console.log("option data :::::::::::::::::::::::::::::::::::", optionsData)


    const removeQuestion = (questionId) => {
        const updatedSelectedQuestions = selectedQuestions.filter(q => q.id !== questionId);
        const selectedIds = updatedSelectedQuestions.map(q => q.id)

        console.log(selectedIds)
        setSelectedQuestionsIds(selectedIds)
        setOptionsData(prevState => ({ ...prevState, questions_ids: selectedIds, questions: updatedSelectedQuestions }))
        setSelectedQuestions(updatedSelectedQuestions)
    }

    console.log(optionsData)

    return (
        <>
            <div className={` h-full  bg-white `}>

                <div className="flex justify-end">
                    <button type="submit" class="px-5 py-2.5  text-sm font-medium text-center text-white bg-primary-600 rounded-lg focus:ring-4 focus:ring-primary-200  hover:bg-primary-800">
                        Save
                    </button>
                </div>
                {/* Add question  */}
                <div className="flex flex-col gap-4 py-3 ">
                    <div className="w-full border  rounded-sm bg-white">
                        <div className="p-3">
                            <label className="text-sky-800 font-semibold">Selected Questions</label>
                            <p className="text-sm text-gray-500">Customize your screening process by handpicking specific questions or opting for a random selection from questionnaires created by you.</p>
                        </div>
                        <div class="mt-4 p-3 border-t border-b flex items-center space-x-3">
                            <div class="flex items-center space-x-3">
                                <input type="checkbox" onChange={(e) => setOptionsData({ ...optionsData, random_questions: e.target.checked })} checked={optionsData.random_questions} name="random_questions" id="random_questions" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block  p-2.5 " placeholder="2MB" required="" />
                                <label for="random_questions" class="block text-sm font-medium text-gray-900 ">Randomize Questions</label>
                            </div>
                            {
                                optionsData?.random_questions &&
                                <>
                                    <div class="w-px bg-gray-300 h-8"></div>
                                    <div class="flex items-center space-x-3">
                                        <input type="number" onChange={(e) => setOptionsData({ ...optionsData, questions_count: e.target.value })} value={optionsData.questions_count} name="questions_count" id="questions_count" class="w-20 block p-1.5  bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 " placeholder="3" />
                                        <label for="questions_count" class="block text-sm font-medium text-gray-900 ">No. of questions</label>
                                    </div>
                                </>
                            }
                        </div>
                        <ul className="mt-4 p-3 space-y-2">
                            {selectedQuestions.length > 0 && selectedQuestions.map((question, index) => (
                                <li key={question?.id} id={question?.id} style={{ minWidth: '90%' }} className="min-w-0 w-full h-5/6 flex justify-between items-start border-indigo-300 text-black border-2   shadow-sm rounded-md p-3">
                                    <div className={`w-5/6 h-full `}>

                                        <label title={question.text} className="mt-1 text-sm block font-normal w-5/6 truncate">{question.text}</label>
                                    </div>
                                    <div className={`w-1/6 flex space-x-3 justify-end items-end h-full px-2 `}>
                                        <label className=" space-x-1 inline-flex items-center justify-end text-sm">
                                            {question.type === "text" && <ChatBubbleBottomCenterTextIcon title={`${question.type} format`} className="w-5 h-5 text-indigo-400  hover:text-indigo-400" />}
                                            {question.type === "audio" && <MicrophoneIcon title={`${question.type} format`} className="w-5 h-5 text-indigo-400  hover:text-indigo-400" />}
                                            {question.type === "video" && <VideoCameraIcon title={`${question.type} format`} className="w-5 h-5 text-indigo-400  hover:text-indigo-400" />}
                                        </label>
                                        <label className="  space-x-1 inline-flex items-center justify-end text-sm">
                                            <ClockIcon title={`duration`} className="w-5 h-5 text-indigo-400  hover:text-indigo-400" />
                                            <span className="text-black font-medium">{question.time_limit}</span>s</label>

                                    </div>
                                    <button onClick={() => removeQuestion(question.id)}><XMarkIcon className="w-5 h-5 text-red-400 hover:text-red-600" /></button>

                                </li>
                            ))}
                        </ul>

                    </div>
                    <div className="w-full border p-3 rounded-sm bg-white">
                        <div className="flex pb-2 mb-1 justify-between items-center space-x-4 w-full border-b ">
                            <h2 class="text-base font-medium text-gray-900 ">{selectedQuestionSet ? selectedQuestionSet?.name : "Questionnaire"}</h2>

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

                                <div>
                                    <button onClick={() => setShowModal(true)} class=" px-3 py-2 text-sm text-center text-blue-600 bg-white hover:bg-blue-50/60 hover:text-blue-700 rounded-lg ring-2">
                                        Create Questionnaire
                                    </button>
                                </div>


                            </div>
                        </div>
                        <div className="mb-3">
                            {!selectedQuestionSet && "No question set selected"}
                            {
                                selectedQuestionSet &&
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
                            }
                        </div>

                        {selectedQuestionSet &&
                            <ul className="space-y-3">
                                <li className="font-medium w-full inline-flex justify-between text-gray-600"><label>{questions.length} Questions</label><button className="text-sm text-blue-500 hover:text-blue-600">Select all</button></li>
                                {
                                    questions.map((question, index) => (
                                        <li key={question?.id} id={question?.id} style={{ minWidth: '90%' }} className="min-w-0 w-full h-5/6 flex justify-between items-center border-2 border-blue-400/20  shadow-md rounded-md p-3">
                                            <div className={`w-5/6 h-full flex space-x-3`}>
                                                <input
                                                    type="checkbox"
                                                    value={question.id}
                                                    checked={selectedQuestions.find(q => q.id === question.id)}
                                                    onChange={() => handleQuestionSelection(question)}
                                                />
                                                <div>
                                                    {/* <span className="me-2 text-sm font-normal text-gray-500">Question</span><span className="text-sm text-gray-600"></span> */}
                                                    <label className="mt-1 text-sm block font-medium  text-gray-800">{question.text}</label>
                                                </div>
                                            </div>
                                            <div className={` flex w-1/6 space-x-4 justify-end items-end h-full px-2 `}>
                                                <label className="space-x-1 inline-flex items-center justify-end text-sm ">
                                                    {question.type === "text" && <ChatBubbleBottomCenterTextIcon className="w-5 h-5 text-blue-300  hover:text-blue-600" />}
                                                    {question.type === "audio" && <MicrophoneIcon className="w-5 h-5 text-blue-300  hover:text-blue-600" />}
                                                    {question.type === "video" && <VideoCameraIcon className="w-5 h-5 text-blue-300  hover:text-blue-600" />}
                                                </label>
                                                <label className=" space-x-1 inline-flex items-center justify-end text-sm">
                                                    <ClockIcon className="w-5 h-5 text-blue-300  hover:text-blue-600" />
                                                    <span className="text-gray-600 font-medium">{question.time_limit}</span>s</label>

                                            </div>
                                            <button><XMarkIcon className="w-5 h-5 hover:text-red-600" /></button>
                                        </li>
                                    ))
                                }

                            </ul>}
                    </div>
                </div>
            </div>
        </>
    );
}

export default Questions;