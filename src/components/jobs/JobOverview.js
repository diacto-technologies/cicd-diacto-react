import { useContext, useEffect, useState } from "react";
import AuthContext from "../../context/AuthContext";
import { useParams } from "react-router-dom";
import '../../utils/react-quill/Toolbar.css'

import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const JobOverview = () => {
    const { user, authTokens, logoutUser } = useContext(AuthContext);
    const [jobDetail, setJobDetail] = useState([]);
    const { jobId } = useParams();
    const [description, setDescription] = useState([]);
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [isSpeaking, setIsSpeaking] = useState(false)
    // console.count("job overview rerender")
    useEffect(() => {
        fetchJob()
    }, [])

    const fetchJob = async () => {
        //console.log("fetching dataset")
        try {
            setLoading(true)
            const response = await fetch(`/jobs/job-detail/${jobId}/`,
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
            setDescription(data.description?.replace(/\n/g, '<br>'))
            setJobDetail(data);
            setLoading(false)

        } catch (error) {
            setError(error);
            setLoading(false)
        }
    };

    return (
        <>
            <div className="mt-5 me-3 h-full p-5 w-full description-card bg-white rounded-3xl shadow-md">
                <label className=" font-medium text-base tracking-normal">Must Have Skills</label>
                {
                    loading ?
                        <div className='h-4/6 my-2 animate-pulse'>
                            <div className="h-5 w-1/3 bg-gray-200 rounded-lg"></div>
                        </div>
                        :
                        <div className=" mb-3 mt-2">
                            {/* <TextToSpeech setIsSpeaking={setIsSpeaking} isSpeaking={isSpeaking} text={`माझं नाव शुभम आहे`}  /> */}
                            {
                                jobDetail.must_have_skills?.length > 0 && jobDetail.must_have_skills[0].label !== "" ?
                                    <dd className="mt-1  text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                                        {jobDetail.must_have_skills.map((skill, index) => (
                                            <span key={index} className={`inline-flex items-center rounded-md me-2  px-2 py-1 text-xs font-medium text-sky-700 bg-gray-50 ring-1 ring-inset ring-gray-600/20' `}>
                                                {skill.label}
                                            </span>

                                        ))}

                                    </dd>
                                    :
                                    <dd className="text-gray-500 text-sm font-thin italic">Could not extract skills or not found</dd>

                            }
                        </div>
                }
                <label className="pb-2 h-2 mb-3  font-medium text-xl tracking-normal">Job Description</label>
                {
                    loading ?
                        <div className='h-4/6 mt-3 animate-pulse'>
                            <div className="h-28 w-full bg-gray-200 rounded-lg"></div>
                        </div>
                        :
                        <>
                            {description &&
                                <div style={{height : 'calc(100dvh - 410px)'}} className={`p-5 mt-3 overflow-auto `}>
                                    <ReactQuill theme="bubble"
                                        value={jobDetail.jd_html || description}
                                        className="overflow-auto full"
                                        readOnly={true}
                                   
                                    />
                                </div>
                                // <div className="p-5 mt-3 overflow-auto h-4/6" dangerouslySetInnerHTML={{ __html: description }} />
                            }
                        </>
                }

            </div>
        </>
    )
}

export default JobOverview