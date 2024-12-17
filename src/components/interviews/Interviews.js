import { DndContext } from '@dnd-kit/core';

import { Draggable } from './Draggable';
import { Droppable } from './Droppable';
import { useContext, useEffect, useState } from 'react';
import Table from '../../utils/tables/Table';
import AuthContext from "../../context/AuthContext"
import { useNavigate } from 'react-router-dom';
import SpinLoader from '../../utils/loaders/SpinLoader';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { XMarkIcon } from '@heroicons/react/20/solid';
import Alert from "../../assets/warning.png"

const Interviews = () => {
    const [tableRowCount,setTableRowCount] = useState("fetching")
    const [cellContextMenu, setCellContextMenu] = useState([]);
    const { authTokens, userDetails, } = useContext(AuthContext);
    const [error, setError] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();
    const [tableInstance, setTableInstance] = useState(null)

    const [interviews, setInterviews] = useState([]);
    const [filteredInterviews, setFilteredInterviews] = useState([]);
    const [interviewsLoading, setInterviewsLoading] = useState(false)

    const [searchTerm, setSearchTerm] = useState('');
    const [filterSearchTerm, setFilterSearchTerm] = useState({});
    const [showModal, setShowModal] = useState(false)
    const [redirectToWorkflow, setRedirectToWorkflow] = useState(true)

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [rowToDelete, setRowToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false)

    const [interviewData, setInterviewData] = useState({
        name: "",
        description: "",
    })

    useEffect(() => {
        // Define the default context menu options
        const defaultContextMenu = [
            {
                label: "Edit",
                action: function (e, cell) {
                    let interview = cell.getRow().getData();
                    navigate(`/app/user/interviews/edit-interview-flow/${interview.id}/`)
                }
            },

            {
                label: "Delete",
                action: function (e, cell) {
                    setRowToDelete(cell.getRow())
                    setShowDeleteModal(true)

                }
            },

            // {
            //     label: function (e, cell) {
            //         let published = e.getRow().getData().published;
            //         return published ? "Unpublish" : "Publish";
            //     },
            //     action: function (e, cell) {
            //         let job = cell.getRow().getData();
            //         publishJob(job)
            //     }
            // },
        ];

        // Check the user's role and modify the context menu options accordingly
        if (userDetails) {
            if (userDetails.role === "Participant") {
                // Remove options that are not applicable to Participants
                setCellContextMenu(defaultContextMenu.filter(option => option.label === "View"));
            } else if (userDetails.role === "Editor") {
                // Remove options that are not applicable to Editors
                setCellContextMenu(defaultContextMenu.filter(option => option.label !== "Delete"));
            } else if (userDetails.role === "Admin") {
                // Admin has access to all options, so no changes needed
                setCellContextMenu(defaultContextMenu);
            }
        }
    }, [userDetails]);


    useEffect(() => {
        fetchInterviews()
    }, [])

    const columns = [
        {
            title: 'Title', field: 'name', hozAlign: "left",vertAlign: "middle", minWidth: 150,
            titleFormatter: function (cell, formatterParams, onRendered) {
                return '<div class="column-container">' +
                    `<label class="column-title">${cell.getValue()}</label>` +
                    '</div>';
            }, headerPopup: headerPopupFormatter, cellClick: function (e, cell) {
                const jobId = cell.getData().id;
                navigate(`/app/user/interviews/edit-interview-flow/${jobId}/`)
            }, headerPopupIcon: `<i class='fa-solid fa-filter column-filter-icon' title='Filter'></i>`, headerFilter: emptyHeaderFilter, headerFilterFunc: "like"
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
        //     title: 'Candidates', field: 'job.applicants_count', hozAlign: "left",vertAlign: "middle", minWidth: 150,
        //     titleFormatter: function (cell, formatterParams, onRendered) {
        //         return '<div class="column-container">' +
        //             `<label class="column-title">${cell.getValue()}</label>` +
        //             '</div>';
        //     }, headerPopup: headerPopupFormatter, headerPopupIcon: `<i class='fa-solid fa-filter column-filter-icon' title='Filter'></i>`, headerFilter: emptyHeaderFilter, headerFilterFunc: "like"
        // },

        {
            title: 'Created By', field: 'created_by', hozAlign: "left",vertAlign: "middle", minWidth: 150,
            titleFormatter: function (cell, formatterParams, onRendered) {
                return '<div class="column-container">' +
                    `<label class="column-title">${cell.getValue()}</label>` +
                    '</div>';
            }, headerPopup: headerPopupFormatter, formatter: ownerFormatter, headerPopupIcon: `<i class='fa-solid fa-filter column-filter-icon' title='Filter'></i>`, headerFilter: emptyHeaderFilter, headerFilterFunc: "like"
        },
        {
            title: 'Action', minWidth: 80, maxWidth: 120, field: 'Action', clickMenu: cellContextMenu, formatter: customMenuFormatter,
            titleFormatter: function (cell, formatterParams, onRendered) {
                return '<div class="column-container">' +
                    `<label class="column-title">${cell.getValue()}</label>` +
                    '</div>'
            },
            headerPopup: headerPopupFormatter, headerPopupIcon: `<i class='' title='Filter'></i>`, headerFilter: emptyHeaderFilter, headerFilterFunc: "like"
        },
        // Add more columns as needed
    ];

    const fetchInterviews = async () => {
        try {
            console.log("fetching Interviews")
            setInterviewsLoading(true)
            const response = await fetch(`/interview/list/`,
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
            if (data) {
                setInterviews(data?.results);
                setFilteredInterviews(data?.results)
            }
           
            setInterviewsLoading(false)

        } catch (error) {
            setError(error);
            setInterviewsLoading(false)
        }
    };

    function ownerFormatter(cell, formatterParams, onRendered) {

        // console.log("owner : ",cell.getValue())
        return `${cell.getValue().name}`
    }


    function headerPopupFormatter(e, column, onRendered) {
        var container = document.createElement("div");
        container.classList.add("column-filter")
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
        var job = cell.getRow().getData();

        return `<i class='fa-solid fa-ellipsis-vertical text-slate-500'></i> `;
    }

    //create dummy header filter to allow popup to filter
    function emptyHeaderFilter() {
        return document.createElement("div");;
    };

    function jobFormatter(cell) {
        const job = cell.getValue()
        console.log("job : ", job)
        return job?.title || ""
    }


    const handleSearch = (fieldName, searchValue) => {
        setSearchTerm(searchValue);
        const newSearch = { ...filterSearchTerm }
        newSearch[fieldName] = searchValue
        // setFilterSearchTerm(newSearch)
        const filtered = interviews.filter((job) =>
            job[fieldName].toLowerCase().includes(searchValue.toLowerCase())
        );

        setFilteredInterviews(filtered);
    };


    const handleClose = () => {
        setInterviewData({})
        setShowModal(false)
    }

    async function createInterviewModule(e) {
        e.preventDefault();
        // Replace 'http://example.com/api/interviews/' with your actual API endpoint
        const apiUrl = '/interview/interview-modules/';

        // Data to be sent in the POST request body
        const postData = {
            name: interviewData.name,
            created_by: userDetails.id,
            description: interviewData.description
        };

        // Headers to be included in the request
        const headers = {
            'Content-Type': 'application/json',
            Authorization: "Bearer " + String(authTokens.access),
        };
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(postData)
            })

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            if (data) {
                console.log(data, redirectToWorkflow)
                if (redirectToWorkflow) {
                    setShowModal(false)
                    navigate(`/app/user/interviews/edit-interview-flow/${data.id}/`)
                }
                setShowModal(false)
            }

        } catch (error) {
            setShowModal(false)
            console.error('Error creating interview module:', error);
        }
    }

    async function deleteInterviewWorkflow(rowToDelete) {
        setDeleting(true)
        // Replace 'http://example.com/api/interviews/' with your actual API endpoint
        const apiUrl = `/interview/interview-modules/${rowToDelete._row.data.id}/`;


        // Headers to be included in the request
        const headers = {
            'Content-Type': 'application/json',
            Authorization: "Bearer " + String(authTokens.access),
        };
        try {
            const response = await fetch(apiUrl, {
                method: 'DELETE',
                headers: headers,
            })

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }


            rowToDelete.delete();
            setDeleting(false)
            setShowDeleteModal(false);


        } catch (error) {
            setDeleting(false)
            setShowDeleteModal(false);
            console.error('Error creating interview module:', error);
        }
    }

    console.log(redirectToWorkflow)


    return (
        <>
            {/* <Heading /> */}
            <div id='jobList' className="w-full h-full p-3 job-list">
                {/* Header Section  */}
                <div className="md:flex items-center justify-between mt-2 md:mt-0 lg:px-4 px-2 py-2 mb-4 border-b ">
                    <div className='flex justify-between mb-2 md:mb-0'>
                        <h2 className="text-xl font-semibold md:mb-0 mb-2">Interview Flows</h2>
                        {/* <p className='text-xs text-gray-500'>Create job openings </p> */}
                        <span className="sm:hidden">
                            <button
                                onClick={() => setShowModal(true)}
                                type="button"
                                className="add-job-btn inline-flex truncate justify-center items-center rounded-md bg-primary-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
                            >
                                {/* <CheckIcon className="-ml-0.5 mr-1.5 h-2 w-2" aria-hidden="true" /> */}
                                Create Interview
                            </button>
                        </span>
                    </div>

                    <div className="flex space-x-2 justify-between">
                        <div className=" text-gray-600 border rounded-md flex w-full">
                            <input
                                type="search"
                                name="search"
                                placeholder="Search by title"
                                onChange={(e) => handleSearch('title', e.target.value)}
                                className="bg-white border-0 w-full md:w-56 h-8 px-2 md:px-5 text-sm focus:outline-none me-2"
                            />
                            <button className="text-center mr-3 bg-white">
                                <i className="fa-solid fa-magnifying-glass"></i>
                            </button>
                        </div>
                        {/* <SortDropdown handleAscSort={handleAscSort} handleDescSort={handleDescSort} dropdownIcon={'fa-arrow-up-wide-short'} dropdownItems={[{ label: 'Job Title', value: 'title' }, { label: 'Close Date', value: 'close_date' }, { label: 'Published', value: 'published' }]} /> */}
                        <span className="hidden sm:flex">
                            <button
                                onClick={() => setShowModal(true)}
                                type="button"
                                className="add-job-btn inline-flex truncate justify-center items-center rounded-md bg-primary-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
                            >
                                {/* <CheckIcon className="-ml-0.5 mr-1.5 h-2 w-2" aria-hidden="true" /> */}
                                Create Interview Workflow
                            </button>
                        </span>
                    </div>

                </div>

                {/* Job List  */}
                <div className="overflow-auto rounded-xl" style={{ height: 'calc(100dvh - 175px)' }}>


                    {filteredInterviews.length > 0 ?
                        <Table url={`/interview/list/`} setTableRowCount={setTableRowCount} setTableInstance={setTableInstance} data={filteredInterviews} columns={columns} />
                        :
                        <div className='w-full h-full flex items-center justify-center text-center text-sm p-5 '>{interviewsLoading ? <SpinLoader loadingText={"Fetching Interviews"} fill={'blue'} /> : "No Interviews found"}</div>
                    }
                </div>

            </div>
            <ToastContainer />

            {
                showModal &&
                <div className="relative  z-30" aria-labelledby="modal-title" role="dialog" aria-modal="true">

                    <div className="fixed  inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

                    <div className="fixed h-full  inset-0 z-10 w-screen overflow-y-auto">
                        <div className="flex min-h-full h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">

                            <div style={{ minWidth: '40%' }} className="relative  h-auto transform flex-col justify-evenly rounded-lg bg-white text-left shadow-xl transition-all my-8">

                                {/* Header  */}
                                <div className="border-b rounded-t-lg bg-gray-50 flex justify-between py-2 px-3">

                                    <h3 className="text-base p-4 font-semibold leading-6 text-gray-900" id="modal-title">Create Interview Workflow</h3>
                                    <button onClick={() => handleClose()}><XMarkIcon className="w-6 h-6" /></button>
                                </div>

                                {/* Body  */}
                                <div className="bg-white h-auto px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                                    <div class="p-4 md:p-5">
                                        <form id='create-interview-form' class="space-y-4" onSubmit={createInterviewModule}>
                                            <div>
                                                <label htmlFor="name" class="block mb-2 text-sm font-medium text-gray-900 ">Name</label>
                                                <input required onChange={(e) => setInterviewData({ ...interviewData, name: e.target.value })} value={interviewData.name} type="text" name="name" id="name" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 " placeholder="Research Analyst Interview Workflow" />
                                            </div>
                                            <div>
                                                <label htmlFor="description" class="block mb-2 text-sm font-medium text-gray-900 ">Description</label>
                                                <input onChange={(e) => setInterviewData({ ...interviewData, description: e.target.value })} value={interviewData.description} type="text" name="description" id="description" placeholder="Workflow for Trainee Research Analysts..." class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 " />
                                            </div>
                                            <div class="flex justify-between">
                                                <div class="flex items-start">
                                                    <div class="flex items-center h-5">
                                                        <input id="redirectToWorkflow" type="checkbox" checked={redirectToWorkflow} onChange={() => setRedirectToWorkflow(!redirectToWorkflow)} class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-600 dark:border-gray-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800" />
                                                    </div>
                                                    <label htmlFor="redirectToWorkflow" class="ms-2 text-sm font-medium text-gray-600 ">Redirect to Interview Workflow Setup</label>
                                                </div>
                                                {/* <a href="#" class="text-sm text-blue-700 hover:underline dark:text-blue-500">Lost Password?</a> */}
                                            </div>

                                        </form>
                                    </div>
                                </div>

                                {/* Footer  */}
                                <div className="bg-gray-50 rounded-b-lg ms-auto px-4 py-3 flex justify-end sm:px-6 space-x-3">
                                    <button type="submit" form='create-interview-form' className="h-10  justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 sm:ml-3 sm:w-auto">Save</button>
                                    <button onClick={() => handleClose()} type="button" className="h-10 justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto">Cancel</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            }

            {
                showDeleteModal &&
                <div className="relative  z-30" aria-labelledby="modal-title" role="dialog" aria-modal="true">

                    <div className="fixed  inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

                    <div className="fixed h-full  inset-0  z-30 w-screen overflow-y-auto">
                        <div className="flex min-h-full h-full w-full items-center justify-center p-4 text-center sm:items-center sm:p-0">

                            <div className="relative lg:min-w-96 w-full sm:w-1/3  transform flex-col justify-evenly rounded-lg bg-white text-left shadow-xl transition-all my-8">

                                {/* Header  */}
                                <div className="border-b  rounded-t-lg bg-gray-50 flex justify-between px-5 py-4">

                                    <div className='flex items-center space-x-3'>
                                        <img src={Alert} className="w-12 h-12" />
                                        <h3 className="font-bold text-xl text-gray-900" id="modal-title">Confirm</h3>
                                    </div>
                                    <button onClick={() => { setRowToDelete(null); setShowDeleteModal(false) }}><XMarkIcon className="w-6 h-6" /></button>
                                </div>

                                {/* Body  */}
                                <div className="h-5/6 px-4 pb-4 pt-5 sm:p-6 sm:pb-4">

                                    <div className="sm:flex sm:items-start h-5/6 ">
                                        <div className="mt-3 text-center  h-full w-full sm:ml-4 sm:mt-0 sm:text-left">
                                            <div className="col-span-full">
                                                <div className="mb-5 min-w-fit">
                                                    <label for="" class="block text-sm font-medium leading-6 text-gray-900">Are you sure you want to delete ${rowToDelete._row.data.name} workflow?</label>

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
                                        onClick={() => deleteInterviewWorkflow(rowToDelete)}
                                        className="h-10  rounded-md disabled:bg-opacity-40 bg-red-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                                    >
                                        <i class="fa-solid fa-trash-can me-2"></i>
                                        {deleting ? "Deleting" : "Delete"}
                                    </button>


                                    <button onClick={() => { setRowToDelete(null); setShowDeleteModal(false) }} type="button" className=" w-20 h-10  justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto">Cancel</button>

                                    {/* <button onClick={() => handleSave()} type="button" className="h-10 w-full justify-center rounded-md bg-sky-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 sm:ml-3 sm:w-auto">Save</button>
                                    <button onClick={() => handleClose()} type="button" className="mt-3 h-10 w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto">Cancel</button> */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            }
        </>);
}

export default Interviews;