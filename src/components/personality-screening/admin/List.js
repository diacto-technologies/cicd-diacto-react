import {
  ClockIcon,
  VideoCameraIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";
import { useContext, useEffect, useRef, useState, useCallback } from "react";
import ReactSelect from "react-select";
import AuthContext from "../../../context/AuthContext";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  BriefcaseIcon,
  ClipboardIcon,
} from "@heroicons/react/24/outline";
import { api, handleCopyToClipboard } from "../../../constants/constants";
import { useFetchApplicants } from "../../../constants/candidates/constants";
import { useFetchJobs } from "../../../constants/jobs/constants";
import AddQuestion from "../../interviews/AddQuestion";
import { ToastContainer } from "react-toastify";
import Table from "../../../utils/tables/Table";

const List = () => {
  const navigate = useNavigate();
  const [tableInstance, setTableInstance] = useState(null);
  const { fetchJobs, loadingJobs, jobOptions } = useFetchJobs();
  const { fetchApplicants, loadingApplicants, candidateOptions } = useFetchApplicants();
  const [applicants, setApplicants] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [jobsLoading, setJobsLoading] = useState(false);

  const [sharingLinks, setSharingLinks] = useState(false);
  // const [loadingApplicants, setApplicantsLoading] = useState(false);
  const { orgServices, authTokens, userDetails } = useContext(AuthContext);
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

  const defaultContextMenu = [
    {
      label: "View",
      action: function (e, cell) {
        const candidateId = cell.getRow().getData()?.candidate.id || null;
        if (candidateId) handleViewScreening(candidateId);
      },
    },
    // {
    //   label: "Delete Screening",
    //   action: function (e, cell) {
    //     let id = cell.getRow().getData()?.id || null;
    //     if (id) handleDeleteScreening(id)
    //     // handleEditJob(job.id);
    //   },
    // },
    {
      label: "Copy Screening Url",
      action: function (e, cell) {
        let screeningLink = cell.getRow().getData()?.screening_link || null;
        if (screeningLink) handleCopyToClipboard(screeningLink)
        // handleShareJob(job, userDetails);
      },
    },
  ];

  const [columns, setColumns] = useState([
    {
      title: 'Candidate', field: 'candidate', hozAlign: "left", minWidth: 120,
      titleFormatter: function (cell, formatterParams, onRendered) {
        //console.log(cell)
        return '<div class="column-container">' +
          `<label class="column-title">${cell.getValue()}</label>` +
          '</div>';
      },
      formatter: function (cell) {
        //console.log(cell.getRow().getData())
        return cell.getRow().getData().candidate?.name
      },
      // headerPopup: headerPopupFormatter, 
      cellClick: function (e, cell) {
        const id = cell.getData().candidate.id;

        navigate(`/app/user/applicants/applicant/${id}/profile/automated-video-interview/${serviceId}/`)
        //console.log(id)
      },
      // headerPopupIcon: `<i class='fa-solid fa-filter column-filter-icon' title='Filter'></i>`, 
      headerFilter: false, headerFilterFunc: "like", headerSort: false,
    },
    {
      title: 'Screening Link',
      field: 'screening_link',
      hozAlign: "left",
      minWidth: 120,
      maxWidth: 160,

      titleFormatter: function (cell, formatterParams, onRendered) {
        return '<div class="column-container">' +
          `<label class="column-title">${cell.getValue()}</label>` +
          '</div>';
      },

      formatter: function (cell) {
        // This will display the candidate's name as cell content
        // return cell.getRow().getData().screening_link;
        // return `<i class="fa fa-clipboard" title="Copy link to clipboard"></i>`;
        return `<i class="fa-regular fa-clipboard"></i>`;
      },

      // Add the cell click functionality to copy URL to clipboard
      cellClick: function (e, cell) {
        // Get the screening link URL from the cell’s data
        const screeningLink = cell.getValue();
        // Copy URL to clipboard
        if (screeningLink) {
          handleCopyToClipboard(screeningLink)
        } else {
          alert("No link available to copy.");
        }
      },

      headerFilter: false,
      headerFilterFunc: "like",
      headerSort: false,
    },
    {
      title: 'Questions',
      field: 'questions',
      hozAlign: "left",
      minWidth: 120,
      maxWidth: 180,

      titleFormatter: function (cell, formatterParams, onRendered) {
        return '<div class="column-container">' +
          `<label class="column-title">${cell.getValue()}</label>` +
          '</div>';
      },

      formatter: function (cell) {
        const totalQuestions = cell.getRow().getData().questions.length;
        //console.log(totalQuestions)
        return totalQuestions === 0 ? "No questions" : (totalQuestions === 1 ? totalQuestions + " Question" : totalQuestions + " Questions")
      },
      headerFilter: false,
      headerFilterFunc: "like",
      headerSort: false,
    },
    {
      title: 'Job Name',
      field: 'questions',
      hozAlign: "left",
      minWidth: 120,

      titleFormatter: function (cell, formatterParams, onRendered) {
        return '<div class="column-container">' +
          `<label class="column-title">${cell.getValue()}</label>` +
          '</div>';
      },

      formatter: function (cell) {
        const jobTitle = cell.getRow().getData().job?.title || null;
        if (!jobTitle) {
          return (
            <div class="h-full flex items-center text-gray-400 italic">
              No Job linked
            </div>
          );
        }
        const badgeClass = "font-sans  bg-white ring-gray-400/60";
        // Map over the skills array and return a badge for each skill
        if (jobTitle) {
          return (`<div><span class="inline-flex items-center justify-center gap-2 rounded-md px-2 py-1 mr-2 mb-1  text-xs font-medium ring-1 ring-inset font-sans  bg-white ring-gray-400/60"><i class="fa-solid fa-briefcase"></i>${jobTitle}</span></div>`);
        }
        // return jobTitle
      },
      headerFilter: false,
      headerFilterFunc: "like",
      headerSort: false,
    },
    {
      title: 'Status',
      field: 'status_text',
      hozAlign: "left",
      minWidth: 120,

      titleFormatter: function (cell, formatterParams, onRendered) {
        return '<div class="column-container">' +
          `<label class="column-title">${cell.getValue()}</label>` +
          '</div>';
      },

      formatter: function (cell) {
        const status = cell.getRow().getData().status_text || null; // If no status, set to null
        let iconClass = "fa-regular fa-paper-plane";
        if (!status) {
          return (
            `<div class="h-full flex items-center text-gray-400 italic"> No Data </div>`
          );
        }
        const badgeClass = "font-sans bg-white ring-gray-400/60";
        if (status === "Assigned") {
          iconClass = "fa-regular fa-paper-plane ";
        } else if (status === "Link Opened") {
          iconClass = "fa-regular fa-envelope-open text-orange-600";
        } else if (status === "Started") {
          iconClass = "fa-solid fa-spinner text-yellow-700";
        } else if (status === "Completed") {
          iconClass = "fa-regular fa-circle-check text-green-600";
        } else if (status === "Approved") {
          iconClass = "fa-regular fa-thumbs-up text-blue-600";
        } else if (status === "Revoked") {
          iconClass = "fa-solid fa-ban text-red-600";
        }
        // Map over the skills array and return a badge for each skill
        if (status) {
          return (`
                <div>
                  <span
                    class="inline-flex items-center justify-center gap-2 rounded-md px-2 py-1 mr-2 mb-1 w-32 text-xs font-medium ring-1 ring-inset ${badgeClass}"
                  >
                    <span class="w-5/6 flex items-center">
                      <i class="${iconClass} w-5" aria-hidden="true"></i>
                      ${status}
                    </span>
                  </span>
                </div>
              `);
        }
      },
      headerFilter: false,
      headerFilterFunc: "like",
      headerSort: false,
    },
    {
      title: 'Assigned By',
      field: 'assigned_by',
      hozAlign: "left",
      minWidth: 120,

      titleFormatter: function (cell, formatterParams, onRendered) {
        return '<div class="column-container">' +
          `<label class="column-title">${cell.getValue()}</label>` +
          '</div>';
      },

      formatter: function (cell) {
        const assignedBy = cell.getRow().getData().assigned_by || undefined
        if (assignedBy !== undefined && assignedBy?.name) {
          // navigate(`/app/user/jobs/job/${jobId}/overview`)
          return (`
            <div class="flex items-center h-full">
              <img
                title=${assignedBy?.name}
                class="inline-block h-8 w-8 rounded-full ring-1 ring-gray-600/20"
                src=${assignedBy?.profile_pic}
              />
              <label class="ml-2">${assignedBy?.name}</label>
            </div>
          `);
        } else {
          return "Data not available";
        }
      },
      headerFilter: false,
      headerFilterFunc: "like",
      headerSort: false,
    },
    {
      title: 'Assigned On',
      field: 'assigned_at',
      hozAlign: "left",
      minWidth: 120,

      titleFormatter: function (cell, formatterParams, onRendered) {
        return '<div class="column-container">' +
          `<label class="column-title">${cell.getValue()}</label>` +
          '</div>';
      },

      formatter: function (cell) {
        const date = cell.getRow().getData()?.assigned_at ? new Date(cell.getRow().getData()?.assigned_at) : null;
        return date
          ? date.toLocaleString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            // second: '2-digit',
          })
          : "Date not available";
      },
      headerFilter: false,
      headerFilterFunc: "like",
      headerSort: false,
    },
    {
      title: 'Expires On',
      field: 'expired_at',
      hozAlign: "left",
      minWidth: 120,

      titleFormatter: function (cell, formatterParams, onRendered) {
        return '<div class="column-container">' +
          `<label class="column-title">${cell.getValue()}</label>` +
          '</div>';
      },

      formatter: function (cell) {
        const date = cell.getRow().getData()?.expired_at ? new Date(cell.getRow().getData()?.expired_at) : null;
        return date
          ? date.toLocaleString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            // second: '2-digit',
          })
          : "Date not available";
      },
      headerFilter: false,
      headerFilterFunc: "like",
      headerSort: false,
    },
    {
      title: 'Action', minWidth: 100, maxWidth: 100, field: 'Action', headerSort: false, clickMenu: defaultContextMenu, formatter: customMenuFormatter, frozen: true,
      titleFormatter: function (cell, formatterParams, onRendered) {
        return '<div class="column-container">' +
          `<label class="column-title">${cell.getValue()}</label>` +
          '</div>'
      },
      // headerPopupIcon: `<i class='' title='Filter'></i>`, 
      headerFilter: false, headerFilterFunc: "like", headerSort: false,
    },
  ]);

  const answerTypes = [
    { label: "Video", value: "video" },
  ];

  const [selectedAnswerType, setSelectedAnswerType] = useState(answerTypes[0]);

  const debounceTimeout = useRef(null);

  const [formSteps, setFormSteps] = useState([
    {
      id: 1,
      label: "Select Candidates",
      description: "Select candidates by job to assign video interviews",
      completed: false,
    },
    {
      id: 2,
      label: "Select Questions",
      description: "Select custom questions created by your team for this screening",
      completed: false,
    },
    {
      id: 3,
      label: "Configurations",
      description: "Additional configurations",
      completed: false,
    },
  ]);

  const [currentStep, setCurrentStep] = useState(formSteps[0]);

 
  const [totalCount, setTotalCount] = useState(0);
  const fieldMapping = {};

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

  useEffect(() => {
    if (currentStep?.id === 2) {
      fetchQuestionSet()
    }
  }, [currentStep])

  const openTestModal = async () => {
    setShowModal(true);
    fetchJobs();
    // fetchApplicants();
    // fetchQuestionSet();
  };

  const handleViewScreening = (applicantId) => {
    navigate(`/app/user/applicants/applicant/${applicantId}/profile/automated-video-interview/${serviceId}/`);
  };

  const handleDeleteScreening = async (screeningId) => {
    try {
      const response = await fetch(
        `${api}/personality-screening/personality-screenings/delete-multiple/`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + String(authTokens.access),
          },
          body: JSON.stringify({ 'ids': screeningId }),
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

  function customMenuFormatter(cell, formatterParams, onRendered) {
    // Assuming job is a property of the row data
    var job = cell.getRow().getData().job;

    return `<i class='fa-solid fa-ellipsis-vertical text-slate-500'></i> `;
  };

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



  // const fetchJobs = async () => {
  //   setJobsLoading(true);

  //   try {
  //     const response = await fetch(`${api}/jobs/job-names-list/`, {
  //       method: "GET",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: "Bearer " + String(authTokens.access),
  //       },
  //     });
  //     if (!response.ok) {
  //       throw new Error("Network response was not ok");
  //     }
  //     const data = await response.json();
  //     if (data.results.length) {
  //       const formattedOptions = data.results.map((item) => ({
  //         label: item.title,
  //         value: item.id,
  //       }));
  //       setJobs(formattedOptions);
  //     }

  //     setJobsLoading(false);
  //   } catch (error) {
  //     setError(error);
  //     setJobsLoading(false);
  //   }
  // };

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
          data.results
            .map((item) => ({
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

  const handleClose = () => {
    setCurrentStep(formSteps[0])
    setSelectedJob(null)
    setSelectedApplicant(null)
    setSelectedQuestionSet(null)
    setSelectedQuestions([])
    setSelectedQuestionsIds([])
    setExpiredAt(null)
    setShowModal(false);

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


  const sendScreeningLink = async () => {

    const ids = selectedQuestions?.map((question) => question.value);
    const applicantIds = selectedApplicant?.map((applicant) => applicant.value);
    // console.log("job :", selectedJob.value);
    // console.log("Candidate :", applicantIds);
    // console.log("question set :", selectedQuestionSet.value);
    // console.log("questions :", selectedQuestions, ids);
    // console.log("expired at :", new Date(expiredAt));

    if (applicantIds?.length) {
      setSharingLinks(true)
      const formattedData = {
        job: selectedJob.value || null,
        candidates: applicantIds || null,
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
        setCurrentStep(formSteps[0])
        setSelectedJob(null)
        setSelectedApplicant(null)
        setSelectedQuestions([])
        setSelectedQuestionSet(null)
        setExpiredAt(null)
        setShowModal(false)
        setSharingLinks(false)
        
      } catch (error) {
        console.error(error);
        setError(error);
        setSharingLinks(false)
      }
    }
  };

  const debounce = (func, delay) => {
    return (...args) => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
      debounceTimeout.current = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  const debouncedFetchCandidates = debounce(fetchApplicants, 300); // Adjust the delay as needed (e.g., 500ms)

  const handleInputChange = (newValue, actionMeta) => {
    if (actionMeta?.action === "input-change") {
      debouncedFetchCandidates(newValue, selectedJob.value); // Use the debounced function
    }
  };

  const handleTypeChange = (selectedOption) => {
    setSelectedAnswerType(selectedOption);
  };

  return (
    <>
      <div id="testList" className="w-full h-full p-3 job-list">
        {/* Header Section  */}
        <div className="md:flex items-center justify-between mt-2 md:mt-0 lg:px-4 px-2 py-2 mb-4 border-b ">
          <div className="flex justify-between mb-2 md:mb-0">
            <h2 className="text-xl font-semibold md:mb-0 mb-2">
            Assigned Automated Video Interviews
            </h2>
            {/* <p className='text-xs text-gray-500'>Create job openings </p> */}
            <span className="sm:hidden">
              <button
                onClick={() => openTestModal()}
                type="button"
                className="add-job-btn inline-flex truncate justify-center items-center rounded-md bg-primary-600 px-3 py-2 font-medium text-sm text-white shadow-sm hover:bg-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
              >
                {/* <CheckIcon className="-ml-0.5 mr-1.5 h-2 w-2" aria-hidden="true" /> */}
                Assign Automated Video Interview
              </button>
            </span>
          </div>

          <div className="flex space-x-2 justify-between">
            {/* <div className=" text-gray-600 border rounded-md flex w-full">
              <input
                type="search"
                name="search"
                placeholder="Search by title"
                // onChange={(e) => handleSearch('title', e.target.value)}
                className="bg-white border-0 w-full md:w-56 h-8 px-2 md:px-5 text-sm focus:outline-none me-2"
              />
              <button className="text-center mr-3 bg-white">
                <i className="fa-solid fa-magnifying-glass"></i>
              </button>
            </div> */}
            {/* <SortDropdown handleAscSort={handleAscSort} handleDescSort={handleDescSort} dropdownIcon={'fa-arrow-up-wide-short'} dropdownItems={[{ label: 'Job Title', value: 'title' }, { label: 'Close Date', value: 'close_date' }, { label: 'Published', value: 'published' }]} /> */}
            <span className="hidden sm:flex">
              <button
                onClick={() => openTestModal()}
                type="button"
                className="add-job-btn inline-flex truncate justify-center items-center rounded-md bg-primary-600 px-3 py-2  font-medium text-sm text-white shadow-sm hover:bg-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
              >
                {/* <CheckIcon className="-ml-0.5 mr-1.5 h-2 w-2" aria-hidden="true" /> */}
                Assign Automated Video Interview
              </button>
            </span>
          </div>
        </div>

        <div
          className="overflow-auto rounded-xl"
          style={{ height: "calc(100dvh - 150px)" }}
        >
          <Table url={`/personality-screening/personality-screenings/`} setTableInstance={setTableInstance} columns={columns} data={applicants} fieldMapping={fieldMapping} setTableRowCount={setTableRowCount} />

       
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
                className="relative flex flex-col h-[90%] justify-between rounded-lg bg-white text-left shadow-xl transition-all my-8"
              >
                {/* Header  */}
                <div className="border-b rounded-t-lg bg-gray-50 flex justify-between py-2 px-3">
                  <h3
                    className="text-base p-4 font-semibold leading-6 text-gray-900"
                    id="modal-title"
                  >
                    Assign Automated Video Interview
                  </h3>
                  <button onClick={() => handleClose()}>
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                {/* Body  */}

                <div className="bg-white h-full w-full flex  relative">
                  <div className="bg-gray-50 w-[250px] h-full flex flex-col border-r py-5 ">
                    <label className="px-4 pb-3 mb-2 font-semibold border-b">Steps</label>
                    {formSteps.map((step) => (
                      <div
                        className={`p-4 border-b w-full ${currentStep.id === step.id && "bg-sky-100"
                          }`}
                      >
                        <label className="text-base font-medium text-sky-600">
                          {step.label}
                        </label>
                        <p className="text-sm text-gray-500">
                          {step.description}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="flex-grow h-full p-5 overflow-auto">
                    {currentStep.id === 1 && (
                      <div class="p-4 md:p-5 mb-4">
                        <form
                          id="create-test-form"
                          class="space-y-4"
                          onSubmit={sendScreeningLink}
                        >
                          <div>
                            <label
                              htmlFor="valid-to"
                              class="block mb-2  font-medium text-gray-900 "
                            >
                              <span>Job<span className="text-red-600">*</span></span>
                              <p className="text-sm text-gray-400 font-light">
                                Select the job that the candidate is
                                being screened for
                              </p>
                            </label>

                            <ReactSelect
                              className=" md:w-1/2 min-w-fit"
                              placeholder="Select a job.."
                              isLoading={loadingJobs}
                              value={selectedJob}
                              onChange={(selectedOption) => {
                                if (selectedOption) {
                                  debouncedFetchCandidates(
                                    null,
                                    selectedOption.value
                                  );
                                  setSelectedJob(selectedOption);
                                }
                              }}
                              options={jobOptions}
                              styles={selectStyle}
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="valid-to"
                              class="block mb-2  font-medium text-gray-900 "
                            >
                              Candidate<span className="text-red-600">*</span>
                            </label>

                            <ReactSelect
                              className=" md:w-1/2 min-w-fit"
                              placeholder="Select candidate to share"
                              isMulti
                              styles={selectStyle}
                              isDisabled={!selectedJob}
                              isLoading={loadingApplicants}
                              value={selectedApplicant}
                              onChange={(selectedOption) =>
                                setSelectedApplicant(selectedOption)
                              }
                              options={candidateOptions}
                              onInputChange={(value, actionMeta) =>
                                handleInputChange(value, actionMeta)
                              }
                            />
                          </div>
                        </form>
                      </div>
                    )}
                    {currentStep.id === 2 && (
                      <div className="bg-white h-full px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                        <div class="p-4 md:p-5 mb-4">
                          <form
                            id="create-test-form"
                            class="space-y-4"
                          // onSubmit={sendScreeningLink}
                          >
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
                                  <button
                                    onClick={() => removeQuestion(question.id)}
                                  >
                                    <XMarkIcon className="w-5 h-5 text-red-400 hover:text-red-600" />
                                  </button>
                                </li>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {currentStep.id === 3 && (
                      <div className="bg-white h-auto px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                        <div class="p-4 md:p-5 mb-4">
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
                              {/* <label className="">UTC</label> */}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer  */}
                <div className="bg-gray-50 w-full rounded-b-lg ms-auto px-4 py-3 flex justify-end sm:px-6 space-x-3">
                  {currentStep.id === 1 && (
                    <>
                      <button
                        disabled={!selectedApplicant || !selectedApplicant?.length}
                        onClick={() => setCurrentStep(formSteps[1])}
                        className="h-10  justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 disabled:bg-sky-300/80 disabled:cursor-not-allowed sm:ml-3 sm:w-auto"
                      >
                        Next
                      </button>
                    </>
                  )}
                  {currentStep.id === 2 && (
                    <>
                      <button
                        disabled={!selectedQuestions.length}
                        onClick={() => setCurrentStep(formSteps[2])}
                        className="h-10  justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 disabled:bg-sky-300/80 disabled:cursor-not-allowed sm:ml-3 sm:w-auto"
                      >
                        Next
                      </button>
                      <button
                        onClick={() => setCurrentStep(formSteps[0])}
                        className="h-10  justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold  text-gray-700 ring-2 ring-gray-500 shadow-sm hover:bg-gray-50 sm:ml-3 sm:w-auto"
                      >
                        Back
                      </button>
                    </>
                  )}
                  {currentStep.id === 3 && (
                    <>
                      <button
                        disabled={sharingLinks}
                        onClick={sendScreeningLink}
                        className="h-10  justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 sm:ml-3 sm:w-auto"
                      >
                        {sharingLinks ? "Sending Link" : "Send Automated Video Interview Link"}
                      </button>
                      <button
                        onClick={() => setCurrentStep(formSteps[1])}
                        className="h-10  justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold  text-gray-700 ring-2 ring-gray-500 shadow-sm hover:bg-gray-50 sm:ml-3 sm:w-auto"
                      >
                        Back
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <ToastContainer />
    </>
  );
};

export default List;