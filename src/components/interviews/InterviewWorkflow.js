import { DndContext, DragOverlay } from "@dnd-kit/core";
import { Draggable } from "./Draggable";

import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MiniCard from "./MiniCard";
import AuthContext from "../../context/AuthContext";
import { XMarkIcon } from "@heroicons/react/20/solid";
import ResumeOptions from "./options/ResumeOptions";
import Questions from "./Questions";
import EditableWorkflow from "./EditableWorkflow";
import PersonalityScreeningOptions from "./options/PersonalityScreeningOptions";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import RulesBuilder from "./RulesBuilder";

const InterviewWorkflow = () => {
  const [openDrawer, setOpenDrawer] = useState(true);

  const { authTokens, userDetails } = useContext(AuthContext);

  // Containers = Interview steps
  const [containers, setContainers] = useState([
    { id: "step-1", order: 1, content: null },
  ]);
  const [activeId, setActiveId] = useState(null);
  const { interviewId } = useParams();
  const [parent, setParent] = useState(null);
  const [currentDraggable, setCurrentDraggable] = useState(null);

  const [interviewsLoading, setInterviewsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const [currentContainer, setCurrentContainer] = useState(null);
  const [showQuestions, setShowQuestions] = useState(false);
  const [optionsData, setOptionsData] = useState({});
  const [currentTab, setCurrentTab] = useState({ label: "Preferences" });

  const [showModal, setShowModal] = useState(false);

  const [questionSetName, setQuestionSetName] = useState("");
  const [questionSets, setQuestionSets] = useState(null);
  const [questionSetLoading, setQuestionSetLoading] = useState(false);
  const [selectedQuestionSet, setSelectedQuestionSet] = useState(null);

  const [interviewData, setInterviewData] = useState({
    name: "",
    description: "",
    created_by: "",
    steps_json: null,
    rounds: 0,
  });

  const settingTabs = [
    {
      label: "Preferences",
    },
    {
      label: "Questionnaires",
    },
    {
      label: "Filter Rules",
    },
    {
      label: "Alerts",
    },
    {
      label : "Filter Criteria"
    }
  ];

  const modules = [
    {
      id: "add-round",
      label: "Add a round",
      icon: <PlusCircleIcon className="w-8 h-8 text-blue-700/70" />,
    },
    // { id: 'resume-screening', label: 'Resume Screening', icon: 'https://cdn-icons-png.flaticon.com/128/909/909212.png' },
    // { id: 'personality-screening', label: 'Personality Screening', icon: 'https://cdn-icons-png.flaticon.com/128/11127/11127424.png' },
    // { id: 'test', label: 'Test', icon: 'https://cdn-icons-png.flaticon.com/128/6403/6403868.png' },
    // { id: 'ai-interview', label: 'AI Interview', icon: 'https://cdn-icons-png.flaticon.com/128/10485/10485130.png' }
  ];

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

  useEffect(() => {
    if (interviewId) {
      fetchInterview();
    }
  }, [interviewId]);

  // Fetch question sets
  useEffect(() => {
    fetchQuestionSet();
  }, []);
  console.count("interview workflow");
  //   console.log("important :::::::::",optionsData)

  // save preference for the selected step and service
  useEffect(() => {
    if (Object.keys(optionsData).length) {
      //console.log("updating container with preference : ", optionsData)
      setContainers((prev) => {
        const updatedContainers = prev.map((container) => {
          if (
            currentContainer &&
            container.order === currentContainer.order &&
            container.content.id === currentContainer?.content.id
          ) {
            let key = "";
            switch (
              currentContainer.content.id // Using optional chaining here
            ) {
              case "resume-screening":
                key = "preference";
                break;
              case "personality-screening":
                key = "preference";
                break;
              default:
                // key = currentContainer.content.id
                break;
            }

            setCurrentContainer({
              ...container,
              content: {
                ...container.content,
                [key]: optionsData,
              },
            });

            return {
              ...container,
              content: {
                ...container.content,
                [key]: optionsData,
              },
            };
          }

          return container;
        });

        //console.log("updatedContainers : ", updatedContainers)

        return updatedContainers;
      });
    }
  }, [optionsData]);

  // useEffect(() => {
  //     if (currentContainer && currentContainer.content.preference) {
  //     }
  // }, [currentContainer])

  function handleDragStart(event) {
    setActiveId(event.active.id);
    setCurrentDraggable(modules.find((item) => item.id === event.active.id));
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    setCurrentDraggable(null);
    setActiveId(null);
    if (over) {
      setContainers((prev) => {
        const item = prev.find((item) => item.id === over.id);
        if (item) {
          const updatedContent =
            modules.find((item) => item.id === active.id) || null;
          return prev.map((container) =>
            container.id === over.id
              ? { ...container, content: updatedContent }
              : container
          );
        }
        return prev; // Return previous state if item is not found
      });
    }

    setParent(over ? over.id : null);
  }

  const handleCancelClick = () => {
    navigate("/app/user/interviews/");
  };

  const handleClose = () => {
    setQuestionSetName(null);
    setShowModal(false);
  };

  function addRound(params) {
    setContainers((prev) => [
      ...prev,
      {
        id: "step-" + (containers.length + 1),
        order: containers.length + 1,
        content: null,
      },
    ]);
  }

  const fetchInterview = async () => {
    try {
      setInterviewsLoading(true);
      const response = await fetch(
        `/interview/interview-modules/${interviewId}/`,
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
      setInterviewData(data);
      if (data.steps_json) {
        //console.log("-----------------------------", data.steps_json)
        setContainers(data.steps_json);
      }

      setInterviewsLoading(false);
    } catch (error) {
      setInterviewsLoading(false);
    }
  };

  async function saveStepstoWorkflow() {
    const apiUrl = `/interview/interview-modules/${interviewId}/`;
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + String(authTokens.access),
    };

    if (containers.length > 1 && containers[0].content !== null) {
      setSaving(true);
      try {
        console.log("data saved : ", containers);
        const response = await fetch(apiUrl, {
          method: "PATCH",
          headers: headers,
          body: JSON.stringify({ steps_json: containers }),
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();

        if (data) {
          setSaving(false);
          setContainers(data.steps_json);
        }
      } catch (error) {
        setSaving(false);
        console.error("Error creating interview steps:", error);
      }
    }
  }

  async function removeContainer(itemId) {
    setContainers((prevContainer) =>
      prevContainer.filter((c) => c.id !== itemId)
    );
  }

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
        const apiUrl = "/interview/question-sets/";

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
      setQuestionSetLoading(false);
    } catch (error) {
      setQuestionSetLoading(false);
    }
  };

  function handleSelectChange(selectedOption) {
    //console.log("handleSelectChange", selectedOption)
    if (selectedOption) {
      setOptionsData((prev) => ({ ...prev, question_set: selectedOption.id }));
      setSelectedQuestionSet(selectedOption);
      // setCurrentContainer( prev => ({...prev, content: {
      //     ...prev.content,
      //     preference: {...prev.content.preference, question_set : selectedOption.id}
      // }}))
    }
  }

  const onContainerChange = (item) => {
    console.log("Container change");
    setSelectedQuestionSet(null);
    setShowQuestions(true);

    if (item.content?.preference) {
      setShowQuestions(true);
      console.log("item.content?.preference ", item.content?.preference);
      setOptionsData(item.content?.preference);
    }
    setCurrentContainer(item);
  };

  return (
    <>
      <div className="h-screen w-full overflow-hidden workflow-container">
        {/* Header  */}
        <div className="p-5 section-heading flex justify-between items-center  border-b bg-white">
          <div className="">
            <label className="text-xl md:text-xl font-bold">
              {interviewId ? interviewData.name : ""}{" "}
            </label>
            <p className="text-sm font-medium text-gray-500">
              {interviewData?.description
                ? interviewData.description
                : "Automate interview process by creating an interview workflow and assigning it to a job opening..."}
            </p>
          </div>

          <div className="flex">
            <button
              onClick={handleCancelClick}
              type="button"
              className="text-sm me-2 inline-flex items-center rounded-md font-semibold px-3 py-2 leading-6 border border-gray-400 text-gray-500 hover:border-gray-500 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              disabled={saving}
              type="button"
              onClick={saveStepstoWorkflow}
              className="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
            >
              <i className="fa-regular text-base font-light fa-floppy-disk me-2"></i>
              Save
            </button>
          </div>
        </div>

        <div
          className=" w-full flex overflow-auto"
          style={{ height: "calc(100dvh - 95px)" }}
        >
          <div className="w-3/6 h-full">
            <EditableWorkflow
              saving={saving}
              addRound={addRound}
              containers={containers}
              currentContainer={currentContainer}
              onContainerChange={onContainerChange}
              removeContainer={removeContainer}
            />
          </div>

          <div className="w-3/6 h-full border-l shadow-md ">
            <div className="  border bg-white">
              <div className="p-4 w-full flex items-center border-b bg-white h-20 ">
                <h2 className="text-lg font-medium text-gray-900 ">
                  {currentContainer &&
                    ` Round ${currentContainer.order} | ${
                      currentContainer.content.label
                    } ${currentTab?.label || ""}`}
                </h2>
              </div>
              <ul className="flex h-full items-center  gap-6  px-5 cursor-pointer">
                {settingTabs.length > 0 &&
                  settingTabs.map((item, index) => (
                    <li
                      key={index}
                      onClick={() => setCurrentTab(item)}
                      className={` hover:text-blue-600 py-1.5 ${
                        currentTab?.label === item.label && "font-medium text-blue-400 border-b-4 border-blue-400"
                      }`}
                    >
                      {item.label}
                    </li>
                  ))}
              </ul>
            </div>

            <div style={{ height: "calc(100dvh - 225px)" }} className=" w-full bg-white rounded-md overflow-auto">
              {!currentContainer || !currentTab ? (
                <div className=" w-full p-3">
                  <label className="text-gray-600 text-sm w-full">
                    Select a module from your workflow to customize it
                  </label>
                </div>
              ) : (
                <div className="py-2 px-4 mx-auto overflow-auto" >
                  {currentContainer.content.id === "resume-screening" &&
                    currentTab?.label === "Preferences" && (
                      <ResumeOptions
                        currentContainer={currentContainer}
                        setShowQuestions={setShowQuestions}
                        optionsData={optionsData}
                        setOptionsData={setOptionsData}
                        selectStyle={selectStyle}
                        selectedQuestionSet={selectedQuestionSet}
                        setSelectedQuestionSet={setSelectedQuestionSet}
                        questionSets={questionSets}
                        questionSetLoading={questionSetLoading}
                        handleSelectChange={handleSelectChange}
                        setShowModal={setShowModal}
                      />
                    )}
                  {currentContainer.content.id === "personality-screening" &&
                    currentTab?.label === "Preferences" && (
                      <PersonalityScreeningOptions
                        currentContainer={currentContainer}
                        setShowQuestions={setShowQuestions}
                        optionsData={optionsData}
                        setOptionsData={setOptionsData}
                        selectStyle={selectStyle}
                        selectedQuestionSet={selectedQuestionSet}
                        setSelectedQuestionSet={setSelectedQuestionSet}
                        questionSets={questionSets}
                        questionSetLoading={questionSetLoading}
                        handleSelectChange={handleSelectChange}
                        setShowModal={setShowModal}
                      />
                    )}
                  {showQuestions && currentTab?.label === "Questionnaires" && (
                    <Questions
                      questionSets={questionSets}
                      optionsData={optionsData}
                      setOptionsData={setOptionsData}
                      currentContainer={currentContainer}
                      selectStyle={selectStyle}
                      showQuestions={showQuestions}
                      setShowQuestions={setShowQuestions}
                      selectedQuestionSet={selectedQuestionSet}
                      setSelectedQuestionSet={setSelectedQuestionSet}
                      questionSetLoading={questionSetLoading}
                      handleSelectChange={handleSelectChange}
                      setShowModal={setShowModal}
                    />
                  )}

                  {
                    currentTab?.label == "Filter Rules" && (
                      <RulesBuilder />
                    )
                  }
                  {/* {
                    currentTab?.label == "Filter Criteria" && (
                      <FilterCriteria />
                    )
                  } */}
                </div>
              )}
            </div>
          </div>
        </div>
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
};

export default InterviewWorkflow;