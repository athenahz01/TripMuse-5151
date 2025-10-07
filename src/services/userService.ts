import { supabase } from '../lib/supabase';

// Define UserPreferences type to match useTaste store
interface UserPreferences {
  interests: string[];
  traits: string[];
  budgetLevel: number;
  travelStyle: string;
  recentTrip?: string;
}

export const userService = {
  // Create or get user
  async getOrCreateUser(tempId?: string): Promise<string> {
    try {
      // Check if user exists in localStorage
      const existingId = tempId || localStorage.getItem('tripmuse_user_id');
      
      if (existingId) {
        const { data, error } = await supabase
          .from('users')
          .select('id')
          .eq('id', existingId)
          .single();
        
        if (data && !error) {
          return data.id;
        }
      }
      
      // Create new user
      const { data, error } = await supabase
        .from('users')
        .insert({
          onboarding_completed: false,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      localStorage.setItem('tripmuse_user_id', data.id);
      return data.id;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Save user preferences
  async savePreferences(
    userId: string,
    preferences: UserPreferences
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          preferences,
          onboarding_completed: true,
        })
        .eq('id', userId);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error saving preferences:', error);
      throw error;
    }
  },

  // Get user preferences
  async getPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('preferences')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data?.preferences as UserPreferences | null;
    } catch (error) {
      console.error('Error fetching preferences:', error);
      return null;
    }
  },
};