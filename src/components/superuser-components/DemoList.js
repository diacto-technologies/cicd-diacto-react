import { useContext, useState } from "react";
import AuthContext from "../../context/AuthContext";
import Table from "../../utils/tables/Table";

const DemoList = () => {
  const { authTokens, isSuperUser, userDetails } = useContext(AuthContext); // Accessing context
  const [loadingDemos, setLoadingDemos] = useState(false);
  const [demoList, setDemoList] = useState([]);
  const [columns, setColumns] = useState([
    {
      title: "Name",
      field: "first_name",
      hozAlign: "left",
      vertAlign: "middle",
      width: 300,
      formatter: linkFormatter,
      titleFormatter: function (cell, formatterParams, onRendered) {
        return (
          '<div class="column-container">' +
          `<label class="column-title font-medium">${cell.getValue()}</label>` +
          "</div>"
        );
      },
      // headerPopup: headerPopupFormatter,
      //   cellClick: function (e, cell) {
      //     const jobId = cell.getData().id;
      //     navigate(`/app/user/jobs/job/${jobId}/overview`)
      //   }, headerPopupIcon: `<i class='fa-solid fa-filter column-filter-icon' title='Filter'></i>`, headerFilter: true, headerFilterFunc: "like",
      //   headerFilterParams: {
      //     elementAttributes: {
      //       class: "w-full rounded-lg border border-gray-300 p-2 my-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500", // Tailwind classes for styling
      //       placeholder: "", // Add a placeholder
      //     },
      //   },
    },
    {
      title: "Email",
      field: "email",
      hozAlign: "left",
      vertAlign: "middle",
      minWidth: 150,
      width: 200,
      formatter: emailFormatter,

      titleFormatter: function (cell, formatterParams, onRendered) {
        return (
          '<div class="column-container">' +
          `<label class="column-title">${cell.getValue()}</label>` +
          "</div>"
        );
      },
      // headerPopup: headerPopupFormatter,
    },
    {
      title: "Phone",
      field: "phone",
      hozAlign: "left",
      vertAlign: "middle",
      minWidth: 100,
      maxWidth: 140,
      headerSort: false,
      formatter: contactFormatter,

      titleFormatter: function (cell, formatterParams, onRendered) {
        return (
          '<div class="column-container">' +
          `<label class="column-title">${cell.getValue()}</label>` +
          "</div>"
        );
      },

      //   formatter: expFormatter,
      //  headerPopup: headerPopupFormatter,
      //   headerPopupIcon: `<i class='fa-solid fa-filter column-filter-icon' title='Filter'></i>`,
      //   headerFilter: true,
      //   headerFilterFunc: "in",
      //   headerFilterParams: {
      //     elementAttributes: {
      //       class:
      //         "w-full rounded-lg border border-gray-300 p-2 my-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500", // Tailwind classes for styling
      //       placeholder: "", // Add a placeholder
      //     },
      //   },
    },
    {
      title: "Job Title",
      field: "job_title",
      hozAlign: "left",
      vertAlign: "middle",
      minWidth: 150,
      headerSort: false,
      titleFormatter: function (cell, formatterParams, onRendered) {
        return (
          '<div class="column-container">' +
          `<label class="column-title">${cell.getValue()}</label>` +
          "</div>"
        );
      },
    },
    {
      title: "Company",
      field: "company",
      hozAlign: "left",
      vertAlign: "middle",
      minWidth: 150,
      headerSort: false,
      titleFormatter: function (cell, formatterParams, onRendered) {
        return (
          '<div class="column-container">' +
          `<label class="column-title">${cell.getValue()}</label>` +
          "</div>"
        );
      },
    },
    {
      title: "Consent",
      field: "consent",
      hozAlign: "left",
      vertAlign: "middle",
      minWidth: 150,
      headerSort: false,
      titleFormatter: function (cell, formatterParams, onRendered) {
        return (
          '<div class="column-container">' +
          `<label class="column-title">${cell.getValue()}</label>` +
          "</div>"
        );
      },
    },
    {
      title: "Created At",
      field: "created_at",
      hozAlign: "left",
      vertAlign: "middle",
      minWidth: 150,

      titleFormatter: function (cell, formatterParams, onRendered) {
        return (
          '<div class="column-container">' +
          `<label class="column-title">${cell.getValue()}</label>` +
          "</div>"
        );
      },

      formatter: luxonDateDiffFormatter,
      // headerPopupIcon: `<i class='fa-solid fa-filter column-filter-icon' title='Filter'></i>`, headerFilter: emptyHeaderFilter, headerFilterFunc: "like"
    },
    {
      title: "Demo Date",
      field: "demo_date",
      hozAlign: "left",
      vertAlign: "middle",
      minWidth: 150,

      titleFormatter: function (cell, formatterParams, onRendered) {
        return (
          '<div class="column-container">' +
          `<label class="column-title">${cell.getValue()}</label>` +
          "</div>"
        );
      },
      formatter: luxonDateDiffFormatter,
      // headerPopupIcon: `<i class='fa-solid fa-filter column-filter-icon' title='Filter'></i>`, headerFilter: emptyHeaderFilter, headerFilterFunc: "like"
    },

    {
      title: "Status",
      field: "status",
      hozAlign: "left",
      vertAlign: "middle",
      headerSort: false,
      //   formatter: statusFormatter,
      headerSort: false,
      minWidth: 150,
    },
    {
      title: "Feedback",
      field: "feedback",
      hozAlign: "left",
      vertAlign: "middle",
      minWidth: 150,
      headerSort: false,
      titleFormatter: function (cell, formatterParams, onRendered) {
        return (
          '<div class="column-container">' +
          `<label class="column-title">${cell.getValue()}</label>` +
          "</div>"
        );
      },
    },

    {
      title: "Action",
      width: 85,
      maxWidth: 100,
      hozAlign: "center",
      field: "Action",
      headerSort: false,
      //   clickMenu: cellContextMenu,
      //   formatter: customMenuFormatter,
      frozen: true,
      titleFormatter: function (cell, formatterParams, onRendered) {
        return (
          '<div class="column-container">' +
          `<label class="column-title">${cell.getValue()}</label>` +
          "</div>"
        );
      },
      //   headerPopup: headerPopupFormatter,
      //   headerPopupIcon: `<i class='' title='Filter'></i>`,
      //   headerFilter: emptyHeaderFilter,
    },
    // Add more columns as needed
  ]);
  const [tableRowCount, setTableRowCount] = useState("fetching");
  const [tableInstance, setTableInstance] = useState(null);

  // const [teamMemberOptions, setTeamMemberOptions] = useState([]);
  const fieldMapping = {};

  function linkFormatter(cell, formatterParams, onRendered) {
    const name = cell.getValue(); // Get the cell value (candidate name)

    return `
        <div class="flex items-center gap-3 w-full">
            <span class="text-gray-800 font-medium">${name}</span>
        </div>
    `;
  }

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

  function luxonDateDiffFormatter(cell, formatterParams, onRendered) {
    const rowData = cell.getValue();
    // const closingIn = rowData.closing_in; // Number of days until closing
    const date = rowData ? new Date(rowData) : null;

    // If no closing date, return a placeholder
    if (!date) {
      return `<span class="text-gray-500 italic">No date</span>`;
    }

    // Format the closing date as a human-readable string
    const formattedDate = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Apply a warning style if closing is less than 15 days away
    if (date) {
      return `
              <div class="flex items-center gap-2 p-2  rounded-md">
                   ${formattedDate}
              </div>
          `;
    }
  }

  // const fetchDemoList = async (title) => {
  //     try {
  //         setLoadingDemos(true);
  //         let endpoint = `/accounts/demo/`
  //         const response = await fetch(endpoint, {
  //             method: "GET",
  //             headers: {
  //                 "Content-Type": "application/json",
  //                 Authorization: "Bearer " + String(authTokens.access),
  //             },
  //         });

  //         if (!response.ok) {
  //             throw new Error("Network response was not ok");
  //         }

  //         const data = await response.json();

  //         // Map the results to the format required by React Select
  //         setLoadingDemos(false);
  //         if (data.results.length) {
  //             // const filteredData = data.results.filter((member)=>member.id !== userDetails.id)
  //             setDemoList(data.results);
  //             // setTeamMemberOptions(filteredData?.map((user) => { return { ...user, value: user.id, label: user.name } }))
  //         }
  //     } catch (error) {
  //         setLoadingDemos(false);
  //         console.error("Error fetching users:", error);
  //         // Handle the error accordingly
  //         return [];
  //     }
  // };

  return (
    <>
      <div className="w-full h-full p-3 flex flex-col gap-y-5">
        {/* Header Section  */}
        <div className="lg:flex lg:items-center lg:justify-between mt-2 md:mt-0 px-4 py-2 border-b ">
          <div>
            <h2 className="text-xl font-semibold md:mb-0 mb-2">Demo Requests</h2>
            <p className=" text-sm text-gray-500">
              {tableRowCount === 0 ? "No Rows" : tableRowCount + " rows"}
            </p>
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

        <div
          className="overflow-auto rounded-xl border"
          style={{ height: "calc(100dvh - 130px)" }}
        >
          <Table
            url={`/accounts/demo/`}
            setTableInstance={setTableInstance}
            setTableRowCount={setTableRowCount}
            columns={columns}
            fieldMapping={fieldMapping}
          />
          
        </div>
      </div>
    </>
  );
};

export default DemoList;
