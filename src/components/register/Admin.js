import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import CandidHRLogo from "../../assets/PNG/Logo_white_transparentB.png";
import { api } from '../../constants/constants';
// import submit from "../assets/thank.gif";

function Admin() {
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    const [errorMsg, setErrorMsg] = useState({});

    const [adminData, setAdminData] = useState({
        fullname: '',
        email: '',
        contact: '',
        country: '',
        position: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAdminData({
            ...adminData,
            [name]: value,
        });

        if (name === 'fullname' && value) {
            setErrorMsg((prev) => ({ ...prev, fullname: null }));
        } else if (name === 'email' && /^[a-z0-9]+@[a-z]+\.[a-z]{2,3}$/.test(value)) {
            setErrorMsg((prev) => ({ ...prev, email: null }));
        } else if (name === 'contact' && value) {
            setErrorMsg((prev) => ({ ...prev, contact: null }));
        } else if (name === 'country' && value) {
            setErrorMsg((prev) => ({ ...prev, country: null }));
        } else if (name === 'position' && value) {
            setErrorMsg((prev) => ({ ...prev, position: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!adminData.fullname) newErrors.fullname = "Full Name is required";
        if (!adminData.email) {
            newErrors.email = "Email is required";
        } else if (!/^[a-z0-9]+@[a-z]+\.[a-z]{2,3}$/.test(adminData.email)) {
            newErrors.email = "Email must be valid";
        }
        if (!adminData.contact) {
            newErrors.contact = "Mobile number is required";
        } else if (!/^\d{10}$/.test(adminData.contact)) {
            newErrors.contact = "Mobile number must be 10 digits";
        }
        if (!adminData.country) newErrors.country = "Country is required";
        if (!adminData.position) newErrors.position = "Designation is required";

        setErrorMsg(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleBack = () => {
        navigate('/app/organization/signup');
    };

    const handleSubmit = async(e) => {
        e.preventDefault();
        if (validateForm()) {
            try {
                const response = await fetch(`${api}/admins`, { 
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(adminData),
                });
           if (response.ok){
            const result =await response.json();
            console.log('Form submitted successfully:', result );
            setShowModal(true);

            setAdminData({
                fullname: '',
                email: '',
                contact: '',
                country: '',
                position: '',
            });
            setErrorMsg({});
           }
           else{
            const errorData = await response.json();
                console.error('Error submitting form:', errorData);
                alert('Failed to submit the form. Please try again.');
           }
           }
           catch (error) {
            console.error('Network or server error:', error);
            alert('An error occurred while submitting the form. Please check your internet connection.');
        }
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setAdminData({
            fullname: '',
            email: '',
            contact: '',
            country: '',
            position: '',
        });

        setErrorMsg({});
        localStorage.removeItem("AdminData");
        localStorage.removeItem("organizationDetails");
        navigate('/organization');
    };


    useEffect(() => {
        const savedData = localStorage.getItem('AdminData');
        if (savedData) {
            setAdminData(JSON.parse(savedData));
        }
    }, []);

    return (
        <>
            <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">

                <div className="w-full md:w-2/3 p-8 md:p-16 bg-gray-50 flex flex-col justify-center">
                    <h4 className="mt-10 mb-5 text-center text-3xl lg:text-4xl font-semibold leading-9 tracking-tight text-gray-900">Step: 2 Admin/User Details</h4>
                    <p className="text-sm text-gray-600 mb-8 text-center">
                        Admin details would have fields like
                    </p>

                    <form className="space-y-6">
                        <div className="grid grid-cols-2 lg:grid-cols-2 gap-4">

                            <div>
                                <label className="block text-sm font-medium leading-6 text-gray-900">Full Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter Full Name"
                                    name="fullname"
                                    value={adminData.fullname}
                                    onChange={handleChange}
                                    className="block w-full rounded-md border-0 bg-blue-50 py-1.5  px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm"
                                />
                                {errorMsg.fullname && <small className="text-red-500">{errorMsg.fullname}</small>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium leading-6 text-gray-900">Email</label>
                                <input
                                    type="email"
                                    placeholder="example@yahoo.com"
                                    name="email"
                                    value={adminData.email}
                                    onChange={handleChange}
                                    className="block w-full rounded-md border-0 bg-blue-50 py-1.5  px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm"
                                />
                                {errorMsg.email && <small className="text-red-500">{errorMsg.email}</small>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                            <div>
                                <label className="block text-sm font-medium leading-6 text-gray-900">Contact Number</label>
                                <input
                                    type="number"
                                    placeholder="Enter Contact Number"
                                    name="contact"
                                    value={adminData.contact}
                                    onChange={handleChange}
                                    className="block w-full rounded-md border-0 bg-blue-50 py-1.5  px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm"
                                />
                                {errorMsg.contact && <small className="text-red-500">{errorMsg.contact}</small>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium leading-6 text-gray-900">Country</label>
                                <input
                                    type="text"
                                    placeholder="Enter Country"
                                    name="country"
                                    value={adminData.country}
                                    onChange={handleChange}
                                    className="block w-full rounded-md border-0 bg-blue-50 py-1.5  px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm"
                                />
                                {errorMsg.country && <small className="text-red-500">{errorMsg.country}</small>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium leading-6 text-gray-900">Position</label>
                            <input
                                type="text"
                                placeholder="Enter Position"
                                name="position"
                                value={adminData.position}
                                onChange={handleChange}
                                className="block w-full rounded-md border-0 bg-blue-50 py-1.5  px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm"
                            />
                            {errorMsg.position && <small className="text-red-500">{errorMsg.position}</small>}
                        </div>

                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={handleBack}
                                className="px-6 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 text-white rounded-md hover:bg-blue-400"
                                onClick={handleSubmit}
                                style={{ backgroundColor: "#7474f4" }}
                            >
                                Submit
                            </button>
                        </div>
                    </form>
                </div>
                <div className="hidden lg:flex justify-end w-full lg:w-2/3 h-full p-5">
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
                  Quickly discover top candidates with our intelligent matching
                  algorithms, streamlining your hiring process
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

            {showModal && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
                    <div className="bg-white rounded-md shadow-md w-1/3">
                        <div className="p-4">
                            <button
                                className="float-right text-gray-500 hover:text-gray-700"
                                onClick={handleCloseModal}
                            >
                                &times;
                            </button>
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
                Your form has been submitted successfully!
                </label>
              </div>
                            {/* <p className="text-center mt-4">Your form has been submitted successfully!</p> */}
                        </div>
                        <div className="flex justify-end p-4">
                            <button
                                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                                onClick={handleCloseModal}
                                style={{ backgroundColor: "#7474f4" }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Admin;
