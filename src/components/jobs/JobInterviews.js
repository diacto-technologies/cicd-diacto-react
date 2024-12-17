
import SpinLoader from "../../utils/loaders/SpinLoader";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Table from "../../utils/tables/Table";
import AuthContext from "../../context/AuthContext";

import AssignedWorkflow from "./AssignedWorkflow";
import { api } from "../../constants/constants";


const JobInterviews = () => {


    const selectStyle = {
        menu: (provided, state) => ({
            ...provided,
            zIndex: 9999, // Adjust the zIndex as needed
        }),
        dropdownIndicator: styles => ({
            ...styles,
            color: 'black',
            fontSize: "0px",
        }),
        indicatorSeparator: styles => ({
            ...styles,
            width: '0px'
        }),
        placeholder: (base) => ({
            ...base,
            fontSize: '1em',
            fontWeight: 400,
        })
    }

    const { jobId } = useParams();
    const [jobDetail, setJobDetail] = useState([]);
    const { authTokens, userDetails,domain } = useContext(AuthContext);
    const [tableInstance, setTableInstance] = useState(null);
    const navigate = useNavigate();


    const [error, setError] = useState({});
    const [loading, setLoading] = useState(false)
    const [workflowLoading, setWorkflowLoading] = useState(false)


    const [candidates, setCandidates] = useState([])
    const [workflows, setWorkflows] = useState(null)
    const [selectedWorkflow, setSelectedWorkflow] = useState(null)
    const [selectedCandidate, setSelectedCandidate] = useState(null)
    const [selectedRow, setSelectedRow] = useState(null)
    const [cellContextMenu, setCellContextMenu] = useState([
        {
            label: function (e, cell) {
                let steps = e.getRow().getData().interview_steps;
                console.log(steps)
                const shortlisted = steps ? steps.find(s => s.service.name === "Resume Screening")?.completed : false;
                console.log(shortlisted)
                return shortlisted ? "Unshortlist" : "Shortlist";
            },
            action: function (e, cell) {
                let candidateRow = cell.getRow();
                let steps = candidateRow.getData().interview_steps;
                const shortlisted = steps ? steps.find(s => s.service.name === "Resume Screening")?.completed : false;
                console.log("value : ", shortlisted)
                if (shortlisted) {
                    handleUnshortList(candidateRow)
                } else {
                    handleShortList(candidateRow)
                }

            }
        },
        {
            label: "View Profile",
            action: function (e, cell) {
                let candidate = cell.getRow().getData();
                // handleEditJob(job.id)
                navigate(`/app/user/applicants/applicant/${candidate.id}/profile/overview/`)

            }
        },
        // {
        //     label: "Resume Screening",
        //     action: function (e, cell) {
        //         let candidate = cell.getRow().getData();
        //         // handleShareJob(job)
        //         navigate(`/app/user/applicants/applicant/${candidate.id}/profile/score/`)

        //     }
        // },

    ]);

    const columns = [
        {
            title: 'Name', field: 'name', hozAlign: "left", vertAlign: "middle", vertAlign: "middle", minWidth: 120,
            titleFormatter: function (cell, formatterParams, onRendered) {
                return '<div class="column-container">' +
                    `<label class="column-title">${cell.getValue()}</label>` +
                    '</div>';
            },
            formatter: linkFormatter,
            headerPopup: headerPopupFormatter,
            cellClick: function (e, cell) {
                const table = cell.getTable()
                table.deselectRow();
                cell.getRow().select()
                setSelectedRow(cell.getRow())
                setSelectedCandidate(cell.getData())
            },
            headerPopupIcon: `<i class='fa-solid fa-filter column-filter-icon' title='Filter'></i>`,
            headerFilter: emptyHeaderFilter, headerFilterFunc: "like"
        },
        {
            title: 'Score', field: 'score', hozAlign: "left", vertAlign: "middle", sorter: scoreSorter, minWidth: 120,
            titleFormatter: function (cell, formatterParams, onRendered) {
                return '<div class="column-container">' +
                    `<label class="column-title">${cell.getValue()}</label>` +
                    '</div>';
            }, headerPopup: headerPopupFormatter, formatter: scoreFormatter, headerPopupIcon: `<i class='fa-solid fa-filter column-filter-icon' title='Filter'></i>`, headerFilter: emptyHeaderFilter, headerFilterFunc: "like"
        },
        {
            title: 'Email', field: 'email', hozAlign: "left", vertAlign: "middle", sorter: "string", minWidth: 120,
            titleFormatter: function (cell, formatterParams, onRendered) {
                return '<div class="column-container">' +
                    `<label class="column-title">${cell.getValue()}</label>` +
                    '</div>';
            },
            cellClick: function (e, cell) {
                const toEmail = cell.getValue();
                openOutlook(toEmail)
                console.log(toEmail)
            },
            headerPopup: headerPopupFormatter, formatter: emailFormatter, headerPopupIcon: `<i class='fa-solid fa-filter column-filter-icon' title='Filter'></i>`, headerFilter: emptyHeaderFilter, headerFilterFunc: "like"
        },


        {
            title: 'Relevant Experience', field: 'resume.total_duration', hozAlign: "left", vertAlign: "middle", sorter: expSorter, minWidth: 120,
            titleFormatter: function (cell, formatterParams, onRendered) {
                return '<div class="column-container ">' +
                    `<label class="column-title">${cell.getValue()}<span class="text-sm font-normal  text-gray-500 ms-1 text-center"> (months)</span></label>` +
                    '</div>';
            }, headerPopup: headerPopupFormatter, formatter: expFormatter, headerPopupIcon: `<i class='fa-solid fa-filter column-filter-icon' title='Filter'></i>`, headerFilter: emptyHeaderFilter, headerFilterFunc: relevantExpFilter
        },

        // {
        //     title: 'Current Stage', field: 'interview_steps', hozAlign: "left", vertAlign: "middle", minWidth: 120,
        //     titleFormatter: function (cell, formatterParams, onRendered) {
        //         return '<div class="column-container">' +
        //             `<label class="column-title">${cell.getValue()}</label>` +
        //             '</div>';
        //     }, headerPopup: headerPopupFormatter, formatter: shortListedFormatter, headerPopupIcon: `<i class='fa-solid fa-filter column-filter-icon' title='Filter'></i>`, headerFilter: emptyHeaderFilter, headerFilterFunc: dateFilter
        // },
        // {
        //     title: 'Action', minWidth: 80, maxWidth: 120, field: 'Action', clickMenu: cellContextMenu, formatter: customMenuFormatter,
        //     titleFormatter: function (cell, formatterParams, onRendered) {
        //         return '<div class="column-container">' +
        //             `<label class="column-title">${cell.getValue()}</label>` +
        //             '</div>'
        //     },
        //     headerPopup: headerPopupFormatter, headerPopupIcon: `<i class='' title='Filter'></i>`, headerFilter: emptyHeaderFilter,
        // },
        // Add more columns as needed
    ];

    useEffect(() => {
        fetchApplicants()
        fetchInterviewWorkflows()
        fetchJob()
        fetchInterviewWorkflowsByJob()
    }, [])

    const fetchJob = async () => {
        //console.log("fetching dataset")
        try {
            setLoading(true)
            const response = await fetch(`${api}/jobs/job/${jobId}/`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + String(authTokens.access),
                    },
                });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            // setDescription(data.description?.replace(/\n/g, '<br>'))
            console.log("job : ", data)
            setJobDetail(data);
            // getListData(data)
            setLoading(false)

        } catch (error) {
            setLoading(false)
            setError(error);
        }
    };

    const fetchApplicants = async () => {
        try {
            setLoading(true)
            const response = await fetch(`${api}/candidates/resume-screening-completed-candidates/${jobId}/`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + String(authTokens.access),
                    },
                });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            const formatted_applicants = data.results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            setCandidates(formatted_applicants);
            console.log("applicants : ", formatted_applicants)
            // setFilteredApplicants(formatted_applicants)
            // getListData(data)
            setLoading(false)
        } catch (error) {
            setLoading(false)
            setError(error);
        }
    };

    const fetchInterviewWorkflows = async () => {
        try {
            console.log("fetching Interviews")
            setWorkflowLoading(true)
            const response = await fetch(`${api}/interview/interview-modules/`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + String(authTokens.access),
                    },
                });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            console.log("interviews : ", data)
            const formatted = data.results.map(workflow => ({ ...workflow, label: workflow.name, value: workflow.id }))
            setWorkflows(formatted);

            setWorkflowLoading(false)

        } catch (error) {
            setError(error);
            setWorkflowLoading(false)
        }
    };

    const fetchInterviewWorkflowsByJob = async () => {
        try {
            console.log("fetching Interviews")
            setWorkflowLoading(true)
            const response = await fetch(`${api}/interview/job/${jobId}/interview-modules/`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + String(authTokens.access),
                    },
                });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            console.log("setSelectedWorkflow : ", data.results[0])
            if (data && data.results.length) {
                setSelectedWorkflow(data.results[0]);
            }
            setWorkflowLoading(false)

        } catch (error) {
            setError(error);
            setWorkflowLoading(false)
        }
    };


    function handleUnshortList(params) {

    }

    function handleShortList(params) {

    }

    function openOutlook(toEmail) {
        // Specify the email address and subject
        // const toEmail = 'recipient@example.com';
        const subject = 'CandidHR : Your Subject';

        // Encode the email address and subject for the mailto URL
        const mailtoUrl = `mailto:${encodeURIComponent(toEmail)}?subject=${encodeURIComponent(subject)}`;

        // Open the default email client
        window.location.href = mailtoUrl;
    };


    function headerPopupFormatter(e, column, onRendered) {
        var container = document.createElement("div");
        container.classList.add("column-filter")
        // var label = document.createElement("label");
        // label.style.display = "block";
        // label.style.fontSize = ".7em";
        var input = document.createElement("input");
        input.value = column.getHeaderFilterValue() || "";
        if (column._column.definition.title === "Applied On") {
            input.type = "date"
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
    };

    function linkFormatter(cell, formatterParams, onRendered) {

        <i class="fa-solid fa-up-right-from-square"></i>
        return `<div class="">
                <span class="me-2">${cell.getValue()}</span>
                <i class="fa-solid fa-up-right-from-square text-blue-500"></i>
            </div>`
    }

    function emailFormatter(cell, formatterParams, onRendered) {

        <i class="fa-solid fa-up-right-from-square"></i>
        return `<div class="">
                <span class="me-2">${cell.getValue()}</span>
                <i class="fa-regular fa-envelope text-blue-500"></i>
            </div>`
    }

    function emptyHeaderFilter(cell, formatterParams, onRendered) {
        return document.createElement("div");;
    };

    function customMenuFormatter(cell, formatterParams, onRendered) {
        // Assuming job is a property of the row data
        var job = cell.getRow().getData().job;
        return `<i class='fa-solid fa-ellipsis-vertical text-slate-500'></i> `;
    }

    // function scoreFormatter(cell, formatterParams, onRendered) {
    //     const applicant = cell.getRow().getData();
    //     return parseFloat(applicant.resume.resume_score?.overall_score) || 0
    // }

   
    function expFormatter (cell, formatterParams, onRendered) {
        const work_experience = cell.getRow().getData().resumes[0]?.total_duration; // Assuming 'services' is an array of service names
        return work_experience ? work_experience : 0; // Join services into a string separated by commas
    };

    function expSorter (a, b, aRow, bRow, column, dir, sorterParams) {
        const exp_A = aRow.getData().resumes[0]?.total_duration
        const exp_B = bRow.getData().resumes[0]?.total_duration
        return exp_A - exp_B;
    };

    function scoreFormatter(cell, formatterParams, onRendered){
        const applicant = cell.getRow().getData();
        return parseFloat(applicant.resumes[0].resume_score?.overall_score) || 0
    }


    function scoreSorter (a, b, aRow, bRow, column, dir, sorterParams) {
        const score_A = parseFloat(aRow.getData().resumes[0]?.resume_score?.overall_score || 0)
        const score_B = parseFloat(bRow.getData().resumes[0]?.resume_score?.overall_score || 0)
        return score_A - score_B;
    };

    function relevantExpFilter(value, data, filterParams) {
        return data === parseInt(value)
    };

    // function dateFilter(value, data, filterParams) {
    //     console.log(new Date(data).toDateString(), new Date(value))
    //     return new Date(data).toDateString() == new Date(value).toDateString()
    //     // return data === parseInt(value)
    // };

    // function shortListedFormatter(cell, formatterParams, onRendered) {
    //     const candidate_interview_steps = cell.getValue(); // Assuming 'services' is an array of service names
    //     const currentStep = candidate_interview_steps.find(s => s.current)
    //     const notCompletedSteps = candidate_interview_steps.filter(step => !step.approved)
    //     let color;
    //     let text;
    //     console.log(currentStep)
    //     if (currentStep) {

    //         text = currentStep?.service?.name

    //         if (currentStep.completed) {
    //             color = 'bg-green-100 text-green-800 ring-green-600/20'
    //         }
    //         if (currentStep.approved) {
    //             color = 'bg-sky-100 text-sky-800 ring-sky-600/20'
    //         }
    //         if (currentStep.started && !currentStep.completed) {
    //             color = 'bg-yellow-200/60 text-yellow-700 ring-yellow-600/20'
    //         }

    //     } else if (!notCompletedSteps.length && candidate_interview_steps.length == selectedWorkflow?.steps_json.length) {

    //         text = "All Stages Cleared"
    //         color = 'bg-cyan-200 text-cyan-700 ring-cyan-600/20'

    //     } else if (!currentStep &&  candidate_interview_steps?.length < selectedWorkflow?.steps_json.length) {
    //         const nextStep = selectedWorkflow.steps_json.find(s => parseInt(s.order) == (parseInt(candidate_interview_steps.slice(-1)[0].order) + 1))
            
    //         text = nextStep ? nextStep?.content?.label : "No Data" 
    //         color = 'bg-gray-100 text-gray-700 ring-gray-600/20'
    //     }

    //     return `<div class="me-2 inline-flex items-center rounded-md px-2 py-2 text-xs font-medium  ring-1 ring-inset ${color}">${text}</div>`; // Join services into a string separated by commas
    // };



    return (
        <>
            <div className="mt-5 h-full w-full description-card rounded-3xl">
                <AssignedWorkflow jobId={jobId} selectedCandidate={selectedCandidate} selectedRow={selectedRow} selectedWorkflow={selectedWorkflow} setSelectedWorkflow={setSelectedWorkflow} workflows={workflows} />

                <div className="mt-3 min-h-96 h-96">
                    <div className="w-full flex gap-x-4 justify-end p-2 mb-1" style={{ fontSize: '.8rem' }}>
                        <span className="flex items-center gap-x-1  text-gray-600 font-medium">
                            <div className={`w-2 h-2 rounded-full bg-gray-400`} ></div>
                            Not Started
                        </span>
                        <span className="flex items-center gap-x-1  text-gray-600 font-medium">
                            <div className={`w-2 h-2 rounded-full bg-yellow-400`} ></div>
                            In Progress
                        </span>
                        <span className="flex items-center gap-x-1  text-gray-600 font-medium">
                            <div className={`w-2 h-2 rounded-full bg-emerald-400`} ></div>
                            Completed
                        </span>
                        <span className="flex items-center gap-x-1 text-gray-600 font-medium">
                            <div className={`w-2 h-2 rounded-full bg-blue-400`} ></div>
                            Approved
                        </span>

                    </div>
                    {
                        candidates.length > 0 ?
                            <Table url={`/candidates/resume-screening-completed-candidates/${jobId}/`} setTableInstance={setTableInstance} data={candidates} columns={columns} />
                            :

                            <div className="h-full flex justify-center items-center">
                                {
                                    loading ?
                                        <SpinLoader loadingText={"Fetching Workflows"} fill={'blue'} />
                                        :
                                        "No Details found"
                                }
                            </div>

                    }
                </div>
            </div>
        </>
    );
}

export default JobInterviews;