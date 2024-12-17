import { useContext, useEffect, useState } from "react";
import Table from "../../utils/tables/Table";
import { useNavigate } from "react-router-dom";
import { ArrowUpRightIcon, PlusIcon, UserPlusIcon } from "@heroicons/react/24/outline";
import AssignModal from "./AssignModal";
import AuthContext from "../../context/AuthContext";

const AssignedAssessments = () => {
  const [tableInstance, setTableInstance] = useState(null);
  const [currentTab, setCurrentTab] = useState("pre-built-assessments");
  const navigate = useNavigate();
  const [showAssignModal,setShowAssignModal] = useState(false)
  const {orgServices} = useContext(AuthContext)
  const [columns,setColumns] = useState([])
  const [tableRowCount, setTableRowCount] = useState("fetching")

  useEffect(()=> {
    if (orgServices.length > 0) {
      console.log(orgServices)
      const columnsSchema = [
        {
          title: "Candidate",
          field: "assigned_to.name",
          hozAlign: "left",
          vertAlign: "middle",
          minWidth: 150,
          maxWidth: 210,
          titleFormatter: function (cell, formatterParams, onRendered) {
            return (
              '<div class="column-container">' +
              `<label class="column-title">${cell.getValue()}</label>` +
              "</div>"
            );
          },
          formatter: function (cell) {
            return `<label class="font-medium text-sky-800">${cell.getValue()}</label>`;
          },
          //   headerPopup: headerPopupFormatter,
          cellClick: function (e, cell) {
            const candidateId = cell.getData()?.assigned_to?.id;
            const service = orgServices.find(s => s.key === "test")
            console.log(service,orgServices)
            if (service) {
              navigate(`/app/user/applicants/applicant/${candidateId}/profile/assessment/${service.id || ""}/`);
              
            }
          },
          headerPopupIcon: `<i class='fa-solid fa-filter column-filter-icon' title='Filter'></i>`,
          headerFilter: emptyHeaderFilter,
          headerFilterFunc: "like",
        },
        // {
        //     title: 'Job Name', field: 'job', hozAlign: "left",vertAlign: "middle", minWidth: 150,
        //     titleFormatter: function (cell, formatterParams, onRendered) {
        //         return '<div class="column-container">' +
        //             `<label class="column-title">${cell.getValue()}</label>` +
        //             '</div>';
        //     }, formatter: jobFormatter, headerPopup: headerPopupFormatter, headerPopupIcon: `<i class='fa-solid fa-filter column-filter-icon' title='Filter'></i>`, headerFilter: emptyHeaderFilter, headerFilterFunc: "like"
        // },
    
        // {
        //   title: "Duration",
        //   field: "time_duration_in_minutes",
        //   hozAlign: "left",
        //   vertAlign: "middle",
        //   minWidth: 150,
        //   titleFormatter: function (cell, formatterParams, onRendered) {
        //     return (
        //       '<div class="column-container">' +
        //       `<label class="column-title">${cell.getValue()}</label>` +
        //       "</div>"
        //     );
        //   },
        // //   headerPopup: headerPopupFormatter,
        //   headerPopupIcon: `<i class='fa-solid fa-filter column-filter-icon' title='Filter'></i>`,
        //   headerFilter: emptyHeaderFilter,
        //   headerFilterFunc: "like",
        //   formatter: function (cell) {
        //     return `<label class="">${cell.getValue()} minutes</label>`;
        //   },
        // },
        {
          title: "Job Title",
          field: "job.title",
          hozAlign: "left",
          vertAlign: "middle",
          minWidth: 150,
          maxWidth: 300,
          titleFormatter: function (cell, formatterParams, onRendered) {
            return (
              '<div class="column-container">' +
              `<label class="column-title">${cell.getValue()}</label>` +
              "</div>"
            );
          },
        },
        {
          title: "Assigned By",
          field: "assigned_by.name",
          hozAlign: "left",
          vertAlign: "middle",
          minWidth: 150,
          maxWidth: 250,
          titleFormatter: function (cell, formatterParams, onRendered) {
            return (
              '<div class="column-container">' +
              `<label class="column-title">${cell.getValue()}</label>` +
              "</div>"
            );
          },
          //   headerPopup: headerPopupFormatter,
          //   formatter: ownerFormatter,
          headerPopupIcon: `<i class='fa-solid fa-filter column-filter-icon' title='Filter'></i>`,
          headerFilter: emptyHeaderFilter,
          headerFilterFunc: "like",
        },
        {
          title: "Assigned At",
          field: "assigned_at",
          hozAlign: "left",
          vertAlign: "middle",
          minWidth: 150,
          maxWidth: 250,
          titleFormatter: function (cell, formatterParams, onRendered) {
            return (
              '<div class="column-container">' +
              `<label class="column-title">${cell.getValue()}</label>` +
              "</div>"
            );
          },
          //   headerPopup: headerPopupFormatter,
          formatter: function (cell) {
            return `<label class="">${
              cell.getValue()
                ? new Date(cell.getValue()).toLocaleString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })
                : ""
            }</label>`;
          },
          headerPopupIcon: `<i class='fa-solid fa-filter column-filter-icon' title='Filter'></i>`,
          headerFilter: emptyHeaderFilter,
          headerFilterFunc: "like",
        },
        {
          title: "Valid Till",
          field: "valid_to",
          hozAlign: "left",
          vertAlign: "middle",
          minWidth: 150,
          maxWidth: 250,
          titleFormatter: function (cell, formatterParams, onRendered) {
            return (
              '<div class="column-container">' +
              `<label class="column-title">${cell.getValue()}</label>` +
              "</div>"
            );
          },
          //   headerPopup: headerPopupFormatter,
          formatter: function (cell) {
            return `<label class="">${
              cell.getValue()
                ? new Date(cell.getValue()).toLocaleString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })
                : ""
            }</label>`;
          },
        },
        {
          title: "Status",
          field: "status_text",
          hozAlign: "left",
          vertAlign: "middle",
          maxWidth: 150,
          maxWidth: 250,
          titleFormatter: function (cell, formatterParams, onRendered) {
            return (
              '<div class="column-container">' +
              `<label class="column-title">${cell.getValue()}</label>` +
              "</div>"
            );
          },
          //   headerPopup: headerPopupFormatter,
          formatter: function (cell) {
    
    
            const status = cell.getValue();
            let iconClass = "fa-regular fa-paper-plane";
            if (!status && !status) {
              return (
                <div className="h-full flex items-center text-gray-400 italic">
                  No Data
                </div>
              );
            }
            const badgeClass = "font-sans  bg-white ring-gray-400/60";
            if (status === "Assigned Successfully") {
              iconClass = "fa-regular fa-paper-plane ";
            } else if (status === "Link Opened") {
              iconClass = "fa-regular fa-envelope-open text-orange-600";
            } else if (status === "Disqualified") {
              iconClass = "fa-regular fa-circle-xmark text-red-500";
            } else if (status === "Started") {
              iconClass = "fa-solid fa-spinner text-yellow-700";
            } else if (status === "Completed") {
              iconClass = "fa-regular fa-circle-check text-green-600";
            } else if (status === "Shortlisted") {
              iconClass = "fa-regular fa-thumbs-up text-blue-600";
            } else if (status === "Revoked") {
              iconClass = "fa-solid fa-ban text-red-600";
            }
            // Map over the skills array and return a badge for each skill
            if (status) {
              return (
                `<span class="inline-flex items-center gap-2 rounded-md px-2 py-1 text-xs font-medium  ring-1 ring-inset ${badgeClass}"><i class="${iconClass}"></i> ${status}</span>`
              );
            }
    
    
          },
          headerPopupIcon: `<i class='fa-solid fa-filter column-filter-icon' title='Filter'></i>`,
          headerFilter: emptyHeaderFilter,
          headerFilterFunc: "like",
        },
        {
          title: "Reason",
          field: "message",
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
          //   headerPopup: headerPopupFormatter,
          formatter: function (cell) {
            const proctoringData = cell.getRow().getData().proctoring || null;
            let message = ""
            if (proctoringData && proctoringData.message) {
                message = proctoringData.message
            }
            return `<label title="${message}" class="">${
              message
                ? message
                : ""
            }</label>`;
          },
          headerPopupIcon: `<i class='fa-solid fa-filter column-filter-icon' title='Filter'></i>`,
          headerFilter: emptyHeaderFilter,
          headerFilterFunc: "like",
        },
        
      ];

      setColumns(columnsSchema)
    }
  },[orgServices])

  function customMenuFormatter(cell, formatterParams, onRendered) {
    // Assuming job is a property of the row data
    var job = cell.getRow().getData();

    return `<i class='fa-solid fa-ellipsis-vertical text-slate-500'></i> `;
  }

  //create dummy header filter to allow popup to filter
  function emptyHeaderFilter() {
    return document.createElement("div");
  }

  const handleClose = () => {
    setShowAssignModal(false)
    // setTestData({});
    // setShowPreBuiltAssessmentModal(false);
    // setShowModal(false);
    // setShareModal(false);
    // setSelectedCategories(null);
    // setSelectedJob(null);
    // setSelectedDifficulty(null);
    // setSelectedDomains(null);
    // setCandidateSelected(null);
    // setTestSelected(null);
    // setValidFrom(null);
    // setValidTo(null);
    // setPrebuiltAssessmentSelected(null)
  };

  return (
    <>
      <div className="w-full h-full  job-list">
        <div className="mb-3">
          <div className="md:flex p-3 pt-5 items-center justify-between mt-2 md:mt-0 lg:px-4 px-2 py-2  border-b ">
            <div className="flex justify-between mb-2 md:mb-0">
            <div>
                <h2 className="text-xl font-semibold md:mb-0 mb-2">Assigned Assessments</h2>
                <p className=" text-sm text-gray-500">{tableRowCount === 0 ? "No Rows" : tableRowCount + " rows"}</p>
              </div>
              {/* <p className='text-xs text-gray-500'>Create job openings </p> */}
              <span className="sm:hidden">
                <button
                  //   onClick={() => openTestModal()}
                  type="button"
                  className="add-job-btn inline-flex truncate justify-center items-center rounded-md bg-primary-600 px-3 py-2 text-xs font-normal text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 "
                >
                  {/* <CheckIcon className="-ml-0.5 mr-1.5 h-2 w-2" aria-hidden="true" /> */}
                  Create
                </button>
              </span>
            </div>

            <div className="flex space-x-2 justify-between">
              <span className="hidden sm:flex">
                {/* {isSuperUser && ( */}
                  <button
                     onClick={() => navigate(`/app/user/${`test`}/${3}/`)}
                    type="button"
                    className="add-job-btn inline-flex truncate justify-center items-center rounded-md text-blue-600 px-3 py-2 text-sm font-medium shadow-sm  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 "
                  >
                    <ArrowUpRightIcon className="me-1.5 h-4 w-4 text-blue-600" aria-hidden="true" />
                    Go to Test Builder
                  </button>
                {/* )} */}
              </span>

               
              <span className="hidden sm:flex">
                <button
                  onClick={() => setShowAssignModal(true)}
                  type="button"
                  className="add-job-btn inline-flex truncate justify-center items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-normal text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 "
                >
                  <UserPlusIcon className="me-1.5 h-4 w-4" aria-hidden="true" />
                  Assign
                </button>
              </span>
            </div>
          </div>
       
        </div>
        <div
          className="overflow-auto rounded-xl p-3"
          style={{ height: "calc(100dvh - 140px)" }}
        >
           {columns.length > 0 &&
            <Table
            url={`/test/testlog/`}
            setTableInstance={setTableInstance}
            columns={columns}
            setTableRowCount={setTableRowCount}
            />
          }
      
        </div>
      </div>
      
      {showAssignModal && 
      <AssignModal handleClose={handleClose} />}
      
    </>
  );
};

export default AssignedAssessments;
