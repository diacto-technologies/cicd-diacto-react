import { useContext, useEffect, useState } from "react";
import JobForm from "../../utils/forms/JobForm";
import { useNavigate, useParams } from "react-router-dom";
import AuthContext from '../../context/AuthContext';
import ScoreWeights from "./ScoreWeights";
import NewCreateJob from "./job-creation-form/NewCreateJob";
import JobDetailsForm from "./job-creation-form/JobDetailsForm"
import ApplicationForm from "./job-creation-form/ApplicationForm"
import TeamMemberForm from "./job-creation-form/TeamMemberForm"
import AssessmentWorkflowForm from "./job-creation-form/AssessmentWorkflowForm"

const CreateJob = () => {
    const { jobId, stepId } = useParams();
    const navigate = useNavigate()
    const { user, authTokens, logoutUser } = useContext(AuthContext);
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [jobDetail, setJobDetail] = useState([]);
    const formSteps = [
        {
            id: 1,
            title: "Job Details",
            description: "Tell applicant about this role including job title, location, requirement"
        },
        {
            id: 2,
            title: "Application form",
            description: "Design the application form for this role"
        },
        {
            id: 3,
            title: "Team Member",
            description: "Invite or add team members on this job"
        },
        {
            id: 4,
            title: "Assessment Workflow",
            description: "Create assessment structure or get AI help to create"
        },
    ]
    const [currentStep, setCurrentStep] = useState(null)

    useEffect(() => {
        if (stepId) setCurrentStep(parseInt(stepId))
        else setCurrentStep(1)
    }, [stepId])

    const navigateToStep = (stepId) => {
        navigate(`/app/user/jobs/edit-job/${jobId}/${stepId}/`)
    }

    return (
        <>
            <div className="flex flex-row m-8 px-8 bg-white gap-8 shadow-md">
                {formSteps.map(element => {
                    return (
                        <div className={`flex flex-row w-1/4 ${element.id === currentStep ? "border-b-4 border-[#7076f2]" : "inset-0 bg-white opacity-50 pointer-events-none "} py-6 select-none`}>
                            <div className="border-2 min-w-12 w-12 min-h-12 h-12 border-[#9da1f6] text-[#7076f2] rounded-full flex items-center justify-center">
                                {element.id}
                            </div>
                            <div className="flex flex-col ms-4">
                                <p>
                                    {element.title}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {element.description}
                                </p>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div style={{overflow:"auto", height:"calc(-270px + 100dvh)"}}>
                {currentStep === 1 && <JobDetailsForm formSteps={formSteps} currentStep={currentStep} setCurrentStep={setCurrentStep} navigateToStep={navigateToStep} jobId={jobId} />}
                {currentStep === 2 && <ApplicationForm formSteps={formSteps} currentStep={currentStep} setCurrentStep={setCurrentStep} navigateToStep={navigateToStep} jobId={jobId} />}
                {currentStep === 3 && <TeamMemberForm formSteps={formSteps} currentStep={currentStep} setCurrentStep={setCurrentStep} navigateToStep={navigateToStep} jobId={jobId} />}
                {currentStep === 4 && <AssessmentWorkflowForm formSteps={formSteps} currentStep={currentStep} setCurrentStep={setCurrentStep} navigateToStep={navigateToStep} jobId={jobId} />}
            </div>
        </>
    )

}

export default CreateJob;