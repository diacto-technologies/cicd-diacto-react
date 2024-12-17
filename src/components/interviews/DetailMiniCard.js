import { ArrowUpRightIcon, ArrowsPointingInIcon, ArrowsPointingOutIcon } from "@heroicons/react/20/solid";
import { useEffect, useState,useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AuthContext from '../../context/AuthContext';
import {  toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "../../utils/toasts/Toast.css"

const DetailMiniCard = ({ item, id, candidate, selectedRow, updateXarrow, selectedWorkflow }) => {
    const { authTokens, userDetails } = useContext(AuthContext);
    const { jobId } = useParams();
    const navigate = useNavigate()
    const [currentStatus, setCurrentStatus] = useState('');
    const [detailView, setDetailView] = useState(false)

    const [currentStep, setCurrentStep] = useState(null)
    const [previousStep, setPreviousStep] = useState(null)

    useEffect(() => {
        if (candidate && candidate?.interview_steps) {
            let status = "Not Started"
            const index = candidate.interview_steps.findIndex(round => round.service.name === item.content.label)
            let step = null
            if (index !== undefined) {
                step = candidate.interview_steps[index]
                const prevStep = candidate.interview_steps[index > 0 ? index - 1 : (item.order - 1) - 1]
                setCurrentStep(step)
                setPreviousStep(prevStep)
            }
            if (step?.started) {
                status = "In Progress"
            }
            if (step?.completed) {
                status = "Completed"
            }
            if (step?.approved) {
                status = "Approved"
            }
            setCurrentStatus(status)
        }
    }, [candidate])

    useEffect(() => {
        if (currentStep) {
            let status;
            if (currentStep?.started) {
                status = "In Progress"
            }
            if (currentStep?.completed) {
                status = "Completed"
            }
            if (currentStep?.approved) {
                status = "Approved"
            }
            setCurrentStatus(status)
        }
    }, [currentStep])

    useEffect(() => {
        const divElement = document.getElementById(id ? id : item.content.id); // Assuming 'id' is defined and unique

        const observer = new ResizeObserver(() => {
            updateXarrow(); // Call your updateXarrow function here
        });

        observer.observe(divElement);

        return () => {
            observer.unobserve(divElement);
        };
    }, [id, item.content.id]);
    // console.log(item,)

    const updateStep = async (action) => {

        // const currentStep = screeningDetails?.step
        // if (currentStep) {
        const stepdata = {
            "action": action,
            "order": item.order,
            "candidate_id": candidate.id,
            "job_id": jobId,
            "workflow_id": selectedWorkflow.id,
            "step_id": currentStep?.id || null,
            "service": item?.content.label
        }

        const response = await fetch(`/interview/update-step/`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + String(authTokens.access),
            },
            body: JSON.stringify(stepdata),
        });

        if (!response.ok) {
            // throw new Error('Failed to start',response);
            const err = await response.json()
           
            return toast.error(err.error, {
                className: 'text-sm w-96 custom-toast',
                position: "top-center",
                autoClose: 3000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "light",
              });
            }

        const responseData = await response.json();
        // setCurrentStatus("In Progress")
        // console.log(responseData.message)
        setCurrentStep(responseData.message)
        // const index = candidate.interview_steps.findIndex(round => round.service.name === item.content.label)
        // const updatedCandidate = { ...candidate, interview_steps[index]: responseData.message }

        const index = candidate.interview_steps.findIndex(round => round.service.name === item.content.label);
        const updatedInterviewSteps = [...candidate.interview_steps]; // Create a copy of the interview steps array
        updatedInterviewSteps[index] = responseData.message; // Update the element at the specified index

        const updatedCandidate = {
            ...candidate,
            interview_steps: updatedInterviewSteps // Update the interview steps array in the candidate object
        };

        selectedRow.update(updatedCandidate)

        // }
    }

    // console.log(item)

    return (
        <>
            <div key={item.content.id} id={id ? id : item.content.id} className={`overflow-hidden flex ${detailView ? 'w-80' : 'w-24'} transition-all duration-200 h-24 items-center justify-between rounded-lg bg-sky-100 shadow-md hover:outline outline-sky-600/20 ${currentStatus === "Completed" && ' outline outline-3 outline-teal-500/60'} ${currentStatus === "Approved" && ' outline outline-3 outline-blue-500/60'} ${currentStatus === "In Progress" && ' outline outline-3 outline-yellow-500/60'}`}>
                <div className={`${detailView ? 'w-1/5' : 'w-full'} relative h-full flex flex-col justify-center items-center bg-white border-r`}>
                    <img className='w-9 h-9 mt-2' src={item?.content.icon} />
                    <label className={`${detailView ? 'hidden' : 'w-full'}  text-xs w-full text-center mt-2 text-gray-700 font-medium`}>{item?.content.label}</label>
                    <button className={`absolute top-1 right-1 rounded-sm border`} onClick={() => { setDetailView(!detailView); }}>{detailView ? <ArrowsPointingInIcon className="w-4 h-4 text-gray-500" /> : <ArrowsPointingOutIcon className="w-4 h-4 text-gray-500" />}</button>
                </div>
                <div className={`${detailView ? 'w-4/5' : 'hidden'}  relative h-full bg-white pt-2 px-2`}>
                    <section className="flex justify-between items-center">
                        <label className='text-xs w-full text-start text-gray-700 font-medium'>{item?.content.label}</label>
                        <button disabled={!currentStep?.completed} onClick={() => navigate(`/app/user/applicants/applicant/${candidate.id}/profile/${item.content.id}/`)} title="Details" className="rounded-lg border hover:bg-gray-50"><ArrowUpRightIcon className="w-4 h-4" /></button>
                    </section>
                    <div className="flex items-center gap-2 text-xs">
                        <div className={`w-2 h-2 rounded-full ${currentStatus === "Not Started" && "bg-gray-400"} ${currentStatus === "In Progress" && "bg-yellow-500"} ${currentStatus === "Completed" && "bg-teal-600"} ${currentStatus === "Approved" && "bg-sky-400"}`} ></div>
                        {currentStatus}
                    </div>
                    <div className="absolute bottom-1.5 right-1">
                        {
                            currentStep && currentStep.completed &&
                            <button onClick={() => updateStep("Approve")} disabled={currentStatus === "Approve"} className={`px-2 py-1  ${currentStatus === "Approved" ? "bg-blue-400" : "bg-blue-600 "} text-white rounded-3xl border inline-flex text-xs `}>
                                {currentStatus === "Approved" ? "Approved" : "Approve"}
                            </button>
                        }
                        {!currentStep && previousStep && previousStep.completed && previousStep.approved &&
                            <button onClick={() => updateStep("Start")} className="px-2 py-1 bg-blue-600 text-white rounded-3xl border inline-flex text-xs hover:bg-blue-500">
                                Start
                            </button>}
                    </div>
                </div>
            </div>
        </>
    );
}

export default DetailMiniCard;