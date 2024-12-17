import { useContext, useEffect, useRef, useState } from "react";
import "./Profile.css"
import AuthContext from "../../context/AuthContext";
import ProfileNavbar from "./ProfileNavbar";

const Notifications = () => {

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

    return (
        <>
            {
                userDetails &&
                <div className="h-screen w-full flex">
                    {/* sidebar  */}
                    <ProfileNavbar />

                    {/* body  */}
                    <div className="h-full w-5/6 bg-gray-50 flex flex-col px-8">
                    <div className="mt-5 font-semibold text-[28px] pb-5 border-b">
                        Notifications
                    </div>
                    <div className="mt-5 text-lg font-medium">
                        <label>
                            Account notifications
                        </label>
                    </div>
                    
                    </div>
                </div>
            }


        </>
    );
}

export default Notifications;