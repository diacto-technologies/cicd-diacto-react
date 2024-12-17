import { useContext, useEffect, useState } from "react";
import AuthContext from "../../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import CandidateFormHeading from "../../utils/header/CandidateFormHeading";
import JobDetail from "../jobs/JobDetail";
import CandidateQuestions from "../../utils/header/CandidateQuestions";
import './CandidateForm.css'
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.bubble.css';
import CandidHRLogo from "../../assets/PNG/icon_whiteB.png"
import { api } from "../../constants/constants";
const CandidateForm = ({ }) => {

    // const { user, authTokens, logoutUser } = useContext(AuthContext);

    const navigate = useNavigate();
    const [jobDetail, setJobDetail] = useState([]);
    const [description, setDescription] = useState([]);
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isPublished, setIsPublished] = useState(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [applicationData, setApplicationData] = useState({});
    const [preference, setPreference] = useState(null)
    const { jobkey } = useParams()
    const [location, setLocation] = useState(null);
    const [city, setCity] = useState(null);
    const [state, setState] = useState(null);
    const [country, setCountry] = useState(null);
    const [orgLogo, setOrgLogo] = useState('')
    const [userName, setUserName] = useState('')
    const [showDescription, setShowDescription] = useState(false)

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    })
                    reverseGeocode(position.coords.latitude, position.coords.longitude)
                },
                (error) => {
                    console.error('Error getting geolocation:', error);
                }
            );
        } else {
            console.error('Geolocation is not supported by this browser.');
        }
    }, []);

    const reverseGeocode = (latitude, longitude) => {
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
            .then(response => response.json())
            .then(data => {
                setCity(data.address.city || data.address.village || data.address.town || data.address.hamlet);
                setState(data.address.state || data.address.country);
                setCountry(data.address?.country)
            })
            .catch(error => console.error('Reverse geocoding failed:', error));
    };

    useEffect(() => {
        // console.count("fetching job data")
        fetchJob()
    }, [])

    useEffect(() => {
        if (jobDetail) {

        }
    }, [jobDetail])

    const [showFullDescription, setShowFullDescription] = useState(false);

    const toggleDescription = () => {
        setShowFullDescription(!showFullDescription);
    };

    const fetchJob = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${api}/jobs/candidate-view/${jobkey}/`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        // Authorization: "Bearer " + String(authTokens.access),
                    },
                });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            fetchScreeningPreference(data.id)

            setDescription(data.description?.replace(/\n/g, '<br>'))
            const isClosed = new Date() > new Date(data.close_date)
            setIsPublished(data.published && !isClosed ? true : false)
            const logo = await getOrgLogo(data.organization.id)
            setOrgLogo(logo)
            if (!data.published) {
                setError('Page not found')
            }
            if (data.published && isClosed) {
                setError('This job has been closed')
            }
            setLoading(false);
            setJobDetail(data);
        } catch (error) {
            setLoading(false);
            setIsPublished(false);
            setError('Page not found');
        }
    };

    const fetchScreeningPreference = async (jobId) => {
        // fetch the step using workflow id and return the step.

        if (jobId) {
            const response = await fetch(`${api}/resume_parser/resume-screening-preferences/?job_id=${jobId}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        // Authorization: "Bearer " + String(authTokens.access),
                    },
                })

            const data = await response.json();

            if (data) {
                setPreference(data.results[0])
            }
        }
    }

    const getOrgLogo = async (id) => {
        try {
            const response = await fetch(`${api}/accounts/organization-logo/${id}/`, {
                method: 'GET',
                headers: {
                    // Authorization: "Bearer " + String(token.access),
                }
            });

            if (!response.ok) {
                throw new Error('Failed to download profile picture');
            }

            const blobData = await response.blob();
            const imageUrl = URL.createObjectURL(blobData);

            return imageUrl



        } catch (error) {
            console.error('Error downloading Pic:', error);
        }
    };


    return (
        <>
            {
                jobDetail.length === 0 && isPublished === null ? (
                    // Optionally, add a loading spinner or something else here to indicate that data is being loaded
                    <>
                        <div className="h-screen w-full flex items-center justify-center bg-transparent md:bg-gray-50 lg:px-14 lg:py-5">
                            <div className="flex h-full justify-evenly items-center  ">
                                <label>Loading...</label>
                            </div>
                        </div>
                    </>
                ) : (
                    jobDetail && isPublished ?
                        <div className="h-screen w-full flex items-center justify-center bg-transparent md:bg-gray-50 lg:px-14 lg:py-5">

                            {
                                loading ?
                                    <div className="flex h-full justify-evenly items-center  ">
                                        <label>Loading...</label>
                                    </div>
                                    :
                                    <>
                                        <div class="background-svg bottom-0">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
                                                <path fill="#7474f3" fill-opacity="1" d="M0,64L48,53.3C96,43,192,21,288,64C384,107,480,213,576,229.3C672,245,768,171,864,165.3C960,160,1056,224,1152,234.7C1248,245,1344,203,1392,181.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                                            </svg>
                                        </div>
                                        {/* <div className="bg-transparent md:bg-white relative z-10 flex flex-col justify-start md:justify-evenly h-90 px-5 md:py-5 md:px-10 rounded-3xl overflow-auto md:overflow-hidden"> */}
                                        <div className={`bg-transparent ${!showDescription && "w-4/6"} md:bg-white relative z-10 flex flex-col justify-start md:justify-evenly h-screen md:h-[95%] py-6 px-5 md:py-5 md:px-10 rounded-3xl overflow-auto md:overflow-hidden`}>

                                            <div className={`flex flex-col-reverse md:flex-row mb-3 gap-3 md:gap-0 pb-4 md:pb-0 border-b md:border-0`}>
                                                <CandidateFormHeading jobDetail={jobDetail} />
                                                <div className="flex gap-5 items-center justify-end">

                                                    {orgLogo && <img src={orgLogo} className="w-fit h-fit max-h-12" />}
                                                    <span className="text-gray-500">+</span>
                                                    <img src={CandidHRLogo} className="w-fit h-fit max-h-12" />
                                                </div>
                                            </div>
                                            <div className="w-full relative">
                                                <button
                                                    onClick={() => {
                                                        setShowDescription(!showDescription);
                                                    }}
                                                    className="transitions-all text-indigo-500 px-3 py-1.5 rounded-md ring-2 ring-indigo-300 hover:ring-indigo-600 hover:text-indigo-700"
                                                >{showDescription ? "Hide Description" : "Show Description"}
                                                </button>
                                            </div>

                                            <div className="md:flex md:h-5/6 bg-white justify-evenly items-start w-full py-3">
                                                {showDescription && (<>
                                                    <div className={`w-full md:w-3/6 mb-3 md:mb-0 md:h-full flex flex-col justify-start items-center me-4 px-4 ${isSubmitted && 'hidden md:flex flex-col'}`} >
                                                        <div className="mb-2 mt-2 w-full ">
                                                            {/* <TextToSpeech setIsSpeaking={setIsSpeaking} isSpeaking={isSpeaking} text={`माझं नाव शुभम आहे`}  /> */}
                                                            <label className=" font-medium text-base tracking-normal">Must Have Skills</label>
                                                            {
                                                                jobDetail.must_have_skills?.length > 0 && jobDetail.must_have_skills[0].label !== "" ?
                                                                    <dd className="mt-1  text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                                                                        {jobDetail.must_have_skills.map((skill, index) => (
                                                                            <span key={index} className={`inline-flex items-center rounded-md me-2 mb-2 px-2 py-1 text-xs font-medium text-indigo-500 ring-1 bg-gray-50  ring-indigo-300`}>
                                                                                {skill.label}
                                                                            </span>

                                                                        ))}

                                                                    </dd>
                                                                    :
                                                                    <dd className="text-gray-500">Could not extract skills or not found</dd>

                                                            }
                                                        </div>


                                                        <label className="  font-bold text-base md:text-xl tracking-normal w-full">Job Description</label>
                                                        {description &&
                                                            <div className={`px-4 py-2 text-xs md:text-base h-48 md:h-auto my-3 md:my-0 overflow-auto`}>
                                                                <ReactQuill theme="bubble"
                                                                    value={jobDetail.jd_html || description}
                                                                    className="overflow-auto"
                                                                    readOnly={true}

                                                                />
                                                            </div>
                                                            // <div className={`px-4 py-2 text-xs md:text-base h-80p my-3 md:my-0   ${showFullDescription ? 'overflow-auto' : 'overflow-hidden'}`} dangerouslySetInnerHTML={{ __html: description }} />
                                                        }
                                                    </div>
                                                    <div className="border h-full hidden md:flex"></div>
                                                </>)}
                                                {!isSubmitted ?
                                                    <div className={`md:${showDescription ? "w-1/2" : "w-full"} md:mt-5 sm:mt-0 bg-transparent md:h-full flex flex-col items-center justify-center me-4 px-4 gap-3`}>
                                                        <div className={`w-full h-full`}>
                                                            <CandidateQuestions setUserName={setUserName} workflow_id={jobDetail.interview_module} preference={preference} jobDetail={jobDetail} city={city} state={state} setIsSubmitted={setIsSubmitted} jobkey={jobkey} country={country} />
                                                        </div>
                                                    </div>
                                                    :
                                                    <div className="w-full md:w-3/6 flex flex-col justify-center items-center h-full me-4 px-4">
                                                        <label className="mb-5 font-bold antialiased text-3xl text-gray-700 p-3 text-center">Thank You, {userName}!</label>
                                                        <div class="image mb-5">
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><g stroke-width="0" id="SVGRepo_bgCarrier"></g><g stroke-linejoin="round" stroke-linecap="round" id="SVGRepo_tracerCarrier"></g><g id="SVGRepo_iconCarrier"> <path stroke-linejoin="round" stroke-linecap="round" stroke-width="1.5" stroke="white" d="M20 7L9.00004 18L3.99994 13"></path> </g></svg>
                                                        </div>
                                                        <label className="font-medium antialiased text-xl text-center text-gray-700 p-3">Your Application Has Been Successfully Submitted</label>
                                                        <p className="text-sm text-gray-500 w-full text-center">We appreciate your interest. Our team is currently reviewing your application, and we’ll be in touch with you shortly.</p>
                                                    </div>
                                                }
                                            </div>
                                        </div>
                                    </>
                            }
                        </div>
                        :
                        <>
                            <div class="page-404 grid h-screen w-full place-items-center relative px-6 py-24 sm:py-32 lg:px-8">
                                <div class="background-svg bottom-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
                                        <path fill="#7474f3" fill-opacity="1" d="M0,64L48,53.3C96,43,192,21,288,64C384,107,480,213,576,229.3C672,245,768,171,864,165.3C960,160,1056,224,1152,234.7C1248,245,1344,203,1392,181.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                                    </svg>
                                </div>
                                <div class="text-container relative z-10">
                                    {error === "Page not found" && <p class="text-base font-semibold text-blue-700">404</p>}
                                    {
                                        error &&
                                        <>
                                            <h1 class="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">{error}</h1>
                                            {error === "Page not found" && <p class="mt-6 text-base leading-7 text-gray-600">Sorry, we couldn’t find the page you’re looking for.</p>}
                                        </>
                                    }
                                </div>
                            </div>

                        </>
                )
            }

        </>
    )
}

export default CandidateForm;