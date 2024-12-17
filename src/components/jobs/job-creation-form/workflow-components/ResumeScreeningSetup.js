import { useContext, useState } from "react";
import AuthContext from "../../../../context/AuthContext";
import ResumePreferences from "./ResumePreferences";
import RulesBuilder from "../../../interviews/RulesBuilder";
import AlertManager from "../AlertBuilder";

const ResumeScreeningSetup = ({ jobId,stage }) => {
  const { authTokens, userDetails } = useContext(AuthContext);
  const [currentTab, setCurrentTab] = useState("Setup");
  const [rule, setRule] = useState({
    logic: "AND",
    conditions: [
      {
        type: "data-field",
        field: "location",
        value: { city: "Mumbai", state: "Maharashtra" },
        exists: false,
        enabled: false,
        alert_id: null,
      },
      {
        logic: "OR",
        conditions: [
          {
            type: "data-field",
            field: "last_increment",
            value: 14,
            exists: true,
            enabled: true,
            alert_id: 1,
            operator: ">",
          },
          {
            type: "data-field",
            field: "notice_period_in_months",
            value: 8,
            exists: false,
            enabled: false,
            alert_id: null,
            operator: "<",
          },
        ],
      },
    ],
  });

  
  

  return (
    <>
      {/* <button type="button" onClick={() => createRule()} className="">Create Rule</button> */}
      <div className="w-5/6 bg-white min-h-80 mx-auto rounded-md shadow-sm">
        <div className="bg-[#e4e5f9] px-16 flex flex-row-reverse justify-between items-end  rounded-t-md">
          <h1 className="text-lg font-semibold text-gray-700 p-3">
            Resume Screening
          </h1>
          <div className="flex gap-3 items-end justify-start">
            <button
              type="button"
              onClick={() => setCurrentTab("Setup")}
              className={`p-2 border-b-4 font-medium text-gray-600 ${
                currentTab === "Setup" &&
                "border-b-4 border-b-indigo-500 text-indigo-600"
              }`}
            >
              Setup
            </button>
            <button
              type="button"
              onClick={() => setCurrentTab("Rules")}
              className={`p-2 border-b-4 font-medium text-gray-600 ${
                currentTab === "Rules" &&
                "border-b-4 border-b-indigo-500 text-indigo-600"
              }`}
            >
              Rules
            </button>
            <button
              type="button"
              onClick={() => setCurrentTab("Alerts")}
              className={`p-2 border-b-4 font-medium text-gray-600 ${
                currentTab === "Alerts" &&
                "border-b-4 border-b-indigo-500 text-indigo-600"
              }`}
            >
              Alerts
            </button>
          </div>
        </div>

        <div className="w-full">
            {currentTab === "Setup" && <ResumePreferences jobId={jobId}  />}
            {currentTab === "Rules" && <RulesBuilder jobId={jobId} serviceId={1} serviceKey={"resume-screening"} stageId={stage?.id || null} />}
            {currentTab === "Alerts" && <AlertManager jobId={jobId} serviceId={1} serviceKey={"resume-screening"} stageId={stage?.id || null} />}
        </div>
      </div>
    </>
  );
};

export default ResumeScreeningSetup;
