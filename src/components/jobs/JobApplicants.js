import React, { useContext, useEffect, useState } from "react";
import AuthContext from "../../context/AuthContext";
import { useParams } from "react-router-dom";
import ApplicantList from "../../utils/list/ApplicantList";
import Switch from "../../utils/swtiches/Switch";
import Select from "react-select";
import { PhotoIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { logFeature } from "../../constants/constants";

const JobApplicants = () => {
  const [tableInstance, setTableInstance] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [debounceTimeout, setDebounceTimeout] = useState(null);
  const [filterSearchTerm, setFilterSearchTerm] = useState({});

  const [applicants, setApplicants] = useState([]);
  const [totalApplicants, setTotalApplicants] = useState(null);
  const [filteredApplicants, setFilteredApplicants] = useState([]);

  const [error, setError] = useState({});
  const [showFilter, setShowFilter] = useState(false);
  const [checked, setChecked] = useState(false);

  const { authTokens, userDetails, user } = useContext(AuthContext);
  const { jobId } = useParams();
  const [jobDetail, setJobDetail] = useState([]);

  const [selectedFilterGroup, setSelectedFilterGroup] = useState(null);
  const [filterGroups, setFilterGroups] = useState([]);
  const [filterGroupList, setFilterGroupList] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [applicantsLoading, setApplicantsLoading] = useState(true);
  const [jobLoading, setJobLoading] = useState(true);
  const [filterGroupLoading, setFilterGroupLoading] = useState(true);

  const [selectedFilterGroupError, setSelectedFilterGroupError] = useState(null)
  const [tableRowCount, setTableRowCount] = useState("fetching")

  const [candidateFormData, setCandidateFormData] = useState({
    name: "",
    email: "",
    location: {
      city: "",
      state: "",
    },
    linkedin: "",
  });

  const [candidateToEdit, setCandidateToEdit] = useState(null);

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
    // fetchApplicants()
    fetchFilterGroups();
    fetchJob();
  }, []);

  // useEffect(() => {

  //   if (checked && tableInstance) {

  //     tableInstance.setSort([{ column: "score", dir: "desc" }]);
  //   } else {
  //     if (tableInstance) {
  //       tableInstance.setSort({ column: "created_at", dir: "desc" });
  //     }

  //   }

  // }, [checked]);


  const fetchCandidates = async () => {
    try {
      //console.log("fetching ")
      const response = await fetch(`/candidates/filter/?name=${searchTerm}`);
      if (!response.ok) {
        throw new Error("Failed to fetch candidates");
      }
      const data = await response.json();
      //console.log(data)
      setApplicants(data.results);
      tableInstance.setData(data.results);
    } catch (error) {
      console.error("Error fetching candidates:", error);
    }
  };

  const handleSearch = (fieldName, searchValue) => {
    setSearchTerm(searchValue);
    const newSearch = { ...filterSearchTerm };
    newSearch[fieldName] = searchValue;
    setFilterSearchTerm(newSearch);

    if (!searchValue) {
      tableInstance.setData();
    }
  };

  const fetchJob = async () => {
    //console.log("fetching dataset")
    try {
      setJobLoading(true);
      const response = await fetch(`/jobs/job-detail/${jobId}/`, {
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
      // setDescription(data.description?.replace(/\n/g, '<br>'))
      //console.log("job : ", data)
      setJobDetail(data);
      // getListData(data)
      setJobLoading(false);
    } catch (error) {
      setJobLoading(false);
      setError(error);
    }
  };

  const fetchApplicants = async () => {
    try {
      setApplicantsLoading(true);
      const response = await fetch(`/candidates/candidates-for-job/${jobId}/`, {
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
      const formatted_applicants = data.results.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      //console.log("applicants : ", formatted_applicants)
      setTotalApplicants(data.count);
      setApplicants(formatted_applicants);

      setFilteredApplicants(formatted_applicants);
      // getListData(data)
      setApplicantsLoading(false);
    } catch (error) {
      setApplicantsLoading(false);
      setError(error);
    }
  };

  const fetchFilterGroups = async () => {
    //console.log("fetching dataset")
    try {
      setFilterGroupLoading(true);
      const response = await fetch(`/jobs/filter-group/`, {
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
      setFilterGroups(data?.results || []);
      setFilterGroupList(
        data?.results?.map((group) => ({ label: group.name, value: group.id }))
      );
      // getListData(data)
      setFilterGroupLoading(false);
    } catch (error) {
      setFilterGroupLoading(false);
      setError(error);
    }
  };

  const onGroupChange = (selectedOption) => {
    if (selectedOption) {
      setSelectedFilterGroup(selectedOption);
    } else {
      setShowFilter(false);
      tableInstance.setFilterModel(null);
      setSelectedFilterGroup(null);
      // setFilteredApplicants(applicants);
    }
  };

  const applyFilterGroup = () => {
    let selectedGroupObj;

    if (selectedFilterGroup) {
      selectedGroupObj = filterGroups.find(group => group.id === selectedFilterGroup.value)
      // console.log(selectedFilterGroup, selectedGroupObj);
      const filterModel = {
        // Key is the column ID, value is the filter model
        'location.city': {
          type: 'text',
          // filter: ['Pune', 'Mumbai'] // Text filter for 'make' column
          filter: selectedGroupObj?.location?.city?.map((city) => city?.label)
        },
        'location.state': {
          type: 'text',
          // filter: ['Pune', 'Mumbai'] // Text filter for 'make' column
          filter: selectedGroupObj?.location?.state?.map((state) => state?.label)
        },
        'skills': {
          type: 'text',
          filter: selectedGroupObj?.skills?.map((state) => state?.label)
        },
        'relevant_experience_in_months': formatExperience(selectedGroupObj?.work_experience),
      }



      tableInstance.setFilterModel(filterModel);
    } else {
      setSelectedFilterGroupError(true);
    }

  }

  function formatExperience(workExp) {
    if (workExp.value) {
      if (workExp.operator === "=") {
        return {
          filterType: 'number',
          type: 'equal',
          filter: parseInt(workExp?.value)
        }
      }
      else if (workExp.operator === "<=") {
        return {
          filterType: 'number',
          type: 'lessThan',
          filter: parseInt(workExp?.value)
        }
      }
      else if (workExp.operator === ">=") {
        return {
          filterType: 'number',
          type: 'greaterThan',
          filter: parseInt(workExp?.value)
        }
      }
    }
  }

  const handleInputChange = (e) => {
    if (e.target.name === "city" || e.target.name === "state") {
      setCandidateFormData({
        ...candidateFormData,
        location: {
          ...candidateFormData.location,
          [e.target.name]: e.target.value,
        },
      });
    } else {
      setCandidateFormData({
        ...candidateFormData,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const check_email_exists = async () => {
    try {
      const response = await fetch(
        `/candidates/check-email/${jobDetail.id}/${candidateFormData.email}/`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // Authorization: "Bearer " + String(authTokens.access),
          },
        }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      //console.log(data)
      return data;
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    try {
      if (selectedFile && jobId) {
        const array = [];
        array.push();
        const formData = new FormData();
        formData.append("name", candidateFormData.name);
        formData.append("email", candidateFormData.email);
        formData.append("location", JSON.stringify(candidateFormData.location));
        formData.append("linkedin", candidateFormData.linkedin);
        formData.append("file", selectedFile);
        formData.append("job_key", jobDetail.encrypted);

        const data = await check_email_exists(
          jobDetail.id,
          candidateFormData.email
        );

        if (!data.exists) {
          const response = await fetch("/candidates/candidate/", {
            method: "POST",

            body: formData,
          });

          if (response.ok) {
            await logFeature(jobDetail?.organization?.id, 1);
            setIsSubmitted(true);
            setCandidateFormData({
              name: "",
              email: "",
              location: {
                city: "",
                state: "",
              },
              linkedin: "",
              github: ""
            });
          } else {
            console.error("File upload failed");
          }
        } else {
          setShowAlertModal(true);
          //console.log("exists")
          setCandidateToEdit(data);
          setError("You have already applied to this job");
        }
      } else {
        const err = {};
        if (!jobId) {
          err.job = "Unable to fetch job details. Please try again later";
        }
        if (!selectedFile) {
          err.selectedFile = "Please upload your resume";
        }
        setError(err);
      }
    } catch (error) {
      setError(error);
      console.error("Error uploading file:", error);
    }
  };

  const updateResume = async () => {
    try {
      if (selectedFile && candidateFormData.name && candidateFormData.email) {
        //console.log(candidateToEdit.applied_job, candidateToEdit.resume)
        const formData = new FormData();
        formData.append("name", candidateFormData.name);
        formData.append("email", candidateFormData.email);
        formData.append("location", JSON.stringify(candidateFormData.location));
        formData.append("linkedin", candidateFormData.linkedin);
        formData.append("file", selectedFile);
        formData.append("applied_job", candidateToEdit.applied_jobs);
        // formData.append('resume', candidateToEdit.resumes?.find(resume => ));

        const response = await fetch(
          `/candidates/candidate/${candidateToEdit.id}/`,
          {
            method: "PUT",
            body: formData,
          }
        );

        if (response.ok) {
          setShowAlertModal(false);
          setIsSubmitted(true);
          setCandidateFormData({
            name: "",
            email: "",
            location: {
              city: "",
              state: "",
            },
            linkedin: "",
          });
          //console.log('File uploaded successfully');
        } else {
          console.error("Update failed");
        }
      }
    } catch (error) {
      setError(error);
      console.error("Error uploading file:", error);
    }
  };

  function handleClose() {
    setShowModal(false);
    setIsSubmitted(false);
    setSelectedFile(null);
    setCandidateFormData({
      name: "",
      email: "",
      location: {
        city: "",
        state: "",
      },
      linkedin: "",
    });
  }

  // const handleShortList = async (grid) => {
  //   const candidate = grid.data;
  //   //console.log("candidate row ", grid)
  //   //console.log("candidate ", candidate)

  //   try {
  //     const response = await fetch("/interview/shortlist-candidate/", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: "Bearer " + String(authTokens.access),
  //       },
  //       body: JSON.stringify({
  //         candidate_id: candidate.id,
  //         job_id: jobId,
  //         module_id: candidate.interview_module,
  //         service: "Resume Screening",
  //       }),
  //     });
  //     const data = await response.json();
  //     if (response.ok) {
  //       console.log("successfully updated : ", data?.candidate.interview_steps);
  //       if (data) {
  //         // grid.update(data.candidate);
  //         const rowNode = grid?.api.getRowNode(grid?.node.id);
  //         rowNode.setDataValue(
  //           "interview_steps",
  //           data?.candidate.interview_steps
  //         );
  //       }
  //       // setMessage(data.message);
  //     } else {
  //       setError(data.error);
  //     }
  //   } catch (error) {
  //     console.error("Error completing resume screening:", error);
  //     setError("An error occurred while completing resume screening.");
  //   }
  // };

  // const handleUnshortList = async (statusText, stepId, grid) => {
  //   const candidate = grid?.data;
  //   //console.log("candidate row ", grid)
  //   //console.log("candidate ", candidate)

  //   try {
  //     const response = await fetch("/interview/unshortlist-candidate/", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: "Bearer " + String(authTokens.access),
  //       },
  //       body: JSON.stringify({
  //         status: statusText,
  //         step_id: stepId,
  //         candidate_id: candidate.id,
  //         job_id: jobId,
  //         module_id: candidate.interview_module,
  //         service: "Resume Screening",
  //       }),
  //     });
  //     const data = await response.json();
  //     if (response.ok) {
  //       //console.log("successfully updated : ", data)
  //       if (data) {
  //         const rowNode = grid?.api.getRowNode(grid?.node.id);
  //         rowNode.setDataValue(
  //           "interview_steps",
  //           data?.candidate.interview_steps
  //         );
  //       }
  //       // setMessage(data.message);
  //     } else {
  //       setError(data.error);
  //     }
  //   } catch (error) {
  //     console.error("Error completing resume screening:", error);
  //     setError("An error occurred while completing resume screening.");
  //   }
  // };

  const updateStatus = async (statusText,rowData,  row, body, subject, notifyCandidate) => {
    console.log("statusText : ", userDetails, statusText, subject,body, notifyCandidate)
    // console.log("row : ", row)
    // const rowData = grid?.data?.resumes && grid?.data?.resumes.length ? grid?.data?.resumes[0] : null;
    const resume = rowData?.resumes.length && rowData?.resumes[0]
    const payload = {
      status_text: statusText,
      updated_by: user.id,
      body: body,
      subject: subject,
      notify_candidate: notifyCandidate
    }


    // console.log("Payload for update status : ", payload)

    if (statusText === "Shortlisted") {
      payload["is_approved"] = true
      payload["approved_by"] = user.id
      payload["approved_at"] = new Date()
    }
    if (statusText === "Not Shortlisted") {
      payload["is_approved"] = false
      payload["approved_by"] = null
      payload["approved_at"] = null
    }

    // console.log(resume)

    if (resume) {
      row.update({ "resumes": [{ "status_text": "Updating" }] })
      try {
        const response = await fetch(`/resume_parser/resumes/${resume.id}/`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + String(authTokens.access),
          },
          body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (response.ok) {
          //console.log("successfully updated : ", data)
          if (data) {
            // console.log("row", row, data)
            // const rowNode = grid?.api.getRowNode(grid?.node.id);
            // tableInstance.updateRow(row, data)
            // const newRow = 
            row.update({ "resumes": [data] || [] })
            // rowNode.setDataValue(
            //   "resumes",
            //   [data]
            // );

            // console.log("rowNode : ", rowNode)
          }
          // setMessage(data.message);
        } else {
          setError(data.error);
        }
      } catch (error) {
        console.error("Error completing resume screening:", error);
        setError("An error occurred while completing resume screening.");
      }
    }
  };

  // const handleSubmit = (event) => {
  //     event.preventDefault();
  //     const feedbackData = {
  //         interview_step: interviewStep,
  //         candidate,
  //         user,
  //         feedback,
  //         rating: rating || null,
  //         status,
  //         anonymous
  //     };

  //     const request = feedbackId
  //         ? axios.put(`/api/interview-step-feedback/${feedbackId}/`, feedbackData)
  //         : axios.post('/api/interview-step-feedback/', feedbackData);

  //     request.then(() => {
  //         onSubmitSuccess();
  //         setShowCommentBox(false);
  //     })
  //     .catch(error => console.error('Error saving feedback:', error));
  // };

  return (
    <>
      <div className="mt-5 h-5/6 w-full description-card bg-white p-4 md:p-5 rounded-3xl shadow-md">
        {/* Header Section  */}

        <div className="flex-col lg:flex lg:flex-row lg:items-center lg:justify-between p-0 md:p-2 mb-4 border-b ">
          <div className="flex justify-between ">
            <div className="w-4/6 md:w-auto mb-3 md:mb-0 text-left ">
              <div>
                <h2 className="text-xl font-semibold md:mb-0 mb-2">Applicants</h2>
                <p className=" text-sm text-gray-500">{tableRowCount === 0 ? "No Rows" : tableRowCount + " rows"}</p>
              </div>
              {/* <p className="block text-sm">
                Total Applicants - {totalApplicants || null}
              </p> */}
            </div>
            <div className="flex md:hidden">
              <div
                className=" text-gray-600 rounded-md flex  md:hidden flex-col  items-center md:mb-0  "
                title="AI Recommendation"
              >
                <Switch checked={checked} setChecked={setChecked} />
              </div>
              <div className=" text-gray-600 rounded-md  flex md:hidden items-start justify-center ">
                <button
                  onClick={() => setShowModal(true)}
                  type="button"
                  className={`inline-flex items-center rounded-md  px-3 py-2 text-sm font-medium text-white shadow-sm bg-primary-600 hover:bg-sky-500 focus-visible:outline-sky-500  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 `}
                >
                  <i className="fa-solid fa-file"></i>
                </button>
              </div>
            </div>
          </div>
          <div className="ms-auto flex-col lg:flex lg:flex-row lg:items-center lg:justify-between ">
            {/* <div className=" text-gray-600 rounded-md me-2 items-center md:mb-0 mb-2 hidden md:flex">
              <Switch checked={checked} setChecked={setChecked} />
              <label className="text-sm">AI Recommendation</label>
            </div> */}

            {/* <div className="me-4 ms-1 h-7 border hidden lg:flex "></div> */}

            <div className="flex-col lg:flex lg:flex-row justify-end items-center space-y-3 lg:space-y-0 space-x-3 mb-3 md:mb-0">
              {/* <div className=" text-gray-600 h-8 border flex justify-between rounded-md md:w-auto">
                                <input
                                    onChange={(e) => handleSearch('title', e.target.value)}
                                    type="search"
                                    name="search"
                                    placeholder="Search by Name"
                                    className="bg-white border-0 w-full md:w-56 px-2 md:px-5 text-sm focus:outline-none me-2"
                                />
                                <button className="text-end me-2">
                                    <i className="fa-solid fa-magnifying-glass"></i>
                                </button>
                            </div> */}
              {/* {userDetails && userDetails?.role !== "Participant" && (
                <div className=" text-gray-600 rounded-md me-2 items-end justify-end hidden md:flex">
                  <button
                    onClick={() => setShowModal(true)}
                    type="button"
                    className={`inline-flex items-center rounded-md  px-3 py-2 text-sm font-medium text-white shadow-sm btn-brand-teal    focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 `}
                  >
                    <i className="fa-solid fa-file me-2"></i>
                    Upload Resume
                  </button>
                </div>
              )} */}
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row space-x-3 mb-2 items-start  p-1">
          <div className="flex space-x-3 w-full md:w-auto items-center mb-3 mb:md-0 ">
            <Select
              className="w-5/6 md:w-56 text-xs"
              styles={selectStyle}
              // components={{ Option }}
              value={selectedFilterGroup}
              isClearable
              onChange={onGroupChange}
              options={filterGroupList}
              defaultValue={filterGroupList[0]}
              placeholder="Apply Filter Groups"
            />
            <button
              onClick={applyFilterGroup}
              className="w-16 h-9 px-3 inline-flex justify-center items-center rounded-md text-xs font-medium text-white shadow-sm bg-[#7C7AFC] hover:bg-sky-500 focus-visible:outline-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Apply
            </button>
          </div>
          <div className="w-full  flex items-start flex-wrap md:space-x-3">
            {selectedFilterGroup &&
              showFilter &&
              filterGroups.map((group, index) => {
                if (group.id === selectedFilterGroup.value) {
                  return (
                    <React.Fragment key={index}>
                      {group.location.length > 0 && (
                        <div className="bg-sky-50 flex items-center min-w-40  md:min-w-56 mb-2 md:mb-0 me-2 md:me-0 px-3 py-2 rounded-md  font-poppins text-xs">
                          <span className="me-2 text-gray-600">
                            Location{" "}
                            <i
                              style={{ fontSize: ".8em" }}
                              className="fa-solid fa-chevron-right me-1"
                            ></i>
                          </span>
                          <span className="me-1 text-sky-600 font-semibold">
                            {group.location.map((l) => l.label).join(", ")}
                          </span>
                        </div>
                      )}
                      {group.skills.length > 0 && (
                        <div className="bg-sky-50 flex items-center min-w-40  md:min-w-56 mb-2 md:mb-0 me-2 md:me-0 px-3 py-2 rounded-md  font-poppins text-xs">
                          <span className="me-2 text-gray-600">
                            Skills{" "}
                            <i
                              style={{ fontSize: ".8em" }}
                              className="fa-solid fa-chevron-right me-1"
                            ></i>
                          </span>
                          <span className="me-1 text-sky-600 font-semibold">
                            {group.skills.map((l) => l.label).join(", ")}
                          </span>
                        </div>
                      )}
                      {group.work_experience.max_experience && (
                        <div className="bg-sky-50 flex items-center min-w-40  md:min-w-56 mb-2 md:mb-0 me-2 md:me-0 px-3 py-2 rounded-md  font-poppins text-xs">
                          <span className="me-2 text-gray-600">
                            Work Experience{" "}
                            <i
                              style={{ fontSize: ".8em" }}
                              className="fa-solid fa-chevron-right me-1 "
                            ></i>
                          </span>
                          <span className="me-1 text-sky-600 font-semibold">
                            {group.work_experience.min_experience} -{" "}
                            {group.work_experience.max_experience} years
                          </span>
                        </div>
                      )}
                    </React.Fragment>
                  );
                } else {
                  return null; // or any other default content or nothing
                }
              })}
          </div>
          <div
            className="w-full flex gap-x-4 justify-end p-2 mb-1"
            style={{ fontSize: ".8rem" }}
          >
            <span className="flex items-center gap-x-1  text-gray-600 font-medium">
              <div className={`w-2 h-2 rounded-full bg-gray-400`}></div>
              Not Shortlisted
            </span>
            <span className="flex items-center gap-x-1  text-gray-600 font-medium">
              <div className={`w-2 h-2 rounded-full bg-yellow-400`}></div>
              In Progress
            </span>
            <span className="flex items-center gap-x-1  text-gray-600 font-medium">
              <div className={`w-2 h-2 rounded-full bg-emerald-400`}></div>
              Completed
            </span>
            <span className="flex items-center gap-x-1 text-gray-600 font-medium">
              <div className={`w-2 h-2 rounded-full bg-blue-400`}></div>
              Approved
            </span>
          </div>
          {/* <button className="mb-3 inline-flex items-center rounded-md  px-3 py-2 text-xs font-semibold text-white shadow-sm bg-sky-500 hover:bg-sky-500 focus-visible:outline-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">Apply Filter Group</button> */}
        </div>
        <ApplicantList
          setTotalApplicants={setTotalApplicants}
          updateStatus={updateStatus}
          tableInstance={tableInstance}
          setTableInstance={setTableInstance}
          jobId={jobId}
          url={`/filter/candidate/${jobId}/`}
          userDetails={userDetails}
          checked={checked}
          applicants={filteredApplicants}
          setApplicants={setFilteredApplicants}
          handleShortList={updateStatus}
          handleUnshortList={updateStatus}
          setTableRowCount={setTableRowCount}
        />
      </div>

      {showModal && (
        <div
          className="relative  z-40"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="fixed  inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

          <div className="fixed h-full  inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative lg:w-1/2 h-auto max-h-full transform flex-col justify-evenly rounded-lg bg-white text-left shadow-xl transition-all my-8">
                {/* Header  */}
                <div className="border-b rounded-t-lg bg-gray-50 flex justify-between p-5 ">
                  <div>
                    <h3
                      className="text-base font-semibold leading-6 text-gray-900"
                      id="modal-title"
                    >
                      Upload a Resume
                    </h3>
                    <label
                      htmlFor="cover-photo"
                      className="block text-sm text-start font-normal  text-gray-400"
                    >
                      Add a applicant manually by uploading resume
                    </label>
                  </div>
                  <button onClick={() => handleClose()}>
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                {/* Body  */}
                <div className="bg-white h-auto px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  {isSubmitted ? (
                    <div className="flex flex-col justify-center items-center w-full h-full me-4 py-12">
                      <div className="image mb-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <g strokeWidth="0" id="SVGRepo_bgCarrier"></g>
                          <g
                            strokeLinejoin="round"
                            strokeLinecap="round"
                            id="SVGRepo_tracerCarrier"
                          ></g>
                          <g id="SVGRepo_iconCarrier">
                            {" "}
                            <path
                              strokeLinejoin="round"
                              strokeLinecap="round"
                              strokeWidth="1.5"
                              stroke="#6c757d"
                              d="M20 7L9.00004 18L3.99994 13"
                            ></path>{" "}
                          </g>
                        </svg>
                      </div>
                      <label className="font-medium antialiased text-xl text-gray-700 p-3">
                        Application Submitted
                      </label>
                      <p className="text-sm text-gray-500 w-full text-center">
                        This might take a few minutes. You can close this window
                        while we are processing the resume.
                      </p>
                    </div>
                  ) : (
                    <div className="sm:flex sm:items-start h-5/6">
                      <div className="px-4 h-full w-full overflow-auto grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-1">
                          <label
                            htmlFor="username"
                            className="block text-sm font-medium leading-6 text-gray-900"
                          >
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <div className="mt-2">
                            <input
                              required
                              id="name"
                              name="name"
                              type="text"
                              value={candidateFormData.name}
                              onChange={handleInputChange}
                              className="px-2 text-sm block p-3 w-full  rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm sm:leading-6"
                            />
                          </div>
                        </div>
                        <div className="md:col-span-1">
                          <label
                            htmlFor="about"
                            className="block text-sm font-medium leading-6 text-gray-900"
                          >
                            Email <span className="text-red-500">*</span>
                          </label>
                          <div className="mt-2">
                            <input
                              required
                              id="email"
                              name="email"
                              type="email"
                              onChange={handleInputChange}
                              value={candidateFormData.email}
                              className="px-2 text-sm block w-full  rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm sm:leading-6"
                            />
                          </div>
                        </div>

                        <div className="md:col-span-1">
                          <label
                            htmlFor="about"
                            className="block text-sm font-medium leading-6 text-gray-900"
                          >
                            City <span className="text-red-500">*</span>
                          </label>
                          <div className="mt-2">
                            <input
                              id="location"
                              name="city"
                              type="text"
                              // disabled={city}
                              onChange={handleInputChange}
                              value={candidateFormData.location.city}
                              className=" px-2 text-sm block w-full  rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm sm:leading-6"
                            />
                          </div>
                        </div>
                        <div className="md:col-span-1">
                          <label
                            htmlFor="about"
                            className="block text-sm font-medium leading-6 text-gray-900"
                          >
                            State <span className="text-red-500">*</span>
                          </label>
                          <div className="mt-2">
                            <input
                              id="location"
                              name="state"
                              type="text"
                              // disabled={state}
                              onChange={handleInputChange}
                              value={candidateFormData.location.state}
                              className=" px-2 text-sm block w-full  rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm sm:leading-6"
                            />
                          </div>
                        </div>

                        <div className="md:col-span-1">
                          <label
                            htmlFor="about"
                            className="block text-sm font-medium leading-6 text-gray-900"
                          >
                            LinkedIn
                          </label>

                          {/* for mobile version  */}
                          <div className="relative mt-2 rounded-md shadow-sm ">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-3 border-r">
                              <i className="fa-brands fa-linkedin text-xl"></i>
                            </div>
                            <div className="  items-center ">
                              <input
                                id="linkedin"
                                name="linkedin"
                                type="text"
                                onChange={handleInputChange}
                                value={candidateFormData.linkedin}
                                className="px-2 text-sm block w-full rounded-e border-0 pl-12 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm sm:leading-6"
                                defaultValue={""}
                                placeholder="www.linkedin.com/in/alex123"
                              />
                            </div>
                          </div>
                        </div>

                        {/* ------------  */}
                        <div className="col-span-full">
                          <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-8">
                            <div className="text-center">
                              <PhotoIcon
                                className="mx-auto h-12 w-12 text-gray-300"
                                aria-hidden="true"
                              />
                              {selectedFile ? (
                                <span className="text-sky-600 text-sm">
                                  {selectedFile.name}
                                </span>
                              ) : (
                                false
                              )}
                              <div className="mt-4 flex text-sm leading-6 text-gray-600">
                                <label
                                  htmlFor="file-upload"
                                  className="relative cursor-pointer rounded-md bg-white font-semibold text-sky-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-sky-600 focus-within:ring-offset-2 hover:text-sky-500"
                                >
                                  <span>Upload a file</span>
                                  <input
                                    onChange={handleFileChange}
                                    id="file-upload"
                                    name="file-upload"
                                    type="file"
                                    className="sr-only"
                                  />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                              </div>
                              <p className="text-xs leading-5 text-gray-600">
                                PDF up to 10MB
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer  */}
                <div className="bg-gray-50 rounded-b-lg ms-auto px-4 py-3 flex justify-end items-center sm:px-6 space-x-3">
                  {!isSubmitted && (
                    <button
                      type="submit"
                      disabled={!selectedFile}
                      onClick={handleUpload}
                      form="candidate-question-form"
                      className="h-10  rounded-md disabled:bg-opacity-40 bg-blue-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                      Save
                    </button>
                  )}

                  <button
                    onClick={() => handleClose()}
                    type="button"
                    className=" w-20 h-10  justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                  >
                    Close
                  </button>

                  {/* <button onClick={() => handleSave()} type="button" className="h-10 w-full justify-center rounded-md bg-sky-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 sm:ml-3 sm:w-auto">Save</button>
                                    <button onClick={() => handleClose()} type="button" className="mt-3 h-10 w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto">Cancel</button> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAlertModal && (
        <div
          className="relative  z-50"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="fixed  inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

          <div className="fixed h-full  inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative lg:min-w-96  h-auto transform flex-col justify-evenly rounded-lg bg-white text-left shadow-xl transition-all my-8">
                {/* Header  */}
                <div className="border-b rounded-t-lg bg-gray-50 flex justify-between px-5 py-4">
                  <div className="flex items-center space-x-3">
                    <i className="fa-solid p-3 bg-yellow-300 text-gray-700 rounded-full fa-triangle-exclamation"></i>
                    <h3
                      className="text-base font-semibold leading-6 text-gray-900"
                      id="modal-title"
                    >
                      Alert
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      setShowAlertModal(false);
                      setIsSubmitted(false);
                    }}
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                {/* Body  */}
                <div className="bg-white h-auto px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start h-5/6 ">
                    <div className="mt-3 text-center  h-full w-full sm:ml-4 sm:mt-0 sm:text-left">
                      <div className="col-span-full">
                        <label
                          htmlFor="cover-photo"
                          className="block text-sm text-start font-medium leading-6 text-gray-900"
                        >
                          This resume has already been uploaded for this job.
                          <br></br> Do you wish to update the resume?
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer  */}
                <div className="bg-gray-50 rounded-b-lg ms-auto px-4 py-3 flex justify-end items-center sm:px-6 space-x-3">
                  <button
                    type="button"
                    onClick={updateResume}
                    className="h-10  rounded-md disabled:bg-opacity-40 bg-blue-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  >
                    Yes
                  </button>

                  <button
                    onClick={() => {
                      setShowAlertModal(false);
                      setIsSubmitted(false);
                    }}
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

export default JobApplicants;
