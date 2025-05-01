import { useState, useEffect } from 'react';
import { mockEnvironmentalData, mockAISuggestions } from '../utils/mockData';
import { EnvironmentalData, AISuggestion, DataPoint } from '../types';
import { ThingSpeakService } from '../services/thingspeak';

// ThingSpeak credentials
const THINGSPEAK_API_KEY = "30UR3E4YV4TMDUL4"; // Your read API key
const THINGSPEAK_CHANNEL_ID = "2939374"; // Your channel ID

export function useEnvironmentalData() {
  const [data, setData] = useState<EnvironmentalData>(mockEnvironmentalData);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>(mockAISuggestions);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Initialize ThingSpeak service
  const thingSpeakService = new ThingSpeakService(THINGSPEAK_API_KEY, THINGSPEAK_CHANNEL_ID);
  
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Get initial light intensity data from ThingSpeak
        const lightHistory = await thingSpeakService.getLightIntensityData();
        const latestLight = await thingSpeakService.getLatestLightIntensity();
        
        if (lightHistory.length > 0 && latestLight !== null) {
          // Update only the light data, keep the rest of the mock data
          setData(prevData => ({
            ...prevData,
            light: {
              ...prevData.light,
              value: latestLight,
              history: lightHistory
            },
            timestamp: new Date().toISOString()
          }));
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    
    fetchInitialData();
    
    // Set up polling to periodically update light intensity
    const intervalId = setInterval(async () => {
      try {
        const latestLight = await thingSpeakService.getLatestLightIntensity();
        
        if (latestLight !== null) {
          setData(prevData => {
            // Create a new data point
            const newDataPoint: DataPoint = {
              value: latestLight,
              timestamp: new Date().toISOString()
            };
            
            // Add the new point and remove the oldest if needed
            const updatedHistory = [
              ...prevData.light.history.slice(1),
              newDataPoint
            ];
            
            return {
              ...prevData,
              light: {
                ...prevData.light,
                value: latestLight,
                history: updatedHistory
              },
              timestamp: new Date().toISOString()
            };
          });
        }
      } catch (error) {
        console.error('Error updating light data:', error);
      }
    }, 30000); // Update every 30 seconds
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Function to simulate sending commands (you can modify this if needed)
  const sendCommand = (command: string) => {
    console.log(`Sending command: ${command}`);
    // Here you would typically send a command to your smart home system
    // For now, we'll just log it
  };
  
  return { data, suggestions, loading, sendCommand };
}