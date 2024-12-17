import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { ComputerDesktopIcon, DocumentChartBarIcon, VideoCameraIcon } from '@heroicons/react/24/outline'
import { EllipsisVerticalIcon } from '@heroicons/react/24/solid'

export default function ServiceMenu() {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <MenuButton className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-1 py-1 text-sm font-semibold text-gray-900  hover:bg-gray-50">
          <EllipsisVerticalIcon className='w-6 h-6' />
          {/* <ChevronDownIcon aria-hidden="true" className="-mr-1 h-5 w-5 text-gray-400" /> */}
        </MenuButton>
      </div>

      <MenuItems
        transition
        className="absolute right-0 z-10 mt-12  origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
      >
        <div className="py-1 ">
            <label className='py-3 px-4 text-sm text-gray-500'>Options</label>
          <div className='flex gap-2 p-3 '>
          {/* <MenuItem >
            <div className="flex flex-col items-center justify-start p-2 rounded-md hover:bg-gray-50" >
            <DocumentChartBarIcon className='w-6 h-6' />
            <label
              
              className="text-center block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none"
            >
              Resume Screening
            </label>
            </div>
          </MenuItem> */}
          <MenuItem>
          <div className="flex flex-col items-center justify-start p-2 rounded-md hover:bg-gray-50" >
            <VideoCameraIcon className='w-6 h-6' />
            <label
              className="text-center block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none"
            >
              Automated Video Interview
            </label>
            </div>
          </MenuItem>
          <MenuItem>
          <div className="flex flex-col items-center justify-start p-2 rounded-md hover:bg-gray-50" >
            <ComputerDesktopIcon className='w-6 h-6' />
            <label
              
              className="text-center block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none"
            >
              Assessment
            </label>
            </div>
          </MenuItem>
         
          </div>
        </div>
      </MenuItems>
    </Menu>
  )
}
