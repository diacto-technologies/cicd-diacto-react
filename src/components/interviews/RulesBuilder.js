import React, { useContext, useEffect, useState } from "react";
import AuthContext from "../../context/AuthContext";
import Select from "react-select";
import { selectStyle } from "../../constants/constants";

const RulesBuilder = ({ jobId,serviceKey,serviceId,stageId }) => {
  const { authTokens,userDetails } = useContext(AuthContext);
  const [fields, setFields] = useState([]);
  const [rule,setRule] = useState(null)
  const numberOperators = [">", "<", ">=", "<=", "="];
  const textOperators = ["="];

  const [filterRules, setFilterRules] = useState({
    logic: "AND",
    conditions: []
  });

  useEffect(() => {
    fetchValidRuleFields(serviceId);
    fetchRule(stageId)
  }, []);

  const fetchRule = async(stageId) => {
    try {
    const response = await fetch(`/workflow/stage/${stageId}/rule/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + String(authTokens.access),
      },
    });
    if (!response.ok) {
      console.error("Something went wrong");
    }
    if (response.ok) {
      const data = await response.json();
      if (data) {
        console.log(typeof data.rule === "string")
        setFilterRules(typeof data.rule === "string" ? JSON.parse(data.rule) : data.rule)
        setRule(data)
      }
      return data;
    }
  } catch (error) {
    console.error(error);
  }
  };

  const createRule = async () => {
    try {
      const payload = {
        rule: JSON.stringify(filterRules),
        key: serviceKey,
        service: serviceId,
        updated_by: userDetails?.id,
        updated_at : new Date(),
        stage : stageId
      };

      const response = await fetch( rule?.id ? `/workflow/rule/${rule.id}/` : `/workflow/rule/`, {
        method: rule?.id ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + String(authTokens.access),
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        console.error("Something went wrong");
      }
      if (response.ok) {
        const data = await response.json();
        console.log(data)
        setRule(data)
        setFilterRules(JSON.parse(data.rule))
        addRuleToStage(data.id)
        return data;
      }
    } catch (error) {
      console.error(error);
    }
  };

  const addRuleToStage = async(ruleId) => {
    try{
    const response = await fetch(`/workflow/stage/${stageId}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + String(authTokens.access),
      },
      body: JSON.stringify({rule : ruleId})
    });
    if (!response.ok) {
      console.error("Something went wrong");
    }
    if (response.status === 200) {
      const data = await response.json();
      if (data) {
       console.log(data)
      }
      return data;
    }
  } catch (error) {
    console.error(error);
  }
  }

  const fetchValidRuleFields = async (serviceId) => {
    try {
      const response = await fetch(`/workflow/valid-rule-fields/${serviceId}/`, {
        method: "get",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + String(authTokens.access),
        },
      });
      if (response.status === 200) {
        const data = await response.json();
        if (data.length) {
          setFields(() =>
            data.map((field) => ({ ...field, label: field.name, value: field.key }))
          );
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const addCondition = (parent) => {
    const newCondition = {
      field: "",
      value: "",
      operator: "",
      type: "data-field",
      exists: false,
      enabled: false, // Default to false when added
      alert_id: null,
    };
    parent.push(newCondition);
    setFilterRules({ ...filterRules });
  };

  const addNestedGroup = (parent) => {
    if (!parent.some((item) => item.conditions)) {
      const newGroup = {
        logic: "AND",
        conditions: [],
      };
      parent.push(newGroup);
      setFilterRules({ ...filterRules });
    }
  };

  const deleteCondition = (parent, index) => {
    parent.splice(index, 1);
    setFilterRules({ ...filterRules });
  };

  const updateCondition = (parent, index, key, value) => {
    parent[index][key] = value;
    setFilterRules({ ...filterRules });
  };

  const updateGroupLogic = (group, value) => {
    group.logic = value;
    setFilterRules({ ...filterRules });
  };

  const getOperators = (fieldKey) => {
    const selectedField = fields.find((field) => field.key === fieldKey);
    return selectedField?.datatype === "number" ? numberOperators : textOperators;
  };

  const renderCondition = (condition, parent, index) => (
    <div
      key={index}
      className="p-2 rounded-md mb-2 flex gap-2 items-center"
      style={{ marginLeft: "20px" }}
    >
      <Select
        className="w-5/6 md:w-56 text-xs"
        styles={selectStyle}
        value={fields.find((field) => field.value === condition.field)}
        onChange={(selectedOption) =>
          updateCondition(parent, index, "field", selectedOption.value)
        }
        options={fields}
        placeholder="Select Field"
      />
      <select
        className="border p-2 ps-3 rounded-md text-sm"
        value={condition.operator}
        onChange={(e) =>
          updateCondition(parent, index, "operator", e.target.value)
        }
        disabled={!condition.field}
      >
        <option className="text-sm" value="">
          Select Operator
        </option>
        {getOperators(condition.field).map((op) => (
          <option key={op} value={op}>
            {op}
          </option>
        ))}
      </select>
      <input
        type="text"
        placeholder="Value"
        className="border p-2 ps-3 rounded-md text-sm"
        value={condition.value}
        onChange={(e) =>
          updateCondition(parent, index, "value", e.target.value)
        }
        disabled={!condition.field || !condition.operator}
      />
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={condition.enabled}
          onChange={(e) =>
            updateCondition(parent, index, "enabled", e.target.checked)
          }
        />
        Enable Alert
      </label>
      <button
        type="button"
        className="text-sm ms-2 px-2 py-1 rounded-md text-red-600 font-medium"
        onClick={() => deleteCondition(parent, index)}
      >
        Delete
      </button>
    </div>
  );

  const renderGroup = (group, parent, depth = 0) => (
    <div className="p-6 border rounded-md mb-4 bg-gray-50 shadow-md">
      <select
        className="border p-2 ps-3 rounded-md me-3 text-sm font-medium"
        value={group.logic}
        onChange={(e) => updateGroupLogic(group, e.target.value)}
      >
        <option value="AND">AND</option>
        <option value="OR">OR</option>
      </select>
      <div className="my-2">
        {group.conditions.map((condition, index) =>
          condition.conditions
            ? renderGroup(condition, group.conditions, depth + 1)
            : <>
            {renderCondition(condition, group.conditions, index)}
            {
              index !== group.conditions.length -1 && <div className="w-1/2 p-3 text-center font-medium bg-indigo-50 my-2 text-sm">{group.logic}</div>
            }
            </>
        )}
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          className="text-sm p-2 me-2 rounded-md bg-white text-indigo-600 ring-2 ring-indigo-500/60 shadow-sm hover:ring-indigo-600"
          onClick={() => addCondition(group.conditions)}
        >
          Add Condition
        </button>
        {/* Show the "Add Nested Group" button only for the outermost group */}
        {depth === 0 && !group.conditions.some((condition) => condition.conditions) && (
          <button
            type="button"
            className="text-sm p-2 me-2 rounded-md bg-white text-indigo-600 ring-2 ring-indigo-500/60 shadow-sm hover:ring-indigo-600"
            onClick={() => addNestedGroup(group.conditions)}
          >
            Add Nested Group
          </button>
        )}
        {parent && (
          <button
            type="button"
            className="text-sm p-2 rounded-md bg-white text-red-600 ring-2 ring-red-500/60 shadow-sm hover:ring-red-600"
            onClick={() => deleteCondition(parent, parent.indexOf(group))}
          >
            Delete Group
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full h-full mt-10">
      {renderGroup(filterRules, null)}
      <pre className="mt-3 bg-gray-100 p-4 rounded-md shadow-inner">
        {JSON.stringify(filterRules, null, 2)}
      </pre>

      <div className="flex w-full  justify-end ">
      <button type="button" onClick={() => createRule()} className="px-3 py-2 bg-brand-purple text-white rounded-md mb-3"> {rule?.id ? "Update Rule" : "Create Rule"}</button>
      </div>
    </div>
  );
};

export default RulesBuilder;
