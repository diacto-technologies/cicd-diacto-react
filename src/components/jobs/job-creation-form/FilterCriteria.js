import React, { useState } from "react";
import { api, selectStyle, selectTheme } from "../../../constants/constants";
import Select from "react-select";
import { StopCircleIcon, TrashIcon } from "@heroicons/react/24/outline";
import Accordion from "../Accordion";
import { json } from "react-router-dom";

const FilterCriteria = ({ criteria, setCriteria }) => {
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
        id: null, // New criteria will have no ID initially
        question: "",
        response_type: "dropdown",
        options: [],
        expected_response: [],
        isUpdated: true,
      },
    ]);
  };

  // Update question
  const updateQuestion = (index, value) => {
    const newCriteria = [...criteria];
    newCriteria[index].question = value;
    newCriteria[index].isUpdated = true; // Mark as updated
    setCriteria(newCriteria);
  };

  // Update response type
  const updateResponseType = (index, selectedOption) => {
    const newCriteria = [...criteria];
    newCriteria[index].response_type = selectedOption?.value;
    newCriteria[index].options = []; // Reset options for new type
    newCriteria[index].expected_response =
      selectedOption?.value === "checkbox" ? [] : ""; // Reset expected response
    newCriteria[index].isUpdated = true; // Mark as updated
    setCriteria(newCriteria);
  };

  // Add option to question criterion
  const addOption = (index) => {
    const newCriteria = [...criteria];
    newCriteria[index].options.push("");
    newCriteria[index].isUpdated = true; // Mark as updated
    setCriteria(newCriteria);
  };

  // Remove option from question criterion
  const deleteOption = (criterionIndex, optionIndex) => {
    const newCriteria = [...criteria];
    newCriteria[criterionIndex].options.splice(optionIndex, 1);
    newCriteria[criterionIndex].isUpdated = true; // Mark as updated
    setCriteria(newCriteria);
  };

  // Update option text
  const updateOption = (criterionIndex, optionIndex, value) => {
    const newCriteria = [...criteria];
    newCriteria[criterionIndex].options[optionIndex] = value;
    newCriteria[criterionIndex].isUpdated = true; // Mark as updated
    setCriteria(newCriteria);
  };

  // Set expected response
  const setExpectedResponse = (index, value) => {
    const newCriteria = [...criteria];
    const criterion = newCriteria[index];

    if (criterion.response_type === "checkbox") {
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

    criterion.isUpdated = true; // Mark as updated
    setCriteria(newCriteria);
  };

  // Remove criterion
  const removeCriterion = async (index, id) => {
    const newCriteria = [...criteria];
    newCriteria.splice(index, 1);
    setCriteria(newCriteria);

    if (id) {
      const url = `${api}/jobs/criteria/${id}/`;
      try {
        const response = await fetch(url, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ is_deleted: true }),
        });

        if (!response.ok) {
          console.error("Failed to delete criterion");
        }
      } catch (error) {
        console.error("Network error:", error);
      }
    }
  };

  function handleDelete() {
    console.log("deleting");
  }

  return (
    <div className="w-full flex flex-col gap-4">
      {criteria.map((criterion, index) => (
        <Accordion
          key={index}
          title={criterion.question || "New Criteria"}
          onDelete={() => removeCriterion(index, criterion.id)}
        >
          <div className="flex flex-col gap-4 px-6 py-4 bg-white text-gray-700">
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
                  <div key={optIndex} className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      placeholder={`Option ${optIndex + 1}`}
                      value={option}
                      onChange={(e) =>
                        updateOption(index, optIndex, e.target.value)
                      }
                      className="border p-2 rounded-md w-full"
                    />
                    <button
                      onClick={() => deleteOption(index, optIndex)}
                      className=""
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="red" class="size-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>

                    </button>
                  </div>
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
                option &&
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
                  option &&
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
    </div>
  );
};

export default FilterCriteria;