import { BellAlertIcon, CreditCardIcon, UserIcon, UsersIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

function ProfileNavbar() {
    const [currentTab, setCurrentTab] = useState()
    const location = useLocation();
    useEffect(() => {
        const paths = location.pathname.split('/')
        if(paths[paths.length - 2] === "profile") {
            setCurrentTab('personal-info')
        }
        else setCurrentTab(paths[paths.length - 2])

    }, [location])


    const tabs = [
        {
            value: "personal-info",
            icon: <UserIcon className={`w-5 h-5 text-gray-500 group-hover:text-indigo-400 ${currentTab === "personal-info" ? "text-indigo-500" : "text-gray-400"}`} />,
            label: "Account Info"
        },
        {
            value: "users",
            icon: <UsersIcon className={`w-5 h-5 text-gray-500 group-hover:text-indigo-400 ${currentTab === "users" ? "text-indigo-500" : "text-gray-400"}`} />,
            label: "Users"
        },
        {
            value: "notifications",
            icon: <BellAlertIcon className={`w-5 h-5 text-gray-500 group-hover:text-indigo-400 ${currentTab === "notifications" ? "text-indigo-500" : "text-gray-400"}`} />,
            label: "Notifications"
        },
        {
            value: "credits",
            icon: <CreditCardIcon className={`w-5 h-5 text-gray-500 group-hover:text-indigo-400 ${currentTab === "credits" ? "text-indigo-500" : "text-gray-400"}`} />,
            label: "Payment and Billings"
        },
    ]

    return (
        <>
            <div className="w-full py-5 text-sm bg-white text-black border-r quicksand" style={{ height: 'calc(100dvh - 57px)' }}>
                <div className="w-full p-4 ps-8 pb-8 border-b">
                    <label className="font-bold text-xl leading-8 text-black">
                        Manage your profile
                    </label>
                </div>
                <div className="w-full p-3 pb-4 mt-4 text-gray-400">
                    <ul className='flex flex-col gap-1 w-full'>
                        {tabs.map((tab) => (
                            <NavLink to={`/app/user/profile/${tab.value}/`}
                                className={
                                    currentTab === tab.value
                                        ? "w-full py-3 px-2 transition-all rounded-lg cursor-pointer flex gap-2 items-center ps-8 text-indigo-500 font-semibold bg-gray-50"
                                        : "w-full py-3 px-2 transition-all rounded-lg cursor-pointer flex gap-2 group items-center text-gray-500 hover:text-indigo-400 ps-8 hover:font-semibold"}
                            >
                                <li className="flex gap-2 items-center hover:text-indigo-400 ">
                                    {tab.icon}
                                    {tab.label}
                                </li></NavLink>
                        ))}
                    </ul>
                </div>
            </div>
        </>
    )
}

export default ProfileNavbar;