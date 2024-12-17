import { useEffect, useState } from "react";
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { components } from 'react-select';


const ResumeOptions = ({ currentContainer, optionsData, setOptionsData, setShowQuestions, selectStyle, selectedQuestionSet, setSelectedQuestionSet, questionSets, questionSetLoading, handleSelectChange, setShowModal }) => {


    const currencies = [
        { value: 'INR', label: 'INR - Indian Rupees' },
        { value: 'USD', label: 'USD - US Dollar' },
        { value: 'EUR', label: 'EUR - Euro' },
        { value: 'GBP', label: 'GBP - British Pound' },
        { value: 'JPY', label: 'JPY - Japanese Yen' },
        // Add more currency options as needed
    ];

    const [selectedCurrency, setSelectedCurrency] = useState(currencies[0]);


    const locations = [
        { label: "Mumbai", value: "Mumbai" },
        { label: "Pune", value: "Pune" },
        { label: "Delhi", value: "Delhi" },
        { label: "US", value: "US" },
        { label: "NZ", value: "NZ" }
    ]

    console.count("resume options")

    const [formData, setFormData] = useState(
        {
            max_retries: 0,
            max_resume_size: 0,
            max_applicants: 0,
            locations_to_exclude: null,
            include_github: false,
            include_linkedin: true,
            include_questions: false,
            question_set: null,
            include_notice_period: true,
            include_current_ctc: false,
            include_expected_ctc: false,
            include_relevant_experience: false,
            last_increment: false,
            currency : currencies[0].value
        }
    )

    // console.log("current container and it's options : ", currentContainer, optionsData)


    useEffect(() => {
        if (currentContainer && currentContainer?.content?.preference) {
            if (currentContainer?.content?.preference.include_questions) {
                setShowQuestions(true)
            }

            const updatedFormData = { ...currentContainer }
            const questionSet = currentContainer?.content?.preference.question_set?.id ? questionSets?.find(set => parseInt(set.id) === parseInt(currentContainer?.content?.preference.question_set.id)) : questionSets?.find(set => parseInt(set.id) === parseInt(currentContainer?.content?.preference.question_set))
            if (questionSet) {
                updatedFormData.content.preference.question_set = questionSet.id
            }
            setSelectedCurrency(currentContainer?.content?.preference.currency ? currencies.find(c => c.value === currentContainer?.content?.preference.currency) : currencies[0])
            setSelectedQuestionSet(questionSet)
            setFormData((prev) => ({ ...prev, ...updatedFormData.content.preference }))

        } else {
            setFormData({
                max_retries: 0,
                max_resume_size: 0,
                max_applicants: 0,
                locations_to_exclude: null,
                include_github: false,
                include_linkedin: true,
                include_questions: false,
                include_notice_period: true,
                include_current_ctc: false,
                include_expected_ctc: false,
                include_relevant_experience: false,
                last_increment: false,
                question_set: null,
                currency : currencies[0].value
            })
        }
    }, [currentContainer])


    useEffect(() => {
        if (selectedQuestionSet) {
            setFormData((prev) => ({ ...prev, question_set: selectedQuestionSet.id }))
        }
    }, [selectedQuestionSet])

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(optionsData, formData)
        setOptionsData({ ...optionsData, ...formData })
    }

    const handleLocationAdd = (selectedOption) => {
        if (selectedOption) {
            setFormData({
                ...formData,
                locations_to_exclude: selectedOption,
            });
        }
    }


    console.log(formData)

    return (
        <>
            <form onSubmit={handleSubmit} className="h-full">
                <div className="grid h-full relative gap-4 sm:grid-cols-2 sm:gap-6 ">
                    <button type="submit" className="absolute right-0 inline-flex items-center px-5 py-2.5  mt-2 sm:mt-2 text-sm font-medium text-center text-white bg-primary-600 rounded-lg focus:ring-4 focus:ring-primary-200  hover:bg-primary-800">
                        Save
                    </button>
                    {/* General  */}
                    <section className="sm:col-span-2 border-b pb-5 w-full ">
                        <div className="px-2 sm:px-0 mb-2">
                            <h3 className="text-base font-semibold leading-7 text-sky-700/70">General</h3>
                            {/* <p className=" max-w-2xl text-sm leading-2 text-gray-500">Personal details and application.</p> */}
                        </div>
                        <div className="ps-5 grid gap-4">
                            <div className="sm:col-span-2 ">
                                <label htmlFor="max_resume_size" className="block mb-2  text-sm font-medium text-gray-800 ">Max Resume Size (mb)</label>
                                <input type="number" onChange={(e) => setFormData({ ...formData, max_resume_size: e.target.value })} value={formData.max_resume_size} name="max_resume_size" id="max_resume_size" className="w-full lg:w-1/2 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block p-2.5 " placeholder="2MB" required="" />
                            </div>
                            <div className="sm:col-span-2 ">
                                <label htmlFor="max_retries" className="block mb-2 text-sm font-medium text-gray-800 ">Max Retries</label>
                                <input type="number" onChange={(e) => setFormData({ ...formData, max_retries: e.target.value })} value={formData.max_retries} name="max_retries" id="max_retries" className="w-full lg:w-1/2 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block p-2.5 " placeholder="3" required="" />
                            </div>
                            <div className="sm:col-span-2 ">
                                <label htmlFor="max_applicants" className="block mb-2 text-sm font-medium text-gray-800 ">Max Applicants</label>
                                <input type="number" onChange={(e) => setFormData({ ...formData, max_applicants: e.target.value })} value={formData.max_applicants} name="max_applicants" id="max_applicants" className="w-full lg:w-1/2 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block p-2.5 " placeholder="200" required="" />
                            </div>
                        </div>
                    </section>

                    {/* Location  */}
                    <section className="sm:col-span-2 border-b pb-5 w-full ">
                        <div className="px-2 sm:px-0 mb-2">
                            <h3 className="text-base font-semibold leading-7  text-sky-700/70">Location Preferences</h3>
                            {/* <p className=" max-w-2xl text-sm leading-2 text-gray-500">Personal details and application.</p> */}
                        </div>
                        <div className="ps-5 grid gap-4">
                            <div className='sm:col-span-2'>
                                <label htmlFor="category" className="block mb-2 text-sm font-medium text-gray-800 ">Exclude</label>
                                <CreatableSelect className='text-sm md:w-1/2 min-w-fit' placeholder="Add or select skills..." value={formData.locations_to_exclude} isMulti onChange={handleLocationAdd} options={locations} isClearable />
                            </div>

                        </div>
                    </section>

                    {/* Profiles to include */}
                    <section className="sm:col-span-2 border-b pb-5 w-full ">
                        <div className="px-2 sm:px-0 mb-2">
                            <h3 className="text-base font-semibold leading-7  text-sky-700/70">Social Accounts</h3>
                        </div>
                        <div className="ps-5 flex  gap-4">
                            <div className=" flex items-center space-x-3">
                                <input type="checkbox" onChange={(e) => setFormData({ ...formData, include_github: e.target.checked })} checked={formData.include_github} name="include_github" id="include_github" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block  p-2.5 " />

                                <label htmlFor="include_github" className="block text-sm font-medium text-gray-900 ">Github Profile</label>
                            </div>
                            <div className=" flex items-center space-x-3">
                                <input type="checkbox" onChange={(e) => setFormData({ ...formData, include_linkedin: e.target.checked })} checked={formData.include_linkedin} name="include_linkedin" id="include_linkedin" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block  p-2.5 " />

                                <label htmlFor="include_linkedin" className="block text-sm font-medium text-gray-900 ">LinkedIn Profile</label>
                            </div>
                        </div>
                    </section>

                    {/* Other details  */}
                    <section className="sm:col-span-2 border-b pb-5 w-full ">
                        <div className="px-2 sm:px-0 mb-5">
                            <h3 className="text-base font-semibold leading-5  text-sky-700/70">Other Details</h3>
                            <p className=" max-w-2xl text-sm leading-1 text-gray-500">Check the below boxes to include these questions in the application form</p>
                        </div>
                        <div className="ps-5 flex flex-col gap-4">
                            <div className=" flex  items-center space-x-3 ">
                                {/* <input type="checkbox" onChange={(e) => setFormData({ ...formData, include_relevant_experience: e.target.checked })} checked={formData.include_relevant_experience} name="include_relevant_experience" id="include_relevant_experience" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block  p-2.5 " /> */}

                                <label htmlFor="include_relevant_experience" className="w-60 block text-sm font-medium text-gray-900 ">Currency Format</label>
                                <Select
                                    className="text-sm "
                                    styles={selectStyle}
                                    value={selectedCurrency}
                                    onChange={(selectedOption) => {setSelectedCurrency(selectedOption);setFormData({ ...formData, currency: selectedOption.value })}}
                                    options={currencies}
                                    placeholder="Select a currency format..."
                                />
                            </div>
                            <div className=" flex  items-center space-x-3 ">

                                <label htmlFor="include_relevant_experience" className="w-60 block text-sm font-medium text-gray-900 ">Relevant Experience(in months)</label>
                                <input type="checkbox" onChange={(e) => setFormData({ ...formData, include_relevant_experience: e.target.checked })} checked={formData.include_relevant_experience} name="include_relevant_experience" id="include_relevant_experience" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block  p-2.5 " />

                            </div>
                            <div className=" flex items-center space-x-3">

                                <label htmlFor="include_notice_period" className="w-60 block text-sm font-medium text-gray-900 ">Notice Period</label>
                                <input type="checkbox" onChange={(e) => setFormData({ ...formData, include_notice_period: e.target.checked })} checked={formData.include_notice_period} name="include_notice_period" id="include_notice_period" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block  p-2.5 " />

                            </div>
                            <div className=" flex items-center space-x-3">

                                <label htmlFor="include_expected_ctc" className="w-60 block text-sm font-medium text-gray-900 ">Expected CTC</label>
                                <input type="checkbox" onChange={(e) => setFormData({ ...formData, include_expected_ctc: e.target.checked })} checked={formData.include_expected_ctc} name="include_expected_ctc" id="include_expected_ctc" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block  p-2.5 " />

                            </div>
                            <div className=" flex items-center space-x-3">

                                <label htmlFor="include_current_ctc" className="w-60 block text-sm font-medium text-gray-900 ">Current CTC</label>
                                <input type="checkbox" onChange={(e) => setFormData({ ...formData, include_current_ctc: e.target.checked })} checked={formData.include_current_ctc} name="include_current_ctc" id="include_current_ctc" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block  p-2.5 " />

                            </div>
                            <div className=" flex items-center space-x-3">

                                <label htmlFor="last_increment" className="w-60 block text-sm font-medium text-gray-900 ">Last Increment</label>
                                <input type="checkbox" onChange={(e) => setFormData({ ...formData, last_increment: e.target.checked })} checked={formData.last_increment} name="last_increment" id="last_increment" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block  p-2.5 " />

                            </div>
                        </div>
                    </section>

                </div>

            </form>
        </>
    );
}

export default ResumeOptions;