import { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../services/supabase'
import { formatDistanceToNow } from '../../utils/dateUtils'
import './Posts.css'

const PostCard = forwardRef(({ post, onLikeToggle, showActions, onEdit, onDelete }, ref) => {
  const navigate = useNavigate()
  const [isLiked, setIsLiked] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [likesCount, setLikesCount] = useState(post.likes_count || 0)
  const [commentsCount, setCommentsCount] = useState(post.comments_count || 0)

  // Expose refreshCounts method to parent components
  useImperativeHandle(ref, () => ({
    refreshCounts: loadCounts
  }))

  useEffect(() => {
    checkIfLiked()
    loadCounts()
  }, [post])

  useEffect(() => {
    setLikesCount(post.likes_count || 0)
    setCommentsCount(post.comments_count || 0)
  }, [post.likes_count, post.comments_count])

  const loadCounts = async () => {
    try {
      // Get actual likes count
      console.log('[PostCard] Loading likes count for post:', post.post_id)
      const { count: likesTotal } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', post.post_id)
      
      // Get actual comments count
      console.log('[PostCard] Loading comments count for post:', post.post_id)
      const { count: commentsTotal } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', post.post_id)
      
      setLikesCount(likesTotal || 0)
      setCommentsCount(commentsTotal || 0)
    } catch (error) {
      console.error('Error loading counts:', error)
    }
  }

  const checkIfLiked = async () => {
    console.log('[PostCard] Checking if post is liked:', post.post_id)
    const { data: { user } } = await supabase.auth.getUser()
    setCurrentUser(user)
    
    if (user) {
      console.log('[PostCard] Querying like status for user:', user.id, 'post:', post.post_id)
      const { data } = await supabase
        .from('likes')
        .select('like_id')
        .eq('post_id', post.post_id)
        .eq('user_id', user.id)
        .maybeSingle()
      
      setIsLiked(!!data)
    }
  }

  const handleLike = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!currentUser) {
      alert('Please login to like posts')
      return
    }

    const wasLiked = isLiked
    
    // Optimistic update with validation
    setIsLiked(!isLiked)
    setLikesCount(prevCount => {
      const newCount = wasLiked ? prevCount - 1 : prevCount + 1
      return Math.max(0, newCount) // Never go below 0
    })

    try {
      if (wasLiked) {
        console.log('[PostCard] Deleting like for post:', post.post_id)
        await supabase
          .from('likes')
          .delete()
          .eq('post_id', post.post_id)
          .eq('user_id', currentUser.id)
        
        // Decrement likes_count in database
        console.log('[PostCard] Decrementing likes count for post:', post.post_id)
        await supabase.rpc('decrement_likes_count', { post_id: post.post_id })
      } else {
        console.log('[PostCard] Inserting like for post:', post.post_id)
        await supabase
          .from('likes')
          .insert({
            post_id: post.post_id,
            user_id: currentUser.id
          })
        
        // Increment likes_count in database
        console.log('[PostCard] Incrementing likes count for post:', post.post_id)
        await supabase.rpc('increment_likes_count', { post_id: post.post_id })
      }
      
      // Reload actual count from database to sync with other users
      console.log('[PostCard] Reloading counts after like toggle')
      await loadCounts()
    } catch (error) {
      // Revert optimistic update on error
      console.error('Error toggling like:', error)
      setIsLiked(wasLiked)
      setLikesCount(prevCount => {
        const revertedCount = wasLiked ? prevCount + 1 : prevCount - 1
        return Math.max(0, revertedCount) // Never go below 0
      })
      alert('Failed to update like')
    }
  }

  const handleShare = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Navigate to home page with repost parameter
    navigate('/?repost=' + post.post_id)
  }

  return (
    <Link to={`/post/${post.post_id}`} className="post-card">
      <div className="post-header">
        <div className="post-author">
          {post.profiles?.avatar_url && (
            <img src={post.profiles.avatar_url} alt={post.profiles.display_name} className="avatar-small" />
          )}
          <div>
            <div className="author-name">{post.profiles?.display_name || 'Unknown'}</div>
            <div className="post-time">{formatDistanceToNow(post.created_at)}</div>
          </div>
        </div>
        {showActions && (
          <div className="post-header-actions" onClick={(e) => e.preventDefault()}>
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(); }} className="btn-icon" title="Edit">
              ✏️
            </button>
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(); }} className="btn-icon btn-danger" title="Delete">
              🗑️
            </button>
          </div>
        )}
      </div>

      {post.pokemon && (
        <div className="post-pokemon">
          <img src={post.pokemon.smallUrl || post.pokemon.imageUrl} alt={post.pokemon.name} className="pokemon-badge" />
          <span className="pokemon-name">{post.pokemon.name}</span>
        </div>
      )}

      <div className="post-content">
        <p>{post.content}</p>
      </div>

      {post.repost_link && (
        <Link 
          to={post.repost_link} 
          className="repost-link-card"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="repost-link-icon">🔁</div>
          <div className="repost-link-text">
            View original post
          </div>
        </Link>
      )}

      {post.image_url && (
        <div className="post-image">
          <img src={post.image_url} alt="Post content" />
        </div>
      )}

      <div className="post-footer">
        <button 
          className={`like-button ${isLiked ? 'liked' : ''}`}
          onClick={handleLike}
        >
          <span className="icon">{isLiked ? '❤️' : '🤍'}</span>
          <span>{likesCount}</span>
        </button>
        
        <div className="comment-count">
          <span className="icon">💬</span>
          <span>{commentsCount}</span>
        </div>

        <button 
          className="share-button"
          onClick={handleShare}
          title="Repost this"
        >
          <span className="icon">🔁</span>
          <span>Repost</span>
        </button>
      </div>
    </Link>
  )
})

PostCard.displayName = 'PostCard'

export default PostCard

