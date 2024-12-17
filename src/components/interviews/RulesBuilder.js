import React, { useState } from "react";

const RulesBuilder = () => {
  const fields = [
    {
      name: "Relevant Experience",
      key: "relevant_experience_in_months",
      datatype: "number"
    },
    {
      name: "City",
      key: "city",
      datatype: "text"
    }
  ];

  const numberOperators = [">", "<", ">=", "<=", "="];
  const textOperators = ["="];

  const [filterRules, setFilterRules] = useState({
    logic: "AND",
    conditions: []
  });

  // Add a new condition
  const addCondition = (parent) => {
    const newCondition = {
      field: "",
      value: "",
      operator: ""
    };
    parent.push(newCondition);
    setFilterRules({ ...filterRules });
  };

  // Add a nested group (one allowed per group)
  const addNestedGroup = (parent) => {
    if (!parent.some((item) => item.conditions)) {
      const newGroup = {
        logic: "AND",
        conditions: []
      };
      parent.push(newGroup);
      setFilterRules({ ...filterRules });
    }
  };

  // Delete condition or nested group
  const deleteCondition = (parent, index) => {
    parent.splice(index, 1);
    setFilterRules({ ...filterRules });
  };

  // Update condition field/value/operator
  const updateCondition = (parent, index, key, value) => {
    parent[index][key] = value;
    setFilterRules({ ...filterRules });
  };

  // Update group logic
  const updateGroupLogic = (group, value) => {
    group.logic = value;
    setFilterRules({ ...filterRules });
  };

  // Get available operators based on the selected field's datatype
  const getOperators = (fieldKey) => {
    const selectedField = fields.find((field) => field.key === fieldKey);
    return selectedField?.datatype === "number" ? numberOperators : textOperators;
  };

  // Render a single condition
  const renderCondition = (condition, parent, index) => (
    <div key={index} className="p-2 rounded-md mb-2 flex gap-2" style={{ marginLeft: "20px" }}>
      <select
        className="border p-2 ps-3 rounded-md"
        value={condition.field}
        onChange={(e) => updateCondition(parent, index, "field", e.target.value)}
      >
        <option value="">Select Field</option>
        {fields.map((field) => (
          <option key={field.key} value={field.key}>
            {field.name}
          </option>
        ))}
      </select>
      <select
        className="border p-2 ps-3 rounded-md"
        value={condition.operator}
        onChange={(e) => updateCondition(parent, index, "operator", e.target.value)}
        disabled={!condition.field}
      >
        <option value="">Select Operator</option>
        {getOperators(condition.field).map((op) => (
          <option key={op} value={op}>
            {op}
          </option>
        ))}
      </select>
      <input
        type="text"
        placeholder="Value"
        className="border p-2 ps-3 rounded-md"
        value={condition.value}
        onChange={(e) => updateCondition(parent, index, "value", e.target.value)}
        disabled={!condition.field}
      />
      <button
        type="button"
        className="text-sm px-2 py-1 rounded-md bg-red-600 text-white shadow-sm"
        onClick={() => deleteCondition(parent, index)}
      >
        Delete
      </button>
    </div>
  );

  // Render a group with nested conditions
  const renderGroup = (group, parent) => (
    <div style={{ border: "1px solid #ddd", padding: "10px", margin: "10px" }}>
      <select
        className="border p-2 ps-3 rounded-md me-3"
        value={group.logic}
        onChange={(e) => updateGroupLogic(group, e.target.value)}
      >
        <option value="AND">AND</option>
        <option value="OR">OR</option>
      </select>
      <div className="my-2">
        {group.conditions.map((condition, index) =>
          condition.conditions
            ? renderGroup(condition, group.conditions)
            : renderCondition(condition, group.conditions, index)
        )}
      </div>
      <button
        type="button"
        className="text-sm p-2 me-2 rounded-md bg-blue-500 text-white shadow-sm"
        onClick={() => addCondition(group.conditions)}
      >
        Add Condition
      </button>
      <button
        type="button"
        className="text-sm p-2 me-2 rounded-md bg-blue-500 text-white shadow-sm"
        onClick={() => addNestedGroup(group.conditions)}
        disabled={group.conditions.some((condition) => condition.conditions)}
      >
        Add Nested Group
      </button>
      {parent && (
        <button
          type="button"
          className="text-sm p-2  rounded-md bg-red-600 text-white shadow-sm"
          onClick={() => deleteCondition(parent, parent.indexOf(group))}
        >
          Delete Group
        </button>
      )}
    </div>
  );

  return (
    <div>
      <h3>Filter Builder</h3>
      {renderGroup(filterRules, null)}
      <pre className="mt-3">
        <label className="block my-3">Preview</label>
        {JSON.stringify(filterRules, null, 2)}
      </pre>
    </div>
  );
};

export default RulesBuilder;
