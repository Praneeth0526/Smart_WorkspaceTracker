import React from 'react';
import { LineChart, BarChart, Calendar } from 'lucide-react';

const Reports: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Weekly Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <LineChart className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <h3 className="font-medium text-amber-900 dark:text-amber-300">Productivity Score</h3>
            </div>
            <p className="text-2xl font-bold mt-2 text-amber-700 dark:text-amber-300">87%</p>
            <p className="text-sm text-amber-600 dark:text-amber-400">+5% from last week</p>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <BarChart className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h3 className="font-medium text-purple-900 dark:text-purple-300">Focus Time</h3>
            </div>
            <p className="text-2xl font-bold mt-2 text-purple-700 dark:text-purple-300">32.5h</p>
            <p className="text-sm text-purple-600 dark:text-purple-400">6.5h daily average</p>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-medium text-blue-900 dark:text-blue-300">Pomodoro Sessions</h3>
            </div>
            <p className="text-2xl font-bold mt-2 text-blue-700 dark:text-blue-300">24</p>
            <p className="text-sm text-blue-600 dark:text-blue-400">4.8 daily average</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Environmental Insights</h2>
        <div className="space-y-4">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <h3 className="font-medium text-green-900 dark:text-green-300 mb-2">Optimal Conditions</h3>
            <p className="text-sm text-green-700 dark:text-green-400">Your workspace maintained ideal conditions for 85% of your working hours this week. Temperature and humidity levels were particularly stable.</p>
          </div>
          
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <h3 className="font-medium text-red-900 dark:text-red-300 mb-2">Areas for Improvement</h3>
            <p className="text-sm text-red-700 dark:text-red-400">Light levels fluctuated during afternoon hours. Consider adjusting your blinds or lighting setup between 2 PM and 4 PM.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;