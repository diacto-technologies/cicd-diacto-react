

import { Link, useNavigate, useParams } from "react-router-dom";
import HeroBanner from "./../../assets/hr-banner3.jpg";
import { useState, useEffect } from "react";
import CandidHRLogo from "../../assets/PNG/Logo_white_transparentB.png";
// import HeroBanner from "../../assets/hr-banner3.jpg";
import "./Login.css";
import { toast } from "react-toastify";
import { api } from "../../constants/constants";

const ShimmerUI = () => (
  <div className="animate-pulse">
    <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
    <div className="h-6 bg-gray-300 rounded w-2/4 mb-4"></div>
    <div className="h-10 bg-gray-300 rounded w-full mb-4"></div>
    <div className="h-10 bg-gray-300 rounded w-full mb-4"></div>
  </div>
);

const ResetPassword = () => {

  const [disableSubmit, setDisableSubmit] = useState(true);
  const [password, setPassword] = useState();
  const [confirmPassword, setConfirmPassword] = useState();
  const [showError, setShowError] = useState();
  const [successMsg, setSuccessMsg] = useState(null);
  const [passwordMatches, setPasswordMatches] = useState(false);
  const [name,setName] = useState("")
  const [email,setEmail] = useState("")
  const [loading,setLoading] = useState(false)
  const [dataLoading,setDataLoading] = useState(false)

  const { uid, token } = useParams();
  const API_URL = `${api}/accounts/user/${uid}/`;

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error("Failed to fetch user details");
        }
        const userData = await response.json();
        setName(userData.name);
        setEmail(userData.email);
      } catch (error) {
        console.error(error.message);
      } finally {
        setDataLoading(false);
      }
    };

    fetchUserDetails();
  }, [API_URL]);

  const handlePasswordChange = (e) => {
    if (e.target.id === "password") {
      setPassword(e.target.value);
    } else if (e.target.id === "confirm_password") {
      setConfirmPassword(e.target.value);
    }
  };

  const validatePasswords = () => {
    if (password || confirmPassword) {
      if (password?.length > 7 || confirmPassword?.length > 7) {
        if (password === confirmPassword) {
          setDisableSubmit(false);
          setPasswordMatches(true)
          setShowError(null);
        } else if (password && confirmPassword) {
          setDisableSubmit(true);
          setPasswordMatches(false)
          setShowError({confirmPassword: "Password does not match"});
        } else {
          setShowError(null);
        }
      } else {
        setDisableSubmit(true);
        setShowError({newPassword: "Minimum password length should be 8 characters"});
      }
    } else {
      setShowError(null);
      setDisableSubmit(true);
    }
  };

  useEffect(() => {
    validatePasswords();
  }, [password, confirmPassword]);

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const response = await fetch(
        `${api}/accounts/user/reset-password/${uid}/${token}/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ password, password2: confirmPassword }),
        }
      );
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json(); // Parse the JSON response

      setSuccessMsg(result?.message);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <>
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 ">
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <h2 className="mt-10 mb-5 text-center text-2xl font-extrabold leading-9 tracking-tight text-gray-900">
              Reset your password
            </h2>

            {showError?.newPassword && (
              <div
                className="px-2 py-4 flex item-center justify-center text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-200 dark:text-red-400"
                role="alert"
              >
                {showError.newPassword}
              </div>
            )}
          </div>

          <div className="mt-5 sm:mx-auto sm:w-full sm:max-w-sm">
            {!successMsg ? (
              <form
                method="POST"
                onSubmit={(e) => handlePasswordReset(e)}
                className="space-y-6"
                action="#"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="password"
                      id="password"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      New Password
                    </label>
                  </div>
                  <div className="mt-2">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      onChange={(e) => handlePasswordChange(e)}
                      onBlur={() => validatePasswords()}
                      placeholder="Password"
                      autoComplete="current-password"
                      required
                      className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 sm:text-sm sm:leading-6"
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
                      Confirm Password
                    </label>
                  </div>
                  <div className="mt-2">
                    <input
                      id="confirm_password"
                      name="confirm_password"
                      type="password"
                      onChange={(e) => handlePasswordChange(e)}
                      onBlur={() => validatePasswords()}
                      autoComplete="current-password"
                      required
                      className={`block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset outline-none ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset ${ !passwordMatches? "focus:ring-red-600" :"focus:ring-green-600"} sm:text-sm sm:leading-6`}
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={disableSubmit === null ? true : disableSubmit}
                    className="flex w-full justify-center rounded-xl bg-brand-purple px-3 py-2 font-semibold leading-6 text-white shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 disabled:cursor-not-allowed disabled:bg-brand-purple disabled:opacity-70"
                  >
                    Continue
                  </button>
                </div>
              </form>
            ) : (
              <div className="w-full flex flex-col justify-center items-center h-full me-4 px-4">
                <div class="image mb-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <g stroke-width="0" id="SVGRepo_bgCarrier"></g>
                    <g
                      stroke-linejoin="round"
                      stroke-linecap="round"
                      id="SVGRepo_tracerCarrier"
                    ></g>
                    <g id="SVGRepo_iconCarrier">
                      {" "}
                      <path
                        stroke-linejoin="round"
                        stroke-linecap="round"
                        stroke-width="1.5"
                        stroke="#ffffff"
                        d="M20 7L9.00004 18L3.99994 13"
                      ></path>{" "}
                    </g>
                  </svg>
                </div>
                <label className="font-medium antialiased text-xl text-gray-700 p-3">
                 {successMsg}
                </label>
              </div>
            )}

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
};

export default ResetPassword;

// import { Link, useNavigate, useParams } from "react-router-dom";
// import { useState, useEffect } from "react";
// import CandidHRLogo from "../../assets/PNG/Logo_white_transparentB.png";
// // import HeroBanner from "../../assets/hr-banner3.jpg";
// import "./Login.css";
// import { toast } from "react-toastify";

// const ShimmerUI = () => (
//   <div className="animate-pulse">
//     <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
//     <div className="h-6 bg-gray-300 rounded w-2/4 mb-4"></div>
//     <div className="h-10 bg-gray-300 rounded w-full mb-4"></div>
//     <div className="h-10 bg-gray-300 rounded w-full mb-4"></div>
//   </div>
// );

// const ResetPassword = () => {
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [showError, setShowError] = useState(null);
//   const [successMsg, setSuccessMsg] = useState(null);
//   const [passwordMatches, setPasswordMatches] = useState(false);
//   const [disableSubmit, setDisableSubmit] = useState(true);
//   const [loading, setLoading] = useState(false);
//   const [dataLoading, setDataLoading] = useState(true);
  

//   const navigate = useNavigate();
//   const { uid, token } = useParams();
//   const API_URL = `http://localhost:8000/accounts/user/${uid}/`;

//   useEffect(() => {
//     const fetchUserDetails = async () => {
//       try {
//         const response = await fetch(API_URL);
//         if (!response.ok) {
//           throw new Error("Failed to fetch user details");
//         }
//         const userData = await response.json();
//         setName(userData.name);
//         setEmail(userData.email);
//       } catch (error) {
//         console.error(error.message);
//       } finally {
//         setDataLoading(false);
//       }
//     };

//     fetchUserDetails();
//   }, [API_URL]);

//   const handlePasswordChange = (e) => {
//     const { id, value } = e.target;
//     id === "password" ? setPassword(value) : setConfirmPassword(value);
//   };

//   const validatePasswords = () => {
//     if (password && confirmPassword) {
//       if (password.length >= 8 && confirmPassword.length >= 8) {
//         if (password === confirmPassword) {
//           setDisableSubmit(false);
//           setPasswordMatches(true);
//           setShowError(null);
//         } else {
//           setDisableSubmit(true);
//           setPasswordMatches(false);
//           setShowError("Passwords do not match");
//         }
//       } else {
//         setDisableSubmit(true);
//         setShowError("Password must be at least 8 characters long");
//       }
//     } else {
//       setDisableSubmit(true);
//       setShowError(null);
//     }
//   };

//   useEffect(() => {
//     validatePasswords();
//   }, [password, confirmPassword]);

//   const handlePasswordReset = async (e) => {
//     e.preventDefault();
//     setLoading(true);
  
//     try {
//       const response = await fetch(
//         `/accounts/user/reset-password/${uid}/${token}/`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ password, password2: confirmPassword }),
//         }
//       );
  
//       if (!response.ok) {
//         const errorData = await response.json(); // Parse the response JSON
//         if (errorData.non_field_errors) {
//           // Extract the first error message from non_field_errors
//           const errorMessage = errorData.non_field_errors[0];
//           setShowError(errorMessage); // Update state for display
//           toast.error(errorMessage); // Show error in a toast
//         } else {
//           setShowError("An error occurred. Please try again later."); // Fallback message
//           toast.error("An error occurred. Please try again later."); // Fallback toast
//         }
//         throw new Error("Failed to reset password");
//       }
  
//       const result = await response.json();
//       setSuccessMsg(result.message);
//       toast.success("Password reset successfully!");
  
//       setTimeout(() => navigate("/app/login/"), 5000);
//     } catch (error) {
//       console.error("Error:", error);
//     } finally {
//       setLoading(false);
//     }
//   };
  

//   return (
//     <>
//       <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
//         <div className="flex flex-1 flex-col px-6 py-12 lg:px-8">
//           <div className="sm:mx-auto sm:w-full sm:max-w-sm">
//             <h2 className="text-center text-2xl font-extrabold text-gray-900">
//               Admin Onboarding
//             </h2>
//             {showError && (
//               <div className="mt-4 text-sm text-red-600">{showError}</div>
//             )}
//           </div>

//           <div className="mt-5 sm:mx-auto sm:w-full sm:max-w-sm">
//             {dataLoading ? (
//               <ShimmerUI />
//             ) : !successMsg ? (
//               <form onSubmit={handlePasswordReset} className="space-y-6">
//                 <div>
//                   <label
//                     htmlFor="name"
//                     className="block text-sm font-medium leading-6 text-gray-900"
//                   >
//                     Name
//                   </label>
//                   <input
//                     id="name"
//                     type="text"
//                     value={name}
//                     disabled
//                     className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 sm:text-sm sm:leading-6"
//                   />
//                 </div>

//                 <div>
//                   <label htmlFor="email" className="block text-sm font-medium">
//                     Email
//                   </label>
//                   <input
//                     id="email"
//                     type="email"
//                     value={email}
//                     disabled
//                     className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 sm:text-sm sm:leading-6"
//                   />
//                 </div>

//                 <div>
//                   <label
//                     htmlFor="password"
//                     className="block text-sm font-medium"
//                   >
//                     New Password
//                   </label>
//                   <input
//                     id="password"
//                     type="password"
//                     placeholder="Password"
//                     onChange={handlePasswordChange}
//                     className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 sm:text-sm sm:leading-6"
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label
//                     htmlFor="confirm_password"
//                     className="block text-sm font-medium"
//                   >
//                     Confirm Password
//                   </label>
//                   <input
//                     id="confirm_password"
//                     type="password"
//                     placeholder="Confirm Password"
//                     onChange={handlePasswordChange}
//                     className={`block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset outline-none ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset ${
//                       !passwordMatches
//                         ? "focus:ring-red-600"
//                         : "focus:ring-green-600"
//                     } sm:text-sm sm:leading-6`}
//                     required
//                   />
//                 </div>

//                 <button
//                   type="submit"
//                   disabled={disableSubmit}
//                   className="mt-4 w-full flex justify-center rounded-md bg-blue-600 py-2 px-4 text-white font-semibold shadow-md disabled:opacity-50"
//                 >
//                   {loading ? "Processing..." : "Reset Password"}
//                 </button>
//               </form>
//             ) : (
//               <div className="w-full flex flex-col justify-center items-center h-full me-4 px-4">
//                 <div class="image mb-3">
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                   >
//                     <g stroke-width="0" id="SVGRepo_bgCarrier"></g>
//                     <g
//                       stroke-linejoin="round"
//                       stroke-linecap="round"
//                       id="SVGRepo_tracerCarrier"
//                     ></g>
//                     <g id="SVGRepo_iconCarrier">
//                       {" "}
//                       <path
//                         stroke-linejoin="round"
//                         stroke-linecap="round"
//                         stroke-width="1.5"
//                         stroke="#ffffff"
//                         d="M20 7L9.00004 18L3.99994 13"
//                       ></path>{" "}
//                     </g>
//                   </svg>
//                 </div>
//                 <label className="font-medium antialiased text-xl text-gray-700 p-3">
//                   {successMsg}
//                 </label>
//               </div>
//             )}

//             <p className="mt-10 text-center text-sm text-gray-500">
//               <a
//                 href="#"
//                 className="font-semibold leading-6 text-blue-700 hover:text-blue-600"
//               >
//                 <Link to={"/app/login/"}>Go back to Login Page</Link>
//               </a>
//             </p>
//           </div>
//         </div>

//         <div className="hidden lg:flex justify-end w-full lg:w-1/2 h-full p-5">
//           <div className="relative rounded-xl bg-blue-950 w-full lg:w-5/6 overflow-auto h-full shadow-md p-7">
//             <div className="absolute top-5 right-5 w-full flex items-center justify-end gap-3">
//               <img src={CandidHRLogo} className="lg:w-40 2xl:w-56" alt="Logo" />
//             </div>

//             <div className="w-full mt-20 2xl:mt-36 px-10">
//               <div className="lg:w-5/6 text-lg xl:text-3xl 2xl:text-5xl font-semibold manrope text-wrap text-white">
//                 Start your journey with us.
//               </div>
//               <div className="w-4/6 flex flex-col lg:gap-4 2xl:gap-8 mt-5 2xl:mt-20">
//                 <div>
//                   <label className="2xl:text-xl font-semibold text-white">
//                     AI-Powered Matching
//                   </label>
//                   <p className="mt-1 2xl:text-lg text-sm text-gray-400">
//                     Quickly discover top candidates with our intelligent
//                     matching algorithms, streamlining your hiring process
//                   </p>
//                 </div>
//                 <div>
//                   <label className="2xl:text-xl font-semibold text-white">
//                     Advanced Candidate Insights
//                   </label>
//                   <p className="mt-1 2xl:text-lg text-sm text-gray-400">
//                     Make data-driven hiring decisions with our rich candidate
//                     analytics.
//                   </p>
//                 </div>
//                 <div>
//                   <label className="2xl:text-xl font-semibold text-white">
//                     Seamless Collaboration
//                   </label>
//                   <p className="mt-1 2xl:text-lg text-sm text-gray-400">
//                     Easily share candidate profiles and evaluations with your
//                     team to streamline your workflow.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default ResetPassword;
