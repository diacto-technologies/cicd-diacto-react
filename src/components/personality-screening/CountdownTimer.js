
// import { time } from 'echarts';
// import React, { useState, useEffect } from 'react';

// const CountdownTimer = ({ initialTime, onTimerFinish,isSubmitted,currentQuestionIndex ,submittingAnswer }) => {
//   const [timeRemaining, setTimeRemaining] = useState(initialTime);
//   let timerId; // Declare timerId variable

//   useEffect(() => {
//     setTimeRemaining(initialTime); // Reset the timer when the key prop changes
//   }, [ currentQuestionIndex]);

  

//   useEffect(() => {
//    if (timeRemaining !== null) {
//     if (timeRemaining <= 0 ) {
//       // Time is up or isSubmitted is true, stop the timer
//       clearInterval(timerId);
//       if (timeRemaining <= 0) {
//         console.log("TImer ended" , isSubmitted)
//         onTimerFinish(); // Call the onTimerFinish callback if time is up
//       }
      
//     } else {
//       if (isSubmitted) {
//         console.log("submitted")
//         setTimeRemaining(null)
//       }
//       // if (submittingAnswer) {
//       //   setTimeRemaining(null)
//       // }
//       // Start the countdown timer if isSubmitted is false
//       timerId = setInterval(() => { // Assign value to timerId
//         setTimeRemaining(prevTime => prevTime - 1);
//       }, 1000);

//       return () => clearInterval(timerId); // Cleanup function to clear the timer on unmount
//     }
//    }
//   }, [initialTime,timeRemaining]);

//   // console.log(timeRemaining)

//   return (
//     <label className={`text-lg flex items-center font-bold   me-1.5 ${timeRemaining > 0 && 'text-red-500'} ${timeRemaining > 3 && 'text-yellow-600'} ${timeRemaining > 10 && 'text-primary-600'}`}>
//       <i className={`text-lg fa-solid fa-stopwatch text-primary-600 me-1.5 `}></i>
//       {timeRemaining || 0}s
//     </label>
//   );
// };

// export default CountdownTimer;


import React, { useState, useEffect, useRef } from 'react';

const CountdownTimer = ({ initialTime, onTimerFinish, isSubmitted, currentQuestionIndex }) => {
    const [timeRemaining, setTimeRemaining] = useState(initialTime);
    const timerId = useRef(null); // Use ref to persist timerId

    // Reset the timer when the question changes
    useEffect(() => {
        clearInterval(timerId.current); // Clear any existing intervals
        setTimeRemaining(initialTime);
    }, [currentQuestionIndex, initialTime]);

    // Handle the countdown logic
    useEffect(() => {
        if (isSubmitted) {
            clearInterval(timerId.current);
            setTimeRemaining(null);
            return; // No need to start a timer if submitted
        }

        if (timeRemaining !== null && timeRemaining > 0) {
            timerId.current = setInterval(() => {
                setTimeRemaining(prevTime => prevTime - 1);
            }, 1000);
        } else if (timeRemaining <= 0) {
            clearInterval(timerId.current);
            onTimerFinish();
        }

        return () => clearInterval(timerId.current); // Cleanup interval on unmount or change
    }, [timeRemaining, isSubmitted, onTimerFinish]);

    // Function to get dynamic classnames based on time remaining
    const getClassNamesForTime = () => {
        if (timeRemaining > 10) return 'text-primary-600';
        if (timeRemaining > 3) return 'text-yellow-600';
        return 'text-red-500';
    };

    return (
        <label className={`text-lg flex items-center font-bold me-1.5 ${getClassNamesForTime()}`}>
            <i className="text-lg fa-solid fa-stopwatch text-primary-600 me-1.5"></i>
            {timeRemaining !== null ? `${timeRemaining}s` : '0s'}
        </label>
    );
};

export default CountdownTimer;
