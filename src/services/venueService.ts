import { supabase } from '../lib/supabase';
import { Venue } from '../store/useTaste';

export const venueService = {
  // Get all venues
  async getVenues(): Promise<Venue[]> {
    try {
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .order('rating', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching venues:', error);
      return [];
    }
  },

  // Get venue by ID
  async getVenueById(venueId: string): Promise<Venue | null> {
    try {
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .eq('id', venueId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching venue:', error);
      return null;
    }
  },

  // Get venues by category
  async getVenuesByCategory(category: string): Promise<Venue[]> {
    try {
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .eq('category', category)
        .order('rating', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching venues by category:', error);
      return [];
    }
  },
};