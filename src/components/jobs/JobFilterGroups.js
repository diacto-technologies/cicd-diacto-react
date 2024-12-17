import { useContext, useEffect, useState } from "react";
import Dropdown from "../../utils/dropdowns/Dropdown";
import { InformationCircleIcon, PaperAirplaneIcon, PlusCircleIcon, PlusIcon, SquaresPlusIcon, XMarkIcon } from "@heroicons/react/20/solid";
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { components } from 'react-select';
import AuthContext from "../../context/AuthContext";
import Table from "../../utils/tables/Table";
import Switch from "../../utils/swtiches/Switch";
import { useParams } from "react-router-dom";
import { Tooltip } from 'react-tooltip'
import SpinLoader from "../../utils/loaders/SpinLoader";

const JobFilterGroups = () => {
    const { jobId } = useParams();
    const { user, userDetails, authTokens, } = useContext(AuthContext);
    const [checked, setChecked] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [rowToEdit, setRowToEdit] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showModalError, setShowModalError] = useState(false);
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState({});
    const [tableInstance, setTableInstance] = useState(null)
    const [filterGroupList, setFilterGroupList] = useState([]);
    const comparisonOperators = [
        { label: 'Equal to', value: '=' },
        { label: 'Less than', value: '<=' },
        { label: 'Greater than', value: '>=' },
    ]

    const [selectedComparisonOperator, setSelectedComparisonOperator] = useState(comparisonOperators[0]);
    const [filterGroups, setFilterGroups] = useState({
        name: "",
        skills: [],
        "work_experience": {
            operator: selectedComparisonOperator.value,
            value: null
        },
        location: {
            city: [],
            state: []
        },
        ai_recommendations: false,
        job: parseInt(jobId)
    });
    const [filters, setFilters] = useState([]);
    const [filterField, setFilterField] = useState('');
    const [filterValue, setFilterValue] = useState('');
    const fields = [
        { label: 'Skills', value: 'skills', type: 'array' },
        { label: 'Work Experience', value: 'work_experience', type: 'number' },
        { label: 'City', value: 'location.city', type: 'string' },
        { label: 'State', value: 'location.state', type: 'string' },
        // { label: 'Skills Match', value: 'skill' }
    ]


    const [selectedField, setSelectedField] = useState(fields[0]);

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

    useEffect(() => {
        fetchFilterGroups()
    }, [])

    useEffect(() => {
        setFilterGroups(prevState => ({
            ...prevState,
            ai_recommendations: checked
        }));
    }, [checked])



    const fetchFilterGroups = async () => {
        //console.log("fetching dataset")
        try {
            setLoading(true)
            const response = await fetch(`/jobs/filter-group/`,
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
            setFilterGroupList(data.results || []);
            setLoading(false)
        } catch (error) {
            setError(error);
            setLoading(false)
        }
    };


    const handleFilterFieldChange = (e) => {
        const field = fields.find(item => item.value === e.target.value)
        if (field) {
            setFilterField(field);
        }
    };

    const handleFilterValueChange = (e) => {
        setFilterValue(e.target.value);
    };

    const addFilter = () => {
        if (filterField.label && filterValue) {
            setFilters([...filters, { field: filterField.label, value: filterValue }]);
            // setFilterField('');
            setFilterValue('');
        }
    };

    // const handleSearch = (fieldName, searchValue) => {
    //     setSearchTerm(searchValue);
    //     const newSearch = { ...filterSearchTerm }
    //     newSearch[fieldName] = searchValue
    //     setFilterSearchTerm(newSearch)
    //     const filtered = jobs.filter((job) =>
    //         job[fieldName].toLowerCase().includes(searchValue.toLowerCase())
    //     );

    //     setFilteredJobs(filtered);
    // };

    const handleFieldChange = (selectedOption) => {
        setSelectedField(selectedOption);
    };

    const handleComparisonOperatorChange = (selectedOption) => {
        setSelectedComparisonOperator(selectedOption);
        if (selectedOption) {
            setFilterGroups({
                ...filterGroups,
                "work_experience": {
                    ...filterGroups.work_experience,
                    operator: selectedOption.value
                }
            })
        }
    };

    const handleSkillsAdd = (selectedOption) => {
        if (selectedOption) {
            setFilterGroups({
                ...filterGroups,
                skills: selectedOption,
            });
        }
    }

    // const handleLocationAdd = (selectedOption) => {
    //     if (selectedOption) {
    //         setFilterGroups({
    //             ...filterGroups,
    //             location: selectedOption,
    //         });
    //     }
    // }

    const handleCityAdd = (selectedOption) => {
       //console.log("Selected Option: ", selectedOption);
        if (selectedOption) {
            //console.log("Ëarlier selected Groups: ", filterGroups);
            setFilterGroups(prevState => ({
                ...prevState,
                location: {
                    ...prevState.location,
                    city: [
                        ...selectedOption
                    ]
                }
            }));
        }
    }

   //console.log("Filter Groups:", filterGroups);
    const handleStateAdd = (selectedOption) => {
       //console.log("State Called", selectedOption)
        if (selectedOption) {
            setFilterGroups(prevState => ({
                ...prevState,
                location: {
                    ...prevState.location,
                    state: [
                        ...selectedOption
                    ]
                }
            }));
        }
    }

    const handleWorkEXchange = (e) => {
        setFilterGroups({
            ...filterGroups,
            'work_experience': {
                ...filterGroups.work_experience,
                value: e.target.value
            }
        });
    }

    const Option = props => {
        return (
            <components.Option {...props}>
                <div>{props.data.label}</div>
                {/* <div className="" style={{ fontSize: '.65rem', color: '' }}>{props.data.sublabel}</div> */}
            </components.Option>
        );
    };

    function validateNumberFields() {
        let numberField = fields.filter((field) => field.type === "number");

        if (filterGroups.work_experience.operator === "" && filterGroups.work_experience.value === null) {

        }

    }

    const validateFilterGroup = () => {
       //console.log(filterGroupList);
        const filterGroupPresent = filterGroupList?.find((filterGroup) => filterGroup.name === filterGroups.name)
        if (filterGroups) {
            if (filterGroups.name === "") {
                return {
                    error: "Filter group name cannot be empty"
                }
            }
            if (filterGroupPresent) {
                return {
                    error: "Filter group name already present"
                }
            }
            if (filterGroups.work_experience?.operator === "<=" && filterGroups.work_experience?.value === 0) {
                return {
                    error: "Work Experience cannot be less than 0 months"
                }
            }
            return {
                success: "Filter group has been saved"
            }
        }
    }

    const handleSave = async () => {

        const validationResponse = validateFilterGroup();
        validateNumberFields();
       //console.log(validationResponse);
        if (Object.keys(validationResponse)[0] === "error") {
            setShowModalError(validationResponse.error);
            return;
        }

        const jobFormUrl = editMode ? `/jobs/filter-group/${filterGroups.id}/` : `/jobs/filter-group/`
        try {
            const response = await fetch(jobFormUrl, {
                method: editMode ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: "Bearer " + String(authTokens.access),
                },
                body: JSON.stringify(filterGroups),

            });

            if (response.ok) {
                const data = await response.json();
                // setSuccessMessage('Registration successful!');
                setShowModal(false)

                setFilterGroups({
                    name: "",
                    skills: [],
                    "work_experience": {
                        operator: comparisonOperators[0],
                        value: null
                    },
                    location: {
                        city: [],
                        state: []
                    },
                    ai_recommendations: false,
                    job: jobId
                })
                if (editMode) {
                    rowToEdit.update(data);
                } else {

                    tableInstance.addRow(data, true);

                }

                setSelectedField(fields[0])

                setEditMode(false)
                // Reset the form here if needed
            } else {
                const errorData = await response.json();

                setError(errorData);
                setShowModal(false)
                setEditMode(false)
                setSelectedField(fields[0])
            }
        } catch (error) {
            setShowModal(false)
           //console.log('Job Creation failed:', error.message);
        }
    }


    const handleClose = () => {
        setFilterGroups({
            name: "",
            skills: [],
            "work_experience": {
                operator: selectedComparisonOperator.value,
                value: null
            },
            location: {
                city: [],
                state: []
            },
            ai_recommendations: false,
            job: jobId
        })
        setShowModal(false)
        setShowModalError(false)
        setSelectedField(fields[0])
    }

    var headerPopupFormatter = function (e, column, onRendered) {
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
    }

    var listFilterFunction = function (value, data, filterParams) {
        return data.some(item => item.label.toLowerCase().includes(value.toLowerCase()));
    };

    // var skillsFilterFunction = function (value, data, filterParams) {
    //    //console.log(data,value)
    //     return data.some(skill => skill.name.toLowerCase().includes(value.toLowerCase()));
    // };

    const emptyHeaderFilter = function () {
        return document.createElement("div");;
    }

    const statusFormatter = (cell, formatterParams, onRendered) => {
        const status = cell.getValue();
        let badgeClass, text;

        if (status) {
            badgeClass = 'bg-green-50 text-green-700 ring-green-600/10';
            text = "Published"
        } else {
            badgeClass = 'bg-red-50 text-red-700 ring-red-600/20';
            text = "Unpublished"
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
    };

    const customMenuFormatter = (cell, formatterParams, onRendered) => {
        // Assuming job is a property of the row data
        var job = cell.getRow().getData().job;

        return `<i class='fa-solid fa-ellipsis-vertical text-slate-500'></i> `;
    }

    const servicesFormatter = function (cell, formatterParams, onRendered) {
        const icon = cell.getColumn()._column.field === "location" ? `<i class="fa-solid fa-map-pin me-2 text-sky-500"></i>` : null;
        const items = cell.getValue(); // Assuming 'services' is an array of service names
        const badgeClass = 'bg-sky-50 text-sky-700 ring-sky-600/20';
        const wrapper = document.createElement('div')
        const limit = 3
        for (let index = 0; index < items?.length; index++) {
            // Limit items 
            if (index < limit) {
                // let location = `<div class="me-2 inline-flex items-center rounded-md px-2 py-1 text-xs font-medium  ring-1 ring-inset ${badgeClass}">${items[index].label}</div>`;
                let location = `<div class="me-2 inline-flex items-center rounded-md px-2 py-1 text-xs font-medium  ring-1 ring-inset ${badgeClass}">${items[index].label}</div>`;
                // if (icon) {
                //     location = `<div class="me-2 inline-flex items-center rounded-md px-2 py-1 text-xs font-medium  ring-1 ring-inset ${badgeClass}">${icon} ${items[index].label}</div>`;
                // }
                wrapper.innerHTML += location
            }

        }
        if (items?.length > limit) {
            const badge = `<div class="me-2 inline-flex items-center rounded-md px-2 py-1 text-xs font-medium  ring-1 ring-inset ${badgeClass}">+ ${items.length - limit}</div>`;
            wrapper.innerHTML += badge
        }
        ;
        return wrapper; // Join services into a string separated by commas
    };

    const servicesFormatter2 = function (cell, formatterParams, onRendered) {
        const icon = (cell.getColumn()._column.field === "location.state" || cell.getColumn()._column.field === "location.city") ? `<i class="fa-solid fa-map-pin me-2 text-sky-500"></i>` : null;
        const items = cell.getValue(); // Assuming 'services' is an array of service names
        const badgeClass = 'bg-white text-gray-700 ring-gray-600/80';
        const wrapper = document.createElement('div')
        const limit = 3
       //console.log(items);
        for (let index = 0; index < items?.length; index++) {
            // Limit items 
            if (index < limit) {
                // let location = `<div class="me-2 inline-flex items-center rounded-md px-2 py-1 text-xs font-medium  ring-1 ring-inset ${badgeClass}">${items[index].label}</div>`;
                let location = `<div class="me-2 inline-flex items-center rounded-md px-2 py-1 text-xs font-medium  ring-1 ring-inset ${badgeClass}">${items[index]?.label}</div>`;
                // if (icon) {
                //     location = `<div class="me-2 inline-flex items-center rounded-md px-2 py-1 text-xs font-medium  ring-1 ring-inset ${badgeClass}">${icon} ${items[index]?.label}</div>`;
                // }
                wrapper.innerHTML += location
            }

        }
        if (items?.length > limit) {
            const badge = `<div class="me-2 inline-flex items-center rounded-md px-2 py-1 text-xs font-medium  ring-1 ring-inset ${badgeClass}">+ ${items.length - limit}</div>`;
            wrapper.innerHTML += badge
        }
        ;
        return wrapper; // Join services into a string separated by commas
    };

    const expFormatter = function (cell, formatterParams, onRendered) {
       //console.log("ExpFormatter: ", cell.getRow().getData())
        const work_experience = cell.getRow().getData().work_experience; // Assuming 'services' is an array of service names

        return work_experience.value ? `${work_experience.operator}&nbsp${work_experience.value}` : null; // Join services into a string separated by commas
    };


    var cellContextMenu = [

        {
            label: "Edit",
            action: function (e, cell) {
                let group = cell.getRow().getData();
                let row = cell.getRow()
                editFilterGroup(group, row)
            }
        }, {
            label: "Delete",
            action: function (e, cell) {
                let group = cell.getRow().getData();
                let row = cell.getRow()
                deleteFilterGroup(group, row)
                //handleDeleteJob(job)
            }
        },

    ]

    const viewFilterGroup = (group) => {
        setShowModal(true)
        setFilterGroups(group)
    }

    const editFilterGroup = (group, row) => {
        setEditMode(true)
        setRowToEdit(row)
        setShowModal(true)
        setFilterGroups(group)
    }

    const deleteFilterGroup = async (group, row) => {
        const jobFormUrl = `/jobs/filter-group/${group.id}/`
        try {

            row.delete().then(function () {
               //console.log("row has been deleted")
            }).catch(function (error) {
               //console.log("error", error)
            });

            const response = await fetch(jobFormUrl, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: "Bearer " + String(authTokens.access),
                },
            });

            if (response.ok) {
                const data = await response.text();
               //console.log("message : ", response)
               //console.log(filterGroupList)
                const filteredData = filterGroupList.filter((prevFilterGroup) => prevFilterGroup.id !== group.id)
                setFilterGroupList(filteredData || [])
                setFilterGroups({
                    name: "",
                    skills: [],
                    "work_experience": {
                        operator: selectedComparisonOperator.value,
                        value: null
                    },
                    location: {
                        city: [],
                        state: []
                    },
                    ai_recommendations: false,
                    job: jobId
                })

            } else {
                const errorData = await response.json();
                setError(errorData);
            }
        } catch (error) {
            console.error('Filter group deletion failed:', error.message);
        }
    }

    const columns = [
        {
            title: 'Name', field: 'name', hozAlign: "left",
            titleFormatter: function (cell, formatterParams, onRendered) {
                return '<div class="column-container">' +
                    `<label class="column-title">${cell.getValue()}</label>` +
                    '</div>';
            }, headerPopup: headerPopupFormatter, headerPopupIcon: `<i class='fa-solid fa-filter column-filter-icon' title='Filter'></i>`, headerFilter: emptyHeaderFilter, headerFilterFunc: "like"
        },
        {
            title: 'City', field: 'location.city', hozAlign: "left",
            titleFormatter: function (cell, formatterParams, onRendered) {
                return '<div class="column-container">' +
                    `<label class="column-title">${cell.getValue()}</label>` +
                    '</div>';
            }, headerPopup: headerPopupFormatter, formatter: servicesFormatter2, headerPopupIcon: `<i class='fa-solid fa-filter column-filter-icon' title='Filter'></i>`, headerFilter: emptyHeaderFilter, headerFilterFunc: listFilterFunction
        },
        {
            title: 'State', field: 'location.state', hozAlign: "left",
            titleFormatter: function (cell, formatterParams, onRendered) {
                return '<div class="column-container">' +
                    `<label class="column-title">${cell.getValue()}</label>` +
                    '</div>';
            }, headerPopup: headerPopupFormatter, formatter: servicesFormatter2, headerPopupIcon: `<i class='fa-solid fa-filter column-filter-icon' title='Filter'></i>`, headerFilter: emptyHeaderFilter, headerFilterFunc: listFilterFunction
        },
        {
            title: 'Required Skills', field: 'skills', hozAlign: "left",
            titleFormatter: function (cell, formatterParams, onRendered) {
                return '<div class="column-container">' +
                    `<label class="column-title">${cell.getValue()}</label>` +
                    '</div>';
            }, headerPopup: headerPopupFormatter, formatter: servicesFormatter, headerPopupIcon: `<i class='fa-solid fa-filter column-filter-icon' title='Filter'></i>`, headerFilter: emptyHeaderFilter, headerFilterFunc: listFilterFunction
        },
        {
            title: 'Work Experience', field: 'work_experience', hozAlign: "left", sortable: true,
            titleFormatter: function (cell, formatterParams, onRendered) {
                return '<div class="column-container  ">' +
                    `<label class="column-title">${cell.getValue()}</label>` +
                    '</div>';
            }, formatter: expFormatter,
        },
        {
            title: 'Action', width: '10%', field: 'Action', clickMenu: cellContextMenu, sortable: false, formatter: customMenuFormatter,
            titleFormatter: function (cell, formatterParams, onRendered) {
                return '<div class="column-container ">' +
                    `<label class="column-title">${cell.getValue()}</label>` +
                    '</div>'
            },

        },
        // Add more columns as needed
    ];

   //console.log("FilterGroupList: ", filterGroupList)


    return (
        <>
            <div className="mt-5 h-full w-full description-card bg-white p-5 rounded-3xl shadow-md">
                {/* Header Section  */}
                <div className="flex lg:items-center lg:justify-between px-2 py-2 mb-4 border-b ">
                    <div >
                        <div className="flex items-center">
                            <h2 className=" text-base md:text-xl font-semibold md:mb-1 mb-2 inline-flex">Filter Groups</h2>
                            <a
                                data-tooltip-id="filter-group-tooltip"
                                data-tooltip-content="Filter groups offer a convenient method for preserving specific combinations of filters, streamlining the process of refining candidate searches without the need to reapply filters repeatedly."
                                data-tooltip-place="right"
                            >
                                <InformationCircleIcon className="w-5 h-5 mx-1 text-blue-400 rounded-full hover:text-blue-500 inline-flex" />

                            </a>
                            <Tooltip
                                id="filter-group-tooltip"
                                className="custom-tooltip shadow-lg bg-sky-50"
                                render={({ content, activeAnchor }) => (
                                    <span className="text-xs">
                                        Filter groups offer a convenient method for preserving specific combinations of filters, streamlining the process of refining candidate searches without the need to reapply filters repeatedly.


                                    </span>
                                )}
                            />
                        </div>

                        <p className="block text-sm">Saved filters - {filterGroupList ? filterGroupList.length : 0}</p>
                    </div>
                    {
                        userDetails?.role !== "Participant" &&
                        <div className="ms-auto flex lg:items-center lg:justify-between">
                            <button
                                onClick={() => setShowModal(true)}
                                type="button"
                                className={`h-10 inline-flex items-center rounded-md  px-3 py-2 text-xs font-medium text-white shadow-sm bg-primary-600 hover:bg-sky-500 focus-visible:outline-sky-500  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 `}
                            >
                                <SquaresPlusIcon className="mr-1.5 h-5 w-4 flex-shrink-0 text-white" />
                                Create <span className="hidden md:flex ps-1"> Filter Group</span>
                            </button>
                        </div>
                    }
                </div>
                <div>
                    {/* {filterGroupList.length > 0 && filterGroupList.map((group,index) => (
                        <li>{group.name}</li>
                    ))} */}
                    <div className="overflow-auto rounded-xl  " style={{ height: 'calc(100vh - 410px)' }} >
                        {
                            // filterGroupList?.length > 0 ?
                            <Table url={`/jobs/filter-group/`} setTableInstance={setTableInstance} data={filterGroupList} columns={columns} />
                            // :

                            // <div className="h-full flex justify-center items-center">
                            //     {
                            //         loading ?
                            //             <SpinLoader loadingText={"Fetching Filter Groups"} fill={'blue'} />
                            //             :
                            //             "No Filter Groups found"
                            //     }
                            // </div>

                        }
                    </div>
                </div>
            </div>


            {
                showModal &&

                <div className="relative  z-30" aria-labelledby="modal-title" role="dialog" aria-modal="true">

                    <div className="fixed  inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

                    <div className="fixed h-full  inset-0 z-10 w-screen overflow-y-auto">
                        <div className="flex min-h-full h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">

                            <div className="relative w-5/6 lg:w-1/2 h-auto transform flex-col justify-evenly rounded-lg bg-white text-left shadow-xl transition-all my-8">

                                {/* Header  */}
                                <div className="border-b rounded-t-lg bg-gray-50 flex justify-between py-2 px-3">

                                    <h3 className="text-base p-4 font-semibold leading-6 text-gray-900" id="modal-title">{editMode ? 'Edit' : 'Create'} Filter Group</h3>
                                    <button onClick={() => handleClose()}><XMarkIcon className="w-6 h-6" /></button>
                                </div>

                                {/* Body  */}
                                <div className="bg-white h-auto px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start h-5/6 ">

                                        <div className="mt-3 text-center bg-yellow h-full w-full sm:ml-4 sm:mt-0 sm:text-left">

                                            <div className=" w-full mt-2 p-2 rounded">
                                                <div className=" w-2/3 text-start">
                                                    <label htmlFor="first-name" className="block text-sm font-bold leading-6 text-gray-900">
                                                        Name your Filter Group
                                                    </label>
                                                    <div className="mt-2">
                                                        <input
                                                            type="text"
                                                            name="name"
                                                            id="name"
                                                            value={filterGroups.name}
                                                            onChange={(e) => {
                                                                setFilterGroups({
                                                                    ...filterGroups,
                                                                    name: e.target.value,
                                                                })
                                                                setShowModalError(false)
                                                            }}
                                                            autoComplete="name"
                                                            className="px-3 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm sm:leading-6"
                                                        />
                                                        {showModalError && <p className="text-sm mt-1 text-red-600">{showModalError}</p>}
                                                    </div>
                                                </div>
                                                {/* <div className="mt-4 w-full text-start text-gray-600 rounded-md me-2  ">
                                                    <label htmlFor="" className="me-2 text-sm font-bold leading-6 text-gray-900">
                                                        AI Recommendation
                                                    </label>
                                                    <span className="text-xs block md:inline-flex">(If enabled, applicants will be sorted by AI recommendations by default)</span>
                                                    <div className="mt-2">
                                                        <Switch checked={checked} setChecked={setChecked} />

                                                    </div>
                                                </div> */}
                                            </div>

                                            <div className="mx-auto w-full mt-2 p-2 rounded">
                                                <div className="flex flex-col md:flex-row justify-start gap-x-4">

                                                    <div className="mb-4 min-w-fit md:w-1/3">
                                                        <label className="block text-start text-gray-700 text-sm font-bold mb-2" htmlFor="filterField">
                                                            Filter Field
                                                        </label>
                                                        <Select
                                                            className="z-30 text-sm"
                                                            styles={selectStyle}
                                                            components={{ Option }}
                                                            value={selectedField}
                                                            onChange={handleFieldChange}
                                                            options={fields}
                                                            defaultValue={fields[0]}
                                                        />
                                                    </div>

                                                    <div className="mb-4 md:w-auto flex-col justify-center md:items-center">
                                                        <label className="block  md:text-center text-start w-full text-gray-700 text-sm font-bold md:mb-2" htmlFor="filterValue">
                                                            Operator
                                                        </label>
                                                        {selectedField.type === "number" && (<Select
                                                            className="z-30 md:text-center text-start text-sm w-32 m-auto"
                                                            styles={selectStyle}
                                                            components={{ Option }}
                                                            value={selectedComparisonOperator}
                                                            onChange={handleComparisonOperatorChange}
                                                            options={comparisonOperators}
                                                            defaultValue={selectedComparisonOperator}
                                                        />)}
                                                        {(selectedField.type === "string" || selectedField.type === "array") && (<label className="block text-start md:text-center px-3 py-2 text-gray-700 text-sm font-bold mb-2" htmlFor="filterValue">In</label>)}
                                                    </div >

                                                    <div className="mb-4 min-w-fit  md:w-2/5 max-w-md ">
                                                        <label className="block text-start text-gray-700 text-sm font-bold mb-2" htmlFor="filterValue">
                                                            Filter Value
                                                        </label>
                                                        {selectedField.value === "location.city" &&
                                                            <CreatableSelect className="z-30 text-sm" styles={selectStyle} value={filterGroups.location.city} classNamePrefix="select" placeholder="Add or create cities.." isMulti onChange={handleCityAdd} options={[]} isClearable />}
                                                        {selectedField.value === "location.state" &&
                                                            <CreatableSelect className="z-30 text-sm" styles={selectStyle} classNamePrefix="select" placeholder="Add or create states.." value={filterGroups.location.state} isMulti onChange={handleStateAdd} options={[]} isClearable />}
                                                        {selectedField.value === "work_experience" &&

                                                            <div className="mt-2 flex items-center">
                                                                <input
                                                                    type="number"
                                                                    name="work_experience"
                                                                    id="work_experience"
                                                                    value={filterGroups.work_experience.value}
                                                                    onChange={handleWorkEXchange}
                                                                    min={0}
                                                                    autoComplete="work_experience"
                                                                    className="block w-20 px-3 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                                />
                                                            </div>}

                                                        {
                                                            selectedField.value === "skills" &&
                                                            <CreatableSelect className="text-sm max-w-sm" classNamePrefix="select" placeholder="Select or create skills..." value={filterGroups.skills} isMulti onChange={handleSkillsAdd} options={[]} isClearable />
                                                        }
                                                    </div>
                                                </div>

                                                <div className="">
                                                    {filterGroups.skills.length > 0 &&
                                                        <>
                                                            <div className="mt-4  p-4 bg-white border rounded-lg ">
                                                                <h1 className="me-2 font-semibold leading-6 text-gray-900 mb-2 font-poppins ">Skills</h1>
                                                                <div className="w-full text-start overflow-auto">
                                                                    {
                                                                        filterGroups?.skills?.map((filter, index) => {

                                                                            if (index < 3) {
                                                                                return <span key={index} className="me-2 inline-flex items-center rounded-md px-2 py-1 text-xs font-medium  ring-2 ring-inset bg-white text-gray-700 ring-gray-600/80">
                                                                                    <label className="px-2 py-1 font-bold text-xs">{filter.label} </label>
                                                                                    <button
                                                                                        className=" text-sm"
                                                                                    >
                                                                                        {/* <XMarkIcon className="mx-1 rounded-e-md h-6 w-5 flex-shrink-0  text-red-400 hover:text-red-700" /> */}
                                                                                    </button>
                                                                                </span>
                                                                            }
                                                                        }
                                                                        )

                                                                    }
                                                                    {
                                                                        filterGroups.skills.length > 3 &&
                                                                        <span className="me-2 inline-flex items-center rounded-md px-2 py-1 text-xs font-medium  ring-1 ring-inset bg-white text-gray-700 ring-gray-600/80">
                                                                            <label className="py-1 px-2  font-bold text-xs">+ {filterGroups.skills.length - 3} more </label>

                                                                        </span>
                                                                    }

                                                                </div>
                                                            </div>
                                                        </>
                                                    }

                                                    {filterGroups.work_experience.value &&
                                                        <>
                                                            <div className="mt-4 p-4 bg-white border rounded-xl shadow-md" >
                                                                <h1 className="me-2 font-semibold leading-6 text-gray-900 mb-2 font-poppins ">Work Experience</h1>
                                                                <div className="mt-2 ps-3 flex items-center">
                                                                    <label
                                                                        className="block text-center font-bold w-auto text-gray-900 placeholder:text-gray-400 sm:text-sm sm:leading-6"
                                                                    >
                                                                        {selectedComparisonOperator.label + " " + filterGroups.work_experience.value}
                                                                    </label>
                                                                    <span className='px-1 text-sm text-gray-500 '>{filterGroups.work_experience.value > 1 ? ("months") : ("month")}</span>
                                                                </div>
                                                            </div>
                                                        </>
                                                    }

                                                    {filterGroups.location.city.length > 0 &&
                                                        <>
                                                            <div className="mt-4 p-4 bg-white border rounded-xl shadow-md">
                                                                <h1 className="me-2 font-semibold leading-6 text-gray-900 mb-2 font-poppins">City</h1>
                                                                <div className="w-full text-start h-80p overflow-auto">

                                                                    {
                                                                        filterGroups.location.city.map((filter, index) => {

                                                                            if (index < 3) {
                                                                                return <span key={index} className="me-2 inline-flex items-center rounded-md px-2 py-1 text-xs font-medium  ring-1 ring-inset bg-white text-gray-700 ring-gray-600/80">
                                                                                    <label className="px-2 py-1 font-bold text-xs"><i className="fa-solid fa-location-dot me-2"></i>{filter.label} </label>
                                                                                    <button
                                                                                        className=" text-base"
                                                                                    >
                                                                                        {/* <XMarkIcon className="mx-1 rounded-e-md h-6 w-5 flex-shrink-0  text-red-400 hover:text-red-700" /> */}
                                                                                    </button>
                                                                                </span>
                                                                            }
                                                                        }
                                                                        )

                                                                    }
                                                                    {
                                                                        filterGroups.location.city.length > 3 &&
                                                                        <span className="me-2 inline-flex items-center rounded-md px-2 py-1 text-xs font-medium  ring-1 ring-inset bg-white text-gray-700 ring-gray-600/80">
                                                                            <label className="px-2 py-1 font-bold text-xs">+ {filterGroups.location.city.length - 3} more </label>

                                                                        </span>
                                                                    }

                                                                </div>

                                                            </div>
                                                        </>
                                                    }
                                                    {filterGroups.location.state.length > 0 &&
                                                        <>
                                                            <div className="mt-4 p-4 bg-white border rounded-xl shadow-md">
                                                                <h1 className="me-2 font-semibold leading-6 text-gray-900 mb-2 font-poppins">State</h1>
                                                                <div className="w-full text-start h-80p overflow-auto">

                                                                    {
                                                                        filterGroups.location.state.map((filter, index) => {

                                                                            if (index < 3) {
                                                                                return <span key={index} className="me-2 inline-flex items-center rounded-md px-2 py-1 text-xs font-medium  ring-1 ring-inset bg-white text-gray-700 ring-gray-600/80">
                                                                                    <label className="px-2 py-1 font-bold text-xs"><i className="fa-solid fa-location-dot me-2"></i>{filter.label} </label>
                                                                                    <button
                                                                                        className=" text-base"
                                                                                    >
                                                                                        {/* <XMarkIcon className="mx-1 rounded-e-md h-6 w-5 flex-shrink-0  text-red-400 hover:text-red-700" /> */}
                                                                                    </button>
                                                                                </span>
                                                                            }
                                                                        }
                                                                        )

                                                                    }
                                                                    {
                                                                        filterGroups.location.state.length > 3 &&
                                                                        <span className="me-2 inline-flex items-center rounded-md px-2 py-1 text-xs font-medium  ring-1 ring-inset bg-white text-gray-700 ring-gray-600/80">
                                                                            <label className="px-2 py-1 font-bold text-xs">+ {filterGroups.location.state.length - 3} more </label>

                                                                        </span>
                                                                    }

                                                                </div>

                                                            </div>
                                                        </>
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer  */}
                                <div className="bg-gray-50 rounded-b-lg ms-auto px-4 py-3 flex justify-end sm:px-6 space-x-3">
                                    <button onClick={() => handleSave()} type="button" className="h-10  justify-center rounded-md bg-sky-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 sm:ml-3 sm:w-auto">Save</button>
                                    <button onClick={() => handleClose()} type="button" className="h-10 justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto">Cancel</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            }
        </>
    )
}

export default JobFilterGroups;