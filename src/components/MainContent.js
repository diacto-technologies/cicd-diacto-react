import React from 'react';
import Navbar from '../utils/navbar/Navbar';
import Heading from '../utils/header/Heading';

const MainContent = ({isSidebarOpen, setSidebarOpen}) => {
  return (
    <div className={`bg-gray-50 overflow-hidden max-h-screen ${isSidebarOpen ? 'w-3/4' : 'w-1/2'} flex-1 flex flex-col`}>
        <Navbar />
        
        <Heading />
      {/* Content area content goes here */}
    </div>
  );
};

export default MainContent;
