import { AISuggestion } from '../types';

// Removed local declaration of AISuggestion to avoid conflict with the imported one.

interface EnvironmentalReadings {
  light: { value: number, unit: string, optimal: string, history?: number[] };
  temperature: { value: number, unit: string, optimal: string, history?: number[] };
  humidity: { value: number, unit: string, optimal: string, history?: number[] };
  noise: { value: number, unit: string, optimal: string, history?: number[] };
}

export class AIService {
  // Hugging Face has a free tier for API usage
  private static readonly API_URL = 'https://api-inference.huggingface.co/models/facebook/bart-large-cnn';
  private static readonly HUGGINGFACE_TOKEN = import.meta.env.VITE_HUGGINGFACE_TOKEN || '';

  static async generateSuggestions(data: EnvironmentalReadings): Promise<AISuggestion[]> {
    try {
      const prompt = this.createPrompt(data);
      const suggestions = await this.fetchAISuggestions(prompt);
      return suggestions;
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
      return this.getFallbackSuggestions(data);
    }
  }

  private static createPrompt(data: EnvironmentalReadings): string {
    // Add trend analysis if history is available
    const lightTrend = this.analyzeTrend(data.light.history);
    const tempTrend = this.analyzeTrend(data.temperature.history);
    const humidityTrend = this.analyzeTrend(data.humidity.history);
    const noiseTrend = this.analyzeTrend(data.noise.history);
    
    return `<s>[INST] You are an AI assistant specialized in workspace comfort and productivity.
Analyze these environmental readings and provide 1-3 actionable suggestions to improve the workspace.

Current readings:
- Light intensity: ${data.light.value} ${data.light.unit} (optimal range: ${data.light.optimal})${lightTrend ? ` (trend: ${lightTrend})` : ''}
- Temperature: ${data.temperature.value} ${data.temperature.unit} (optimal range: ${data.temperature.optimal})${tempTrend ? ` (trend: ${tempTrend})` : ''}
- Humidity: ${data.humidity.value} ${data.humidity.unit} (optimal range: ${data.humidity.optimal})${humidityTrend ? ` (trend: ${humidityTrend})` : ''}
- Noise level: ${data.noise.value} ${data.noise.unit} (optimal range: ${data.noise.optimal})${noiseTrend ? ` (trend: ${noiseTrend})` : ''}

For each suggestion, provide:
1. A message explaining the issue
2. A recommended action
3. The type of message (must be one of: info, warning, alert, success)
4. An action command (use: increase_light, decrease_light, increase_temperature, decrease_temperature, increase_humidity, decrease_humidity, reduce_noise, or add_ambient_sound)
5. A parameter value to adjust by

Format your response in valid JSON like this:
[
  {
    "id": "unique-suggestion-id",
    "type": "info|warning|alert|success",
    "message": "Detailed explanation of the issue",
    "action": {
      "label": "Your action label",
      "command": "your-command-identifier"
    },
    "actionCommand": "command_name",
    "parameter": 10
  }
]
Only return valid JSON, nothing else. [/INST]</s>`;
  }

  private static analyzeTrend(history?: number[]): string | null {
    if (!history || history.length < 3) return null;
    
    // Get the last few readings to analyze the trend
    const recentValues = history.slice(-3);
    const firstValue = recentValues[0];
    const lastValue = recentValues[recentValues.length - 1];
    const difference = lastValue - firstValue;
    
    // Return trend description
    if (Math.abs(difference) < (firstValue * 0.05)) return 'stable';
    return difference > 0 ? 'increasing' : 'decreasing';
  }

