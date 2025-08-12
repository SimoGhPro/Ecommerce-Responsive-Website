// components/CountdownTimer.tsx
'use client';

import { useState, useEffect } from 'react';

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
}

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    hours: 2,
    minutes: 34,
    seconds: 56,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const { hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          return { ...prev, seconds: seconds - 1 };
        } else if (minutes > 0) {
          return { hours, minutes: minutes - 1, seconds: 59 };
        } else if (hours > 0) {
          return { hours: hours - 1, minutes: 59, seconds: 59 };
        } else {
          clearInterval(timer);
          return { hours: 0, minutes: 0, seconds: 0 };
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center space-x-2">
      <div className="bg-red-600 text-white font-medium py-1 px-3 rounded">
        {String(timeLeft.hours).padStart(2, '0')}h
      </div>
      <div className="bg-red-600 text-white font-medium py-1 px-3 rounded">
        {String(timeLeft.minutes).padStart(2, '0')}m
      </div>
      <div className="bg-red-600 text-white font-medium py-1 px-3 rounded">
        {String(timeLeft.seconds).padStart(2, '0')}s
      </div>
    </div>
  );
}