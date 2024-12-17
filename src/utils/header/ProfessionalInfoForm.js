import React from 'react'

function ProfessionalInfoForm({
    PhotoIcon,
    selectedFile,
    handleFileChange,
    fileInputRef,
    preference,
    handleInputChange,
    userFormData
}) {
    return (
        <>

            {preference && (
                <div className="col-span-full py-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-y-4">
                        {preference && preference.include_notice_period && (
                            <div className="md:col-span-1">
                                <label
                                    htmlFor="about"
                                    className="block text-sm font-medium leading-6 text-gray-900"
                                >
                                    Notice Period <span className="text-red-500">*</span>{" "}
                                    <span className="text-xs font-normal text-gray-400 italic">
                                        (in days)
                                    </span>
                                </label>

                                {/* for mobile version  */}
                                <div class="relative mt-2 rounded-md shadow-sm ">

                                    <div class="items-center ">
                                        <div className="relative mt-2">
                                            <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">

                                            </div>
                                            <input
                                                id="notice_period_in_months"
                                                name="notice_period_in_months"
                                                type="number"
                                                required
                                                min={0}
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        e.target.name,
                                                        e.target.value !== "" ? parseInt(e.target.value) : ""
                                                    )
                                                }
                                                value={userFormData.notice_period_in_months}
                                                placeholder="2"
                                                className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block ps-4 p-2.5"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {preference && preference.include_relevant_experience && (
                            <div className="md:col-span-1">
                                <label
                                    htmlFor="about"
                                    className="block text-sm font-medium leading-6 text-gray-900"
                                >
                                    Relevant Experience
                                    <span className="text-red-500">*</span>{" "}
                                    <span className="text-xs font-normal text-gray-400 italic">
                                        (in months)
                                    </span>
                                </label>

                                {/* for mobile version  */}
                                <div class="relative mt-2 rounded-md shadow-sm ">
                                    <div class="  items-center ">
                                        <div className="relative mt-2">
                                            <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                                            </div>
                                            <input
                                                id="relevant_experience_in_months"
                                                name="relevant_experience_in_months"
                                                type="number"
                                                required
                                                min={0}
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        e.target.name,
                                                        e.target.value !== "" ? parseInt(e.target.value) : ""
                                                    )
                                                }
                                                value={userFormData.relevant_experience_in_months}
                                                placeholder="24"
                                                className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block ps-4 p-2.5"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {preference && preference.include_current_ctc && (
                            <div className="md:col-span-1">
                                <label
                                    htmlFor="about"
                                    className="block text-sm font-medium leading-6 text-gray-900"
                                >
                                    Current Annual Salary<span className="text-red-500">*</span>
                                </label>

                                {/* for mobile version  */}
                                <div class="relative mt-2 rounded-md shadow-sm ">
                                    <div class=" items-center ">
                                        <div className="relative mt-2">
                                            <div className="absolute inset-y-0 start-0 flex items-center px-3.5 pointer-events-none border-r">
                                                <span className="font-medium text-gray-500 text-sm">
                                                    {preference.currency?.value}
                                                </span>
                                            </div>
                                            <input
                                                id="current_ctc"
                                                name="current_ctc"
                                                type="number"
                                                required
                                                min={0}
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        e.target.name,
                                                        e.target.value !== "" ? parseInt(e.target.value) : ""
                                                    )
                                                }
                                                value={userFormData.current_ctc}
                                                placeholder=""
                                                className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block ps-14 p-2.5"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {preference && preference.include_expected_ctc && (
                            <div className="md:col-span-1">
                                <label
                                    htmlFor="about"
                                    className="block text-sm font-medium leading-6 text-gray-900"
                                >
                                    Expected Annual Salary<span className="text-red-500">*</span>
                                </label>

                                {/* for mobile version  */}
                                <div class="relative mt-2 rounded-md shadow-sm ">
                                    <div class="items-center ">
                                        <div className="relative mt-2">
                                            <div className="absolute inset-y-0 start-0 flex items-center px-3.5 pointer-events-none border-r">
                                                <span className="font-medium text-gray-500 text-sm">
                                                    {preference.currency?.value}
                                                </span>
                                            </div>
                                            <input
                                                id="expected_ctc"
                                                name="expected_ctc"
                                                type="number"
                                                required
                                                min={0}
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        e.target.name,
                                                        e.target.value !== "" ? parseInt(e.target.value) : ""
                                                    )
                                                }
                                                value={userFormData.expected_ctc}
                                                placeholder=""
                                                className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block ps-14 p-2.5"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {preference && preference.last_increment && (
                            <div className="md:col-span-1">
                                <label
                                    htmlFor="about"
                                    className="block text-sm font-medium leading-6 text-gray-900"
                                >
                                    Last Increment<span className="text-red-500">*</span>{" "}
                                    <span className="text-xs font-normal text-gray-400 italic">
                                        (in months)
                                    </span>
                                </label>

                                {/* for mobile version  */}
                                <div class="relative mt-2 rounded-md shadow-sm ">
                                    <div class="  items-center ">
                                        <div className="relative mt-2">
                                            <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                                            </div>
                                            <input
                                                id="last_increment"
                                                name="last_increment"
                                                type="number"
                                                required
                                                min={0}
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        e.target.name,
                                                        e.target.value !== "" ? parseInt(e.target.value) : ""
                                                    )
                                                }
                                                placeholder="4"
                                                value={userFormData.last_increment}
                                                className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block ps-4 p-2.5"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {preference && preference.include_linkedin && (
                            <div className="md:col-span-1">
                                <label
                                    htmlFor="about"
                                    className="block text-sm font-medium leading-6 text-gray-900"
                                >
                                    LinkedIn <span className="text-red-500">*</span>
                                </label>

                                {/* for mobile version  */}
                                <div class="relative mt-2 rounded-md shadow-sm ">
                                    <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center px-3 border-r">
                                        <i class="fa-brands fa-linkedin text-xl"></i>
                                    </div>
                                    <div class="  items-center ">
                                        <input
                                            id="linkedin"
                                            name="linkedin"
                                            type="text"
                                            required
                                            onChange={(e) =>
                                                handleInputChange(e.target.name, e.target.value)
                                            }
                                            value={userFormData.linkedin}
                                            className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block ps-12 p-2.5"
                                            placeholder="www.linkedin.com/in/alex123"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {preference && preference.include_github && (
                            <div className="md:col-span-1">
                                <label
                                    htmlFor="about"
                                    className="block text-sm font-medium leading-6 text-gray-900"
                                >
                                    Github <span className="text-red-500">*</span>
                                </label>

                                <div class="relative mt-2 rounded-md shadow-sm ">
                                    <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center px-3 border-r">
                                        <i class="fa-brands fa-github text-xl"></i>
                                    </div>
                                    <div class="  items-center ">
                                        <input
                                            id="github"
                                            name="github"
                                            type="text"
                                            required
                                            onChange={(e) =>
                                                handleInputChange(e.target.name, e.target.value)
                                            }
                                            value={userFormData.github}
                                            className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block ps-12 p-2.5"
                                            placeholder=""
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}

export default ProfessionalInfoForm