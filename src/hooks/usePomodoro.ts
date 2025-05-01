import { useState, useEffect, useCallback } from 'react';
import { PomodoroSettings, PomodoroStatus } from '../types';

export const usePomodoro = (settings: PomodoroSettings) => {
  const [status, setStatus] = useState<PomodoroStatus>('idle');
  const [timeLeft, setTimeLeft] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);
  const [isActive, setIsActive] = useState(false);
  
  // Reset timer based on current status
  const resetTimer = useCallback(() => {
    if (status === 'work') {
      setTimeLeft(settings.workDuration * 60);
    } else if (status === 'break') {
      setTimeLeft(settings.breakDuration * 60);
    } else if (status === 'longBreak') {
      setTimeLeft(settings.longBreakDuration * 60);
    }
  }, [status, settings]);
  
  // Initialize timer
  useEffect(() => {
    resetTimer();
  }, [status, resetTimer]);
  
  // Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      // Cycle to next status when timer ends
      if (status === 'work') {
        const newSessionCount = sessionCount + 1;
        setSessionCount(newSessionCount);
        
        // Check if it's time for a long break
        if (newSessionCount % settings.sessionsBeforeLongBreak === 0) {
          setStatus('longBreak');
        } else {
          setStatus('break');
        }
      } else {
        // After any break, go back to work
        setStatus('work');
      }
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, status, sessionCount, settings]);
  
  // Start the timer
  const start = () => {
    if (status === 'idle') {
      setStatus('work');
    }
    setIsActive(true);
  };
  
  // Pause the timer
  const pause = () => {
    setIsActive(false);
  };
  
  // Resume the timer
  const resume = () => {
    setIsActive(true);
  };
  
  // Stop and reset the timer
  const stop = () => {
    setIsActive(false);
    setStatus('idle');
    setSessionCount(0);
    setTimeLeft(0);
  };
  
  // Skip to the next session
  const skip = () => {
    if (status === 'work') {
      const newSessionCount = sessionCount + 1;
      setSessionCount(newSessionCount);
      
      if (newSessionCount % settings.sessionsBeforeLongBreak === 0) {
        setStatus('longBreak');
      } else {
        setStatus('break');
      }
    } else {
      setStatus('work');
    }
  };
  
  // Format time left into minutes and seconds
  const formatTimeLeft = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  return {
    status,
    timeLeft,
    sessionCount,
    isActive,
    formatTimeLeft,
    start,
    pause,
    resume,
    stop,
    skip,
  };
};