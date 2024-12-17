import React, { useState, useEffect } from 'react';
import './ItemList.css'
import { Link } from 'react-router-dom';
import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { CheckBadgeIcon, EyeIcon, LinkIcon, PaperAirplaneIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/20/solid';


const ItemList = React.memo(({ job, handleViewJob, handleDeleteJob, handlePublish, handleCopyUrl, handleEditJob }) => {

    function classNames(...classes) {
        return classes.filter(Boolean).join(' ')
    }


    return (
        <>
            <div className={`bg-white flex justify-start custom-list-item w-full px-3 border-l-4 ${job.priority && job.priority == 1 ? 'border-rose-500' : 'border-sky-500'}`}>

                <div className="w-1/6 flex items-center justify-start  overflow-hidden">
                    <div className="text-sm truncate font-medium text-gray-800 hover:text-sky-500 hover:font-semibold"><Link to={`/app/user/jobs/job/${job.id}`}>{job.title}</Link></div>
                </div>
                <div className="w-1/6 flex items-center justify-center overflow-hidden">
                    <div className="text-sm truncate font-medium text-gray-800">{job.min_experience} - {job.max_experience} years</div>
                </div>
                <div className="w-1/6 flex items-center justify-center overflow-hidden">
                    <div className="text-sm truncate font-medium text-gray-800">{job.employment_type}</div>
                </div>
                <div className="w-1/6 flex items-center justify-center overflow-hidden">
                    <div className="text-sm truncate font-medium text-gray-800">{job.location}</div>
                </div>
                <div className="w-1/6 flex items-center justify-center overflow-hidden">
                    <div className="text-sm truncate font-medium text-gray-800">{new Date(job.close_date).toDateString()}</div>
                </div>
                <div className="w-1/6 p-4 flex items-center justify-center overflow-hidden">
                    <span className={`inline-flex items-center rounded-md  px-2 py-1 text-xs font-medium ${job.published ? 'text-green-700 bg-green-50 ring-1 ring-inset ring-green-600/20' : 'text-red-700 bg-red-50 ring-1 ring-inset ring-red-600/10'}`}>
                        {job.published ? <CheckBadgeIcon className="mr-1.5 h-5 w-4 flex-shrink-0 text-green-700" /> : false}
                        {job.published ? 'Published' : 'Not Published'}
                    </span>
                </div>
                {/* <div className="w-1/6 flex items-center justify-center">
                <Dropdown job={job} dropdownIcon={'fa-ellipsis-vertical'} dropdownItems={[{label : 'View',handler: handleViewJob()},{label : 'Edit',handler: handleEditJob()},{label : 'Publish',handler: handlePublish()},{label : 'Copy URL',handler: handleCopyUrl()},]} />

                </div> */}
                <div className="w-1/6 flex items-center justify-center">
                    <Menu as="div" className="relative inline-block text-left me-2">
                        <div>
                            <Menu.Button className="inline-flex w-full justify-center items-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                                <i className={`fa-solid fa-ellipsis-vertical text-slate-500`}></i>

                                {/* <ChevronDownIcon className="-mr-1 h-5 w-5 text-gray-400" aria-hidden="true" /> */}
                            </Menu.Button>
                        </div>

                        <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                        >
                            <Menu.Items className="absolute right-0 divide-y divide-gray-200 z-10 mt-2 w-44 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                <div className="py-1">
                                    <Menu.Item>
                                        {({ active }) => (
                                            <button
                                                onClick={() => handleViewJob(job.id)}
                                                className={classNames(
                                                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                                    'flex px-4 py-2 text-sm w-full text-start'
                                                )}
                                            >
                                                <EyeIcon className="mr-1.5 h-5 w-4 flex-shrink-0 text-slate-800" />
                                                View
                                            </button>
                                        )}
                                    </Menu.Item>
                                    <Menu.Item>
                                        {({ active }) => (
                                            <button
                                                onClick={() => handleEditJob(job.id)}
                                                className={classNames(
                                                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                                    'flex px-4 py-2 text-sm w-full text-start'
                                                )}
                                            >
                                                <PencilIcon className="mr-1.5 h-5 w-4 flex-shrink-0 text-slate-800" />
                                                Edit
                                            </button>
                                        )}
                                    </Menu.Item>
                                    <Menu.Item >
                                        {({ active }) => (
                                            <button
                                                onClick={() => handleDeleteJob(job)}
                                                className={classNames(
                                                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                                    'flex px-4 py-2 text-sm w-full text-start'
                                                )}
                                            >
                                                <TrashIcon className="mr-1.5 h-5 w-4 flex-shrink-0 text-slate-800" />
                                                Delete
                                            </button>
                                        )}
                                    </Menu.Item>
                                </div>
                                <div className='py-1'>
                                    <Menu.Item>
                                        {({ active }) => (
                                            <button
                                                onClick={() => handlePublish(job)}
                                                className={classNames(
                                                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                                    'flex px-4 py-2 text-sm w-full text-start'
                                                )}
                                            >
                                                {job.published ? <XMarkIcon className="mr-1.5 h-5 w-4 flex-shrink-0 text-slate-800" /> : <PaperAirplaneIcon className="mr-1.5 h-5 w-4 flex-shrink-0 text-slate-800" />}
                                                {job.published ? "Unpublish" : "Publish"}
                                            </button>
                                        )}
                                    </Menu.Item>
                                    <Menu.Item >
                                        {({ active }) => (
                                            <button

                                                onClick={() => handleCopyUrl(job)}
                                                className={classNames(
                                                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                                    'flex px-4 py-2 text-sm w-full text-start'
                                                )}
                                            >
                                                <LinkIcon className="mr-1.5 h-5 w-4 flex-shrink-0 text-slate-800" />
                                                Copy URL
                                            </button>
                                        )}
                                    </Menu.Item>
                                </div>
                            </Menu.Items>
                        </Transition>
                    </Menu>
                </div>

            </div>
        </>
    );
})

export default ItemList;