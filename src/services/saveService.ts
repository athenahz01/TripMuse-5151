import { supabase } from '../lib/supabase';

export const saveService = {
  // Save a venue
  async saveVenue(userId: string, venueId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_saves')
        .upsert({
          user_id: userId,
          venue_id: venueId,
        });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error saving venue:', error);
      throw error;
    }
  },

  // Remove saved venue
  async unsaveVenue(userId: string, venueId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_saves')
        .delete()
        .eq('user_id', userId)
        .eq('venue_id', venueId);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error removing saved venue:', error);
      throw error;
    }
  },

  // Get saved venues
  async getSavedVenues(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('user_saves')
        .select('*, venues(*)')
        .eq('user_id', userId)
        .order('saved_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching saved venues:', error);
      return [];
    }
  },

  // Check if venue is saved
  async isVenueSaved(userId: string, venueId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_saves')
        .select('id')
        .eq('user_id', userId)
        .eq('venue_id', venueId)
        .single();
      
      return !error && !!data;
    } catch (error) {
      return false;
    }
  },
};