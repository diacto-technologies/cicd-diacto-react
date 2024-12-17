import { DocumentTextIcon, IdentificationIcon, TvIcon } from "@heroicons/react/24/outline";

function AssessmentWorkflowForm({
  formSteps,
  currentStep,
  setCurrentStep,
  navigateToStep,
  jobId,
}) {
  return (
    <>
      <div className="w-5/6 bg-white min-h-80 mx-auto rounded-md shadow-sm">
        <div className="bg-[#e4e5f9] px-16 py-6 rounded-t-md">
          <h1 className="text-xl">Customize your Workflow</h1>
        </div>
        <div className="w-full flex h-16 items-center justify-evenly border-y border-gray-300 bg-[#e4e5f9] text-gray-700/80">
           <div className="w-1/3 h-full flex items-center justify-center gap-2 text-center">
            <IdentificationIcon className="w-7 h-7 text-gray-700" />
           <label >Resume Screening</label>
           </div>
           <div className="w-1/3 h-full flex items-center justify-center gap-2 text-center">
            <DocumentTextIcon className="w-7 h-7 text-gray-700" />
           <label >Assessment</label>
           </div>
           <div className="w-1/3 h-full flex items-center justify-center gap-2 text-center">
            <TvIcon className="w-7 h-7 text-gray-700" />
           <label >Automated Video Interview</label>
           </div>
           
        </div>
      </div>
      {/* <div className="mx-8 my-4 px-8 flex justify-end gap-3">
                {currentStep !== 1 && <button onClick={() => navigateToStep(currentStep - 1)} className="border rounded-md px-6 py-2">Back</button>}
                {currentStep !== formSteps.length && <button onClick={() => navigateToStep(currentStep + 1)} disabled={jobId} className="border rounded-md px-6 py-2">Next</button>}
            </div> */}
    </>
  );
}

export default AssessmentWorkflowForm;
