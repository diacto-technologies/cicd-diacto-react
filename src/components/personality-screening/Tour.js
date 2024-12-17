import { MicrophoneIcon, VideoCameraIcon } from "@heroicons/react/20/solid";
import { CheckCircleIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import { useContext, useEffect, useState } from "react";
import SpinLoader from "../../utils/loaders/SpinLoader";
import { useNavigate, useParams } from "react-router-dom";
import AuthContext from "../../context/AuthContext";
import { api } from "../../constants/constants";

const Tour = () => {
    // const {  userDetails } = useContext(AuthContext);
    const [webcamEnabled, setWebcamEnabled] = useState(false);
    const [micEnabled, setMicEnabled] = useState(false);
    const [testing, setTesting] = useState(false)
    const [error, setError] = useState(null)
    const navigate = useNavigate();
    const { candidateId, screeningId } = useParams();
    const [screeningDetails, setScreeningDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isCompleted, setIsCompleted] = useState(false);
    const [completedText, setCompletedText] = useState('');
    const [skipTour, setSkipTour] = useState(false);

    useEffect(() => {
        console.count("fetching data")
        fetchScreeningDetails()
    }, [screeningId])

    const testWebcam = async () => {
        try {
            setTesting(true);
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            setError(null)
            setWebcamEnabled(true);
            stream.getTracks().forEach(track => track.stop()); // Stop the stream after testing
            setTesting(false)
        } catch (err) {
            console.error('Error accessing webcam:', err);
            setError(err)
            setWebcamEnabled(false);
            setTesting(false)
        }
    };

    const testMic = async () => {
        try {
            setTesting(true);
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setError(null)
            setMicEnabled(true);

            stream.getTracks().forEach(track => track.stop()); // Stop the stream after testing
            setTesting(false)
        } catch (err) {
            console.error('Error accessing microphone:', err);
            setError(err)
            setMicEnabled(false);
            setTesting(false)
        }
    };

    const markLinkOpened = async (id) => {
        const headers = {
            "Content-Type": "application/json",
          
        };
    
        try {
            const response = await fetch(`${api}/personality-screening/personality-screenings/${screeningId}/`, {
                method: "PATCH",
                headers: headers,
                body: JSON.stringify({
                    link_opened: true,
                    link_opened_at: new Date().toISOString(),
                    status_text : "Link Opened"  // Convert date to ISO string
                })
            });
    
            if (!response.ok) {
                if (response.status === 404) {
                    navigate('/page-not-found/');
                } else {
                    const errorData = await response.json();  // Optional: Get more details from the response
                    console.error('Error:', errorData);
                    throw new Error('One or more network responses were not ok');
                }
            }
        } catch (error) {
            console.error('Fetch error:', error);
            // Handle additional errors as needed
        }
    };

    const fetchScreeningDetails = async () => {
        setLoading(true);

        if (candidateId && screeningId) {
            const headers = {
                "Content-Type": "application/json",
                // Authorization: "Bearer " + String(authTokens.access),
            };

            try {
                const [screeningResponse] = await Promise.all([

                    fetch(`${api}/personality-screening/personality-screenings/${screeningId}/`, {
                        method: "GET",
                        headers: headers,
                    })
                ]);

                if (!screeningResponse.ok) {
                    console.error('One or more network responses were not ok');
                    if (screeningResponse.status === 404) {
                        navigate('/page-not-found/')
                    }else{
                        throw new Error('One or more network responses were not ok');
                    }
                }

                const [screeningData] = await Promise.all([
                    screeningResponse.json()
                ]);


                setScreeningDetails(screeningData)
                if (screeningData &&  (!screeningData.started && !screeningData.link_opened)) {
                    markLinkOpened(screeningData.id)
                }
                if (screeningData && screeningData.completed && screeningData?.step?.completed) {

                    setIsCompleted(true)
                    setCompletedText("We have already received your response.")
                }
                // Process both candidateData and screeningData as needed

                setLoading(false);
                // Update state or perform further actions
            } catch (error) {
                setLoading(false);
                setError('Page not found');
            }
        }
    };

    const startTour = () => {
        if (skipTour) {
            navigate(`/app/candidate/personality-screening/${candidateId}/${screeningId}/start/`)
        }else{
            navigate(`/app/candidate/personality-screening/${candidateId}/${screeningId}/tour/`)
        }
    }

    return (
        <>
            {/* <div className="w-full h-screen overflow-hidden flex items-center justify-center bg-primary-600">

            </div> */}



            {!loading &&
                <div class="page-404 flex items-center justify-center h-screen w-full  relative px-6 py-24 sm:py-32 lg:px-8 bg-gradient-to-b from-[#7474f4] to-[#a5a5fa]">
                    <div class="background-svg bottom-0">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
                            <path fill="#7474f4" fill-opacity="1" d="M0,64L48,53.3C96,43,192,21,288,64C384,107,480,213,576,229.3C672,245,768,171,864,165.3C960,160,1056,224,1152,234.7C1248,245,1344,203,1392,181.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                        </svg>
                    </div>
                    {
                        isCompleted ?
                            <div className=" py-16 sm:py-16 rounded-lg z-10">

                                <section class="relative h-full w-full isolate overflow-hidden  sm:py-32 lg:px-12 flex items-center justify-center">
                                    {/* <div class="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.100),white)] opacity-20"></div>
                            <div class="absolute inset-y-0 right-1/2 -z-10 mr-16 w-[200%] origin-bottom-left skew-x-[-30deg] bg-white shadow-xl shadow-indigo-600/10 ring-1 ring-indigo-50 sm:mr-28 lg:mr-0 xl:mr-16 xl:origin-center"></div> */}
                                    <div class="mx-auto max-w-2xl lg:max-w-4xl ">
                                        {/* <img class="mx-auto h-12" src="https://tailwindui.com/img/logos/workcation-logo-indigo-600.svg" alt="" /> */}

                                        <figure class="mt-10">
                                            <blockquote class="text-center text-2xl font-semibold leading-8 text-gray-900 sm:text-3xl sm:leading-9">
                                                <p className="text-3xl text-white" >{completedText}</p>
                                                <p className="text-base text-gray-100 mt-5">Our team will update you with further steps.</p>
                                            </blockquote>

                                        </figure>
                                    </div>
                                </section>
                            </div>
                            :

                            <div className="bg-white py-16 sm:py-16 rounded-lg shadow-2xl  z-10">
                                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                                    <div className="mx-auto max-w-2xl lg:text-center">
                                        {/* <h2 className="text-base font-semibold leading-7 text-primary-600">Deploy faster</h2> */}
                                        <p className="mt-2 text-xl font-bold tracking-tight text-gray-900 sm:text-3xl">Personality Screening</p>

                                    </div>
                                    <div className="mx-auto mt-10 max-w-2xl sm:mt-12 lg:mt-16 lg:max-w-4xl text-start">
                                        <p className="text-base font-medium leading-8 text-gray-600 ">Please refer below guidelines before starting your personality screening:</p>
                                        <dl className="flex mt-4 flex-col gap-y-6 justify-start items-start">
                                            <div className="relative pl-16">
                                                <dt className="text-sm font-normal leading-7 text-gray-900">
                                                    <div className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
                                                        <InformationCircleIcon className="w-5 h-5 text-white" />
                                                    </div>
                                                    Please ensure that you maintain eye contact with the camera throughout the test.
                                                </dt>
                                                {/* <dd className="mt-2 text-base leading-7 text-gray-600">Morbi viverra dui mi arcu sed. Tellus semper adipiscing suspendisse semper morbi. Odio urna massa nunc massa.</dd> */}
                                            </div>

                                            <div className="relative pl-16">
                                                <dt className="text-sm font-normal leading-7 text-gray-900">
                                                    <div className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
                                                        <InformationCircleIcon className="w-5 h-5 text-white " />
                                                    </div>
                                                    Kindly refrain from switching tabs or navigating away from the test page during the screening.
                                                </dt>
                                                {/* <dd className="mt-2 text-base leading-7 text-gray-600">Quisque est vel vulputate cursus. Risus proin diam nunc commodo. Lobortis auctor congue commodo diam neque.</dd> */}
                                            </div>
                                            <div className="relative pl-16">
                                                <dt className="text-sm font-normal leading-7 text-gray-900">
                                                    <div className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
                                                        <InformationCircleIcon className="w-5 h-5 text-white" />
                                                    </div>
                                                    Prior to starting the screening, please verify that your camera and microphone are in working order.<br /> Click on the below button to give required permission for webcam and microphone.
                                                    <div className="mt-2 flex self-end items-center gap-x-4">
                                                        <button onClick={() => { testWebcam(); testMic() }} className="px-2.5 py-1.5 bg-white border shadow-sm text-sm rounded-md flex items-center ring-1 ring-sky-400/50"> {testing && <SpinLoader fill={'blue'} />} Test Webcam & Microphone</button>

                                                        {webcamEnabled ? <p className="flex space-x-1"><VideoCameraIcon className="w-5 h-5 text-green-500" /><CheckCircleIcon className="w-5 h-5 text-green-500" /> </p> : <p><VideoCameraIcon className="w-5 h-5 text-gray-500" /></p>}
                                                        {micEnabled ? <p className="flex space-x-1"><MicrophoneIcon className="w-5 h-5  text-green-500" /><CheckCircleIcon className="w-5 h-5 text-green-500" /></p> : <p><MicrophoneIcon className="w-5 h-5 text-gray-500" /></p>}
                                                    </div>
                                                </dt>
                                                {/* <dd className="mt-2 text-base leading-7 text-gray-600">Arcu egestas dolor vel iaculis in ipsum mauris. Tincidunt mattis aliquet hac quis. Id hac maecenas ac donec pharetra eget.</dd> */}
                                            </div>
                                            <div className="relative pl-16">
                                                <dt className="text-sm font-normal leading-7 text-gray-900">
                                                    <div className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
                                                        <InformationCircleIcon className="w-5 h-5 text-white" />
                                                    </div>
                                                    Minimize distractions and ensure a quiet environment to focus fully on the questions and provide thoughtful responses.
                                                </dt>
                                                {/* <dd className="mt-2 text-base leading-7 text-gray-600">Sit quis amet rutrum tellus ullamcorper ultricies libero dolor eget. Sem sodales gravida quam turpis enim lacus amet.</dd> */}
                                            </div>

                                            <div className="relative flex self-end items-center gap-4 mt-5">
                                                {error && <p className="text-sm text-red-500 font-medium  text-start">{error.message}</p>}
                                                <button disabled={!webcamEnabled || !micEnabled} onClick={startTour} className="px-2.5 py-1.5 bg-brand-purple disabled:bg-[#a5a5fa] text-white shadow-sm text-sm rounded-md">Start {skipTour ? "Screening" : "Tour"}</button>
                                                <div className="flex gap-2"><input type="checkbox" onChange={(e) => e.target.checked ? setSkipTour(true) : setSkipTour(false)} /> <label>Skip Tour</label></div>
                                                {/* <button onClick={() => { testWebcam(); testMic() }} className="px-2.5 py-1.5 bg-white border shadow-sm text-sm rounded-md flex items-center"> {testing && <SpinLoader fill={'blue'} />} Test Webcam & Microphone</button> */}

                                                {/* <dd className="mt-2 text-base leading-7 text-gray-600">Arcu egestas dolor vel iaculis in ipsum mauris. Tincidunt mattis aliquet hac quis. Id hac maecenas ac donec pharetra eget.</dd> */}
                                            </div>
                                            {/* <div className="relative flex self-end  gap-x-4">
                                {webcamEnabled ? <p className="flex space-x-1"><VideoCameraIcon className="w-5 h-5 text-green-500" /><CheckCircleIcon className="w-5 h-5 text-green-500" /> </p> : <p><VideoCameraIcon className="w-5 h-5 text-gray-500" /></p>}
                                {micEnabled ? <p className="flex space-x-1"><MicrophoneIcon className="w-5 h-5  text-green-500" /><CheckCircleIcon className="w-5 h-5 text-green-500" /></p> : <p><MicrophoneIcon className="w-5 h-5 text-gray-500" /></p>}
                            </div> */}
                                        </dl>
                                    </div>
                                </div>
                            </div>
                    }
                </div>}

        </>
    );
}

export default Tour;