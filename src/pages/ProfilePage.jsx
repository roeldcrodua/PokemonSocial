import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { postService } from '../services/postService'
import { supabase } from '../services/supabase'
import ProfileHeader from '../components/Profile/ProfileHeader'
import ProfileStats from '../components/Profile/ProfileStats'
import PostCard from '../components/Posts/PostCard'
import '../components/Profile/Profile.css'

export default function ProfilePage() {
  const { username } = useParams()
  const { user } = useAuth()
  const [profileUser, setProfileUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isOwnProfile, setIsOwnProfile] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [username, user])

  const loadProfile = async () => {
    try {
      setLoading(true)
      
      // Find user by username
      console.log('[ProfilePage] Fetching profile for username:', username)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single()

      if (profileError) throw profileError

      setProfileUser(profile)
      setIsOwnProfile(user?.id === profile.user_id)

      // Load user's posts
      console.log('[ProfilePage] Loading posts for user:', profile.user_id)
      const userPosts = await postService.getPosts({ userId: profile.user_id, limit: 50 })
      setPosts(userPosts)
      
      setError(null)
    } catch (err) {
      setError(err.message || 'Failed to load profile')
      console.error('Error loading profile:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading profile...</div>
      </div>
    )
  }

  if (error || !profileUser) {
    return (
      <div className="page-container">
        <div className="error-container">
          <h2>Profile Not Found</h2>
          <p>{error || 'This user does not exist.'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <ProfileHeader userId={profileUser.user_id} isOwnProfile={isOwnProfile} />
      <ProfileStats userId={profileUser.user_id} />
      
      <div className="profile-posts">
        <h2>Posts</h2>
        {posts.length === 0 ? (
          <div className="no-posts">
            <p>{isOwnProfile ? 'You haven\'t posted anything yet.' : 'No posts yet.'}</p>
          </div>
        ) : (
          <div className="posts-grid">
            {posts.map((post) => (
              <PostCard key={post.post_id} post={post} onLikeToggle={loadProfile} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
