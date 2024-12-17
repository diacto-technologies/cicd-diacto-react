import { BriefcaseIcon, CalendarIcon, CheckBadgeIcon, CurrencyDollarIcon, DocumentCheckIcon, ExclamationTriangleIcon, MapPinIcon, UserCircleIcon } from "@heroicons/react/20/solid";

const CandidateFormHeading = ({ jobDetail }) => {

    const loading = false
    return (
        <>
            {/* <div className="lg:flex w-full lg:items-center lg:justify-between px-4 py-2">
                <div className="min-w-0 flex-1">
                    <h2 className="text-xl font-bold leading-7 text-gray-900 sm:truncate sm:text-2xl sm:tracking-normal">
                        {jobDetail.title}
                    </h2>
                    <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                            <BriefcaseIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                            {jobDetail.employment_type}
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                            <MapPinIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                            {jobDetail.location}
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                            <DocumentCheckIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                            {jobDetail.min_experience} to {jobDetail.max_experience} years

                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                            <CalendarIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                            Posted on {new Date(jobDetail.created_at).toDateString()}

                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                            <CalendarIcon className="mr-1.5 h-5 w-8 flex-shrink-0 text-gray-400" aria-hidden="true" />
                            Closing on {new Date(jobDetail.close_date).toDateString()}
                        </div>
                    </div>
                </div>

            </div> */}

            <div className="min-w-0 flex-1">
                <h2 className=" text-xl flex font-semibold leading-7 text-gray-900 sm:truncate sm:text-2xl sm:tracking-normal">
                    {jobDetail.title}
                </h2>

                {/* Job Details  */}
                <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                        <BriefcaseIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                        {
                            loading ?
                                <div className='animate-pulse'>
                                    <div class="h-5 bg-gray-200 rounded-lg  w-20 "></div>
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
                                    <div class="h-5 bg-gray-200 rounded-lg  w-20 "></div>
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
                                    <div class="h-5 bg-gray-200 rounded-lg  w-20 "></div>
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
                                    <div class="h-5 bg-gray-200 rounded-lg  w-20 "></div>
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
        </>
    )
}

export default CandidateFormHeading;