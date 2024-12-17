import { useCallback } from "react";

import { XMarkIcon } from "@heroicons/react/20/solid";
import { useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import AuthContext from "../../context/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Table from "../../utils/tables/Table";
import Select, { components } from "react-select";
import DefaultAvatar from "../../assets/user-gray.png";
import AvatarContext from "../../context/AvatarContext";
import { api } from "../../constants/constants";

const JobList = () => {
  const [cellContextMenu, setCellContextMenu] = useState([]);
  const { authTokens, user, userDetails, domain } = useContext(AuthContext);
  const { avatars, fetchAvatar } = useContext(AvatarContext);
  const [totalCount, setTotalCount] = useState(null);
  const [error, setError] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [rowToUpdate, setRowToUpdate] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSearchTerm, setFilterSearchTerm] = useState({});
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [tableInstance, setTableInstance] = useState(null);

  const [showShareModal, setShowShareModal] = useState(false);
  const [jobToShare, setJobToShare] = useState(null);
  const [users, setUsers] = useState(null);
  const [usersSharedWith, setUsersSharedWith] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [loadingAvatars, setLoadingAvatars] = useState(false);

  const [columns, setColumns] = useState([]);
  const [tableRowCount, setTableRowCount] = useState("fetching");
  const [url, setUrl] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (userDetails) {
      // Define the default context menu options
      const defaultContextMenu = [
        {
          label:
            '<div class="flex items-center gap-1  px-4 py-1 text-gray-800 hover:bg-gray-100 hover:text-blue-500 cursor-pointer rounded-md"><i class="fa-solid fa-eye"></i><span>View</span></div>',
          action: function (e, cell) {
            let job = cell.getRow().getData();
            handleViewJob(job.id);
          },
        },
        {
          label:
            '<div class="flex items-center gap-1  px-4 py-1 text-gray-800 hover:bg-gray-100 hover:text-blue-500 cursor-pointer rounded-md"><i class="fa-solid fa-edit"></i><span>Edit</span></div>',
          action: function (e, cell) {
            let job = cell.getRow().getData();
            handleEditJob(job.id);
          },
        },
        {
          label:
            '<div class="flex items-center gap-1  px-4 py-1 text-gray-800 hover:bg-gray-100 hover:text-blue-500 cursor-pointer rounded-md"><i class="fa-solid fa-trash"></i><span>Delete</span></div>',
          action: function (e, cell) {
            let job = cell.getRow().getData();
            setRowToUpdate(cell.getRow());
            setShowDeleteModal(true)
            // handleDeleteJob(job.id);
          },
        },
        {
          label:
            '<div class="flex items-center gap-1  px-4 py-1 text-gray-800 hover:bg-gray-100 hover:text-blue-500 cursor-pointer rounded-md"><i class="fa-solid fa-share"></i><span>Share</span></div>',
          action: function (e, cell) {
            let job = cell.getRow().getData();
            handleShareJob(job, userDetails);
            setRowToUpdate(cell.getRow());
          },
        },
        {
          label:
            '<div class="flex items-center gap-1  px-4 py-1 text-gray-800 hover:bg-gray-100 hover:text-blue-500 cursor-pointer rounded-md"><i class="fa-solid fa-copy"></i><span>Copy URL</span></div>',
          action: function (e, cell) {
            let job = cell.getRow().getData();
            handleCopyUrl(job);
          },
        },
        {
          label: function (e, cell) {
            let published = e.getRow().getData().published;
            return `<div class="flex items-center gap-1  px-4 py-1 text-gray-800 hover:bg-gray-100 hover:text-blue-500 cursor-pointer rounded-md">
                      <i class="fa-solid ${
                        published ? "fa-eye-slash" : "fa-eye"
                      }"></i>
                      <span>${published ? "Unpublish" : "Publish"}</span>
                    </div>`;
          },
          action: function (e, cell) {
            let job = cell.getRow().getData();
            publishJob(job, cell.getRow());
          },
        },
      ];

      // Check the user's role and modify the context menu options accordingly
      // if (userDetails) {
      //   if (userDetails.role === "Participant") {
      //     // Remove options that are not applicable to Participants
      //     setCellContextMenu(
      //       defaultContextMenu.filter((option) => option.label === "View")
      //     );
      //   } else if (userDetails.role === "Editor") {
      //     // Remove options that are not applicable to Editors
      //     setCellContextMenu(
      //       defaultContextMenu.filter((option) => option.label !== "Delete")
      //     );
      //   } else if (userDetails.role === "Admin") {
      //     // Admin has access to all options, so no changes needed
      //     setCellContextMenu(defaultContextMenu);
      //   }
      // }

      // console.log("UserDetails>>>>>>>>", userDetails)
      setCellContextMenu(defaultContextMenu);
    }
  }, [userDetails]);

  useEffect(() => {
    if (userDetails && cellContextMenu.length) {
      // console.log("Setting Columns........")
      setColumns([
        {
          title: "Title",
          field: "title",
          hozAlign: "left",
          vertAlign: "middle",
          width: 300,
          titleFormatter: function (cell, formatterParams, onRendered) {
            return (
              '<div class="column-container">' +
              `<label class="column-title font-medium">${cell.getValue()}</label>` +
              "</div>"
            );
          },
          // headerPopup: headerPopupFormatter,
          cellClick: function (e, cell) {
            const jobId = cell.getData().id;
            navigate(`/app/user/jobs/job/${jobId}/overview`);
          },
          headerPopupIcon: `<i class='fa-solid fa-filter column-filter-icon' title='Filter'></i>`,
          headerFilter: true,
          headerFilterFunc: "like",
          headerFilterParams: {
            elementAttributes: {
              class:
                "w-full rounded-lg border border-gray-300 p-2 my-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500", // Tailwind classes for styling
              placeholder: "", // Add a placeholder
            },
          },
        },
        {
          title: "Total Applicants",
          field: "applicants_count",
          hozAlign: "left",
          vertAlign: "middle",
          minWidth: 150,
          width: 200,
          titleFormatter: function (cell, formatterParams, onRendered) {
            return (
              '<div class="column-container">' +
              `<label class="column-title">${cell.getValue()}</label>` +
              "</div>"
            );
          },
          // headerPopup: headerPopupFormatter,
          formatter: function (cell, formatterParams, onRendered) {
            const applicants = cell.getRow().getData().applicants_count; // Assuming 'services' is an array of service names
            const appliedToday = cell.getRow().getData().applicants_today_count;
            return applicants === 0
              ? "No Applicants"
              : applicants + ` (Applied Today: ${appliedToday})`;
          },
          headerPopupIcon: `<i class='fa-solid fa-filter column-filter-icon' title='Filter'></i>`,
          headerFilter: true,
          headerFilterFunc: "like",
          headerFilterParams: {
            elementAttributes: {
              class:
                "w-full rounded-lg border border-gray-300 p-2 my-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500", // Tailwind classes for styling
              placeholder: "", // Add a placeholder
            },
          },
        },
        {
          title: "Experience",
          field: "experience",
          hozAlign: "left",
          vertAlign: "middle",
          minWidth: 100,
          maxWidth: 140,
          headerSort: false,
          titleFormatter: function (cell, formatterParams, onRendered) {
            return (
              '<div class="column-container">' +
              `<label class="column-title">${cell.getValue()}</label>` +
              "</div>"
            );
          },

          formatter: expFormatter,
          //  headerPopup: headerPopupFormatter,
          headerPopupIcon: `<i class='fa-solid fa-filter column-filter-icon' title='Filter'></i>`,
          headerFilter: true,
          headerFilterFunc: "in",
          headerFilterParams: {
            elementAttributes: {
              class:
                "w-full rounded-lg border border-gray-300 p-2 my-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500", // Tailwind classes for styling
              placeholder: "", // Add a placeholder
            },
          },
        },
        {
          title: "Employment Type",
          field: "employment_type",
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
          // headerPopup: headerPopupFormatter,
          headerPopupIcon: `<i class='fa-solid fa-filter column-filter-icon' title='Filter'></i>`,
          headerFilter: true,
          headerFilterFunc: "like",
          headerFilterParams: {
            elementAttributes: {
              class:
                "w-full rounded-lg border border-gray-300 p-2 my-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500", // Tailwind classes for styling
              placeholder: "", // Add a placeholder
            },
          },
        },
        {
          title: "Location",
          field: "location",
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
          // headerPopup: headerPopupFormatter,
          headerPopupIcon: `<i class='fa-solid fa-filter column-filter-icon' title='Filter'></i>`,
          headerFilter: true,
          headerFilterFunc: "like",
          headerFilterParams: {
            elementAttributes: {
              class:
                "w-full rounded-lg border border-gray-300 p-2 my-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500", // Tailwind classes for styling
              placeholder: "", // Add a placeholder
            },
          },
        },
        {
          title: "Close Date",
          field: "close_date",
          hozAlign: "left",
          vertAlign: "middle",
          minWidth: 150,
          // titleFormatter: function (cell, formatterParams, onRendered) {
          //   return '<div class="column-container">' +
          //     `<label class="column-title">${cell.getValue()}</label>` +
          //     '</div>';
          // },
          titleFormatter: function (cell, formatterParams, onRendered) {
            // Create the date picker HTML element
            let datePickerHTML = `
            <div class="column-container">
                <label class="column-title">${
                  cell.getColumn().getDefinition().title
                }</label>
                <input type="date" id="date-picker" class="date-picker border p-1 rounded-md my-1" style="width: -webkit-fill-available;">
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
                    cell.getTable().setFilter("close_date", "in", selectedDate);
                  } else {
                    cell.getTable().clearFilter("close_date"); // Clear the filter if no date is selected
                  }
                });
              }
            });

            return datePickerHTML;
          },
          // headerPopup: headerPopupFormatter,
          // Disable sorting on header click
          headerClick: (e, column) => {
            e.stopPropagation(); // Prevents the sort from triggering on header click
          },
          formatter: luxonDateDiffFormatter,
          headerPopupIcon: `<i class='fa-solid fa-filter column-filter-icon' title='Filter'></i>`,
          headerFilter: emptyHeaderFilter,
          headerFilterFunc: "like",
        },
        // { title: 'Services', field: 'services', formatter: servicesFormatter },
        {
          title: "Status",
          field: "published",
          hozAlign: "left",
          vertAlign: "middle",
          headerSort: false,
          formatter: statusFormatter,
          headerSort: false,
          minWidth: 150,
          titleFormatter: function (cell, formatterParams, onRendered) {
            // Create the dropdown element
            let dropdownHTML = `
            <div class="column-container">
                <label class="column-title">${
                  cell.getColumn().getDefinition().title
                }</label>
                <select id="status-dropdown" class="status-dropdown w-full p-1 my-1 border rounded-md">
                    <option value="">All</option>
                    <option value="true">Published</option>
                    <option value="false">Unpublished</option>
                    <!-- Add more options as needed -->
                </select>
            </div>
        `;

            // Attach event listener to the dropdown after rendering
            onRendered(() => {
              const dropdown = document.getElementById("status-dropdown");
              if (dropdown) {
                dropdown.addEventListener("change", (event) => {
                  const selectedValue = event.target.value;

                  // Trigger your custom action here
                  // Example: Filter the table by the selected status
                  if (selectedValue) {
                    cell
                      .getTable()
                      .setFilter("published", "like", selectedValue);
                  } else {
                    cell.getTable().clearFilter("pulished"); // Clear the filter if no selection
                  }
                });
              }
            });

            return dropdownHTML;
          },
          // headerPopup: headerPopupFormatter,
          headerPopupIcon: `<i class='' title='Filter'></i>`,
          headerFilter: false,
          headerFilterFunc: "in",
        },
        {
          title: "Created By",
          field: "owner",
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
          formatter: ownerFormatter,
          // headerPopup: headerPopupFormatter,
          headerPopupIcon: `<i class='fa-solid fa-filter column-filter-icon' title='Filter'></i>`,
          headerFilter: true,
          headerFilterFunc: "like",
          headerFilterParams: {
            elementAttributes: {
              class:
                "w-full rounded-lg border border-gray-300 p-2 my-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500", // Tailwind classes for styling
              placeholder: "", // Add a placeholder
            },
          },
        },
        {
          title: "Shared With",
          field: "users_shared_with",
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
          formatter: avatarFormatter,
          // headerPopup: headerPopupFormatter,
          headerPopupIcon: `<i class='fa-solid fa-filter column-filter-icon' title='Filter'></i>`,
          headerFilter: emptyHeaderFilter,
          headerFilter: false,
        },
        {
          title: "Action",
          width: 85,
          maxWidth: 100,
          hozAlign: "center",
          field: "Action",
          headerSort: false,
          clickMenu: cellContextMenu,
          formatter: customMenuFormatter,
          frozen: true,
          titleFormatter: function (cell, formatterParams, onRendered) {
            return (
              '<div class="column-container">' +
              `<label class="column-title">${cell.getValue()}</label>` +
              "</div>"
            );
          },
          headerPopup: headerPopupFormatter,
          headerPopupIcon: `<i class='' title='Filter'></i>`,
          headerFilter: emptyHeaderFilter,
        },
        // Add more columns as needed
      ]);
    }
  }, [userDetails, cellContextMenu]);

  useEffect(() => {
    if (!url) {
      let joburl = `/filter/job`;
      setUrl(joburl + `?o=-close_date`);
    }
  }, []);

  // useEffect(() => {

  //     fetchJobs()
  // }, [])

  const handleClose = () => {
    setJobToShare(null);
    setShowShareModal(false);
    setUsersSharedWith([]);
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

  const handleSearch = (fieldName, searchValue) => {
    setSearchTerm(searchValue);
    const newSearch = { ...filterSearchTerm };
    newSearch[fieldName] = searchValue;
    setFilterSearchTerm(newSearch);
    const filtered = jobs.filter((job) =>
      job[fieldName].toLowerCase().includes(searchValue.toLowerCase())
    );

    setFilteredJobs(filtered);
  };

  async function fetchUsers(job) {
    // console.log("Fetching users", userDetails);
    try {
      setUsersLoading(true);
      const response = await fetch(
        `${api}/accounts/organizations/${userDetails?.org?.org_id}/users/`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + String(authTokens.access),
          },
        }
      );

      if (!response.ok) {
        setUsersLoading(false);
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      //// console.log("Users data: ", data);

      const usersSharedWithIds = job.users_shared_with;

      setUsersLoading(false);
      return { usersData: data.results };
    } catch (error) {
      console.error(error);
      setError(error.message);
      setUsersLoading(false);
    }
  }

  const fetchJobs = async () => {
    try {
      //console.log("fetching JOBS")
      setJobsLoading(true);
      const response = await fetch(`${api}/jobs/list/`, {
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
      //console.log(data.results)
      setJobs(data.results);

      let updatedUserAvatars = [];
      // const dataWithAvatars = await Promise.all(data.results.map(async job => {

      //     const avatars = await Promise.all(job.users_shared_with.map(async userId => {

      //         return { id: userId, avatar: await fetchAvatar(userId) }
      //     }
      //     ));

      //     //console.log("avatars : ", avatars)

      //     updatedUserAvatars = [...avatars.filter(a => a.avatar !== null && teamMembersAvatars.map(member => parseInt(a.id) !== parseInt(member.id)))]
      //     return { ...job, avatars };
      // }));

      setFilteredJobs(data.results);

      // setTeamMembersAvatars(updatedUserAvatars);

      setJobsLoading(false);
    } catch (error) {
      setError(error);
      setJobsLoading(false);
    }
  };

  // called by share button is clicked
  const handleShareJob = async (job, userDetails) => {
    // console.log("job : ", job, userDetails)
    setShowShareModal(true);
    setJobToShare(job);

    // console.log(await fetchUsers(job.id))

    // Get user data and avatar of users with whom the job is shared
    const { usersData } = await fetchUsers(job);
    if (usersData && usersData.length > 0) {
      setUsers(usersData);

      const usersSharedWithIds = job.users_shared_with?.map((user) => user.id);
      // set users with whom the job is already shared
      const userSharedWithData = usersData
        .filter(
          (user) =>
            parseInt(user.id) !== parseInt(job.owner.id) &&
            usersSharedWithIds.includes(parseInt(user.id))
        )
        .map((user, index) => {
          // console.log("User: ", user)
          return {
            ...user,
            label: user.name,
            value: user.id,
            avatar: user.profile_pic ? user.profile_pic : DefaultAvatar,
          };
        });
      //console.log("userSharedWithData : ", userSharedWithData)
      setUsersSharedWith(userSharedWithData);

      // set users with whom the job is not shared yet
      const usersNotSharedWithData = usersData
        .filter(
          (user) =>
            parseInt(user.id) !== parseInt(job.owner.id) &&
            !usersSharedWithIds.includes(parseInt(user.id))
        )
        .map((user) => ({
          ...user,
          label: user.name,
          value: user.id,
        }));

      // combine all users
      //console.log("usersNotSharedWithData : ", usersNotSharedWithData)
      setUsers([...userSharedWithData, ...usersNotSharedWithData]);
    }
  };

  const publishJob = async (job, row) => {
    const jobFormUrl = `${api}/jobs/job/${job.id}/`;
    try {
      const response = await fetch(jobFormUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + String(authTokens.access),
        },
        body: JSON.stringify({ published: job.published ? false : true }),
      });

      if (response.ok) {
        const data = await response.json();
        // const rowNode = job?.api.getRowNode(job?.node.id);
        // rowNode.setDataValue("published", data?.published);
        row.update({ published: data?.published });
        setSuccessMessage("Registration successful!");
        // fetchJobs()
        // Reset the form here if needed
      } else {
        const errorData = await response.json();
        setError(errorData);
      }
    } catch (error) {
      console.error("Job Creation failed:", error.message);
    }
  };

  const closeJob = async (grid) => {
    const jobFormUrl = `${api}/jobs/job/${grid.data.id}/`;
    try {
      const response = await fetch(jobFormUrl, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + String(authTokens.access),
        },
        body: JSON.stringify({ close_date: new Date() }),
      });

      if (response.ok) {
        const data = await response.json();
        const rowNode = grid?.api.getRowNode(grid?.node.id);
        rowNode.setDataValue("close_date", data?.close_date);
        setSuccessMessage("Closed Job!");
        // fetchJobs()
        // Reset the form here if needed
      } else {
        const errorData = await response.json();
        setError(errorData);
      }
    } catch (error) {
      console.error("Job Creation failed:", error.message);
    }
  };

  const handleDeleteJob = async (jobId, row) => {
    const jobFormUrl = `${api}/jobs/job/${jobId}/`;
    try {
      const response = await fetch(jobFormUrl, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + String(authTokens.access),
        },
        body: JSON.stringify({ is_deleted: true, deleted_by: userDetails?.id }),
      });

      if (response.ok) {
        // const data = await response.json();
        setSuccessMessage("Job Deleted successfully!");
        row.delete();
        // fetchJobs();
        // Reset the form here if needed
      } else {
        const errorData = await response.json();
        setError(errorData);
      }
    } catch (error) {
      console.error("Job Creation failed:", error.message);
    }
  };

  const handleViewJob = (jobId) => {
    navigate(`/app/user/jobs/job/${jobId}/overview/`);
  };

  const handleEditJob = (jobId) => {
    navigate(`/app/user/jobs/edit-job/${jobId}/1/`);
  };

  const handleCopyUrl = (job) => {
    const url = `https://app.candidhr.ai/app/candidate/${job.encrypted}/`;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        toast.success("URL copied to clipboard", {
          className: "text-sm",
          position: "top-right",
          autoClose: 1000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "light",
        });
      })
      .catch((err) => {
        console.error("Unable to copy text to clipboard", err);
      });
  };

  function statusFormatter(cell, formatterParams, onRendered) {
    const status = cell.getValue();
    let badgeClass, text;

    if (status) {
      badgeClass = "bg-green-50 text-green-700 ring-green-600/10";
      text = "Published";
    } else {
      badgeClass = "bg-red-50 text-red-700 ring-red-600/20";
      text = "Unpublished";
    }

    // switch (status) {
    //     case 'Scheduled':
    //         badgeClass = 'bg-blue-50 text-blue-700 ring-blue-700/10';
    //         break;
    //     case 'Completed':
    //         badgeClass = 'bg-green-50 text-green-700 ring-green-600/10';
    //         break;
    //     case 'Cancelled':
    //         badgeClass = 'bg-red-50 text-red-700 ring-red-600/20';
    //         break;
    //     default:
    //         badgeClass = 'bg-gray-50 text-gray-700 ring-gray-500/10'; // Default color or handle additional status values
    // }

    // Return the HTML for the badge
    return `<div class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium  ring-1 ring-inset ${badgeClass}">${text}</div>`;
  }

  //

  var headerPopupFormatter = function (e, column, onRendered) {
    var container = document.createElement("div");
    container.classList.add("column-filter");
    // var label = document.createElement("label");
    // label.style.display = "block";
    // label.style.fontSize = ".7em";

    var input = document.createElement("input");
    input.placeholder = `Filter...`;
    input.value = column.getHeaderFilterValue() || "";

    input.addEventListener("keyup", (e) => {
      column.setHeaderFilterValue(input.value);
    });

    //container.appendChild(label);
    container.appendChild(input);

    return container;
  };

  function customMenuFormatter(cell, formatterParams, onRendered) {
    // Assuming job is a property of the row data
    var job = cell.getRow().getData().job;

    return `<i class='fa-solid fa-ellipsis-vertical text-slate-500'></i> `;
  }

  const servicesFormatter = function (cell, formatterParams, onRendered) {
    const services = cell.getRow().getData().services; // Assuming 'services' is an array of service names
    return services.join(", "); // Join services into a string separated by commas
  };

  //create dummy header filter to allow popup to filter
  function emptyHeaderFilter() {
    return document.createElement("div");
  }

  function expFormatter(cell, formatterParams, onRendered) {
    const work_experience = cell.getRow().getData(); // Assuming 'services' is an array of service names

    return work_experience.max_experience
      ? `${work_experience.min_experience} - ${work_experience.max_experience} years`
      : null; // Join services into a string separated by commas
  }

  function ownerFormatter(cell, formatterParams, onRendered) {
    ////console.log("owner : ",cell.getValue())
    return `${cell.getValue().name}`;
  }

  const fieldMapping = {
    owner: "owner__name",
    "job.title": "job__title",
  };

  function avatarFormatter(cell, formatterParams, onRendered) {
    const items = cell.getValue();
    // console.log(items)
    const badgeClass = "bg-gray-50 text-gray-800 ring-gray-600/50";
    const wrapper = document.createElement("div");
    const limit = 3;
    for (let index = 0; index < items.length; index++) {
      // Limit items
      if (index < limit) {
        const avatar = items[index]?.profile_pic;
        ////console.log("users shared with id : ", items[index], "Avatar found : ",avatar)
        const img = avatar && avatar ? avatar : DefaultAvatar;
        let location = `<img class="inline-block  h-7 w-7 rounded-full ring-1 ring-gray-600/20" src=${img} alt="User Profile Picture" />`;
        wrapper.innerHTML += location;
      }
    }
    if (items.length > limit) {
      const badge = `<div class="me-2 inline-flex items-center justify-center text-ellipsis overflow-hidden rounded-full w-7 h-7 text-xs font-medium  ring-1 ring-inset ${badgeClass}">+${
        items.length - limit
      }</div>`;
      wrapper.innerHTML += badge;
    }
    return wrapper; // Join services into a string separated by commas
  }

  function luxonDateDiffFormatter(cell, formatterParams, onRendered) {
    const rowData = cell.getRow().getData();
    const closingIn = rowData.closing_in; // Number of days until closing
    const closeDate = rowData.close_date ? new Date(rowData.close_date) : null;

    // If no closing date, return a placeholder
    if (!closeDate) {
      return `<span class="text-gray-500 italic">No closing date</span>`;
    }

    // Format the closing date as a human-readable string
    const formattedDate = closeDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Apply a warning style if closing is less than 15 days away
    if (closingIn !== null && closingIn === 0) {
      return `
          <div class="flex items-center gap-2 p-2  rounded-md">
              <i class="fa-solid fa-exclamation-circle text-orange-700"></i>
              
              Closed on ${formattedDate}
          </div>
      `;
    }
    if (closingIn !== null && closingIn <= 15) {
      return `
            <div class="flex items-center gap-2 p-2  rounded-md">
                <i class="fa-regular fa-clock text-orange-700"></i>
                <span class="  text-orange-600">
                    <span class="font-medium">${closingIn} days left</span> 
                </span>
                Closing on ${formattedDate}
            </div>
        `;
    }

    // Default display for dates more than 15 days away
    return `
        <div class="flex items-center gap-2 p-2 ">
            <i class="fa-solid fa-calendar-check text-green-500"></i>
            <span >Closing on ${formattedDate}</span>
        </div>
    `;
  }

  const Option = (props) => {
    return (
      <components.Option {...props}>
        <div>{props.data.label}</div>
        <div className="" style={{ fontSize: ".65rem", color: "" }}>
          {props.data.email}
        </div>
      </components.Option>
    );
  };

  const handleSelectedOption = async (selectedOption) => {
    if (selectedOption) {
      //console.log(selectedOption)
      const sharedWithIds = new Set(usersSharedWith.map((user) => user.id));
      //console.log("sharedWithIds : ", sharedWithIds)
      const updatedIds = selectedOption.map((user) => user.id);

      setUsersSharedWith(selectedOption);

      const updatedJobs = jobs.map((job) => {
        if (parseInt(job.id) === parseInt(jobToShare.id)) {
          // Update the users_shared_with property
          //console.log("------", job)
          return { ...job, users_shared_with: updatedIds };
        }

        return job;
      });

      if (updatedIds.length > 0) {
        updateUserSharedWith(updatedIds);
      }
    }
  };

  const handleRemoveUser = (userId) => {
    // Remove user from usersSharedWith array
    const updatedArray = usersSharedWith.filter(
      (user) => parseInt(user.id) !== parseInt(userId)
    );
    const updatedIds = updatedArray.map((user) => user.id);
    setUsersSharedWith(updatedArray);
    updateUserSharedWith(updatedIds);
  };

  const updateUserSharedWith = async (ids) => {
    //console.log("updating sharedwithIds : ", ids)

    try {
      const response = await fetch(`${api}/jobs/job/${jobToShare.id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + String(authTokens.access),
        },
        body: JSON.stringify({ users_shared_with: ids }),
      });

      const data = await response.json();

      if (response.ok) {
        const updatedList = users.filter((user) => ids.includes(user.id));
        rowToUpdate?.update({ users_shared_with: updatedList });
        //console.log("successfully updated users_shared_with", data)
      } else {
        console.error("error occured");
      }
    } catch (error) {
      console.error("error occured", error);
    }
  };

  return (
    <>
      {/* <Heading /> */}
      {userDetails && (
        <div id="jobList" className="w-full h-full p-3 job-list">
          {/* Header Section  */}
          <div className="md:flex items-center justify-between mt-2 md:mt-0 lg:px-4 px-2 py-2 mb-2 ">
            <div className="flex justify-between mb-2 md:mb-0">
              <div>
                <h2 className="text-xl font-semibold md:mb-0 mb-2">Jobs</h2>
                <p className=" text-sm text-gray-500">
                  {tableRowCount === 0 ? "No Rows" : tableRowCount + " rows"}
                </p>
              </div>
              <span className="sm:hidden">
                <button
                  onClick={() => navigate("/app/user/jobs/create-job/")}
                  type="button"
                  className="add-job-btn inline-flex truncate justify-center items-center rounded-md bg-primary-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
                >
                  Add Job
                </button>
              </span>
            </div>

            <div className="flex space-x-2 justify-between">
              <span className="hidden sm:flex">
                <button
                  onClick={() => navigate("/app/user/jobs/create-job/")}
                  type="button"
                  className="add-job-btn inline-flex truncate justify-center items-center rounded-md bg-primary-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
                >
                  {/* <CheckIcon className="-ml-0.5 mr-1.5 h-2 w-2" aria-hidden="true" /> */}
                  Add Job
                </button>
              </span>
            </div>
          </div>

          {/* Job List  */}
          <div
            className="overflow-auto rounded-xl border"
            style={{ height: "calc(100dvh - 150px)" }}
          >
            {columns.length && url && (
              <Table
                url={url}
                setTableInstance={setTableInstance}
                data={filteredJobs}
                columns={columns}
                fieldMapping={fieldMapping}
                setTableRowCount={setTableRowCount}
              />
            )}
          </div>
        </div>
      )}
      <ToastContainer />

      {showShareModal && (
        <div
          className="relative  z-50"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="fixed  inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

          <div className="fixed h-full  inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
              <div
                style={{ minWidth: "30%", minHeight: "40%" }}
                className="relative lg:min-w-96  sm:w-2/6 sm:h-4/6 transform flex-col justify-evenly rounded-lg bg-white text-left shadow-xl transition-all my-8"
              >
                {/* Header  */}
                <div className="border-b h-auto rounded-t-lg bg-gray-50 flex justify-between px-5 py-4">
                  <div className="flex items-center space-x-3">
                    <i className="fa-solid fa-share-alt p-3 bg-sky-300 text-gray-700 rounded-full "></i>
                    <h3
                      className="text-base font-semibold leading-6 text-gray-900"
                      id="modal-title"
                    >
                      Share Job
                    </h3>
                  </div>
                  <button onClick={handleClose}>
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>

                {/* Body  */}
                <div className="bg-white h-5/6 px-2 pb-4 pt-5 sm:p-6 sm:pb-4 ">
                  <div className="sm:flex sm:items-start h-5/6 ">
                    <div className="mt-3 text-center  h-full w-full sm:ml-4 sm:mt-0 sm:text-left">
                      <div className="col-span-full">
                        <div className="mb-4 min-w-fit md:w-full">
                          <label
                            className="block text-gray-700 text-sm font-bold mb-2"
                            htmlFor="filterField"
                          >
                            Share with Team Members
                          </label>
                          <Select
                            className="text-xs "
                            isMulti
                            isLoading={usersLoading}
                            styles={selectStyle}
                            components={{ Option }}
                            value={usersSharedWith}
                            onChange={handleSelectedOption}
                            options={users}
                            isDisabled={
                              userDetails?.role?.name === "Participant"
                            }
                            // defaultValue={}
                          />
                        </div>
                      </div>

                      <div className="h-full">
                        <ul
                          role="list"
                          className="divide-y divide-gray-100 h-full overflow-auto px-3"
                        >
                          {usersSharedWith.length > 0 &&
                            usersSharedWith.map((user, index) => (
                              <li
                                key={index}
                                className="flex justify-between gap-x-6 py-5"
                              >
                                <div className="flex min-w-0 gap-x-4">
                                  <img
                                    className="h-12 w-12 flex-none rounded-full bg-gray-50 shadow-lg"
                                    src={
                                      user?.profile_pic
                                        ? user.profile_pic
                                        : DefaultAvatar
                                    }
                                    alt=""
                                  />
                                  <div className="min-w-0 flex-auto">
                                    <p className="text-sm font-semibold leading-6 text-gray-900">
                                      {user.name}
                                    </p>
                                    <p className="mt-1 truncate text-xs leading-5 text-gray-500">
                                      {user.email}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex">
                                  <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end pe-3">
                                    <p className="text-xs leading-6 text-gray-900">
                                      {user.role?.name}
                                    </p>
                                    <p className="mt-1 text-xs leading-5 text-gray-500">
                                      Last seen{" "}
                                      <time dateTime="2023-01-23T13:23Z">
                                        {user?.last_seen}
                                      </time>
                                    </p>
                                  </div>
                                  {/* {userDetails.role !== "Participant" &&
                                                                    <div className='inline-flex items-center py-2 ps-3 border-s'>
                                                                        
                                                                            <button onClick={() => handleRemoveUser(user.id)} className='hover:text-red-500'><XMarkIcon className='h-4 w-4' /></button>
                                                                       

                                                                    </div>
                                                                     } */}
                                  {userDetails?.role?.name == "Editor" && (
                                    <div className="inline-flex items-center py-2 ps-3 border-s">
                                      <button
                                        onClick={() =>
                                          handleRemoveUser(user.id)
                                        }
                                        className="hover:text-red-500"
                                      >
                                        <XMarkIcon className="h-4 w-4" />
                                      </button>
                                    </div>
                                  )}
                                  {userDetails?.role?.name == "Admin" && (
                                    <div className="inline-flex items-center py-2 ps-3 border-s">
                                      <button
                                        onClick={() =>
                                          handleRemoveUser(user.id)
                                        }
                                        className="hover:text-red-500"
                                      >
                                        <XMarkIcon className="h-4 w-4" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </li>
                            ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer  */}
                <div className="bg-gray-50 h-fit  rounded-b-lg ms-auto px-4 py-3 flex justify-end items-center sm:px-6 space-x-3">
                  {/* <button
                                        type="button"
                                        // onClick={updateResume}
                                        className="h-10  rounded-md disabled:bg-opacity-40 bg-blue-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                                    >
                                        Yes
                                    </button> */}

                  <button
                    onClick={handleClose}
                    type="button"
                    className=" w-20 h-10  justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                  >
                    Cancel
                  </button>

                  {/* <button onClick={() => handleSave()} type="button" className="h-10 w-full justify-center rounded-md bg-sky-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 sm:ml-3 sm:w-auto">Save</button>
                                    <button onClick={() => handleClose()} type="button" className="mt-3 h-10 w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto">Cancel</button> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div
          className="relative  z-30"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="fixed  inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

          <div className="fixed h-full  inset-0  z-30 w-screen overflow-y-auto">
            <div className="flex min-h-full h-full w-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative lg:min-w-96 w-full sm:w-1/3   transform flex-col justify-evenly rounded-lg bg-white text-left shadow-xl ">
                {/* Header  */}
                <div className="border-b  rounded-t-lg bg-gray-50 flex justify-between px-5 py-4">
                  <div className="flex items-center space-x-3">
                    {/* <img src={Alert} className="w-12 h-12" /> */}
                    <h3
                      className="font-bold text-xl text-gray-900"
                      id="modal-title"
                    >
                      Confirm
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setRowToUpdate(null);
                    }}
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                {/* Body  */}
                <div className="h-5/6 px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start h-5/6 ">
                    <div className="mt-3 text-center  h-full w-full sm:ml-4 sm:mt-0 sm:text-left">
                      <div className="col-span-full">
                        <div className=" min-w-fit p-10">
                          <label
                            for=""
                            class="block text-base font-medium leading-6 text-gray-900"
                          >
                            Are you sure you want to delete 
                            {rowToUpdate?.getData()?.title}?
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer  */}
                <div className="bg-gray-50  rounded-b-lg  px-4 py-3 flex justify-end items-center sm:px-6 space-x-3">
                  <button
                    type="button"
                    // disabled={deleting}
                    onClick={() => {
                      setShowDeleteModal(false);
                      handleDeleteJob(rowToUpdate?.getData()?.id,rowToUpdate);
                    }}
                    className="h-10  rounded-md disabled:bg-opacity-40 bg-red-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                  >
                    <i class="fa-solid fa-trash-can me-2"></i>
                    Delete
                  </button>

                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setRowToUpdate(null);
                    }}
                    type="button"
                    className=" w-20 h-10  justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
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

export default JobList;
