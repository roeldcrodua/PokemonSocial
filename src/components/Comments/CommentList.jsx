import { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { commentService } from '../../services/commentService'
import { supabase } from '../../services/supabase'
import { formatDistanceToNow } from '../../utils/dateUtils'
import CommentForm from './CommentForm'
import './Comments.css'

const CommentList = forwardRef(({ postId, onCommentDeleted }, ref) => {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)

  // Expose reloadComments method to parent
  useImperativeHandle(ref, () => ({
    reloadComments: loadComments
  }))

  useEffect(() => {
    loadComments()
  }, [postId])

  const loadComments = async () => {
    try {
      console.log('[CommentList] Loading comments for post:', postId)
      const data = await commentService.getCommentsByPost(postId)
      
      // Fetch user profiles for each comment
      const commentsWithProfiles = await Promise.all(
        data.map(async (comment) => {
          console.log('[CommentList] Fetching profile for comment user:', comment.user_id)
          const { data: profile } = await supabase
            .from('profiles')
            .select('username, display_name, avatar_url')
            .eq('user_id', comment.user_id)
            .single()
          
          return { ...comment, profile }
        })
      )
      
      // Organize comments into parent-child hierarchy (supports infinite nesting)
      const commentsMap = {}
      commentsWithProfiles.forEach(comment => {
        commentsMap[comment.comment_id] = { ...comment, replies: [] }
      })
      
      const rootComments = []
      commentsWithProfiles.forEach(comment => {
        if (comment.parent_id && commentsMap[comment.parent_id]) {
          commentsMap[comment.parent_id].replies.push(commentsMap[comment.comment_id])
        } else if (!comment.parent_id) {
          rootComments.push(commentsMap[comment.comment_id])
        }
      })
      
      setComments(rootComments)
    } catch (error) {
      console.error('Error loading comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return

    try {
      console.log('[CommentList] Deleting comment:', commentId)
      await commentService.deleteComment(commentId)
      setComments(comments.filter(c => c.comment_id !== commentId))
      // Notify parent to refresh counts
      if (onCommentDeleted) {
        onCommentDeleted()
      }
    } catch (error) {
      alert('Failed to delete comment')
    }
  }

  if (loading) {
    return <div className="loading">Loading comments...</div>
  }

  if (comments.length === 0) {
    return <div className="no-comments">No comments yet. Be the first to comment!</div>
  }

  return (
    <div className="comments-list">
      {comments.map((comment) => (
        <CommentItem 
          key={comment.comment_id} 
          comment={comment} 
          onDelete={handleDelete}
          postId={postId}
          onReply={loadComments}
        />
      ))}
    </div>
  )
})

CommentList.displayName = 'CommentList'

export default CommentList

function CommentItem({ comment, onDelete, postId, onReply, isReply = false, depth = 0 }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user)
    })
  }, [])

  const canDelete = currentUser?.id === comment.user_id
  const canEdit = currentUser?.id === comment.user_id
  const canReply = currentUser // Allow replies at any depthplies at any depth
  
  const handleReplySuccess = () => {
    setShowReplyForm(false)
    onReply && onReply()
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    if (!editContent.trim()) {
      setEditError('Comment cannot be empty')
      return
    }

    setEditLoading(true)
    setEditError('')

    try {
      console.log('[CommentItem] Updating comment:', comment.comment_id)
      await commentService.updateComment(comment.comment_id, editContent.trim())
      comment.content = editContent.trim() // Update local state
      setIsEditing(false)
      onReply && onReply() // Refresh comments
    } catch (err) {
      setEditError(err.message || 'Failed to update comment')
    } finally {
      setEditLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setEditContent(comment.content)
    setEditError('')
    setIsEditing(false)
  }

  return (
    <div className={`comment-item ${isReply ? 'comment-reply' : ''}`} style={{ marginLeft: `${depth * 1.5}rem` }}>
      <div className="comment-header">
        <div className="comment-author">
          {comment.profile?.avatar_url && (
            <img 
              src={comment.profile.avatar_url} 
              alt={comment.profile.display_name} 
              className="avatar-tiny"
            />
          )}
          <span className="author-name">{comment.profile?.display_name || 'Unknown'}</span>
          <span className="comment-time">
            {formatDistanceToNow(comment.created_at)}
            {comment.updated_at && comment.updated_at !== comment.created_at && (
              <span className="edited-indicator"> (edited)</span>
            )}
          </span>
        </div>
        <div className="comment-actions">
          {canEdit && !isEditing && (
            <button 
              className="btn-edit" 
              onClick={() => setIsEditing(true)}
              title="Edit comment"
            >
              ✏️
            </button>
          )}
          {canDelete && (
            <button 
              className="btn-delete" 
              onClick={() => onDelete(comment.comment_id)}
              title="Delete comment"
            >
              🗑️
            </button>
          )}
        </div>
      </div>
      
      {isEditing ? (
        <form onSubmit={handleEdit} className="comment-edit-form">
          {editError && <div className="error-message">{editError}</div>}
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={3}
            disabled={editLoading}
            autoFocus
          />
          <div className="comment-form-actions">
            <button type="submit" disabled={editLoading || !editContent.trim()}>
              {editLoading ? 'Saving...' : 'Save'}
            </button>
            <button type="button" onClick={handleCancelEdit} className="btn-cancel">
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="comment-content">
          {comment.content}
        </div>
      )}
      
      {canReply && !isEditing && (
        <button 
          className="btn-reply" 
          onClick={() => setShowReplyForm(!showReplyForm)}
        >
          💬 Reply
        </button>
      )}
      
      {showReplyForm && (
        <CommentForm 
          postId={postId}
          parentId={comment.comment_id}
          parentAuthor={comment.profile?.display_name || comment.profile?.username}
          onSuccess={handleReplySuccess}
          onCancel={() => setShowReplyForm(false)}
        />
      )}
      
      {comment.replies && comment.replies.length > 0 && (
        <div className="comment-replies">
          {comment.replies.map(reply => (
            <CommentItem 
              key={reply.comment_id}
              comment={reply}
              onDelete={onDelete}
              postId={postId}
              onReply={onReply}
              isReply={true}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}
