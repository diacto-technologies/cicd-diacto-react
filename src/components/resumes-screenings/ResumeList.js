import {
  ChatBubbleBottomCenterTextIcon,
  ClockIcon,
  MicrophoneIcon,
  VideoCameraIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";
import { useContext, useEffect, useState } from "react";
import ReactSelect from "react-select";
import {  useNavigate, useParams } from "react-router-dom";
import {
  BriefcaseIcon,
} from "@heroicons/react/24/outline";
import AuthContext from "../../context/AuthContext";
import Table from "../../utils/tables/Table";

const ResumeList = () => {
  const navigate = useNavigate();
  const [tableInstance, setTableInstance] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [applicants, setApplicants] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [screenings, setScreenings] = useState([]);
  const [screeningsLoading, setScreeningsLoading] = useState(true);
  const [applicantsLoading, setApplicantsLoading] = useState(false);
  const [jobsLoading, setJobsLoading] = useState(false);
  const { orgServices, authTokens } = useContext(AuthContext);
  const [error, setError] = useState({});
  const [expiredAt, setExpiredAt] = useState("");
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);

  const [questionSets, setQuestionSets] = useState(null);
  const [questionSetLoading, setQuestionSetLoading] = useState(false);
  const [selectedQuestionSet, setSelectedQuestionSet] = useState(null);

  const [questions, setQuestions] = useState([]);
  const [selectedQuestionsIds, setSelectedQuestionsIds] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [tableRowCount, setTableRowCount] = useState("fetching");
  const { serviceId } = useParams()



  const [columns, setColumns] = useState([
    {
      title: 'Name', field: 'name', hozAlign: "left", minWidth: 120, headerSort: false,
      titleFormatter: function (cell, formatterParams, onRendered) {
        return '<div class="column-container">' +
          `<label class="column-title">${cell.getValue()}</label>` +
          '</div>';
      },
      // formatter: linkFormatter,
      // headerPopup: headerPopupFormatter, 
      cellClick: function (e, cell) {
        const id = cell.getData().candidate_ids[0];
        if (id) {
        navigate(`/app/user/applicants/applicant/${id}/profile/resume-screening/1/`)
          
        }
        //console.log(id)
      },
      // headerPopupIcon: `<i class='fa-solid fa-filter column-filter-icon' title='Filter'></i>`, 
      headerFilter: true, headerFilterFunc: "like"
    },
    {
      title: 'Resume', field: 'resume_score.overall_score', hozAlign: "left", headerSort: false,
      // sorter: scoreSorter,
      minWidth: 120,
      titleFormatter: function (cell, formatterParams, onRendered) {
        return '<div class="column-container">' +
          `<label class="column-title">${cell.getValue()}</label>` +
          '</div>';
      },
      // headerPopup: headerPopupFormatter,
      // formatter: scoreFormatter,
      // headerPopupIcon: `<i class='fa-solid fa-filter column-filter-icon' title='Filter'></i>`, 
      headerFilter: true, headerFilterFunc: "in"
    },
    {
      title: 'Job Name', field: 'job.title', hozAlign: "left", sorter: "string", minWidth: 120, headerSort: false,
      titleFormatter: function (cell, formatterParams, onRendered) {
        return '<div class="column-container">' +
          `<label class="column-title">${cell.getValue()}</label>` +
          '</div>';
      },
      // cellClick: function (e, cell) {
      //   const toEmail = cell.getValue();
      //   openOutlook(toEmail)
      //   console.log(toEmail)
      // },
      //  headerPopup: headerPopupFormatter,
      // formatter: emailFormatter,
      //  headerPopupIcon: `<i class='fa-solid fa-filter column-filter-icon' title='Filter'></i>`, 
      headerFilter: true, headerFilterFunc: "like"
    },
    {
      title: 'Status', field: 'status_text', hozAlign: "left", sorter: "string", minWidth: 120, headerSort: false,
      titleFormatter: function (cell, formatterParams, onRendered) {
        // Create the dropdown element
        let dropdownHTML = `
        <div class="column-container">
            <label class="column-title">${cell.getColumn().getDefinition().title}</label>
            <select id="status-dropdown" class="status-dropdown">
                <option value="">All</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="On Hold">On Hold</option>
                <option value="Not Shortlisted">Not Shortlisted</option>
                <option value="Under Review">Under Review</option>
                <option value="Failed to process">Failed to process</option>
                <!-- Add more options as needed -->
            </select>
        </div>`;

        // Attach event listener to the dropdown after rendering
        onRendered(() => {
          const dropdown = document.getElementById("status-dropdown");
          if (dropdown) {
            dropdown.addEventListener("change", (event) => {
              const selectedValue = event.target.value;

              // Trigger your custom action here
              // Example: Filter the table by the selected status
              if (selectedValue) {
                cell.getTable().setFilter("status_text", "!=", selectedValue);
              } else {
                cell.getTable().clearFilter("status_text"); // Clear the filter if no selection
              }
            });
          }
        });

        return dropdownHTML;
      },
      formatter: statusFormatter,
      // headerPopup: headerPopupFormatter, 
      // headerPopupIcon: `<i class='fa-solid fa-filter column-filter-icon' title='Filter'></i>`, 
      headerFilter: false, headerFilterFunc: "!="
    },
    {
      title: 'Message', field: 'task_message', hozAlign: "left", minWidth: 120, sorter: "string", headerSort: false,
      titleFormatter: function (cell, formatterParams, onRendered) {
        return '<div class="column-container">' +
          `<label class="column-title">${cell.getValue()}</label>` +
          '</div>';
      },
      // headerPopup: headerPopupFormatter,
      // formatter: locationFormatter,
      // headerPopupIcon: `<i class='fa-solid fa-filter column-filter-icon' title='Filter'></i>`, 
      headerFilter: false, headerFilterFunc: "like"
    },
    {
      title: 'Updated At', field: 'updated_at', hozAlign: "left", sorter: "string", minWidth: 120, headerSort: false,
      titleFormatter: function (cell, formatterParams, onRendered) {
            // Create the date picker HTML element
            let datePickerHTML = `
                  <div class="column-container">
                      <label class="column-title">${cell.getColumn().getDefinition().title}</label>
                      <input type="date" id="date-picker" class="date-picker" style="width: -webkit-fill-available;">
                  </div>
              `;

            // Attach event listener to the date picker after rendering
            onRendered(() => {
              const datePicker = document.getElementById("date-picker");
              if (datePicker) {
                datePicker.addEventListener("change", (event) => {
                  const selectedDate = event.target.value;

                  // Trigger your custom action here
                  // Example: Filter the table by the selected date
                  if (selectedDate) {
                    cell.getTable().setFilter("updated_at", "in", selectedDate);
                  } else {
                    cell.getTable().clearFilter("updated_at"); // Clear the filter if no date is selected
                  }
                });
              }
            });

            return datePickerHTML;
          },
      // headerPopup: headerPopupFormatter, 
      formatter: luxonDateDiffFormatter,
      // headerPopupIcon: `<i class='fa-solid fa-filter column-filter-icon' title='Filter'></i>`, 
      // headerFilter: true, headerFilterFunc: "in"
    },
    // Add more columns as needed
  ]);

  const [totalCount, setTotalCount] = useState(0);
  const fieldMapping = {
    'resume_score': "resume_score__overall_score",
    "resume_score.overall_score": "resume_score__overall_score",
    "job.title": "job__title"
  };

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
    // fetchPersonalityScreenings();
    // Create a new date object for the current date and time
    const currentDate = new Date();
    const utcDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000); // Add 1 day in milliseconds
    // Format the UTC date and time in ISO string, which will be in UTC
    const formattedUtcDateTime = utcDate.toISOString().slice(0, 16); // 'YYYY-MM-DDTHH:MM'
    // Set the UTC datetime as the expiration time
    setExpiredAt(formattedUtcDateTime);
  }, []);

  useEffect(() => {
    // console.log("selectedQuestionSet -----------------------",selectedQuestionSet)
    if (selectedQuestionSet) {
      fetchQuestions();
    }
  }, [selectedQuestionSet]);

  const openTestModal = async () => {
    setShowModal(true);
    fetchJobs();
    fetchApplicants();
    fetchQuestionSet();
  };

  function luxonDateDiffFormatter(cell, formatterParams, onRendered) {
    // const { inputFormat, units, humanize, invalidPlaceholder } = formatterParams;
    const value = new Date(cell.getValue()).toDateString();
    return value;
  }

  function statusFormatter(cell) {
    const status_text = cell.getRow().getData().status_text; // If no skills, set to an empty array

    if (!status_text) {
      return <div>No data available</div>;
    }

    let badgeClass = "";
    if (status_text === "Under Review") {
      badgeClass = "bg-yellow-500";
    }
    if (status_text === "Shortlisted") {
      badgeClass = "bg-green-500 ";
    }
    if (status_text === "Not Shortlisted") {
      badgeClass = "bg-red-500 ";
    }
    if (status_text === "On Hold") {
      badgeClass = "bg-orange-500";
    }

    // Map over the skills array and return a badge for each skill
    return (
      `<div>
        <span
          class="inline-flex items-center gap-x-1 rounded-md px-2 py-1 mr-2 mb-1 text-xs font-medium ring-1 ring-inset"
        >
    ${status_text==="Failed to Process" ? '<i class="fa-solid fa-exclamation mr-1 text-red-700"></i>' : `<div class="w-2 h-2 rounded-full ${badgeClass}"></div>`}
          ${status_text}
        </span>
      </div>`
    );
  }

  // const fetchPersonalityScreenings = async () => {
  //   setScreeningsLoading(true);

  //   try {
  //     const response = await fetch(
  //       `/personality-screening/personality-screenings/`,
  //       {
  //         method: "GET",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: "Bearer " + String(authTokens.access),
  //         },
  //       }
  //     );
  //     if (!response.ok) {
  //       throw new Error("Network response was not ok");
  //     }
  //     const data = await response.json();
  //     if (data.results.length) {
  //       // const formattedOptions = data.results.map((item) => ({
  //       //   label: item.name,
  //       //   value: item.id,
  //       // }));
  //       setScreenings(data.results);
  //     }

  //     setScreeningsLoading(false);
  //   } catch (error) {
  //     setError(error);
  //     setScreeningsLoading(false);
  //   }
  // };

  const fetchApplicants = async () => {
    setApplicantsLoading(true);

    try {
      const response = await fetch(`/candidates/candidate-names-list/`, {
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
      if (data.results.length) {
        const formattedOptions = data.results.map((item) => ({
          label: item.name,
          value: item.id,
        }));
        setApplicants(formattedOptions);
      }

      setApplicantsLoading(false);
    } catch (error) {
      setError(error);
      setApplicantsLoading(false);
    }
  };

  const fetchJobs = async () => {
    setJobsLoading(true);

    try {
      const response = await fetch(`/jobs/job-names-list/`, {
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
      if (data.results.length) {
        const formattedOptions = data.results.map((item) => ({
          label: item.title,
          value: item.id,
        }));
        setJobs(formattedOptions);
      }

      setJobsLoading(false);
    } catch (error) {
      setError(error);
      setJobsLoading(false);
    }
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
      setQuestionSetLoading(false);
    } catch (error) {
      setQuestionSetLoading(false);
    }
  };

  const fetchQuestions = async () => {
    try {
      const response = await fetch(
        `/interview/questions/?question_set_id=${selectedQuestionSet?.id}`,
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
            label: item.text,
            value: item.id,
            type: item.type,
            time_limit: item.time_limit,
          }))
        );
      }
    } catch (error) {
      //console.log(error);
    }
  };

  const handleClose = () => {
    setShowModal(false);
  };

  const removeQuestion = (questionId) => {
    const updatedSelectedQuestions = selectedQuestions.filter(
      (q) => q.id !== questionId
    );
    const selectedIds = updatedSelectedQuestions.map((q) => q.id);

    //console.log(selectedIds);
    setSelectedQuestionsIds(selectedIds);
    // setOptionsData(prevState => ({ ...prevState, questions_ids: selectedIds, questions: updatedSelectedQuestions }))
    setSelectedQuestions(updatedSelectedQuestions);
  };

  //console.log(selectedQuestions);

  const sendScreeningLink = async (e) => {
    e.preventDefault();
    const ids = selectedQuestions.map((question) => question.value);
    //console.log("job :", selectedJob.value);
    //console.log("Candidate :", selectedApplicant.value);
    //console.log("question set :", selectedQuestionSet.value);
    //console.log("questions :", selectedQuestions, ids);
    //console.log("expired at :", expiredAt);

    const formattedData = {
      job: selectedJob.value || null,
      candidate: selectedApplicant.value || null,
      question_set: selectedQuestionSet.value || null,
      questions: ids || [],
      expired_at: expiredAt,
    };

    try {
      const response = await fetch(
        `/personality-screening/personality-screenings/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + String(authTokens.access),
          },
          body: JSON.stringify(formattedData),
        }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      //console.log(data);

      setJobsLoading(false);
    } catch (error) {
      console.error(error);
      setError(error);
      setJobsLoading(false);
    }
  };

  return (
    <>
      <div id="testList" className="w-full h-full p-3 job-list">
        {/* Header Section  */}
        <div className="md:flex items-center justify-between mt-2 md:mt-0 lg:px-4 px-2 py-2 mb-4 border-b ">
          <div className="flex justify-between mb-2 md:mb-0">
            <div>
              <h2 className="text-xl font-semibold md:mb-0 mb-2">Resume Screenings</h2>
              <p className=" text-sm text-gray-500">{tableRowCount === 0 ? "No Rows" : tableRowCount + " rows"}</p>
            </div>
            {/* <p className='text-xs text-gray-500'>Create job openings </p> */}

          </div>

          <div className="flex space-x-2 justify-between">
            <div className=" text-gray-600 border rounded-md flex w-full">

            </div>
            {/* <SortDropdown handleAscSort={handleAscSort} handleDescSort={handleDescSort} dropdownIcon={'fa-arrow-up-wide-short'} dropdownItems={[{ label: 'Job Title', value: 'title' }, { label: 'Close Date', value: 'close_date' }, { label: 'Published', value: 'published' }]} /> */}
            {/* <span className="hidden sm:flex">
              <button
                onClick={() => openTestModal()}
                type="button"
                className="add-job-btn inline-flex truncate justify-center items-center rounded-md bg-primary-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
              >
                Assign Personality Screening
              </button>
            </span> */}
          </div>
        </div>

        <div
          className="overflow-auto rounded-xl"
          style={{ height: "calc(100dvh - 150px)" }}
        >
          <Table url={`/filter/resume`} setTableInstance={setTableInstance} columns={columns} data={applicants} fieldMapping={fieldMapping} setTableRowCount={setTableRowCount} />
         
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
                style={{ minWidth: "60%" }}
                className="relative h-auto transform flex-col justify-evenly rounded-lg bg-white text-left shadow-xl transition-all my-8"
              >
                {/* Header  */}
                <div className="border-b rounded-t-lg bg-gray-50 flex justify-between py-2 px-3">
                  <h3
                    className="text-base p-4 font-semibold leading-6 text-gray-900"
                    id="modal-title"
                  >
                    Assign Personality Screening
                  </h3>
                  <button onClick={() => handleClose()}>
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                {/* Body  */}
                <div className="bg-white h-auto px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div class="p-4 md:p-5 mb-4">
                    <form
                      id="create-test-form"
                      class="space-y-4"
                      onSubmit={sendScreeningLink}
                    >
                      <div className="w-1/2 max-w-96 ">
                        <label
                          htmlFor="description"
                          class="block mb-2 text-sm font-medium text-gray-900 "
                        >
                          Valid Till{" "}
                          <span className="text-xs text-gray-400 font-light">
                            (Expiry of link)
                          </span>
                        </label>
                        <div className="flex gap-x-4 items-center">
                          <input
                            value={expiredAt}
                            onChange={(e) => setExpiredAt(e.target.value)}
                            type="datetime-local"
                            name="valid-to"
                            id="valid-to"
                            placeholder=""
                            class="bg-gray-50  border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500  w-full p-2.5 "
                          />
                          <label className="">UTC</label>
                        </div>
                      </div>
                      <div>
                        <label
                          htmlFor="valid-to"
                          class="block mb-2 text-sm font-medium text-gray-900 "
                        >
                          Candidate
                        </label>
                        <ReactSelect
                          className="text-sm md:w-1/2 min-w-fit"
                          placeholder="Select a candidate"
                          styles={selectStyle}
                          isLoading={applicantsLoading}
                          value={selectedApplicant}
                          onChange={(selectedOption) =>
                            setSelectedApplicant(selectedOption)
                          }
                          //   onInputChange={handleInputChange}
                          options={applicants}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="valid-to"
                          class="block mb-2 text-sm font-medium text-gray-900 "
                        >
                          Job{" "}
                          <span className="text-xs text-gray-400 font-light">
                            Select the job opening that the candidate is being
                            screened for
                          </span>
                        </label>
                        <ReactSelect
                          className="text-sm md:w-1/2 min-w-fit"
                          placeholder="Select a candidate"
                          styles={selectStyle}
                          isLoading={jobsLoading}
                          value={selectedJob}
                          onChange={(selectedOption) =>
                            setSelectedJob(selectedOption)
                          }
                          //   onInputChange={handleInputChange}
                          options={jobs}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="description"
                          class="block mb-2 text-sm font-medium text-gray-900 "
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
                          class="block mb-2 text-sm font-medium text-gray-900 "
                        >
                          Questions
                        </label>
                        <ReactSelect
                          classNamePrefix={"select"}
                          className="select w-full text-sm md:w-1/2 min-w-fit"
                          placeholder="Select a question set"
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

                  {selectedQuestions.length > 0 && (
                    <div className="">
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
                        style={{ maxHeight: "300px" }}
                      >
                        {selectedQuestions.map((question) => (
                          <li
                            key={question?.value}
                            id={question?.value}
                            style={{ minWidth: "90%" }}
                            className="min-w-0 w-full h-5/6 flex justify-between items-start bg-white text-sky-800 border-2 border-blue-400/20  shadow-md rounded-md p-3"
                          >
                            <div className={`w-5/6 h-full `}>
                              <label
                                title={question.text}
                                className="mt-1 text-sm block font-normal w-5/6 truncate"
                              >
                                {question.label}
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
                </div>

                {/* Footer  */}
                <div className="bg-gray-50 rounded-b-lg ms-auto px-4 py-3 flex justify-end sm:px-6 space-x-3">
                  <button
                    type="submit"
                    form="create-test-form"
                    className="h-10  justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 sm:ml-3 sm:w-auto"
                  >
                    Send Screening Link
                  </button>
                  <button
                    // onClick={() => handleClose()}
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

export default ResumeList;
