import { useState, useEffect, useCallback, useRef } from 'react';

const IDLE_TIMEOUT = 60 * 1000; // 60 seconds of inactivity

const useIdleTimer = (timeout = IDLE_TIMEOUT) => {
  const [isIdle, setIsIdle] = useState(false);
  const timer = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
    }
    setIsIdle(false);
    timer.current = setTimeout(() => {
      setIsIdle(true);
    }, timeout);
  }, [timeout]);

  const handleActivity = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  useEffect(() => {
    resetTimer(); // Start timer on mount

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('touchstart', handleActivity);
    window.addEventListener('scroll', handleActivity);

    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('scroll', handleActivity);
    };
  }, [handleActivity, resetTimer]);

  return isIdle;
};

export default useIdleTimer;
