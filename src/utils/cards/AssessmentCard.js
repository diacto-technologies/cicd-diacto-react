import {
  ArrowDownRightIcon,
  ChevronDoubleRightIcon,
  ClockIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";
import React, { Fragment, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import { usePublishPreBuiltAssessment } from "../../constants/test/constants";
const Card = ({ item, editable }) => {
    const [assessment , setAssessment] = useState(null)
   const {publishPreBuiltAssessment,publishing} = usePublishPreBuiltAssessment();

   const [isPublished,setIsPublished] = useState(false)

   useEffect(() => {
    setAssessment(item)
   },[item])

   const updateAssessment = async(assessmentId, isPublished) => {
    const updatedAssessment = await publishPreBuiltAssessment(assessmentId, isPublished)
    console.log(updatedAssessment)
    // if (updatedAssessment) {
    setAssessment((updatedAssessment))   
    // }
   }


  return (
    <>
      <div className="relative  w-full md:w-[400px] h-44 flex flex-col justify-start items-start max-w-96 p-5 border border-gray-300 shadow-sm bg-white rounded-xl hover:shadow-md  transition-all duration-100">
        <label className={` font-medium text-gray-500`}> {assessment?.title}</label>
        <span
          className={`mb-5 text-sm text-wrap overflow-ellipsis font-normal text-gray-500 truncate max-w-[350px] h-9`}
        >
          This is a description of the pre built test lorem sdf sdf sd fsd fs
          dfdsfsdf sdfdssdf sfds fsdf sd
        </span>
        <div className="flex items-center ms-3 absolute right-2 top-3">
          <Menu as="div" className="relative ml-3 flex items-center">
            <MenuButton className="inline-flex items-center mx-2 text-sm font-semibold text-gray-900">
              <EllipsisVerticalIcon className="w-5 h-5" />
            </MenuButton>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <MenuItems className="absolute top-4 right-2 z-10 -mr-1 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <MenuItem>
                  {({ active }) => (
                    <Link
                      to={`/app/user/tests/prebuilt-assessment/${assessment.id}/view/`}
                      className={`${
                        active ? "bg-gray-100" : ""
                      } w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100`}
                    >
                      <EyeIcon
                        className="-ml-0.5 mr-1.5 h-4 w-4 text-gray-400"
                        aria-hidden="true"
                      />
                      View
                    </Link>
                  )}
                </MenuItem>

                {
                    editable &&
                    <>
                    <MenuItem>
                  {({ active }) => (
                    <Link
                      to={`/app/user/tests/prebuilt-assessment/${assessment.id}/`}
                      className={`${
                        active ? "bg-gray-100" : ""
                      } w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100`}
                    >
                      <PencilIcon
                        className="-ml-0.5 mr-1.5 h-4 w-4 text-gray-400"
                        aria-hidden="true"
                      />
                      Edit
                    </Link>
                  )}
                </MenuItem>

                <MenuItem>
                  {({ active }) => (
                    <button
                        disabled={publishing}
                      onClick={() => updateAssessment(assessment.id,assessment.is_published ? false : true)}
                      className={`${
                        active ? "bg-gray-100" : ""
                      } w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100`}
                    >
                      <ChevronDoubleRightIcon
                        className="-ml-0.5 mr-1.5 h-4 w-4 text-gray-400"
                        aria-hidden="true"
                      />
                      {publishing ? "Publishing" : assessment?.is_published ? "Unpublish" : "Publish"}
                    </button>
                  )}
                </MenuItem>
                    </>
                }
              </MenuItems>
            </Transition>
          </Menu>
        </div>
        {/* <button onClick={() =>  navigate(`/app/user/tests/test/${assessment.id}/view/ `)} className='text-blue-700 hover:text-blue-600 hover:border-b hover:border-blue-600 pb-1 text-sm absolute top-3 right-3'>View</button>
                {editable && <button onClick={() =>  navigate(`/app/user/tests/prebuilt-assessment/${assessment.id}/`)} className='text-blue-700 hover:text-blue-600 hover:border-b hover:border-blue-600 pb-1 text-sm absolute top-3 right-12 me-2'>Edit</button>} */}
        <div className="flex gap-2 overflow-hidden w-full ">
          {assessment?.category &&
            assessment.category.length > 0 &&
            assessment.category.map((cat) => (
              <span className="inline-flex text-nowrap items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                {cat?.name}
              </span>
            ))}
        </div>
        <div className="absolute bottom-0 left-0 flex justify-end gap-2 p-3 w-full bg-gray-50 border-t rounded-b-xl">
          <label className="text-[.8rem]  text-blue-700 truncate max-w-full">
            <span className="text-gray-500 me-1">
              <i class="fa-solid fa-gauge text-[16px]"></i>
            </span>{" "}
            {assessment?.difficulty?.difficulty}{" "}
          </label>
          <label className="text-[.8rem]  text-blue-700 truncate max-w-full">
            <span className="text-gray-500 me-1">Q</span>
            {assessment?.total_question}{" "}
          </label>
          <label className="text-[.8rem]  text-blue-700 truncate max-w-full">
            <ClockIcon className="w-4 h-4 text-gray-500 inline-flex" />{" "}
            {assessment?.time_duration}s
          </label>
        </div>
      </div>
    </>
  );
};

export default Card;
