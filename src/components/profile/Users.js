import { useContext, useEffect, useRef, useState } from "react";
import "./Profile.css"
import AuthContext from "../../context/AuthContext";
import defaultProfilePic from "../../assets/user.png";
import { InformationCircleIcon, PaperAirplaneIcon, PlusCircleIcon, PlusIcon, SquaresPlusIcon, XMarkIcon } from "@heroicons/react/20/solid";
import Select from 'react-select';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import ProfileNavbar from "./ProfileNavbar";
import { useFetchTeamMembers } from "../../constants/accounts/constants";
import axios from 'axios';
import TeamMembersTable from "./TeamMembersTable";
import { toast, ToastContainer } from "react-toastify";
import { api } from "../../constants/constants";

const Users = () => {
    const { fetchTeamMembers, loadingTeamMembers, teamMembers, setTeamMembers, setLoadingTeamMembers } = useFetchTeamMembers();
    const { authTokens, userDetails, setUserDetails } = useContext(AuthContext);
    const [showModal, setShowModal] = useState(false);
    const [showExcelModal, setShowExcelModal] = useState(false);
    
    const [file, setFile] = useState(null);
    const [btnDisabled, setBtnDisabled] = useState(false);
    // const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        email: '',
        name: '',
        role: '',
    });

    const [kpiMetrics, setKpiMetrics] = useState({
        total_jobs: { label: "Total Jobs", value: 0 },
        jobs_open: { label: "Jobs Open", value: 0 },
        total_applicants: { label: "No. of Applicants", value: 0 },
        team_members: { label: "Team Members", value: 40 },
        cost: { label: "Cost", value: 0 }
    })

    var table = {}
    const [tableInstance, setTableInstance] = useState(null);

    console.count("profile rerender")

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

    // const [roleOptions, setRoleOptions] = useState([
    //     {
    //         label: "Admin",
    //         value: "admin"
    //     },
    //     {
    //         label: "Participant",
    //         value: "participant"
    //     },
    //     {
    //         label: "Candidate",
    //         value: "candidate"
    //     },
    // ])
    const [roleOptions, setRoleOptions] = useState([])

  

    useEffect(() => {
        if (userDetails) {
            getProfileKPIData();
            getRoles();
            fetchTeamMembers();
        }
    }, [userDetails])

    const getRoles = async () => {
        try {
            const response = await fetch(`${api}/accounts/roles/`, {
                headers: {
                    method: 'GET',
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + String(authTokens.access),
                },
            })

            const data = await response.json();

            if (response.ok) {
                setRoleOptions(data.results.map((role) => { return { value: role.id, label: role.name } }))
                setFormData({
                    ...formData,
                    role: data.results[0].name,
                });
            } else {
                console.log(response.statusText)
            }

        } catch (error) {
            console.error(error)
        }
    }

    const handleInputChange = (e) => {
        // email validation
        if (e.target.name === "email") {
            if (validateEmail(e.target.value)) setBtnDisabled(false)
            else setBtnDisabled(true)
        }
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const getProfileKPIData = async () => {
        try {
            const response = await fetch(`${api}/accounts/profile-kpi/`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + String(authTokens.access),
                },
            })

            const data = await response.json();

            if (response.ok) {
                const newKpiMetrics = { ...kpiMetrics }

                newKpiMetrics.total_jobs.value = data.total_jobs
                newKpiMetrics.jobs_open.value = data.jobs_open
                newKpiMetrics.total_applicants.value = data.total_applicants
                newKpiMetrics.team_members.value = data.team_members
                newKpiMetrics.cost.value = data.cost

                setKpiMetrics(newKpiMetrics)
            } else {
                console.log(response.statusText)
            }

        } catch (error) {
            console.error(error)
        }
    }

    const handleClose = () => {
        setShowModal(false)
        clearModal();
    }

    const handleExcelModalClose = () => {
        setShowExcelModal(false)
    }

    const clearModal = () => {
        setFormData({
            email: '',
            name: '',
            role: roleOptions[0].label,
        })
    }

    const addUser = async () => {
        setShowModal(false)
        clearModal();
        setLoadingTeamMembers(true);
        const payload = formData
        try {
            const response = await fetch(`${api}/accounts/user-add/`, {
                method: 'POST', // Moved outside of headers
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + String(authTokens.access),
                },
                body: JSON.stringify(payload), // Moved outside of headers
            });

            const data = await response.json();

            if (response.ok) {
                setTeamMembers((prev) => {
                    return [
                        ...prev,
                        data.result
                    ]
                })
                toast.success("User added successfully", {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                    // transition: Bounce,
                });
                // setLoadingTeamMembers(false)
            } else {
                console.log(response);
                // setLoadingTeamMembers(false)
                toast.error(`${response.status === 400 ? "User already added" : data }`, {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                    // transition: Bounce,
                });
            }
        } catch (error) {
            console.error(error);
            // setLoadingTeamMembers(false)
        } finally {
            setLoadingTeamMembers(false)
        }

    }

    const onRoleChange = (e) => {
        setFormData({
            ...formData,
            role: e.label,
        });
    }

    const removeMember = async (memberId) => {
        try {
            const response = await fetch(`${api}/accounts/users/${memberId}/`, {
                method: 'DELETE',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + String(authTokens.access),
                },
            })
            if (response.status === 204) {
                setTeamMembers((prev) => prev.filter((member) => member.id !== memberId))
                toast.success("User removed", {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                    // transition: Bounce,
                });
            } else {
                console.log(response.statusText)
                toast.error("Deletion failed", {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                    // transition: Bounce,
                });
            }
        } catch (error) {
            console.error(error)
        }
    }

    const handleFileChange = (event) => {
        const uploadedFile = event.target.files[0];
        if (uploadedFile) {
            setFile(uploadedFile);
        }
    };

    const handleUpload = async () => {
        if (file) {

            try {
                const formData = new FormData();
                formData.append("file", file); // Append the file to the FormData object

                const response = await axios.post(`/accounts/invite-users/`, formData, {
                    headers: {
                        "Authorization": "Bearer " + String(authTokens.access),
                        // Content-Type is automatically set for FormData by Axios
                    },
                });


                if (response.status === 201) {
                    // Axios automatically parses the JSON response
                    setShowExcelModal(false)
                }
            } catch (error) {
                console.error("Error uploading file:", error.response ? error.response.data : error.message);
            }
        } else {
            console.log("No file selected");
        }
    };

    const validateEmail = (email) => {
        // Email validation regex
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    };

    return (
        <>
            {
                userDetails &&
                <div className="w-full flex">
                    {/* sidebar  */}
                    {/* <div className="w-1/6"><ProfileNavbar /></div> */}

                    {/* body  */}
                    <div className="w-full bg-gray-50 flex flex-col overflow-auto" style={{ height: 'calc(100dvh - 57px)' }}>
                        <div className="px-4 sm:px-8 sm:py-4 flex justify-between bg-white border-b">
                            <div className="">
                                <h3 className="text-xl font-semibold leading-7 text-gray-900">
                                    Users
                                </h3>
                                <p className="text-sm leading-6 text-gray-500">
                                    You can add team members or invite others to collaborate on this job.
                                </p>
                            </div>
                            {userDetails.role.name === "Admin" && <div className="flex items-center gap-2">
                                <button className="border-2 bg-[#7474f4] text-white text-sm px-4 py-2 rounded-md shadow-none" onClick={() => setShowModal(true)}>Add User</button>
                                {/* <button className="border-2 bg-[#1E57FE] text-white text-sm px-4 py-2 rounded-md shadow-none" onClick={() => setShowExcelModal(true)}>Bulk Import</button> */}
                            </div>}
                        </div>
                        <div className="mt-5 text-sm flex flex-col gap-5 px-8 bg-transparent">
                            < TeamMembersTable teamMembers={teamMembers} removeMember={removeMember} defaultProfilePic={defaultProfilePic} />
                            {loadingTeamMembers &&
                                <div className="w-full h-14 min-h-fit flex items-center justify-center text-gray-700">Loading....</div>
                            }
                        </div>
                    </div>
                </div>
            }

            {
                showModal &&

                <div className="relative  z-30" aria-labelledby="modal-title" role="dialog" aria-modal="true">

                    <div className="fixed  inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

                    <div className="fixed h-full  inset-0 z-10 w-screen overflow-y-auto">
                        <div className="flex min-h-full h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">

                            <div className="relative w-5/6 lg:w-1/3 h-auto transform flex-col justify-evenly rounded-lg bg-white text-left shadow-xl transition-all my-8">

                                {/* Header  */}
                                <div className="border-b rounded-t-lg bg-gray-50 flex justify-between py-2 px-3">

                                    <h3 className="text-base p-4 font-semibold leading-6 text-gray-900" id="modal-title">Add User</h3>
                                    <button onClick={() => handleClose()}><XMarkIcon className="w-6 h-6" /></button>
                                </div>

                                {/* Body  */}
                                <div className="bg-white h-auto px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                                    <div className=" w-full mt-2 p-2 rounded">
                                        <div className=" w-full text-start">
                                            <label htmlFor="first-name" className="block text-sm font-bold leading-6 text-gray-900">
                                                Name
                                            </label>
                                            <div className="mt-2">
                                                <input
                                                    type="text"
                                                    name="name"
                                                    id="name"
                                                    placeholder="Full Name"
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    autoComplete="name"
                                                    className="px-3 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm sm:leading-6"
                                                />
                                                {/* {showModalError && <p className="text-sm mt-1 text-red-600">{showModalError}</p>} */}
                                            </div>
                                        </div>
                                    </div>
                                    <div className=" w-full mt-2 p-2 rounded">
                                        <div className=" w-full text-start">
                                            <label htmlFor="first-name" className="block text-sm font-bold leading-6 text-gray-900">
                                                Email
                                            </label>
                                            <div className="mt-2">
                                                <input
                                                    type="email"
                                                    name="email"
                                                    id="email"
                                                    placeholder="Email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    autoComplete="email"
                                                    className="px-3 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm sm:leading-6"
                                                />
                                                {/* {showModalError && <p className="text-sm mt-1 text-red-600">{showModalError}</p>} */}
                                            </div>
                                        </div>
                                    </div>
                                    <div className=" w-full mt-2 p-2 rounded">
                                        <div className=" w-2/3 text-start">
                                            <label htmlFor="first-name" className="block text-sm font-bold leading-6 text-gray-900">
                                                Role
                                            </label>
                                            <div className="mt-2">
                                                <Select
                                                    className="w-5/6 md:w-56 text-xs"
                                                    styles={selectStyle}
                                                    // components={{ Option }}
                                                    value={roleOptions.find((role) => role.value === formData.role)}
                                                    
                                                    onChange={onRoleChange}
                                                    options={roleOptions}
                                                    defaultValue={roleOptions[0]}
                                                    placeholder="Select a role..."
                                                />
                                                {/* {showModalError && <p className="text-sm mt-1 text-red-600">{showModalError}</p>} */}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer  */}
                                <div className="bg-gray-50 rounded-b-lg ms-auto px-4 py-3 flex justify-end sm:px-6 space-x-3">
                                    <button onClick={() => addUser()} type="button" className="h-10  justify-center rounded-md bg-[#7474f4] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#5c5cf7] sm:ml-3 sm:w-auto disabled:bg-[#aaaaff] disabled:cursor-not-allowed" disabled={!(formData.name !== "" && formData.email !== "" && formData.role !== "" && !btnDisabled)}>Save</button>
                                    <button onClick={() => handleClose()} type="button" className="h-10 justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto">Cancel</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            }

            {
                showExcelModal &&

                <div className="relative  z-30" aria-labelledby="modal-title" role="dialog" aria-modal="true">

                    <div className="fixed  inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

                    <div className="fixed h-full  inset-0 z-10 w-screen overflow-y-auto">
                        <div className="flex min-h-full h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">

                            <div className="relative w-5/6 lg:w-1/3 h-auto transform flex-col justify-evenly rounded-lg bg-white text-left shadow-xl transition-all my-8">

                                {/* Header  */}
                                <div className="border-b rounded-t-lg bg-gray-50 flex justify-between py-2 px-3">

                                    <h3 className="text-base p-4 font-semibold leading-6 text-gray-900" id="modal-title">Add Multiple Users</h3>
                                    <button onClick={() => handleExcelModalClose()}><XMarkIcon className="w-6 h-6" /></button>
                                </div>

                                {/* Body  */}
                                {/* <div className="bg-white h-auto px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                                    <div className=" w-full mt-2 p-2 rounded">
                                        <div className=" w-full text-start">
                                            <label htmlFor="first-name" className="block text-sm font-bold leading-6 text-gray-900">
                                                Name
                                            </label>
                                            <div className="mt-2">
                                                <input
                                                    type="text"
                                                    name="name"
                                                    id="name"
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    autoComplete="name"
                                                    className="px-3 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm sm:leading-6"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className=" w-full mt-2 p-2 rounded">
                                        <div className=" w-full text-start">
                                            <label htmlFor="first-name" className="block text-sm font-bold leading-6 text-gray-900">
                                                Email
                                            </label>
                                            <div className="mt-2">
                                                <input
                                                    type="text"
                                                    name="email"
                                                    id="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    autoComplete="email"
                                                    className="px-3 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm sm:leading-6"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className=" w-full mt-2 p-2 rounded">
                                        <div className=" w-2/3 text-start">
                                            <label htmlFor="first-name" className="block text-sm font-bold leading-6 text-gray-900">
                                                Role
                                            </label>
                                            <div className="mt-2">
                                                <Select
                                                    className="w-5/6 md:w-56 text-xs"
                                                    styles={selectStyle}
                                                    // components={{ Option }}
                                                    value={roleOptions.find((role) => role.value === formData.role)}
                                                    isClearable
                                                    onChange={onRoleChange}
                                                    options={roleOptions}
                                                    defaultValue={roleOptions[0]}
                                                    placeholder="Select a role..."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div> */}

                                <div className="p-6 mx-auto text-center shadow-lg">
                                    <h3 className="text-lg font-medium mb-4">Upload Excel File</h3>
                                    <input
                                        type="file"
                                        accept=".xlsx, .xls"
                                        onChange={handleFileChange}
                                        className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none focus:ring focus:ring-blue-300 mb-4"
                                    />
                                </div>

                                {/* Footer  */}
                                <div className="bg-gray-50 rounded-b-lg ms-auto px-4 py-3 flex justify-end sm:px-6 space-x-3">
                                    <button onClick={() => handleUpload()} type="button" className="h-10  justify-center rounded-md bg-[#4160FB] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#4160FB] sm:ml-3 sm:w-auto">Save</button>
                                    <button onClick={() => handleExcelModalClose()} type="button" className="h-10 justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto">Cancel</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            }

            <ToastContainer />
        </>
    );
}

export default Users;