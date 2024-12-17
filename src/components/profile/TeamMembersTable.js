import React, { useContext, useState } from 'react';
import Alert from "../../assets/warning.png";
import { XMarkIcon } from "@heroicons/react/20/solid";
import AuthContext from '../../context/AuthContext';

const TeamMembersTable = ({ teamMembers, removeMember, defaultProfilePic }) => {
    const { authTokens, userDetails, setUserDetails } = useContext(AuthContext);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [memberToDelete, setMemberToDelete] = useState(null);
    return (
        <>
            <div className="overflow-hidden rounded-lg border">
                <table className="min-w-full table-auto rounded-md">
                    <thead className="bg-gray-100 border-b">
                        <tr>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Member</th>
                            <th className="py-3 px-4 text-center text-sm font-semibold text-gray-700">Invited By</th>
                            <th className="py-3 px-4 text-center text-sm font-semibold text-gray-700">Invited On</th>
                            <th className="py-3 px-4 text-center text-sm font-semibold text-gray-700">Role</th>
                            {userDetails.role?.name === "Admin" && <th className="py-3 px-4 text-center text-sm font-semibold text-gray-700">Action</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {teamMembers?.map((member) => (
                            <tr key={member.id} className="border-b bg-white hover:bg-gray-50">
                                <td className="py-2 px-4 flex items-center space-x-3">
                                    <img
                                        src={member.profile_pic || defaultProfilePic}
                                        alt="Profile"
                                        className="w-12 h-12 rounded-full border border-gray-300"
                                    />
                                    <div>
                                        <p className="font-medium text-gray-800">{member.name}</p>
                                        <p className="text-xs text-gray-500">{member.email}</p>
                                    </div>
                                </td>
                                <td className="py-2 px-4 text-sm text-center text-gray-700">
                                    {member.invited_by?.name || "NA"}
                                </td>
                                <td className="py-2 px-4 text-sm text-center text-gray-700">
                                    {member.created_at
                                        ? new Date(member.created_at).toLocaleString("en-US", {
                                            weekday: "short", // Abbreviated day of the week (e.g., Wed)
                                            day: "2-digit", // Two-digit day (e.g., 20)
                                            month: "long", // Full month name (e.g., June)
                                            year: "numeric", // Four-digit year (e.g., 2024)
                                            hour: "2-digit", // Two-digit hour (e.g., 12)
                                            minute: "2-digit", // Two-digit minute (e.g., 24)
                                            hour12: true, // 12-hour format with am/pm
                                        })
                                        : "NA"}
                                </td>
                                <td className="py-2 px-4 text-center">
                                    <div className="bg-gray-100 w-36 text-gray-700 text-sm px-3 py-1 rounded-full m-auto">
                                        {member.role?.name}
                                    </div>
                                </td>
                                {userDetails.role?.name === "Admin" && <td className="py-2 px-4 text-center">
                                    <button
                                        onClick={() => {
                                            setMemberToDelete(member)
                                            setShowDeleteModal(true)
                                        }}
                                        className="text-red-500 rounded-lg text-sm hover:text-red-600 font-semibold transition duration-200"
                                    >
                                        Remove
                                    </button>
                                </td>}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showDeleteModal && (
                <div
                    className="relative  z-30"
                    aria-labelledby="modal-title"
                    role="dialog"
                    aria-modal="true"
                >
                    <div className="fixed  inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

                    <div className="fixed h-full  inset-0  z-30 w-screen overflow-y-auto">
                        <div className="flex min-h-full h-full w-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
                            <div className="relative lg:min-w-96 w-full sm:w-1/3   transform flex-col justify-evenly rounded-lg bg-white text-left shadow-xl ">
                                {/* Header  */}
                                <div className="border-b  rounded-t-lg bg-gray-50 flex justify-between px-5 py-4">
                                    <div className="flex items-center space-x-3">
                                        <img src={Alert} className="w-12 h-12" />
                                        <h3
                                            className="font-bold text-xl text-gray-900"
                                            id="modal-title"
                                        >
                                            Confirm
                                        </h3>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setShowDeleteModal(false);
                                            setMemberToDelete(null);
                                        }}
                                    >
                                        <XMarkIcon className="w-6 h-6" />
                                    </button>
                                </div>

                                {/* Body  */}
                                <div className="h-5/6 px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start h-5/6 ">
                                        <div className="mt-3 text-center  h-full w-full sm:ml-4 sm:mt-0 sm:text-left">
                                            <div className="col-span-full">
                                                <div className=" min-w-fit p-10">
                                                    <label
                                                        for=""
                                                        class="block text-base font-medium leading-6 text-gray-900"
                                                    >
                                                        Are you sure you want to remove{" "}
                                                        {memberToDelete?.name}?
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer  */}
                                <div className="bg-gray-50  rounded-b-lg  px-4 py-3 flex justify-end items-center sm:px-6 space-x-3">
                                    <button
                                        type="button"
                                        // disabled={deleting}
                                        onClick={() => {
                                            setShowDeleteModal(false);
                                            removeMember(memberToDelete?.id);
                                        }}
                                        className="h-10  rounded-md disabled:bg-opacity-40 bg-red-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                                    >
                                        <i class="fa-solid fa-trash-can me-2"></i>
                                        Delete
                                    </button>

                                    <button
                                        onClick={() => {
                                            setShowDeleteModal(false);
                                            setMemberToDelete(null);
                                        }}
                                        type="button"
                                        className=" w-20 h-10  justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default TeamMembersTable;
