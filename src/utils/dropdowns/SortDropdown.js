import { Fragment, useState } from 'react'
import { Popover, Transition } from '@headlessui/react';
import { ChevronDownIcon, PhoneIcon, PlayCircleIcon } from '@heroicons/react/20/solid'
function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

const SortDropdown = ({ dropdownItems, handleAscSort, handleDescSort }) => {

    const [selectedField, setSelectedField] = useState('')
    const [selectedSort, setSelectedSort] = useState('')

    return (
        <Popover className="me-2 bg-white py-1 border rounded-md px-2">
            <Popover.Button className="inline-flex items-center gap-x-1 text-sm font-semibold leading-6 text-gray-900 focus:outline-none">
                <span><i className="fa-solid fa-sort"></i></span>
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
                <Popover.Panel className="absolute z-10 h-10  w-48 -translate-x-1/2 translate-y-1">
                    <div className="text-start w-full  p-2  overflow-hidden rounded-md bg-white text-sm leading-6 shadow-lg ring-1 ring-gray-900/5">

                        {dropdownItems.length > 0 &&
                            dropdownItems.map((item, index) => (

                                <div key={index} className="w-full relative flex gap-x-6 rounded-lg p-2 hover:bg-gray-50">

                                    <div className='flex w-full justify-between items-center'>
                                        <label>{item.label}</label>
                                        <div>
                                            <button onClick={() => {setSelectedField(item.value);setSelectedSort('ascending');handleAscSort(item.value)}} className={`me-1 border px-2 text-center rounded-md  ${selectedField === item.value && selectedSort === 'ascending' ? 'bg-sky-300 text-white'  : 'bg-white text-black'}`}><i className="fa-solid fa-arrow-up"></i></button>
                                            <button onClick={() => {setSelectedField(item.value);setSelectedSort('descending');handleDescSort(item.value)}} className={`me-1 border px-2 text-center rounded-md ${selectedField === item.value && selectedSort === 'descending' ? 'bg-sky-300 text-white' : 'bg-white text-black'}`}><i className="fa-solid fa-arrow-down"></i></button>
                                        </div>

                                    </div>
                                </div>
                            ))}



                    </div>

                </Popover.Panel>
            </Transition>
        </Popover>
    )
}

export default SortDropdown;
