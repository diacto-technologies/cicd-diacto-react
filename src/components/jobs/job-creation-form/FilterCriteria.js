import React, { useState } from "react";
import { selectStyle, selectTheme } from "../../../constants/constants";
import Select from "react-select";
import { TrashIcon } from "@heroicons/react/24/outline";
import Accordion from "../Accordion";
import { json } from "react-router-dom";

const FilterCriteria = ({criteria, setCriteria}) => {

  console.log(criteria)

  const responseFormats = [
    { value: "dropdown", label: "Dropdown" },
    { value: "radio", label: "Radio" },
    { value: "checkbox", label: "Checkbox" },
    { value: "yes/no", label: "Yes/No" },
  ];

  // Add new question criterion
  const addCriterion = () => {
    setCriteria([
      ...criteria,
      {
        question: "",
        response_type: "dropdown",
        options: [],
        expected_response: [], // Allow multiple expected responses for multi-checkbox
      },
    ]);
  };

  // Update question
  const updateQuestion = (index, value) => {
    const newCriteria = [...criteria];
    newCriteria[index].question = value;
    setCriteria(newCriteria);
  };

  // Update response type
  const updateResponseType = (index, selectedOption) => {
    const newCriteria = [...criteria];

    newCriteria[index].response_type = selectedOption?.value;
    newCriteria[index].options = []; // reset options for new type
    newCriteria[index].expected_response =
      selectedOption?.value === "checkbox" ? [] : ""; // reset expected response
    setCriteria(newCriteria);
  };

  // Add option to question criterion
  const addOption = (index) => {
    const newCriteria = [...criteria];
    newCriteria[index].options.push("");
    setCriteria(newCriteria);
  };

  // Update option text
  const updateOption = (criterionIndex, optionIndex, value) => {
    const newCriteria = [...criteria];
    newCriteria[criterionIndex].options[optionIndex] = value;
    setCriteria(newCriteria);
  };

  // Set expected response (for multi-checkbox it can accept multiple values)
  const setExpectedResponse = (index, value) => {
    const newCriteria = [...criteria];
    const criterion = newCriteria[index];

    if (criterion.response_type === "checkbox") {
      // Toggle selection for multi-checkbox
      if (criterion.expected_response.includes(value)) {
        criterion.expected_response = criterion.expected_response.filter(
          (v) => v !== value
        );
      } else {
        criterion.expected_response.push(value);
      }
    } else {
      criterion.expected_response = value;
    }

    setCriteria(newCriteria);
  };

  // Remove criterion
  const removeCriterion = (index) => {
    const newCriteria = [...criteria];
    newCriteria.splice(index, 1);
    setCriteria(newCriteria);
  };

  function handleDelete() {
    console.log("deleting");
  }

  return (
    <div className="w-full flex flex-col gap-4">
      {/* <h2>Custom Preferences</h2> */}
      {criteria.map((criterion, index) => (
        <Accordion
          key={index}
          title={criterion.question || "New Criteria"}
          onDelete={() => removeCriterion(index)}
        >
          <div className="flex flex-col gap-4 px-6 py-4 bg-white text-gray-700 ">
            <input
              type="text"
              placeholder="Question"
              value={criterion.question}
              onChange={(e) => updateQuestion(index, e.target.value)}
              className="border p-2 rounded-md mb-4 w-5/6"
            />

            <div className="w-full mb-4">
              <label>Response Format</label>
              <Select
                className="text-sm w-72 mt-2"
                styles={selectStyle}
                value={responseFormats.find(
                  (r) => r.value === criterion.response_type
                )}
                onChange={(selectedOption) =>
                  updateResponseType(index, selectedOption)
                }
                options={responseFormats}
                theme={selectTheme}
              />
            </div>

            {criterion.response_type !== "yes/no" && (
              <div>
                <h4 className="mb-2">Options:</h4>
                {criterion.options.map((option, optIndex) => (
                  <input
                    key={optIndex}
                    type="text"
                    placeholder={`Option ${optIndex + 1}`}
                    value={option}
                    onChange={(e) =>
                      updateOption(index, optIndex, e.target.value)
                    }
                    className="border p-2 rounded-md mb-2 w-full"
                  />
                ))}
                <button
                  onClick={() => addOption(index)}
                  className="text-sm bg-blue-500 text-white p-2 rounded-md"
                >
                  Add Values
                </button>
              </div>
            )}

            <h4>Expected Response:</h4>
            {criterion.response_type === "yes/no" ? (
              <select
                value={criterion.expected_response}
                onChange={(e) => setExpectedResponse(index, e.target.value)}
                className="border p-2 rounded-md mb-2 w-full"
              >
                <option value="">Select</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            ) : criterion.response_type === "checkbox" ? (
              criterion.options.map((option, optIndex) => (
                <label key={optIndex} className="block mb-1">
                  <input
                    type="checkbox"
                    checked={criterion.expected_response.includes(option)}
                    onChange={() => setExpectedResponse(index, option)}
                    className="mr-2"
                  />
                  {option}
                </label>
              ))
            ) : (
              <select
                value={criterion.expected_response}
                onChange={(e) => setExpectedResponse(index, e.target.value)}
                className="border p-2 rounded-md mb-2 w-full"
              >
                <option value="">Select Expected Response</option>
                {criterion.options.map((option, optIndex) => (
                  <option key={optIndex} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            )}
          </div>
        </Accordion>
      ))}

      <button
        onClick={addCriterion}
        className="border rounded-md px-6 py-2 w-full text-white bg-brand-purple my-4"
      >
        Add Filter Criteria
      </button>

      {/* <pre>{JSON.stringify(criteria,null,2)}</pre> */}
    </div>
  );
};

export default FilterCriteria;
