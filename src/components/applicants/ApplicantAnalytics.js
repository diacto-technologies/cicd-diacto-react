import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import KpiCard from '../../utils/cards/KpiCard';
import TopLocationCard from '../../utils/cards/TopLocationCard';
import TopSkillsCard from '../../utils/cards/TopSkillsCard';
import RecentApplicantCard from '../../utils/cards/RecentApplicantCard';

const ApplicantAnalytics = () => {
    const [totalApplicants, setTotalApplicants] = useState(null);
    const [topLocation, setTopLocation] = useState({ location: '', count: 0 });
    const [mostRecentApplicant, setMostRecentApplicant] = useState(null);
    const [topSkill, setTopSkill] = useState(null);
    const { authTokens } = useContext(AuthContext);
    // Fetch the KPI data
    useEffect(() => {
        const fetchKpiData = async () => {

            const header = {
                'Authorization': `Bearer ${authTokens.access}`,
            }

            try {
                const [applicantsRes, locationRes, recentRes, skillRes] = await Promise.all([
                    axios.get('/analytics/total-applicants/', { headers: header }),
                    axios.get('/analytics/top-location/', { headers: header }),
                    axios.get('/analytics/most-recent-applicant/', { headers: header }),
                    axios.get('/analytics/top-skill/', { headers: header }),
                ]);

                setTotalApplicants(applicantsRes.data.total_applicants);
                setTopLocation({ location: locationRes.data.top_location, count: locationRes.data.applicant_count });
                setMostRecentApplicant(recentRes.data.most_recent_applicant);
                setTopSkill(skillRes.data.top_skills);

            } catch (error) {
                console.error("Error fetching KPI data", error);
            }
        };

        fetchKpiData();
    }, []);

    return (
        <div className="flex gap-6  justify-between">
            <KpiCard title="Total Applicants" value={totalApplicants ?? 'Loading...'} />
            <TopLocationCard title="Top Location" value={`${topLocation.location}`} count={topLocation.count} />
            <RecentApplicantCard
                title="Most Recent Applicant"
                date={new Date(mostRecentApplicant).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                }) ?? 'Loading...'}

                time={new Date(mostRecentApplicant).toLocaleTimeString('en-GB', {
                    hour: 'numeric',
                    minute: 'numeric',
                    second: 'numeric',
                })}
            />
            <TopSkillsCard title="Top Skills" value={topSkill} />
        </div>

    );
};

export default ApplicantAnalytics;
