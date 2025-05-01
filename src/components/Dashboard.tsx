import React, { useState, useEffect } from 'react';
import { useEnvironmentalData } from '../hooks/useEnvironmentalData';
import { useThingSpeak } from '../hooks/useThingSpeak';
import { mockUserPreferences } from '../utils/mockData';
import { AIService } from '../services/aiService';
import { AISuggestion } from '../types';
import MetricCard from './MetricCard';
import AISuggestions from './AISuggestions';
import PomodoroTimer from './PomodoroTimer';
import Reports from './Reports';
import Settings from './Settings';
import { Activity, Moon, Sun, Menu, X, LayoutDashboard, FileText, Settings as SettingsIcon } from 'lucide-react';

const Dashboard: React.FC = () => {
  // Get environmental data from your existing hook
  const { data, sendCommand } = useEnvironmentalData();
  
  // ThingSpeak credentials
  const THINGSPEAK_API_KEY = import.meta.env.VITE_THINGSPEAK_API_KEY; // Your read API key
  const THINGSPEAK_CHANNEL_ID = import.meta.env.VITE_THINGSPEAK_CHANNEL_ID; // Your channel ID
  
  // Get all ThingSpeak data
  const { 
    lightIntensity, 
    lightHistory,
    noiseLevel,
    noiseHistory,
    humidityLevel,
    humidityHistory,
    temperatureLevel,
    temperatureHistory
  } = useThingSpeak(
    THINGSPEAK_API_KEY,
    THINGSPEAK_CHANNEL_ID
  );
  
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'reports' | 'settings'>('dashboard');
  const [pomodoroSettings, setPomodoroSettings] = useState(mockUserPreferences.pomodoroSettings);
  
  // Add state for AI-generated suggestions
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Create objects for each metric - properly formatted
  const lightData = {
    value: lightIntensity !== null ? lightIntensity : data.light.value,
    unit: data.light.unit,
    optimal: data.light.optimal,
    history: lightHistory?.length > 0 ? lightHistory : data.light.history
  };
  
  const noiseData = {
    value: noiseLevel !== null ? noiseLevel : data.noise.value,
    unit: data.noise.unit,
    optimal: data.noise.optimal,
    history: noiseHistory?.length > 0 ? noiseHistory : data.noise.history
  };

  const humidityData = {
    value: humidityLevel !== null ? humidityLevel : data.humidity.value,
    unit: data.humidity.unit,
    optimal: data.humidity.optimal,
    history: humidityHistory?.length > 0 ? humidityHistory : data.humidity.history
  };

  const temperatureData = {
    value: temperatureLevel !== null ? temperatureLevel : data.temperature.value,
    unit: data.temperature.unit,
    optimal: data.temperature.optimal,
    history: temperatureHistory?.length > 0 ? temperatureHistory : data.temperature.history
  };

  // Generate AI suggestions based on ThingSpeak data
  useEffect(() => {
    const generateSuggestions = async () => {
      try {
        setLoading(true);
        
        // Only generate suggestions if we have real-time data
        if (lightIntensity !== null || noiseLevel !== null || 
            humidityLevel !== null || temperatureLevel !== null) {
          
          // Ensure optimal values are strings, not arrays
          const aiSuggestions = await AIService.generateSuggestions({
            light: {
              value: lightData.value,
              unit: lightData.unit,
              optimal: typeof lightData.optimal === 'string' ? lightData.optimal : `${lightData.optimal[0]}-${lightData.optimal[1]}`
            },
            temperature: {
              value: temperatureData.value,
              unit: temperatureData.unit,
              optimal: typeof temperatureData.optimal === 'string' ? temperatureData.optimal : `${temperatureData.optimal[0]}-${temperatureData.optimal[1]}`
            },
            humidity: {
              value: humidityData.value,
              unit: humidityData.unit,
              optimal: typeof humidityData.optimal === 'string' ? humidityData.optimal : `${humidityData.optimal[0]}-${humidityData.optimal[1]}`
            },
            noise: {
              value: noiseData.value,
              unit: noiseData.unit,
              optimal: typeof noiseData.optimal === 'string' ? noiseData.optimal : `${noiseData.optimal[0]}-${noiseData.optimal[1]}`
            }
          });
          
          setSuggestions(aiSuggestions);
        }
      } catch (error) {
        console.error('Error generating AI suggestions:', error);
        // Set default suggestions if API call fails
        setSuggestions([{
          id: 'error-suggestion',
          type: 'info',
          message: 'Unable to analyze your workspace conditions right now.',
          action: {
            label: 'Try again',
            command: 'refresh'
          },
          actionCommand: 'refresh', // For backward compatibility
          parameter: 0,
          actionable: true
        }]);
      } finally {
        setLoading(false);
      }
    };
    
    generateSuggestions();
    
    // Set up polling for new suggestions every 5 minutes
    const interval = setInterval(() => {
      generateSuggestions();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [
    // Only regenerate when values change significantly
    Math.round(lightData.value / 20),
    Math.round(temperatureData.value),
    Math.round(humidityData.value / 5),
    Math.round(noiseData.value / 5)
  ]);
  
  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };
  
  // Handle sidebar toggle for mobile
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Get icon and text color based on active state
  const getNavItemStyles = (tabName: 'dashboard' | 'reports' | 'settings') => {
    const isActive = activeTab === tabName;
    return isActive
      ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700';
  };
  
  // Wrapper for the sendCommand function to handle different suggestion formats
  const handleActionClick = (actionCommand: string, parameter: number) => {
    console.log(`Executing command: ${actionCommand} with parameter: ${parameter}`);
    
    if (actionCommand === 'refresh') {
      // Just reload AI suggestions
      setLoading(true);
      setTimeout(() => setLoading(false), 1000);
      return;
    }
    
    // Send the actual command to your device handler
    sendCommand(actionCommand, parameter);
  };
  
  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200`}>
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <button 
              className="md:hidden mr-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={toggleSidebar}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center">
              <Activity className="w-6 h-6 text-purple-600 dark:text-purple-500 mr-2" />
              <h1 className="text-xl font-semibold">WorkspaceTracker</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button 
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              onClick={toggleTheme}
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </header>
      
      {/* Sidebar for mobile */}
      <div className={`fixed inset-0 z-40 md:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={toggleSidebar} />
        
        <div className="fixed inset-y-0 left-0 flex flex-col w-64 max-w-sm bg-white dark:bg-gray-800 shadow-xl">
          <div className="p-4 flex items-center justify-between border-b dark:border-gray-700">
            <div className="flex items-center">
              <Activity className="w-6 h-6 text-purple-600 dark:text-purple-500 mr-2" />
              <h2 className="text-xl font-semibold">WorkspaceTracker</h2>
            </div>
            <button
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={toggleSidebar}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-4 flex-1 overflow-y-auto">
            <nav className="space-y-1">
              <button
                onClick={() => {
                  setActiveTab('dashboard');
                  setSidebarOpen(false);
                }}
                className={`flex items-center space-x-2 w-full px-3 py-2 rounded-md transition-colors ${getNavItemStyles('dashboard')}`}
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('reports');
                  setSidebarOpen(false);
                }}
                className={`flex items-center space-x-2 w-full px-3 py-2 rounded-md transition-colors ${getNavItemStyles('reports')}`}
              >
                <FileText className="w-5 h-5" />
                <span>Reports</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('settings');
                  setSidebarOpen(false);
                }}
                className={`flex items-center space-x-2 w-full px-3 py-2 rounded-md transition-colors ${getNavItemStyles('settings')}`}
              >
                <SettingsIcon className="w-5 h-5" />
                <span>Settings</span>
              </button>
            </nav>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar for larger screens */}
          <div className="hidden md:block col-span-1 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
              <div className="p-4">
                <h3 className="font-medium text-lg text-gray-800 dark:text-gray-200 mb-4">Workspace Health</h3>
                <nav className="space-y-1">
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`flex items-center space-x-2 w-full px-3 py-2 rounded-md transition-colors ${getNavItemStyles('dashboard')}`}
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    <span>Dashboard</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('reports')}
                    className={`flex items-center space-x-2 w-full px-3 py-2 rounded-md transition-colors ${getNavItemStyles('reports')}`}
                  >
                    <FileText className="w-5 h-5" />
                    <span>Reports</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`flex items-center space-x-2 w-full px-3 py-2 rounded-md transition-colors ${getNavItemStyles('settings')}`}
                  >
                    <SettingsIcon className="w-5 h-5" />
                    <span>Settings</span>
                  </button>
                </nav>
              </div>
            </div>
            
            <PomodoroTimer settings={pomodoroSettings} />
          </div>
          
          {/* Main dashboard content */}
          <div className="col-span-1 md:col-span-3 space-y-6">
            {activeTab === 'dashboard' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* This MetricCard uses ThingSpeak data for Light */}
                  <MetricCard 
                    title="Light Intensity" 
                    value={lightData.value} 
                    unit={lightData.unit} 
                    optimal={lightData.optimal} 
                    history={lightData.history} 
                    type="light"
                  />
                  {/* These MetricCards use ThingSpeak data too */}
                  <MetricCard 
                    title="Temperature" 
                    value={temperatureData.value} 
                    unit={temperatureData.unit} 
                    optimal={temperatureData.optimal} 
                    history={temperatureData.history}
                    type="temperature"
                  />

                  <MetricCard 
                    title="Humidity" 
                    value={humidityData.value} 
                    unit={humidityData.unit} 
                    optimal={humidityData.optimal} 
                    history={humidityData.history}
                    type="humidity"
                  />
          
                  {/* This MetricCard uses ThingSpeak data for Noise */}
                  <MetricCard 
                    title="Noise Level" 
                    value={noiseData.value} 
                    unit={noiseData.unit} 
                    optimal={noiseData.optimal} 
                    history={noiseData.history}
                    type="noise"
                  />
                  <div className="block md:hidden">
                    <PomodoroTimer settings={pomodoroSettings} />
                  </div>
                </div>
                
                {/* Use our own AI-generated suggestions based on ThingSpeak data */}
                <AISuggestions 
                  suggestions={suggestions} 
                  onActionClick={(command) => handleActionClick(command, 0)}
                  loading={loading}
                />
              </>
            )}
            
            {activeTab === 'reports' && <Reports />}
            
            {activeTab === 'settings' && (
              <Settings 
                pomodoroSettings={pomodoroSettings}
                onPomodoroSettingsChange={setPomodoroSettings}
                theme={theme}
                onThemeChange={setTheme}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;