import { useContext, useEffect, useState } from "react";
import AuthContext from "../../context/AuthContext";
import AvatarContext from "../../context/AvatarContext";
import FeedbackList from "./CommentsQuickList";
import CommentsDetailedList from "./CommentsDetailedList";
import { api } from "../../constants/constants";

const ProfileComments = ({ jobId, scores, applicant, resumeDetail }) => {

    const { authTokens, userDetails, teamMembersAvatars, setTeamMembersAvatars, domain } = useContext(AuthContext);
    const { avatars, fetchAvatar } = useContext(AvatarContext)
    const [comments, setComments] = useState([])
    const [loadingComments, setLoadingComments] = useState(false)

    useEffect(() => {
        getComments()
    }, [jobId])

    async function getComments() {
        try {
            setLoadingComments(true);
            console.log(jobId)
            const response = await fetch(`${api}/interview/feedbacks/${jobId}/${applicant.id}/`);
            if (!response.ok) {

                setComments([])
                return
            }

            const data = await response.json();
            console.log(data)
            const dataWithAvatars = await Promise.all(data.map(async (comment) => {
                const avatar = await fetchAvatar(comment.user.id);
                console.log("avatar: ", avatar);
                return { ...comment, avatar };
            }));

            const updatedUserAvatars = teamMembersAvatars.filter(member => {
                return !dataWithAvatars.some(comment => parseInt(comment.user.id) === parseInt(member.id));
            });

            const groupedComments = dataWithAvatars.reduce((acc, comment) => {
                const userId = comment.user.id;

                if (!acc[userId]) {
                    acc[userId] = {
                        id: userId,
                        name: comment.user.name,
                        role : comment.user.role,
                        email: comment.user.email,
                        avatar: comment.avatar,
                        candidate: {
                            id: comment.candidate.id,
                            name: comment.candidate.name,
                        },
                        comments: {},
                    };
                }

                const stepName = comment.step_name;
                if (!acc[userId].comments[stepName]) {
                    acc[userId].comments[stepName] = [];
                }

                acc[userId].comments[stepName].push({
                    id: comment.id,
                    step_name: comment.step_name,
                    updated_at: comment.updated_at,
                    feedback: comment.feedback,
                    created_at: comment.created_at,
                });

                return acc;
            }, {});

            console.log("grouped : ", groupedComments)
            setComments(groupedComments);
            console.log("updatedUserAvatars: ", updatedUserAvatars);
            setTeamMembersAvatars(updatedUserAvatars);

            setLoadingComments(false);
        } catch (error) {
            console.error('Error fetching candidates:', error);
            setLoadingComments(false); // Ensure loading state is reset in case of an error
        }
    }


    console.log(comments)
    return (
        <>
            <div className='transition-all my-3 rounded-md w-full'>
                <div className="p-4 flex justify-between items-center bg-white">
                    <div>
                    <h3 className="text-base font-semibold leading-7 text-gray-900">Comments</h3>
                    <p className="max-w-2xl text-sm leading-4 text-gray-500">Leave a comment to share your thoughts on this profile with your team members</p>
                    </div>
                    {/* <button
                    //  onClick={() => navigate('/app/user/jobs/create-job/')}
                     type="button"
                     className="add-job-btn inline-flex truncate justify-center items-center rounded-md bg-primary-600 px-3 py-2 text-sm text-white shadow-sm hover:bg-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
                    >Add Comment</button> */}
                </div>
                <div className='mt-4 h-auto w-full flex flex-col  gap-3 '>

                    {/* {
                        comments.length > 0 && comments.map((comment) => (
                            <FeedbackList setComments={setComments} comment={comment} candidateName={applicant.name || ""} />
                        ))
                    } */}

                    {
                        Object.keys(comments).length > 0 && Object.keys(comments).map((userId) => (
                            <div key={userId}>
                                <CommentsDetailedList setComments={setComments} comment={comments[userId]} candidateName={applicant.name || ""} />
                            </div>
                        ))
                    }

                    {/* {avatars && Object.keys(avatars).length > 0 && Object.values(avatars).map((avatar) => (
                        <div>
                            <FeedbackList img={avatar} />
                        </div>
                    ))} */}
                    {/* <AddComment setComments={setComments} jobId={jobId} user={userDetails} candidate={applicant} /> */}
                </div>
            </div>

        </>
    );
}

export default ProfileComments;