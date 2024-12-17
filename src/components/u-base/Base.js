import { Outlet } from "react-router-dom";
import Navbar from '../../utils/navbar/Navbar';
import Heading from '../../utils/header/Heading';
import './Base.css';
import Sidebar from "../../utils/sidebar-utils/Sidebar";
import { useContext, useState } from "react";
import AuthContext from "../../context/AuthContext";
import SidebarTest from "../../utils/sidebar-utils/SidebarTest";


const Base = () => {

    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const {userDetails} = useContext(AuthContext)

    return (

        <>
          
                <div className=" min-w-full h-screen ">

                    <Navbar mobileSidebarOpen={mobileSidebarOpen} setMobileSidebarOpen={setMobileSidebarOpen} />

                    <Sidebar isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} mobileSidebarOpen={mobileSidebarOpen} setMobileSidebarOpen={setMobileSidebarOpen} />
                    {/* <SidebarTest isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} mobileSidebarOpen={mobileSidebarOpen} setMobileSidebarOpen={setMobileSidebarOpen} />  */}

                    <div className={`w-auto ${isSidebarOpen ? 'sm:ml-64' : 'sm:ml-20'} `} >
                        <div style={{ height: "calc(100dvh - 50px)" }} className="w-full rounded-lg mt-12 bg-gray-50 pt-2">
                            <Outlet />
                        </div>
                    </div>

                </div>
        
        </>

    );
}

export default Base;