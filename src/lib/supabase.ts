import { createClient } from '@supabase/supabase-js';

// Works in both browser (import.meta.env) and Node.js (process.env)
const supabaseUrl = typeof import.meta !== 'undefined' && import.meta.env 
  ? import.meta.env.VITE_SUPABASE_URL 
  : process.env.VITE_SUPABASE_URL;

const supabaseAnonKey = typeof import.meta !== 'undefined' && import.meta.env
  ? import.meta.env.VITE_SUPABASE_ANON_KEY
  : process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database Types
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          created_at: string;
          email: string | null;
          onboarding_completed: boolean;
          preferences: Json | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          email?: string | null;
          onboarding_completed?: boolean;
          preferences?: Json | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          email?: string | null;
          onboarding_completed?: boolean;
          preferences?: Json | null;
        };
      };
      venues: {
        Row: {
          id: string;
          name: string;
          category: string;
          description: string;
          location: Json;
          price_level: number;
          rating: number;
          photos: string[];
          tags: string[];
          google_place_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category: string;
          description: string;
          location: Json;
          price_level: number;
          rating: number;
          photos?: string[];
          tags?: string[];
          google_place_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string;
          description?: string;
          location?: Json;
          price_level?: number;
          rating?: number;
          photos?: string[];
          tags?: string[];
          google_place_id?: string | null;
          created_at?: string;
        };
      };
      swipe_interactions: {
        Row: {
          id: string;
          user_id: string;
          venue_id: string;
          action: 'like' | 'dislike' | 'skip';
          timestamp: string;
          time_spent_ms: number;
          context: Json | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          venue_id: string;
          action: 'like' | 'dislike' | 'skip';
          timestamp?: string;
          time_spent_ms?: number;
          context?: Json | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          venue_id?: string;
          action?: 'like' | 'dislike' | 'skip';
          timestamp?: string;
          time_spent_ms?: number;
          context?: Json | null;
        };
      };
      user_saves: {
        Row: {
          id: string;
          user_id: string;
          venue_id: string;
          saved_at: string;
          visited: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          venue_id: string;
          saved_at?: string;
          visited?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          venue_id?: string;
          saved_at?: string;
          visited?: boolean;
        };
      };
    };
  };
};

type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];