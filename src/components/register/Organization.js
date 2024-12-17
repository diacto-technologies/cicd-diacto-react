import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// import img from "../assets/candidHR.png";
import CandidHRLogo from "../../assets/PNG/Logo_white_transparentB.png";

function Organization() {
  const navigate = useNavigate();

  const [errorMsg, setErrorMsg] = useState({});
  const [formData, setFormData] = useState({
    organizationName: "",
    website: "",
    domain: "",
    logo: "",
    location: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (name === "organizationName" && value) {
      setErrorMsg((prev) => ({ ...prev, organizationName: null }));
    } else if (name === "website" && /^https?:\/\/[^\s]+$/.test(value)) {
      setErrorMsg((prev) => ({ ...prev, website: null }));
    } else if (name === "domain" && value) {
      setErrorMsg((prev) => ({ ...prev, domain: null }));
    } else if (name === "logo" && e.target.files[0]) {
      setErrorMsg((prev) => ({ ...prev, logo: null }));
    } else if (name === "location" && value) {
      setErrorMsg((prev) => ({ ...prev, location: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.organizationName)
      newErrors.organizationName = "Organization Name is required";
    if (!formData.website) {
      newErrors.website = "Website is required";
    } else if (!/^https?:\/\/[^\s]+$/.test(formData.website)) {
      newErrors.website = "Website must be a valid URL";
    }
    if (!formData.domain) newErrors.domain = "Domain is required";
    if (!formData.logo) newErrors.logo = "Logo is required";
    if (!formData.location) newErrors.location = "Location is required";

    setErrorMsg(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (validateForm()) {
      
      const formDataToSend = new FormData();
      formDataToSend.append("organizationName", formData.organizationName);
      formDataToSend.append("website", formData.website);
      formDataToSend.append("domain", formData.domain);
      formDataToSend.append("logo", formData.logo);
      formDataToSend.append("location", formData.location);

      try {
        const response = await fetch("YOUR_API_URL_HERE", {
          method: "POST",
          body: formDataToSend,
        });

        if (!response.ok) {
          throw new Error("Failed to submit data");
        }

        const data = await response.json();
        console.log(data);

        localStorage.setItem("organizationDetails", JSON.stringify(formData));
        navigate("/app/organization/admin");
      } catch (error) {
        console.error("Error while submitting data:", error);

        setErrorMsg((prev) => ({ ...prev, serverError: error.message }));
      }
    }
  };

  const handleReset = () => {
    setFormData({
      organizationName: "",
      website: "",
      domain: "",
      logo: "",
      location: "",
    });

    setErrorMsg({});
    localStorage.removeItem("organizationDetails");
  };

  useEffect(() => {
    const savedData = localStorage.getItem("organizationDetails");
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, []);
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <div className="w-full md:w-2/3 p-8 md:p-16 sm:text-sm bg-gray-50 flex flex-col justify-center">
        <h2 className="mt-10 mb-5 text-center text-3xl lg:text-4xl font-semibold leading-9 tracking-tight text-gray-900">
          Step 1: Organization Details
        </h2>
        <p className="text-sm text-gray-600 mb-8 text-center">
          A few clicks away from creating your organization profile on the
          application.
        </p>

        <form className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="organizationName"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Organization Name
              </label>
              <input
                type="text"
                id="organizationName"
                name="organizationName"
                placeholder="Enter Organization Name"
                value={formData.organizationName}
                onChange={handleChange}
                className="block w-full rounded-md border-0 bg-blue-50 py-1.5  px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm"
              />
              {errorMsg.organizationName && (
                <p className="text-sm text-red-500">
                  {errorMsg.organizationName}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="website"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Website
              </label>
              <input
                type="text"
                id="website"
                name="website"
                placeholder="Website"
                value={formData.website}
                onChange={handleChange}
                className="block w-full rounded-md border-0 bg-blue-50 py-1.5  px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm"
              />
              {errorMsg.website && (
                <p className="text-sm text-red-500">{errorMsg.website}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="domain"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Domain
              </label>
              <input
                type="text"
                id="domain"
                name="domain"
                placeholder="Enter Domain"
                value={formData.domain}
                onChange={handleChange}
                className="block w-full rounded-md border-0 bg-blue-50 py-1.5  px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm"
              />
              {errorMsg.domain && (
                <p className="text-sm text-red-500">{errorMsg.domain}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="logo"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Primary Logo
              </label>
              <input
                type="file"
                id="logo"
                name="logo"
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    logo: e.target.files[0],
                  });
                  handleChange(e);
                }}
                className="mt-1 block w-full text-gray-600"
              />
              {errorMsg.logo && (
                <p className="text-sm text-red-500">{errorMsg.logo}</p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              placeholder="Enter Location"
              value={formData.location}
              onChange={handleChange}
              className="block w-full rounded-md border-0 py-1.5 bg-blue-50  px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm"
            />
            {errorMsg.location && (
              <p className="text-sm text-red-500">{errorMsg.location}</p>
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2 text-white rounded-md hover:bg-blue-700"
              style={{ backgroundColor: "#7474f4" }}
            >
              Next
            </button>
          </div>
        </form>
      </div>
      <div className="hidden lg:flex justify-end w-full lg:w-2/3 h-full p-5">
        <div className="relative rounded-xl bg-blue-950 w-full lg:w-5/6 overflow-auto h-full shadow-md p-7">
          <div className="absolute top-5 right-5 w-full flex items-center justify-end gap-3">
            <img src={CandidHRLogo} className="lg:w-40 2xl:w-56" alt="Logo" />
          </div>

          <div className="w-full mt-20 2xl:mt-36 px-10">
            <div className="lg:w-5/6 text-lg xl:text-3xl 2xl:text-5xl font-semibold manrope text-wrap text-white">
              Start your journey with us.
            </div>
            <div className="w-4/6 flex flex-col lg:gap-4 2xl:gap-8 mt-5 2xl:mt-20">
              <div>
                <label className="2xl:text-xl font-semibold text-white">
                  AI-Powered Matching
                </label>
                <p className="mt-1 2xl:text-lg text-sm text-gray-400">
                  Quickly discover top candidates with our intelligent matching
                  algorithms, streamlining your hiring process
                </p>
              </div>
              <div>
                <label className="2xl:text-xl font-semibold text-white">
                  Data-Driven Insights
                </label>
                <p className="mt-1 2xl:text-lg text-sm text-gray-400">
                  Leverage analytics and reports to make informed hiring
                  decisions and optimize your recruitment strategy
                </p>
              </div>
              <div>
                <label className="2xl:text-xl font-semibold text-white">
                  User-Friendly Interface
                </label>
                <p className="mt-1 2xl:text-lg text-sm text-gray-400">
                  Experience seamless navigation with our intuitive design,
                  making recruitment easy and efficient for everyone
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Organization;
