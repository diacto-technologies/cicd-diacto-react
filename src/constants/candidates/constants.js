import { useState, useContext } from "react";
import AuthContext from "../../context/AuthContext";

// Custom hook for fetching applicants
export const useFetchApplicants = () => {
    const { authTokens } = useContext(AuthContext); // Accessing context
    const [loadingApplicants, setLoadingApplicants] = useState(false);
    const [candidateOptions, setCandidateOptions] = useState([])
    // Function to fetch applicants
    const fetchApplicants = async (name, jobId) => {
        try {
            // Build the base endpoint
            let endpoint = `/candidates/candidate-names-list/`;
    
            // Append name filter if provided
            if (name) {
                endpoint += `?name=${encodeURIComponent(name)}`;
            }
    
            // Append jobId filter if provided
            if (jobId) {
                // If `name` is already in the query string, append `jobId` with `&`
                endpoint += name ? `&jobId=${encodeURIComponent(jobId)}` : `?jobId=${encodeURIComponent(jobId)}`;
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