import React from 'react';
const TestEnd =({text})=>{

    return (
        <>
         <div className="h-screen w-full flex items-center justify-center bg-transparent md:bg-gray-50 lg:px-14 lg:py-5">
                <div className="background-svg bottom-0">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
                        <path fill="#0099ff" fillOpacity="1" d="M0,64L48,53.3C96,43,192,21,288,64C384,107,480,213,576,229.3C672,245,768,171,864,165.3C960,160,1056,224,1152,234.7C1248,245,1344,203,1392,181.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                    </svg>
                </div>
                <section className="relative h-full w-full isolate overflow-hidden  sm:py-32 lg:px-12 flex items-center justify-center">
                                {/* <div class="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.100),white)] opacity-20"></div>
                                   <div class="absolute inset-y-0 right-1/2 -z-10 mr-16 w-[200%] origin-bottom-left skew-x-[-30deg] bg-white shadow-xl shadow-indigo-600/10 ring-1 ring-indigo-50 sm:mr-28 lg:mr-0 xl:mr-16 xl:origin-center"></div> */}
                                <div className="mx-auto max-w-2xl lg:max-w-4xl ">
                                    {/* <img class="mx-auto h-12" src="https://tailwindui.com/img/logos/workcation-logo-indigo-600.svg" alt="" /> */}
                                    
                                    <figure className="mt-10">
                                        <blockquote className="text-center text-2xl font-semibold leading-8 text-gray-900 sm:text-3xl sm:leading-9">
                                            {text?(

                                                <p className="text-3xl" >{text}</p>
                                            ):(
                                                <p className="text-3xl" >Your response has been submitted</p>

                                            )}
                                            <p className="text-base text-gray-500 mt-5">Our team will update you with further steps.</p>
                                        </blockquote>

                                    </figure>
                                </div>
                            </section>
        </div>
        </>

    )
}
export default TestEnd;