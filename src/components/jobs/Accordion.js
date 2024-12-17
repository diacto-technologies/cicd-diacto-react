import { TrashIcon } from '@heroicons/react/24/outline';
import React, { useState } from 'react';

const Accordion = ({ title, children, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = () => setIsOpen(!isOpen);

  return (
    <div className="border rounded-lg overflow-hidden ">
      {/* Accordion Header */}
      <div className="flex items-center justify-between w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 transition">
        <button onClick={toggleAccordion} className="flex-1 text-left font-semibold">
          {title}
        </button>

        {/* Delete Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="ml-2 px-2 py-1 text-red-500 hover:text-red-700"
        >
          <TrashIcon className="w-5 h-5" />
        </button>

        {/* Chevron Icon */}
        <button onClick={toggleAccordion} className="ml-2">
          <svg
            className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </div>

      {/* Accordion Content */}
      {isOpen && <div>{children}</div>}
    </div>
  );
};

export default Accordion;
