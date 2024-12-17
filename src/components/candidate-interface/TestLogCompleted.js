import { HandThumbUpIcon } from "@heroicons/react/24/outline";
import { useParams } from "react-router-dom";

const TestLogCompleted = () => {
  const { statusCode } = useParams();

  const statusCodeMapping = {
    "200": "Thank You for Completing the Assessment",
    "201": "The test has been submitted due to a reload",
    "202": "Frequent full-screen exits have led to your disqualification",
    "203": "Frequent tab changes have led to your disqualification",
    "204": "Assessment Already Submitted",
  }

  if(localStorage.getItem("proctor")) localStorage.removeItem('proctor');
  return (
    <>
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-[#7474f4] to-[#a5a5fa] px-6 py-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 z-0"></div>
        <div class="background-svg bottom-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
            <path fill="#7474f4" fill-opacity="1" d="M0,64L48,53.3C96,43,192,21,288,64C384,107,480,213,576,229.3C672,245,768,171,864,165.3C960,160,1056,224,1152,234.7C1248,245,1344,203,1392,181.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
        <div className="relative z-10 bg-white shadow-lg rounded-lg overflow-hidden w-full max-w-3xl p-12">
          <div className="mx-auto max-w-2xl lg:max-w-4xl z-40 flex flex-col justify-center items-center">
            {/* <img className="mx-auto h-12" src="https://tailwindui.com/img/logos/workcation-logo-indigo-600.svg" alt="" /> */}
            {statusCode === '200' && <HandThumbUpIcon className="h-20 w-20 text-brand-purple"/>}
            <div className="mt-10">
              <div className="text-center text-2xl font-semibold text-gray-900 sm:text-3xl">
                <h2 className="mb-5">
                  {statusCodeMapping[statusCode]}
                </h2>
                {statusCode === '200' && <p className="text-base text-gray-500">
                  Our team will review your submission and get back to you soon with the next steps.
                </p>}
                <p className="text-base text-gray-500 mt-5 font-normal">If you have faced any issue during the assessment process, please report the issue at <span className="text-brand-purple font-medium">support@candidhr.ai</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TestLogCompleted;
