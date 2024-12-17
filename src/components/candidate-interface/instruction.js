import React from 'react';
const Instruction =({ StartTest ,total_question ,total_test ,total_time})=>{
    const StartClick = () => {
        // Get the current time
        const currentTime = new Date();
        StartTest(currentTime);
    };
    return (
        <>
        <div className="h-screen w-full flex items-center justify-center bg-transparent md:bg-gray-50 lg:px-14 lg:py-5">
                <div className="background-svg bottom-0">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
                        <path fill="#0099ff" fillOpacity="1" d="M0,64L48,53.3C96,43,192,21,288,64C384,107,480,213,576,229.3C672,245,768,171,864,165.3C960,160,1056,224,1152,234.7C1248,245,1344,203,1392,181.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                    </svg>
                </div>
                <div className=" w-full bg-transparent md:bg-white relative z-10 flex flex-col justify-start md:justify-start h-90 rounded-3xl overflow-auto md:overflow-hidden">

                <div className="w-full flex items-center justify-center p-3 ps-5 mt-5 border-b">            
                        <label className="font-medium text-xl leading-8 text-slate-700">Instruction</label>    
                    </div>
                    <div className="w-full flex items-center justify-between p-3 ps-5 mt-8">            
                        <label>This is A Test For Your recruitement Go Through the Rule Given Below</label>
                    </div>
                    <div className="w-full flex flex-col items-start justify-between p-3 ps-5 mt-8">            
                        <label>1. Don't Switch the Tab </label>
                        <label>2. The Test Consist of {total_question} Questions </label>
                        <label>3. The Test Is Of {total_time} Seconds </label>
                        <label>3. Number of Test: {total_test} </label>
                    </div>
                    <div className="w-full flex items-center justify-center p-3 ps-5 mt-5 border-b">            
                            
                        <button onClick={StartClick} name='start-test' className="px-3 py-1.5 text-sm text-white rounded-md bg-primary-600">Start Test</button>
                    </div>
                </div>
        </div>
        </>

    )
}
export default Instruction;