import { useCallback, useContext, useEffect, useRef } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../context/AuthContext";

import { XMarkIcon } from "@heroicons/react/20/solid";
import Alert from "../../assets/warning.png";
import Table from "../../utils/tables/Table";
import SpinLoader from "../../utils/loaders/SpinLoader";
import { ToastContainer } from "react-toastify";
import ReactSelect from "react-select";
import { selectStyle } from "../../constants/constants";
import Select, { components } from "react-select";
import DefaultAvatar from "../../assets/user-gray.png";

import {
  ArrowUpRightIcon,
  PlusIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import PredesignedTests from "./PredesignedTests.js";

import AssignModal from "./AssignModal.js";

const Tests = () => {
  const [tableRowCount, setTableRowCount] = useState("fetching");
  const [currentTab, setCurrentTab] = useState("pre-built-assessments");

  const debounceTimeout1 = useRef(null);
  const [cellContextMenu, setCellContextMenu] = useState([]);
  const { isSuperUser, authTokens, userDetails } = useContext(AuthContext);
  const [error, setError] = useState({});
  const navigate = useNavigate();
  const [tableInstance, setTableInstance] = useState(null);

  const [tests, setTests] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [loadingTests, setLoadingTests] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showPreBuiltAssessmentModal, setShowPreBuiltAssessmentModal] =
    useState(false);
  const [redirectToTestCreation, setRedirectToTestCreation] = useState(true);

  // Test Model useState
  const [shareModal, setShareModal] = useState(false);
  const [TestSelected, setTestSelected] = useState([]);

  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [rowToPublish, setRowToPublish] = useState(null);
  const [prebuiltAssessmentSelected, setPrebuiltAssessmentSelected] = useState(
    []
  );

  const [assessmentToShare, setAssessmentToShare] = useState(null);
  const [users, setUsers] = useState(null);
  const [usersSharedWith, setUsersSharedWith] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // const [testPublished, setTestPublished] = useState(false);
  // End

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);
  const [rowToShare, setRowToShare] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const testType = [
    { value: "apptitude", label: "Apptitude" },
    // { value: "sql", label: "SQL" },
  ];
  const difficultyType = [
    { value: 1, label: "Beginner" },
    { value: 2, label: "Medium" },
    { value: 3, label: "Hard" },
  ];
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const [domains, setDomains] = useState([]);
  const [selectedDomains, setSelectedDomains] = useState([]);
  const [loadingDomains, setLoadingDomains] = useState(false);

  const [selectedTestType, setSelectedTestType] = useState(testType[0]);
  const [assigningTest, setAssigningTest] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState(
    difficultyType[0]
  );

  const [testData, setTestData] = useState({
    title: "",
    description: "",
    type: "apptitude",
    difficulty: null,
    category: null,
  });

  useEffect(() => {
    // Define the default context menu options
    const defaultContextMenu = [
      {
        label: "Edit",
        action: function (e, cell) {
          let test = cell.getRow().getData();
          if (test?.is_published) {
            navigate(`/app/user/tests/test/${test.id}/`);
          }
        },
      },
      {
        label: "Publish",
        action: function (e, cell) {
          // let test = cell.getRow().getData();
          setShowPublishModal(true);
          setRowToPublish(cell.getRow());
        },
      },
      {
        label: "Share",
        action: function (e, cell) {
          // let test = cell.getRow().getData();
          setShowShareModal(true);
          // setRowToPublish(cell.getRow())
        },
      },

      {
        label: "Delete",
        action: function (e, cell) {
          let test = cell.getRow().getData();
          setRowToDelete(cell.getRow());
          setShowDeleteModal(true);
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
    setCellContextMenu(defaultContextMenu);
  }, [userDetails]);

  useEffect(() => {
    if (selectedDomains?.length) {
      fetchCategories();
    }
  }, [selectedDomains]);

  useEffect(() => {
    fetchTests();
  }, []);

  const handleShareJob = async (assessment, userDetails) => {
    //console.log("assessment : ", assessment)
    setShowShareModal(true);
    setAssessmentToShare(assessment);

    // Get user data and avatar of users with whom the assessment is shared
    const { usersData } = await fetchUsers(assessment);
    if (usersData && usersData.length > 0) {
      setUsers(usersData);

      const usersSharedWithIds = assessment.users_shared_with;

      // set users with whom the assessment is already shared
      const userSharedWithData = usersData
        .filter(
          (user) =>
            parseInt(user.id) !== parseInt(assessment.created_by.id) &&
            usersSharedWithIds.includes(parseInt(user.id))
        )
        .map((user, index) => {

          return {
            ...user,
            label: user.name,
            value: user.id,
            avatar: user.profile_pic ? user.profile_pic : DefaultAvatar,
          };
        });
      //console.log("userSharedWithData : ", userSharedWithData)
      setUsersSharedWith(userSharedWithData);

      // set users with whom the assessment is not shared yet
      const usersNotSharedWithData = usersData
        .filter(
          (user) =>
            parseInt(user.id) !== parseInt(assessment.created_by.id) &&
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

  const fetchUsers = async (assessment) => {
    //console.log("Fetching users");
    try {
      setUsersLoading(true);
      const response = await fetch(
        `/accounts/organizations/${userDetails?.org?.org_id}/users/`,
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
      //console.log("Users data: ", data);

      const usersSharedWithIds = assessment.users_shared_with;


      setUsersLoading(false);
      return { usersData: data.results };
    } catch (error) {
      console.error(error);
      setError(error.message);
      setUsersLoading(false);
    }
  };

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

  const fetchDomains = async (name) => {
    try {
      let url = `/test/domains/`;
      if (name) {
        url += `?name=${name}`;
      }
      setLoadingDomains(true);
      const response = await fetch(url, {
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
      if (data) {
        setDomains(
          data?.results.map((domain) => ({
            value: domain.id,
            label: domain.name,
          }))
        );
      }

      setLoadingDomains(false);
    } catch (error) {
      setError(error);
      setLoadingDomains(false);
    }
  };

  const fetchCategories = async (name) => {
    try {
      let url = `/test/categories/`;
      if (selectedDomains) {
        const domainIds = selectedDomains
          .map((domain) => domain.value)
          .join(",");
        url += `?domain=[${domainIds}]`;
      }
      if (name) {
        if (selectedDomains) {
          url += `name=${name}`;
        } else {
          url += `?name=${name}`;
        }
      }
      setLoadingCategories(true);
      const response = await fetch(url, {
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
      if (data) {
        setCategories(
          data?.results.map((category) => ({
            value: category.id,
            label: category.name,
          }))
        );
      }

      setLoadingCategories(false);
    } catch (error) {
      setError(error);
      setLoadingCategories(false);
    }
  };

  const fetchTests = async () => {
    try {
      // // console.log("fetching tests");
      setLoadingTests(true);
      const response = await fetch(`/test/list/`, {
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
      if (data) {
        setTests(data?.results);
        setFilteredTests(data?.results);
        // const test = data.results
        //   .map((tests) => ({
        //     value: tests.id,
        //     label: tests.title, // Corrected 'lable' to 'label'
        //   }));
        // setTestOptions(test);
      }

      setLoadingTests(false);
    } catch (error) {
      setError(error);
      setLoadingTests(false);
    }
  };

  async function createTest(e) {
    e.preventDefault();
    // Replace 'http://example.com/api/interviews/' with your actual API endpoint
    const apiUrl = "/test/tests/";

    // Data to be sent in the POST request body
    const postData = {
      title: testData.name,
      created_by: userDetails.id,
      description: testData.description,
      type: selectedTestType.value,
      difficulty: selectedDifficulty.value,
      category: selectedCategories?.map((cat) => cat.value),
      domain: selectedDomains.map((dom) => dom.value),
    };

    // Headers to be included in the request
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + String(authTokens.access),
    };
    try {
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
        if (redirectToTestCreation) {
          setShowModal(false);
          navigate(`/app/user/tests/test/${data.id}/`);
        }
        setShowModal(false);
      }
    } catch (error) {
      setShowModal(false);
      console.error("Error creating interview module:", error);
    }
  }

  async function createPreBuiltAssessment(e) {
    e.preventDefault();
    // Replace 'http://example.com/api/interviews/' with your actual API endpoint
    const apiUrl = "/test/prebuiltassessments/";

    // Data to be sent in the POST request body
    const postData = {
      title: testData.name,
      created_by: userDetails.id,
      description: testData.description,
      type: selectedTestType.value,
      difficulty: selectedDifficulty.value,
      category: selectedCategories.map((cat) => cat.value),
      domain: selectedDomains.map((dom) => dom.value),
    };

    // Headers to be included in the request
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + String(authTokens.access),
    };
    try {
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
        if (redirectToTestCreation) {
          setShowModal(false);
          navigate(`/app/user/tests/prebuilt-assessment/${data.id}/`);
        }
        setShowModal(false);
      }
    } catch (error) {
      setShowModal(false);
      console.error("Error creating interview module:", error);
    }
  }
  // Test Share

  const openTestModal = async () => {
    setShowModal(true);
    fetchDomains();
  };

  const openPreBuiltAssessmentModal = async () => {
    setShowPreBuiltAssessmentModal(true);
    fetchDomains();
  };

  const openShareModal = async () => {
    setShareModal(true);
    // fetchApplicants();
  };

  const handleCategoryInputChange = (newValue, actionMeta) => {
    if (actionMeta.action === "input-change") {
      debounce(fetchCategories(newValue), 500);
    }
  };

  const handleShareModalClose = () => {
    setAssessmentToShare(null);
    setShowShareModal(false);
    setUsersSharedWith([]);
  };

  const handleClose = () => {
    setTestData({});
    setRowToShare(null)
    setShowPreBuiltAssessmentModal(false);
    setShowModal(false);
    setShareModal(false);
    setSelectedCategories(null);
    setSelectedDifficulty(null);
    setSelectedDomains(null);
    setTestSelected(null);

    setPrebuiltAssessmentSelected(null);
    // setSelectedTestType(null)
  };

  const columns = [
    {
      title: "Title",
      field: "title",
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
      formatter: function (cell) {
        return `<label class="font-medium text-sky-800">${cell.getValue()}</label>`;
      },
      headerPopup: headerPopupFormatter,
      cellClick: function (e, cell) {
        const testId = cell.getData().id;
        navigate(`/app/user/tests/test/${testId}/view/`);
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
    {
      title: "Total Questions",
      field: "total_question",
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
      headerPopup: headerPopupFormatter,
      headerPopupIcon: `<i class='fa-solid fa-filter column-filter-icon' title='Filter'></i>`,
      headerFilter: emptyHeaderFilter,
      headerFilterFunc: "like",
    },
    {
      title: "Duration",
      field: "time_duration_in_minutes",
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
      headerPopup: headerPopupFormatter,
      headerPopupIcon: `<i class='fa-solid fa-filter column-filter-icon' title='Filter'></i>`,
      headerFilter: emptyHeaderFilter,
      headerFilterFunc: "like",
      formatter: function (cell) {
        return `<label class="">${parseFloat(cell.getValue() || 0).toFixed(
          2
        )} minutes</label>`;
      },
    },

    {
      title: "Created By",
      field: "created_by",
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
      headerPopup: headerPopupFormatter,
      formatter: ownerFormatter,
      headerPopupIcon: `<i class='fa-solid fa-filter column-filter-icon' title='Filter'></i>`,
      headerFilter: emptyHeaderFilter,
      headerFilterFunc: "like",
    },
    {
      title: "Published",
      field: "is_published",
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
      headerPopup: headerPopupFormatter,
      formatter: function (cell) {
        const isPublished = cell.getValue();
        let badgeClass = isPublished
          ? "bg-green-50 text-green-700 ring-green-600/10"
          : "bg-red-50 text-red-700 ring-red-600/20";
        let text = isPublished ? "Published" : "Not Published"; // Change "Not Published" to whatever you want

        return `<span class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium  ring-1 ring-inset ${badgeClass}">${text}</span>`;
      },
      headerPopupIcon: `<i class='fa-solid fa-filter column-filter-icon' title='Filter'></i>`,
      headerFilter: emptyHeaderFilter,
      headerFilterFunc: "like",
    },
    {
      title: "Action",
      minWidth: 80,
      maxWidth: 120,
      field: "Action",
      headerSort: false,
      clickMenu: function (e, cell) {
        const test = cell?.getRow()?.getData();

        let menu = [
          {
            label: "Edit",
            action: function (e, cell) {
              navigate(`/app/user/tests/test/${test.id}/`);
            },
          },
          {
            label: "Publish",
            action: function (e, cell) {
              setShowPublishModal(true);
              setRowToPublish(cell.getRow());
            },
          },
          {
            label: "Share",
            action: function (e, cell) {
              // setShowShareModal(true);
              setRowToShare(cell.getRow())
              console.log(cell.getRow().getData())
              handleShareJob(cell.getRow().getData())
            },
          },
          {
            label: "Delete",
            action: function (e, cell) {
              setRowToDelete(cell.getRow());
              setShowDeleteModal(true);
            },
          },
        ];

        // Remove "Edit" option if the test is published
        if (test.is_published) {
          menu = menu.filter((option) => option.label !== "Edit");
        }
        
        if (test.created_by?.id != userDetails?.id) {
          menu = menu.filter((option) =>  option.label !== "Delete" && option.label !== "Publish" && option.label !== "Edit");
        }

        return menu;
      },
      formatter: customMenuFormatter,
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
      headerFilterFunc: "like",
    },
    // Add more columns as needed
  ];

  const handleSelectedOption = async (selectedOption) => {
    if (selectedOption) {
      console.log(selectedOption)
      
      const updatedIds = selectedOption.map((user) => user.id);

      setUsersSharedWith(selectedOption);


      if (updatedIds.length > 0) {
        updateUserSharedWith(updatedIds);
      }
    }
  };

  const updateUserSharedWith = async (ids) => {
    //console.log("updating sharedwithIds : ", ids)

    try {
      const response = await fetch(`/test/tests/${assessmentToShare?.id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + String(authTokens.access),
        },
        body: JSON.stringify({ users_shared_with: ids }),
      });

      const data = await response.json();

      if (response.ok && data) {
        rowToShare?.update({"users_shared_with" : data.users_shared_with})
        //console.log("successfully updated users_shared_with", data)
      } else {
        console.error("error occured");
      }
    } catch (error) {
      console.error("error occured", error);
    }
  };

  const handleRemoveUser = (userId) => {
    // Remove user from usersSharedWith array
    const updatedArray = usersSharedWith.filter(
      (user) => parseInt(user.id) !== parseInt(userId)
    );
    const updatedIds = updatedArray.map((user) => user.id);
    setUsersSharedWith(updatedArray);
    //console.log("removing user")
    updateUserSharedWith(updatedIds);

    // Find the job object to update
    // const updatedJobs = jobs.map((job) => {
    //   if (parseInt(job.id) === parseInt(jobToShare.id)) {
    //     // Update the users_shared_with property
    //     //console.log("------", job)
    //     return { ...job, users_shared_with: updatedIds };
    //   }

    //   return job;
    // });

    // Update the jobs state
    // setJobs(updatedJobs);

    // Update the filteredJobs state
    // setFilteredJobs(updatedJobs);
  };

  async function handleTestAction(testId, action, payload) {
    const apiUrl = `/test/tests/${testId}/`;
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + String(authTokens.access),
    };
    try {
      const response = await fetch(apiUrl, {
        method: "PATCH",
        headers: headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      // console.log(data)
      if (data?.is_published && action == "publish") {
        // close the publish modal
        // update the table data and show test as published
        // reset row to publish
        rowToPublish.update({ is_published: true });
        setRowToPublish(null);
        setShowPublishModal(false);
      }

      if (data?.is_deleted && action == "delete") {
        // close the delete modal
        // delete the row from the table
        // reset row to delete
        rowToDelete.delete();
        setDeleting(false);
        setShowDeleteModal(false);
      }
    } catch (error) {
      setDeleting(false);
      setShowDeleteModal(false);
      console.error("Error updateing test module:", error);
    }
  }
  function ownerFormatter(cell, formatterParams, onRendered) {
    return `${cell.getValue().name}`;
  }

  function headerPopupFormatter(e, column, onRendered) {
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
  }

  function customMenuFormatter(cell, formatterParams, onRendered) {
    // Assuming job is a property of the row data
    var job = cell.getRow().getData();

    return `<i class='fa-solid fa-ellipsis-vertical text-slate-500'></i> `;
  }

  //create dummy header filter to allow popup to filter
  function emptyHeaderFilter() {
    return document.createElement("div");
  }

  function jobFormatter(cell) {
    const job = cell.getValue();
    return job?.title || "";
  }

  // Test Model React-Select style
  const customStyles = {
    control: (provided) => ({
      ...provided,
      width: "300px",
    }),
  };

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

  return (
    <>
      {/* <Heading /> */}
      <div id="testList" className="w-full h-full  job-list">
        {/* Header Section  */}
        <div className="mb-3">
          <div className="md:flex p-3 pt-5 items-center justify-between mt-2 md:mt-0 lg:px-4 px-2 py-2  border-b ">
            <div className="flex justify-between mb-2 md:mb-0">
              <h2 className="text-xl font-semibold md:mb-0 mb-2">
                Assessments
              </h2>
              {/* <p className='text-xs text-gray-500'>Create job openings </p> */}
              <span className="sm:hidden">
                <button
                  onClick={() => openTestModal()}
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
                  onClick={() =>
                    navigate(`/app/user/${`assigned-assessments`}/${3}/`)
                  }
                  type="button"
                  className="add-job-btn inline-flex truncate justify-center items-center text-blue-600 px-3 py-2 text-sm font-medium "
                >
                  <ArrowUpRightIcon
                    className="me-1.5 h-4 w-4 text-blue-600"
                    aria-hidden="true"
                  />
                  Go to Assigned Assessments
                </button>
                {/* )} */}
              </span>
              <span className="hidden sm:flex">
                {isSuperUser && (
                  <button
                    onClick={() => openPreBuiltAssessmentModal()}
                    type="button"
                    className="add-job-btn inline-flex truncate justify-center items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-normal text-white shadow-sm  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 "
                  >
                    <PlusIcon className="me-1.5 h-4 w-4" aria-hidden="true" />
                    Create Pre-built Assessment
                  </button>
                )}
              </span>

              <span className="hidden sm:flex">
                <button
                  onClick={() => openTestModal()}
                  type="button"
                  className="add-job-btn inline-flex truncate justify-center items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-normal text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 "
                >
                  <PlusIcon className="me-1.5 h-4 w-4" aria-hidden="true" />
                  Create
                </button>
              </span>
              <span className="hidden sm:flex">
                <button
                  onClick={() => openShareModal()}
                  type="button"
                  className="add-job-btn inline-flex truncate justify-center items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-normal text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 "
                >
                  <UserPlusIcon className="me-1.5 h-4 w-4" aria-hidden="true" />
                  Assign
                </button>
              </span>
            </div>
          </div>
          <div className="flex border-b justify-center md:justify-start w-full bg-white">
            <button
              onClick={() => {
                setCurrentTab("pre-built-assessments");
              }}
              className={` ${
                currentTab.toLowerCase() === "pre-built-assessments"
                  ? "text-[#3D73FD] border-b-4  border-[#3D73FD] font-semibold"
                  : "text-gray-800 "
              } bg-white  hover:text-sky-700 block  px-4 py-2 text-sm `}
            >
              Pre-Built Assessments
            </button>
            <button
              onClick={() => {
                setCurrentTab("owned-by-you");
              }}
              className={` ${
                currentTab.toLowerCase() === "owned-by-you"
                  ? "text-[#3D73FD] border-b-4  border-[#3D73FD] font-semibold"
                  : "text-gray-800 "
              } bg-white    hover:text-sky-700 block px-4 py-2 text-sm `}
            >
              Owned by you
            </button>
          </div>
        </div>

        {/* Test List  */}
        <div
          className="overflow-auto rounded-xl p-3"
          style={{ height: "calc(100dvh - 180px)" }}
        >
          {currentTab === "pre-built-assessments" && <PredesignedTests />}
          {currentTab === "owned-by-you" && (
            <>
              {filteredTests.length > 0 ? (
                <Table
                  url={`/test/list/`}
                  setTableInstance={setTableInstance}
                  data={filteredTests}
                  columns={columns}
                  setTableRowCount={setTableRowCount}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-center text-sm p-5 ">
                  {loadingTests ? (
                    <SpinLoader loadingText={"Fetching Tests"} fill={"blue"} />
                  ) : (
                    "No Tests found"
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <ToastContainer />

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
                    Create Test
                  </h3>
                  <button onClick={() => handleClose()}>
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                {/* Body  */}
                <div className="bg-white h-auto px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div class="p-4 md:p-5">
                    <form
                      id="create-test-form"
                      class="space-y-4"
                      onSubmit={createTest}
                    >
                      <div>
                        <label
                          htmlFor="name"
                          class="block mb-2 text-sm font-medium text-gray-900 "
                        >
                          Name
                        </label>
                        <input
                          required
                          onChange={(e) =>
                            setTestData({ ...testData, name: e.target.value })
                          }
                          value={testData.name}
                          type="text"
                          name="name"
                          id="name"
                          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                          placeholder="Research Analyst Test"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="description"
                          class="block mb-2 text-sm font-medium text-gray-900 "
                        >
                          Description
                        </label>
                        <input
                          onChange={(e) =>
                            setTestData({
                              ...testData,
                              description: e.target.value,
                            })
                          }
                          value={testData.description}
                          type="text"
                          name="description"
                          id="description"
                          placeholder="Workflow for Trainee Research Analysts..."
                          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="description"
                          class="block mb-2 text-sm font-medium text-gray-900 "
                        >
                          Type
                        </label>
                        <ReactSelect
                          className="text-sm md:w-1/2 min-w-fit"
                          placeholder="Select type of test"
                          styles={selectStyle}
                          value={selectedTestType}
                          onChange={(selectedOption) =>
                            setSelectedTestType(selectedOption)
                          }
                          options={testType}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="description"
                          class="block mb-2 text-sm font-medium text-gray-900 "
                        >
                          Difficulty
                        </label>
                        <ReactSelect
                          className="text-sm md:w-1/2 min-w-fit"
                          placeholder="Select difficulty"
                          styles={selectStyle}
                          value={selectedDifficulty}
                          onChange={(selectedOption) =>
                            setSelectedDifficulty(selectedOption)
                          }
                          options={difficultyType}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="description"
                          class="block mb-2 text-sm font-medium text-gray-900 "
                        >
                          Domain{" "}
                          <span className="px-1 text-xs font-light text-gray-400">
                            (optional)
                          </span>
                        </label>
                        <ReactSelect
                          className="text-sm md:w-1/2 min-w-fit"
                          placeholder="Pick a domain"
                          isMulti
                          isLoading={loadingDomains}
                          styles={selectStyle}
                          value={selectedDomains}
                          onChange={(selectedOption) =>
                            setSelectedDomains(selectedOption)
                          }
                          options={domains}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="description"
                          class="block mb-2 text-sm font-medium text-gray-900 "
                        >
                          Category{" "}
                          <span className="px-1 text-xs font-light text-gray-400">
                            (optional)
                          </span>
                        </label>
                        <ReactSelect
                          className="text-sm md:w-1/2 min-w-fit"
                          placeholder="Pick a category"
                          isMulti
                          onInputChange={handleCategoryInputChange}
                          isLoading={loadingCategories}
                          styles={selectStyle}
                          value={selectedCategories}
                          onChange={(selectedOption) =>
                            setSelectedCategories(selectedOption)
                          }
                          options={
                            selectedDomains && selectedDomains.length > 0
                              ? categories
                              : []
                          }
                        />
                      </div>
                      <div class="flex justify-between">
                        <div class="flex items-start">
                          <div class="flex items-center h-5">
                            <input
                              id="redirectToTestCreation"
                              type="checkbox"
                              checked={redirectToTestCreation}
                              onChange={() =>
                                setRedirectToTestCreation(
                                  !redirectToTestCreation
                                )
                              }
                              class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-600 dark:border-gray-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800"
                            />
                          </div>
                          <label
                            htmlFor="redirectToTestCreation"
                            class="ms-2 text-sm font-medium text-gray-600 "
                          >
                            Redirect to Assessment Builder
                          </label>
                        </div>
                        {/* <a href="#" class="text-sm text-blue-700 hover:underline dark:text-blue-500">Lost Password?</a> */}
                      </div>
                    </form>
                  </div>
                </div>

                {/* Footer  */}
                <div className="bg-gray-50 rounded-b-lg ms-auto px-4 py-3 flex justify-end sm:px-6 space-x-3">
                  <button
                    type="submit"
                    form="create-test-form"
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

      {showPreBuiltAssessmentModal && (
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
                    Create Pre-Built Assessment
                  </h3>
                  <button onClick={() => handleClose()}>
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                {/* Body  */}
                <div className="bg-white h-auto px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div class="p-4 md:p-5">
                    <form
                      id="create-prebuiltassessment-form"
                      class="space-y-4"
                      onSubmit={createPreBuiltAssessment}
                    >
                      <div>
                        <label
                          htmlFor="name"
                          class="block mb-2 text-sm font-medium text-gray-900 "
                        >
                          Name
                        </label>
                        <input
                          required
                          onChange={(e) =>
                            setTestData({ ...testData, name: e.target.value })
                          }
                          value={testData.name}
                          type="text"
                          name="name"
                          id="name"
                          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                          placeholder="Research Analyst Test"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="description"
                          class="block mb-2 text-sm font-medium text-gray-900 "
                        >
                          Description
                        </label>
                        <input
                          onChange={(e) =>
                            setTestData({
                              ...testData,
                              description: e.target.value,
                            })
                          }
                          value={testData.description}
                          type="text"
                          name="description"
                          id="description"
                          placeholder="Workflow for Trainee Research Analysts..."
                          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="description"
                          class="block mb-2 text-sm font-medium text-gray-900 "
                        >
                          Type
                        </label>
                        <ReactSelect
                          className="text-sm md:w-1/2 min-w-fit"
                          placeholder="Select type of test"
                          styles={selectStyle}
                          value={selectedTestType}
                          onChange={(selectedOption) =>
                            setSelectedTestType(selectedOption)
                          }
                          options={testType}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="description"
                          class="block mb-2 text-sm font-medium text-gray-900 "
                        >
                          Difficulty
                        </label>
                        <ReactSelect
                          className="text-sm md:w-1/2 min-w-fit"
                          placeholder="Select difficulty"
                          styles={selectStyle}
                          value={selectedDifficulty}
                          onChange={(selectedOption) =>
                            setSelectedDifficulty(selectedOption)
                          }
                          options={difficultyType}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="description"
                          class="block mb-2 text-sm font-medium text-gray-900 "
                        >
                          Domain{" "}
                          <span className="px-1 text-xs font-light text-gray-400">
                            (optional)
                          </span>
                        </label>
                        <ReactSelect
                          className="text-sm md:w-1/2 min-w-fit"
                          placeholder="Pick a domain"
                          isMulti
                          isLoading={loadingDomains}
                          styles={selectStyle}
                          value={selectedDomains}
                          onChange={(selectedOption) =>
                            setSelectedDomains(selectedOption)
                          }
                          options={domains}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="description"
                          class="block mb-2 text-sm font-medium text-gray-900 "
                        >
                          Category{" "}
                          <span className="px-1 text-xs font-light text-gray-400">
                            (optional)
                          </span>
                        </label>
                        <ReactSelect
                          className="text-sm md:w-1/2 min-w-fit"
                          placeholder="Pick a category"
                          isMulti
                          onInputChange={handleCategoryInputChange}
                          isLoading={loadingCategories}
                          styles={selectStyle}
                          value={selectedCategories}
                          onChange={(selectedOption) =>
                            setSelectedCategories(selectedOption)
                          }
                          options={
                            selectedDomains && selectedDomains.length > 0
                              ? categories
                              : []
                          }
                        />
                      </div>
                      <div class="flex justify-between">
                        <div class="flex items-start">
                          <div class="flex items-center h-5">
                            <input
                              id="redirectToTestCreation"
                              type="checkbox"
                              checked={redirectToTestCreation}
                              onChange={() =>
                                setRedirectToTestCreation(
                                  !redirectToTestCreation
                                )
                              }
                              class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-600 dark:border-gray-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800"
                            />
                          </div>
                          <label
                            htmlFor="redirectToTestCreation"
                            class="ms-2 text-sm font-medium text-gray-600 "
                          >
                            Redirect to Assessment Builder
                          </label>
                        </div>
                        {/* <a href="#" class="text-sm text-blue-700 hover:underline dark:text-blue-500">Lost Password?</a> */}
                      </div>
                    </form>
                  </div>
                </div>

                {/* Footer  */}
                <div className="bg-gray-50 rounded-b-lg ms-auto px-4 py-3 flex justify-end sm:px-6 space-x-3">
                  <button
                    type="submit"
                    form="create-prebuiltassessment-form"
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
              <div className="relative lg:min-w-96 w-full sm:w-1/3  transform flex-col justify-evenly rounded-lg bg-white text-left shadow-xl transition-all my-8">
                {/* Header  */}
                <div className="border-b  rounded-t-lg bg-gray-50 flex justify-between px-5 py-4">
                  <div className="flex items-center space-x-3">
                    <img src={Alert} className="w-12 h-12" />
                    <h3
                      className="font-bold text-xl text-gray-900"
                      id="modal-title"
                    >
                      Confirm
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      setRowToDelete(null);
                      setShowDeleteModal(false);
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
                        <div className="mb-5 min-w-fit">
                          <label
                            for=""
                            class="block text-sm font-medium leading-6 text-gray-900"
                          >
                            Are you sure you want to delete
                            {rowToDelete._row.data.name} assessment?
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer  */}
                <div className="bg-gray-50  rounded-b-lg ms-auto px-4 py-3 flex justify-end items-center sm:px-6 space-x-3">
                  <button
                    type="button"
                    disabled={deleting}
                    onClick={() => {
                      handleTestAction(rowToDelete.getData().id, "delete", {
                        is_deleted: true,
                      });
                    }}
                    className="h-10  rounded-md disabled:bg-opacity-40 bg-red-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                  >
                    <i class="fa-solid fa-trash-can me-2"></i>
                    {deleting ? "Deleting" : "Delete"}
                  </button>

                  <button
                    onClick={() => {
                      setRowToDelete(null);
                      setShowDeleteModal(false);
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

      {shareModal && <AssignModal handleClose={handleClose} />}

      {showPublishModal && (
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
                style={{ minWidth: "25%" }}
                className="relative  h-auto transform flex-col justify-evenly rounded-lg bg-white text-left shadow-xl transition-all my-8"
              >
                {/* Header  */}
                <div className="border-b rounded-t-lg bg-gray-50 flex justify-between py-2 px-3">
                  <h3
                    className="text-base p-4 font-semibold leading-6 text-gray-900"
                    id="modal-title"
                  >
                    Confirm
                  </h3>
                  <button
                    onClick={() => {
                      setShowPublishModal(false);
                      setRowToPublish(null);
                    }}
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                {/* Body  */}
                <div className="bg-white h-auto px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div className="p-4 md:p-5">
                    <div>
                      <label
                        htmlFor="name"
                        className="block mb-2 text-center text-sm font-medium text-gray-900 "
                      >
                        The assessment can not be edited once it is published.
                        Do you wish to publish the assessment?
                      </label>
                    </div>
                  </div>
                </div>

                {/* Footer  */}
                <div className="bg-gray-50 rounded-b-lg ms-auto px-4 py-3 flex justify-end sm:px-6 space-x-3">
                  <button
                    onClick={() => {
                      handleTestAction(rowToPublish.getData().id, "publish", {
                        is_published: true,
                      });
                    }}
                    className="h-10 flex bg-brand-purple items-center justify-center rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto"
                  >
                    <span>Confirm</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowPublishModal(false);
                      setRowToPublish(null);
                    }}
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
                      Share Assessment
                    </h3>
                  </div>
                  <button onClick={handleShareModalClose}>
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>

                {/* Body  */}
                <div className="bg-white h-5/6 px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
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
                            isDisabled={userDetails.role === "Participant" || usersLoading}
                            // defaultValue={}
                          />
                        </div>
                      </div>

                      <div>
                        <ul
                          role="list"
                          className="divide-y divide-gray-100 h-5/6 overflow-auto px-2"
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
                                  {userDetails.role == "Editor" && (
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
                                  {userDetails.role == "Admin" && (
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
                    onClick={handleShareModalClose}
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
    </>
  );
};

export default Tests;
