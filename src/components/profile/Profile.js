import { useContext, useEffect, useRef, useState } from "react";
import "./Profile.css"
import AuthContext from "../../context/AuthContext";
import { ChevronDownIcon, EnvelopeIcon, IdentificationIcon, LinkIcon, MapPinIcon, PencilIcon, PencilSquareIcon, PhoneIcon, PhotoIcon, PlusIcon, ShieldCheckIcon, SparklesIcon, UserIcon, UsersIcon, XMarkIcon } from '@heroicons/react/20/solid'
import { api } from "../../constants/constants";

const Profile = () => {

    const { authTokens, userDetails, setUserDetails } = useContext(AuthContext);
    const fileInputRef = useRef(null);
    const [currentHoverElement, setCurrentHoverElement] = useState(null)
    const [editElementId, setEditElementId] = useState(null)
    const [profilePic, setProfilePic] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loadingPic, setLoadingPic] = useState(false)
    const [formData, setFormData] = useState({
        id: '',
        email: '',
        org_domain: '',
        name: '',
        contact: '',
        profile_pic: null,
    });

    const [kpiMetrics, setKpiMetrics] = useState({
        total_jobs: { label: "Total Jobs", value: 0 },
        jobs_open: { label: "Jobs Open", value: 0 },
        total_applicants: { label: "No. of Applicants", value: 0 },
        team_members: { label: "Team Members", value: 40 },
        cost: { label: "Cost", value: 0 }
    })

    console.count("profile rerender")

    useEffect(() => {
        getProfileKPIData()
    }, [])

    useEffect(() => {
        if (userDetails) {
            console.count("setting form data")
            const newFormData = { ...formData }
            newFormData.id = userDetails.id;
            newFormData.name = userDetails.name;
            newFormData.email = userDetails.email;
            newFormData.contact = userDetails.contact;
            newFormData.profile_pic = userDetails.profile_pic;
            if (userDetails.profile_pic) {
                setPreviewUrl(true)
            }
            setFormData(newFormData)
        }
    }, [userDetails])



    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };


    const handleProfilePicChange = async (event) => {
        // setProfilePic(event.target.files[0]);
        if (event.target.files[0]) {
            setLoadingPic(true)
            const imageUrl = URL.createObjectURL(event.target.files[0]);
            setPreviewUrl(imageUrl);

            try {
                const picFormData = new FormData(); // Create a FormData object for file upload
                picFormData.append('profile_pic', event.target.files[0]);

                const response = await fetch(`${api}/accounts/users/${formData.id}/`,
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

    // const handleSubmit = (event) => {
    //     event.preventDefault();
    //     const formData = new FormData();
    //     formData.append('profile_pic', profilePic);
    //     // Add other registration data to formData
    //     // Send formData to backend
    // };



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

    const handleSaveField = async (field) => {
        try {
            const body = { [field]: formData[field] }
            const response = await fetch(`${api}/accounts/users/${formData.id}/`,
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
                setEditElementId(null)
            }
            else {
                console.error('Failed to save field:', data);
            }
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <>
            {
                userDetails &&
                <div className="p-5 h-full overflow-auto">
                    <div className="md:flex items-center justify-between mt-2 md:mt-0 lg:px-4 px-2 py-2 mb-4 border-b ">
                        <div className='flex justify-between mb-2 md:mb-0'>
                            <h2 className="text-xl font-semibold md:mb-0 mb-2">Profile</h2>
                        </div>
                    </div>
                    <div className="overflow-auto " style={{ height: 'calc(100dvh - 175px)' }}>
                        <div id="profile-card" className="flex space-x-8 items-center w-full bg-white rounded-xl border  p-5">
                            <div className="relative">
                                <div id="profile-image" className="relative profile-image overflow-hidden max-h-24 h-44 sm:max-h-44 w-20 md:w-40 rounded-xl inline-flex flex-col justify-center items-center  ">
                                    {
                                        !loadingPic ?
                                            <>

                                                {
                                                    formData.profile_pic ?
                                                        <img className="rounded-lg border-2 overflow-y-hidden" src={formData.profile_pic} alt="Profile Picture" />
                                                        :
                                                        <>
                                                            <PhotoIcon className="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
                                                            <label htmlFor="profile_pic"
                                                                className="relative cursor-pointer text-xs text-center rounded-md bg-white font-semibold text-sky-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-sky-600 focus-within:ring-offset-2 hover:text-sky-500">
                                                                <span className="">Upload Profile <br /> Picture</span>
                                                            </label>
                                                        </>
                                                }
                                            </>
                                            :
                                            <>
                                                <div className='animate-pulse h-full w-full'>
                                                    <div className="h-full w-full bg-gray-200 rounded-lg "></div>
                                                </div>
                                            </>
                                    }
                                    <input type="file" className="sr-only" accept="image/*" name="profile_pic" id="profile_pic" onChange={handleProfilePicChange} />


                                </div>
                                {
                                    !loadingPic &&
                                    <label
                                    htmlFor="profile_pic"
                                        className="absolute -top-0 -right-2 p-1 rounded-full text-gray-700  bg-white border-2 border-gray-200 hover:bg-blue-100 hover:text-blue-500"

                                    >
                                        <PencilIcon className="h-3 w-3 " />
                                    </label>
                                }
                            </div>


                            <div className="w-64 basic-details  overflow-hidden max-h-24 sm:max-h-44 sm:h-40  rounded-xl flex flex-col justify-between items-start">
                                <div>
                                    <div className="mb-1" onDoubleClick={() => setEditElementId("name")} onMouseEnter={() => setCurrentHoverElement("name")} onMouseLeave={() => setCurrentHoverElement(null)}>
                                        {
                                            editElementId === "name" ?
                                                <input onChange={handleInputChange} name="name" type="text" value={formData?.name} style={{ width: `${formData?.name.length * 13}px` }} className="text-xl w-auto outline-none border-b  font-medium " />
                                                :
                                                <label className="text-xl font-medium ">{formData?.name}</label>
                                        }
                                        {currentHoverElement === "name" && editElementId !== "name" && <button type="button" onClick={() => setEditElementId("name")} ><PencilIcon className="inline-flex ml-0.5 mr-1.5 h-4 w-4 hover:text-blue-500 text-gray-400" aria-hidden="true" /></button>}
                                        {editElementId === "name" &&
                                            <div className="inline-flex items-center space-x-2 ms-3">
                                                <button title="Save" type="button" onClick={() => handleSaveField("name")} ><i className="fa-solid  fa-floppy-disk text-primary-600"></i></button>
                                                <button title="Cancel" type="button" onClick={() => setEditElementId(null)} ><XMarkIcon className="inline-flex ml-0.5 mr-1.5 h-5 w-5 hover:text-blue-500 text-gray-400" aria-hidden="true" /></button>
                                            </div>}
                                    </div>
                                    <p className="text-gray-600 text-sm">{userDetails.role?.name}</p>
                                </div>

                                <div className=" space-y-3  w-full">

                                    <div className="flex " onDoubleClick={() => setEditElementId("email")} onMouseEnter={() => setCurrentHoverElement("email")} onMouseLeave={() => setCurrentHoverElement(null)}>
                                        <EnvelopeIcon className="inline-flex items-center -ml-0.5 mr-1.5 h-5 w-5 hover:text-blue-500 text-blue-400" aria-hidden="true" />
                                        {
                                            editElementId === "email" ?
                                                <input onChange={handleInputChange} name="email" type="text" value={`${formData?.email}`} style={{ width: `${(formData?.email.length) * 7}px` }} className="text-sm w-auto outline-none border-b  font-medium " />
                                                :
                                                <label className=" text-sm text-gray-700  font-normal block items-center">
                                                    {formData?.email}
                                                </label>
                                        }


                                        {currentHoverElement === "email" && editElementId !== "email" && <button type="button" className="inline-flex items-center" onClick={() => setEditElementId("email")} ><PencilIcon className="inline-flex ml-0.5 mr-1.5 h-4 w-4 hover:text-blue-500 text-gray-400" aria-hidden="true" /></button>}

                                        {editElementId === "email" &&
                                            <div className="inline-flex items-center space-x-2 ms-3">
                                                <button title="Save" type="button" onClick={() => handleSaveField("email")} ><i className="fa-solid  fa-floppy-disk text-primary-600"></i></button>
                                                <button title="Cancel" type="button" onClick={() => setEditElementId(null)} ><XMarkIcon className="inline-flex ml-0.5 mr-1.5 h-5 w-5 hover:text-blue-500 text-gray-400" aria-hidden="true" /></button>
                                            </div>}
                                    </div>

                                    <div className="flex" onDoubleClick={() => setEditElementId("contact")} onMouseEnter={() => setCurrentHoverElement("contact")} onMouseLeave={() => setCurrentHoverElement(null)}>
                                        <PhoneIcon className="inline-flex -ml-0.5 mr-1.5 h-5 w-5 hover:text-blue-500 text-blue-400" aria-hidden="true" />
                                        {
                                            editElementId === "contact" ?
                                                <input onChange={handleInputChange} name="contact" type="text" value={`${formData?.contact}`} style={{ width: `${(formData?.contact?.length) * 10}px` }} className="text-sm w-auto outline-none border-b  font-medium " />
                                                :
                                                <label className=" text-sm text-gray-700  font-normal block items-center">
                                                    {formData?.contact || "NA"}
                                                </label>
                                        }


                                        {currentHoverElement === "contact" && editElementId !== "contact" && <button type="button" className="inline-flex items-center ms-1" onClick={() => setEditElementId("contact")} ><PencilIcon className="inline-flex ml-0.5 mr-1.5 h-4 w-4 hover:text-blue-500 text-gray-400" aria-hidden="true" /></button>}

                                        {editElementId === "contact" &&
                                            <div className="inline-flex items-center space-x-2 ms-3">
                                                <button title="Save" type="button" onClick={() => handleSaveField("contact")} ><i className="fa-solid  fa-floppy-disk text-primary-600"></i></button>
                                                <button title="Cancel" type="button" onClick={() => setEditElementId(null)} ><XMarkIcon className="inline-flex ml-0.5 mr-1.5 h-5 w-5 hover:text-blue-500 text-gray-400" aria-hidden="true" /></button>
                                            </div>}
                                    </div>


                                </div>
                            </div>

                            <div className=" overflow-hidden max-h-24 sm:max-h-44 sm:h-40  rounded-xl flex flex-col justify-between items-start ">
                                <div>
                                    <div className="mb-1" >
                                        <label className="text-xl font-medium">Organization Details</label>
                                    </div>
                                    <p className="text-gray-600 text-sm"><SparklesIcon className="inline-flex -ml-0.5 mr-1.5 h-5 w-5 hover:text-blue-500 text-blue-400" aria-hidden="true" /> Premium Account</p>
                                </div>

                                <div className=" space-y-3">
                                    <div className="flex" title="Organization Name">
                                        <IdentificationIcon className="inline-flex -ml-0.5 mr-1.5 h-5 w-5 hover:text-blue-500 text-blue-400" aria-hidden="true" />
                                        <label className=" text-sm text-gray-600  font-normal block items-center">
                                            {userDetails?.org?.org_name} (www.{userDetails?.org?.org_domain})
                                        </label>
                                    </div>
                                    <div className="flex space-x-3" title="Location">
                                        <div className="flex">
                                            <MapPinIcon className="inline-flex -ml-0.5 mr-1.5 h-5 w-5 hover:text-blue-500 text-blue-400" aria-hidden="true" />
                                            <label className=" text-sm text-gray-600  font-normal block items-center">
                                                {userDetails?.org?.org_location}
                                            </label>
                                        </div>
                                        {/* <div className="flex" title="Tier">
                                    <SparklesIcon className="inline-flex -ml-0.5 mr-1.5 h-5 w-5 hover:text-blue-500 text-blue-400" aria-hidden="true" />
                                    <label className=" text-sm text-gray-600  font-normal block items-center">
                                        Premium Account
                                    </label>
                                </div> */}
                                        <div className="border"></div>
                                        <div className="flex" title="Team Members">
                                            <UsersIcon className="inline-flex -ml-0.5 mr-1.5 h-5 w-5 hover:text-blue-500 text-blue-400" aria-hidden="true" />
                                            <label className=" text-sm text-gray-600  font-normal block items-center">
                                                {kpiMetrics?.team_members?.value || 0}
                                            </label>
                                        </div>
                                    </div>



                                </div>
                            </div>

                        </div>

                        <div className='mt-5 px-2 transition-all bg-transparent  md:h-40 flex flex-col md:flex-row md:justify-between sm:gap-8 ' >
                            {
                                kpiMetrics && Object.keys(kpiMetrics).length > 0 && Object.keys(kpiMetrics).map((key, index) => {
                                    if (!['team_members'].includes(key)) {
                                        return <div key={key} className='w-full md:w-96 h-full flex flex-col justify-center items-center bg-white ring-2  ring-inset ring-blue-100/85  rounded-lg shadow-md'>
                                            {/* <div className='  flex justify-end '>
                                    <span className={` me-3 my-2 px-3 py-2 rounded-lg text-xs font-medium`}></span>
                                </div> */}
                                            <div className=' flex flex-col justify-center items-center'>
                                                <label className='font-bold text-5xl text-primary-600'>{key === "cost" && "$"}{kpiMetrics[key].value || 0}</label>
                                                <p className='text-gray-800'>{kpiMetrics[key].label}</p>
                                            </div>
                                        </div>
                                    }
                                })
                            }
                        </div>


                    </div>
                    {/* {filteredJobs.length > 0 ? */}
                    {/* <>
                    <input type="file" accept="image/*" id="profile_pic" onChange={handleProfilePicChange} />
                    {previewUrl && (
                        <img src={previewUrl} alt="Profile Preview" style={{ maxWidth: '100px', maxHeight: '100px' }} />
                    )}
                </> */}
                    {/* :
<div className='w-full h-full flex items-center justify-center text-center text-sm p-5 '>{jobsLoading ? <SpinLoader loadingText={"Fetching Jobs"} fill={'blue'} /> : "No Jobs listings found"}</div>
} */}

                </div>
            }


        </>
    );
}

export default Profile;