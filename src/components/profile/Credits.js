import { useContext, useEffect, useRef, useState } from "react";
import "./Profile.css"
import AuthContext from "../../context/AuthContext";
import ProfileNavbar from "./ProfileNavbar";

const Credits = () => {

    const { authTokens, userDetails, setUserDetails } = useContext(AuthContext);

    return (
        <>
            {
                userDetails &&
                <div className="h-screen w-full flex">
                    {/* sidebar  */}
                    <ProfileNavbar />
                    <div className="w-5/6 h-full flex flex-col justify-center items-center ">
                        <i className={`fa-solid fa-lock text-gray-700 w-8 text-center p-1 text-xl`}></i>
                        <label className="text-2xl text-gray-600 mb-1">Coming Soon</label>
                        <p className="text-gray-500">We'll notify you once this feature is rolled out.</p>
                    </div>

                </div >}
        </>
    );
}

export default Credits;