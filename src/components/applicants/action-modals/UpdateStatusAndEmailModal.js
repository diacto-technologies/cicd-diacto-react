import { useContext, useState } from "react";
import Header from "../../../utils/modals/Header";
import AuthContext from "../../../context/AuthContext";

const UpdateStatusAndEmailModal = ({setStages,setStatus, status,showModal,setShowModal,resumeDetail,setResumeDetail }) => {
  const [errorMessage, setErrorMessage] = useState("");
  const [notifyCandidate, setNotifyCandidate] = useState(false);
  const { authTokens, userDetails,user } = useContext(AuthContext);

  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [params, setParams] = useState(null);
  const [sendingEmail, setSendingEmail] = useState(false);

  const defaultEmailTemplates = {
    shortlist: {
      subject: `Congratulations! You've Been Shortlisted for {job_name}`,
      header: `<br/>Dear {candidate_name}<br/><br/>`,
      body: `We are excited to inform you that your application for the {job_name} position at {your organization name} has been shortlisted.<br/>
            The next step in the process will be communicated to you shortly. Please keep an eye on your inbox for further instructions. `,
      footer: `We appreciate your interest in this position and thank you for your patience during this process.<br/> If you have any questions or encounter any issues, please contact us at <a href="mailto:support@candidhr.ai" style="color: #0088cc; text-decoration: none;">support@candidhr.ai</a>.
          <br/><br/> 
          Best regards,<br/>
           The {your organization name} Recruitment Team`,
    },
    unshortlist: {
      subject: `Congratulations! You've Been Shortlisted for {job_name}`,
      header: `<br/>Dear {candidate_name}<br/><br/>`,
      body: `Thank you for your interest in the {job_name} position at {company_name} and for the time you dedicated to your application. After careful consideration, we regret to inform you that we have chosen to move forward with other candidates at this time.
            <br>
            We truly appreciate the effort you put into your application and encourage you to stay connected for future opportunities that may be a better fit for your skills and experience.`,
      footer: `We appreciate your interest in this position and thank you for your patience during this process.<br/> If you have any questions or encounter any issues, please do not hesitate to contact us at <a href="mailto:support@candidhr.ai" style="color: #0088cc; text-decoration: none;">support@candidhr.ai</a>.
          <br/><br/> 
          Best regards,<br/>
           The {your organization name} Recruitment Team`,
    },
  };

  const handleTemplateChange = (event) => {
    setSelectedTemplate(event.target.value);
    setErrorMessage("");
  };

  function handleClose() {
    setShowModal(false);
    setStatus(null)
    setSelectedTemplate("");
    setErrorMessage("");
    setBody("");
    setSubject("");
    setNotifyCandidate(false);
  }

  async function sendEmail() {
    console.log(notifyCandidate,selectedTemplate,resumeDetail)
    if (notifyCandidate && !selectedTemplate) {
      setErrorMessage("Please select a template option.");
      return; // Stop the submission if no template is selected
    }
    setSendingEmail(true)
    updateStatus(
      status === "shortlist" ? "Shortlisted" : "Not Shortlisted",
      resumeDetail,
      body,
      subject,
      notifyCandidate
    )
      .then(() => {
        setSendingEmail(false)
        handleClose();
      })
      .catch((error) => {
        console.error("Error updating status:", error);
        setSendingEmail(false)
        // Optionally, handle the error or keep the modal open
      });
    // }
  }


  const updateStatus = async (statusText, resumeDetail,body,subject,notifyCandidate) => {
    console.log("statusText : ",userDetails,statusText,resumeDetail)

    const payload = {
      status_text: statusText,
      updated_by : user.id,
      updated_at : new Date(),
      body : body,
      subject : subject,
      notify_candidate: notifyCandidate
    }

    if (statusText === "Shortlisted") {
      payload["is_approved"] = true
      payload["approved_by"] = user.id
      payload["approved_at"] = new Date()
    }
    if (statusText === "Not Shortlisted") {
      payload["is_approved"] = false
      payload["approved_by"] = null
      payload["approved_at"] = null
    }

    if (resumeDetail?.id) {
      try {
        const response = await fetch(`/resume_parser/resumes/${resumeDetail?.id}/`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + String(authTokens.access),
          },
          body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (response.ok) {
          //console.log("successfully updated : ", data)
          if (data) {
            console.log("data",data)
            setResumeDetail(prev => ({...prev,status_text :data.status_text }))
            setStages((prev) =>
              prev.map((stage) => {
                if (stage?.key === "resume-screening") {
                  console.log(stage)
                  return {
                    ...stage,
                    completed: data["completed"] ?? false,
                    is_approved: data["is_approved"] ?? false,
                    approved_by: data["approved_by"] ?? null,
                    updated_by: data["updated_by"] ?? null,
                    updated_at: data["updated_at"] || null,
                    status_text : data["status_text"] ?? "",
                  };
                }else{
                  return stage
                }
              })
            );
          }
          // setMessage(data.message);
        } else {
            setErrorMessage(data.error);
        }
      } catch (error) {
        console.error("Error completing resume screening:", error);
        setErrorMessage("An error occurred while completing resume screening.");
      }
    }
  };

  return (
    <>
      
        <div
          className="relative z-30"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
              <div
                style={{ minWidth: "60%", maxWidth: "95%" }}
                className="relative flex flex-col h-[90%] justify-between rounded-lg bg-white text-left shadow-xl transition-all my-8"
              >
                {/* Header */}
                <Header
                  label={"Send Email To Candidate"}
                  onClose={handleClose}
                />

                {/* Body */}
                <div className="bg-white h-auto flex-grow px-4 pb-4 pt-5 sm:p-6 sm:pb-4 overflow-auto">
                  <div className="p-3 w-full">
                    <label className="flex text-gray-700 p-2 border rounded-xl bg-sky-50 w-full">
                      {resumeDetail?.name} will be marked as{" "}
                      <span
                        className={`${
                          status === "shortlist"
                            ? "text-teal-600"
                            : "text-red-600"
                        } font-medium px-1`}
                      >
                        {status === "shortlist"
                          ? "shortlisted"
                          : "not shortlisted"}
                      </span>{" "}
                      for the resume screening stage
                    </label>
                    <div className="mt-8 font-medium">
                      Would you like to notify {resumeDetail?.name} via email?
                    </div>
                    <div className="flex mt-4 w-32 border rounded-xl overflow-hidden">
                      <button
                        onClick={() => setNotifyCandidate(true)}
                        className={`w-1/2 p-2 h-full border-r hover:bg-indigo-500 hover:text-white ${
                          notifyCandidate
                            ? "bg-brand-purple text-white"
                            : "bg-white"
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setNotifyCandidate(false)}
                        className={`w-1/2 p-2 h-full hover:bg-indigo-500 hover:text-white ${
                          !notifyCandidate
                            ? "bg-indigo-400 text-white"
                            : "bg-white"
                        }`}
                      >
                        No
                      </button>
                    </div>

                    {notifyCandidate && (
                      <>
                        <div className="flex gap-3 mt-8 mb-5">
                          <div className="flex items-center">
                            <input
                              type="radio"
                              id="defaultTemplate"
                              name="templateOption"
                              value="default"
                              onChange={handleTemplateChange}
                              className="mr-2 accent-indigo-500"
                            />
                            <label
                              htmlFor="defaultTemplate"
                              className=" font-medium text-gray-900"
                            >
                              Default Shortlist Email Template
                            </label>
                          </div>

                          <div>
                            <div className="flex items-center">
                              <input
                                type="radio"
                                id="customTemplate"
                                name="templateOption"
                                value="custom"
                                onChange={handleTemplateChange}
                                className="mr-2 accent-indigo-500"
                              />
                              <label
                                htmlFor="customTemplate"
                                className=" font-medium text-gray-900"
                              >
                                Custom Template
                              </label>
                            </div>
                          </div>
                        </div>

                        {selectedTemplate === "custom" && (
                          <>
                            <div className="mb-3">
                              <label
                                htmlFor="subject"
                                className="block mb-2 text-sm font-medium text-gray-900"
                              >
                                Subject
                              </label>
                              <input
                                type="text"
                                id="subject"
                                name="subject"
                                onChange={(e) => setSubject(e.target.value)}
                                className="block w-full p-2 border border-gray-300 rounded-md"
                                placeholder="Enter email subject"
                              />
                            </div>

                            <div className="">
                              <label
                                htmlFor="body"
                                className="block mb-2 text-sm font-medium text-gray-900"
                              >
                                Body
                              </label>
                              <textarea
                                id="body"
                                name="body"
                                className="block w-full p-2 border border-gray-300 rounded-md"
                                placeholder="Type a personalized message for the candidate"
                                onChange={(e) => setBody(e.target.value)}
                                rows="4"
                              ></textarea>
                            </div>
                          </>
                        )}
                        {selectedTemplate === "default" && (
                          <>
                            <div className="mb-3">
                              <label
                                htmlFor="subject"
                                className="block mb-2 text-sm font-medium text-gray-900"
                              >
                                Subject
                              </label>
                              <input
                                type="text"
                                id="subject"
                                name="subject"
                                readOnly
                                // onChange={(e) => setSubject(e.target.value)}
                                className="block w-full p-2 border border-gray-300 rounded-md"
                                value={
                                  status
                                    ? defaultEmailTemplates[status]["subject"]
                                    : ""
                                }
                                placeholder="Enter email subject"
                              />
                            </div>

                            <div className="">
                              <label
                                htmlFor="body"
                                className="block mb-2 text-sm font-medium text-gray-900"
                              >
                                Body
                              </label>
                              <div
                                className="block w-full p-2 border border-gray-300 rounded-md"
                                placeholder="Type a personalized message for the candidate"
                                // value={status ? (defaultEmailTemplates[status]["header"] + defaultEmailTemplates[status]["body"] + defaultEmailTemplates[status]["footer"] ): ""}
                                // onChange={(e) => setBody(e.target.value)}
                                dangerouslySetInnerHTML={{
                                  __html: status
                                    ? defaultEmailTemplates[status]["header"] +
                                      defaultEmailTemplates[status]["body"] +
                                      defaultEmailTemplates[status]["footer"]
                                    : "",
                                }}
                              ></div>
                            </div>
                          </>
                        )}
                        {errorMessage && (
                          <div className="text-red-600 text-sm">
                            {errorMessage}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 rounded-b-lg px-4 py-3 flex justify-end sm:px-6 space-x-3">
                  <button
                    disabled={sendingEmail}
                    onClick={() => sendEmail()}
                    className="h-10 justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:bg-blue-200 sm:ml-3 sm:w-auto"
                  >
                    {sendingEmail ? (
                      "Sending Email"
                    ) : (
                      <>
                        {notifyCandidate
                          ? status === "shortlist"
                            ? "Shortlist & Send Email"
                            : "Not Shortlist & Send Email"
                          : status === "shortlist"
                          ? "Shortlist"
                          : "Not Shortlist"}
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleClose()}
                    type="button"
                    className="h-10 justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      
    </>
  );
};

export default UpdateStatusAndEmailModal;
