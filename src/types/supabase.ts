export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      sensor_data: {
        Row: {
          id: string
          type: string
          value: number
          optimal_min: number
          optimal_max: number
          unit: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          type: string
          value: number
          optimal_min: number
          optimal_max: number
          unit: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          type?: string
          value?: number
          optimal_min?: number
          optimal_max?: number
          unit?: string
          updated_at?: string | null
        }
      }
      hardware_commands: {
        Row: {
          id: string
          command: string
          value: number
          status: 'pending' | 'completed' | 'failed'
          created_at: string | null
          completed_at: string | null
        }
        Insert: {
          id?: string
          command: string
          value: number
          status?: 'pending' | 'completed' | 'failed'
          created_at?: string | null
          completed_at?: string | null
        }
        Update: {
          id?: string
          command?: string
          value?: number
          status?: 'pending' | 'completed' | 'failed'
          created_at?: string | null
          completed_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}