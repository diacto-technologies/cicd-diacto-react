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
import { api } from "../../constants/constants";

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
      const response = await fetch(`${api}/candidates/candidate-names-list/`, {
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
      const response = await fetch(`${api}/jobs/job-names-list/`, {
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
        `${api}/personality-screening/personality-screenings/`,
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

    
    </>
  );
};

export default ResumeList;
