import Select, { components } from 'react-select';
import DetailMiniCard from "../interviews/DetailMiniCard";
import Xarrow, { useXarrow, Xwrapper } from 'react-xarrows';
import { useContext, useState } from 'react';
import AuthContext from '../../context/AuthContext';
import { useAsync } from 'react-select/async';


const AssignedWorkflow = ({ jobId, selectedCandidate, selectedRow, selectedWorkflow, setSelectedWorkflow, workflows }) => {
    const updateXarrow = useXarrow();
    const [error, setError] = useState({});
    const { authTokens } = useContext(AuthContext);
    const [tempWorkflow, setTempWorkflow] = useState(null);
    const [editMode, setEditMode] = useState(false)
    const Option = props => {
        return (
            <components.Option {...props}>
                <div className="text-gray-700/80 font-medium">{props.data.label}</div>
                {console.log(props.data)}
                <div className="text-gray-600/80" style={{ fontSize: '.65rem', color: '' }}>{props?.data.steps_json?.length || 0} Rounds </div>
            </components.Option>
        );
    };

    const onWorkflowChange = (selectedOption) => {
        console.log(selectedOption)
        setTempWorkflow(selectedOption)
    }

    const assignWorkflow = async () => {
        const jobFormUrl = `/jobs/job/${jobId}/`;

        try {
            setError(null)
            const response = await fetch(jobFormUrl, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: "Bearer " + String(authTokens.access),
                },
                body: JSON.stringify({ interview_module: tempWorkflow.id }),

            });

            if (response.ok) {
                const data = await response.json();
                console.log("data : ", data)
                setSelectedWorkflow(tempWorkflow)
                setTempWorkflow(null)
                setEditMode(false)
                // setSuccessMessage('Assigned workflow successful!');
                setError({});
                // history(`/app/user/jobs/job/${data.id}/overview`)
                // Reset the form here if needed
            } else {

            }
        } catch (error) {
            console.error('Assigning workflow failed:', error.message);
        }
    }

   console.log("selectedCandidate : ", selectedCandidate)


    return (
        <>
            <Xwrapper>
                <div className="flex justify-between space-x-4 w-full h-64 p-4 md:p-3 description-card bg-white rounded-lg shadow-md">
                    {selectedWorkflow ?
                        <div className='w-full overflow-x-auto relative h-full bg-blue-100 rounded-lg border '>
                            <div className='bg-white bg-opacity-85 w-full py-1.5 px-3 flex justify-between items-center shadow-sm'>
                                <label className='text-base font-medium text-gray-700 '>{selectedCandidate ? selectedCandidate.name : 'Select a candidate'}</label>

                                {
                                    editMode ?
                                        <div className="flex space-x-3 w-96 items-center mb:md-0 ">
                                            <Select
                                                className="w-5/6 text-xs"
                                                // styles={selectStyle}
                                                components={{ Option }}
                                                // value={selectedFilterGroup}
                                                // isClearable
                                                onChange={onWorkflowChange}
                                                options={workflows || []}
                                                // defaultValue={filterGroupList[0]}
                                                placeholder="Assign a workflow"
                                            />
                                            <button
                                                disabled={!tempWorkflow}
                                                onClick={assignWorkflow}
                                                className="w-16 h-9 px-3 inline-flex justify-center items-center rounded-md text-xs font-medium text-white shadow-sm bg-primary-600 hover:bg-sky-500 focus-visible:outline-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
                                                Apply
                                            </button>
                                            <button
                                                onClick={() => setEditMode(false)}
                                                className="w-16 h-9 px-3 inline-flex justify-center items-center rounded-md text-xs font-medium text-sky-500 ring-1 bg-white outline-2 outline-sky-500  ">
                                                Cancel
                                            </button>
                                        </div>
                                        :
                                        <div className=''>
                                            <label className='me-3 text-sm font-medium text-blue-700 '>{selectedWorkflow ? selectedWorkflow.name : 'Select a workflow'}</label>
                                            <button onClick={() => setEditMode(true)} className=' bg-primary-600 px-3 py-2 rounded-lg shadow-md text-white text-sm' >Edit</button>
                                        </div>
                                }
                            </div>

                            <div className='mt-2  w-full overflow-x-auto relative p-4 flex space-x-16 rounded-lg'>
                                {selectedWorkflow && selectedWorkflow.steps_json.map((step, index) => (
                                    <>
                                        <div className=' flex flex-col items-center justify-center '>
                                            {/* <button className='absolute -top-2 -right-2'><span ><XMarkIcon className='w-4 h-4 p-0.5 rounded-full bg-red-500 text-white ' /></span></button> */}
                                            <DetailMiniCard updateXarrow={updateXarrow} id={step.id} item={step} candidate={selectedCandidate} selectedRow={selectedRow} selectedWorkflow={selectedWorkflow} />
                                            <label className='text-sm mt-2 font-semibold text-gray-700'>Round {step.order}</label>
                                            {/* {selectedCandidate ? selectedCandidate.interview_steps.find(round => round.service.name === step.content.label)?.completed  ? <span className="text-xs text-teal-700 inline-flex items-center"><CheckBadgeIcon className="mx-1 h-5 w-4 flex-shrink-0 text-teal-500" />Completed</span>: <span className="text-xs text-yellow-800 inline-flex items-center"><ClockIcon className="mx-1 h-5 w-4 flex-shrink-0 text-yellow-400" />Pending</span> : null} */}
                                        </div>
                                        {
                                            index > 0 && (
                                                <>
                                                    <Xarrow key={index} start={("step-" + index)} end={(selectedWorkflow.steps_json[index]?.id)} color={"#4361ee"} strokeWidth={2} curveness={1} />
                                                </>
                                            )

                                        }
                                    </>
                                ))}

                            </div>


                        </div>
                        :
                        <div className="w-full relative p-4 flex  space-x-10 items-center justify-evenly h-full bg-blue-100 rounded-lg border ">
                            <div className="flex space-x-3 w-96 items-center mb-3 mb:md-0 ">
                                <Select
                                    className="w-5/6 text-xs"
                                    // styles={selectStyle}
                                    components={{ Option }}
                                    // value={selectedFilterGroup}
                                    // isClearable
                                    onChange={onWorkflowChange}
                                    options={workflows || []}
                                    // defaultValue={filterGroupList[0]}
                                    placeholder="Assign a workflow"
                                />
                                <button
                                    onClick={assignWorkflow}
                                    className="w-16 h-9 px-3 inline-flex justify-center items-center rounded-md text-xs font-medium text-white shadow-sm bg-primary-600 hover:bg-sky-500 focus-visible:outline-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
                                    Apply
                                </button>
                            </div>
                        </div>}
                </div>
            </Xwrapper>
        </>
    );
}

export default AssignedWorkflow;