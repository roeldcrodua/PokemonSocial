import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'

export function useProfile(userId) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadProfile = async () => {
    try {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (fetchError) throw fetchError

      setProfile(data)
      setError(null)
    } catch (err) {
      setError(err.message || 'Failed to load profile')
      console.error('Error loading profile:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userId) {
      loadProfile()
    }
  }, [userId])

  const refresh = () => {
    loadProfile()
  }

  return { profile, loading, error, refresh }
}
