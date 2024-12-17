import { useState, useRef, useContext } from 'react';
import { Popover, PopoverButton, PopoverPanel, useClose } from '@headlessui/react';
import { ChevronDownIcon, PlusIcon, TrashIcon } from '@heroicons/react/20/solid';
import Select from 'react-select';
import AuthContext from '../../context/AuthContext';
import AvatarContext from '../../context/AvatarContext';
import { api } from '../../constants/constants';

const AddCommentForm = ({ setComments, jobId, candidate, user }) => {
    let close = useClose()
    const { authTokens, userDetails, teamMembersAvatars, setTeamMembersAvatars, domain } = useContext(AuthContext);
    const { avatars, fetchAvatar } = useContext(AvatarContext)
    const [selectedStep, setSelectedStep] = useState(null)
    const [comment, setComment] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)


    const [steps, setSteps] = useState([
        { label: "Resume Screening", value: "Resume Screening" },
        { label: "Personality Screening", value: "Personality Screening" },
        { label: "Test", value: "Test" },
        { label: "AI Interview", value: "AI Interview" }
    ])



    const selectStyle = {
        menu: (provided, state) => ({
            ...provided,
            zIndex: 9999, // Adjust the zIndex as needed
        }),
        dropdownIndicator: styles => ({
            ...styles,
            color: 'black',
            fontSize: "0px",
        }),
        indicatorSeparator: styles => ({
            ...styles,
            width: '0px'
        }),
        placeholder: (base) => ({
            ...base,
            fontSize: '1em',
            fontWeight: 400,
        })
    }

    const addComment = async () => {
        console.log(jobId, candidate?.id, user?.id, selectedStep?.value, comment)

        try {
            setLoading(true)
            const response = await fetch(`${api}/interview/interview-step-feedback/`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + String(authTokens.access),
                    },
                    body: JSON.stringify({
                        candidate: candidate.id,
                        job: jobId,
                        user: user.id,
                        feedback: comment,
                        step_name: selectedStep?.value || "General",

                    })
                });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            const avatar = await fetchAvatar(data.user);

            console.log(avatar)

            data["avatar"] = avatar ? avatar : null
            data["updated_at"] = "few seconds ago"
            data.user = {
                id: userDetails.id,
                name: userDetails.name
            }

            const newComment = {
                id : data.id,
                step_name: selectedStep?.value || "General",
                feedback: comment,
                updated_at: data.updated_at
            }

            const updatedUserAvatars = teamMembersAvatars.filter(member => {
                return parseInt(userDetails.id) !== parseInt(member.id)
            });
            setComments(prevComments => {
                const updatedComments = { ...prevComments };

                // Ensure the user entry exists
                if (!updatedComments[userDetails.id]) {
                    updatedComments[userDetails.id] = {
                        id : userDetails.id,
                        name: userDetails.name,
                        email: userDetails.email,
                        avatar: avatar,
                        candidate: {
                            id: candidate.id,
                            name: candidate.name,
                        },
                        comments: {},
                    };
                }

                // Ensure the step name entry exists
                if (  !updatedComments[userDetails.id].comments[selectedStep?.value || "General"]) {
                    updatedComments[userDetails.id].comments[selectedStep?.value || "General"] = [];
                }

                // Add the new comment to the step name
                
                updatedComments[userDetails.id].comments[selectedStep?.value || "General"].push(newComment);

                return updatedComments;
            });
            setTeamMembersAvatars(updatedUserAvatars);

            setLoading(false)
            handleClose()
        } catch (error) {
            setError(error);
        } finally {
            setLoading(false);
        }
    }

    const handleClose = () => {
        setSelectedStep(null)
        setComment("")
        setError(null)
        close()
    }

    return (
        <>
            <div className="w-[30rem]  max-w-md overflow-hidden flex-auto rounded-lg bg-white border text-sm leading-6 shadow-lg ring-1 ring-gray-900/5">
                <div className="pt-5 ps-5">
                <label className='font-semibold text-base'>What do you think?</label>
                    <div className='flex items-start gap-5 p-4'>
                    
                        <div className="mt-1 flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-gray-50 ">
                          
                            <img className="inline-block ring-2 h-10 w-10 rounded-full  ring-gray-600/60 " src={userDetails?.profile_pic} />
                        </div>
                        <div className='flex flex-col gap-2 w-full'>
                            <span className='text-gray-500 font-medium'>{candidate?.name}</span>
                            <Select
                                className="w-full  text-xs"
                                styles={selectStyle}
                                // components={{ Option }}
                                value={selectedStep}
                                isClearable
                                onChange={(selectedOption) => setSelectedStep(selectedOption)}
                                options={steps}
                                defaultValue={steps[0]}
                                placeholder="Select Process (optional)"

                            />

                            <div>
                                <label className='block leading-6 text-sm text-gray-500'>Comment <span className='text-red-600 font-bold text-base'>*</span></label>
                                <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={2} className='ps-2 w-full border border-gray-300 rounded-md' />
                            </div>
                        </div>
                    </div>


                    <div className='w-full flex items-center justify-end p-3 border-t'>
                        <button
                            type='button'
                            className=" cursor-pointer bg-primary-600 px-2.5 py-1.5 rounded-md text-white"
                            disabled={loading}
                            onClick={() => addComment()}
                        >
                            {loading ? "Saving" : "Save"}
                        </button>
                    </div>


                </div>

            </div>
        </>
    );
}

export default AddCommentForm;