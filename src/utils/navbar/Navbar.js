import { Fragment, useContext } from 'react'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'
import AuthContext from '../../context/AuthContext'
import { ChevronDownIcon, LinkIcon, PencilIcon, UserIcon } from '@heroicons/react/20/solid'
import { Link } from 'react-router-dom'
import DefaultImg from "../../assets/user.png"
import LogoWhite1 from "../../assets/PNG/icon_whiteB.png"

import FeedbackList from '../../components/applicants/CommentsQuickList'

const navigation = [
  //   { name: 'Dashboard', href: '#', current: true },
  //   { name: 'Team', href: '#', current: false },
  //   { name: 'Projects', href: '#', current: false },
  //   { name: 'Calendar', href: '#', current: false },
  //   { name: 'Reports', href: '#', current: false },
]


const userNavigation = [
  { name: 'Your Profile', href: '#' },
  { name: 'Settings', href: '#' },
  { name: 'Sign out', href: '#' },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

const Navbar = ({ mobileSidebarOpen, setMobileSidebarOpen }) => {
  const { logoutUser, userDetails } = useContext(AuthContext);
  // console.count("Navbar rerender")


  

  return (
    <>

      <nav className="fixed top-0 z-20 w-full bg-[rgb(27,46,105)] border-b border-gray-200  ">

        <div className="px-3 py-2 lg:px-5 lg:pl-3">

          <div className="flex items-center justify-between">
            <div className="flex items-center justify-start rtl:justify-end">
              <button onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                type="button" className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200  ">
                <span className="sr-only">Open sidebar</span>
                <svg className="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path clipRule="evenodd" fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"></path>
                </svg>
              </button>
              <Link to={`/app/user/jobs/`} className="flex ms-2 md:me-24">
                <img src={LogoWhite1} className="w-8 me-3" alt="CandidHR Logo" />
                <span className="self-center text-xl font-semibold  leading-3 text-white sm:text-2xl whitespace-nowrap ">CandidHR</span>
              </Link>
            </div>
            <div className="flex items-center">
              <div className="flex items-center ms-3">
                <Menu as="div" className="relative ml-3  flex items-center">
                <label className='text-sm me-1 text-white'>{userDetails?.name}</label>
                  <Menu.Button className="inline-flex items-center rounded-full 1 mx-2 text-sm font-semibold text-gray-900 shadow-md ">
                    <img className="w-8 h-8 rounded-full ring-2 ring-gray-400" src={userDetails?.profile_pic ? userDetails?.profile_pic : DefaultImg} alt="Avatar" />
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
                    <Menu.Items className="absolute top-8 right-2 z-10 -mr-1 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <Menu.Item>
                        {({ active }) => (
                          <Link
                            to={'/app/user/profile/'}
                            className={classNames(active ? 'bg-gray-100 w-full' : '', 'w-full flex px-4 py-2 text-sm text-gray-700')}
                          >
                            <UserIcon className="-ml-0.5 mr-1.5 h-4 w-4 text-gray-400" aria-hidden="true" />
                            Profile
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={logoutUser}
                            className={classNames(active ? 'bg-gray-100 w-full' : '', 'w-full flex px-4 py-2 text-sm text-gray-700')}
                          >
                            <LinkIcon className="-ml-0.5 mr-1.5 h-4 w-4 text-gray-400" aria-hidden="true" />
                            Sign Out
                          </button>
                        )}
                      </Menu.Item>

                    </Menu.Items>
                  </Transition>
                </Menu>
                
              </div>
            </div>
          </div>
        </div>

      </nav >

      
    </>
  )
}

export default Navbar;
