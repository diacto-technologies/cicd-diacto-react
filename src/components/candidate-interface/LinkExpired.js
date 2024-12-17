const LinkeExpired = ({ error, validFrom, validTo }) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true };
    return (
        <>
            <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-[#7474f4] to-[#a5a5fa] px-6 py-12 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 z-0"></div>
                <div class="background-svg bottom-0">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
                        <path fill="#7474f4" fill-opacity="1" d="M0,64L48,53.3C96,43,192,21,288,64C384,107,480,213,576,229.3C672,245,768,171,864,165.3C960,160,1056,224,1152,234.7C1248,245,1344,203,1392,181.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                    </svg>
                </div>
                <div className="relative z-10 bg-white shadow-lg rounded-lg overflow-hidden w-full max-w-3xl p-8">
                    {/* <div class="page-404 grid h-screen w-full place-items-center relative px-6 py-24 sm:py-32 lg:px-8"> */}

                    <div class="text-container relative z-10 ">
                        {error === "Page not found" && <p class="text-base font-semibold text-sky-600">404</p>}
                        {
                            error &&
                            <>
                                <h1 class="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl w-full text-center">{error}</h1>
                                {error === "Page not found" && <p class="mt-6 text-base leading-7 text-gray-600  w-full text-center">Sorry, we couldn’t find the page you’re looking for.</p>}
                                {error === "Assessment Link Invalid" && <p class="mt-6 text-base leading-7 text-gray-600 w-full text-center">The test is valid from {validFrom?.toLocaleString('en-US', options)} to {validTo?.toLocaleString('en-US', options)}</p>}
                            </>
                        }
                    </div>
                </div>
            </div>
        </>
    );
}

export default LinkeExpired;