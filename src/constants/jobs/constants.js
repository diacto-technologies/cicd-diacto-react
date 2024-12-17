import { useContext, useState } from "react";
import AuthContext from "../../context/AuthContext";
import { api } from "../constants";


export const useFetchJobs = () => {
    const { authTokens } = useContext(AuthContext); // Accessing context
    const [loadingJobs, setLoadingJobs] = useState(false);
    const [jobOptions, setJobOptions] = useState([])

 const fetchJobs = async (title) => {
    try {
        setLoadingJobs(true)
        const endpoint = title
                ? `${api}/jobs/job-names-list/?title=${title}`
                : `${api}/jobs/job-names-list/`;
      const response = await fetch(`${endpoint}`, {
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
      const jobs = data.results.map((job) => ({
        value: job.id,
        label: job.title, // Corrected 'lable' to 'label'
      }));
      setLoadingJobs(false)
      setJobOptions(jobs);
    } catch (error) {
        setLoadingJobs(false)
      console.error("Error fetching applicants:", error);
      // Handle the error accordingly
      return [];
    }
  };

  return { fetchJobs, loadingJobs,jobOptions }; // Return function and state
};