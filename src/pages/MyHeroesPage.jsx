import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { postService } from '../services/postService'
import PostCard from '../components/Posts/PostCard'
import { useNavigate } from 'react-router-dom'
import '../components/Posts/Posts.css'

export default function MyHeroesPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('created_at')

  useEffect(() => {
    if (!user) {
      navigate('/')
      return
    }
    fetchMyPosts()
  }, [user, sortBy, navigate])

  const fetchMyPosts = async () => {
    try {
      setLoading(true)
      console.log('[MyHeroesPage] Fetching posts for user:', user.id, 'sortBy:', sortBy)
      const data = await postService.getPosts({ 
        sortBy,
        userId: user.id,
        limit: 50 
      })
      setPosts(data)
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="home-page">
      <div className="home-header">
        <h1>🎮 My Pokemon Heroes</h1>
        <div className="sort-options">
          <button
            className={`sort-btn ${sortBy === 'created_at' ? 'active' : ''}`}
            onClick={() => setSortBy('created_at')}
          >
            Latest
          </button>
          <button
            className={`sort-btn ${sortBy === 'likes_count' ? 'active' : ''}`}
            onClick={() => setSortBy('likes_count')}
          >
            Most Liked
          </button>
          <button
            className={`sort-btn ${sortBy === 'comments_count' ? 'active' : ''}`}
            onClick={() => setSortBy('comments_count')}
          >
            Most Commented
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading your posts...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <p>You haven't shared any Pokemon heroes yet.</p>
          <p>Go to the home page and create your first post!</p>
        </div>
      ) : (
        <div className="posts-grid">
          {posts.map(post => (
            <PostCard 
              key={post.post_id} 
              post={post} 
              onLikeToggle={fetchMyPosts} 
            />
          ))}
        </div>
      )}
    </div>
  )
}
