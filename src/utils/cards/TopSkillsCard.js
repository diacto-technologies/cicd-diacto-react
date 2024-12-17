import React from 'react';

const TopSkillsCard = ({ title, value }) => {


    return (
        // <div className="bg-white shadow-lg rounded-lg p-4 w-full text-center h-40">
        //   <h3 className="text-lg font-bold text-gray-700">{title}</h3>
        //   <p className="text-2xl font-semibold text-blue-600 mt-2">{value}</p>
        // </div>
        <>
            <div className='relative w-full md:w-1/4 h-40 flex flex-col justify-start items-start  max-w-96  p-4  bg-white border border-gray-300 shadow-sm rounded-lg'>
                <span className={` font-medium mb-5 text-gray-500`}> {title}</span>
                <div className=''>
                    {
                        value?.map((skill, index) => {
                            if (index === 0) {
                                return <div>
                                    <label className='font-bold text-2xl text-primary-600 truncate max-w-full me-2'>{skill.skill}</label>
                                    <span className='text-gray-400 text-sm '>{skill.count} Applicants</span>
                                </div>
                            } else {
                                return <div>
                                    <label className='font-bold text-primary-600 truncate max-w-full me-2'>{skill.skill}</label>
                                    <span  className='text-gray-400 text-sm'>{skill.count} Applicants</span>
                                </div>
                            }
                        })
                    }
                </div>
            </div>
        </>
    );
};

export default TopSkillsCard;
