import React, { useState, useEffect } from 'react';
import { api } from '../../constants/constants';

function CandidateCriteriaForm({ jobId, onSubmit, criteriaResponses, setCriteriaResponses, setFormValidationResponse, criteriaErrors }) {
  const [criteriaList, setCriteriaList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCriteria() {
      try {
        const response = await fetch(`${api}/jobs/criteria/job/${jobId}/`);
        if (!response.ok) {
          throw new Error("Failed to fetch criteria");
        }
        const data = await response.json();
        setCriteriaList(data);

        // Initialize criteriaResponses with empty values
        const initialcriteriaResponses = {};
        data.forEach(criterion => {
          initialcriteriaResponses[criterion.id] = criterion.response_type === 'checkbox' ? [] : '';
        });
        setCriteriaResponses(initialcriteriaResponses);
      } catch (error) {
        console.error("Error fetching criteria:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCriteria();
  }, [jobId]);

  const handleResponseChange = (criterionId, value) => {
    setCriteriaResponses((prevcriteriaResponses) => ({
      ...prevcriteriaResponses,
      [criterionId]: value,
    }));
  };

  const handleSubmit = () => {
  
    onSubmit(criteriaResponses);
  };

  if (loading) return <p>Loading criteria...</p>;


  return (
    <div >
      {/* <h2>Criteria for Job ID: {jobId}</h2> */}
      {criteriaList.length > 0 && (
        criteriaList.map((criterion) => (
          <div key={criterion.id} style={{ marginBottom: '20px' }}>
            <label className='mb-2 w-full text-sm font-medium leading-6 text-gray-900'>{criterion.question}<span className='text-red-500 text-sm'> *</span></label>
            {criteriaErrors && criteriaErrors[criterion.id] && <p className='text-red-500 text-sm mb-3'>{criteriaErrors[criterion.id]}</p>}
            <div className='mb-3 flex flex-col gap-1 px-3'>
            {renderResponseInput(criterion, criteriaResponses[criterion.id], handleResponseChange)}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// Render input based on response type
function renderResponseInput(criterion, responseValue, handleResponseChange) {
  const { id, response_type, options } = criterion;

  switch (response_type) {
    case 'dropdown':
      return (
        <select
            value={responseValue}
            onChange={(e) => handleResponseChange(id, e.target.value)}
            className="w-full md:w-1/2 p-2 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
            <option value="" className="text-gray-400">Select an option</option>
            {options.map((option, index) => (
                <option key={index} value={option} className="text-gray-700">{option}</option>
            ))}
            </select>
      );

    case 'radio':
      return <div className="flex gap-2 flex-wrap">
      {options.map((option, index) => (
        <label
          key={index}
          className="flex items-center space-x-3 py-2 px-3 bg-white border border-gray-300 rounded-lg shadow-sm cursor-pointer hover:bg-gray-50"
        >
          <input
            type="radio"
            name={`criterion-${id}`}
            value={option}
            checked={responseValue === option}
            onChange={(e) => handleResponseChange(id, e.target.value)}
            className="form-radio h-4 w-4 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-gray-700">{option}</span>
        </label>
      ))}
    </div>
    

    // case 'checkbox':
    //   return (
    //     <label>
    //       <input
    //         type="checkbox"
    //         checked={responseValue === true}
    //         onChange={(e) => handleResponseChange(id, e.target.checked)}
    //       />
    //       {options[0] || "Yes/No"}
    //     </label>
    //   );

    case 'checkbox':
      return options.map((option, index) => (
        <label key={index} className='flex gap-3'>
          <input
            type="checkbox"
            value={option}
            checked={responseValue.includes(option)}
            onChange={(e) => {
              const updatedValue = e.target.checked
                ? [...responseValue, option]
                : responseValue.filter((val) => val !== option);
              handleResponseChange(id, updatedValue);
            }}
          />
          {option}
        </label>
      ));

    case 'yes/no':
      return (
        <select
            className="w-full md:w-1/2 p-2 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={responseValue}
          onChange={(e) => handleResponseChange(id, e.target.value)}
        >
          <option value="" className="text-gray-500">Select an option</option>
          <option value="yes" className="text-gray-700">Yes</option>
          <option value="no" className="text-gray-700">No</option>
        </select>
      );

    default:
      return <input type="text" value={responseValue} onChange={(e) => handleResponseChange(id, e.target.value)} />;
  }
}

export default CandidateCriteriaForm;
