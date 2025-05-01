import React from 'react';
import { AISuggestion } from '../types';
import { AlertTriangle, CheckCircle, Info, Lightbulb, Zap } from 'lucide-react';

interface AISuggestionsProps {
  suggestions: AISuggestion[];
  onActionClick: (command: string) => void;
  loading: boolean;
}

const AISuggestions: React.FC<AISuggestionsProps> = ({ 
  suggestions, 
  onActionClick,
  loading
}) => {
  // Add this function at the beginning of your component
  const getSeverityFromType = (type: string): string => {
    switch (type) {
      case 'warning': return 'warning';
      case 'alert': return 'critical';
      case 'success': return 'info';
      case 'info':
      default: return 'info';
    }
  };

  // Get icon based on suggestion severity
  const getSuggestionIcon = (severity: string) => {
    switch (severity) {
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <h3 className="font-medium text-gray-800 dark:text-gray-200">AI Suggestions</h3>
          </div>
          <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
            <Zap className="w-3 h-3 inline mr-1" />
            ML-powered
          </span>
        </div>

        <div className="space-y-3 max-h-[320px] overflow-y-auto">
          {suggestions.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
              <p>All workspace conditions are optimal!</p>
            </div>
          ) : (
            suggestions.map((suggestion) => (
              <div 
                key={suggestion.id}
                className={`p-3 rounded-lg border-l-4 ${
                  suggestion.type === 'info' 
                    ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-600'
                    : getSeverityFromType(suggestion.type) === 'warning'
                      ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-600'
                      : 'border-red-400 bg-red-50 dark:bg-red-900/20 dark:border-red-600'
                } transition-all duration-300`}
              >
                <div className="flex items-start">
                  <div className="mr-3 mt-0.5">
                    {getSuggestionIcon(getSeverityFromType(suggestion.type))}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm ${
                      suggestion.type === 'info' 
                        ? 'text-blue-700 dark:text-blue-300'
                        : getSeverityFromType(suggestion.type) === 'warning'
                          ? 'text-amber-700 dark:text-amber-300'
                          : 'text-red-700 dark:text-red-300'
                    }`}>
                      {suggestion.message}
                    </p>
                    
                    {suggestion.action && (
                      <button
                        className={`mt-2 text-xs px-3 py-1 rounded-md ${
                          suggestion.type === 'info' 
                            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-800 dark:text-blue-200 dark:hover:bg-blue-700'
                            : getSeverityFromType(suggestion.type) === 'warning'
                              ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-800 dark:text-amber-200 dark:hover:bg-amber-700'
                              : 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-800 dark:text-red-200 dark:hover:bg-red-700'
                        } transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                        onClick={() => onActionClick(suggestion.action!.command)}
                        disabled={loading}
                      >
                        {loading ? 'Processing...' : suggestion.action.label}
                      </button>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    Just now
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AISuggestions;