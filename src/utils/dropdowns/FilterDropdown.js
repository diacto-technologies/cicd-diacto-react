import { Link } from 'react-router-dom';
import { Fragment, useState } from 'react'
import { Popover, Transition } from '@headlessui/react';
import { ChevronDownIcon, PhoneIcon, PlayCircleIcon } from '@heroicons/react/20/solid'
import {
    ArrowPathIcon,
    ChartPieIcon,
    CursorArrowRaysIcon,
    FingerPrintIcon,
    SquaresPlusIcon,
} from '@heroicons/react/24/outline'

const FilterDropdown = ({ item, label, fieldName, handleSearch,searchTerm, setSearchTerm }) => {


    return (
        <Popover className="">
            <Popover.Button className="inline-flex truncate items-center gap-x-1 text-sm font-semibold leading-6 text-gray-900 focus:outline-none">
                <span>{label}</span>
                <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
            </Popover.Button>

            <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 translate-y-1"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-1"
            >
                <Popover.Panel className="absolute z-10 h-10 flex w-48 translate-x-3 translate-y-1">
                    <div className=" max-w-md flex p-2 justify-center items-center overflow-hidden rounded-md bg-white text-sm leading-6 shadow-lg ring-1 ring-gray-900/5">
                        <input
                            type='text' id={fieldName} name={fieldName} value={searchTerm[fieldName]} onChange={(e) => handleSearch(fieldName, e.target.value)}
                            className="block px-2 font-normal w-36 text-sm flex-1 border bg-transparent  text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                            
                        />
                    </div>
                </Popover.Panel>
            </Transition>
        </Popover>
    )
}

export default FilterDropdown;