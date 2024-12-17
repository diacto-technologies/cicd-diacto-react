import CandidateList from "./CandidateList";

const ApplicantByStages = ({selectedStage,jobId,viewMode}) => {

  
      

    return ( 
        <>

        <div className="w-full">
        <CandidateList selectedStage={selectedStage} viewMode={viewMode} />
        </div>
        </>
     );
}
 
export default ApplicantByStages;