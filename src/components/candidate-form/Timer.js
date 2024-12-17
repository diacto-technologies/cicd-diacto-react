import { useEffect, useState } from "react";

const Timer = ({ duration, onTimeUp, onTick }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
console.count("timer")
  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (onTimeUp) onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        if (onTick) onTick(newTime);
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTick, onTimeUp]);

  return <span>{timeLeft}s</span>;
};

export default Timer;
