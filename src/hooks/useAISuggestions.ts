import { useState, useEffect } from 'react';
import { AIService } from '../services/aiService';
import { AISuggestion } from '../types';

export function useAISuggestions(
  lightData: { value: number, unit: string, optimal: string },
  temperatureData: { value: number, unit: string, optimal: string },
  humidityData: { value: number, unit: string, optimal: string },
  noiseData: { value: number, unit: string, optimal: string }
) {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Function to generate suggestions based on current data
  const generateSuggestions = async () => {
    try {
      setLoading(true);
      const aiSuggestions = await AIService.generateSuggestions({
        light: lightData,
        temperature: temperatureData,
        humidity: humidityData,
        noise: noiseData
      });
      setSuggestions(aiSuggestions);
      setError(null);
    } catch (err) {
      console.error('Failed to generate AI suggestions:', err);
      setError('Failed to generate suggestions');
      // Set a placeholder suggestion on error
      setSuggestions([{
        id: 'error-suggestion',
        type: 'info',
        message: 'Unable to analyze your workspace conditions right now.',
        action: { 
          label: 'Try again later', 
          command: 'refresh' 
        },
        actionCommand: 'refresh',
        parameter: 0
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Generate suggestions when data changes significantly
  useEffect(() => {
    generateSuggestions();
    
    // Only poll for new suggestions every 5 minutes
    const interval = setInterval(generateSuggestions, 5 * 60 * 1000);
    
    // Properly return the cleanup function
    return () => clearInterval(interval);
  }, [
    // Dependencies with null checks
  ]);

  // Manually refresh suggestions
  const refreshSuggestions = () => {
    generateSuggestions();
  };

  return {
    suggestions,
    loading,
    error,
    refreshSuggestions
  };
}