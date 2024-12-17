import { Link, useNavigate } from 'react-router-dom';
import HeroBanner from "./../../assets/hr-banner3.jpg";
// import "./Register.css"
import { Tooltip } from "react-tooltip";
import { useState } from 'react';

const RegisterUser = () => {
    const history = useNavigate()
    const [formData, setFormData] = useState({
        // username: '',
        email: '',
        password: '',
        org_domain: '',
        name: '',
        contact: '',
        profile_pic: null,
    });

    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("formData : ", formData)
        try {
            setErrors(null)
            const response = await fetch('/accounts/register/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const data = await response.json();
                console.log("mesage : ", data)
                setSuccessMessage('Registration successful!');
                setFormData({})
                setErrors({});
                history("/app/login/")
                // Reset the form here if needed
            } else {
                const errorData = await response.json();
                console.log(errorData)
                setErrors(errorData);
            }
        } catch (error) {
            console.error('Registration failed:', error.message);
        }
    };

    return (
        <>
            <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 ">
                <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
                    <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                        <h2 className="text-center text-3xl font-bold brand-text">Candid<span className="">HR</span></h2>
                        {/* <img
                            className="mx-auto h-10 w-auto"
                            src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
                            alt="Your Company"
                        /> */}
                        <h2 className="mt-10 text-center text-2xl font-extrabold leading-9 tracking-tight text-gray-900">
                            Register with us
                        </h2>
                        
                    </div>
                    <div className="mt-10 sm:mx-auto sm:w-9/12">
                        <form onSubmit={handleSubmit} className=" p-4">
                            <div className='flex flex-wrap -mx-3 mb-6'>
                                <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                                    <label htmlFor="name" className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="grid-name">
                                        Full Name <span className='text-red-600'>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        onChange={handleInputChange}
                                        value={formData.name}
                                        className="form-input w-full border-2 border-gray-300 p-2 rounded"
                                        name="name"
                                        id="name"
                                        placeholder="Alex Smith"
                                        required
                                    />
                                    <p className='text-sm text-red-600'>{errors?.name}</p>
                                </div>
                                <div className="w-full md:w-1/2 px-3">
                                    <label htmlFor="contact" className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="grid-contact">
                                        Contact Number <span className='text-red-600'>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        onChange={handleInputChange}
                                        value={formData.contact}
                                        class="form-input w-full border-2 border-gray-300 p-2 rounded"
                                        name="contact"
                                        id="contact"
                                        placeholder=""
                                        required
                                    />
                                    <p className='text-sm text-red-600'>{errors?.contact}</p>
                                </div>
                            </div>
                            {/* <div className="mb-4">
                                <label htmlFor="username" className="block text-sm font-bold mb-2">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    onChange={handleInputChange}
                                    value={formData.username}
                                    className="form-input w-full border-2 border-gray-300 p-2 rounded"
                                    name="username"
                                    id="username"
                                    placeholder="alex.smith"
                                />
                            </div> */}
                            <div className="mb-4">
                                <label htmlFor="email" className="block text-sm font-bold mb-2">
                                    Email <span className='text-red-600'>*</span>
                                </label>
                                <input
                                    type="email"
                                    onChange={handleInputChange}
                                    value={formData.email}
                                    className="form-input w-full border-2 border-gray-300 p-2 rounded"
                                    name="email"
                                    id="email"
                                    placeholder="example@work.com"
                                    required
                                />
                                <p className='text-sm text-red-600'>{errors?.email}</p>
                            </div>
                            <div className="mb-4">
                                <label htmlFor="org_domain" className="block text-sm font-bold mb-2">
                                    Organization URL <span className='text-red-600'>*</span>
                                </label>
                                <input
                                    type="text"
                                    onChange={handleInputChange}
                                    value={formData.org_name}
                                    className="form-input w-full border-2 border-gray-300 p-2 rounded"
                                    name="org_domain"
                                    id="org_domain"
                                    placeholder="organization.com"
                                    required
                                />
                                <p className='text-sm text-red-600'>{errors?.org_name}</p>
                            </div>
                            <div className='flex flex-wrap -mx-3 mb-6'>
                                <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                                    <label htmlFor="password" className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="grid-password">
                                        Password <span className='text-red-600'>*</span>
                                    </label>
                                    <input
                                        className="form-input w-full border-2 border-gray-300 p-2 rounded"
                                        type="password"
                                        onChange={handleInputChange}
                                        value={formData.password}
                                        name="password"
                                        id="password"
                                        placeholder="password"
                                        required
                                    />
                                </div>
                                <div className="w-full md:w-1/2 px-3">
                                    <label htmlFor="confirm_password" class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="grid-confirm_password">
                                        Confirm Password <span className='text-red-600'>*</span>
                                    </label>
                                    <input
                                        type="password"
                                        onChange={handleInputChange}
                                        value={formData.confirm_password}
                                        name="confirm_password"
                                        id="confirm_password"
                                        class="form-input w-full border-2 border-gray-300 p-2 rounded"
                                        required

                                    />
                                </div>
                            </div>
                            <div className="text-center">
                                <button className="w-full bg-blue-500 text-white p-2 rounded">Register</button>
                                <small className="block text-muted mt-2">
                                    Already have an account? <Link to={"/login"} className="text-blue-500">Log In</Link>
                                </small>
                            </div>



                        </form>
                    </div>

                </div>
                <div className="flex-1 bg-black h-full hidden lg:block">
                    <img
                        className="object-cover w-full h-full"
                        src={HeroBanner}  // Replace with your image URL
                        alt="Side Image"
                    />
                </div>
            </div>

        </>
    );
}

export default RegisterUser;