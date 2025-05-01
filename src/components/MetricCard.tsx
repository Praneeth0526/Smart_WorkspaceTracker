import React from 'react';
import { DataPoint } from '../types';
import { AlertTriangle, CheckCircle, Info, Thermometer, Droplets, Wind, Volume2, Sun } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number;
  unit: string;
  optimal: [number, number];
  history: DataPoint[];
  type: 'light' | 'temperature' | 'humidity' | 'airQuality' | 'noise';
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, unit, optimal, history, type }) => {
  // Calculate if the current value is within optimal range
  const isOptimal = value >= optimal[0] && value <= optimal[1];
  
  // Calculate percentage for gauge (0-100)
  const getPercentage = () => {
    // Define min and max values for each metric type
    const ranges = {
      light: [0, 1000],
      temperature: [15, 30],
      humidity: [20, 80],
      airQuality: [300, 1500],
      noise: [30, 80]
    };
    
    const [min, max] = ranges[type];
    const percentage = ((value - min) / (max - min)) * 100;
    return Math.max(0, Math.min(100, percentage));
  };
  
  // Get icon based on type
  const getIcon = () => {
    switch (type) {
      case 'light':
        return <Sun className="w-5 h-5" />;
      case 'temperature':
        return <Thermometer className="w-5 h-5" />;
      case 'humidity':
        return <Droplets className="w-5 h-5" />;
      case 'airQuality':
        return <Wind className="w-5 h-5" />;
      case 'noise':
        return <Volume2 className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };
  
  // Get status color based on value
  const getStatusColor = () => {
    if (value < optimal[0]) {
      return 'text-amber-500';
    } else if (value > optimal[1]) {
      return 'text-red-500';
    }
    return 'text-green-500';
  };
  
  // Get status icon based on value
  const getStatusIcon = () => {
    if (value < optimal[0] || value > optimal[1]) {
      return <AlertTriangle className={`w-5 h-5 ${getStatusColor()}`} />;
    }
    return <CheckCircle className="w-5 h-5 text-green-500" />;
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-gray-500 dark:text-gray-400">
              {getIcon()}
            </span>
            <h3 className="font-medium text-gray-800 dark:text-gray-200">{title}</h3>
          </div>
          <span>{getStatusIcon()}</span>
        </div>
        
        <div className="flex items-end justify-between">
          <div>
            <span className="text-3xl font-semibold text-gray-800 dark:text-white">{value.toFixed(1)}</span>
            <span className="ml-1 text-gray-600 dark:text-gray-300">{unit}</span>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Optimal: {optimal[0]}-{optimal[1]} {unit}
          </div>
        </div>
        
        {/* Gauge visualization */}
        <div className="mt-4 relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`absolute top-0 left-0 h-full ${isOptimal ? 'bg-green-500' : 'bg-amber-500'} transition-all duration-300 ease-in-out`}
            style={{ width: `${getPercentage()}%` }}
          />
          <div 
            className="absolute top-0 h-full border-r-2 border-gray-500 dark:border-gray-300 transition-all duration-300"
            style={{ left: `${(optimal[0] / (type === 'light' ? 1000 : type === 'temperature' ? 30 : type === 'humidity' ? 80 : type === 'airQuality' ? 1500 : 80)) * 100}%` }}
          />
          <div 
            className="absolute top-0 h-full border-r-2 border-gray-500 dark:border-gray-300 transition-all duration-300"
            style={{ left: `${(optimal[1] / (type === 'light' ? 1000 : type === 'temperature' ? 30 : type === 'humidity' ? 80 : type === 'airQuality' ? 1500 : 80)) * 100}%` }}
          />
        </div>
        
        {/* Micro chart (sparkline) */}
        <div className="mt-4 h-12">
          <div className="flex items-end h-full w-full space-x-1">
            {history.slice(-12).map((point, index) => {
              const height = Math.max(
                10, 
                Math.min(
                  100, 
                  ((point.value - (type === 'light' ? 0 : type === 'temperature' ? 15 : type === 'humidity' ? 20 : type === 'airQuality' ? 300 : 30)) / 
                  (type === 'light' ? 1000 : type === 'temperature' ? 15 : type === 'humidity' ? 60 : type === 'airQuality' ? 1200 : 50)) * 100
                )
              );
              
              const isPointOptimal = point.value >= optimal[0] && point.value <= optimal[1];
              
              return (
                <div 
                  key={index}
                  className={`w-full ${isPointOptimal ? 'bg-green-400' : 'bg-amber-400'} rounded-sm transition-all duration-300 dark:opacity-80`}
                  style={{ height: `${height}%` }}
                  title={`${point.value} ${unit} at ${new Date(point.timestamp).toLocaleTimeString()}`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricCard;