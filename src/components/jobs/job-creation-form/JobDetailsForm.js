import CreatableSelect from "react-select/creatable";
import CustomToolbar from "../../../utils/react-quill/CustomToolbar";
import "../../../utils/react-quill/Toolbar.css";
import { selectStyle, selectTheme } from "../../../constants/constants";
import AuthContext from "../../../context/AuthContext";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ScoreWeights from "../ScoreWeights";
import { XMarkIcon } from "@heroicons/react/24/outline";
import GenerateButton from "./GenerateButton";

function JobDetailsForm({
    formSteps,
    currentStep,
    setCurrentStep,
    navigateToStep,
    jobId,
}) {
    const skills = [
        {
            label: "Python",
            value: "Python",
        },
        {
            label: "Javascript",
            value: "Javascript",
        },
        {
            label: "Java",
            value: "Java",
        },
        {
            label: "Data Analysis",
            value: "Data Analysis",
        },
        {
            label: "Power BI",
            value: "Power BI",
        },
        {
            label: "Tableau",
            value: "Tableau",
        },
        {
            label: "Machine Learning",
            value: "Machine Learning",
        },
        {
            label: "C++",
            value: "C++",
        },
        {
            label: "Excel",
            value: "Excel",
        },
        {
            label: "SQL",
            value: "SQL",
        },
        {
            label: "MongoDB",
            value: "MongoDB",
        },
    ];
    const employmentType = [
        {
            label: "Full Time",
            value: "Full Time",
        },
        {
            label: "Part Time",
            value: "Part Time",
        },
        {
            label: "Internship",
            value: "Internship",
        },
        {
            label: "Contract",
            value: "Contract",
        },
    ];
    const [text, setText] = useState("");
    const { user, authTokens, logoutUser } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState({});
    const [successMessage, setSuccessMessage] = useState("");
    const [jobDetail, setJobDetail] = useState([]);
    const [htmlContent, setHtmlContent] = useState("");
    const [newJobId, setNewJobId] = useState(null);
    const [aiDescLoading, setAiDescLoading] = useState(false);
    const [saveDisabled, setSaveDisabled] = useState(false);
    const currentDate = new Date().toISOString().split("T")[0];
    const navigate = useNavigate();
    const modules = {
        toolbar: { container: "#toolbar" },
    };

    const formats = [
        "font",
        "size",
        "bold",
        "italic",
        "underline",
        "strike",
        "color",
        "background",
        "script",
        "header",
        "blockquote",
        "code-block",
        "indent",
        "list",
        "direction",
        "align",
        "link",
        // 'image',
        //  'video',
        //  'formula',
    ];

    const [formData, setFormData] = useState({
        // username: '',
        title: "",
        description: "",
        experience: "",
        min_experience: "",
        max_experience: "",
        employment_type: "Full Time",
        must_have_skills: [],
        new_applicant_notify: false,
        location: null,
        owner: user.id,
    });

    const [weights, setWeights] = useState({
        skills: 3,
        work_experience: 3,
        projects: 2,
        education: 1,
        certifications: 1,
        total: 10,
    });

    useEffect(() => {
        if (jobId) {
            fetchJob(jobId);
        }
    }, []);

    const handleCancelClick = () => {
        setFormData({});
        setJobDetail([]);
        navigate(jobId ? `/app/user/jobs/job/${jobId}/overview` : "/app/user/jobs");
    };

    const fetchJob = async (jobId) => {
        setLoading(true);
        //console.log("fetching dataset")
        try {
            const response = await fetch(`/jobs/job/${jobId}/`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + String(authTokens.access),
                },
            });
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const data = await response.json();
            setJobDetail(data);
            setFormData({
                title: data.title,
                description: data.description,
                jd_html: data.jd_html,
                experience: data.experience,
                min_experience: data.min_experience,
                max_experience: data.max_experience,
                employment_type: data.employment_type,
                must_have_skills: data.must_have_skills,
                new_applicant_notify: data.new_applicant_notify,
                location: data.location,
                owner: data.owner.id,
                close_date: data.close_date,
            });
            setWeights((prevWeights) => ({
                ...prevWeights,
                skills: parseFloat(data.score_weight.skills) * 10,
                work_experience: parseFloat(data.score_weight.work_experience) * 10,
                projects: parseFloat(data.score_weight.projects) * 10,
                education: parseFloat(data.score_weight.education) * 10,
                certifications: parseFloat(data.score_weight.certifications) * 10,
            }));

            // getListData(data)
            setLoading(false);
        } catch (error) {
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmit = async (e) => {
        formData.experience =
            parseInt(formData.max_experience) - parseInt(formData.min_experience);

        const format_weights = {
            skills: parseFloat(weights.skills / 10),
            work_experience: parseFloat(weights.work_experience / 10),
            projects: parseFloat(weights.projects / 10),
            education: parseFloat(weights.education / 10),
            certifications: parseFloat(weights.certifications / 10),
        };
        formData.score_weight = JSON.stringify(format_weights);

        const jobFormUrl = jobId ? `/jobs/job/${jobId}/` : `/jobs/job/`;
        if (
            weights.total === 10 &&
            formData.title &&
            formData.description &&
            (formData.min_experience !== null || formData.min_experience !== '')  &&
            formData.max_experience &&
            formData.employment_type &&
            formData.location &&
            formData.must_have_skills.length
        ) {
            try {
                setError(null);
                const response = await fetch(jobFormUrl, {
                    method: jobId ? "PATCH" : "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + String(authTokens.access),
                    },
                    body: JSON.stringify(formData),
                });

                if (response.ok) {
                    const data = await response.json();
                    setSuccessMessage("Registration successful!");
                    setFormData({
                        // username: '',
                        title: data.title,
                        description: data.jd_html,
                        experience: data.experience,
                        min_experience: data.min_experience,
                        max_experience: data.max_experience,
                        employment_type: data.employment_type,
                        must_have_skills: data.must_have_skills,
                        new_applicant_notify: data.new_applicant_notify,
                        location: data.location,
                        owner: data.owner.id,
                        close_date: data.close_date,
                    });
                    setError({});

                    if (jobId) navigateToStep(currentStep + 1);
                    else navigateToJobStep(data.id, currentStep + 1);
                } else {
                    const errorData = await response.json();
                    setError(errorData);
                }
            } catch (error) {
                console.error("Job Creation failed:", error.message);
            }
        } else {
            const err = {};
            if (weights.total !== 10)
                err.total = "Cumulative weight of all metrics must be 10";
            if (!formData.title) err.title = "Job title is required";
            if (!formData.description)
                err.description = "Job description is required";
            if (!formData.min_experience)
                err.min_experience = "Minimum Experience is required";
            if (!formData.max_experience)
                err.max_experience = "Maximum Experience is required";
            if (!formData.employment_type)
                err.employment_type = "Employment type is required";
            if (!formData.location) err.location = "Job location is required";
            if (!formData.close_date) err.close_date = "Closing date is required";
            if (formData.must_have_skills.length === 0)
                err.must_have_skills = "Atleast one skill is required";
            setError(err);
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSkillsAdd = (selectedOption) => {
        if (selectedOption) {
            setFormData({
                ...formData,
                must_have_skills: selectedOption,
            });
        }
    };

    const handleEmploymentTypeChange = (selectedOption) => {
        if (selectedOption) {
            setFormData({
                ...formData,
                employment_type: selectedOption.label,
            });
        } else {
            setFormData({
                ...formData,
                employment_type: "",
            });
        }
    };

    const handleChange = (content, delta, source, editor) => {
        //console.log(content, delta, source, editor.getText())
        setHtmlContent(content);
        setText(editor.getText());
        setFormData((prev) => ({
            ...prev,
            description: editor.getText(),
            jd_html: content,
        }));
    };

    const navigateToJobStep = (jobId, stepId) => {
        navigate(`/app/user/jobs/edit-job/${jobId}/${stepId}/`);
    };

  const handleNext = () => {
      if (jobId) navigateToStep(currentStep + 1)
      else navigateToJobStep(newJobId, currentStep + 1)
  }

    const generateJobDescription = async () => {
        const payload = {
            job_title: formData?.title,
        };
        if (formData?.must_have_skills.length > 0)
            payload["must_have_skills"] = formData?.must_have_skills?.map(
                (skill) => skill?.label
            );
        if (formData?.employment_type)
            payload["employment_type"] = formData?.employment_type;
        if (formData?.min_experience)
            payload["min_experience"] = formData?.min_experience;
        if (formData?.max_experience)
            payload["max_experience"] = formData?.max_experience;

        try {
            if (formData.title) {
                setAiDescLoading(true);
                setError(null);
                const response = await fetch(`/jobs/generate-job-description/`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + String(authTokens.access),
                    },
                    body: JSON.stringify(payload),
                });
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                const data = await response.json();

                setFormData((prev) => {
                    return {
                        ...prev,
                        title: data.job_title,
                        must_have_skills: data.must_have_skills,
                        description: data.job_description,
                        jd_html: data.job_desc_html,
                    };
                });

                setAiDescLoading(false);
            } else {
                setError((prev) => {
                    return {
                        ...prev,
                        description: "Job title is required",
                    };
                });
            }
        } catch (error) {
            setAiDescLoading(false);
            setError(error);
        }
    };

    const rewriteJobDescription = async () => {
        const payload = {
            job_title: formData?.title,
            job_description: formData?.description || formData.jd_html,
        }; 
 
        try {
            if (formData.title && formData.description) {
                setAiDescLoading(true);
                setError(null);
                const response = await fetch(`/jobs/rewrite-job-description/`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + String(authTokens.access),
                    },
                    body: JSON.stringify(payload),
                });
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                const data = await response.json();

                setFormData((prev) => {
                    return {
                        ...prev,
                        must_have_skills: data.recommended_skills,
                        description: data.enhanced_job_description,
                        jd_html: data.enhanced_job_description_html,
                    };
                });

                setAiDescLoading(false);
            } else {
                setError((prev) => {
                    return {
                        ...prev,
                        description: "Job title and description is required",
                    };
                });
            }
        } catch (error) {
            setAiDescLoading(false);
            setError(error);
        }
    }


    return (
        <>
            <div className="w-[70rem] bg-white min-h-80 mx-auto rounded-md shadow-sm">
                <div className="bg-[#e4e5f9] px-16 py-6 rounded-t-md">
                    <h1 className="text-xl">Job Title and Score</h1>
                </div>
                {!loading ? (
                    <div className="px-16 py-6">
                        <div>
                            <h2 className="mb-3">
                                Job Title<span className="text-red-500">*</span>
                            </h2>
                            {error && error.title && (
                                <span className="text-sm text-red-500">{error.title}</span>
                            )}
                            <input
                                type="text"
                                name="title"
                                id="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                autoComplete="title"
                                className="border-2 rounded-md w-full h-12 px-5"
                            ></input>
                        </div>
                        <div className="mt-8">
                            <h2 className="mb-3">
                                Skill<span className="text-red-500">*</span>
                            </h2>
                            {error && error.must_have_skills && (
                                <span className="text-sm text-red-500">
                                    {error.must_have_skills}
                                </span>
                            )}
                            <CreatableSelect
                                className="text-sm md:w-full min-w-fit min-h-12"
                                placeholder="Add or select skills..."
                                onChange={handleSkillsAdd}
                                value={formData.must_have_skills}
                                theme={selectTheme}
                                isMulti
                                styles={selectStyle}
                                options={skills}
                                isClearable
                            />
                        </div>
                        <div className="mt-8">
                            <h2 className="mb-3">
                                Location<span className="text-red-500">*</span>
                            </h2>
                            {error && error.location && (
                                <span className="text-sm text-red-500">{error.location}</span>
                            )}
                            <input
                                type="text"
                                name="location"
                                id="location"
                                value={formData.location}
                                onChange={handleInputChange}
                                autoComplete="location"
                                className="border-2 rounded-md w-full h-12 px-5"
                            ></input>
                        </div>
                        <div className="mt-8">
                            <div className="flex justify-between items-center mb-2">
                                <h2 className="mb-3">
                                    Description<span className="text-red-500">*</span>
                                </h2>
                                <div className="flex gap-3 items-center relative">
                                    {/* {true && <div className="flux">
                                        Thinking...
                                    </div>} */}
                                    {/* <button className='border-2 px-6 py-2 disabled:cursor-not-allowed' onClick={() => generateJobDescription()} disabled={aiDescLoading}>{formData.description.trim() ? "Rewrite using AI" : "Generate using AI"}</button> */}
                                    {error && error.description && (
                                        <span className="text-sm text-red-500">
                                            {error.description}
                                        </span>
                                    )}
                                    <div className="flex relative">
                                        <GenerateButton
                                            text={
                                                aiDescLoading
                                                    ? "Thinking"
                                                    : formData?.description?.trim()
                                                        ? "Rewrite using AI"
                                                        : "Generate using AI"
                                            }
                                            isDisabled={aiDescLoading}
                                            onClickHandler={formData?.description?.trim() ? rewriteJobDescription : generateJobDescription}
                                        />
                                    </div>
                                </div>
                            </div>
                            {/* <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            className="border-2 rounded-md w-full h-48 px-5 py-3"></textarea> */}
                            <CustomToolbar />
                            <ReactQuill
                                theme="snow"
                                // value={htmlContent || text}
                                value={formData.jd_html || formData.description}
                                className="bg-white h-72"
                                onChange={(content, delta, source, editor) =>
                                    handleChange(content, delta, source, editor)
                                }
                                placeholder="Write a few sentences about the job role..."
                                modules={modules}
                                formats={formats}
                            />
                        </div>
                        <div className="flex flex-row flex-wrap gap-12">
                            <div className="mt-8 flex-grow w-[40%]">
                                <h2 className="mb-3">
                                    Employment Type<span className="text-red-500">*</span>
                                </h2>
                                {error && error.employment_type && (
                                    <span className="text-sm text-red-500">
                                        {error.employment_type}
                                    </span>
                                )}
                                <CreatableSelect
                                    id="employment_type"
                                    name="employment_type"
                                    value={{
                                        label: formData.employment_type,
                                        value: formData.employment_type,
                                    }}
                                    onChange={handleEmploymentTypeChange}
                                    theme={selectTheme}
                                    className="text-sm md:w-full min-w-fit h-12"
                                    placeholder="Add or select employment type..."
                                    options={employmentType}
                                />
                            </div>
                            {/* <div className='mt-8 flex-grow w-[40%]'>
                            <h2 className="mb-3">Education</h2>
                            <CreatableSelect className='text-sm md:w-full min-w-fit h-12' placeholder="Add or select skills..." isMulti options={skills} isClearable />
                        </div> */}
                        </div>
                        <div className="flex flex-row flex-wrap gap-12">
                            <div className="mt-8 flex-grow w-[40%]">
                                <h2 className="mb-3">
                                    Experience<span className="text-red-500">*</span>
                                </h2>
                                {error && error.min_experience && (
                                    <span className="block text-sm text-red-500">
                                        {error.min_experience}
                                    </span>
                                )}
                                {error && error.max_experience && (
                                    <span className="block text-sm text-red-500">
                                        {error.max_experience}
                                    </span>
                                )}
                                <div className="flex gap-4 items-center">
                                    <input
                                        type="number"
                                        name="min_experience"
                                        id="min_experience"
                                        value={formData.min_experience}
                                        onChange={handleInputChange}
                                        min={0}
                                        autoComplete="min_experience"
                                        className="border-2 rounded-md w-[35%] h-12 px-5"
                                    ></input>
                                    to
                                    <input
                                        type="number"
                                        name="max_experience"
                                        min={1}
                                        value={formData.max_experience}
                                        onChange={handleInputChange}
                                        id="max_experience"
                                        autoComplete="max_experience"
                                        className="border-2 rounded-md w-[35%] h-12 px-5"
                                    ></input>
                                    years
                                </div>
                            </div>
                            <div className="mt-8 flex-grow w-[40%]">
                                <h2 className="mb-3">
                                    Close Date<span className="text-red-500">*</span>
                                </h2>
                                {error && error.close_date && (
                                    <span className="text-sm text-red-500">
                                        {error.close_date}
                                    </span>
                                )}
                                <input
                                    type="date"
                                    name="close_date"
                                    id="close_date"
                                    value={
                                        formData.close_date
                                            ? new Date(formData.close_date)
                                                .toISOString()
                                                .split("T")[0]
                                            : formData.close_date
                                    }
                                    onChange={handleInputChange}
                                    min={currentDate}
                                    autoComplete="close_date"
                                    className="block w-full h-12 md:w-full rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>
                        <div className="bg-gray-100 px-8 py-4 rounded-md mt-8">
                            <h2 className="font-semibold">
                                Score Widget<span className="text-red-500">*</span>
                            </h2>
                            <p className="text-sm text-gray-500 mt-2">
                                To ensure accurate scores, you have the flexibility to fine-tune
                                the weight assigned to each scoring factor. Ensure that the
                                cumulative weight of all the metrics remains at 10.
                            </p>
                        </div>

                        <ScoreWeights
                            error={error}
                            weights={weights}
                            setWeights={setWeights}
                            className="mt-4"
                        />
                    </div>
                ) : (
                    <h2 className="px-16 py-6 h-72 flex items-center justify-center">
                        Loading....
                    </h2>
                )}

        <div className="flex px-16 py-6 w-full justify-end gap-4">
          {currentStep !== 1 && (
            <button
              onClick={() => navigateToStep(currentStep - 1)}
              className="border rounded-md px-6 py-2"
            >
              Back
            </button>
          )}
          {currentStep !== formSteps.length && <button onClick={handleNext} disabled={!newJobId && !jobId} className="border rounded-md px-6 py-2 disabled:bg-gray-200 disabled:text-gray-400">Next</button>}
          {}
          {currentStep !== formSteps.length && (
            <button
              onClick={handleFormSubmit}
              disabled={loading || saveDisabled}
              className="border bg-brand-purple text-white rounded-md px-6 py-2 disabled:bg-indigo-200"
            >
              Save and Continue
            </button>
          )}
        </div>
      </div>
    </>
  );
}

export default JobDetailsForm;
