import { Fragment } from 'react'
import {
  BriefcaseIcon,
  CalendarIcon,
  CheckBadgeIcon,
  CheckIcon,
  ChevronDownIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  LinkIcon,
  MapPinIcon,
  PaperAirplaneIcon,
  PencilIcon,
  XMarkIcon,
} from '@heroicons/react/20/solid'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Transition } from '@headlessui/react';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { DocumentCheckIcon, PrinterIcon, UsersIcon } from '@heroicons/react/24/solid';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Heading({ userDetails, jobDetail, publishJob, loading, domain }) {



  const copyToClipboard = () => {

    const url = `https://app.candidhr.ai/app/candidate/${jobDetail.encrypted}/`
    // navigator.clipboard.writeText(url)
    //   .then(() => {
    //     toast.success('URL copied to clipboard', {
    //       className: 'text-sm',
    //       position: "top-right",
    //       autoClose: 1000,
    //       hideProgressBar: true,
    //       closeOnClick: true,
    //       pauseOnHover: true,
    //       draggable: true,
    //       theme: "light",
    //     });
    //     console.log('Text copied to clipboard:', url);
    //   })
    //   .catch((err) => {
    //     console.error('Unable to copy text to clipboard', err);
    //   });

    if (navigator.clipboard) {
      navigator.clipboard.writeText(url)
        .then(() => {
          toast.success('Job Form URL copied to clipboard', {
            className: 'text-sm',
            position: "top-right",
            autoClose: 1000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "light",
          });
          console.log('Text copied to clipboard:', url);
        })
        .catch((err) => {
          console.error('Unable to copy text to clipboard', err);
        });
    } else {
      // Fallback for browsers that do not support navigator.clipboard
      const tempInput = document.createElement("input");
      tempInput.value = url;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand("copy");
      document.body.removeChild(tempInput);

      toast.success('URL copied to clipboard', {
        className: 'text-sm',
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
      console.log('Text copied to clipboard:', url);
    }
  };

  return (
    <div className="lg:flex lg:items-center lg:justify-between px-4 py-2">
      <div className="min-w-0 flex-1 mt-3">
        <h2 className="text-2xl flex font-semibold leading-7 text-gray-900 sm:truncate sm:text-2xl sm:tracking-normal">
          {jobDetail.title}  {jobDetail.published ? <CheckBadgeIcon className="mx-1.5 h-5 w-4 flex-shrink-0 text-green-700" /> : false}
        </h2>

        {/* Job Details  */}
        <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <BriefcaseIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
            {
              loading ?
                <div className='animate-pulse'>
                  <div className="h-5 bg-gray-200 rounded-lg  w-20 "></div>
                </div>
                :
                jobDetail.employment_type
            }

          </div>
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <MapPinIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />

            {
              loading ?
                <div className='animate-pulse'>
                  <div className="h-5 bg-gray-200 rounded-lg  w-20 "></div>
                </div>
                :
                jobDetail.location
            }
          </div>
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <DocumentCheckIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />

            {
              loading ?
                <div className='animate-pulse'>
                  <div className="h-5 bg-gray-200 rounded-lg  w-20 "></div>
                </div>
                :
                `${jobDetail.min_experience} to ${jobDetail.max_experience} years`
            }
          </div>
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <CalendarIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />

            {
              loading ?
                <div className='animate-pulse'>
                  <div className="h-5 bg-gray-200 rounded-lg  w-20 "></div>
                </div>
                :
                `Closing on ${new Date(jobDetail.close_date).toDateString()}`
            }
            {
              new Date() > new Date(jobDetail.close_date) &&
              <span className={`ms-2 cursor-default inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10 `}><ExclamationTriangleIcon className='me-2 h-6 w-5' /> Job Closed</span>

            }
          </div>
        </div>
      </div>
      <div className="mt-5 flex lg:ml-4 lg:mt-0">
        {
          userDetails?.role !== "Participant" &&
          <span className="hidden sm:block">
            {/* <Link
              to={`/app/user/jobs/edit-job/${jobDetail.id}/1/`}
              className="inline-flex truncate justify-center items-center rounded-md px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm  bg-white ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              <PencilIcon className="-ml-0.5 mr-1.5 h-4 w-4 text-gray-400" aria-hidden="true" />
              Edit
            </Link> */}

            <Menu as="div" className="relative inline-block text-left">
              <div>
                <MenuButton className="inline-flex w-full justify-center items-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                <PencilIcon className="-ml-0.5 mr-1.5 h-4 w-4 text-gray-400" aria-hidden="true" />
                  Edit
                  <ChevronDownIcon aria-hidden="true" className="-mr-1 size-5 text-gray-400" />
                </MenuButton>
              </div>

              <MenuItems
                transition
                className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
              >
                <div className="py-1">
                  <MenuItem>
                    <a
                      href={`/app/user/jobs/edit-job/${jobDetail.id}/1/`}
                      className="block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none"
                    >
                      Job Details
                    </a>
                  </MenuItem>
                  <MenuItem>
                    <a
                      href={`/app/user/jobs/edit-job/${jobDetail.id}/2/`}
                      className="block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none"
                    >
                      Customize Questions
                    </a>
                  </MenuItem>
                  <MenuItem>
                    <a
                      href={`/app/user/jobs/edit-job/${jobDetail.id}/3/`}
                      className="block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none"
                    >
                      Share With Users
                    </a>
                  </MenuItem>
                  <MenuItem>
                    <a
                      href={`/app/user/jobs/edit-job/${jobDetail.id}/4/`}
                      className="block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none"
                    >
                      Customize Workflow
                    </a>
                  </MenuItem>
                  {/* <form action="#" method="POST">
                    <MenuItem>
                      <button
                        type="submit"
                        className="block w-full px-4 py-2 text-left text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none"
                      >
                        Assessment Workflow
                      </button>
                    </MenuItem>
                  </form> */}
                </div>
              </MenuItems>
            </Menu>
          </span>
        }

        <span title='Copy job url and share it with candidates to accept applications' className="ml-3 hidden sm:block">
          <button
            onClick={copyToClipboard}
            // to={`/candidate/${jobDetail.encrypted}`}
            // type="button"
            className="inline-flex truncate justify-center items-center rounded-md px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm  bg-white ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            <LinkIcon className="-ml-0.5 mr-1.5 h-4 w-4 text-gray-400" aria-hidden="true" />
            Copy URL
          </button>
        </span>
        {
          userDetails?.role !== "Participant" &&
          <span title='Publish the job to make it accessible via job url' className="sm:ml-3">
            <button
              onClick={() => publishJob(jobDetail)}
              type="button"
              className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm ${jobDetail.published ? `bg-red-500 hover:bg-red-500 focus-visible:outline-red-500` : `bg-sky-500 hover:bg-sky-500 focus-visible:outline-sky-500`}  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 `}
            >
              {jobDetail.published ? <XMarkIcon className="mr-1.5 h-4 w-4 flex-shrink-0 text-white" /> : <PaperAirplaneIcon className="mr-1.5 h-4 w-4 flex-shrink-0 text-white" />}
              {jobDetail.published ? "Unpublish" : "Publish"}
            </button>
          </span>}


        {/* Dropdown */}
        <Menu as="div" className="relative ml-3 sm:hidden">
          <Menu.Button className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:ring-gray-400">
            More
            <ChevronDownIcon className="-mr-1 ml-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
          </Menu.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 z-10 -mr-1 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              {
                userDetails?.role !== "Participant" &&
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      to={`/app/user/jobs/edit-job/${jobDetail.id}/1/`}
                      className={classNames(active ? 'bg-gray-100' : '', 'flex px-4 py-2 text-sm text-gray-700')}
                    >
                      <PencilIcon className="-ml-0.5 mr-1.5 h-4 w-4 text-gray-400" aria-hidden="true" />
                      Edit
                    </Link>
                  )}
                </Menu.Item>
              }
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={copyToClipboard}
                    className={classNames(active ? 'bg-gray-100' : '', 'flex px-4 py-2 text-sm text-gray-700')}
                  >
                    <LinkIcon className="-ml-0.5 mr-1.5 h-4 w-4 text-gray-400" aria-hidden="true" />
                    Copy URL
                  </button>
                )}
              </Menu.Item>

            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </div>
  )
}
