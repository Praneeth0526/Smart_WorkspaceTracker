import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export const subscribeToSensorData = (callback: (payload: any) => void) => {
  return supabase
    .channel('sensor-data')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'sensor_data',
      },
      callback
    )
    .subscribe();
};

export const updateSensorValue = async (
  sensorType: string,
  value: number
) => {
  const { data, error } = await supabase
    .from('sensor_data')
    .update({ value, updated_at: new Date().toISOString() })
    .eq('type', sensorType)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const sendCommandToHardware = async (command: string, value: number) => {
  const { data, error } = await supabase
    .from('hardware_commands')
    .insert([
      {
        command,
        value,
        status: 'pending',
      },
    ])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};