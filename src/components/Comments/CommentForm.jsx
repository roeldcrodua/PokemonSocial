import { useState } from 'react'
import { commentService } from '../../services/commentService'
import { useAuth } from '../../context/AuthContext'
import './Comments.css'

export default function CommentForm({ postId, parentId = null, parentAuthor = null, onSuccess, onCancel }) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { user } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!user) {
      setError('Please login to comment')
      return
    }

    if (!content.trim()) {
      setError('Comment cannot be empty')
      return
    }

    setLoading(true)
    setError('')

    try {
      console.log('[CommentForm] Creating comment for post:', postId, 'parent:', parentId)
      await commentService.createComment({
        post_id: postId,
        content: content.trim(),
        parent_id: parentId
      })

      setContent('')
      onSuccess && onSuccess()
    } catch (err) {
      setError(err.message || 'Failed to post comment')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="comment-form-wrapper">
        <div className="login-prompt">Please login to leave a comment</div>
      </div>
    )
  }

  return (
    <div className="comment-form-wrapper">
      <form onSubmit={handleSubmit} className="comment-form">
        {parentAuthor && (
          <div className="reply-indicator">
            Replying to <strong>@{parentAuthor}</strong>
          </div>
        )}
        {error && <div className="error-message">{error}</div>}
        
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={parentAuthor ? `Reply to @${parentAuthor}...` : "Write a comment..."}
          rows={parentId ? 2 : 3}
          disabled={loading}
          autoFocus={!!parentId}
        />
        
        <div className="comment-form-actions">
          <button type="submit" disabled={loading || !content.trim()}>
            {loading ? 'Posting...' : (parentId ? 'Post Reply' : 'Post Comment')}
          </button>
          {parentId && onCancel && (
            <button type="button" onClick={onCancel} className="btn-cancel">
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
