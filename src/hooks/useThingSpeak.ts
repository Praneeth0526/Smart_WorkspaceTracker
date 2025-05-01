import { useState, useEffect } from 'react';
import { ThingSpeakService } from '../services/thingspeak';
import { DataPoint } from '../types';

export function useThingSpeak(apiKey: string, channelId: string) {
  const [lightIntensity, setLightIntensity] = useState<number | null>(null);
  const [lightHistory, setLightHistory] = useState<DataPoint[]>([]);
  const [noiseLevel, setNoiseLevel] = useState<number | null>(null);
  const [noiseHistory, setNoiseHistory] = useState<DataPoint[]>([]);
  const [humidityLevel, sethumidityLevel] = useState<number | null>(null);
  const [humidityHistory, setHumidityHistory] = useState<DataPoint[]>([]);
  const [temperatureLevel, setTemperatureLevel] = useState<number | null>(null);
  const [temperatureHistory, setTemperatureHistory] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const thingSpeakService = new ThingSpeakService(apiKey, channelId);
  
  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get light intensity history and latest value
        const lightHistoryData = await thingSpeakService.getLightIntensityData();
        setLightHistory(lightHistoryData);
        
        const latestLight = await thingSpeakService.getLatestLightIntensity();
        setLightIntensity(latestLight);
        
        // Get noise level history and latest value
        const noiseHistoryData = await thingSpeakService.getNoiseData();
        setNoiseHistory(noiseHistoryData);
        
        const latestNoise = await thingSpeakService.getLatestNoise();
        setNoiseLevel(latestNoise);

        // Get humidity level history and latest value
        const humidityHistoryData = await thingSpeakService.getHumidityData();
        setHumidityHistory(humidityHistoryData);

        const latestHumidity = await thingSpeakService.getLatestHumidity();
        sethumidityLevel(latestHumidity);

        // Get temperature level history and latest value
        const temperatureHistoryData = await thingSpeakService.getTemperatureData(); 
        setTemperatureHistory(temperatureHistoryData);

        const latestTemperature = await thingSpeakService.getLatestTemperature();
        setTemperatureLevel(latestTemperature);
        // Clear any previous error
        
        setError(null);
      } catch (err) {
        setError('Failed to fetch ThingSpeak data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Set up polling for real-time updates
    const interval = setInterval(async () => {
      try {
        // Update light intensity
        const latestLight = await thingSpeakService.getLatestLightIntensity();
        if (latestLight !== null) {
          setLightIntensity(latestLight);
          
          const newLightPoint: DataPoint = {
            value: latestLight,
            timestamp: new Date().toISOString()
          };
          
          setLightHistory(prev => [...prev.slice(1), newLightPoint]);
        }
        
        // Update noise level
        const latestNoise = await thingSpeakService.getLatestNoise();
        if (latestNoise !== null) {
          setNoiseLevel(latestNoise);
          
          const newNoisePoint: DataPoint = {
            value: latestNoise,
            timestamp: new Date().toISOString()
          };
          
          setNoiseHistory(prev => [...prev.slice(1), newNoisePoint]);
        }
        // Update humidity level
        const latestHumidity = await thingSpeakService.getLatestHumidity();
        if (latestHumidity !== null) {
          sethumidityLevel(latestHumidity);
          
          const newHumidityPoint: DataPoint = {
            value: latestHumidity,
            timestamp: new Date().toISOString()
          };
          
          setHumidityHistory(prev => [...prev.slice(1), newHumidityPoint]);
        }
        // Update temperature level
        const latestTemperature = await thingSpeakService.getLatestTemperature();
        if (latestTemperature !== null) {
          setTemperatureLevel(latestTemperature);
          
          const newTemperaturePoint: DataPoint = {
            value: latestTemperature,
            timestamp: new Date().toISOString()
          };
          
          setTemperatureHistory(prev => [...prev.slice(1), newTemperaturePoint]);
        }
      } catch (err) {
        console.error('Error polling ThingSpeak:', err);
      }
    }, 15000); // Poll every 15 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  return { 
    lightIntensity, 
    lightHistory, 
    noiseLevel, 
    noiseHistory,
    humidityLevel,
    humidityHistory,
    temperatureLevel,
    temperatureHistory,
    loading, 
    error 
  };
}