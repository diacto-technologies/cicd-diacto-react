import React from "react";

const ProgressBar = ({ currentIndex, length }) => {
  // Calculate percentage based on current question index
  const progressPercentage = ((currentIndex ) / length) * 100;

  return (
    <div className="w-full bg-gray-200 rounded-full h-2 ">
      <div
        className="bg-brand-purple h-2 rounded-full transition-all duration-300"
        style={{ width: `${progressPercentage}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar;
