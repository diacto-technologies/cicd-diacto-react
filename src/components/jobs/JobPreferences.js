import { useContext, useEffect, useState } from "react";
import Switch from "../../utils/swtiches/Switch";
import CreatableSelect from "react-select/creatable";
import PreferenceSwitch from "../../utils/swtiches/PreferenceSwitch";
import Checkbox from "../../utils/checkbox/Checkbox";
import { api, selectStyle } from "../../constants/constants";
import Select from "react-select";
import { useParams } from "react-router-dom";
import AuthContext from "../../context/AuthContext";

const JobPreferences = () => {
  const [preference, setPreference] = useState(null);
  const [saving, setSaving] = useState(false);
  const { jobId } = useParams();
  const { authTokens } = useContext(AuthContext);
  const currencies = [
    { value: "INR", label: "INR - Indian Rupees" },
    { value: "USD", label: "USD - US Dollar" },
    { value: "EUR", label: "EUR - Euro" },
    { value: "GBP", label: "GBP - British Pound" },
    { value: "JPY", label: "JPY - Japanese Yen" },
    // Add more currency options as needed
  ];

  const [selectedCurrency, setSelectedCurrency] = useState(currencies[0]);

  const locations = [
    { label: "Mumbai", value: "Mumbai" },
    { label: "Pune", value: "Pune" },
    { label: "Delhi", value: "Delhi" },
    { label: "US", value: "US" },
    { label: "NZ", value: "NZ" },
  ];

  const [formData, setFormData] = useState({
    job : jobId,
    max_retries: 0,
    max_resume_size: 0,
    max_applicants: 0,
    location_to_exclude: null,
    include_github: false,
    include_linkedin: true,
    include_questions: false,
    question_set: null,
    include_notice_period: false,
    include_current_ctc: false,
    include_expected_ctc: false,
    include_relevant_experience: false,
    last_increment: false,
    currency: currencies[0],
    questions : []
  });

  useEffect(() => {
    fetchPreference();
  }, []);

  const fetchPreference = async () => {
    try {
      const response = await fetch(
        `${api}/resume_parser/resume-screening-preferences/?job_id=${jobId}`, // No trailing slash after jobId
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + String(authTokens.access),
          },
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();

      if (data) {
        const preferenceData = data.results.length ? data.results[0] : null;
        // setPreference(preferenceData)
       if (preferenceData) {
        setFormData(() => ({
          ...preferenceData,
          questions: preferenceData?.questions?.length
            ? preferenceData.questions.map((q) => q.id)
            : [],
        }));

        setSelectedCurrency(preferenceData.currency)
        
       }
        
        // Assuming data.results contains the preference array
      }
    } catch (error) {
      console.error(error);
    }
  };

  const updatePreference = async(updatedData) => {
    const apiUrl = updatedData?.id
      ? `/resume_parser/resume-screening-preferences/${updatedData?.id}/`
      : `/resume_parser/resume-screening-preferences/`;
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + String(authTokens.access),
    };

    if (updatedData) {
      setSaving(true);
      try {
        const response = await fetch(apiUrl, {
          method: updatedData?.id ? "PATCH" : "POST",
          headers: headers,
          body: JSON.stringify(updatedData),
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();

        if (data) {
          setPreference(data);
          setFormData(data);
          // setOptionsData(data)
          setSaving(false);
        }
      } catch (error) {
        setSaving(false);
        console.error("Error creating interview steps:", error);
      }
    }
  }

  const handleLocationAdd = (selectedOption) => {
    if (selectedOption) {
      setFormData({
        ...formData,
        location_to_exclude: selectedOption,
      });
    }
  };


  return (
    <>
      <div
        className="mt-5 overflow-auto w-full description-card bg-white p-5 rounded-3xl shadow-md "
        style={{ height: "calc(100vh - 245px)" }}
      > 
        <div className="w-full flex items-center justify-end">
          <button disabled={saving} onClick={() => updatePreference(formData)} className="px-2.5 py-2 text-sm rounded-md bg-primary-600 text-white shadow-sm">{saving ? "Saving" :  "Save Changes"}</button>
        </div>
        <div class="mt-6 border-t border-gray-100">
          <dl class="divide-y divide-gray-100">
            <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt class="text-sm font-medium leading-6 text-gray-900">
                Max Resume Size (mb)
              </dt>
              <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                <input
                  type="number"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      max_resume_size: e.target.value,
                    })
                  }
                  value={formData.max_resume_size}
                  name="max_resume_size"
                  id="max_resume_size"
                  className="w-full lg:w-1/2 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block p-2.5 "
                  placeholder="2MB"
                  required=""
                />
              </dd>
            </div>
            <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt class="text-sm font-medium leading-6 text-gray-900">
                Max Retries
              </dt>
              <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                <input
                  type="number"
                  onChange={(e) =>
                    setFormData({ ...formData, max_retries: e.target.value })
                  }
                  value={formData.max_retries}
                  name="max_retries"
                  id="max_retries"
                  className="w-full lg:w-1/2 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block p-2.5 "
                  placeholder="3"
                  required=""
                />
              </dd>
            </div>
            <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt class="text-sm font-medium leading-6 text-gray-900">
                Max Applicants
              </dt>
              <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                <input
                  type="number"
                  onChange={(e) =>
                    setFormData({ ...formData, max_applicants: e.target.value })
                  }
                  value={formData.max_applicants}
                  name="max_applicants"
                  id="max_applicants"
                  className="w-full lg:w-1/2 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block p-2.5 "
                  placeholder="200"
                  required=""
                />
              </dd>
            </div>
            {/* <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt class="text-sm font-medium leading-6 text-gray-900">
                Location Preferences
              </dt>
              <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                <label
                  htmlFor="category"
                  className="block mb-2 text-sm font-medium text-gray-800 "
                >
                  Exclude
                </label>
                <CreatableSelect
                  className="text-sm md:w-1/2 min-w-fit"
                  styles={selectStyle}
                  placeholder=""
                  value={formData.location_to_exclude}
                  isMulti
                  onChange={handleLocationAdd}
                  options={locations}
                  isClearable
                />
              </dd>
            </div> */}
            <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt class="text-sm font-medium leading-6 text-gray-900">
                Currency
              </dt>
              <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                
                <Select
                  className="text-sm md:w-1/2 min-w-fit"
                  styles={selectStyle}
                  value={selectedCurrency}
                  onChange={(selectedOption) => {
                    setSelectedCurrency(selectedOption);
                    setFormData({
                      ...formData,
                      currency: selectedOption,
                    });
                  }}
                  options={currencies}
                  placeholder="Select a currency format..."
                />
              </dd>
            </div>
            <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt class="text-sm font-medium leading-6 text-gray-900">
                Social Accounts
              </dt>
              <dd class="mt-1 flex gap-4 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                <div className="flex gap-3 items-center">
                  <Checkbox
                    className={""}
                    checked={formData.include_github}
                    setChecked={(e) =>
                      setFormData({
                        ...formData,
                        include_github: e.target.checked,
                      })
                    }
                  />
                  <label
                    htmlFor="include_github"
                    className="block text-sm font-medium text-gray-900 "
                  >
                    Github
                  </label>
                </div>
                <div className=" flex gap-3 items-center">
                  <Checkbox
                    className={""}
                    checked={formData.include_linkedin}
                    setChecked={(e) =>
                      setFormData({
                        ...formData,
                        include_linkedin: e.target.checked,
                      })
                    }
                  />

                  <label
                    htmlFor="include_linkedin"
                    className="block text-sm font-medium text-gray-900 "
                  >
                    LinkedIn
                  </label>
                </div>
              </dd>
            </div>

            <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt class="text-sm font-medium leading-6 text-gray-900">
                Relevant Experience in Months
              </dt>
              <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                <PreferenceSwitch
                  checked={formData.include_relevant_experience}
                  setChecked={(e) =>
                    setFormData({
                      ...formData,
                      include_relevant_experience: e.target.checked,
                    })
                  }
                />
              </dd>
            </div>
            <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt class="text-sm font-medium leading-6 text-gray-900">
                Notice Period
              </dt>
              <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                <PreferenceSwitch
                  checked={formData.include_notice_period}
                  setChecked={(e) =>
                    setFormData({
                      ...formData,
                      include_notice_period: e.target.checked,
                    })
                  }
                />
              </dd>
            </div>
            <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt class="text-sm font-medium leading-6 text-gray-900">
                Expected CTC
              </dt>
              <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                <PreferenceSwitch
                  checked={formData.include_expected_ctc}
                  setChecked={(e) =>
                    setFormData({
                      ...formData,
                      include_expected_ctc: e.target.checked,
                    })
                  }
                />
              </dd>
            </div>
            <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt class="text-sm font-medium leading-6 text-gray-900">
                Current CTC
              </dt>
              <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                <PreferenceSwitch
                  checked={formData.include_current_ctc}
                  setChecked={(e) =>
                    setFormData({
                      ...formData,
                      include_current_ctc: e.target.checked,
                    })
                  }
                />
              </dd>
            </div>
            <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt class="text-sm font-medium leading-6 text-gray-900">
                Last Increment
              </dt>
              <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                <PreferenceSwitch
                  checked={formData.last_increment}
                  setChecked={(e) =>
                    setFormData({
                      ...formData,
                      last_increment: e.target.checked,
                    })
                  }
                />
              </dd>
            </div>
           
          </dl>
        </div>
      </div>
    </>
  );
};

export default JobPreferences;
