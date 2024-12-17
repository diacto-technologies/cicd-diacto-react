import React, { useState, useEffect } from 'react';

function CandidateCriteriaForm({ jobId, onSubmit }) {
  const [criteriaList, setCriteriaList] = useState([]);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);

  console.log(responses)

  useEffect(() => {
    async function fetchCriteria() {
      try {
        const response = await fetch(`/jobs/criteria/job/${jobId}/`);
        if (!response.ok) {
          throw new Error("Failed to fetch criteria");
        }
        const data = await response.json();
        setCriteriaList(data);

        // Initialize responses with empty values
        const initialResponses = {};
        data.forEach(criterion => {
          initialResponses[criterion.id] = criterion.response_type === 'checkbox' ? [] : '';
        });
        setResponses(initialResponses);
      } catch (error) {
        console.error("Error fetching criteria:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCriteria();
  }, [jobId]);

  const handleResponseChange = (criterionId, value) => {
    setResponses((prevResponses) => ({
      ...prevResponses,
      [criterionId]: value,
    }));
  };

  const handleSubmit = () => {
  
    onSubmit(responses);
  };

  if (loading) return <p>Loading criteria...</p>;

  return (
    <div >
      {/* <h2>Criteria for Job ID: {jobId}</h2> */}
      {criteriaList.length > 0 ? (
        criteriaList.map((criterion) => (
          <div key={criterion.id} style={{ marginBottom: '20px' }}>
            <label className='mb-3 w-full'><strong>{criterion.question}</strong></label>
            <br />
            <div className='my-3'>
            {renderResponseInput(criterion, responses[criterion.id], handleResponseChange)}
            </div>
          </div>
        ))
      ) : (
        <p>No criteria found for this job.</p>
      )}
      <button onClick={handleSubmit} type="button">Submit Responses</button>
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
            className="w-full p-2 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
            <option value="" className="text-gray-400">Select an option</option>
            {options.map((option, index) => (
                <option key={index} value={option} className="text-gray-700">{option}</option>
            ))}
            </select>
      );

    case 'radio':
      return <div className="flex  gap-2">
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
    

    case 'checkbox':
      return (
        <label>
          <input
            type="checkbox"
            checked={responseValue === true}
            onChange={(e) => handleResponseChange(id, e.target.checked)}
          />
          {options[0] || "Yes/No"}
        </label>
      );

    case 'checkbox':
      return options.map((option, index) => (
        <label key={index}>
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
            className="w-full p-2 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
