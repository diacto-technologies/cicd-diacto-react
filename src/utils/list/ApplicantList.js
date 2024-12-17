import { Link, useNavigate } from "react-router-dom";
import "./ItemList.css";
import { useEffect, useRef, useState,  } from "react";

import Header from "../modals/Header";
import { useAssignAssessment, useFetchPreBuiltAssessments, useFetchUserOwnedAssessments } from "../../constants/test/constants";
import { toast } from "react-toastify";
import Switch2 from "../swtiches/Switch2";
import Table from "../../utils/tables/Table";
import DefaultUserImage from "../../assets/default_avatar.png"

const ApplicantList = ({
  updateStatus,
  url,
  jobId,
  applicants,
  setApplicants,
  checked,
  userDetails,
  handleShortList,
  handleUnshortList,
  tableInstance,
  setTableInstance,
  setTableRowCount
}) => {


  const [currentSelectedRow, setCurrentSelectedRow] = useState(null)
  const [currentSelectedRowData, setCurrentSelectedRowData] = useState(null)

  const [cellContextMenu, setCellContextMenu] = useState([
    {
      label: "Shortlist",
      action: function (e, cell) {
        let rowData = cell.getRow().getData();
        // console.log(rowData)
        setParams(rowData);
        setShowModal(true);
        let resume = rowData?.resumes[0];
        const shortlisted = resume && resume.approved_by && resume.is_approved  ? true : false;
        setStatus("shortlist");

        if (!shortlisted) {
          
          setCurrentSelectedRow(cell.getRow());
          setCurrentSelectedRowData(cell.getRow().getData());
          // updateStatus("Shortlisted", rowData, resume);
        }
        else {
          // console.log("Already shortlisted")
        }
      }
    },
    {
      label: "Not Shortlist",
      action: function (e, cell) {
        let rowData = cell.getRow().getData();
        setParams(rowData);
        setStatus("reject");
        setCurrentSelectedRow(cell.getRow());
        setCurrentSelectedRowData(cell.getRow().getData());

        setShowModal(true);
      }
    },
    {
      label: "Under Review",
      action: function (e, cell) {
        let rowData = cell.getRow().getData();
        updateStatus("Under Review", rowData, cell.getRow()); // Call the function when the link is clicked
        // removeMenu();
      }
    },
    {
      label: "On Hold",
      action: function (e, cell) {
        let rowData = cell.getRow().getData();
        updateStatus("On Hold", rowData, cell.getRow());
      }
    },
    {
      label: "Assign Test",
      action: function (e, cell) {
        let rowData = cell.getRow().getData();
        let resume = rowData?.resumes[0];
        const shortlisted = resume && resume.is_approved ? true : false;

        if (shortlisted) {
          setParams(params);
          setShowAssignTestModal(true);
          fetchPreBuiltAssessments()
          fetchAssessments()
          // updateStatus("Shortlisted", params);
        } else {
          toast.info("Please shortlist the candidate to assign a test", {
            className: "text-sm",
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "colored",
          });
        }
        // Call the function when the link is clicked
        // removeMenu();
      }
    },
    {
      label: "View Profile",
      action: function (e, cell) {
        let candidate = cell.getRow().getData();
        // console.log(candidate)
        // handleEditJob(job.id)
        navigate(`/app/user/applicants/applicant/${candidate.id}/profile/overview/`);
      }
    },
  ]);

  // useEffect(() => {
  //   // Define the default context menu options
  //   const defaultContextMenu = [
  //     {
  //       label: "Shortlist",
  //       action: function (e, cell) {
  //         let candidate = cell.getRow().getData();
  //         // handleViewJob(job.id)
  //       }
  //     },
  //     {
  //       label: "View Profile",
  //       action: function (e, cell) {
  //         let candidate = cell.getRow().getData();
  //         // handleEditJob(job.id)
  //       }
  //     },
  //     {
  //       label: "Scores",
  //       action: function (e, cell) {
  //         let candidate = cell.getRow().getData();
  //         // handleShareJob(job)
  //       }
  //     },

  //   ];

  //   // Check the user's role and modify the context menu options accordingly
  //   if (userDetails) {
  //     if (userDetails.role === "Participant") {
  //       // Remove options that are not applicable to Participants
  //       setCellContextMenu(defaultContextMenu.filter(option => option.label === "View Profile" || option.label === "Scores"));
  //     } else if (userDetails.role === "Editor") {
  //       // Remove options that are not applicable to Editors
  //       setCellContextMenu(defaultContextMenu);
  //     } else if (userDetails.role === "Admin") {
  //       // Admin has access to all options, so no changes needed
  //       setCellContextMenu(defaultContextMenu);
  //     }
  //   }
  // }, [userDetails]);

  const defaultEmailTemplates = {
    shortlist: {
      subject: `Congratulations! You've Been Shortlisted for {job_name}`,
      header: `<br/>Dear {candidate_name}<br/><br/>`,
      body: `We are excited to inform you that your application for the {job_name} position at {your organization name} has been shortlisted.<br/>
        The next step in the process will be communicated to you shortly. Please keep an eye on your inbox for further instructions. `,
      footer: `We appreciate your interest in this position and thank you for your patience during this process.<br/> If you have any questions or encounter any issues, please contact us at <a href="mailto:support@candidhr.ai" style="color: #0088cc; text-decoration: none;">support@candidhr.ai</a>.
      <br/><br/> 
      Best regards,<br/>
       The {your organization name} Recruitment Team`
    },
    reject: {
      subject: `Update on Your Application for the {job_name} Position`,
      header: `<br/>Dear {candidate_name}<br/><br/>`,
      body: `Thank you for your interest in the {job_name} position at {company_name} and for the time you dedicated to your application. After careful consideration, we regret to inform you that we have chosen to move forward with other candidates at this time.
        <br>
        We truly appreciate the effort you put into your application and encourage you to stay connected for future opportunities that may be a better fit for your skills and experience.`,
      footer: `We appreciate your interest in this position and thank you for your patience during this process.<br/> If you have any questions or encounter any issues, please do not hesitate to contact us at <a href="mailto:support@candidhr.ai" style="color: #0088cc; text-decoration: none;">support@candidhr.ai</a>.
      <br/><br/> 
      Best regards,<br/>
       The {your organization name} Recruitment Team`
    }
  }

 

  const [columns, setColumns] = useState([
    {
      title: 'Name', field: 'name', hozAlign: "left", minWidth: 120,
      titleFormatter: function (cell, formatterParams, onRendered) {
        return '<div class="column-container">' +
          `<label class="column-title">${cell.getValue()}</label>` +
          '</div>';
      },
      formatter: linkFormatter,
      // headerPopup: headerPopupFormatter, 
      cellClick: function (e, cell) {
        const id = cell.getData().id;

        navigate(`/app/user/applicants/applicant/${id}/profile/overview/`)
        // console.log(id)
      },
      // headerPopupIcon: `<i class='fa-solid fa-filter column-filter-icon' title='Filter'></i>`, 
      headerFilter: true, headerFilterFunc: "like",
      headerFilterParams: {
        elementAttributes: {
          class: "w-full rounded-lg border border-gray-300 p-2 my-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500", // Tailwind classes for styling
          placeholder: "", // Add a placeholder
        },
      },
    },
    {
      title: 'Resume Score', field: 'score', hozAlign: "center",vertAlign:"middle", minWidth: 120, headerSort: true,
      titleFormatter: function (cell, formatterParams, onRendered) {
        return '<div class="column-container">' +
          `<label class="column-title">${cell.getValue()}</label>` +
          '</div>';
      },
      // headerPopup: headerPopupFormatter,
      formatter: scoreFormatter,
      // headerPopupIcon: `<i class='fa-solid fa-filter column-filter-icon' title='Filter'></i>`, 
      headerFilter: true, headerFilterFunc: "in",
      headerFilterParams: {
        elementAttributes: {
          class: "w-full rounded-lg border border-gray-300 p-2 my-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500", // Tailwind classes for styling
          placeholder: "", // Add a placeholder
        },
      },
    },
    {
      title: 'Email', field: 'email', hozAlign: "left", sorter: "string", minWidth: 120, headerSort: false,
      titleFormatter: function (cell, formatterParams, onRendered) {
        return '<div class="column-container">' +
          `<label class="column-title">${cell.getValue()}</label>` +
          '</div>';
      },
      cellClick: function (e, cell) {
        const toEmail = cell.getValue();
        openOutlook(toEmail)
        // console.log(toEmail)
      },
      //  headerPopup: headerPopupFormatter,
      formatter: emailFormatter,
      //  headerPopupIcon: `<i class='fa-solid fa-filter column-filter-icon' title='Filter'></i>`, 
      headerFilter: true, headerFilterFunc: "like",
      headerFilterParams: {
        elementAttributes: {
          class: "w-full rounded-lg border border-gray-300 p-2 my-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500", // Tailwind classes for styling
          placeholder: "", // Add a placeholder
        },
      },
    },
    {
      title: 'Contact', field: 'contact', hozAlign: "left", sorter: "string", headerSort: false, minWidth: 120, headerSort: false,
      titleFormatter: function (cell, formatterParams, onRendered) {
        return '<div class="column-container">' +
          `<label class="column-title">${cell.getValue()}</label>` +
          '</div>';
      },
      // headerPopup: headerPopupFormatter, 
      // headerPopupIcon: `<i class='fa-solid fa-filter column-filter-icon' title='Filter'></i>`, 
      headerFilter: true, headerFilterFunc: "like",
      headerFilterParams: {
        elementAttributes: {
          class: "w-full rounded-lg border border-gray-300 p-2 my-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500", // Tailwind classes for styling
          placeholder: "", // Add a placeholder
        },
      },
    },
    {
      title: 'City', field: 'city', hozAlign: "left", minWidth: 120,
      sorter: locationSorter,
      titleFormatter: function (cell, formatterParams, onRendered) {
        return '<div class="column-container">' +
          `<label class="column-title">${cell.getValue()}</label>` +
          '</div>';
      },
      // headerPopup: headerPopupFormatter,
      formatter: cityFormatter,
      // headerPopupIcon: `<i class='fa-solid fa-filter column-filter-icon' title='Filter'></i>`, 
      headerFilter: true, headerFilterFunc: "like",
      headerFilterParams: {
        elementAttributes: {
          class: "w-full rounded-lg border border-gray-300 p-2 my-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500", // Tailwind classes for styling
          placeholder: "Filter by City", // Add a placeholder
        },
      },
    },
    {
      title: 'State', field: 'state', hozAlign: "left", minWidth: 120,
      sorter: locationSorter,
      titleFormatter: function (cell, formatterParams, onRendered) {
        return '<div class="column-container">' +
          `<label class="column-title">${cell.getValue()}</label>` +
          '</div>';
      },
      // headerPopup: headerPopupFormatter,
      formatter: stateFormatter,
      // headerPopupIcon: `<i class='fa-solid fa-filter column-filter-icon' title='Filter'></i>`, 
      headerFilter: true, headerFilterFunc: "like",
      headerFilterParams: {
        elementAttributes: {
          class: "w-full rounded-lg border border-gray-300 p-2 my-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500", // Tailwind classes for styling
          placeholder: "Filter by State", // Add a placeholder
        },
      },
    },
    {
      title: 'Relevant Experience', field: 'resume.total_duration', hozAlign: "left", sorter: expSorter, minWidth: 120,
      titleFormatter: function (cell, formatterParams, onRendered) {
        return '<div class="column-container ">' +
          `<label class="column-title">${cell.getValue()}<span class="text-sm font-normal  text-gray-500 ms-1 text-center"> (months)</span></label>` +
          '</div>';
      },
      // headerPopup: headerPopupFormatter, 
      formatter: expFormatter,
      // headerPopupIcon: `<i class='fa-solid fa-filter column-filter-icon' title='Filter'></i>`, 
      headerFilter: true, headerFilterFunc: "in",
      headerFilterParams: {
        elementAttributes: {
          class: "w-full rounded-lg border border-gray-300 p-2 my-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500", // Tailwind classes for styling
          placeholder: "Filter by experience", // Add a placeholder
        },
      },
    },
    // {
    //   title: 'Top Skills', field: 'skills', hozAlign: "left", sorter: "array", headerSort: false, minWidth: 150,
    //   titleFormatter: function (cell, formatterParams, onRendered) {
    //     return '<div class="column-container">' +
    //       `<label class="column-title">${cell.getValue()}</label>` +
    //       '</div>';
    //   },
    //   // headerPopup: headerPopupFormatter, 
    //   formatter: skillsFormatter,
    //   // headerPopupIcon: `<i class='fa-solid fa-filter column-filter-icon' title='Filter'></i>`, 
    //   headerFilter: true, headerFilterFunc: "like"
    // },
    // {
    //   title: 'Stage', field: 'stage', hozAlign: "left", sorter: "array", headerSort: false, minWidth: 150,
    //   titleFormatter: function (cell, formatterParams, onRendered) {
    //     return '<div class="column-container">' +
    //       `<label class="column-title">${cell.getValue()}</label>` +
    //       '</div>';
    //   },
    //   // headerPopup: headerPopupFormatter, 
    //   formatter: skillsFormatter,
    //   // headerPopupIcon: `<i class='fa-solid fa-filter column-filter-icon' title='Filter'></i>`, 
    //   headerFilter: true, headerFilterFunc: "like"
    // },
    {
      title: 'Resume Status', field: 'resumes', hozAlign: "left", minWidth: 150, headerSort: false,
      titleFormatter: function (cell, formatterParams, onRendered) {
        // Create the dropdown element
        let dropdownHTML = `
        <div class="column-container ">
            <label class="column-title">${cell.getColumn().getDefinition().title}</label>
            <select id="status-dropdown" class="status-dropdown border w-full p-1 rounded-md my-1">
                <option value="">All</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="On Hold">On Hold</option>
                <option value="Not Shortlisted">Not Shortlisted</option>
                <option value="Under Review">Under Review</option>
                <option value="Failed to Process">Failed to Process</option>
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
                cell.getTable().setFilter("resumes", "!=", selectedValue);
              } else {
                cell.getTable().clearFilter("resumes"); // Clear the filter if no selection
              }
            });
          }
        });

        return dropdownHTML;
      },
      // headerPopup: headerPopupFormatter, 
      formatter: statusFormatter,

      // headerPopupIcon: `<i class='fa-solid fa-filter column-filter-icon' title='Filter'></i>`, 
      headerFilter: false, headerFilterFunc: "like"
    },
    {
      title: 'Applied On', field: 'created_at', hozAlign: "left", minWidth: 120,
      // titleFormatter: function (cell, formatterParams, onRendered) {
      //     return '<div class="column-container">' +
      //         `<label class="column-title">${cell.getValue()}</label>` +
      //         '</div>';
      // }, 
      titleFormatter: function (cell, formatterParams, onRendered) {
        // Create the date picker HTML element
        let datePickerHTML = `
                <div class="column-container">
                    <label class="column-title">${cell.getColumn().getDefinition().title}</label>
                    <input type="date" id="date-picker" class="date-picker border w-full p-1 rounded-md my-1" style="width: -webkit-fill-available;">
                </div>
            `;

        // Attach event listener to the date picker after rendering
        onRendered(() => {
          const datePicker = document.getElementById("date-picker");
          if (datePicker) {
            datePicker.addEventListener("change", (event) => {
              // const selectedDate = addTimeToDate(event.target.value);
              const selectedDate = event.target.value;

              // Trigger your custom action here
              // Example: Filter the table by the selected date
              if (selectedDate) {
                cell.getTable().setFilter("created_at", "in", selectedDate);
              } else {
                cell.getTable().clearFilter("created_at"); // Clear the filter if no date is selected
              }
            });
          }
        });

        return datePickerHTML;
      }, // headerPopup: headerPopupFormatter, 
      formatter: createdAtFormatter,
      // headerPopupIcon: `<i class='fa-solid fa-filter column-filter-icon' title='Filter'></i>`, 
      headerFilter: emptyHeaderFilter,
      // headerFilterFunc: dateFilter
    },
    {
      title: 'Updated At', field: 'updated_at', hozAlign: "left", minWidth: 120,
      // titleFormatter: function (cell, formatterParams, onRendered) {
      //     return '<div class="column-container">' +
      //         `<label class="column-title">${cell.getValue()}</label>` +
      //         '</div>';
      // }, 
      titleFormatter: function (cell, formatterParams, onRendered) {
        // Create the date picker HTML element
        let datePickerHTML = `
                <div class="column-container">
                    <label class="column-title">${cell.getColumn().getDefinition().title}</label>
                    <input type="date" id="date-picker" class="date-picker border w-full p-1 rounded-md my-1" style="width: -webkit-fill-available;">
                </div>
            `;

        // Attach event listener to the date picker after rendering
        onRendered(() => {
          const datePicker = document.getElementById("date-picker");
          if (datePicker) {
            datePicker.addEventListener("change", (event) => {
              // const selectedDate = addTimeToDate(event.target.value);
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
      formatter: updatedAtFormatter,
      // headerPopupIcon: `<i class='fa-solid fa-filter column-filter-icon' title='Filter'></i>`, 
      headerFilter: emptyHeaderFilter,
      // headerFilterFunc: dateFilter
    },
    {
      title: 'Action', minWidth: 78, width: 78, maxWidth: 90, hozAlign: "center", headerSort: false, field: 'Action', frozen:true,
      clickMenu: cellContextMenu,
      // cellClick: openMenu,
      formatter: customMenuFormatter,
      titleFormatter: function (cell, formatterParams, onRendered) {
        return '<div class="column-container">' +
          `<label class="column-title">${cell.getValue()}</label>` +
          '</div>'
      },
      headerPopup: headerPopupFormatter, headerPopupIcon: `<i class='' title='Filter'></i>`, headerFilter: emptyHeaderFilter,
    },
    // Add more columns as needed
  ]);



  const fieldMapping = {
    name: "name", // Example: AG Grid field 'name' maps to backend 'name'
    score: "resumes__resume_score__overall_score", // Example: AG Grid field 'score' maps to 'resumes__overall_score'
    relevant_experience_in_months: "resumes__relevant_experience_in_months",
    'resume.total_duration': "resumes__relevant_experience_in_months",
    "city": "candidate_city",
    "state": "candidate_state",
    "created_at": "latest_resume_created_at",
    "resumes": "resumes__status_text"
    // Add more mappings as needed...
  };

  const debounceTimeout1 = useRef(null);
  const [selectedAssessments, setSelectedAssessments] = useState([]);
  const [selectedAssessmentType, setSelectedAssessmentType] = useState("prebuilt-assessment");
  const [showModal, setShowModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [params, setParams] = useState(null);
  const [status, setStatus] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [notifyCandidate, setNotifyCandidate] = useState(false);
  const [showAssignTestModal, setShowAssignTestModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();
  const { fetchPreBuiltAssessments, preBuiltAssessments, loadingPreBuiltAssessments } = useFetchPreBuiltAssessments()
  const { fetchAssessments, assessments, loadingAssessments } = useFetchUserOwnedAssessments()
  const { assignAssessment, assigningAssessment } = useAssignAssessment()
  const [sendingEmail, setSendingEmail] = useState(false)
  const [validTo, setValidTo] = useState(null)
  const [TestSelected, setTestSelected] = useState([]);
  const [prebuiltAssessmentSelected, setPrebuiltAssessmentSelected] = useState([]);
  

  const handleTemplateChange = (event) => {
    setSelectedTemplate(event.target.value);
    setErrorMessage("");
  };

  function handleClose() {
    setStatus("")
    setShowModal(false);
    setSelectedTemplate("");
    setErrorMessage("");
    setBody("");
    setSubject("");
    setNotifyCandidate(false);
    setSelectedAssessments([])
    setValidTo(null)
    setCurrentStep(1)
    setShowAssignTestModal(false);
    setTestSelected([]);
    setPrebuiltAssessmentSelected([]);
    setValidTo(null);
  }

  const debounce = (func, delay) => {
    return (...args) => {
      if (debounceTimeout1.current) {
        clearTimeout(debounceTimeout1.current);
      }
      debounceTimeout1.current = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  const debouncedFetchAssessments = debounce(fetchAssessments,500)
  const debouncedFetchPrebuiltAssessments = debounce(fetchPreBuiltAssessments,500)

  const handleSearch = (title,assessmentType) => {
    
    if (assessmentType === "user-owned-assessment") {
      debouncedFetchAssessments(title); // Use the debounced function
    }
    if (assessmentType === "prebuilt-assessment") {
      debouncedFetchPrebuiltAssessments(title); // Use the debounced function
    }
    
  
  };


  async function sendEmail() {
    if (notifyCandidate && !selectedTemplate) {
      setErrorMessage("Please select a template option.");
      return; // Stop the submission if no template is selected
    }
    setSendingEmail(true)
    updateStatus(
      status === "shortlist" ? "Shortlisted" : "Not Shortlisted",
      currentSelectedRowData,
      currentSelectedRow,
      body,
      subject,
      notifyCandidate
    )
      .then(() => {
        // if (status === "shortlist") {
        //   updateButtonState();
        // }
        // This will execute after updateStatus is completed
        setSendingEmail(false)
        handleClose();
      })
      .catch((error) => {
        console.error("Error updating status:", error);
        setSendingEmail(false)
        // Optionally, handle the error or keep the modal open
      });
    // }
  }

 

  function openOutlook(toEmail) {
    // Specify the email address and subject
    // const toEmail = 'recipient@example.com';
    const subject = "CandidHR : Your Subject";

    // Encode the email address and subject for the mailto URL
    const mailtoUrl = `mailto:${encodeURIComponent(
      toEmail
    )}?subject=${encodeURIComponent(subject)}`;

    // Open the default email client
    window.location.href = mailtoUrl;
  }

  function headerPopupFormatter(e, column, onRendered) {
    var container = document.createElement("div");
    container.classList.add("column-filter");
    // var label = document.createElement("label");
    // label.style.display = "block";
    // label.style.fontSize = ".7em";
    var input = document.createElement("input");
    input.value = column.getHeaderFilterValue() || "";
    if (column._column.definition.title === "Applied On") {
      input.type = "date";
    }
    input.placeholder = `Filter...`;
    input.addEventListener("keyup", (e) => {
      column.setHeaderFilterValue(input.value);
    });
    input.addEventListener("change", (e) => {
      column.setHeaderFilterValue(input.value);
    });

    //container.appendChild(label);
    container.appendChild(input);

    return container;
  }

  function createdAtFormatter(cell, formatterParams, onRendered) {
    // const { inputFormat, units, humanize, invalidPlaceholder } = formatterParams;
    const updated_at = cell.getRow().getData()?.resumes[0]?.created_at || null
    const value = updated_at ?  new Date(updated_at).toDateString() : "";
    return value;
  }

  function updatedAtFormatter(cell, formatterParams, onRendered) {
    // const { inputFormat, units, humanize, invalidPlaceholder } = formatterParams;
    const updated_at = cell.getRow().getData()?.resumes[0]?.updated_at || null
    const value = updated_at ?  new Date(updated_at).toDateString() : "";
    return value;
  }

  function linkFormatter(cell, formatterParams, onRendered) {
    const data = cell.getRow().getData(); // Fetch the row data
    const profilePic = data.profile_pic || DefaultUserImage; // Default placeholder
    const name = cell.getValue(); // Get the cell value (candidate name)

    return `
        <div class="flex items-center gap-3 w-full">
            <div class="w-8 min-w-8 h-8 rounded-full overflow-hidden border border-gray-300">
                <img src="${profilePic}" alt="${name}" class="object-cover w-full h-full" />
            </div>
            <span class="text-gray-800 font-medium">${name}</span>
            <i class="fa-solid fa-up-right-from-square text-blue-500"></i>
        </div>
    `;
}

  function emailFormatter(cell, formatterParams, onRendered) {
    <i class="fa-solid fa-up-right-from-square"></i>;
    return `<div class="">
                <span class="me-2">${cell.getValue()}</span>
                <i class="fa-regular fa-envelope text-blue-500"></i>
            </div>`;
  }

  function emptyHeaderFilter(cell, formatterParams, onRendered) {
    return document.createElement("div");
  }

  function cityFormatter(cell, formatterParams, onRendered) {
    // Get the location data
    let location = cell.getRow().getData().location;
    
    // Parse location if it's a JSON string
    if (typeof location === "string") {
        try {
            location = JSON.parse(location);
        } catch (error) {
            console.error("Invalid JSON format for location:", location);
            location = {}; // Fallback to an empty object if parsing fails
        }
    }

    // Return the city if available, or an empty string otherwise
    return `${location?.city || ""}`;
}
function stateFormatter(cell, formatterParams, onRendered) {
  // Get the location data
  let location = cell.getRow().getData().location;
  
  // Parse location if it's a JSON string
  if (typeof location === "string") {
      try {
          location = JSON.parse(location);
      } catch (error) {
          console.error("Invalid JSON format for location:", location);
          location = {}; // Fallback to an empty object if parsing fails
      }
  }

  // Return the state if available, or an empty string otherwise
  return `${location?.state || ""}`;
}

  function locationSorter(a, b, aRow, bRow, column, dir, sorterParams) {
    // Extract the location objects from the rows

    // Compare the locations based on city and state
    const locationComparison = a.city.localeCompare(b.city);
    if (locationComparison === 0) {
      return a.state.localeCompare(b.state);
    }
    return locationComparison;
  }

  function expFormatter(cell, formatterParams, onRendered) {
    // console.log("Inside expFormatter: ", cell.getRow().getData().resumes)
    const work_experience = cell.getRow().getData().resumes.length ? cell.getRow().getData().resumes[0].relevant_experience_in_months : ""; // Assuming 'services' is an array of service names
    return work_experience ? work_experience : 0; // Join services into a string separated by commas
  }

  function expSorter(a, b, aRow, bRow, column, dir, sorterParams) {
    const exp_A = aRow.getData().resumes[0]?.total_duration;
    const exp_B = bRow.getData().resumes[0]?.total_duration;
    return exp_A - exp_B;
  }

  function scoreFormatter(cell, formatterParams, onRendered) {
    const applicant = cell.getRow().getData();
    return `<label class="w-14 px-3 text-center font-semibold py-1 rounded-md bg-indigo-50 text-indigo-700">${ parseFloat(applicant.resumes[0]?.resume_score?.overall_score) || 0}</label>`;
  }

  function scoreSorter(a, b, aRow, bRow, column, dir, sorterParams) {
    const score_A = parseFloat(
      aRow.getData().resumes[0]?.resume_score?.overall_score || 0
    );
    const score_B = parseFloat(
      bRow.getData().resumes[0]?.resume_score?.overall_score || 0
    );
    return score_A - score_B;
  }

  function customMenuFormatter(cell, formatterParams, onRendered) {
    // Assuming job is a property of the row data
    var job = cell.getRow().getData().job;

    return `<i class='fa-solid fa-ellipsis-vertical text-slate-500'></i> `;
  }

  function skillsFormatter(cell, formatterParams, onRendered) {
    const icon =
      cell.getColumn()._column.field === "location"
        ? `<i class="fa-solid fa-map-pin me-2 text-sky-500"></i>`
        : null;
    const items = cell.getRow().getData()?.resumes[0]?.skills; // Assuming 'services' is an array of service names
    // console.log("items: ", items, cell.getColumn())
    const badgeClass = "bg-sky-50 text-sky-700 ring-sky-600/20";
    const wrapper = document.createElement("div");
    const limit = 3;
    for (let index = 0; index < items?.length; index++) {
      // Limit items
      if (index < limit) {
        let location = `<div class="me-2 inline-flex items-center rounded-md px-2 py-1 text-xs font-medium  ring-1 ring-inset ${badgeClass}">${items[index]["name"] ? items[index]["name"] : items[index]
          }</div>`;
        if (icon) {
          location = `<div class="me-2 inline-flex items-center rounded-md px-2 py-1 text-xs font-medium  ring-1 ring-inset ${badgeClass}">${icon} ${items[index]}</div>`;
        }
        wrapper.innerHTML += location;
      }
    }
    if (items?.length > limit) {
      const badge = `<div class="me-2 inline-flex items-center rounded-md px-2 py-1 text-xs font-medium  ring-1 ring-inset ${badgeClass}">+ ${items.length - limit
        }</div>`;
      wrapper.innerHTML += badge;
    }
    return wrapper; // Join services into a string separated by commas
  }

  function statusFormatter(cell) {
    const status_text = cell.getRow().getData()?.resumes[0]?.status_text; // If no skills, set to an empty array

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
    if (status_text === "Failed To Process") {
      badgeClass = "bg-red-500";
    }

    // Map over the skills array and return a badge for each skill
    return (
      `<div>
        <span
          class="inline-flex items-center gap-x-1 rounded-md px-2 py-1 mr-2 mb-1 text-xs font-medium ring-1 ring-inset"
        >
          <div class="w-2 h-2 rounded-full ${badgeClass}"></div>
          ${status_text}
        </span>
      </div>`
    );
  }

 

  const shortlistAndAssignTest = async () => {
    //  await updateStatus("Shortlisted", params,subject,body,notifyCandidate);
    // const formattedAssessments = selectedAssessments?.map(a => ({ id: a.id, type: a.type }))
    const updateObject = (array) => {
      return array?.map(item => {
        const { label, ...rest } = item; // Destructure to remove 'value' and 'label'
        return { ...rest }; // Add 'id' using the value of 'value'
      });
    };

    const updatedTestSelected = TestSelected?.length ? updateObject(TestSelected) : [];
    const updatedPrebuiltAssessmentSelected = prebuiltAssessmentSelected?.length ? updateObject(prebuiltAssessmentSelected) : [];
    const assessments = [...updatedTestSelected, ...updatedPrebuiltAssessmentSelected];
    // settotalSelectedAssessments(assessments)

    await assignAssessment(jobId, [params.id], assessments, new Date(), validTo)
    setSelectedAssessments()
    handleClose()
    setShowAssignTestModal(false)
    // setColumnDefs(prev => prev)
  }

  
  const handleCheckboxChange = (event, item, type) => {
    if (event.target.checked) {
      if (type === "prebuilt-assessment") {
        if (prebuiltAssessmentSelected) setPrebuiltAssessmentSelected([...prebuiltAssessmentSelected, { id: item.id, type: type, randomize_question: false }]);
        else setPrebuiltAssessmentSelected([{ id: item.id, type: type, randomize_question: false }])
      } else if (type === "user-owned-assessment") {
        if (TestSelected) setTestSelected([...TestSelected, { id: item.id, type: type, randomize_question: false }]);
        else setTestSelected([{ id: item.id, type: type, randomize_question: false }])
      }
    } else {
      // Remove the unselected assessment ID from the state
      if (type === "prebuilt-assessment") {
        setPrebuiltAssessmentSelected(prebuiltAssessmentSelected.filter((assessment) => assessment.id !== item.id));
      } else if (type === "user-owned-assessment") {
        setTestSelected(TestSelected.filter((assessment) => assessment.id !== item.id))
      }
    }
  };

  // console.log(">>>>>>>>>>>>>>>>", selectedAssessments)

  function handleRandomizeSwitch(e, testId, type, total_questions) {
    if (type === "user-owned-assessment") {
      setTestSelected(TestSelected.map((test) => {
        if (test.id === testId) {
          return { ...test, randomize_question: e.target.checked ? true : false, question_count: e.target.checked ? total_questions : null }
        }
        else return test
      }))
    } else if (type === "prebuilt-assessment") {
      setPrebuiltAssessmentSelected(prebuiltAssessmentSelected.map((test) => {
        if (test.id === testId) {
          return { ...test, randomize_question: e.target.checked ? true : false, question_count: e.target.checked ? total_questions : null }
        }
        else return test
      }))
    }
  }

  function questionsCount(e, testId, testType, total_questions) {
    if (testType === "user-owned-assessment") {
      setTestSelected(TestSelected.map((test) => {
        if (test.id === testId) {
          return { ...test, question_count: e.target.value > total_questions ? total_questions : e.target.value }
        }
        else return test
      }))
    } else if (testType === "prebuilt-assessment") {
      setPrebuiltAssessmentSelected(prebuiltAssessmentSelected.map((test) => {
        if (test.id === testId) {
          return { ...test, question_count: e.target.value > total_questions ? total_questions : e.target.value }
        }
        else return test
      }))
    }
  }

  return (
    <>
      <div
        className="overflow-auto rounded-xl border"
        style={{ height: "calc(100vh - 445px)" }}
      >
        <Table url={url} setTableInstance={setTableInstance} columns={columns} data={applicants} fieldMapping={fieldMapping} setTableRowCount={setTableRowCount} />

       
      </div>
      {showModal && (
        <div
          className="relative z-30"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
              <div
                style={{ minWidth: "60%", maxWidth: "95%" }}
                className="relative flex flex-col h-[90%] justify-between rounded-lg bg-white text-left shadow-xl transition-all my-8"
              >
                {/* Header */}
                <Header
                  label={"Send Email To Candidate"}
                  onClose={handleClose}
                />

                {/* Body */}
                <div className="bg-white h-auto flex-grow px-4 pb-4 pt-5 sm:p-6 sm:pb-4 overflow-auto">
                  <div className="p-3 w-full">
                    <label className="flex text-gray-700 p-2 border rounded-xl bg-sky-50 w-full">
                      {params?.name} will be marked as{" "}
                      <span className={`${status === "shortlist" ? "text-teal-600" : "text-red-600"} font-medium px-1`}>
                        {status === "shortlist" ? "shortlisted" : "not shortlisted"}
                      </span>{" "}
                      for the resume screening stage
                    </label>
                    <div className="mt-8 font-medium">
                      Would you like to notify {params?.name} via
                      email?
                    </div>
                    <div className="flex mt-4 w-32 border rounded-xl overflow-hidden">
                      <button
                        onClick={() => setNotifyCandidate(true)}
                        className={`w-1/2 p-2 h-full border-r hover:bg-indigo-500 hover:text-white ${notifyCandidate
                          ? "bg-brand-purple text-white"
                          : "bg-white"
                          }`}
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setNotifyCandidate(false)}
                        className={`w-1/2 p-2 h-full hover:bg-indigo-500 hover:text-white ${!notifyCandidate
                          ? "bg-indigo-400 text-white"
                          : "bg-white"
                          }`}
                      >
                        No
                      </button>
                    </div>

                    {notifyCandidate && (
                      <>
                        <div className="flex gap-3 mt-8 mb-5">
                          <div className="flex items-center">
                            <input
                              type="radio"
                              id="defaultTemplate"
                              name="templateOption"
                              value="default"
                              onChange={handleTemplateChange}
                              className="mr-2 accent-indigo-500"
                            />
                            <label
                              htmlFor="defaultTemplate"
                              className=" font-medium text-gray-900"
                            >
                              Default Shortlist Email Template
                            </label>
                          </div>

                          <div>
                            <div className="flex items-center">
                              <input
                                type="radio"
                                id="customTemplate"
                                name="templateOption"
                                value="custom"
                                onChange={handleTemplateChange}
                                className="mr-2 accent-indigo-500"
                              />
                              <label
                                htmlFor="customTemplate"
                                className=" font-medium text-gray-900"
                              >
                                Custom Template
                              </label>
                            </div>
                          </div>
                        </div>

                        {selectedTemplate === "custom" && (
                          <>
                            <div className="mb-3">
                              <label
                                htmlFor="subject"
                                className="block mb-2 text-sm font-medium text-gray-900"
                              >
                                Subject
                              </label>
                              <input
                                type="text"
                                id="subject"
                                name="subject"
                                onChange={(e) => setSubject(e.target.value)}
                                className="block w-full p-2 border border-gray-300 rounded-md"
                                placeholder="Enter email subject"
                              />
                            </div>

                            <div className="">
                              <label
                                htmlFor="body"
                                className="block mb-2 text-sm font-medium text-gray-900"
                              >
                                Body
                              </label>
                              <textarea
                                id="body"
                                name="body"
                                className="block w-full p-2 border border-gray-300 rounded-md"
                                placeholder="Type a personalized message for the candidate"
                                onChange={(e) => setBody(e.target.value)}
                                rows="4"
                              ></textarea>
                            </div>
                          </>
                        )}
                        {selectedTemplate === "default" && (
                          <>
                            <div className="mb-3">
                              <label
                                htmlFor="subject"
                                className="block mb-2 text-sm font-medium text-gray-900"
                              >
                                Subject
                              </label>
                              <input
                                type="text"
                                id="subject"
                                name="subject"
                                readOnly
                                // onChange={(e) => setSubject(e.target.value)}
                                className="block w-full p-2 border border-gray-300 rounded-md"
                                value={status ? defaultEmailTemplates[status]["subject"] : ""}
                                placeholder="Enter email subject"
                              />
                            </div>

                            <div className="">
                              <label
                                htmlFor="body"
                                className="block mb-2 text-sm font-medium text-gray-900"
                              >
                                Body
                              </label>
                              <div

                                className="block w-full p-2 border border-gray-300 rounded-md"
                                placeholder="Type a personalized message for the candidate"
                                // value={status ? (defaultEmailTemplates[status]["header"] + defaultEmailTemplates[status]["body"] + defaultEmailTemplates[status]["footer"] ): ""}
                                // onChange={(e) => setBody(e.target.value)}
                                dangerouslySetInnerHTML={{ __html: status ? (defaultEmailTemplates[status]["header"] + defaultEmailTemplates[status]["body"] + defaultEmailTemplates[status]["footer"]) : "" }}
                              ></div>
                            </div>
                          </>
                        )}
                        {errorMessage && (
                          <div className="text-red-600 text-sm">
                            {errorMessage}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 rounded-b-lg px-4 py-3 flex justify-end sm:px-6 space-x-3">
                  <button
                    disabled={sendingEmail}
                    onClick={() => sendEmail()}
                    className="h-10 justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:bg-blue-200 sm:ml-3 sm:w-auto"
                  >
                    {
                      sendingEmail ?
                        "Sending Email"
                        :
                        <>
                          {notifyCandidate
                            ? status === "shortlist"
                              ? "Shortlist & Send Email"
                              : "Not Shortlist & Send Email"
                            : status === "shortlist"
                              ? "Shortlist"
                              : "Not Shortlist"}
                        </>
                    }
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
      {showAssignTestModal && (
        <div
          className="relative z-30"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
              <div
                style={{ minWidth: "60%" }}
                className="relative flex flex-col h-[90%] justify-between rounded-lg bg-white text-left shadow-xl transition-all my-8"
              >
                {/* Header */}
                <Header
                  label={"Advance Candidate to Assessment"}
                  onClose={handleClose}
                />

                {/* Body */}
                <div className="bg-white h-full w-full flex overflow-auto">
                  <div className="bg-gray-50 w-[250px] h-full flex flex-col gap-1 border-r py-5">
                    <label className="px-4 mb-2 font-semibold">Steps</label>
                    <div className="p-4 border-y w-full ">
                      <label className="text-base font-medium text-sky-600">
                        Select Assessments
                      </label>
                      <p className="text-sm text-gray-500">
                        Pick an assessment from our pre-built templates or
                        assessments created by you and assign it to the
                        candidate
                      </p>
                    </div>
                    <div className="p-4 border-b w-full text-sky-600">
                      <label className="text-base font-medium">
                        Preferences
                      </label>
                      <p className="text-sm text-gray-500">
                        Customize selected assessments based on available preferences.
                      </p>
                    </div>
                  </div>

                  <div className="flex-grow h-full p-5">
                    {/* Step 1  */}

                    {currentStep === 1 && (
                      <div className="p-3 h-full flex flex-col">
                        <div className="flex border rounded-xl overflow-hidden mb-4">
                          <button
                            onClick={() => setSelectedAssessmentType("prebuilt-assessment")}
                            className={`w-1/2 p-2 h-full border-r hover:bg-indigo-500 hover:text-white ${selectedAssessmentType === "prebuilt-assessment"
                              ? "bg-brand-purple text-white"
                              : "bg-white"
                              }`}
                          >
                            Pre-built Assessments
                          </button>
                          <button
                            onClick={() => setSelectedAssessmentType("user-owned-assessment")}
                            className={`w-1/2 p-2 h-full hover:bg-indigo-500 hover:text-white ${selectedAssessmentType === "user-owned-assessment"
                              ? "bg-brand-purple text-white"
                              : "bg-white"
                              }`}
                          >
                            For your Organization
                          </button>
                        </div>
                        {/* <div className="flex mt">
                          <div className="w-4/6 relative">
                            <input
                              type="text"
                              className="w-full p-1 ps-3 rounded-lg shadow-md outline-none ring-1 ring-gray-300"
                            />
                            <MagnifyingGlassIcon className="absolute top-1 right-2 w-5 h-5" />
                          </div>
                          <div className="w-2/6"></div>
                        </div> */}

                        <div className="flex flex-wrap bg-gray-50 h-5/6 rounded-lg flex-grow mt-3 p-4 overflow-auto">
                          <ul className="flex flex-col gap-2 bg-gray-50 rounded-lg flex-grow" >
                            {
                              selectedAssessmentType === "prebuilt-assessment" &&
                              <>
                                {preBuiltAssessments && preBuiltAssessments.length > 0 && 
                                <>
                                <div className="mb-2">
                                <input type="text" onChange={(e) => handleSearch(e.target.value,"prebuilt-assessment")} className="w-full ring-2 ring-gray-200 rounded-md p-2 font-normal" placeholder="Search assessments" />
                                </div>
                                {loadingPreBuiltAssessments && <label className="text-center w-full mt-2 text-gray-500">Loading</label>}
                                {
                                   preBuiltAssessments.map((item) => (
                                    <li key={item.id} className="w-full">
                                      <div className="relative flex justify-between items-center gap-3 w-full h-16 border-2 rounded-md bg-white p-3 flex-wrap">
                                        <div className="flex gap-2 grow">
                                          <input
                                            type="checkbox"
                                            className="p-3"
                                            onChange={(e) => handleCheckboxChange(e, item, "prebuilt-assessment")}
                                            checked={prebuiltAssessmentSelected.find(assessment => assessment.id == item.id)} // Keep checkbox state in sync
                                          />
                                          {/* <div className="">
                                            <label className="text-[0.95rem] w-full">
                                              {item?.title}
                                            </label>
                                          </div> */}
                                          <div className="flex flex-col justify-center ms-1">
                                            <label className="">
                                              {item?.title}
                                            </label>
                                            <div className="flex gap-2 items-center">
  
                                              <label className="text-gray-500 text-sm self-center">  Total Questions - {item?.total_question} </label>
                                              <div className="h-1 w-1 rounded-full bg-gray-500"></div>
                                              <label className="text-gray-500 text-sm self-center">  {item?.difficulty?.difficulty[0]?.toUpperCase() + item?.difficulty?.difficulty?.slice(1)} </label>
                                            </div>
                                          </div>
                                        </div>
                                        {/* <div className="w-1/4 text-center flex flex-col justify-center items-start overflow-hidden">
                                        <label className="text-[0.8rem] text-gray-500">Category</label>
                                        <div className="flex gap-3 overflow-hidden">
                                          {item.category?.map((cat, index) => (
                                            index < 3 && <span key={index} className="inline-flex text-nowrap items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">{cat.name  || "No data available"}</span>
                                          ))}
                                        </div>
                                      </div> */}
                                        {/* <div className="text-start">
                                          <label className="text-[0.85rem] text-gray-500">Difficulty</label>
                                          <div>
                                            {item?.difficulty?.difficulty ? (
                                              <span className="text-[0.9rem] font-medium">{item.difficulty.difficulty[0].toUpperCase() + item.difficulty.difficulty.slice(1)}</span>
                                            ) : (
                                              <span className="text-[0.85rem]">Not available</span>
                                            )}
                                          </div>
                                        </div> */}
                                        {prebuiltAssessmentSelected?.find(test => test?.id == item?.id) && (
                                          <>
                                            <div className="self-center text-[0.9rem] text-gray-500">Randomize Questions</div>
                                            <div class="relative rounded-md flex flex-row shadow-sm border">
                                              <div class="inset-y-0 left-0 flex items-center border-r px-3">
                                                <Switch2 checked={prebuiltAssessmentSelected?.find(test => test?.id == item?.id).randomize_question} onChange={(e) => handleRandomizeSwitch(e, item.id, "prebuilt-assessment", item.total_question)} />
                                                {/* <Switch size="small" onChange={(e) => handleRandomizeSwitch(e, item.id, "prebuilt-assessment", item.total_question)} defaultChecked={TestSelected?.find(test => test?.id == item?.id).randomize_question} className=" z-50" /> */}
                                              </div>
                                              <input type="number" name="question_count" id="question_count" class="rounded-md py-1.5 pl-2 w-36 text-gray-900 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                value={prebuiltAssessmentSelected?.find(test => test?.id == item?.id).question_count ? prebuiltAssessmentSelected?.find(test => test?.id == item?.id).question_count : ""}
                                                min={1} max={item.total_question}
                                                disabled={!(prebuiltAssessmentSelected?.find(test => test?.id == item?.id && test.randomize_question))}
                                                onChange={(e) => questionsCount(e, item.id, "prebuilt-assessment", item.total_question)}
                                                placeholder="no. of questions" />
                                            </div>
                                          </>)}
                                      </div>
                                    </li>
                                  ))

                                }
                                </>
                               }
                              </>
                            }

                            {
                              selectedAssessmentType === "user-owned-assessment" &&
                              <>
                                {assessments && assessments.length > 0 && 
                                <>
                                <div className="mb-2 w-full ">
                                <input type="text" onChange={(e) => handleSearch(e.target.value,"user-owned-assessment")} className="block w-full ring-2 ring-gray-200 rounded-md p-2 font-normal" placeholder="Search assessments" />
                               
                                </div>
                                {loadingAssessments && <label className="text-center w-full mt-2 text-gray-500">Loading</label>}
                                {
                                  assessments.map((item) => (
                                    <li key={item.id} className="w-full">
                                      <div className="relative flex justify-between items-center gap-4 w-full h-16 border-2 rounded-md bg-white p-3 flex-wrap">
                                        <div className="flex gap-2 flex-grow">
                                          <input
                                            type="checkbox"
                                            className="p-3"
                                            onChange={(e) => handleCheckboxChange(e, item, "user-owned-assessment")}
                                            checked={TestSelected.find(assessment => assessment.id == item.id)} // Keep checkbox state in sync
                                          />
                                          {/* <div className="">
                                            <label className="text-[0.95rem]">
                                              {item?.title}
                                            </label>
                                          </div> */}
                                          <div className="flex flex-col justify-center ms-1">
                                            <label className="">
                                              {item?.title}
                                            </label>
                                            <div className="flex gap-2 items-center">
  
                                              <label className="text-gray-500 text-sm self-center">  Total Questions - {item?.total_question} </label>
                                              <div className="h-1 w-1 rounded-full bg-gray-500"></div>
                                              <label className="text-gray-500 text-sm self-center">  {item?.difficulty?.difficulty[0]?.toUpperCase() + item?.difficulty?.difficulty?.slice(1)} </label>
                                            </div>
                                          </div>
                                        </div>
                                        {/* <div className="w-1/4 text-center flex flex-col justify-center items-start overflow-hidden">
                                          <label className="text-[0.8rem] text-gray-500">Category</label>
                                          <div className="flex gap-1 overflow-hidden">
                                            {item.category?.map((cat, index) => (
                                              index < 3 && <span key={index} className="inline-flex text-nowrap items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">{cat.name ? cat.name : "No data available"}</span>
                                            ))}
                                            {item.category.length == 0 && <span className="text-[0.85rem]">No data</span>}
                                          </div>
                                        </div> */}
                                        {/* <div className="text-start">
                                          <label className="text-[0.85rem] text-gray-500">Difficulty</label>
                                          <div>
                                            {item?.difficulty?.difficulty ? (
                                              <span className="text-[0.9rem] font-medium">{item.difficulty.difficulty[0].toUpperCase() + item.difficulty.difficulty.slice(1)}</span>
                                            ) : (
                                              <span className="text-[0.85rem]">Not available</span>
                                            )}
                                          </div>
                                        </div> */}
                                        {TestSelected?.find(test => test?.id == item?.id) && (
                                          <div className="flex gap-2">
                                            <div className="self-center text-[0.9rem] text-gray-500 w-min">Randomize Questions</div>
                                            <div class="relative rounded-md flex flex-row shadow-sm border">
                                              <div class="inset-y-0 left-0 flex items-center border-r px-3">
                                                <Switch2 checked={TestSelected?.find(test => test?.id == item?.id).randomize_question} onChange={(e) => handleRandomizeSwitch(e, item.id, "user-owned-assessment", item.total_question)} />
                                                {/* <Switch size="small" onChange={(e) => handleRandomizeSwitch(e, item.id, "user-owned-assessment", item.total_question)} defaultChecked={TestSelected?.find(test => test?.id == item?.id).randomize_question} className=" z-50" /> */}
                                              </div>
                                              <input type="number" name="question_count" id="question_count" class="rounded-md py-1.5 pl-2 w-36 text-gray-900 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                value={TestSelected?.find(test => test?.id == item?.id).question_count ? TestSelected?.find(test => test?.id == item?.id).question_count : ""}
                                                min={1} max={item.total_question}
                                                disabled={!(TestSelected?.find(test => test?.id == item?.id && test.randomize_question))}
                                                onChange={(e) => questionsCount(e, item.id, "user-owned-assessment", item.total_question)}
                                                placeholder="no. of questions" />
                                            </div>
                                          </div>)}
                                      </div>
                                    </li>
                                  ))
                                }
                                </>
                                }
                              </>
                            }
                          </ul>

                          {/* You can also display the selected IDs here for debugging */}
                          {/* <div>
                            <h3>Selected Assessments:</h3>
                            <ul>
                              {selectedAssessments.map(id => (
                                <li key={id}>{id}</li>
                              ))}
                            </ul>
                          </div> */}
                        </div>
                      </div>
                    )}
                    {currentStep === 2 && (
                      <div className="p-3 w-full flex flex-col">
                        {/* <label className="flex text-gray-700 p-2 border rounded-xl bg-sky-50 w-full">
                          {params?.data?.name} will be marked as{" "}
                          <span className="text-teal-600 font-medium px-1">
                            shortlisted
                          </span>{" "}
                          for the resume screening stage
                        </label> */}
                        <div className=" font-medium">
                          Valid till
                        </div>
                        <div className="flex mt-4 pb-7  border-b w-full">
                          <input
                            onChange={(e) => setValidTo(e.target.value)}
                            value={validTo}
                            className={`w-1/3 p-2 h-full rounded-xl ring-2 ring-gray-400  focus:outline-indigo-500  `}
                            type="date"
                          />

                        </div>



                        {/* <div className="flex flex-col bg-sky-50 border-2 border-sky-200 flex-grow gap-4 p-5 mt-8 mb-5 rounded-md shadow-md ">
                          <label className="font-medium ">Summary</label>
                          <div className="flex flex-col items-start gap-2">
                            <label>Assessments - {totalSelectedAssessments?.length} </label>
                            <label>Questions - {selectedAssessments?.length ? selectedAssessments?.reduce((acc, a) => acc + (a?.total_question || 0), 0) : 0} </label>
                            <label>Duration - {Math.floor(selectedAssessments?.reduce((acc, a) => acc + (a?.time_duration || 0), 0) / 60)} minutes</label>
                            {
                              validTo &&
                              <label>Link valid till - {new Date(validTo).toDateString()}</label>
                            }
                          </div>


                        </div> */}



                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 rounded-b-lg px-4 py-3 flex justify-end sm:px-6 space-x-3">
                  {currentStep === 1 && (
                    <>
                      <button
                        onClick={() => setCurrentStep(2)}
                        className="h-10 justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 sm:ml-3 sm:w-auto disabled:cursor-not-allowed disabled:bg-gray-300 "
                        disabled={!(prebuiltAssessmentSelected.length || TestSelected.length)}
                      >
                        Next
                      </button>
                      <button
                        onClick={() => handleClose()}
                        type="button"
                        className="h-10 justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {currentStep === 2 && (
                    <>
                      <button
                        onClick={() => { shortlistAndAssignTest() }}
                        className="h-10 justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-500 sm:ml-3 sm:w-auto disabled:cursor-not-allowed disabled:bg-gray-300"
                        disabled={!validTo || assigningAssessment}
                      >
                        {assigningAssessment ? "Assigning" : "Send Assessment Link"}
                      </button>
                      <button
                        onClick={() => setCurrentStep(1)}
                        type="button"
                        className="h-10 justify-center rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
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
    </>
  );
};

export default ApplicantList;
