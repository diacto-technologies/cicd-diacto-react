import { TrashIcon } from "@heroicons/react/20/solid";
import AuthContext from "../../context/AuthContext";
import { useContext } from "react";

const CommentsDetailedList = ({ setComments, comment, candidateName, img }) => {
    const { authTokens, userDetails } = useContext(AuthContext);

    const deleteComment = async() => {

    }

    return (
        <>
            <div className="w-full bg-white p-4 border">
                <div className="flex gap-4">
                    <img className="inline-block ring-2  h-12 w-12 rounded-full  ring-gray-600/60 " src={comment?.avatar} />
                    <div>
                        <label className="font-medium ">{comment?.name}</label>
                        <p className="text-sm text-gray-400">{comment?.role}</p>
                    </div>
                </div>
                <div className='bg-gray-50 rounded-md ring-1 ring-blue-200 mt-4 w-full p-3 flex flex-col '>
                    {
                        Object.keys(comment.comments).map((c, index) => (

                            <div key={c} className={`relative ${index < Object.keys(comment.comments).length - 1 && "border-b"} py-1 `}>
                                {comment.comments[c].map((com, index) => (
                                    <>
                                        <div key={comment.id} className={`relative ${index < comment.comments[c].length - 1 && "border-b"} py-2`}>
                                            {
                                                // If comment is by current user 
                                                (comment.id) === userDetails.id &&
                                                <button
                                                    type='button'
                                                    className="absolute right-0 top-0 cursor-pointer text-red-500 hover:text-red-700"
                                                    onClick={() => deleteComment(com.step_name, com.id)}
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            }
                                            <div key={com.id} className='flex justify-start items-center gap-x-2'>
                                                <p className="text-blue-600/80 ">{com.step_name}</p>
                                                <span className='text-sm text-gray-600'>{com.updated_at}</span>
                                            </div>

                                            <label className=" text-gray-700 leading-3 text-sm">{com.feedback}</label>
                                        </div>
                                    </>
                                ))}
                            </div>

                        ))
                    }
                </div>
            </div>

        </>
    );
}

export default CommentsDetailedList;