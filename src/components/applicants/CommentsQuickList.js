import { useState, useRef, useContext } from 'react';
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { ChevronDownIcon, TrashIcon } from '@heroicons/react/20/solid';
import AuthContext from '../../context/AuthContext';

const feedback = {
    id: 1,
    interviewStep: 'Initial Screening',
    candidate: 'Tanvi Nayak',
    user: 'Jane Smith',
    feedback: 'The candidate showed great enthusiasm and understanding of the basics.',
}

const FeedbackList = ({ setComments, comment, candidateName, img }) => {
    // const [feedbacks, setFeedbacks] = useState(feedbackData);
    const { authTokens, userDetails } = useContext(AuthContext);
    const buttonRef = useRef(null);
    const [deleting, setDeleting] = useState(false)
    const [error, setError] = useState(null)
    const handleClose = () => {
        buttonRef.current.click()

    };

    const deleteComment = async (stepName,id) => {
        try {
            setDeleting(true)
            const response = await fetch(`/interview/interview-step-feedback/${id}/`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + String(authTokens.access),
                    },

                });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            // const data = await response.json();
            // console.log(data)

            console.log(id)
            setComments(prevComments => {
    
                // Create a copy of the previous comments
                const updatedComments = { ...prevComments };
    
                // Check if the user exists
                if (updatedComments[userDetails.id]) {
                    // Check if the step name exists
                    if (updatedComments[userDetails.id].comments[stepName]) {
                        // Filter out the comment with the specified id
                        updatedComments[userDetails.id].comments[stepName] = updatedComments[userDetails.id].comments[stepName].filter(comment => comment.id !== parseInt(id));
    
                        // If the step has no more comments, delete the step entry
                        if (updatedComments[userDetails.id].comments[stepName].length === 0) {
                            delete updatedComments[userDetails.id].comments[stepName];
                        }
                    }
                    
                    // If the user has no more comments, delete the user entry
                    if (Object.keys(updatedComments[userDetails.id].comments).length === 0) {
                        delete updatedComments[userDetails.id];
                    }
                }
    
                return updatedComments;
            });


            // handleClose()
        } catch (error) {
            setError(error);
        } finally {
            setDeleting(false);
        }
    }


    return (

        <Popover className="relative " >
            <div className="inline-flex items-center gap-x-1 text-sm font-semibold leading-6 text-gray-900"
            >
                <PopoverButton
                    ref={buttonRef}
                    onMouseEnter={() => buttonRef.current.click()}
                    className={'outline-none'}
                >
                    <img className="inline-block ring-2  h-8 w-8 rounded-full  ring-gray-600/60 " src={comment?.avatar} />
                </PopoverButton>
            </div>

            <PopoverPanel
                anchor="top"
                className="absolute left-1/2 z-40 flex w-auto translate-x-1/4 max-w-max px-4 py-2 transition data-[closed]:translate-y-1 data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-150 data-[enter]:ease-out data-[leave]:ease-in"

            >
                <div className="w-auto sm:w-[26rem] max-w-md flex-auto overflow-hidden rounded-lg bg-white border text-sm leading-6 shadow-lg ring-1 ring-gray-900/5">



                    <div className="w-full relative flex gap-x-4 rounded-lg text-base p-6">

                        <div className="mt-1 flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-gray-50 ">
                            <img className="inline-block ring-2 h-10 w-10 rounded-full  ring-gray-600/60 " src={comment?.avatar} />
                        </div>
                        <div className='w-full'>
                            <label className="font-semibold text-gray-900 me-2">
                                {comment?.name}
                            </label>
                            <div className='bg-gray-50 rounded-md ring-1 ring-blue-200 mt-1 w-full p-3 flex flex-col gap-y-3'>
                                {
                                    Object.keys(comment.comments).map((c,index) => (

                                        <div key={c} className={`relative ${index < Object.keys(comment.comments).length - 1 && "border-b"} pb-1`}>
                                           { comment.comments[c].map((com, index) => (
                                            <>
                                                <div key={comment.id} className={`relative ${index < comment.comments[c].length - 1 && "border-b"} pb-2`}>
                                                    {
                                                        (comment.id) === userDetails.id &&
                                                        <button
                                                                type='button'
                                                                className="absolute right-0 top-0 cursor-pointer text-red-500 hover:text-red-700"
                                                                onClick={() => deleteComment(com.step_name,com.id)}
                                                            >
                                                                <TrashIcon className="h-4 w-4" />
                                                            </button>
                                                    }
                                                    <div key={com.id} className='flex justify-start items-center gap-x-2'>
                                                        <p className="text-blue-600/80">{com.step_name}</p>
                                                        <span className='text-sm'>{com.updated_at}</span>
                                                    </div>

                                                    <label className=" text-gray-700 leading-3">{com.feedback}</label>
                                                </div>
                                            </>
                                        ))}
                                        </div>

                                    ))
                                }
                            </div>


                        </div>
                    </div>

                </div>
            </PopoverPanel>

        </Popover>

    );
};

export default FeedbackList;