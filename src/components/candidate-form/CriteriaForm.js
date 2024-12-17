import CandidateCriteriaForm from "./CandidateCriteriaForm";

const CriteriaForm = ({jobId}) => {

    const handleSubmitResponses = async (responses) => {
        const url = '/candidate-responses/bulk-create-or-update/';
        const payload = {
        //   candidate_id: candidateId,
          job_id: jobId,
          responses: Object.entries(responses).map(([criteriaId, response]) => ({
            criteria_id: criteriaId,
            response: response,
          })),
        };

        console.log(payload)
    
        // try {
        //   const response = await fetch(url, {
        //     method: 'POST',
        //     headers: {
        //       'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify(payload),
        //   });
    
        //   if (!response.ok) {
        //     throw new Error("Failed to submit responses");
        //   }
    
        //   const responseData = await response.json();
        //   alert("Responses submitted successfully!");
        //   console.log(responseData);
        // } catch (error) {
        //   console.error("Error submitting responses:", error);
        //   alert("An error occurred while submitting responses.");
        // }
      };

    return ( 
        <>
        <CandidateCriteriaForm jobId={jobId} onSubmit={(responses) => {handleSubmitResponses(responses)}} />
        </>
     );
}
 
export default CriteriaForm;