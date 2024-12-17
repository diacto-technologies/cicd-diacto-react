import { Link, Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import Heading from "../../utils/header/Heading";
import { useContext, useEffect, useState } from "react";
import AuthContext from "../../context/AuthContext";
import { ToastContainer } from "react-toastify";


const JobDetail = () => {
    const { domain, authTokens, logoutUser,userDetails } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();
    const [currentTab, setCurrentTab] = useState('overview');
    const [jobDetail, setJobDetail] = useState([]);
    const [description, setDescription] = useState([]);
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState({});


    const { jobId } = useParams()

    useEffect(() => {
        fetchJob()
    },[])
    // console.count("job detail rerender")

    useEffect(() => {
        const paths = location.pathname.split('/')
        setCurrentTab(paths[paths.length - 1] !== "" ? paths[paths.length - 1] : paths[paths.length - 2])
            
      
    },[location])
    


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

    const publishJob = async (job) => {
        const jobFormUrl = `/jobs/job/${job.id}/`
        try {

            const response = await fetch(jobFormUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: "Bearer " + String(authTokens.access),
                },
                body: JSON.stringify({ published: job.published ? false : true }),

            });

            if (response.ok) {
                const data = await response.json();
                fetchJob()

            } else {
                const errorData = await response.json();
                setError(errorData);
            }
        } catch (error) {
            console.error('Job publish failed:', error.message);
        }
    }



    return (
        <>
            <div className=" py-3 h-full overflow-auto">
                <Heading domain={domain} userDetails={userDetails} jobDetail={jobDetail} publishJob={publishJob} loading={loading} />
                <div className="flex border-y mt-3 justify-center md:justify-start w-full bg-white">
                    <Link to={`/app/user/jobs/job/${jobId}/overview/`} className={` ${currentTab.toLowerCase() === "overview" ? 'text-[#3D73FD] border-b-4  border-[#3D73FD] font-semibold' : 'text-gray-800 '} bg-white  hover:text-sky-700 block  px-4 py-2 text-sm `} >Overview</Link>
                    <Link to={`/app/user/jobs/job/${jobId}/applicants/`} className={` ${currentTab.toLowerCase() === "applicants" ? 'text-[#3D73FD] border-b-4  border-[#3D73FD] font-semibold' : 'text-gray-800 '} bg-white    hover:text-sky-700 block px-4 py-2 text-sm `}>Applicants</Link>
                    {/* <Link to={`/app/user/jobs/job/${jobId}/interviews/`} className={` ${currentTab.toLowerCase() === "interviews" ? 'text-[#3D73FD] border-b-4  border-[#3D73FD] font-semibold' : 'text-gray-800 '} bg-white   hover:text-sky-700 block px-4  py-2 text-sm `}>Interview Workflow</Link> */}
                    {/* <Link to={`/app/user/jobs/job/${jobId}/filter-groups/`} className={` ${currentTab.toLowerCase() === "filter-groups" ? 'text-[#3D73FD] border-b-4  border-[#3D73FD] font-semibold' : 'text-gray-800 '} bg-white   hover:text-sky-700 block px-4 py-2 text-sm `}>Filter Groups</Link> */}
                    {/* <Link to={`/app/user/jobs/job/${jobId}/questions/`} className={` ${currentTab.toLowerCase() === "questions" ? 'text-[#3D73FD] border-b-4  border-[#3D73FD] font-semibold' : 'text-gray-800 '} bg-white   hover:text-sky-700 block px-4 py-2 text-sm `}>Questions</Link>
                    <Link to={`/app/user/jobs/job/${jobId}/preferences/`} className={` ${currentTab.toLowerCase() === "preferences" ? 'text-[#3D73FD] border-b-4  border-[#3D73FD] font-semibold' : 'text-gray-800 '} bg-white   hover:text-sky-700 block px-4 py-2 text-sm `}>Preferences</Link> */}
                    {/* <a href="#" className="bg-white border text-gray-800 hover:bg-gray-700 hover:text-white block  px-4 py-2 text-base font-medium">Projects</a>
                    <a href="#" className="bg-white border text-gray-800 hover:bg-gray-700 hover:text-white block rounded-e-md px-4 py-2 text-base font-medium">Calendar</a> */}
                </div>
                {/* Content  */}

                <div className="px-5 flex justify-between">
                    <Outlet />

                </div>

            </div>
            <ToastContainer />

        </>
    )
}

export default JobDetail;
