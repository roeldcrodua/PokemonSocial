import { useState, useEffect } from 'react'
import { postService } from '../services/postService'

export function usePosts() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadPosts = async () => {
    try {
      setLoading(true)
      console.log('[usePosts] Loading all posts')
      const data = await postService.getAllPosts()
      console.log('LOADED posts:', data)
      setPosts(data)
      setError(null)
    } catch (err) {
      setError(err.message || 'Failed to load posts')
      console.error('Error loading posts:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPosts()
  }, [])

  const refresh = () => {
    loadPosts()
  }

  return { posts, loading, error, refresh }
}

export function usePost(postId) {
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadPost = async () => {
    try {
      setLoading(true)
      console.log('[usePost] Loading post by ID:', postId)
      const data = await postService.getPostById(postId)
      console.log('LOADED post:', data)
      setPost(data)
      setError(null)
    } catch (err) {
      setError(err.message || 'Failed to load post')
      console.error('Error loading post:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (postId) {
      loadPost()
    }
  }, [postId])

  const refresh = () => {
    loadPost()
  }

  return { post, loading, error, refresh }
}
