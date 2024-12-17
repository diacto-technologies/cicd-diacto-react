import { Link, NavLink } from 'react-router-dom';

function ProfileNavbar() {
    return (
        <>
            <div className="min-w-1/6 py-5 bg-white text-black border-r quicksand" style={{ height: 'calc(100dvh - 57px)' }}>
                <div className="w-full p-4 ps-8 pb-8 border-b">
                    <label className="font-bold text-xl leading-8 text-black">
                        User profile management
                    </label>
                </div>
                <div className="w-full p-3 pb-4 mt-4 border-b text-gray-400">
                    <ul className='gap-3'>
                        <NavLink to="/app/user/profile/personalInfo/"
                            className={({ isActive }) =>
                                isActive
                                    ? "py-3 px-2 cursor-pointer flex gap-2 items-center hover:bg-gray-200 ps-8 text-gray-900 font-semibold bg-gray-200"
                                    : "py-3 px-2 cursor-pointer flex gap-2 items-center hover:bg-gray-200 ps-8 hover:text-gray-900 hover:font-semibold"}
                        >
                            <li className="flex gap-2 items-center">
                                <img src='https://img.icons8.com/?size=100&id=yAMJMOeU6sRi&format=png&color=000000' className='w-4 h-4 text-gray-400' />
                                Personal Info
                            </li></NavLink>
                        <NavLink to="/app/user/profile/users/"
                            className={({ isActive }) =>
                                isActive
                                    ? "py-3 px-2 cursor-pointer flex gap-2 items-center hover:bg-gray-200 ps-8 text-gray-900 font-semibold bg-gray-200"
                                    : "py-3 px-2 cursor-pointer flex gap-2 items-center hover:bg-gray-200 ps-8 hover:text-gray-900 hover:font-semibold"}
                        >
                            <li className="flex gap-2 items-center">
                                <img src='https://img.icons8.com/?size=100&id=4XDFrFOD45Si&format=png&color=000000' className='w-4 h-4' />
                                Users
                            </li></NavLink>
                        <NavLink to="/app/user/profile/notifications/"
                            className={({ isActive }) =>
                                isActive
                                    ? "py-3 px-2 cursor-pointer flex gap-2 items-center hover:bg-gray-200 ps-8 text-gray-900 font-semibold bg-gray-200"
                                    : "py-3 px-2 cursor-pointer flex gap-2 items-center hover:bg-gray-200 ps-8 hover:text-gray-900 hover:font-semibold"}
                        >
                            <li className="flex gap-2 items-center">
                                <img src='https://img.icons8.com/?size=100&id=RBe3oBdrzSHc&format=png&color=000000' className='w-4 h-4' />
                                Notifications
                            </li></NavLink>
                        <NavLink to="/app/user/profile/credits/"
                            className={({ isActive }) =>
                                isActive
                                    ? "py-3 px-2 cursor-pointer flex gap-2 items-center hover:bg-gray-200 ps-8 text-gray-900 font-semibold bg-gray-200"
                                    : "py-3 px-2 cursor-pointer flex gap-2 items-center hover:bg-gray-200 ps-8 hover:text-gray-900 hover:font-semibold"}
                        >
                            <li className="flex gap-2 items-center">
                                <img src='https://img.icons8.com/?size=100&id=ki6m4RPyanUP&format=png&color=000000' className='w-4 h-4' />
                                Credits
                            </li></NavLink>
                    </ul>
                </div>
            </div>
        </>
    )
}

export default ProfileNavbar;