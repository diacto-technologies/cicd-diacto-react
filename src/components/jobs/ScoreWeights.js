import React, { useEffect, useState } from 'react';
import ReactEcharts from 'echarts-for-react';

function ScoreWeights({ weights, setWeights ,error}) {

  const [weightOptions, setWeightOptions] = useState(null);


 

  useEffect(() => {
    const options = {
      tooltip: {
        trigger: 'item'
      },
      legend: {
        show: false,
        top: '5%',
        left: 'center'
      },
      
      series: [
        {
          name: 'Metric',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '70%'],
          
          // adjust the start and end angle
          startAngle: 180,
          endAngle: 360,
          data: [
            { value: weights.skills, name: "Skills" },
            { value: weights.work_experience, name: 'Work Experience' },
            { value: weights.projects, name: 'Projects' },
            { value: weights.education, name: 'Education' },
            { value: weights.certifications, name: 'Certification' }
          ]
        }
      ]
    };

    setWeightOptions(options)
  }, [weights])

  // Configuration options for the bar chart



  function handleInputChange(field, value) {

    setWeights(prevWeights => {
      const updatedWeights = {
        ...prevWeights,
        [field]: value ? parseInt(value) : null
      };
      // Calculate the new total by summing up all weights
      updatedWeights.total = 0
      const newTotal = Object.values(updatedWeights).reduce((acc, curr) => acc + curr, 0);
      updatedWeights.total = newTotal;

      return updatedWeights;
    });
  }



  return (
    <div className='border-b border-gray-900/10 pb-12 mt-4' >
      {
        weightOptions &&
        <div className='sm:max-w-lg ' style={{ height: '150px'}}>
          <ReactEcharts 
          option={weightOptions} 
          notMerge={true}
          lazyUpdate={true}
          style={{ height: '180px'}} />
        </div>
      }
      <div className='flex flex-wrap gap-5 mt-5'>
        <div className='flex flex-col justify-center items-center gap-3 '>
          <input type="number" min={0} max={10} className='w-16 px-3 block  rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6' value={weights.skills} onChange={(e) => handleInputChange('skills', e.target.value)} />
          <label className=' text-sm'>Skills</label>
        </div>

        <div className='flex flex-col justify-center items-center gap-3 '>
          <input type="number" min={0} max={10} className='w-16 px-3 block  rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6' value={weights.work_experience} onChange={(e) => handleInputChange('work_experience', e.target.value)} />

          <label className='text-sm'>Experience</label>
        </div>
        <div className='flex flex-col justify-center items-center gap-3 '>
          <input type="number" min={0} max={10} className='w-16 px-3 block  rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6' value={weights.projects} onChange={(e) => handleInputChange('projects', e.target.value)} />

          <label className='text-sm'>Projects</label>
        </div>
        <div className='flex flex-col justify-center items-center gap-3'>
          <input type="number" min={0} max={10} className='w-16 px-3 block  rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6' value={weights.education} onChange={(e) => handleInputChange('education', e.target.value)} />

          <label className='text-sm'>Education</label>
        </div>
        <div className='flex flex-col justify-center items-center gap-3'>
          <input type="number" min={0} max={10} className='w-16 px-3 block  rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6' name='certifications' value={weights.certifications} onChange={(e) => handleInputChange('certifications', e.target.value)} />

          <label className='text-sm'>Certifications</label>
        </div>
        <div className='flex flex-col justify-center items-center gap-3'>
          <label className={`${weights.total !== 10 ? 'bg-red-100' : 'bg-sky-100'} text-center w-16 px-3 block font-medium rounded-md border-0 py-1.5 text-gray-900  shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6`}>
            {weights.total}
          </label>

          <label className='text-sm'>Total</label>
        </div>
        {
          weights.total !== 10 &&
          <div className='flex flex-col justify-start items-start gap-3'>
          <label title='Cumulative weight of all metrics must be 10' className=' px-3 block font-medium rounded-md  py-1.5 text-red-600 bg-gray-50 shadow-sm sm:text-sm sm:leading-6'>
            <i class="fa fa-exclamation-triangle" aria-hidden="true"></i> <span className='text-gray-600 text-xs'>Cumulative weight of all metrics must be 10</span>
          </label>

        </div>
        }
      </div>

 
    </div>
  );
}

export default ScoreWeights;
