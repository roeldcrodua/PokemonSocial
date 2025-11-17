import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { postService } from '../services/postService'
import PostCard from '../components/Posts/PostCard'
import '../components/Posts/Posts.css'

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (query) {
      searchPosts()
    } else {
      setPosts([])
      setLoading(false)
    }
  }, [query])

  const searchPosts = async () => {
    try {
      setLoading(true)
      console.log('[SearchPage] Searching posts with query:', query)
      const data = await postService.searchPosts(query)
      setPosts(data)
    } catch (error) {
      console.error('Error searching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="home-page">
      <div className="home-header">
        <h1>🔍 Search Results</h1>
        {query && <p className="search-query">Searching for: "{query}"</p>}
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Searching...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="empty-state">
          {query ? (
            <p>No posts found matching "{query}". Try a different search term.</p>
          ) : (
            <p>Enter a search term to find posts.</p>
          )}
        </div>
      ) : (
        <>
          <p className="search-results-count">{posts.length} result{posts.length !== 1 ? 's' : ''} found</p>
          <div className="posts-grid">
            {posts.map(post => (
              <PostCard 
                key={post.post_id} 
                post={post} 
                onLikeToggle={searchPosts} 
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
