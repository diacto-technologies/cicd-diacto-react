import Xarrow, { useXarrow, Xwrapper } from "react-xarrows";
import { PlusCircleIcon, PlusIcon, XMarkIcon } from "@heroicons/react/20/solid";
import MiniCard from "./MiniCard";
import { Droppable } from "./Droppable";
import { Fragment } from "react";
import "./Workflow.css";
import { CheckIcon } from "@heroicons/react/24/outline";
const EditableWorkflow = ({
  saving,
  addRound,
  containers,
  currentContainer,
  onContainerChange,
  removeContainer,
}) => {
  const updateXarrow = useXarrow();

  return (
    <>
      <Xwrapper>
        {saving ? (
          <div className="w-full h-full p-4 flex space-x-10 items-center justify-center bg-gray-50 opacity-75 rounded-lg border ">
            <label className="text-base ">Saving...</label>
          </div>
        ) : (
          <div className="w-full h-full relative ps-8 p-4 workflow-container pt-20">
            {/* <button className='absolute top-3 right-3 bg-primary-600 px-3 py-2 rounded-lg shadow-md text-white text-sm' onClick={addRound}>Add Round</button> */}

            <div className="w-full  flex flex-col gap-10 items-center justify-start relative ps-8 p-4 overflow-auto h-full flex-grow">
              {containers.map((item, index) => (
                <Fragment key={item.id}>
                  <Droppable
                    className="rounded-xl border-0"
                    key={item.order}
                    id={item.id}
                  >
                    {item.content ? (
                      <div
                        id={item.id}
                        onClick={() => onContainerChange(item)}
                        className="relative flex flex-col items-center justify-center"
                      >
                        <div className="flex gap-2">
                          <div className="relative flex flex-col items-center justify-center">
                            <MiniCard
                              id={item.id + "-card"}
                              item={item.content}
                              current={
                                currentContainer &&
                                item.id === currentContainer?.id
                                  ? true
                                  : false
                              }
                            />
                            <button
                              onClick={() => removeContainer(item.id)}
                              className="absolute top-2 right-2"
                            >
                              <span>
                                <XMarkIcon className="w-5 h-5  rounded-full text-red-500 " />
                              </span>
                            </button>
                            <label className="text-sm mt-2">
                              Round {index + 1}
                            </label>
                          </div>
                          <div className="flex flex-col gap-2">
                            <div className="rounded-md bg-white p-2 ring-2 ring-gray-300">
                              <label className="text-[.8rem] text-gray-700"><CheckIcon className="w-4 h-4 text-green-500 inline-flex" /> Rules applied</label>
                            </div>
                            <div className="rounded-md bg-white p-2 ring-2 ring-gray-300">
                              <label className="text-[.8rem] text-gray-700"><CheckIcon className="w-4 h-4 text-green-500 inline-flex" /> Alerts Set</label>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        id={item.id}
                        className="relative flex flex-col items-center justify-center"
                      >
                        <button
                          onClick={() => removeContainer(item.id)}
                          className="absolute top-2 right-2"
                        >
                          <span>
                            <XMarkIcon className="w-5 h-5  rounded-full text-red-500 " />
                          </span>
                        </button>
                        <div
                          id={item.id + "-card"}
                          className="flex items-center justify-center w-72 h-24 bg-gray-50 text-gray-700 shadow-sm rounded-lg border"
                        >
                          <label className="font-medium">Drop here</label>
                        </div>
                        <label className="text-sm mt-2">
                          Round {index + 1}
                        </label>
                      </div>
                    )}
                  </Droppable>
                  {index === containers?.length - 1 && (
                    <button
                      title="Add Round"
                      className="flex items-center justify-center px-2 py-1.5 bg-indigo-500 shadow-sm ring-1 rounded-lg hover:scale-110 transition-all duration-75 text-white text-sm"
                      onClick={addRound}
                    >
                      <PlusIcon className="w-5 h-5" />
                    </button>
                  )}
                  {index > 0 && (
                    <Xarrow
                      key={index}
                      start={"step-" + index}
                      end={containers[index]?.id}
                      color={"#4361ee"}
                      strokeWidth={2}
                      curveness={1}
                    />
                  )}
                </Fragment>
              ))}
            </div>
          </div>
        )}
      </Xwrapper>
    </>
  );
};

export default EditableWorkflow;
