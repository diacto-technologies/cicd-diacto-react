import { useContext, useState } from "react";
import AuthContext from "../../context/AuthContext";
import { api } from "../constants";


export const useFetchTeamMembers = () => {
    const { authTokens, isSuperUser, userDetails } = useContext(AuthContext); // Accessing context
    const [loadingTeamMembers, setLoadingTeamMembers] = useState(false);
    const [teamMembers, setTeamMembers] = useState([]);
    const [teamMemberOptions, setTeamMemberOptions] = useState([]);

    const fetchTeamMembers = async (title) => {
        try {
            setLoadingTeamMembers(true);
            let endpoint = `${api}/accounts/organizations/${userDetails?.org?.org_id}/users/`
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
            setLoadingTeamMembers(false);
            if (data.results.length) {
                const filteredData = data.results.filter((member)=>member.id !== userDetails.id)
                setTeamMembers(filteredData);
                setTeamMemberOptions(filteredData?.map((user) => { return { ...user, value: user.id, label: user.name } }))
            }
        } catch (error) {
            setLoadingTeamMembers(false);
            console.error("Error fetching users:", error);
            // Handle the error accordingly
            return [];
        }
    };

    return {
        fetchTeamMembers,
        setTeamMembers,
        setLoadingTeamMembers,
        loadingTeamMembers,
        teamMemberOptions,
        teamMembers,
    }; // Return function and state
};