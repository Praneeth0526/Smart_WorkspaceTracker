import React, { useState } from 'react';
import { Save, Sliders, Bell, Moon, Sun } from 'lucide-react';
import { PomodoroSettings } from '../types';

interface SettingsProps {
  pomodoroSettings: PomodoroSettings;
  onPomodoroSettingsChange: (settings: PomodoroSettings) => void;
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
}

const Settings: React.FC<SettingsProps> = ({
  pomodoroSettings,
  onPomodoroSettingsChange,
  theme,
  onThemeChange,
}) => {
  const [localSettings, setLocalSettings] = useState(pomodoroSettings);
  
  const handleSave = () => {
    onPomodoroSettingsChange(localSettings);
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-purple-500" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Pomodoro Settings</h2>
          </div>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors duration-200 flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Work Duration (minutes)
            </label>
            <input
              type="number"
              value={localSettings.workDuration}
              onChange={(e) => setLocalSettings({ ...localSettings, workDuration: parseInt(e.target.value) })}
              className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Break Duration (minutes)
            </label>
            <input
              type="number"
              value={localSettings.breakDuration}
              onChange={(e) => setLocalSettings({ ...localSettings, breakDuration: parseInt(e.target.value) })}
              className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Long Break Duration (minutes)
            </label>
            <input
              type="number"
              value={localSettings.longBreakDuration}
              onChange={(e) => setLocalSettings({ ...localSettings, longBreakDuration: parseInt(e.target.value) })}
              className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sessions Before Long Break
            </label>
            <input
              type="number"
              value={localSettings.sessionsBeforeLongBreak}
              onChange={(e) => setLocalSettings({ ...localSettings, sessionsBeforeLongBreak: parseInt(e.target.value) })}
              className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Bell className="w-5 h-5 text-purple-500" />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Notifications</h2>
        </div>
        
        <div className="space-y-4">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              className="w-4 h-4 text-purple-500 border-gray-300 rounded focus:ring-purple-500"
              defaultChecked
            />
            <span className="text-gray-700 dark:text-gray-300">Session start/end alerts</span>
          </label>
          
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              className="w-4 h-4 text-purple-500 border-gray-300 rounded focus:ring-purple-500"
              defaultChecked
            />
            <span className="text-gray-700 dark:text-gray-300">Environmental alerts</span>
          </label>
          
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              className="w-4 h-4 text-purple-500 border-gray-300 rounded focus:ring-purple-500"
              defaultChecked
            />
            <span className="text-gray-700 dark:text-gray-300">Daily summary</span>
          </label>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {theme === 'light' ? (
              <Sun className="w-5 h-5 text-purple-500" />
            ) : (
              <Moon className="w-5 h-5 text-purple-500" />
            )}
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Theme</h2>
          </div>
          <button
            onClick={() => onThemeChange(theme === 'light' ? 'dark' : 'light')}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center space-x-2"
          >
            {theme === 'light' ? (
              <>
                <Moon className="w-4 h-4" />
                <span>Switch to Dark</span>
              </>
            ) : (
              <>
                <Sun className="w-4 h-4" />
                <span>Switch to Light</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;