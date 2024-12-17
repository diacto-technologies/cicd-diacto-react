import React, { useState, useEffect, useContext } from "react";
import Select from "react-select";
import AuthContext from "../../../context/AuthContext";
import { api } from "../../../constants/constants";

const AlertManager = ({ serviceId, stageId }) => {
  const {user, authTokens,userDetails } = useContext(AuthContext);
  const [fields, setFields] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentAlert, setCurrentAlert] = useState(null);

  const numberOperators = [">", "<", ">=", "<=", "="];
  const textOperators = ["="];

  useEffect(() => {
    fetchValidFields(serviceId);
    fetchAlerts();
  }, [serviceId, stageId]);

  // Fetch valid fields for conditions
  const fetchValidFields = async (serviceId) => {
    try {
      const response = await fetch(`${api}/workflow/valid-rule-fields/${serviceId}/`,
        {
            headers: { "Content-Type": "application/json",
                Authorization: "Bearer " + String(authTokens.access),
             },
        }
      );
      if (response.status === 200) {
        const data = await response.json();
        setFields(
          data.map((field) => ({
            ...field,
            label: field.name,
            value: field.key,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching fields:", error);
    }
  };

  // Fetch existing alerts
  const fetchAlerts = async () => {
    try {
      const response = await fetch(`${api}/workflow/stage/${stageId}/alert/`,
        {
            headers: { "Content-Type": "application/json",
                Authorization: "Bearer " + String(authTokens.access),
             },
        }
      );
      if (response.status === 200) {
        const data = await response.json();
        if (data.length) {
        setAlerts(data);
            
        }
      }
    } catch (error) {
      console.error("Error fetching alerts:", error);
    }
  };

  // Save or update alert
  const handleSaveAlert = async (alert) => {
    try {
      const method = alert.id ? "PUT" : "POST";
      const url = alert.id ? `${api}/workflow/alert/${alert.id}/` : `${api}/workflow/alert/`;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json",
            Authorization: "Bearer " + String(authTokens.access),
         },
        body: JSON.stringify({ ...alert, stage: stageId,user:user.id }),
      });

      if (response.ok) {
        fetchAlerts(); // Refresh the list
        setModalOpen(false);
      } else {
        console.error("Error saving alert.");
      }
    } catch (error) {
      console.error("Error saving alert:", error);
    }
  };

  // Delete alert
  const handleDeleteAlert = async (id) => {
    try {
      const response = await fetch(`${api}/workflow/alert/${id}/`, {
        method: "DELETE",
        headers: { 
            Authorization: "Bearer " + String(authTokens.access),
         },
      });

      if (response.ok) {
        fetchAlerts(); // Refresh the list
      } else {
        console.error("Error deleting alert.");
      }
    } catch (error) {
      console.error("Error deleting alert:", error);
    }
  };

  // Open modal for creating or updating an alert
  const openModal = (alert = null) => {
    setCurrentAlert(
      alert || {
        name: "",
        description: "",
        condition: { field: "", operator: "", value: "" },
        enabled: true,
      }
    );
    setModalOpen(true);
  };

  // Get operators based on the selected field type
  const getOperators = (fieldKey) => {
    const selectedField = fields.find((field) => field.key === fieldKey);
    return selectedField?.datatype === "number" ? numberOperators : textOperators;
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-3">
      <h2 className="text-lg font-bold mb-4">Alert Manager</h2>
      <button
          className="p-2 bg-indigo-500 text-white rounded"
          onClick={() => openModal()}
        >
          Create New Alert
        </button>
      </div>

      {/* Alert List */}
      <div className="mb-4">
       
        <div className="mt-4">
          {alerts?.map((alert) => (
            <div
              key={alert.id}
              className="p-4 mb-2 border rounded flex justify-between items-center"
            >
              <div>
                <h3 className="font-medium">{alert.name}</h3>
                <p className="text-sm text-gray-500">{alert.description}</p>
                <p className="text-sm">
                  Condition: {alert.condition.field} {alert.condition.operator}{" "}
                  {alert.condition.value}
                </p>
                <p className="text-sm">
                  Enabled: {alert.enabled ? "Yes" : "No"}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  className="p-2 text-blue-500  rounded"
                  onClick={() => openModal(alert)}
                >
                  Update
                </button>
                <button
                  className="p-2 text-red-500 rounded"
                  onClick={() => handleDeleteAlert(alert.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-1/2">
            <h3 className="text-lg font-bold mb-4">
              {currentAlert?.id ? "Update Alert" : "Create Alert"}
            </h3>
            <div className="mb-4">
              <label className="block font-medium mb-1">Alert Name</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                placeholder="Alert Name"
                value={currentAlert.name}
                onChange={(e) =>
                  setCurrentAlert({ ...currentAlert, name: e.target.value })
                }
              />
            </div>
            <div className="mb-4">
              <label className="block font-medium mb-1">Description</label>
              <textarea
                className="w-full p-2 border rounded"
                placeholder="Description"
                value={currentAlert.description}
                onChange={(e) =>
                  setCurrentAlert({ ...currentAlert, description: e.target.value })
                }
              />
            </div>
            <div className="flex gap-2 items-center mb-4">
              <Select
                className="w-1/3"
                options={fields}
                value={fields.find(
                  (field) => field.value === currentAlert.condition.field
                )}
                onChange={(selectedOption) =>
                  setCurrentAlert({
                    ...currentAlert,
                    condition: {
                      ...currentAlert.condition,
                      field: selectedOption.value,
                    },
                  })
                }
                placeholder="Select Field"
              />
              <select
                className="w-1/4 p-2 border rounded"
                value={currentAlert.condition.operator}
                onChange={(e) =>
                  setCurrentAlert({
                    ...currentAlert,
                    condition: {
                      ...currentAlert.condition,
                      operator: e.target.value,
                    },
                  })
                }
                disabled={!currentAlert.condition.field}
              >
                <option value="">Select Operator</option>
                {getOperators(currentAlert.condition.field).map((op) => (
                  <option key={op} value={op}>
                    {op}
                  </option>
                ))}
              </select>
              <input
                type="text"
                className="w-1/4 p-2 border rounded"
                placeholder="Value"
                value={currentAlert.condition.value}
                onChange={(e) =>
                  setCurrentAlert({
                    ...currentAlert,
                    condition: {
                      ...currentAlert.condition,
                      value: e.target.value,
                    },
                  })
                }
                disabled={
                  !currentAlert.condition.field || !currentAlert.condition.operator
                }
              />
            </div>
            <div className="mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={currentAlert.enabled}
                  onChange={() =>
                    setCurrentAlert((prev) => ({
                      ...prev,
                      enabled: !prev.enabled,
                    }))
                  }
                />
                Enabled
              </label>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                className="p-2 bg-gray-300 rounded"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="p-2 bg-blue-500 text-white rounded"
                onClick={() => handleSaveAlert(currentAlert)}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertManager;
