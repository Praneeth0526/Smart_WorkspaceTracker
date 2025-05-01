import { EnvironmentalData, AISuggestion, UserPreferences } from '../types';

const generateHistoricalData = (
  baseValue: number, 
  variance: number, 
  count: number
) => {
  const now = new Date();
  return Array.from({ length: count }, (_, i) => {
    const timestamp = new Date(now.getTime() - (count - i) * 5 * 60000).toISOString();
    return {
      value: baseValue + (Math.random() * variance * 2 - variance),
      timestamp,
    };
  });
};

export const mockEnvironmentalData: EnvironmentalData = {
  light: {
    value: 512,
    unit: 'lux',
    optimal: [300, 500],
    history: generateHistoricalData(400, 150, 24),
  },
  temperature: {
    value: 24.7,
    unit: '°C',
    optimal: [21, 25],
    history: generateHistoricalData(23, 2, 24),
  },
  humidity: {
    value: 42,
    unit: '%',
    optimal: [40, 60],
    history: generateHistoricalData(45, 10, 24),
  },
  airQuality: {
    value: 850,
    unit: 'ppm',
    optimal: [400, 1000],
    history: generateHistoricalData(700, 200, 24),
  },
  noise: {
    value: 58,
    unit: 'dB',
    optimal: [40, 60],
    history: generateHistoricalData(50, 15, 24),
  },
  timestamp: new Date().toISOString(),
};

export const mockAISuggestions: AISuggestion[] = [
  {
    id: '1',
    type: 'light',
    message: 'Current light levels are too high. Consider dimming your lights or adjusting blinds.',
    severity: 'warning',
    actionable: true,
    action: {
      label: 'Dim lights',
      command: 'dim_lights',
    },
  },
  {
    id: '2',
    type: 'temperature',
    message: 'Temperature is within your preferred range.',
    severity: 'info',
    actionable: false,
  },
  {
    id: '3',
    type: 'humidity',
    message: 'Humidity is optimal for productivity.',
    severity: 'info',
    actionable: false,
  },
  {
    id: '4',
    type: 'airQuality',
    message: 'CO2 levels rising. Open a window or turn on air purifier.',
    severity: 'warning',
    actionable: true,
    action: {
      label: 'Turn on purifier',
      command: 'activate_purifier',
    },
  },
  {
    id: '5',
    type: 'noise',
    message: 'Noise levels are within acceptable range.',
    severity: 'info',
    actionable: false,
  },
];

export const mockUserPreferences: UserPreferences = {
  lightPreference: [300, 500],
  temperaturePreference: [20, 24],
  humidityPreference: [40, 60],
  airQualityPreference: [400, 1000],
  noisePreference: [35, 55],
  theme: 'system',
  pomodoroSettings: {
    workDuration: 25,
    breakDuration: 5,
    longBreakDuration: 15,
    sessionsBeforeLongBreak: 4,
  },
};

export const simulateDataUpdate = (): EnvironmentalData => {
  const data = { ...mockEnvironmentalData };
  
  data.light.value = Math.max(0, data.light.value + (Math.random() * 40 - 20));
  data.temperature.value = Math.max(15, Math.min(30, data.temperature.value + (Math.random() * 0.6 - 0.3)));
  data.humidity.value = Math.max(20, Math.min(80, data.humidity.value + (Math.random() * 4 - 2)));
  data.airQuality.value = Math.max(300, Math.min(1500, data.airQuality.value + (Math.random() * 60 - 30)));
  data.noise.value = Math.max(30, Math.min(80, data.noise.value + (Math.random() * 8 - 4)));
  
  data.timestamp = new Date().toISOString();
  
  // Update latest history entry
  data.light.history.push({ value: data.light.value, timestamp: data.timestamp });
  data.temperature.history.push({ value: data.temperature.value, timestamp: data.timestamp });
  data.humidity.history.push({ value: data.humidity.value, timestamp: data.timestamp });
  data.airQuality.history.push({ value: data.airQuality.value, timestamp: data.timestamp });
  data.noise.history.push({ value: data.noise.value, timestamp: data.timestamp });
  
  // Keep only the most recent 24 readings
  data.light.history = data.light.history.slice(-24);
  data.temperature.history = data.temperature.history.slice(-24);
  data.humidity.history = data.humidity.history.slice(-24);
  data.airQuality.history = data.airQuality.history.slice(-24);
  data.noise.history = data.noise.history.slice(-24);
  
  return data;
};