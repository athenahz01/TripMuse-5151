import { supabase } from '../lib/supabase';

export type SwipeAction = 'like' | 'dislike' | 'skip';

export const swipeService = {
  // Record a swipe
  async recordSwipe(
    userId: string,
    venueId: string,
    action: SwipeAction,
    timeSpentMs: number,
    context?: Record<string, any>
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('swipe_interactions')
        .upsert({
          user_id: userId,
          venue_id: venueId,
          action,
          time_spent_ms: timeSpentMs,
          context: context || {},
          timestamp: new Date().toISOString(),
        });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error recording swipe:', error);
    }
  },

  // Get user's swipe history
  async getUserSwipes(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('swipe_interactions')
        .select('*, venues(*)')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching swipes:', error);
      return [];
    }
  },

  // Get liked venues
  async getLikedVenues(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('swipe_interactions')
        .select('*, venues(*)')
        .eq('user_id', userId)
        .eq('action', 'like')
        .order('timestamp', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching liked venues:', error);
      return [];
    }
  },

  // Get swiped venue IDs (to filter out)
  async getSwipedVenueIds(userId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('swipe_interactions')
        .select('venue_id')
        .eq('user_id', userId);
      
      if (error) throw error;
      return data?.map((item) => item.venue_id) || [];
    } catch (error) {
      console.error('Error fetching swiped venue IDs:', error);
      return [];
    }
  },
};