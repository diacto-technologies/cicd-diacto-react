
import CreatableSelect from 'react-select/creatable';
import CustomToolbar from "../../utils/react-quill/CustomToolbar"
import '../../utils/react-quill/Toolbar.css'

import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useEffect, useState } from 'react';


export default function JobForm({ handleFormSubmit, formData, setFormData, errors, setErrors, successMessage, setSuccessMessage }) {

    const currentDate = new Date().toISOString().split('T')[0];
    const [text, setText] = useState('');
    const [htmlContent, setHtmlContent] = useState('');

    useEffect(() => {

        if (formData.description) {
            console.log(formData)
            setText(formData.description)
            setHtmlContent(formData.jd_html || formData.description)
        }
    },[formData.jd_html,formData.description])

    const skills = [
        {
            label: 'Python', value: 'Python'
        },
        {
            label: 'Javascript', value: 'Javascript'
        },
        {
            label: 'Java', value: 'Java'
        },
        {
            label: 'Data Analysis', value: 'Data Analysis'
        },
        {
            label: 'Power BI', value: 'Power BI'
        },
        {
            label: 'Tableau', value: 'Tableau'
        },
        {
            label: 'Machine Learning', value: 'Machine Learning'
        },
        {
            label: 'C++', value: 'C++'
        },
        {
            label: 'Excel', value: 'Excel'
        },
        {
            label: 'SQL', value: 'SQL'
        },
        {
            label: 'MongoDB', value: 'MongoDB'
        }

    ];

    const modules = {
        toolbar: { container: '#toolbar', }
    };

    const formats = [
        'font', 'size',
        'bold', 'italic', 'underline', 'strike',
        'color', 'background',
        'script',
        'header', 'blockquote', 'code-block',
        'indent', 'list',
        'direction', 'align',
        'link', 
        // 'image',
        //  'video', 
        //  'formula',
    ]

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleChange = (content, delta, source, editor) => {
        // console.log(content, delta, source, editor.getText())
        setHtmlContent(content)
        setText(editor.getText());
        setFormData({
            ...formData,
            description: editor.getText(),
            jd_html : content
        });
    };


    const handleSkillsAdd = (selectedOption) => {
        console.log(selectedOption)
        if (selectedOption) {
            setFormData({
                ...formData,
                must_have_skills: selectedOption,
            });
        }
    }



    return (
        <form className='pe-3' id='create-job-form' onSubmit={handleFormSubmit}>
            <div className="space-y-12">


                <div className="border-b border-gray-900/10 pb-12">
                    {/* <h2 className="text-base font-semibold leading-7 text-gray-900">Personal Information</h2>
                    <p className="mt-1 text-sm leading-6 text-gray-600">Use a permanent address where you can receive mail.</p> */}

                    <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                        <div className="sm:col-span-3">
                            <label htmlFor="first-name" className="block text-sm font-medium leading-6 text-gray-900">
                                Job title
                            </label>
                            <div className="mt-2">
                                <input
                                    type="text"
                                    name="title"
                                    id="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    autoComplete="title"
                                    className="px-3 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>

                        <div className="col-span-full">
                            <div className='flex flex-col md:flex-row items-start'>
                                <label htmlFor="about" className=" text-sm me-3 font-medium leading-6 text-gray-900">
                                    Description
                                </label>
                                <span className='flex items-center text-xs py-1 px-3 rounded-lg border border-sky-300 text-sky-700'><i className="fa-solid fa-circle-info text-sky-500 text-sm me-1"></i> The scoring process relies on the details provided in the job description. Kindly verify that the description is in line with the requirements before finalizing the job posting.</span>
                                {/* <div className='loader'><span></span></div> */}
                            </div>
                            <div className="mt-2">
                                <CustomToolbar />
                                <ReactQuill theme="snow"
                                    value={htmlContent || text}
                                    className='bg-white h-72'
                                    onChange={handleChange}
                                    placeholder='Write a few sentences about the job role...'
                                    modules={modules}
                                    formats={formats} />

                                {/* <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="px-3 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                    defaultValue={''}
                                /> */}
                            </div>
                            {/* <p className="mt-3 text-sm leading-6 text-gray-600">Write a few sentences about the job role.</p> */}
                        </div>

                        <div className="sm:col-span-4">
                            <label htmlFor="last-name" className="block text-sm font-medium leading-6 text-gray-900">
                                Must have skills
                            </label>
                            <div className="mt-2">
                                <CreatableSelect className='text-sm md:w-1/2 min-w-fit' placeholder="Add or select skills..." value={formData.must_have_skills} isMulti onChange={handleSkillsAdd} options={skills} isClearable />
                                {/* <input
                                    type="text"
                                    name="location"
                                    id="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    autoComplete="location"
                                    className="px-3 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                /> */}
                            </div>
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="last-name" className="block text-sm font-medium leading-6 text-gray-900">
                                Experience <span className='text-gray-500'>(in years)</span>
                            </label>
                            <div className="mt-2 flex items-center">
                                <input
                                    type="number"
                                    name="min_experience"
                                    id="min_experience"
                                    value={formData.min_experience}
                                    onChange={handleInputChange}
                                    min={0}
                                    autoComplete="min_experience"
                                    className="block w-20 px-3 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                />
                                <span className='px-4'>to</span>
                                <input
                                    type="number"
                                    name="max_experience"
                                    min={1}
                                    value={formData.max_experience}
                                    onChange={handleInputChange}
                                    id="max_experience"
                                    autoComplete="max_experience"
                                    className="block w-20 px-3 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                />
                                <span className='px-4'>years</span>
                            </div>
                        </div>

                        <div className="sm:col-span-4">
                            <label htmlFor="last-name" className="block text-sm font-medium leading-6 text-gray-900">
                                Location
                            </label>
                            <div className="mt-2">
                                <input
                                    type="text"
                                    name="location"
                                    id="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    autoComplete="location"
                                    className="px-3 block md:w-1/3 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-4 ">
                            <label htmlFor="country" className="block text-sm font-medium leading-6 text-gray-900">
                                Employment Type
                            </label>
                            <div className="mt-2 ">
                                <select
                                    id="employment_type"
                                    name="employment_type"
                                    value={formData.employment_type}
                                    onChange={handleInputChange}
                                    autoComplete="employment_type"
                                    className="block w-full md:w-1/3 px-3 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:max-w-xs sm:text-sm sm:leading-6"
                                >
                                    <option>Full Time</option>
                                    <option>Part-Time</option>
                                    <option>Internship</option>
                                    <option>Contract</option>
                                </select>
                            </div>
                        </div>

                        <div className="sm:col-span-4 ">
                            <label htmlFor="last-name" className="block text-sm font-medium leading-6 text-gray-900">
                                Close Date
                            </label>
                            <div className="mt-2">
                                <input
                                    type="date"
                                    name="close_date"
                                    id="close_date"
                                    value={formData.close_date ? new Date(formData.close_date).toISOString().split('T')[0] : formData.close_date}
                                    onChange={handleInputChange}
                                    min={currentDate}
                                    autoComplete="close_date"
                                    className="block w-full md:w-1/3 rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>

                        {/* <div className="col-span-full">
                            <label htmlFor="street-address" className="block text-sm font-medium leading-6 text-gray-900">
                                Street address
                            </label>
                            <div className="mt-2">
                                <input
                                    type="text"
                                    name="street-address"
                                    id="street-address"
                                    autoComplete="street-address"
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-2 sm:col-start-1">
                            <label htmlFor="city" className="block text-sm font-medium leading-6 text-gray-900">
                                City
                            </label>
                            <div className="mt-2">
                                <input
                                    type="text"
                                    name="city"
                                    id="city"
                                    autoComplete="address-level2"
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="region" className="block text-sm font-medium leading-6 text-gray-900">
                                State / Province
                            </label>
                            <div className="mt-2">
                                <input
                                    type="text"
                                    name="region"
                                    id="region"
                                    autoComplete="address-level1"
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="postal-code" className="block text-sm font-medium leading-6 text-gray-900">
                                ZIP / Postal code
                            </label>
                            <div className="mt-2">
                                <input
                                    type="text"
                                    name="postal-code"
                                    id="postal-code"
                                    autoComplete="postal-code"
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div> */}
                    </div>
                </div>


                {/* Notifications  */}
                <div className="border-b border-gray-900/10 pb-12">
                    <h2 className="text-base font-semibold leading-7 text-gray-900">Notifications</h2>
                    <p className="mt-1 text-sm leading-6 text-gray-600">
                        We'll always let you know about important changes, but you pick what else you want to hear about.
                    </p>

                    <div className="mt-10 space-y-10">
                        <fieldset>
                            <legend className="text-sm font-semibold leading-6 text-gray-900">By Email</legend>
                            <div className="mt-6 space-y-6">
                                {/* <div className="relative flex gap-x-3">
                                    <div className="flex h-6 items-center">
                                        <input
                                            id="comments"
                                            name="comments"
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-blue-600"
                                        />
                                    </div>
                                    <div className="text-sm leading-6">
                                        <label htmlFor="comments" className="font-medium text-gray-900">
                                            Comments
                                        </label>
                                        <p className="text-gray-500">Get notified when someones posts a comment on a posting.</p>
                                    </div>
                                </div> */}
                                <div className="relative flex gap-x-3">
                                    <div className="flex h-6 items-center">
                                        <input
                                            id="new_application_notify"
                                            name="new_application_notify"
                                            type="checkbox"
                                            checked={formData.new_applicant_notify}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                new_applicant_notify: e.target.checked
                                            })}
                                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-blue-600"
                                        />
                                    </div>
                                    <div className="text-sm leading-6">
                                        <label htmlFor="candidates" className="font-medium text-gray-900">
                                            Candidates
                                        </label>
                                        <p className="text-gray-500">Get notified when a candidate applies for a job.</p>
                                    </div>
                                </div>
                                {/* <div className="relative flex gap-x-3">
                                    <div className="flex h-6 items-center">
                                        <input
                                            id="offers"
                                            name="offers"
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-blue-600"
                                        />
                                    </div>
                                    <div className="text-sm leading-6">
                                        <label htmlFor="offers" className="font-medium text-gray-900">
                                            Offers
                                        </label>
                                        <p className="text-gray-500">Get notified when a candidate accepts or rejects an offer.</p>
                                    </div>
                                </div> */}
                            </div>
                        </fieldset>
                        {/* <fieldset>
                            <legend className="text-sm font-semibold leading-6 text-gray-900">Push Notifications</legend>
                            <p className="mt-1 text-sm leading-6 text-gray-600">These are delivered via SMS to your mobile phone.</p>
                            <div className="mt-6 space-y-6">
                                <div className="flex items-center gap-x-3">
                                    <input
                                        id="push-everything"
                                        name="push-notifications"
                                        type="radio"
                                        className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-blue-600"
                                    />
                                    <label htmlFor="push-everything" className="block text-sm font-medium leading-6 text-gray-900">
                                        Everything
                                    </label>
                                </div>
                                <div className="flex items-center gap-x-3">
                                    <input
                                        id="push-email"
                                        name="push-notifications"
                                        type="radio"
                                        className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-blue-600"
                                    />
                                    <label htmlFor="push-email" className="block text-sm font-medium leading-6 text-gray-900">
                                        Same as email
                                    </label>
                                </div>
                                <div className="flex items-center gap-x-3">
                                    <input
                                        id="push-nothing"
                                        name="push-notifications"
                                        type="radio"
                                        className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-blue-600"
                                    />
                                    <label htmlFor="push-nothing" className="block text-sm font-medium leading-6 text-gray-900">
                                        No push notifications
                                    </label>
                                </div>
                            </div>
                        </fieldset> */}
                    </div>
                </div>
            </div>

            {/* <div className="mt-6 flex items-center justify-end gap-x-6">
                <button type="button" className="text-sm font-semibold leading-6 text-gray-900">
                    Cancel
                </button>
                <button
                    type="submit"
                    className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                    Save
                </button>
            </div> */}
        </form>
    )
}
