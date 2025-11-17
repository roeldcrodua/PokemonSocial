import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { usePost } from '../hooks/usePosts'
import { useAuth } from '../context/AuthContext'
import { postService } from '../services/postService'
import { supabase } from '../services/supabase'
import PostCard from '../components/Posts/PostCard'
import CommentList from '../components/Comments/CommentList'
import CommentForm from '../components/Comments/CommentForm'
import PostForm from '../components/Posts/PostForm'

export default function PostDetailPage() {
  const { postId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { post, loading, error, refresh } = usePost(postId)
  const [isEditing, setIsEditing] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const postCardRef = useRef(null)
  const commentListRef = useRef(null)

  useEffect(() => {
    if (post && user) {
      setIsOwner(post.user_id === user.id)
    }
  }, [post, user])

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return

    try {
      console.log('[PostDetailPage] Deleting post:', postId)
      await postService.deletePost(postId)
      navigate('/')
    } catch (err) {
      alert('Failed to delete post: ' + err.message)
    }
  }

  const handleEditSuccess = () => {
    setIsEditing(false)
    refresh()
  }

  const handleCommentSuccess = () => {
    // Trigger count refresh in PostCard without full refresh
    if (postCardRef.current && postCardRef.current.refreshCounts) {
      postCardRef.current.refreshCounts()
    }
    // Trigger comment list reload
    if (commentListRef.current && commentListRef.current.reloadComments) {
      commentListRef.current.reloadComments()
    }
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading post...</div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="page-container">
        <div className="error-container">
          <h2>Post Not Found</h2>
          <p>{error || 'This post does not exist or has been deleted.'}</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Go Back Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="post-detail-container">
        {isEditing ? (
          <PostForm
            initialData={post}
            onSuccess={handleEditSuccess}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <>
            <div className="post-actions">
              {isOwner && (
                <>
                  <button onClick={() => setIsEditing(true)} className="btn-secondary">
                    ✏️ Edit
                  </button>
                  <button onClick={handleDelete} className="btn-danger">
                    🗑️ Delete
                  </button>
                </>
              )}
            </div>

            <PostCard ref={postCardRef} post={post} onLikeToggle={refresh} />

            <div className="comments-section">
              <h3>Comments</h3>
              <CommentForm postId={postId} onSuccess={handleCommentSuccess} />
              <CommentList ref={commentListRef} postId={postId} onCommentDeleted={handleCommentSuccess} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
