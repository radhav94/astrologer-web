import { useState, useEffect, useRef, useCallback } from "react";
import "./styles/countdownTimer.scss";

const TOTAL = 10;
const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const CountdownTimer = ({ onComplete, onCancel }) => {
  const [seconds, setSeconds] = useState(TOTAL);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);
  const rafRef = useRef(null);
  const startTimeRef = useRef(null);

  const clear = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  useEffect(() => {
    startTimeRef.current = Date.now();

    // Discrete seconds countdown for the number display
    intervalRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Smooth continuous progress via requestAnimationFrame
    const animate = () => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const fraction = Math.min(elapsed / TOTAL, 1);
      setProgress(fraction * CIRCUMFERENCE);

      if (fraction < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };
    rafRef.current = requestAnimationFrame(animate);

    return clear;
  }, [clear]);

  useEffect(() => {
    if (seconds === 0) onComplete();
  }, [seconds, onComplete]);

  const handleCancel = () => {
    clear();
    onCancel();
  };

  return (
    <div className="countdown-overlay">
      <div className="countdown-content">
        <p className="countdown-label">You will be live in</p>

        <div className="countdown-ring-wrapper">
          <svg className="countdown-ring" viewBox="0 0 120 120">
            <circle
              className="countdown-ring-bg"
              cx="60"
              cy="60"
              r={RADIUS}
            />
            <circle
              className="countdown-ring-progress"
              cx="60"
              cy="60"
              r={RADIUS}
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={CIRCUMFERENCE - progress}
            />
          </svg>
          <span className="countdown-number">{seconds}</span>
        </div>

        <p className="countdown-seconds-label">seconds</p>
      </div>

      <button className="countdown-cancel-btn" onClick={handleCancel}>
        Cancel Live
      </button>
    </div>
  );
};

export default CountdownTimer;
