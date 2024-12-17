// import React, { useState, useEffect } from 'react';
// import './Countdown.css'

// const StartTimer = ({ onComplete, started }) => {
//     const [counter, setCounter] = useState(3);
//     let timerId;

//     useEffect(() => {
//         if (started) {
//             if (counter <= 0) {

//                 clearInterval(timerId);
//                 onComplete();
//                 console.log("TImer ended")

//             } else {
//                 // Start the countdown timer if isSubmitted is false
//                 timerId = setInterval(() => { // Assign value to timerId
//                     setCounter(prevTime => prevTime - 1);
//                 }, 1000);

//                 return () => clearInterval(timerId); // Cleanup function to clear the timer on unmount
//             }
//         }
//     }, [counter, started]);


//     return (
//         <>
//             {started &&
//                 <div className='text-gray-900  text-center'>
//                     <label className='text-lg'>Your screening starts in</label>
//                     <p id='countdown' className='text-5xl font-bold mt-2' >{counter}</p>
//                 </div>
//             }

//         </>

//     );
// };

// export default StartTimer;

// by gpt 
import React, { useState, useEffect, useRef } from 'react';
import './Countdown.css';

const StartTimer = ({ onComplete, started }) => {
    const [counter, setCounter] = useState(3);
    const timerId = useRef(null); // Use ref to persist timerId across renders

    useEffect(() => {
        if (started && counter > 0) {
            // Start the countdown timer
            timerId.current = setInterval(() => {
                setCounter(prevCounter => prevCounter - 1);
            }, 1000);

            // Cleanup function to clear the timer on unmount or when counter reaches 0
            return () => clearInterval(timerId.current);
        } else if (counter <= 0) {
            // When the timer finishes
            clearInterval(timerId.current);
            onComplete();
        }

        // Clear the timer if the component unmounts or `started` changes
        return () => {
            if (timerId.current) {
                clearInterval(timerId.current);
            }
        };
    }, [started, counter, onComplete]); // Ensure useEffect triggers when `started` or `counter` changes

    return (
        <>
            {started && (
                <div className='text-gray-900 text-center'>
                    <label className='text-lg'>Your screening starts in</label>
                    <p id='countdown' className='text-5xl font-bold mt-2' aria-live="polite">
                        {counter}
                    </p>
                </div>
            )}
        </>
    );
};

export default StartTimer;
