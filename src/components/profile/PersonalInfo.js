import { useContext, useEffect, useRef, useState } from "react";
import "./Profile.css";
import ProfileNavbar from "./ProfileNavbar";
import AuthContext from "../../context/AuthContext";
import { PencilIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { api } from "../../constants/constants";

const PersonalInfo = () => {

    const { authTokens, userDetails, setUserDetails } = useContext(AuthContext);
    const fileInputRef = useRef(null);
    const [currentHoverElement, setCurrentHoverElement] = useState(null)
    const [editElementId, setEditElementId] = useState(null)
    const [profilePic, setProfilePic] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loadingPic, setLoadingPic] = useState(false);
    const [editingField, setEditingField] = useState(null); // Keeps track of the field being edited
    const [btnDisabled, setBtnDisabled] = useState(false); // Keeps track of the field being edited

    const [formData, setFormData] = useState({
        id: '',
        email: '',
        org_domain: '',
        name: '',
        contact: '',
        country: '',
        profile_pic: null,
    });

    const [kpiMetrics, setKpiMetrics] = useState({
        total_jobs: { label: "Total Jobs", value: 0 },
        jobs_open: { label: "Jobs Open", value: 0 },
        total_applicants: { label: "No. of Applicants", value: 0 },
        team_members: { label: "Team Members", value: 40 },
        cost: { label: "Cost", value: 0 }
    })

    // console.count("profile rerender")

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
            newFormData.country = userDetails.country;
            if (userDetails.profile_pic) {
                setPreviewUrl(true)
            }
            setFormData(newFormData)
        }
    }, [userDetails])


    const handleEditClick = (field) => {
        setEditingField(field);
        setFormData((prev)=> (
            {
                ...prev,
                [field]: userDetails[field]
            }
        ))
    };

    const handleInputChange = (e) => {
        // if (e.target.name === "email") {
        //     console.log(validateEmail(e.target.value))
        //     if (validateEmail(e.target.value)) setBtnDisabled(false)
        //     else setBtnDisabled(true)
        // }
        // if (e.target.name === "contact") {
        //     console.log(validateContact(e.target.value))
        //     if (validateContact(e.target.value)) setBtnDisabled(false)
        //     else setBtnDisabled(true)
        // }
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const validateEmail = (email) => {
        // Email validation regex
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    };

    const validateContact = (contact) => {
        const contactRegex = /^\d{10}$/; // Regular expression to check for exactly 10 digits
        return contactRegex.test(contact);
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
            const response = await fetch(`${api}/accounts/users/${userDetails.id}/`,
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
                setEditingField(null)
                setUserDetails((data) => {
                    return {
                        ...data,
                        [field]: formData[field]
                    }
                })
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
                <div className="w-full flex overflow-hidden h-full">
                    {/* <div className="w-1/6"><ProfileNavbar /></div> */}

                    <div
                        className="w-full bg-white overflow-auto"
                        style={{ height: 'calc(100dvh - 57px)' }}
                    >
                        <div
                            className="w-full   rounded-lg"
                        // style={{ height: "calc(100dvh - 150px)" }}
                        >
                            <div className="px-8 py-4">
                                <h3 className="text-xl font-semibold leading-7 text-gray-900">
                                    Personal Information
                                </h3>
                                <p className="text-sm leading-6 text-gray-500">
                                    Personal details and application.
                                </p>
                            </div>
                            <div className="px-8 py-4 border-t border-gray-100">
                                <div className="w-auto flex gap-4 items-center">
                                    <div id="profile-image" className="relative profile-image overflow-hidden h-28 w-28 rounded-xl inline-flex flex-col justify-center items-center  ">
                                        {
                                            !loadingPic ?
                                                <>
                                                    {
                                                        formData.profile_pic ?
                                                            <img className="w-28 h-28 rounded-lg border-2 overflow-y-hidden" src={formData.profile_pic} alt="Profile Picture" />
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
                                        (<div className="flex flex-col gap-2">
                                            <label className="bg-white ring-2 ring-indigo-400 text-indigo-600 font-medium hover:ring-indigo-600 px-4 py-2 h-fit rounded-md text-sm cursor-pointer" htmlFor="profile_pic">Change avatar</label>
                                            <span className="text-xs text-slate-400">JPG, JPEG or PNG(1MB Max)</span>
                                        </div>)
                                    }
                                </div>
                                <dl className="divide-y divide-gray-100">
                                    <div className="px-4 py-6 sm:grid sm:grid-cols-4 sm:gap-4 sm:px-8">
                                        <dt className="text-sm font-medium leading-6 text-gray-900">
                                            Name
                                        </dt>

                                        <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                                            {/* {formData.name} */}
                                            {editingField === "name" ?
                                                (<div className="flex gap-2">
                                                    <input type="text" name="name" value={formData.name} className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block ps-4 p-2.5" onChange={handleInputChange}></input>
                                                </div>) :
                                                (<>
                                                    {userDetails.name}
                                                </>)
                                            }
                                        </dd>

                                        <dd className="mt-1 text-sm leading-6 text-end text-gray-700 sm:mt-0 self-center">
                                            {editingField === "name" ? (<div className="flex gap-3 justify-end">
                                                <button onClick={() => handleSaveField("name")} className="text-indigo-500 font-semibold disabled:text-indigo-200" disabled={formData.name === ""}>
                                                    Save
                                                </button>
                                                <button onClick={() => setEditingField(null)} className="font-semibold">
                                                    Cancel
                                                </button>
                                            </div>) : <button className="text-indigo-500 font-semibold" onClick={() => handleEditClick('name')}>Update</button>}
                                        </dd>
                                    </div>
                                    <div className="px-4 py-6 sm:grid sm:grid-cols-4 sm:gap-4 sm:px-8">
                                        <dt className="text-sm font-medium leading-6 text-gray-900">
                                            Email
                                        </dt>
                                        <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                                            {editingField === "email" ?
                                                (<div className="flex gap-2">
                                                    <input type="text" name="email" value={formData.email} className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block ps-4 p-2.5" onChange={(e) => handleInputChange(e)}></input>
                                                </div>) :
                                                (<>
                                                    {userDetails.email}
                                                </>)
                                            }
                                        </dd>

                                        <dd className="mt-1 text-sm leading-6 text-end text-gray-700 sm:mt-0 self-center">
                                            {editingField === "email" ? (<div className="flex gap-3 justify-end">
                                                <button onClick={() => handleSaveField("email")} className="text-indigo-500 font-semibold disabled:text-indigo-200" disabled={formData.email === "" || !validateEmail(formData.email)}>
                                                    Save
                                                </button>
                                                <button onClick={() => setEditingField(null)} className="font-semibold">
                                                    Cancel
                                                </button>
                                            </div>) : <button className="text-indigo-500 font-semibold" onClick={() => handleEditClick('email')}>Update</button>}
                                        </dd>
                                    </div>
                                    <div className="px-4 py-6 sm:grid sm:grid-cols-4 sm:gap-4 sm:px-8">
                                        <dt className="text-sm font-medium leading-6 text-gray-900">
                                            Contact Number
                                        </dt>
                                        <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                                            {editingField === "contact" ?
                                                (<div className="flex gap-2">
                                                    <input type="text" name="contact" value={formData.contact} className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block ps-4 p-2.5" onChange={handleInputChange}></input>
                                                </div>) :
                                                (<>
                                                    {userDetails.contact}
                                                </>)
                                            }
                                        </dd>
                                        <dd className="mt-1 text-sm leading-6 text-end text-gray-700 sm:mt-0 self-center">
                                            {editingField === "contact" ? (<div className="flex gap-3 justify-end">
                                                <button onClick={() => handleSaveField("contact")} className="text-indigo-500 font-semibold disabled:text-indigo-200" disabled={formData.contact === "" || !validateContact(formData.contact)}>
                                                    Save
                                                </button>
                                                <button onClick={() => setEditingField(null)} className="font-semibold">
                                                    Cancel
                                                </button>
                                            </div>) : <button className="text-indigo-500 font-semibold" onClick={() => handleEditClick('contact')}>Update</button>}
                                        </dd>
                                    </div>
                                    <div className="px-4 py-6 sm:grid sm:grid-cols-4 sm:gap-4 sm:px-8">
                                        <dt className="text-sm font-medium leading-6 text-gray-900">
                                            Role
                                        </dt>
                                        <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                                            {userDetails.role.name}
                                        </dd>
                                        <dd className="mt-1 text-sm leading-6 text-end text-gray-700 sm:mt-0 self-center">
                                        </dd>
                                    </div>
                                    <div className="px-4 py-6 sm:grid sm:grid-cols-4 sm:gap-4 sm:px-8">
                                        <dt className="text-sm font-medium leading-6 text-gray-900">
                                            Location
                                        </dt>
                                        <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0 self-center">
                                            {editingField === "country" ?
                                                (<div className="flex gap-2">
                                                    <input type="text" name="country" value={formData.country} className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block ps-4 p-2.5" onChange={handleInputChange}></input>
                                                </div>) :
                                                (<>
                                                    {formData.country || "Not Available"}
                                                </>)
                                            }
                                        </dd>
                                        <dd className="mt-1 text-sm leading-6 text-end text-gray-700 sm:mt-0">
                                            {editingField === "country" ? (<div className="flex gap-3 justify-end">
                                                <button onClick={() => handleSaveField("country")} className="text-indigo-500 font-semibold disabled:text-indigo-200" disabled={formData.country === ""}>
                                                    Save
                                                </button>
                                                <button onClick={() => setEditingField(null)} className="font-semibold">
                                                    Cancel
                                                </button>
                                            </div>) : <button className="text-indigo-500 font-semibold" onClick={() => handleEditClick('country')}>Update</button>}
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                        <div
                            className="w-full bg-white  rounded-lg"
                        // style={{ height: "calc(100dvh - 150px)" }}
                        >
                            <div className="px-8 py-4 ">
                                <h3 className="text-xl font-semibold leading-7 text-gray-900">
                                    Organization Information
                                </h3>
                                <p className="text-sm leading-6 text-gray-500">
                                    Organization details.
                                </p>
                            </div>
                            <div className="px-8 py-4 border-t border-gray-100">
                                <dl className="divide-y divide-gray-100">
                                    {/* <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                        <dt className="text-sm font-medium leading-6 text-gray-900">
                                            Social Accounts
                                        </dt>
                                        <div className="flex gap-3">
                                            <Link
                                                to={`${applicant.linkedin}`}
                                                className="mt-1 w-fit  text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0"
                                            >
                                                {applicant.linkedin && (
                                                    <i class="ms-1 fa-brands fa-linkedin text-2xl"></i>
                                                )}
                                            </Link>
                                            <Link
                                                to={`${applicant.github}`}
                                                className="mt-1 w-fit  text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0"
                                            >
                                                {applicant.github && (
                                                    <i class="ms-1 fa-brands fa-github text-2xl"></i>
                                                )}
                                            </Link>
                                        </div>
                                    </div> */}
                                    <div className="px-4 py-6 sm:grid sm:grid-cols-4 sm:gap-4 sm:px-8">
                                        <dt className="text-sm font-medium leading-6 text-gray-900">
                                            Organization name
                                        </dt>

                                        <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                                            {userDetails.org.org_name}
                                        </dd>

                                        <dd className="mt-1 text-sm leading-6 text-end text-gray-700 sm:mt-0">

                                        </dd>
                                    </div>
                                    <div className="px-4 py-6 sm:grid sm:grid-cols-4 sm:gap-4 sm:px-8">
                                        <dt className="text-sm font-medium leading-6 text-gray-900">
                                            Domain
                                        </dt>
                                        <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                                            <a href={userDetails.org?.org_domain}>www.{userDetails.org.org_domain}</a>
                                        </dd>

                                        <dd className="mt-1 text-sm leading-6 text-end text-gray-700 sm:mt-0">

                                        </dd>
                                    </div>
                                    <div className="px-4 py-6 sm:grid sm:grid-cols-4 sm:gap-4 sm:px-8">
                                        <dt className="text-sm font-medium leading-6 text-gray-900">
                                            Organization Tier
                                        </dt>
                                        <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                                            {userDetails.org?.org_tier}
                                        </dd>
                                        <dd className="mt-1 text-sm leading-6 text-end text-gray-700 sm:mt-0">

                                        </dd>
                                    </div>
                                    <div className="px-4 py-6 sm:grid sm:grid-cols-4 sm:gap-4 sm:px-8">
                                        <dt className="text-sm font-medium leading-6 text-gray-900">
                                            Location
                                        </dt>
                                        <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                                            {userDetails.org?.org_location || "Not Available"}
                                        </dd>
                                        <dd className="mt-1 text-sm leading-6 text-end text-gray-700 sm:mt-0">

                                        </dd>
                                    </div>
                                </dl>
                            </div>
                        </div>

                        {/* <div
                            className="p-1 w-full  lg:max-w-xl  rounded-lg shadow-md ring-2 ring-indigo-200 "
                            style={{
                                backgroundImage:
                                    "linear-gradient(144deg, #6867ac, #abe9fb 50%,#b294e7)",
                            }}
                        >
                            <div className="pt-3 ps-3 h-full bg-sky-50 rounded-lg overflow-auto">
                                <div className="flex space-x-2 items-center ">
                                    <img src={PremiumImg} width={26} />
                                    <h3 className="text-base font-semibold leading-7 text-emerald-600">
                                        {" "}
                                        AI Summary
                                    </h3>
                                </div>
                                <p className="mt-1 p-3  text-sm leading-6 text-slate-900">
                                    <div
                                        dangerouslySetInnerHTML={{ __html: resumeDetail.ai_summary }}
                                    />
                                </p>
                            </div>
                        </div> */}
                    </div >
                </div >
            }


        </>
    );
}

export default PersonalInfo;