import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { postService } from '../services/postService'
import PostCard from '../components/Posts/PostCard'
import PostForm from '../components/Posts/PostForm'
import '../components/Posts/Posts.css'

export default function HomePage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('created_at')
  const [showPostForm, setShowPostForm] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    fetchPosts()
  }, [sortBy])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      console.log('[HomePage] Fetching posts with sortBy:', sortBy)
      const data = await postService.getPosts({ 
        sortBy,
        limit: 20 
      })
      setPosts(data)
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePostCreated = () => {
    setShowPostForm(false)
    fetchPosts()
  }

  return (
    <div className="home-page">
      <div className="home-header">
        <h1>🔥 Pokemon Hero Feed</h1>
        <div className="home-actions">
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
          </div>

          {user && (
            <button
              className="btn-primary"
              onClick={() => setShowPostForm(!showPostForm)}
            >
              {showPostForm ? 'Cancel' : '+ Create Post'}
            </button>
          )}
        </div>
      </div>

      {showPostForm && (
        <PostForm 
          onSuccess={handlePostCreated} 
          onCancel={() => setShowPostForm(false)} 
        />
      )}

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading posts...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <p>No posts yet. Be the first to share your Pokemon hero!</p>
        </div>
      ) : (
        <div className="posts-grid">
          {posts.map(post => (
            <PostCard 
              key={post.post_id} 
              post={post} 
              onLikeToggle={fetchPosts} 
            />
          ))}
        </div>
      )}
    </div>
  )
}
