import React from 'react';
import { PomodoroSettings, PomodoroStatus } from '../types';
import { Timer, Play, Pause, SkipForward, RefreshCw } from 'lucide-react';
import { usePomodoro } from '../hooks/usePomodoro';

interface PomodoroTimerProps {
  settings: PomodoroSettings;
}

const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ settings }) => {
  const { 
    status, 
    formatTimeLeft, 
    isActive, 
    sessionCount,
    start, 
    pause, 
    resume, 
    stop, 
    skip 
  } = usePomodoro(settings);
  
  const getStatusColor = () => {
    switch (status) {
      case 'work':
        return 'text-red-500 dark:text-red-400';
      case 'break':
        return 'text-green-500 dark:text-green-400';
      case 'longBreak':
        return 'text-blue-500 dark:text-blue-400';
      default:
        return 'text-gray-500 dark:text-gray-400';
    }
  };
  
  const getStatusText = () => {
    switch (status) {
      case 'work':
        return 'Working';
      case 'break':
        return 'Short Break';
      case 'longBreak':
        return 'Long Break';
      default:
        return 'Ready';
    }
  };
  
  const getProgressPercentage = () => {
    if (status === 'idle') return 0;
    
    let totalTime;
    if (status === 'work') {
      totalTime = settings.workDuration * 60;
    } else if (status === 'break') {
      totalTime = settings.breakDuration * 60;
    } else {
      totalTime = settings.longBreakDuration * 60;
    }
    
    return 360 * (1 - formatTimeLeft().split(':')[0] / totalTime);
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Timer className="w-5 h-5 text-purple-500" />
            <h3 className="font-medium text-gray-800 dark:text-gray-200">Pomodoro Timer</h3>
          </div>
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
        
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-40 h-40 mx-auto mb-4">
            {/* Circle background */}
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="5"
                className="dark:stroke-gray-700"
              />
              {status !== 'idle' && (
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke={status === 'work' ? '#ef4444' : status === 'break' ? '#10b981' : '#3b82f6'}
                  strokeWidth="5"
                  strokeDasharray="283"
                  strokeDashoffset={getProgressPercentage()}
                  transform="rotate(-90 50 50)"
                  className="transition-all duration-1000 ease-linear"
                />
              )}
            </svg>
            <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
              <span className={`text-4xl font-bold ${getStatusColor()}`}>
                {status === 'idle' ? '00:00' : formatTimeLeft()}
              </span>
              {status !== 'idle' && (
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Session {sessionCount + (status === 'work' ? 1 : 0)}/{settings.sessionsBeforeLongBreak}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex space-x-4 mt-2">
            {status === 'idle' ? (
              <button
                onClick={start}
                className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-800/50 transition-colors duration-200"
                title="Start"
              >
                <Play className="w-5 h-5" />
              </button>
            ) : isActive ? (
              <button
                onClick={pause}
                className="p-2 rounded-full bg-amber-100 text-amber-600 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-800/50 transition-colors duration-200"
                title="Pause"
              >
                <Pause className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={resume}
                className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-800/50 transition-colors duration-200"
                title="Resume"
              >
                <Play className="w-5 h-5" />
              </button>
            )}
            
            <button
              onClick={skip}
              className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-800/50 transition-colors duration-200"
              title="Skip"
              disabled={status === 'idle'}
            >
              <SkipForward className={`w-5 h-5 ${status === 'idle' ? 'opacity-50' : ''}`} />
            </button>
            
            <button
              onClick={stop}
              className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-800/50 transition-colors duration-200"
              title="Reset"
              disabled={status === 'idle'}
            >
              <RefreshCw className={`w-5 h-5 ${status === 'idle' ? 'opacity-50' : ''}`} />
            </button>
          </div>
          
          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="font-medium text-gray-700 dark:text-gray-300">Work</div>
                <div>{settings.workDuration} min</div>
              </div>
              <div>
                <div className="font-medium text-gray-700 dark:text-gray-300">Break</div>
                <div>{settings.breakDuration} min</div>
              </div>
              <div>
                <div className="font-medium text-gray-700 dark:text-gray-300">Long Break</div>
                <div>{settings.longBreakDuration} min</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;