import { useEffect, useState } from "react";
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { components } from 'react-select';


const PersonalityScreeningOptions = ({ currentContainer, optionsData, setOptionsData, setShowQuestions, selectStyle, selectedQuestionSet, setSelectedQuestionSet, questionSets, questionSetLoading, handleSelectChange, setShowModal }) => {


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
            question_set: null
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
            setSelectedQuestionSet(questionSet)
            setFormData(updatedFormData.content.preference)

        } else {
            setFormData({
              
                question_set: null
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
        console.log(optionsData)
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




    return (
        <>
            <form onSubmit={handleSubmit}>
                <div className="grid relative gap-4 sm:grid-cols-2 sm:gap-6 ">
                    {/* <button type="submit" className="absolute right-0 inline-flex items-center px-5 py-2.5  mt-2 sm:mt-2 text-sm font-medium text-center text-white bg-primary-600 rounded-lg focus:ring-4 focus:ring-primary-200  hover:bg-primary-800">
                        Save
                    </button> */}
                    {/* General  */}
                    <section className="sm:col-span-2 border-b pb-5 w-full ">
                        <div className="px-2 sm:px-0 mb-2">
                            {/* <h3 className="text-base font-semibold leading-7 text-sky-700/70">General</h3> */}
                            <label htmlFor="max_resume_size" className="block mb-2  text-sm font-medium text-gray-800 ">No options</label>

                            {/* <p className=" max-w-2xl text-sm leading-2 text-gray-500">Personal details and application.</p> */}
                        </div>
                       
                    </section>

                </div>

            </form>
        </>
    );
}

export default PersonalityScreeningOptions;