import { useState, useRef, useContext } from 'react';
import { Popover, PopoverButton, PopoverPanel ,useClose } from '@headlessui/react';
import { ChevronDownIcon, PlusIcon, TrashIcon } from '@heroicons/react/20/solid';
import Select from 'react-select';
import AuthContext from '../../context/AuthContext';
import AvatarContext from '../../context/AvatarContext';
import AddCommentForm from './AddCommentForm';

const AddComment = ({setComments,jobId, candidate, user }) => {
    
    const buttonRef = useRef(null);
    
    return (
        <>
            <Popover className="relative " >
                <div className="inline-flex items-center gap-x-1 text-sm font-semibold leading-6 text-gray-900"
                >
                    <PopoverButton
                        ref={buttonRef}
                        className="inline-flex bg-blue-600/80 hover:bg-blue-400 items-center justify-center text-center h-8 w-8 rounded-full ring-1 ring-gray-600/20"
                    >
                        <PlusIcon className='w-6 text-white' />
                    </PopoverButton>
                </div>

                <PopoverPanel
                    anchor="top"
                    className="absolute left-1/2 z-40 flex w-auto overflow-hidden translate-x-1/4 max-w-max px-4 py-2 transition data-[closed]:translate-y-1 data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-150 data-[enter]:ease-out data-[leave]:ease-in"

                >
                    <AddCommentForm setComments={setComments} jobId={jobId} user={user} candidate={candidate} />
                </PopoverPanel>

            </Popover>
        </>
    );
}

export default AddComment;