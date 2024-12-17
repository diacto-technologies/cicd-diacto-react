import CandidateCriteriaForm from "./CandidateCriteriaForm";

const CriteriaForm = ({jobId, setFormValidationResponse, criteriaResponses, setCriteriaResponses, criteriaErrors}) => {

    const handleSubmitResponses = async (responses) => {
        const url = '/candidate-responses/bulk-create-or-update/';
        
    
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
        <CandidateCriteriaForm jobId={jobId} criteriaResponses={criteriaResponses} setCriteriaResponses={setCriteriaResponses} onSubmit={(responses) => {handleSubmitResponses(responses)}} setFormValidationResponse={setFormValidationResponse} criteriaErrors={criteriaErrors} />
        </>
     );
}
 
export default CriteriaForm;