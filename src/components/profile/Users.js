import { useContext, useEffect, useRef, useState } from "react";
import "./Profile.css"
import AuthContext from "../../context/AuthContext";
import { InformationCircleIcon, PaperAirplaneIcon, PlusCircleIcon, PlusIcon, SquaresPlusIcon, XMarkIcon } from "@heroicons/react/20/solid";
import Select from 'react-select';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import ProfileNavbar from "./ProfileNavbar";

const Users = () => {

    const { authTokens, userDetails, setUserDetails } = useContext(AuthContext);
    const [showModal, setShowModal] = useState(false);
    const fileInputRef = useRef(null);
    const [currentHoverElement, setCurrentHoverElement] = useState(null)
    const [editElementId, setEditElementId] = useState(null)
    const [profilePic, setProfilePic] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loadingPic, setLoadingPic] = useState(false)
    const [name, setName] = useState(null)
    const [email, setEmail] = useState(null)
    const [formData, setFormData] = useState({
        // id: '',
        email: '',
        // org_domain: '',
        name: '',
        role: '',
        // contact: '',
        // profile_pic: null,
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

    const [rowData, setRowData] = useState([
        { id: 1, name: "Oli Bob", progress: 12, gender: "male", rating: 1, col: "red", dob: "19/02/1984", car: 1 },
        { id: 2, name: "Mary May", progress: 1, gender: "female", rating: 2, col: "blue", dob: "14/05/1982", car: true },
        { id: 3, name: "Christine Lobowski", progress: 42, gender: "female", rating: 0, col: "green", dob: "22/05/1982", car: "true" },
        { id: 4, name: "Brendon Philips", progress: 100, gender: "male", rating: 1, col: "orange", dob: "01/08/1980" },
        { id: 5, name: "Margret Marmajuke", progress: 16, gender: "female", rating: 5, col: "yellow", dob: "31/01/1999" },
        { id: 6, name: "Frank Harbours", progress: 38, gender: "male", rating: 4, col: "red", dob: "12/05/1966", car: 1 },
    ])

    useEffect(() => {
        getProfileKPIData();
        getRoles();
    }, [])

    // useEffect(() => {
    //     if (userDetails) {
    //         console.count("setting form data")
    //         const newFormData = { ...formData }
    //         newFormData.id = userDetails.id;
    //         newFormData.name = userDetails.name;
    //         newFormData.email = userDetails.email;
    //         newFormData.contact = userDetails.contact;
    //         newFormData.profile_pic = userDetails.profile_pic;
    //         if (userDetails.profile_pic) {
    //             setPreviewUrl(true)
    //         }
    //         setFormData(newFormData)
    //     }
    // }, [userDetails])

    const getRoles = async () => {
        try {
            const response = await fetch(`/accounts/roles/`, {
                headers: {
                    method: 'GET',
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + String(authTokens.access),
                },
            })

            const data = await response.json();

            if (response.ok) {
                console.log(data)
                setRoleOptions(data.results.map((role) => { return { value: role.id, label: role.name } }))
                setFormData({
                    ...formData,
                    role: data.results[0].id,
                });
            } else {
                console.log(response.statusText)
            }

        } catch (error) {
            console.error(error)
        }
    }

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // console.log(formData)
    // console.log(userDetails ? true : false)


    const handleProfilePicChange = async (event) => {
        // setProfilePic(event.target.files[0]);
        console.log(event.target.files[0])
        if (event.target.files[0]) {
            setLoadingPic(true)
            const imageUrl = URL.createObjectURL(event.target.files[0]);
            setPreviewUrl(imageUrl);

            try {
                const picFormData = new FormData(); // Create a FormData object for file upload
                picFormData.append('profile_pic', event.target.files[0]);

                const response = await fetch(`/accounts/users/${formData.id}/`,
                    {
                        method: 'PATCH',
                        headers: {

                            Authorization: "Bearer " + String(authTokens.access),
                        },
                        body: picFormData
                    }
                )

                const data = await response.json()

                if (response.ok) {
                    console.log(data)
                    setUserDetails({
                        ...userDetails,
                        profile_pic: imageUrl
                    });
                    setLoadingPic(false)
                    setEditElementId(null)
                }
                else {
                    setLoadingPic(false)
                    console.error('Failed to save field:', data);
                }
            } catch (error) {
                setLoadingPic(false)
                console.error(error)
            }

        }
    };



    const getProfileKPIData = async () => {
        try {
            const response = await fetch(`/accounts/profile-kpi/`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + String(authTokens.access),
                },
            })

            const data = await response.json();

            if (response.ok) {
                console.log(data)
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

    const handleSaveField = async (field) => {
        try {
            console.log(field)
            const body = { [field]: formData[field] }
            const response = await fetch(`/accounts/users/${formData.id}/`,
                {
                    method: 'PATCH',
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + String(authTokens.access),
                    },
                    body: JSON.stringify(body)
                }
            )

            const data = await response.json()

            if (response.ok) {
                console.log(response, data)
                setEditElementId(null)
            }
            else {
                console.error('Failed to save field:', data);
            }
        } catch (error) {
            console.error(error)
        }
    }

    const handleClose = () => {
        setShowModal(false)
    }

    const handleSave = () => {
        setShowModal(false)
        console.log("Data to be Saved: ", formData)
    }

    const onRoleChange = (e) => {
        console.log(e)
        setFormData({
            ...formData,
            role: e.value,
        });
    }

    console.log(roleOptions)

    return (
        <>
            {
                userDetails &&
                <div className="w-full flex">
                    {/* sidebar  */}
                    <ProfileNavbar />

                    {/* body  */}
                    <div className="w-5/6 bg-gray-50 flex flex-col px-8" style={{ height: 'calc(100dvh - 57px)' }}>
                        <div className="mt-5 font-semibold text-[28px] pb-5 border-b">
                            Users
                        </div>
                        <div className="mt-5 text-lg font-medium">
                            <div className='bg-gray-100 px-12 py-8 rounded-md mt-8 flex flex-row justify-between'>
                                <div className="">
                                    <h2 className='font-semibold'>Add other users</h2>
                                    <p className='text-sm text-gray-500 mt-2'>You can add team members or invite others to collaborate on this job.</p>
                                </div>
                                <div className="flex items-center">
                                    <button className="border-2 bg-[#1E57FE] text-white text-sm px-4 py-2 rounded-md shadow-none" onClick={() => setShowModal(true)}>Add User</button>

                                </div>
                            </div>
                            {/* <div className="width-full float-end">
                                <button className="border-2 bg-[#1E57FE] text-white text-sm px-4 py-2 rounded-md shadow-none" onClick={() => setShowModal(true)}>Add User</button>
                            </div> */}
                        </div>
                        <div>
                            <div>
                                {/* {selectedMembersData?.map((member) => {
                                    return ( */}
                                <div className="flex flex-row justify-between px-12 py-6 border-b">
                                    <div className="flex gap-4">
                                        {/* <img src={member.profile_pic} className="w-12 h-12 rounded-full"></img> */}

                                        <div className="w-60">
                                            <p className="font-medium">
                                                Chirag Rakh
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                chiragrakh@gmail.com
                                            </p>
                                        </div>
                                    </div>

                                    <span className="self-center font-medium">
                                        Admin
                                    </span>

                                    <i className="fa-solid fa-trash self-center text-[#7076f2] cursor-pointer"
                                    // onClick={() => removemember(member.id)}
                                    ></i>
                                </div>
                                {/* ) */}
                                {/* })} */}
                            </div>
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
                                                    // value={filterGroups.name}
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
                                                    type="text"
                                                    name="email"
                                                    id="email"
                                                    // value={filterGroups.email}
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
                                                    // value={selectedFilterGroup}
                                                    isClearable
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
                                    <button onClick={() => handleSave()} type="button" className="h-10  justify-center rounded-md bg-[#4160FB] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#4160FB] sm:ml-3 sm:w-auto">Save</button>
                                    <button onClick={() => handleClose()} type="button" className="h-10 justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto">Cancel</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            }


        </>
    );
}

export default Users;