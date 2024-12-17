import { useState, useContext } from "react";
import AuthContext from "../../context/AuthContext";
import { api } from "../constants";

// Custom hook for fetching applicants
export const useFetchApplicants = () => {
    const { authTokens } = useContext(AuthContext); // Accessing context
    const [loadingApplicants, setLoadingApplicants] = useState(false);
    const [candidateOptions, setCandidateOptions] = useState([])
    // Function to fetch applicants
    const fetchApplicants = async (name, jobId,shortlisted) => {
        try {
            // Build the base endpoint
            let endpoint = `${api}/candidates/candidate-names-list/`;
            console.log(shortlisted)
            // Append name filter if provided
            if (name) {
                endpoint += `?name=${encodeURIComponent(name)}`;
            }
            if (shortlisted) {
                endpoint += endpoint.includes("?") ?  `&shortlisted=true` : "?shortlisted=true";
            }
    
            // Append jobId filter if provided
            if (jobId) {
                // If `name` is already in the query string, append `jobId` with `&`
                endpoint += endpoint.includes("?") ? `&jobId=${encodeURIComponent(jobId)}` : `?jobId=${encodeURIComponent(jobId)}`;
            }
    
            setLoadingApplicants(true);
    
            const response = await fetch(endpoint, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + String(authTokens.access),
                },
            });
    
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
    
            const data = await response.json();
    
            // Map the results to the format required by React Select
            const candidates = data.results?.map((candidate) => ({
                value: candidate.id,
                label: candidate.name, // Corrected 'lable' to 'label'
            }));
    
            setLoadingApplicants(false);
            setCandidateOptions(candidates);
        } catch (error) {
            setCandidateOptions([]);
            setLoadingApplicants(false);
            console.error("Error fetching applicants:", error);
            return [];
        }
    };

    return { fetchApplicants, loadingApplicants,candidateOptions }; // Return function and state
};