  private static async fetchAISuggestions(prompt: string): Promise<AISuggestion[]> {
    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.HUGGINGFACE_TOKEN}`
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 500,
            temperature: 0.7,
            return_full_text: false
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      // Handle different response formats from Hugging Face
      let suggestionsText = '';
      
      if (Array.isArray(data) && data[0] && data[0].generated_text) {
        suggestionsText = data[0].generated_text.trim();
      } else if (typeof data === 'object' && data.generated_text) {
        suggestionsText = data.generated_text.trim();
      } else {
        console.error('Unexpected response format:', data);
        throw new Error('Unexpected response format from API');
      }
      
      try {
        // Extract just the JSON part if there's additional text
        const jsonMatch = suggestionsText.match(/\[\s*\{[\s\S]*\}\s*\]/);
        const jsonString = jsonMatch ? jsonMatch[0] : suggestionsText;
        const parsed = JSON.parse(jsonString);
        
        // Validate and transform the response to match our expected structure
        return parsed.map((item: any) => ({
          id: item.id || `suggestion-${Math.random().toString(36).substring(2, 9)}`,
          type: item.type || 'info',
          message: item.message || 'No message provided',
          action: {
            label: item.action?.label || 'No action label',
            command: item.action?.command || 'none'
          },
          actionCommand: item.actionCommand || 'none',
          parameter: typeof item.parameter === 'number' ? item.parameter : 0
        }));
      } catch (error) {
        console.error('Failed to parse LLM response:', suggestionsText);
        throw new Error('Invalid response format from LLM');
      }
    } catch (error) {
      throw error;
    }
  }

  // Fallback suggestions if API call fails
  private static getFallbackSuggestions(data: EnvironmentalReadings): AISuggestion[] {
    const suggestions: AISuggestion[] = [];
    
    // Add temperature check
    if (this.isOutsideOptimalRange(data.temperature.value, data.temperature.optimal)) {
      suggestions.push({
        id: 'temperature-adjustment',
        type: 'warning',
        message: `Temperature (${data.temperature.value} ${data.temperature.unit}) is outside optimal range.`,
        action: {
          label: data.temperature.value > this.getUpperBound(data.temperature.optimal) ? 'Decrease temperature' : 'Increase temperature',
          command: data.temperature.value > this.getUpperBound(data.temperature.optimal) ? 'decrease_temperature' : 'increase_temperature'
        },
        actionCommand: data.temperature.value > this.getUpperBound(data.temperature.optimal) ? 'decrease_temperature' : 'increase_temperature',
        parameter: 2
      });
    }
    
    if (this.isOutsideOptimalRange(data.light.value, data.light.optimal)) {
      suggestions.push({
        id: 'light-adjustment',
        type: 'warning',
        message: `Light intensity (${data.light.value} ${data.light.unit}) is outside optimal range.`,
        action: {
          label: data.light.value > this.getUpperBound(data.light.optimal) ? 'Decrease lighting' : 'Increase lighting',
          command: data.light.value > this.getUpperBound(data.light.optimal) ? 'decrease_light' : 'increase_light'
        },
        actionCommand: data.light.value > this.getUpperBound(data.light.optimal) ? 'decrease_light' : 'increase_light',
        parameter: 20,
        severity: '',
        actionable: {
          label: '',
          command: ''
        }
      });
    }
    
    if (this.isOutsideOptimalRange(data.humidity.value, data.humidity.optimal)) {
      suggestions.push({
        id: 'humidity-adjustment',
        type: 'warning',
        message: `Humidity (${data.humidity.value} ${data.humidity.unit}) is outside optimal range.`,
        action: {
          label: data.humidity.value > this.getUpperBound(data.humidity.optimal) ? 'Decrease humidity' : 'Increase humidity',
          command: data.humidity.value > this.getUpperBound(data.humidity.optimal) ? 'decrease_humidity' : 'increase_humidity'
        },
        actionCommand: data.humidity.value > this.getUpperBound(data.humidity.optimal) ? 'decrease_humidity' : 'increase_humidity',
        parameter: 5,
        severity: '',
        actionable: {
          label: '',
          command: ''
        }
      });
    }
    
    if (this.isOutsideOptimalRange(data.noise.value, data.noise.optimal) && 
        data.noise.value > this.getUpperBound(data.noise.optimal)) {
      suggestions.push({
        id: 'noise-high',
        type: 'alert',
        message: `Noise level (${data.noise.value} ${data.noise.unit}) is too high.`,
        action: {
          label: 'Reduce noise sources',
          command: 'reduce_noise'
        },
        actionCommand: 'reduce_noise',
        parameter: 10,
        severity: '',
        actionable: {
          label: '',
          command: ''
        }
      });
    }
    
    return suggestions.slice(0, 3);
  }
  
  private static isOutsideOptimalRange(value: number, optimalRange: string): boolean {
    const [min, max] = optimalRange.split('-').map(n => parseInt(n));
    return value < min || value > max;
  }
  
  private static getUpperBound(optimalRange: string): number {
    return parseInt(optimalRange.split('-')[1]);
  }
  
  private static getLowerBound(optimalRange: string): number {
    return parseInt(optimalRange.split('-')[0]);
  }
}