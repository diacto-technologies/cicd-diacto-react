
import "./Login.css";
import { Link, useNavigate } from "react-router-dom";
import HeroBanner from "./../../assets/hr-banner3.jpg";
import { useState, useEffect, useContext } from "react";
import CandidHRLogo from "../../assets/PNG/Logo_white_transparentB.png";

function ResetPasswordEmail() {
  const [email, setEmail] = useState();
  const [formError, setFormError] = useState(null);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setFormError(null)
  }

  const requestLinkOnEmail = async (e) => {
    e.preventDefault();
    const url = '/accounts/send-reset-password-email/'; // Replace with your API endpoint
    const data = {
      "email": email
    }; // Replace with your JSON body

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Indicates that the body is in JSON format
        },
        body: JSON.stringify(data) // Converts the data object to a JSON string
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json(); // Parse the JSON response
      
      setFormError({ success: result.message });
    } catch (error) {
      console.error('Error:', error);
      setFormError({ error: "No account found with given credentials" });
    }

  }

  return (
    <>
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 ">
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <h2 className="mt-10 mb-5 text-center text-2xl font-extrabold leading-9 tracking-tight text-gray-900">
              Reset your password
            </h2>

            <p className="text-center text-sm text-gray-400">Password reset link will be sent to the below registered email</p>
            {formError && Object.keys(formError)[0] === "error" && (
              <div
                className="px-2 mt-2 py-4 flex item-center justify-center text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-200 dark:text-red-400"
                role="alert"
              >
                {formError.error}
              </div>
            )}
            {formError && Object.keys(formError)[0] === "success" && (
              // {(
              <div
                className="px-2 mt-2 py-4 flex item-center justify-center text-sm text-green-600 rounded-lg bg-green-100 dark:bg-gray-200 dark:text-green-400"
                role="alert"
              >
                {formError.success}
              </div>
            )}
          </div>

          <div className="mt-5 sm:mx-auto sm:w-full sm:max-w-sm">
            <form onSubmit={(e) => requestLinkOnEmail(e)} className="space-y-6" action="#">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Email address
                </label>
                <div className="mt-2">
                  <input
                    onChange={(e) => handleEmailChange(e)}
                    name="email"
                    id="email"
                    placeholder="example@yahoo.com"
                    type="email"
                    autoComplete="email"
                    required
                    className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="flex w-full justify-center rounded-xl bg-brand-purple px-3 py-2 font-semibold leading-6 text-white shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
                >
                  Continue
                </button>
              </div>
            </form>

            <p className="mt-10 text-center text-sm text-gray-500">
              <a
                href="#"
                className="font-semibold leading-6 text-blue-700 hover:text-blue-600"
              >
                <Link to={"/app/login/"}>Go back to Login Page</Link>
              </a>
            </p>
          </div>
        </div>
        <div className="hidden lg:flex justify-end w-full lg:w-1/2 h-full p-5">
          <div className="relative rounded-xl bg-blue-950 w-full lg:w-5/6 overflow-auto h-full shadow-md p-7">
            <div className="absolute top-5 right-5 w-full flex items-center justify-end gap-3">
              <img src={CandidHRLogo} className="lg:w-40 2xl:w-56" alt="Logo" />
            </div>

            <div className="w-full mt-20 2xl:mt-36 px-10">
              <div className="lg:w-5/6 text-lg xl:text-3xl 2xl:text-5xl font-semibold manrope text-wrap text-white">
                Start your journey with us.
              </div>
              <div className="w-4/6 flex flex-col lg:gap-4 2xl:gap-8 mt-5 2xl:mt-20">
                <div>
                  <label className="2xl:text-xl font-semibold text-white">
                    AI-Powered Matching
                  </label>
                  <p className="mt-1 2xl:text-lg text-sm text-gray-400">
                    Quickly discover top candidates with our intelligent
                    matching algorithms, streamlining your hiring process
                  </p>
                </div>
                <div>
                  <label className="2xl:text-xl font-semibold text-white">
                    Data-Driven Insights
                  </label>
                  <p className="mt-1 2xl:text-lg text-sm text-gray-400">
                    Leverage analytics and reports to make informed hiring
                    decisions and optimize your recruitment strategy
                  </p>
                </div>
                <div>
                  <label className="2xl:text-xl font-semibold text-white">
                    User-Friendly Interface
                  </label>
                  <p className="mt-1 2xl:text-lg text-sm text-gray-400">
                    Experience seamless navigation with our intuitive design,
                    making recruitment easy and efficient for everyone
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


export default ResetPasswordEmail;