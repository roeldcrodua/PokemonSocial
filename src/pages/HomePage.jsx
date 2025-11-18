import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useSearchParams } from 'react-router-dom'
import { postService } from '../services/postService'
import PostCard from '../components/Posts/PostCard'
import PostForm from '../components/Posts/PostForm'
import '../components/Posts/Posts.css'

export default function HomePage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(0)
  const [sortBy, setSortBy] = useState('created_at')
  const [showPostForm, setShowPostForm] = useState(false)
  const [repostId, setRepostId] = useState(null)
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const observerRef = useRef()
  const lastPostRef = useRef()

  // Check for repost parameter in URL
  useEffect(() => {
    const repost = searchParams.get('repost')
    if (repost && user) {
      setRepostId(repost)
      setShowPostForm(true)
      // Clear the URL parameter
      searchParams.delete('repost')
      setSearchParams(searchParams, { replace: true })
    }
  }, [searchParams, user, setSearchParams])

  useEffect(() => {
    // Reset and fetch when sort changes
    setPosts([])
    setOffset(0)
    setHasMore(true)
    fetchPosts(true)
  }, [sortBy])

  const fetchPosts = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }
      
      const currentOffset = reset ? 0 : offset
      console.log('[HomePage] Fetching posts with sortBy:', sortBy, 'offset:', currentOffset)
      
      const data = await postService.getPosts({ 
        sortBy,
        limit: 10,
        offset: currentOffset
      })
      
      if (reset) {
        setPosts(data)
      } else {
        setPosts(prev => [...prev, ...data])
      }
      
      // If we got fewer than 10, we've reached the end
      if (data.length < 10) {
        setHasMore(false)
      } else {
        setOffset(currentOffset + 10)
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchPosts(false)
    }
  }, [loadingMore, hasMore, offset, sortBy])

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '100px',
      threshold: 0.1
    }

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadMore()
      }
    }, options)

    if (lastPostRef.current) {
      observerRef.current.observe(lastPostRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [loadMore])

  const handlePostCreated = () => {
    setShowPostForm(false)
    setRepostId(null)
    setPosts([])
    setOffset(0)
    setHasMore(true)
    fetchPosts(true)
  }

  const handleCancelPost = () => {
    setShowPostForm(false)
    setRepostId(null)
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
            <button
              className={`sort-btn ${sortBy === 'comments_count' ? 'active' : ''}`}
              onClick={() => setSortBy('comments_count')}
            >
              Most Commented
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
          onCancel={handleCancelPost}
          initialData={repostId ? { repost_id: repostId } : null}
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
          {posts.map((post, index) => {
            if (index === posts.length - 1) {
              return (
                <div key={post.post_id} ref={lastPostRef}>
                  <PostCard 
                    post={post} 
                    onLikeToggle={() => {
                      setPosts([])
                      setOffset(0)
                      setHasMore(true)
                      fetchPosts(true)
                    }} 
                  />
                </div>
              )
            }
            return (
              <PostCard 
                key={post.post_id} 
                post={post} 
                onLikeToggle={() => {
                  setPosts([])
                  setOffset(0)
                  setHasMore(true)
                  fetchPosts(true)
                }} 
              />
            )
          })}
          {loadingMore && (
            <div className="loading-more">
              <div className="spinner"></div>
              <p>Loading more posts...</p>
            </div>
          )}
          {!hasMore && posts.length > 0 && (
            <div className="end-message">
              <p>You've reached the end! 🎉</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
