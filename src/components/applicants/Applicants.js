import { Fragment, useContext, useEffect, useState } from "react";
import AuthContext from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import Table from "../../utils/tables/Table";
import DefaultUserImage from "../../assets/default_avatar.png"
import { api } from "../../constants/constants";

const Applicants = () => {
  const { user, authTokens, logoutUser, domain } = useContext(AuthContext);
  const [error, setError] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  const [applicants, setApplicants] = useState(null);
  const [filteredApplicants, setFilteredApplicants] = useState(null);

  const [applicantsLoading, setApplicantsLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortingOption, setSortingOption] = useState("title");
  const [filterSearchTerm, setFilterSearchTerm] = useState({});

  const [tableInstance, setTableInstance] = useState(null);
  const [totalCount, setTotalCount] = useState(null);
  const [tableRowCount, setTableRowCount] = useState("fetching");
  const [url,setUrl] = useState(`${api}/filter/candidate?o=-latest_resume_created_at`)

  const fieldMapping = {
    name: "name", // Example: AG Grid field 'name' maps to backend 'name'
    overall_score: "resumes__resume_score__overall_score", // Example: AG Grid field 'score' maps to 'resumes__overall_score'
    total_duration: "resumes__total_duration",
    "city": "candidate_city",
    "state": "candidate_state",
    created_at: "latest_resume_created_at",
    "experience": "resumes__relevant_experience_in_months",
    "job_name": "applied_jobs__title"
    // Add more mappings as needed...
  };

  const columns = [
    {
      title: "Name",
      field: "name",
      hozAlign: "left",
      vertAlign: "middle",
      minWidth: 120,
      titleFormatter: function (cell, formatterParams, onRendered) {
        return (
          '<div class="column-container">' +
          `<label class="column-title">${cell.getValue()}</label>` +
          "</div>"
        );
      },
      formatter: linkFormatter,
      // headerPopup: headerPopupFormatter,
      cellClick: function (e, cell) {
        const id = cell.getData().id;
        navigate(`/app/user/applicants/applicant/${id}/profile/overview/`);
      },
      // headerPopupIcon: `<i class='fa-solid fa-filter column-filter-icon' title='Filter'></i>`,
      headerFilter: true,
      headerFilterFunc: "like",
      headerFilterParams: {
        elementAttributes: {
          class: "w-full rounded-lg border border-gray-300 p-2 my-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500", // Tailwind classes for styling
          placeholder: "", // Add a placeholder
        },
      },
    },
    // {
    //     title: 'Score', field: 'score', hozAlign: "left",vertAlign: "middle",sorter:scoreSorter,
    //     titleFormatter: function (cell, formatterParams, onRendered) {
    //         return '<div class="column-container">' +
    //             `<label class="column-title">${cell.getValue()}</label>` +
    //             '</div>';
    //     }, headerPopup: headerPopupFormatter,formatter: scoreFormatter, headerPopupIcon: `<i class='fa-solid fa-filter column-filter-icon' title='Filter'></i>`, headerFilter: emptyHeaderFilter, headerFilterFunc: "like"
    // },

    {
      title: "Email",
      field: "email",
      hozAlign: "left",
      vertAlign: "middle",
      sorter: "string",
      minWidth: 120,
      titleFormatter: function (cell, formatterParams, onRendered) {
        return (
          '<div class="column-container">' +
          `<label class="column-title">${cell.getValue()}</label>` +
          "</div>"
        );
      },
      cellClick: function (e, cell) {
        const toEmail = cell.getValue();
        openOutlook(toEmail);
      },
      // headerPopup: headerPopupFormatter,
      formatter: emailFormatter,
      // headerPopupIcon: `<i class='fa-solid fa-filter column-filter-icon' title='Filter'></i>`,
      headerFilter: true,
      headerFilterFunc: "like",
      headerFilterParams: {
        elementAttributes: {
          class: "w-full rounded-lg border border-gray-300 p-2 my-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500", // Tailwind classes for styling
          placeholder: "", // Add a placeholder
        },
      },
    },
    {
      title: "Contact",
      field: "contact",
      hozAlign: "left",
      vertAlign: "middle",
      sorter: "string",
      headerSort: false,
      minWidth: 120,
      titleFormatter: function (cell, formatterParams, onRendered) {
        return (
          '<div class="column-container">' +
          `<label class="column-title">${cell.getValue()}</label>` +
          "</div>"
        );
      },
      // headerPopup: headerPopupFormatter,
      formatter: contactFormatter,
      // headerPopupIcon: `<i class='fa-solid fa-filter column-filter-icon' title='Filter'></i>`,
      headerFilter: true,
      headerFilterFunc: "like",
      headerFilterParams: {
        elementAttributes: {
          class: "w-full rounded-lg border border-gray-300 p-2 my-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500", // Tailwind classes for styling
          placeholder: "", // Add a placeholder
        },
      },
    },
    {
      title: 'City', field: 'city', hozAlign: "left", minWidth: 120, headerSort: false,
      // sorter: locationSorter,
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
          placeholder: "", // Add a placeholder
        },
      },
    },
    {
      title: 'State', field: 'state', hozAlign: "left", minWidth: 120, headerSort: false,
      // sorter: locationSorter,
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
          placeholder: "", // Add a placeholder
        },
      },
    },
    {
      title: "Experience ",
      field: "experience",
      hozAlign: "left",
      vertAlign: "middle",
      minWidth: 150,
      sorter: expSorter,
      titleFormatter: function (cell, formatterParams, onRendered) {
        return (
          '<div class="column-container ">' +
          `<label class="column-title">${cell.getValue()}<span class="text-sm font-normal  text-gray-500 ms-1 text-center"> (months)</span></label>` +
          "</div>"
        );
      },
      // headerPopup: headerPopupFormatter,
      formatter: expFormatter,
      // headerPopupIcon: `<i class='fa-solid fa-filter column-filter-icon' title='Filter'></i>`,
      headerFilter: true,
      headerFilterFunc: "like",
      headerFilterParams: {
        elementAttributes: {
          class: "w-full rounded-lg border border-gray-300 p-2 my-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500", // Tailwind classes for styling
          placeholder: "", // Add a placeholder
        },
      },
    },
    // {
    //   title: "Top Skills",
    //   field: "skills",
    //   hozAlign: "left",
    //   vertAlign: "middle",
    //   sorter: "array",
    //   minWidth: 150,
    //   headerSort: false,
    //   titleFormatter: function (cell, formatterParams, onRendered) {
    //     return (
    //       '<div class="column-container">' +
    //       `<label class="column-title">${cell.getValue()}</label>` +
    //       "</div>"
    //     );
    //   },
    //   // headerPopup: headerPopupFormatter,
    //   formatter: skillsFormatter,
    //   // headerPopupIcon: `<i class='fa-solid fa-filter column-filter-icon' title='Filter'></i>`,
    //   headerFilter: true,
    //   // headerFilterFunc: skillsFilterFunction,
    //   headerFilterFunc: "like",
    //   headerFilterParams: {
    //     elementAttributes: {
    //       class: "w-full rounded-lg border border-gray-300 p-2 my-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500", // Tailwind classes for styling
    //       placeholder: "", // Add a placeholder
    //     },
    //   },
    // },
    {
      title: "Applied For",
      field: "job_name",
      hozAlign: "left",
      vertAlign: "middle",
      minWidth: 120,
      headerSort: false,
      sorter: jobNameSorter,
      titleFormatter: function (cell, formatterParams, onRendered) {
        return (
          '<div class="column-container">' +
          `<label class="column-title">${cell.getValue()}</label>` +
          "</div>"
        );
      },
      // headerPopup: headerPopupFormatter,
      formatter: jobNameFormatter,
      // headerPopupIcon: `<i class='fa-solid fa-filter column-filter-icon' title='Filter'></i>`,
      headerFilter: true,
      headerFilterFunc: "like",
      headerFilterParams: {
        elementAttributes: {
          class: "w-full rounded-lg border border-gray-300 p-2 my-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500", // Tailwind classes for styling
          placeholder: "", // Add a placeholder
        },
      },
    },
    {
      title: "Applied On",
      field: "created_at",
      hozAlign: "left",
      vertAlign: "middle",
      minWidth: 120,
      // titleFormatter: function (cell, formatterParams, onRendered) {
      //   return (
      //     '<div class="column-container">' +
      //     `<label class="column-title">${cell.getValue()}</label>` +
      //     "</div>"
      //   );
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
      },
      formatter: createdAtFormatter,
      headerFilter: emptyHeaderFilter,
      
    },
   
  ];

  // useEffect(() => {
  //   if (tableInstance) {
  //     tableInstance.setSort("updated_at","desc")
  //   }
  // },[tableInstance])

  console.count("applicants");

  function emailFormatter(cell, formatterParams, onRendered) {
    <i class="fa-solid fa-up-right-from-square"></i>;
    return `<div class="flex gap-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" class="text-blue-500 w-5 h-5" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
            </svg>

                <span class="me-2">${cell.getValue()}</span>
            </div>`;
  }

  function contactFormatter(cell, formatterParams, onRendered) {
    const str = cell?.getValue()?.toString();
    const match = str?.match(/["'\(]?(\d{10,})["'\)]?/);
    const value = match ? match[1] : null;
    <i class="fa-solid fa-up-right-from-square"></i>;
    return value
      ? `<div class="flex gap-x-2">
        <svg xmlns="http://www.w3.org/2000/svg" fill="#52b69a"  class="text-emerald-500 w-4 h-4" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
      </svg>
      

                <span class="me-2">${value}</span>
            </div>`
      : null;
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
 

  const handleSearch = (fieldName, searchValue) => {
    setSearchTerm(searchValue);
    const newSearch = { ...filterSearchTerm };
    newSearch[fieldName] = searchValue;
    setFilterSearchTerm(newSearch);
    const filtered = applicants.filter((applicant) =>
      applicant[fieldName].toLowerCase().includes(searchValue.toLowerCase())
    );

    setFilteredApplicants(filtered);
  };

  

  function skillsFilterFunction(value, data, filterParams) {
    if (data && value) {
      return data.some((skill) =>
        skill.toLowerCase().includes(value.toLowerCase())
      );
    }
  }

  function dateFilter(value, data, filterParams) {
    return new Date(data).toDateString() == new Date(value).toDateString();
    // return data === parseInt(value)
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

  // function luxonDateDiffFormatter(cell, formatterParams, onRendered) {
  //   // const { inputFormat, units, humanize, invalidPlaceholder } = formatterParams;
  //   const value = new Date(cell.getValue()).toDateString();
  //   return value;
  // }

  function jobNameFormatter(cell, formatterParams, onRendered) {
    const job = cell.getRow().getData().applied_jobs;
    // console.log(cell.getRow().getData())
    return job.length > 0 ? job[0].title : "";
  }

  function createdAtFormatter(cell, formatterParams, onRendered) {
    // const { inputFormat, units, humanize, invalidPlaceholder } = formatterParams;
    const updated_at = cell.getRow().getData()?.resumes[0]?.created_at || null
    const value = updated_at ?  new Date(updated_at).toDateString() : "";
    return value;
  }

  // function (p) => {
  //   const values = p.value || []; // If no skills, set to an empty array
  //   if (values.length === 0) {
  //     return (
  //       <div className="h-full flex items-center text-gray-400 italic">
  //         No data available
  //       </div>
  //     );
  //   }

  //   const resumes = p.data.resumes || [];
  //   let iconClass = "";

  //   // Map over the skills array and return a badge for each skill
  //   return (
  //     <div>
  //       {values.map((value, index) => {
  //         const status =
  //           resumes.length && resumes[index]
  //             ? resumes[index].status_text
  //             : "";
  //         if (status === "Under Review") {
  //           iconClass = "fa-solid fa-clock text-yellow-400";
  //         } else if (status === "On Hold") {
  //           iconClass = "fa-regular fa-clock text-orange-400";
  //         } else if (status === "Not Shortlisted") {
  //           iconClass = "fa-solid fa-xmark text-red-600";
  //         } else if (status === "Shortlisted") {
  //           iconClass = "fa-regular fa-check-double text-green-600";
  //         }
  //         if (index < 3) {
  //           const badgeClass = "font-sans  bg-white ring-gray-400/60";
  //           return (
  //             <span
  //               key={index}
  //               className={` inline-flex items-center rounded-md px-2 py-1 mr-2 mb-1 text-xs font-medium ring-1 ring-inset ${badgeClass}`}
  //             >
  //               <BriefcaseIcon className={`w-4 h-4 me-2 ${iconClass}`} />{" "}
  //               {value.title}
  //             </span>
  //           );
  //         }
  //       })}
  //     </div>
  //   );
  // },

  function jobNameSorter(a, b, aRow, bRow, column, dir, sorterParams) {
    // Extract the job titles from the rows
    const rowA = aRow.getData().applied_jobs
      ? aRow
        .getData()
        .applied_jobs.map((job) => job.title)
        .join(", ")
      : "";
    const rowB = bRow.getData().applied_jobs
      ? bRow
        .getData()
        .applied_jobs.map((job) => job.title)
        .join(", ")
      : "";

    // Compare the job titles
    return rowA.localeCompare(rowB);
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

  function expSorter(a, b, aRow, bRow, column, dir, sorterParams) {
    const exp_A = aRow.getData().resume?.total_duration;
    const exp_B = bRow.getData().resume?.total_duration;
    return exp_A - exp_B;
  }

  function scoreSorter(a, b, aRow, bRow, column, dir, sorterParams) {
    const score_A = aRow.getData().resume?.overall_score;
    const score_B = bRow.getData().resume?.overall_score;
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
    const items = cell.getRow().getData().resumes[0].skills; // Assuming 'services' is an array of service names
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

  function expFormatter(cell, formatterParams, onRendered) {
    const work_experience = cell.getRow().getData().resumes[0]?.relevant_experience_in_months; // Assuming 'services' is an array of service names
    return `<span class="${work_experience ? "text-gray-900" : "text-gray-400 italic"
      }"}>${work_experience ? (work_experience === 1 ? work_experience + " month" : work_experience + " months") : "No experience"
      }</span>`; // Join services into a string separated by commas
  }

  return (
    <>
      {/* <Heading /> */}
      {/* {
                applicants !== null && */}
      <div className="w-full h-full p-3 flex flex-col gap-y-5">
        {/* Header Section  */}
        <div className="lg:flex lg:items-center lg:justify-between mt-2 md:mt-0 px-4 py-2 border-b ">
          <div>
            <h2 className="text-xl font-semibold md:mb-0 mb-2">Applicants</h2>
            <p className=" text-sm text-gray-500">{tableRowCount === 0 ? "No Rows" : tableRowCount + " rows"}</p>
          </div>
          <div className="ms-auto flex lg:items-center lg:justify-between">
            <div
              className="w-full flex gap-x-4 justify-end p-2 mb-1"
              style={{ fontSize: ".8rem" }}
            >
              <span className="flex items-center gap-x-1  text-gray-600 font-medium">
                <div className={`w-2 h-2 rounded-full bg-red-600`}></div>
                Not Shortlisted
              </span>
              <span className="flex items-center gap-x-1 text-gray-600 font-medium">
                <div className={`w-2 h-2 rounded-full bg-yellow-400`}></div>
                Under Review
              </span>
              <span className="flex items-center gap-x-1 text-gray-600 font-medium">
                <div className={`w-2 h-2 rounded-full bg-orange-400`}></div>
                On Hold
              </span>

              <span className="flex items-center gap-x-1  text-gray-600 font-medium">
                <div className={`w-2 h-2 rounded-full bg-green-400`}></div>
                Shortlisted
              </span>

            </div>
          </div>
        </div>
        {/* <div className="px-4">
                    <ApplicantAnalytics />
                </div> */}

        <div
          className="overflow-auto rounded-xl border"
          style={{ height: "calc(100dvh - 130px)" }}
        >
          {/* {
                            filteredApplicants.length > 0 ? */}
          <Table url={`/filter/candidate?o=-latest_resume_created_at`} setTableInstance={setTableInstance} setTableRowCount={setTableRowCount} columns={columns} data={filteredApplicants} fieldMapping={fieldMapping} />
          
        </div>
      </div>
      {/* } */}
    </>
  );
};

export default Applicants;
