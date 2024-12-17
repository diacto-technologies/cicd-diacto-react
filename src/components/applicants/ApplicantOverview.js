import { PaperClipIcon, XMarkIcon } from "@heroicons/react/20/solid";
import PremiumImg from "../../assets/diamond.png";
import { useContext, useEffect, useRef, useState } from "react";
import AuthContext from "../../context/AuthContext";

import { Document, Page } from "react-pdf";
import AvatarContext from "../../context/AvatarContext";
import FeedbackList from "./CommentsQuickList";

import { EyeIcon, EyeSlashIcon, PlusIcon } from "@heroicons/react/24/outline";
import AddComment from "../../utils/comments/AddComment";
import { maskNumber } from "../../constants/constants";
import { Link } from "react-router-dom";

const ApplicantOverview = ({ jobId, applicant, resumeDetail }) => {
  const {
    authTokens,
    userDetails,
    teamMembersAvatars,
    setTeamMembersAvatars,
    domain,
  } = useContext(AuthContext);
  const { avatars, fetchAvatar } = useContext(AvatarContext);

  const [resumeUrl, setResumeUrl] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isMasked, setIsMasked] = useState(true);
  const [comments, setComments] = useState([]);
  const [numPages, setNumPages] = useState();
  const [pageNumber, setPageNumber] = useState(1);
  const [loadingComments, setLoadingComments] = useState(false);
  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  useEffect(() => {
    getComments();
  }, [jobId]);

  async function getComments() {
    try {
      setLoadingComments(true);
      //console.log(jobId);
      const response = await fetch(
        `/interview/feedbacks/${jobId}/${applicant.id}/`
      );
      if (!response.ok) {
        setComments([]);
        return;
      }

      const data = await response.json();

      const dataWithAvatars = await Promise.all(
        data.map(async (comment) => {
          const avatar = await fetchAvatar(comment.user.id);
          //console.log("avatar: ", avatar);
          return { ...comment, avatar };
        })
      );

      const updatedUserAvatars = teamMembersAvatars.filter((member) => {
        return !dataWithAvatars.some(
          (comment) => parseInt(comment.user.id) === parseInt(member.id)
        );
      });

      const groupedComments = dataWithAvatars.reduce((acc, comment) => {
        const userId = comment.user.id;

        if (!acc[userId]) {
          acc[userId] = {
            id: userId,
            name: comment.user.name,
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

      //console.log("grouped : ", groupedComments);
      setComments(groupedComments);
      //console.log("updatedUserAvatars: ", updatedUserAvatars);
      setTeamMembersAvatars(updatedUserAvatars);

      setLoadingComments(false);
    } catch (error) {
      console.error("Error fetching candidates:", error);
      setLoadingComments(false); // Ensure loading state is reset in case of an error
    }
  }

  function openOutlook(toEmail) {
    // Specify the email address and subject
    // const toEmail = 'recipient@example.com';
    const subject = "CandidHR : Your Subject";

    // Encode the email address and subject for the mailto URL
    const mailtoUrl = `mailto:${encodeURIComponent(
      toEmail
    )}?subject=${encodeURIComponent(subject)}`;

    // Open the default email client
    window.location.href = mailtoUrl;
  }

  const handlePpfView = async (resumeId) => {
    try {
      const response = await fetch(`/candidates/download-resume/${resumeId}/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + String(authTokens.access),
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to download PDF: ${response.status} ${response.statusText}`
        );
      }

      setShowModal(true);
      const blob = await response.blob();
      const file = window.URL.createObjectURL(blob);
      //console.log(file, blob);
      setResumeUrl(file);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      // Handle the error, show a message to the user, etc.
    }
  };

  const handleDownload = async (e, applicantName, resumeFile) => {
    e.preventDefault();
    try {
      // Fetch the file from S3 URL
      const response = await fetch(resumeFile);
      const blob = await response.blob();

      // Create a temporary link element
      const a = document.createElement("a");
      const url = window.URL.createObjectURL(blob);
      a.href = url;

      // Set the download attribute to force the file to be downloaded
      a.download = `${applicantName}'s Resume.pdf`;

      // Append link to the body, trigger the download, and remove the link
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url); // Clean up the object URL after download
      document.body.removeChild(a);
    } catch (error) {
      console.error("Failed to download file:", error);
    }
  };

  return (
    <>
      <div className="transition-all w-full mb-3 mt-3 shadow-md rounded-md  p-4 bg-white ">
        <div className="px-2 ">
          <h3 className="text-base font-semibold leading-7 text-gray-900">
            Comments
          </h3>
          <p className="max-w-2xl text-sm leading-4 text-gray-500">
            Leave a comment to share your thoughts on this profile with your
            team members
          </p>
        </div>
        <div className="mt-4 flex items-center justify-start gap-3 px-2">
          {Object.keys(comments).length > 0 &&
            Object.keys(comments).map((userId) => (
              <div key={userId}>
                <FeedbackList
                  setComments={setComments}
                  comment={comments[userId]}
                  candidateName={applicant.name || ""}
                />
              </div>
            ))}

          <AddComment
            setComments={setComments}
            jobId={jobId}
            user={userDetails}
            candidate={applicant}
          />
        </div>
      </div>

      <div
        className="transition-all flex-col sm:flex lg:flex-row items-start justify-center gap-4 rounded-md  p-2"
        style={{ height: "calc(100dvh - 450px)" }}
      >
        <div
          className=" p-4 w-full  bg-white  rounded-lg overflow-auto h-full"
          style={{ height: "calc(100dvh - 450px)" }}
        >
          <div className="px-2 sm:px-0">
            <h3 className="text-base font-semibold leading-7 text-gray-900">
              Personal Information
            </h3>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
              Personal details and application.
            </p>
          </div>
          <div></div>
          <div className="border-t border-gray-100">
            <dl className="divide-y divide-gray-100">
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-gray-900">
                  Social Accounts
                </dt>
                <div className="flex gap-3">
                  <Link
                    to={`${applicant.linkedin}`}
                    className="mt-1 w-fit  text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0"
                  >
                    {applicant.linkedin && (
                      <i class="ms-1 fa-brands fa-linkedin text-2xl"></i>
                    )}
                  </Link>
                  <Link
                    to={`${applicant.github}`}
                    className="mt-1 w-fit  text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0"
                  >
                    {applicant.github && (
                      <i class="ms-1 fa-brands fa-github text-2xl"></i>
                    )}
                  </Link>
                </div>
              </div>
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-gray-900">
                  Email address
                </dt>
                <button
                  type="button"
                  onClick={() => openOutlook(applicant.email)}
                  className="mt-1 w-fit  text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0"
                >
                  {applicant.email}
                  <i class="ms-1 fa-regular fa-envelope text-blue-500"></i>
                </button>
              </div>
              {applicant.contact && (
                <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                  <dt className="text-sm font-medium leading-6 text-gray-900">
                    Contact Number
                  </dt>
                  <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                    {applicant.contact}
                  </dd>
                </div>
              )}
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-gray-900">
                  Contact Address
                </dt>
                <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                  {applicant.location?.city}, {applicant.location?.state}
                </dd>
              </div>
              {applicant?.notice_period_in_months ? (
                <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                  <dt className="text-sm font-medium leading-6 text-gray-900">
                    Notice Period
                  </dt>
                  <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                    <>
                      {applicant?.notice_period_in_months}
                      <span className="text-xs italic text-gray-500">days</span>
                    </>
                  </dd>
                </div>
              ) : null }
              {applicant.last_increment &&  parseInt(applicant?.last_increment) > 0 ? (
                <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                  <dt className="text-sm font-medium leading-6 text-gray-900">
                  Last Increment
                  </dt>
                  <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                  <>
                      {applicant.last_increment}
                      <span className="text-xs italic text-gray-500">
                        months ago
                      </span>
                    </>
                  </dd>
                </div>
              ) : ""}
              

            
              {applicant.current_ctc ? (
                <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                  <dt className="text-sm font-medium leading-6 text-gray-900">
                    Current Annual Salary
                  </dt>
                  <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0 flex items-center">
                    {isMasked
                      ? maskNumber(applicant.current_ctc?.toLocaleString())
                      : applicant.current_ctc?.toLocaleString()}
                    <button
                      onClick={() => setIsMasked(!isMasked)}
                      className="inline-flex mx-2"
                    >
                      {isMasked ? (
                        <EyeIcon className="w-4 h-4" />
                      ) : (
                        <EyeSlashIcon className="w-4 h-4" />
                      )}
                    </button>
                  </dd>
                </div>
              ) : ""}

              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-gray-900">
                  About
                </dt>
                <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                  {resumeDetail.summary || (
                    <span className="text-xs italic text-gray-500">
                      no data
                    </span>
                  )}
                </dd>
              </div>
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-gray-900">
                  Attachments
                </dt>
                <dd className="mt-2 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  <ul
                    role="list"
                    className="divide-y divide-gray-100 rounded-md border border-gray-200"
                  >
                    <li className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6">
                      <div className="flex w-0 flex-1 items-center">
                        <PaperClipIcon
                          className="h-5 w-5 flex-shrink-0 text-gray-400"
                          aria-hidden="true"
                        />
                        <div className="ml-4 flex min-w-0 flex-1 gap-2">
                          <span className="truncate font-medium">
                            {applicant.name}'s Resume
                          </span>
                        </div>
                      </div>
                      <div className="ml-4 flex-shrink-0 space-x-3">
                        <button
                          onClick={
                            () => {
                              setResumeUrl(resumeDetail.resume_file);
                              setShowModal(true);
                            }
                            // handlePpfView(resumeDetail.id)
                          }
                          className=" font-medium text-blue-600 hover:text-blue-500"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={(e) =>
                            handleDownload(
                              e,
                              applicant.name,
                              resumeDetail.resume_file
                            )
                          }
                          className="font-medium text-blue-600 hover:text-blue-500"
                        >
                          Download
                        </button>
                      </div>
                    </li>
                  </ul>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div
          className="p-1 w-full  lg:max-w-xl  rounded-lg shadow-md ring-2 ring-indigo-200 "
          style={{
            backgroundImage:
              "linear-gradient(144deg, #6867ac, #abe9fb 50%,#b294e7)",
          }}
        >
          <div className="pt-3 ps-3 h-full bg-sky-50 rounded-lg overflow-auto">
            <div className="flex space-x-2 items-center ">
              <img src={PremiumImg} width={26} />
              <h3 className="text-base font-semibold leading-7 text-emerald-600">
                {" "}
                AI Summary
              </h3>
            </div>
            <p className="mt-1 p-3  text-sm leading-6 text-slate-900">
              <div
                dangerouslySetInnerHTML={{ __html: resumeDetail.ai_summary }}
              />
            </p>
          </div>
        </div>
      </div>
      {/* Personal Details  */}

      {resumeUrl && showModal ? (
        <div
          class="relative  z-50"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div class="fixed  inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

          <div class="fixed h-full inset-0 z-10 w-screen overflow-y-auto">
            <div class="flex min-h-full items-center justify-center p-1 text-center sm:items-center sm:p-0">
              <div
                class="relative max-w-fit h-5/6 overflow-auto transform flex-col justify-evenly rounded-lg bg-white text-left shadow-xl transition-all "
                style={{ maxHeight: "90%" }}
              >
                {/* Header  */}
                <div className="border-b rounded-t-lg bg-gray-50 flex justify-end p-5">
                  <button onClick={() => setShowModal(false)}>
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                  {/* <div class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                         <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                             <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                         </svg>
                     </div> */}
                  {/* <h3 class="text-base p-4 font-semibold leading-6 text-gray-900" id="modal-title"></h3> */}
                </div>

                {/* Body  */}
                <div class="bg-gray-50  h-5/6  overflow-y-auto px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div class="sm:flex sm:items-start ">
                    <div class="mt-3 text-center bg-yellow h-1/2 w-full sm:ml-4 sm:mt-0 sm:text-left">
                      {/* <iframe src={resumeUrl} width={600} height={600} /> */}
                      <Document
                        file={resumeDetail.resume_file}
                        onLoadSuccess={onDocumentLoadSuccess}
                      >
                        <Page pageNumber={pageNumber} />
                      </Document>
                    </div>
                  </div>
                </div>

                {/* Footer  */}
                <div class="bg-gray-50 border-t rounded-b-lg px-4 py-3 flex justify-end space-x-3 sm:px-6 ">
                  <button
                    disabled={pageNumber === 1}
                    onClick={() => setPageNumber((prevState) => prevState - 1)}
                    type="button"
                    class="mt-3 h-10  disabled:bg-gray-200 disabled:text-gray-500 justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                  >
                    Prev
                  </button>
                  <button
                    disabled={pageNumber === numPages}
                    onClick={() => setPageNumber((prevState) => prevState + 1)}
                    type="button"
                    class="mt-3 h-10  disabled:bg-gray-200 disabled:text-gray-500  justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        false
      )}
    </>
  );
};

export default ApplicantOverview;
