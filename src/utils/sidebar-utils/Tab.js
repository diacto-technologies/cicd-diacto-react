import { ReactComponentElement, memo } from 'react';
import { Link } from 'react-router-dom';

const Tab = memo(({ link, title, iconClass, isActive, isLocked, show, lockIcon, onClick, applicantsCount, jobCount }) => {
  // console.count("TAB rerender")
  const tabClasses = `${title}  flex justify-between items-center tab cursor-pointer block py-2 px-4 mb-1 rounded-md font-medium text-sm ${isLocked ? `text-gray-400` : `text-gray-700 tab-hover`}  ${isActive && !isLocked ? 'bg-[#3D73FD] text-white  shadow-md' : ``
    }`;


  return (
    <>
      {
        show &&
        <Link className={tabClasses} to={link} onClick={onClick} >
          <div >
            <i className={`${iconClass}   me-2 w-8 text-center p-1 text-base`}></i> <span className=''>{title}</span>
          </div>
          {title === "Jobs" && jobCount && <span className="inline-flex border bg-gray-50 text-brand-dark justify-center items-center rounded-md h-6 w-8 text-center text-xs font-bold ">{jobCount}</span>}
          {title === "Applicants" && applicantsCount && <span className="inline-flex border bg-gray-50 text-brand-dark justify-center items-center rounded-md h-6 w-8 text-center text-xs font-bold">{applicantsCount}</span>}
          {isLocked && <i className={`${lockIcon} text-gray-400 w-8 text-center p-1 text-base`}></i>}
        </Link>
      }
    </>
  );
});

export default Tab;
