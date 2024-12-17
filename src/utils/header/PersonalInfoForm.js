import { ArrowUpTrayIcon, PaperClipIcon } from '@heroicons/react/24/outline';
import React from 'react'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'

function PersonalInfoForm({ userFormData,
    handleInputChange,
    setUserName,
    handleKeyDown,
    preference,
    PhotoIcon,
    resumeFile,
    profilePic,
    introVideo,
    handleFileChange,
    fileInputRef,
    country,
    formValidationResponse
}) {
    return (
        <>

            {formValidationResponse &&
                Object.keys(formValidationResponse)[0] === "error" && (
                    <div
                        className="flex flex-grow items-center p-4 m-3 text-sm text-red-800 border border-red-300 rounded-lg bg-red-50"
                        role="alert"
                    >
                        <svg
                            className="flex-shrink-0 inline w-4 h-4 me-3"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                        </svg>
                        <span className="sr-only">Info</span>
                        <div>
                            {formValidationResponse[Object.keys(formValidationResponse)[0]]}
                        </div>
                    </div>
                )}
            <div className="px-0 md:px-4 grid grid-cols-1 md:grid-cols-2 gap-4 gap-y-4">
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
                {preference?.include_profile_pic && <div className="col-span-full">
                    <label
                        htmlFor="cover-photo"
                        className="block text-sm font-medium leading-6 text-gray-900"
                    >
                        Upload your profile picture <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-3 py-2">
                        <div className="w-full flex justify-items-start align-middle gap-3 items-center">
                            {profilePic ?
                                <PaperClipIcon
                                    className="h-8 w-h-8 text-gray-300"
                                    aria-hidden="true"
                                />
                                :
                                <PhotoIcon
                                    className="h-8 w-h-8 text-gray-300"
                                />
                            }
                            {profilePic ? (
                                <div className="text-indigo-500 text-sm w-full flex justify-between items-center">
                                    <div className="justify-items-start align-middle text-sm leading-6 text-gray-600">
                                        <label
                                            className="relative rounded-md bg-white font-semibold"
                                        >
                                            <span>{profilePic.name}</span>
                                        </label>
                                        <p className="text-xs leading-5 text-gray-600">{profilePic.type} | {(profilePic.size / 1000000).toFixed(3)} MB</p>
                                    </div>

                                    <input
                                        onChange={handleFileChange}
                                        id="profile-pic-upload"
                                        name="profile-pic-upload"
                                        type="file"
                                        className="sr-only"
                                        ref={fileInputRef} // Reference to reset the input value
                                    />

                                    <label htmlFor="profile-pic-upload" className='border p-2 rounded-full me-2 cursor-pointer'><ArrowUpTrayIcon className='w-6 h-6' /></label>
                                </div>
                            ) : (
                                <div className="justify-items-start align-middle text-sm leading-6 text-gray-600">
                                    <label
                                        htmlFor="profile-pic-upload"
                                        className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-600"
                                    >
                                        <span>Upload a file</span>
                                        <input
                                            onChange={handleFileChange}
                                            id="profile-pic-upload"
                                            name="profile-pic-upload"
                                            type="file"
                                            className="sr-only"
                                            ref={fileInputRef} // Reference to reset the input value
                                        />
                                    </label>
                                    <p className="text-xs leading-5 text-gray-600">JPG, JPEG or PNG upto 2MB</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>}
                {preference?.include_intro_video && <div className="col-span-full">
                    <label
                        htmlFor="cover-photo"
                        className="block text-sm font-medium leading-6 text-gray-900"
                    >
                        Upload a 1 min Introduction video <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-3 py-2">
                        <div className="w-full flex justify-items-start align-middle gap-3 items-center">
                            {introVideo ?
                                <PaperClipIcon
                                    className="h-8 w-h-8 text-gray-300"
                                    aria-hidden="true"
                                />
                                :
                                <PhotoIcon
                                    className="h-8 w-h-8 text-gray-300"
                                />
                            }
                            {introVideo ? (
                                <div className="text-indigo-500 text-sm w-full flex justify-between items-center">
                                    <div className="justify-items-start align-middle text-sm leading-6 text-gray-600">
                                        <label
                                            className="relative rounded-md bg-white font-semibold"
                                        >
                                            <span>{introVideo.name}</span>
                                        </label>
                                        <p className="text-xs leading-5 text-gray-600">{introVideo.type} | {(introVideo.size / 1000000).toFixed(3)} MB</p>
                                    </div>

                                    <input
                                        onChange={handleFileChange}
                                        id="intro-video-upload"
                                        name="intro-video-upload"
                                        type="file"
                                        className="sr-only"
                                        ref={fileInputRef} // Reference to reset the input value
                                    />
                                    <label htmlFor="intro-video-upload" className='border p-2 rounded-full me-2 cursor-pointer'><ArrowUpTrayIcon className='w-6 h-6' /></label>
                                </div>
                            ) : (
                                <div className="justify-items-start align-middle text-sm leading-6 text-gray-600">
                                    <label
                                        htmlFor="intro-video-upload"
                                        className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-600"
                                    >
                                        <span>Upload a file</span>
                                        <input
                                            onChange={handleFileChange}
                                            id="intro-video-upload"
                                            name="intro-video-upload"
                                            type="file"
                                            className="sr-only"
                                            ref={fileInputRef} // Reference to reset the input value
                                        />
                                    </label>
                                    <p className="text-xs leading-5 text-gray-600">MP3 or MOV upto 50MB</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>}
                <div className="col-span-full">
                    <label
                        htmlFor="cover-photo"
                        className="block text-sm font-medium leading-6 text-gray-900"
                    >
                        Upload your resume <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                        <div className="text-center">
                            <PhotoIcon
                                className="mx-auto h-12 w-12 text-gray-300"
                                aria-hidden="true"
                            />
                            {resumeFile ? (
                                <span className="text-indigo-600 text-sm">
                                    {resumeFile.name}
                                </span>
                            ) : (
                                false
                            )}
                            <div className="mt-4 text-sm leading-6 text-gray-600">
                                <label
                                    htmlFor="resume-upload"
                                    className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-600"
                                >
                                    <span>Upload a file</span>
                                    <input
                                        onChange={handleFileChange}
                                        id="resume-upload"
                                        name="resume-upload"
                                        type="file"
                                        className="sr-only"
                                        ref={fileInputRef} // Reference to reset the input value
                                    />
                                </label>
                            </div>
                            <p className="text-xs leading-5 text-gray-600">PDF upto 10MB</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default PersonalInfoForm