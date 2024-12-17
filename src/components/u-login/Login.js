import React, { useState, useEffect, useContext } from "react";
import "./Login.css";
import { Link, useNavigate } from "react-router-dom";
// import HeroBanner from "./../../assets/hr-banner3.jpg";
// import { useCookies } from "react-cookie";
// import jwt_decode from "jwt-decode";
import AuthContext from "../../context/AuthContext";
import CandidHRLogo from "../../assets/PNG/Logo_white_transparentB.png";
// import Screenshot from "../../assets/job_applicant.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState(null);
  const { loginUser } = useContext(AuthContext);

  function emailOnChange(e) {
    setEmail(e.target.value);
    setFormError(null);
  }

  function setChangedPassword(e) {
    setPassword(e.target.value);
    setFormError(null);
  }

  async function handleLogin(e) {
    e.preventDefault();
    try {
      setFormError(null);
      await loginUser(e);
    } catch (error) {
      const err = {};

      if (!email) {
        err.email = "Email is mandatory";
      }
      if (!password) {
        err.password = "Password is mandatory";
      }
      if (error.detail) {
        err.login = error.detail;
      }

      setFormError(err);
    }
  }

  return (
    <>
      <div className="h-screen w-full flex flex-col lg:flex-row items-center justify-center bg-gray-50">
        <div className="flex flex-1 w-full lg:w-1/2 flex-col justify-center px-6 py-12 lg:px-8">
          <div className="mx-auto w-full max-w-sm lg:max-w-md">
            <h2 className="mt-10 mb-5 text-center text-3xl lg:text-4xl font-semibold leading-9 tracking-tight text-gray-900">
              Sign in to your account
            </h2>

            {formError && formError?.login && (
              <div
                className="px-2 py-4 flex item-center justify-center text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-200 dark:text-red-400"
                role="alert"
              >
                {formError?.login}
              </div>
            )}
          </div>

          <div className="mt-7 mx-auto w-full max-w-sm lg:max-w-md">
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Email address
                </label>
                <div className="mt-2">
                  <input
                    value={email}
                    onChange={(e) => emailOnChange(e)}
                    name="email"
                    id="email"
                    placeholder="example@yahoo.com"
                    type="email"
                    autoComplete="email"
                    required
                    className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    id="password"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Password
                  </label>
                  <div className="text-sm">
                    <Link
                      to={"/app/send-reset-password-email/"}
                      className="font-semibold text-blue-700 hover:text-blue-600"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </div>
                <div className="mt-2">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => setChangedPassword(e)}
                    placeholder="Password"
                    autoComplete="current-password"
                    required
                    className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="flex w-full justify-center rounded-xl bg-brand-purple px-3 py-2 font-semibold leading-6 text-white shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
                >
                  Sign in
                </button>
              </div>
            </form>

            {/* <p className="mt-10 text-center text-sm text-gray-500">
              Not a member?{" "}
              <Link
                to={"/app/register"}
                className="font-semibold leading-6 text-blue-700 hover:text-blue-600"
              >
                Signup
              </Link>
            </p> */}
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
};

export default Login;
