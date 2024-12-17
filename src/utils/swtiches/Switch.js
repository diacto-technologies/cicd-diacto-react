import { useState } from 'react';
import './Switch.css'

const Switch = ({checked,setChecked}) => {

    return (
        <>

            <label className="switch me-2">
                <input checked={checked} onChange={() => setChecked(!checked)} type="checkbox" />
                <div className="slider">
                    <div className="circle ">
                    <i style={{fontSize : '.7rem'}} className="fa-solid fa-xmark cross flex items-center"></i>
                        <svg
                            className="checkmark"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <g>
                                <path
                                    className=""
                                    fill="currentColor"
                                    d="M9.707 19.121a.997.997 0 0 1-1.414 0l-5.646-5.647a1.5 1.5 0 0 1 0-2.121l.707-.707a1.5 1.5 0 0 1 2.121 0L9 14.171l9.525-9.525a1.5 1.5 0 0 1 2.121 0l.707.707a1.5 1.5 0 0 1 0 2.121z"
                                ></path>
                            </g>
                        </svg>
                    </div>
                </div>
            </label>

        </>
    )
}

export default Switch;