import React from 'react'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'

function PersonalInfoForm({ userFormData,
    handleInputChange,
    setUserName,
    handleKeyDown,
    preference,
    PhotoIcon,
    selectedFile,
    handleFileChange,
    fileInputRef,
    country
}) {
    return (
        <>
            <div className="md:col-span-1">
                <label
                    htmlFor="username"
                    className="block text-sm font-medium leading-6 text-gray-900"
                >
                    Full Name <span className="text-red-500">*</span>
                </label>
                <div className="mt-2">
                    <input
                        required
                        id="name"
                        name="name"
                        type="text"
                        value={userFormData.name}
                        onChange={(e) => {
                            handleInputChange(e.target.name, e.target.value);
                            setUserName(e.target.value || "");
                        }}
                        className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block ps-4 p-2.5"
                    />
                </div>
            </div>

            <div className="md:col-span-1">
                <label
                    htmlFor="about"
                    className="block text-sm font-medium leading-6 text-gray-900"
                >
                    Email <span className="text-red-500">*</span>
                </label>
                <div className="mt-2">
                    <input
                        required
                        id="email"
                        name="email"
                        type="email"
                        onChange={(e) =>
                            handleInputChange(e.target.name, e.target.value)
                        }
                        value={userFormData.email}
                        className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block ps-4 p-2.5"
                    />
                </div>
            </div>
            <div className="md:col-span-1">
                <label
                    htmlFor="about"
                    className="block text-sm font-medium leading-6 text-gray-900"
                >
                    Contact <span className="text-red-500">*</span>
                </label>
                <div className="mt-2">
                    {/* <input
                        required
                        id="contact"
                        name="contact"
                        type="text"
                        onKeyDown={handleKeyDown}
                        onChange={(e) =>
                            handleInputChange(e.target.name, e.target.value)
                        }
                        value={userFormData.contact}
                        className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block ps-4 p-2.5"
                    /> */}
                    <PhoneInput
                        country={'in'}
                        value={userFormData?.contact}
                        onChange={(value) =>
                            handleInputChange("contact", value)
                        }
                        inputStyle={{
                            width: '100%',  // Custom width
                            height: '100%',
                            borderRadius: '0.5rem',  // Rounded corners
                            border: '1px solid #ccc',  // Custom border
                            padding: '11px 10px 11px 45px',  // Padding inside the input
                            fontSize: '0.875rem',
                            lineHeight: '1.25rem',
                        }}
                        buttonStyle={{
                            backgroundColor: 'transparent',  // Custom background color for the country flag button
                            borderTopLeftRadius: '0.5rem',
                            borderBottomLeftRadius: '0.5rem'
                        }}
                        dropdownStyle={{
                            backgroundColor: '#fafafa',  // Custom background for the dropdown
                            color: '#333',  // Text color in the dropdown
                        }}
                    />
                </div>
            </div>

            <div className="md:col-span-1">
                <label
                    htmlFor="about"
                    className="block text-sm font-medium leading-6 text-gray-900"
                >
                    City <span className="text-red-500">*</span>
                </label>
                <div className="mt-2">
                    <input
                        id="location"
                        name="city"
                        type="text"
                        required
                        onChange={(e) =>
                            handleInputChange(e.target.name, e.target.value)
                        }
                        value={userFormData.location.city}
                        className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block ps-4 p-2.5"
                    />
                </div>
            </div>
            <div className="md:col-span-1">
                <label
                    htmlFor="about"
                    className="block text-sm font-medium leading-6 text-gray-900"
                >
                    State <span className="text-red-500">*</span>
                </label>
                <div className="mt-2">
                    <input
                        id="location"
                        name="state"
                        type="text"
                        required
                        onChange={(e) =>
                            handleInputChange(e.target.name, e.target.value)
                        }
                        value={userFormData.location.state}
                        className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block ps-4 p-2.5"
                    />
                </div>
            </div>
            <div className="col-span-full">
                <label
                    htmlFor="cover-photo"
                    className="block text-sm font-medium leading-6 text-gray-900"
                >
                    Upload your resume
                </label>
                <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                    <div className="text-center">
                        <PhotoIcon
                            className="mx-auto h-12 w-12 text-gray-300"
                            aria-hidden="true"
                        />
                        {selectedFile ? (
                            <span className="text-sky-600 text-sm">
                                {selectedFile.name}
                            </span>
                        ) : (
                            false
                        )}
                        <div className="mt-4 text-sm leading-6 text-gray-600">
                            <label
                                htmlFor="file-upload"
                                className="relative cursor-pointer rounded-md bg-white font-semibold text-sky-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-sky-600 focus-within:ring-offset-2 hover:text-sky-500"
                            >
                                <span>Upload a file</span>
                                <input
                                    onChange={handleFileChange}
                                    id="file-upload"
                                    name="file-upload"
                                    type="file"
                                    className="sr-only"
                                    ref={fileInputRef} // Reference to reset the input value
                                />
                            </label>
                        </div>
                        <p className="text-xs leading-5 text-gray-600">PDF to 10MB</p>
                    </div>
                </div>
            </div>
        </>
    )
}

export default PersonalInfoForm