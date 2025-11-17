import { useState, useEffect } from 'react'
import { supabase } from '../../services/supabase'
import './Profile.css'

export default function ProfileStats({ userId }) {
  const [stats, setStats] = useState({
    postsCount: 0,
    followersCount: 0,
    followingCount: 0,
    commentsCount: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [userId])

  const loadStats = async () => {
    try {
      // Get posts count
      console.log('[ProfileStats] Loading posts count for user:', userId)
      const { count: postsCount } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      // Get followers count
      console.log('[ProfileStats] Loading followers count for user:', userId)
      const { count: followersCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId)

      // Get following count
      console.log('[ProfileStats] Loading following count for user:', userId)
      const { count: followingCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', userId)

      // Get comments count
      console.log('[ProfileStats] Loading comments count for user:', userId)
      const { count: commentsCount } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      setStats({
        postsCount: postsCount || 0,
        followersCount: followersCount || 0,
        followingCount: followingCount || 0,
        commentsCount: commentsCount || 0
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="profile-stats loading">Loading stats...</div>
  }

  return (
    <div className="profile-stats">
      <div className="stat-item">
        <span className="stat-value">{stats.postsCount}</span>
        <span className="stat-label">Posts</span>
      </div>
      <div className="stat-item">
        <span className="stat-value">{stats.commentsCount}</span>
        <span className="stat-label">Comments</span>
      </div>
      <div className="stat-item">
        <span className="stat-value">{stats.followersCount}</span>
        <span className="stat-label">Followers</span>
      </div>
      <div className="stat-item">
        <span className="stat-value">{stats.followingCount}</span>
        <span className="stat-label">Following</span>
      </div>
    </div>
  )
}
