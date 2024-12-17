import {
  DocumentTextIcon,
  IdentificationIcon,
  TvIcon,
} from "@heroicons/react/24/outline";
import ApplicationForm from "./ApplicationForm";
import { useContext, useEffect, useState } from "react";
import AssessmentSetup from "./workflow-components/AssessmentSetup";
import VideoInterviewSetup from "./workflow-components/VideoInterviewSetup";
import ResumeScreeningSetup from "./workflow-components/ResumeScreeningSetup";
import AuthContext from "../../../context/AuthContext";
import { api } from "../../../constants/constants";

function AssessmentWorkflowForm({
  formSteps,
  currentStep,
  setCurrentStep,
  navigateToStep,
  jobId,
}) {
  const [currentTab, setCurrentTab] = useState(null);
  const { authTokens, orgServices } = useContext(AuthContext);
  const [workflow, setWorkflow] = useState(null);
  const [workflowStages, setWorkflowStages] = useState(null);
    const [workflowName,setWorkflowName] = useState('')
    const [creatingWorkflow,setCreatingWorkflow]= useState(false)
    const [assigningWorkflow,setAssigningWorkflow] = useState(false)
  const [serviceTabs, setServiceTabs] = useState([
    "Resume Screening",
    "Assessment",
    "Automated Video Interview",
  ]);

  useEffect(() => {
    if (!workflow) {
      fetchWorkflow();
    }
  }, []);

  const [draggedIndex, setDraggedIndex] = useState(null);

  // Handler for drag start
  const handleDragStart = (index) => {
    setDraggedIndex(index); // Store the index of the dragged item
  };

  // Handler for drag over
  const handleDragOver = (event) => {
    event.preventDefault(); // Allow dropping by preventing default
  };

  // Handler for drop
  const handleDrop = (index) => {
    if (draggedIndex === null) return;

    // Reorder the items
    const updatedItems = [...serviceTabs];
    const [draggedItem] = updatedItems.splice(draggedIndex, 1); // Remove dragged item
    updatedItems.splice(index, 0, draggedItem); // Insert it at the new index

    // Update the state
    setServiceTabs(updatedItems);

    // Reset draggedIndex
    setDraggedIndex(null);
  };

  const fetchWorkflow = async () => {
    try {
      const response = await fetch(`${api}/workflow/workflows/?job_id=${jobId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + String(authTokens.access),
        },
      });
      if (!response.ok) {
        console.error("Something went wrong");
      }
      if (response.status === 200) {
        const data = await response.json();
        if (data) {
          setWorkflow(data);
          if (data && data.stages) {
            setWorkflowStages(data.stages);
          }
        }
        return data;
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateWorkflow = async() => {
    try {
        setCreatingWorkflow(true)
        const response = await fetch(`${api}/workflow/workflows/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + String(authTokens.access),
            },
            body: JSON.stringify({"name":workflowName})
          });
          if (!response.ok) {
            console.error("Something went wrong");
            setCreatingWorkflow(false)
          }
          if (response.ok) {
            const data = await response.json();
            if (data) {
              setWorkflow(data);
              assignWorkflowToJob(data.id)
              if (data && data.stages) {
                setWorkflowStages(data.stages);
              }
            }
            setCreatingWorkflow(false)
            return data;
          }

    } catch (error) {
        setCreatingWorkflow(false)
    }
  }

  const assignWorkflowToJob = async(workflowId) => {
    try {
        setAssigningWorkflow(true)
        const response = await fetch(`${api}/workflow/assign/?job_id=${jobId}&workflow_id=${workflowId}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + String(authTokens.access),
            },
          });
          if (!response.ok) {
            console.error("Something went wrong");
            setAssigningWorkflow(false)
          }
          if (response.status === 200) {
            const data = await response.json();
            if (data) {
              if (data && data.initial_stage) {
                setWorkflowStages([data.initial_stage]);
              }
            }
            setAssigningWorkflow(false)
            return data;
          }

    } catch (error) {
        setAssigningWorkflow(false)
    }
  }

  console.log("workflowStages : ", workflowStages);

  return (
    <>
      <div className="w-[95%] h-auto bg-white min-h-96 mx-auto rounded-md shadow-sm">
        <div className="bg-[#e4e5f9] px-16 py-4 rounded-t-md">
          <h1 className="text-lg">Customize your Workflow</h1>
        </div>

        <div className="mt-8 px-16 rounded-t-md flex justify-between items-center">
          <h1 className="text-indigo-700">Stages</h1>
          {currentTab && (
            <button
              className="bg-[#6562f3] whitespace-nowrap text-white text-sm py-2 px-4 rounded-3xl font-medium text-center "
              style={{
                backgroundImage: "linear-gradient(131deg, #6562f3, #3835d6);",
              }}
              onClick={() => setCurrentTab(null)}
            >
              Go Back
            </button>
          )}
        </div>
        {!currentTab && workflow && (
          <div className="w-full py-16 flex items-center justify-evenly text-gray-700/80">
            {serviceTabs.map((service, index) => (
              <button
                draggable // Makes the div draggable
                onDragStart={() => handleDragStart(index)} // Start dragging
                onDragOver={handleDragOver} // Dragging over
                onDrop={() => handleDrop(index)} // Drop the item
                key={service}
                type="button"
                onClick={() => setCurrentTab(service)}
                className={`relative h-72 shadow-lg shadow-[#d9dbf7] ring-2 ring-gray-200 rounded-lg w-1/4 flex flex-col items-center justify-center gap-2 text-center border-b transition-transform duration-300 hover:scale-105 hover:shadow-xl ${
                  currentTab === service.name &&
                  "bg-[#f0f1fa] border-b-2 ring-indigo-500"
                }`}
              >
                <IdentificationIcon className="w-12 h-12 text-indigo-600 " />
                <label className="text-base font-semibold">{service}</label>
                <p className="text-sm px-10 pt-4 absolute text-gray-500 bottom-8 line-clamp-3">
                  {service === "Resume Screening" &&
                    `Streamline the hiring process by setting up tailored audio
                  questions and advanced resume filtering criteria for optimal
                  candidate shortlisting.`}
                  {service === "Assessment" &&
                    `Create comprehensive assessments with customizable templates,
                difficulty levels, and real-time performance analytics for
                insightful evaluation.`}
                  {service === "Automated Video Interview" &&
                    `Conduct AI-driven video interviews with intelligent analysis,
                ensuring a seamless experience for both recruiters and
                candidates.`}
                </p>
              </button>
            ))}
          </div>
        )}
        {!workflow && !assigningWorkflow && (
          <div className="w-full h-56 flex flex-col items-center justify-center text-start gap-4">
            <label className="text-2xl font-semibold inter text-gray-700">Give a name to your Workflow</label>
            <div className="flex gap-3 mt-3">
            <input onChange={(e) =>setWorkflowName(e.target.value)} type="text" className="w-96  bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block ps-4 p-2.5" placeholder="Data Analyst Workflow..." />
            <button
            disabled={!workflowName || creatingWorkflow}
            onClick={() => handleCreateWorkflow()}
              type="button"
              className="text-nowrap bg-brand-purple text-white border rounded-md px-6 py-2 disabled:bg-indigo-400"
            >
              {creatingWorkflow ? "Creating..." : "Create Workflow"}
            </button>
                </div>
          </div>
        )}
        <div className="w-full h-auto mt-8">
          {currentTab === "Resume Screening" && (
            <ResumeScreeningSetup
              stage={
                workflowStages?.find(
                  (stage) => stage.stage_name === "Resume Screening"
                ) || null
              }
              service={
                orgServices?.find(
                  (service) => service.key === "resume-screening"
                ) || null
              }
              jobId={jobId}
              workflowId={workflow?.id || null}
              order={1}
            />
          )}
          {currentTab === "Assessment" && (
            <AssessmentSetup
              stage={
                workflowStages?.find(
                  (stage) => stage.stage_name === "Assessment"
                ) || null
              }
              service={
                orgServices?.find((service) => service.key === "test") || null
              }
              jobId={jobId}
              workflowId={workflow?.id || null}
              order={2}
              setWorkflowStages={setWorkflowStages}
            />
          )}
          {currentTab === "Automated Video Interview" && (
            <VideoInterviewSetup
              stage={
                workflowStages?.find(
                  (stage) => stage.stage_name === "Automated Video Interview"
                ) || null
              }
              service={
                orgServices?.find(
                  (service) => service.key === "personality-screening"
                ) || null
              }
              jobId={jobId}
              workflowId={workflow?.id || null}
              order={3}
              setWorkflowStages={setWorkflowStages}
            />
          )}
        </div>
        {/* <div className="h-4/6 flex items-center justify-center">
      <h1 className="text-2xl text-gray-600">Coming Soon</h1>
      </div>

      <div className="w-full  px-8 flex justify-end gap-3">
                {currentStep !== 1 && <button onClick={() => navigateToStep(currentStep - 1)} className="border rounded-md px-6 py-2">Back</button>}
            </div>*/}
      </div>
    </>
  );
}

export default AssessmentWorkflowForm;
