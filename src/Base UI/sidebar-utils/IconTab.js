import React from 'react';
import { Link } from 'react-router-dom';

const IconTab = ({link, title,iconClass, isActive,isLocked, onClick ,show}) => {
  const tabClasses = `cursor-pointer block flex items-center justify-center py-2 px-2 mb-1 rounded-md font-medium text-sm  ${isLocked ? `text-gray-400` : `text-gray-700 tab-hover`}  ${isActive && !isLocked ? 'bg-blue-50 brand-text': `` 
}`;

  return (
    <>
    {
      show &&
      <Link className={tabClasses} to={link} onClick={onClick}>
      <i className={`${iconClass}  w-8 text-center p-1 text-base`}></i>
    </Link>
    }
    </>
  );
};

export default IconTab;
