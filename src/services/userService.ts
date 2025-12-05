import { supabase } from '../lib/supabase'

export const userService = {
  /**
   * Get or create user in database
   */
  async getOrCreateUser(clientUserId: string): Promise<string> {
    try {
      // Check if user exists
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('id')
        .eq('id', clientUserId)
        .single()

      if (existingUser) {
        console.log('✅ User exists:', clientUserId)
        return existingUser.id
      }

      // User doesn't exist, create new one
      console.log('🆕 Creating new user:', clientUserId)
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          id: clientUserId,
          onboarding_completed: false,
          preferences: {}
        })
        .select()
        .single()

      if (insertError) {
        console.error('❌ Error creating user:', insertError)
        throw insertError
      }

      console.log('✅ User created successfully:', newUser.id)
      return newUser.id
    } catch (error) {
      console.error('Error in getOrCreateUser:', error)
      // Return the clientUserId anyway to allow the app to continue
      return clientUserId
    }
  },

  /**
   * Save user preferences
   */
  async savePreferences(
    userId: string,
    preferences: {
      interests: string[]
      traits: string[]
      budgetLevel: number
      travelStyle: string
    }
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          preferences,
          onboarding_completed: true
        })
        .eq('id', userId)

      if (error) throw error
      console.log('✅ Preferences saved for user:', userId)
    } catch (error) {
      console.error('Error saving preferences:', error)
    }
  },

  /**
   * Get user preferences
   */
  async getPreferences(userId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('preferences')
        .eq('id', userId)
        .single()

      if (error) throw error
      return data?.preferences || {}
    } catch (error) {
      console.error('Error getting preferences:', error)
      return {}
    }
  }
}