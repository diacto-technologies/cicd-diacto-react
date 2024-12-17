// Sidebar.js

import React, { useContext, useEffect, useRef, useState, memo } from 'react';
import Tab from './Tab';
import IconTab from './IconTab';
import { Link, useFetcher, useLocation } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import FeedbackList from '../../components/applicants/CommentsQuickList';
import { getServiceIcon } from '../../constants/constants';
// import Content from './Content';

const Sidebar = memo(({ isSidebarOpen, setSidebarOpen, mobileSidebarOpen, setMobileSidebarOpen }) => {
    // console.count("Sidebar rerender")

    const { orgServices,authTokens,userDetails } = useContext(AuthContext);
    const sidebarRef = useRef(null);
    const [activeTab, setActiveTab] = useState(null);
    const [jobCount, setJobCount] = useState(null);
    const [applicantsCount, setApplicantsCount] = useState(null);

    const [serviceTabs, setServiceTabs] = useState([])

    const tabs = [
        { name: 'Jobs',id:'Jobs', href: '/app/user/jobs/', current: true, icon: 'fa-solid fa-briefcase',show:true, isLocked: false, lockIcon: 'fa-solid fa-lock' },
        { name: 'Applicants',id:'Applicants',  href: '/app/user/applicants/', current: false, icon: 'fa-solid fa-user-check',show:true, isLocked: false, lockIcon: 'fa-solid fa-lock' },
        //  { name: 'Interview Workflow',id:'Interviews',  href: '/app/user/interviews/', current: false, icon: 'fa-solid fa-timeline',show:true, isLocked: false, lockIcon: 'fa-solid fa-lock' },
        { name: 'Reports',id:'Reports',  href: '/app/user/coming-soon/', current: false, icon: 'fa-solid fa-chart-pie',show:true,isLocked: true, lockIcon: 'fa-solid fa-lock' },
        { name: 'Documents',id:'Documents',  href: '/app/user/coming-soon/', current: false, icon: 'fa-solid fa-folder-open',show:true, isLocked: true, lockIcon: 'fa-solid fa-lock' },
    ]

    // const servicesTabs = [
    //     { name: 'Resume Screening',id:'Resume-Screening',  href: '/app/user/coming-soon/', current: false, icon: 'fa-solid fa-file-lines',show:true, isLocked: false, lockIcon: 'fa-solid fa-lock' },
    //     { name: 'Personality Screening',id:'Personality Screening',  href: '/app/user/personality-screenings/', current: false, icon: 'fa-solid fa-users-rectangle',show: true, isLocked: false, lockIcon: 'fa-solid fa-lock' },
    //     { name: 'Tests',id:'Tests',  href: '/app/user/tests/', current: false, icon: 'fa-solid fa-cubes ', isLocked: false,show:true, lockIcon: 'fa-solid fa-lock' },
    //     { name: 'AI Interviews',id:'AI-Interviews',  href: '/app/user/coming-soon/', current: false, icon: 'fa-solid fa-tv', isLocked: false,show:userDetails?.is_superuser ? true :false, lockIcon: 'fa-solid fa-lock' },
    // ]

    const location = useLocation();


    // const paths = location.pathname.split('/');
    // if (!activeTab) {
    //     setActiveTab(paths[paths.length - 1] !== "" ? (paths[paths.length - 1]).toLowerCase() : (paths[paths.length - 2].toLowerCase()))
    // }


    useEffect(() => {
        const paths = location.pathname.split('/')
        // console.log("",paths[paths.length - 3])
        setActiveTab(paths[paths.length - 3] !== "" && paths[paths.length - 3] == "user" ? (paths[paths.length - 2]).toLowerCase() : (paths[paths.length - 3].toLowerCase()))

    }, [location])

    useEffect(() => {
        // console.log("SIDEBAR - getting count")
        getCount()
    }, [])

    useEffect(() => {
        if (orgServices.length) {
            const tabs = orgServices.map((s) => ({
                name :  s.name,
                id : s.id,
                href : s.key === "test" ? `/app/user/assigned-assessments/${s.id}/` : `/app/user/${s.key}/${s.id}/`,
                key : s.key,
                show : true,
                current : false,
                locked: false,
                icon : getServiceIcon(s.key)

            }))

            setServiceTabs(tabs)
        }
    },[orgServices])



    useEffect(() => {
        // console.log("SIDEBAR - collapse useeffect")
        const handleClickOutside = (event) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                setMobileSidebarOpen(false)
            }
        };

        if (mobileSidebarOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [setMobileSidebarOpen]);

    

    const getCount = async () => {

        try {
            const response = await fetch(`/get_count/all/`,
                {
                    method: 'GET',
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + String(authTokens.access),
                    }
                })

            if (!response.ok) {
                throw new Error('Network response was not ok');
            } else {
                const data = await response.json()
                if (data) {
                    setJobCount(data.jobs)
                    setApplicantsCount(data.applicants)
                }
            }

        } catch (error) {
            console.error(error)
        }
    }

    const handleToggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    return (
        <>



            <aside
                ref={sidebarRef}
                className={`fixed  top-0 left-0 z-20  h-screen pt-20 transition-transform ${!mobileSidebarOpen && '-translate-x-full'} ${isSidebarOpen ? 'w-64 max-w-72 z-0' : 'w-20 '} bg-white border-r border-gray-200 sm:translate-x-0`}
                aria-label="Sidebar"
            >
                {
                    applicantsCount !== null && jobCount !== null &&
                    <div className="h-full px-3 pb-4 overflow-y-auto z-0" style={{ height: 'calc(100dvh - 150px)' }}>
                        <div className='mb-5'>
                            {isSidebarOpen && tabs.length ?


                                tabs.map((tab, index) => (
                                    <Tab

                                        jobCount={jobCount}
                                        applicantsCount={applicantsCount}
                                        key={index}
                                        link={tab.href}
                                        title={tab.name}
                                        iconClass={tab.icon}
                                        isActive={activeTab === (tab.id).toLowerCase()}
                                        isLocked={tab.isLocked}
                                        lockIcon={tab.lockIcon}
                                        show={tab.show}
                                        onClick={() => handleTabClick(tab.name)}

                                    />
                                ))
                                :

                                tabs.map((tab, index) => (
                                    <IconTab
                                        key={index}
                                        link={tab.href}
                                        title={tab.name}
                                        iconClass={tab.icon}
                                        isLocked={tab.isLocked}
                                        show={tab.show}
                                        isActive={activeTab === (tab.name).toLowerCase()}
                                        onClick={() => handleTabClick(tab.name)}

                                    />
                                ))
                            }
                        </div>
                        <small className={`${isSidebarOpen ? 'px-3' : ''} text-sm text-gray-500 font-light`}>Services</small>
                        {isSidebarOpen && serviceTabs.length ?


                            serviceTabs.length > 0 &&serviceTabs.map((tab, index) => (
                                <Tab
                                    jobCount={jobCount}
                                    applicantsCount={applicantsCount}
                                    key={index}
                                    link={tab.href}
                                    title={tab.name}
                                    iconClass={tab.icon}
                                    isActive={ (activeTab === "assigned-assessments" && (tab.key).toLowerCase() === "test") || activeTab === (tab.key).toLowerCase()}
                                    isLocked={tab.isLocked}
                                    lockIcon={tab.lockIcon}
                                    show={tab.show}
                                    onClick={() => handleTabClick(tab.name)}

                                />
                            ))
                            :

                            serviceTabs.map((tab, index) => (
                                <IconTab
                                    key={index}
                                    link={tab.href}
                                    title={tab.name}
                                    iconClass={tab.icon}
                                    isLocked={tab.isLocked}
                                    show={tab.show}
                                    isActive={activeTab === (tab.name).toLowerCase()}
                                    onClick={() => handleTabClick(tab.name)}

                                />
                            ))
                        }

                        {


                            <button className="absolute bottom-0 left-0 w-full text-sm mb-4 text-center text-dark focus:outline-none border-t pt-4"
                                onClick={handleToggleSidebar}
                            >
                                {isSidebarOpen ? (
                                    <i className="fa-solid fa-chevron-left text-sm bg-gray-100 shadow-md py-2 w-3/6 rounded-md"></i>
                                ) : (
                                    <i className="fa-solid fa-chevron-right bg-gray-100 shadow-md  py-2 w-3/6 rounded-md"></i>
                                )}
                            </button>
                        }

                    </div>
                }
            </aside>


        </>
    );
});

export default Sidebar;
