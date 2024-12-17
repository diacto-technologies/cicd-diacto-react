import React from 'react';

const KpiCard = ({ title, value }) => {
    return (
        // <div className="bg-white shadow-lg rounded-lg p-4 w-full text-center h-40">
        //   <h3 className="text-lg font-bold text-gray-700">{title}</h3>
        //   <p className="text-2xl font-semibold text-blue-600 mt-2">{value}</p>
        // </div>
        <>
            <div className='relative w-full md:w-1/4 h-40 flex flex-col justify-start items-start  max-w-96 p-5 border border-gray-300  shadow-sm bg-white rounded-lg'>
                <span className={`mb-5 font-medium text-gray-500`}> {title}</span>
                <div className=''>
                    <label className='font-bold text-3xl text-primary-600 truncate max-w-full'>{value}</label>
                </div>
            </div>
        </>
    );
};

export default KpiCard;
