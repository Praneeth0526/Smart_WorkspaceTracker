export interface EnvironmentalData {
  light: {
    value: number;
    unit: string;
    optimal: [number, number];
    history: DataPoint[];
  };
  temperature: {
    value: number;
    unit: string;
    optimal: [number, number];
    history: DataPoint[];
  };
  humidity: {
    value: number;
    unit: string;
    optimal: [number, number];
    history: DataPoint[];
  };
  
  noise: {
    value: number;
    unit: string;
    optimal: [number, number];
    history: DataPoint[];
  };
  timestamp: string;
}

export interface DataPoint {
  value: number;
  timestamp: string;
}

export interface AISuggestion {
  id: string;
  type: string; // or 'info' | 'warning' | 'alert' | 'success'
  message: string;
  action: {
    label: string;
    command: string;
  };
  actionCommand: string;
  parameter: number;
  // Note: If you're using 'actionable' property in your components, add it here
  actionable?: boolean;
}

export interface PomodoroSettings {
  workDuration: number;
  breakDuration: number;
  longBreakDuration: number;
  sessionsBeforeLongBreak: number;
}

export type PomodoroStatus = 'idle' | 'work' | 'break' | 'longBreak';

export interface UserPreferences {
  light: any;
  lightPreference: [number, number];
  temperaturePreference: [number, number];
  humidityPreference: [number, number];
  airQualityPreference: [number, number];
  noisePreference: [number, number];
  theme: 'light' | 'dark' | 'system';
  pomodoroSettings: PomodoroSettings;
}