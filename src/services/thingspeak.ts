import axios from 'axios';
import { DataPoint } from '../types';

export class ThingSpeakService {
  private readonly apiKey: string;
  private readonly channelId: string;
  private readonly baseUrl = 'https://api.thingspeak.com';

  constructor(apiKey: string, channelId: string) {
    this.apiKey = apiKey;
    this.channelId = channelId;
  }

  async getLightIntensityData(count: number = 24): Promise<DataPoint[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/channels/${this.channelId}/feeds/last/${count}.json`,
        {
          params: { api_key: this.apiKey }
        }
      );

      // Light intensity is in field1
      return response.data.feeds.map((feed: any) => ({
        value: parseFloat(feed.field1) || 0,
        timestamp: feed.created_at
      }));
    } catch (error) {
      console.error('Error fetching light intensity data:', error);
      return [];
    }
  }

  async getLatestLightIntensity(): Promise<number | null> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/channels/${this.channelId}/feeds/last.json`,
        {
          params: { api_key: this.apiKey }
        }
      );

      return parseFloat(response.data.field1) || 0;
    } catch (error) {
      console.error('Error fetching latest light intensity:', error);
      return null;
    }
  }

  // New methods for noise level
  async getNoiseData(count: number = 24): Promise<DataPoint[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/channels/${this.channelId}/feeds/last/${count}.json`,
        {
          params: { api_key: this.apiKey }
        }
      );

      // Noise level is in field2
      return response.data.feeds.map((feed: any) => ({
        value: parseFloat(feed.field2) || 0,
        timestamp: feed.created_at
      }));
    } catch (error) {
      console.error('Error fetching noise data:', error);
      return [];
    }
  }

  async getLatestNoise(): Promise<number | null> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/channels/${this.channelId}/feeds/last.json`,
        {
          params: { api_key: this.apiKey }
        }
      );

      return parseFloat(response.data.field2) || 0;
    } catch (error) {
      console.error('Error fetching latest noise level:', error);
      return null;
    }
  }

  async getHumidityData(count: number = 24): Promise<DataPoint[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/channels/${this.channelId}/feeds/last/${count}.json`,
        {
          params: { api_key: this.apiKey }
        }
      );

      // Humidity is in field3
      return response.data.feeds.map((feed: any) => ({
        value: parseFloat(feed.field3) || 0,
        timestamp: feed.created_at
      }));
    } catch (error) {
      console.error('Error fetching humidity data:', error);
      return [];
    }
  }

  async getLatestHumidity(): Promise<number | null> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/channels/${this.channelId}/feeds/last.json`,
        {
          params: { api_key: this.apiKey }
        }
      );

      return parseFloat(response.data.field3) || 0;
    } catch (error) {
      console.error('Error fetching latest humidity:', error);
      return null;
    }
  }

  async getTemperatureData(count: number = 24): Promise<DataPoint[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/channels/${this.channelId}/feeds/last/${count}.json`,
        {
          params: { api_key: this.apiKey }
        }
      );

      // Temperature is in field4
      return response.data.feeds.map((feed: any) => ({
        value: parseFloat(feed.field4) || 0,
        timestamp: feed.created_at
      }));
    } catch (error) {
      console.error('Error fetching temperature data:', error);
      return [];
    }
  }

  async getLatestTemperature(): Promise<number | null> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/channels/${this.channelId}/feeds/last.json`,
        {
          params: { api_key: this.apiKey }
        }
      );

      return parseFloat(response.data.field4) || 0;
    } catch (error) {
      console.error('Error fetching latest temperature:', error);
      return null;
    }
  }
}