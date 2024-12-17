import { useContext, useState } from "react";
import AuthContext from "../../context/AuthContext";
import { api } from "../constants";

export const useFetchPreBuiltAssessments = () => {
  const { authTokens, isSuperUser } = useContext(AuthContext); // Accessing context
  const [loadingPreBuiltAssessments, setLoadingPreBuiltAssessments] = useState(false);
  const [preBuiltAssessments, setPreBuiltAssessments] = useState([]);
  const [preBuiltAssessmentsOptions, setPreBuiltAssessmentsOptions] = useState([]);

  const fetchPreBuiltAssessments = async (title) => {
    try {
      setLoadingPreBuiltAssessments(true);
      let endpoint = `${api}/test/prebuilt-assessment-list/`
       

        if (title) {
            endpoint += `?title=${title}`
        }
      if (!isSuperUser) {
        endpoint += title ? `&is_published=true` : `?is_published=true`
      } 

      console.log(isSuperUser)
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
      setLoadingPreBuiltAssessments(false);
      if (data.results.length) {
        setPreBuiltAssessments(data.results);
      }
    } catch (error) {
      setLoadingPreBuiltAssessments(false);
      console.error("Error fetching assessments:", error);
      // Handle the error accordingly
      return [];
    }
  };

  return {
    fetchPreBuiltAssessments,
    loadingPreBuiltAssessments,
    preBuiltAssessmentsOptions,
    preBuiltAssessments,
  }; // Return function and state
};




export const usePublishPreBuiltAssessment = () => {
  const { authTokens, user } = useContext(AuthContext);
  const [publishing, setPublishing] = useState(false);

  const publishPreBuiltAssessment = async (assessmentId, publish) => {
    setPublishing(true);
    try {
      const response = await fetch(
        `${api}/test/prebuiltassessments/${assessmentId}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authTokens.access}`,
          },
          body: JSON.stringify({
            is_published: publish ? true : false,
            published_by: user?.id,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to publish the assessment");
      }

      const result = await response.json();
      console.log("Assessment published successfully:", result);
      return result;
    } catch (error) {
      console.error("Error publishing assessment:", error);
      return { error: error };
    } finally {
      setPublishing(false);
    }
  };

  return { publishPreBuiltAssessment, publishing };
};

export const useFetchUserOwnedAssessments = () => {
    const { authTokens, isSuperUser } = useContext(AuthContext); // Accessing context
  const [loadingAssessments, setLoadingAssessments] = useState(false);
  const [assessments, setAssessments] = useState([]);
  const [assessmentsOptions, setAssessmentsOptions] = useState([]);

  const fetchAssessments = async (title) => {
    try {
        setLoadingAssessments(true);
      let endpoint = `${api}/test/list/`
       

        if (title) {
            endpoint += `?title=${title}`
        }
      if (!isSuperUser) {
        endpoint += title ? `&is_published=true` : `?is_published=true`
      } 
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
      setLoadingAssessments(false);
      if (data.results.length) {
        setAssessments(data.results);
      }
    } catch (error) {
        setLoadingAssessments(false);
      console.error("Error fetching assessments:", error);
      // Handle the error accordingly
      return [];
    }
  };

  return {
    fetchAssessments,
    loadingAssessments,
    assessments,
    assessmentsOptions,
  }; // Return function and state
}

export const useAssignAssessment = () => {

  const [assigningAssessment, setAssigningAssessment] = useState(false);
  const { authTokens, isSuperUser } = useContext(AuthContext); // Accessing context

  async function assignAssessment(jobId,candidateIds,assessments,validFrom,validTo) {
   
    setAssigningAssessment(true);
    if (jobId && candidateIds && assessments) {
      try {
        const postData = {
          job: jobId,
          candidate_id: candidateIds,
          assessments: assessments,
          valid_from: new Date(validFrom),
          valid_to: new Date(validTo),
          preferences: {},
        };
        const response = await fetch(`${api}/test/share/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + String(authTokens.access),
          },
          body: JSON.stringify(postData),
        });
        if (!response.ok) {
          
          // alert(data)
          setAssigningAssessment(false);
          
        }
        if (response.status === 200) {
          const data = await response.json();
          setAssigningAssessment(false);
          console.log(data)
          return data
          
        }
      } catch (error) {
        setAssigningAssessment(false);
        console.error(error);
      }
    }
  }

  return {
    assigningAssessment ,
    assignAssessment 
  }
}
