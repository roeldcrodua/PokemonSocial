import { useState, useEffect } from 'react'
import { postService } from '../../services/postService'
import PokemonSelector from './PokemonSelector'
import { useAuth } from '../../context/AuthContext'

export default function PostForm({ onSuccess, onCancel, initialData = null }) {
  const { user } = useAuth()
  const [content, setContent] = useState(initialData?.content || '')
  const [imageUrl, setImageUrl] = useState(initialData?.image_url || '')
  const [repostId, setRepostId] = useState(initialData?.repost_id || '')
  const [repostData, setRepostData] = useState(null)
  const [selectedPokemon, setSelectedPokemon] = useState(initialData?.pokemon || null)
  const [showPokemonSelector, setShowPokemonSelector] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Auto-fetch repost data if repost_id is provided in initialData
  useEffect(() => {
    const fetchRepostData = async () => {
      if (initialData?.repost_id && !repostData) {
        try {
          const post = await postService.getPostById(initialData.repost_id)
          setRepostData(post)
          setError('')
        } catch (err) {
          setError('Post not found with that ID')
          setRepostData(null)
        }
      }
    }
    fetchRepostData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData?.repost_id])

  const handleRepostLookup = async () => {
    if (!repostId.trim()) {
      setRepostData(null)
      return
    }

    try {
      const post = await postService.getPostById(repostId.trim())
      setRepostData(post)
      setError('')
    } catch (err) {
      setError('Post not found with that ID')
      setRepostData(null)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim()) {
      setError('Please add some content to your post')
      return
    }

    if (!user) {
      setError('You must be logged in to create a post')
      return
    }

    // Validate image URL if provided
    if (imageUrl.trim()) {
      const imageExtensions = /\.(jpg|jpeg|png|gif|webp|bmp|svg|ico)(\?.*)?$/i
      if (!imageExtensions.test(imageUrl.trim())) {
        setError('Image URL must end with a valid image extension (.jpg, .jpeg, .png, .gif, .webp, .bmp, .svg)')
        return
      }
    }

    setLoading(true)
    setError('')

    try {
      const postData = {
        content: content.trim(),
        image_url: imageUrl.trim() || selectedPokemon?.imageUrl || repostData?.image_url || null,
        pokemon_id: selectedPokemon?.pokemon_id || repostData?.pokemon_id || null,
        repost_id: repostId.trim() || null,
        repost_link: repostData ? `/post/${repostData.post_id}` : null
      }

      if (initialData?.post_id) {
        await postService.updatePost(initialData.post_id, postData)
      } else {
        console.log('[PostForm] Creating new post with userId:', user.id)
        await postService.createPost(postData, user.id)
      }

      onSuccess()
    } catch (err) {
      setError(err.message || 'Failed to save post')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="post-form-container">
      <form onSubmit={handleSubmit} className="post-form">
        <h3>
          {initialData?.post_id ? 'Edit Post' : repostData ? '🔁 Repost with Your Thoughts' : 'Create a New Post'}
        </h3>

        {error && <div className="error-message">{error}</div>}

        {repostData && (
          <div className="repost-info-banner">
            <div className="repost-banner-header">
              <span className="repost-icon">🔁</span>
              <span>Reposting:</span>
              <strong>You're reposting:</strong>
            </div>
            <div className="repost-banner-content">
              <p className="repost-original-content">{repostData.content?.substring(0, 150)}{repostData.content?.length > 150 ? '...' : ''}</p>
              <div className="repost-original-author">
                {repostData.profiles?.avatar_url && (
                  <img src={repostData.profiles.avatar_url} alt={repostData.profiles.display_name} className="repost-avatar" />
                )}
                <span>by {repostData.profiles?.display_name || 'Unknown'}</span>
              </div>
              {repostData.pokemon && (
                <div className="repost-pokemon-info">
                  <img src={repostData.pokemon.smallUrl || repostData.pokemon.imageUrl} alt={repostData.pokemon.name} />
                  <span>{repostData.pokemon.name}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {!repostData && (
          <div className="form-group">
            <label>Pokemon Hero (Optional)</label>
            {selectedPokemon ? (
              <div className="selected-pokemon">
                <img src={selectedPokemon.smallUrl} alt={selectedPokemon.name} />
                <span>{selectedPokemon.name}</span>
                <button
                  type="button"
                  onClick={() => setSelectedPokemon(null)}
                  className="btn-remove"
                >
                  ×
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowPokemonSelector(true)}
                className="btn-secondary"
              >
                Choose Pokemon Hero
              </button>
            )}
          </div>
        )}

        <div className="form-group">
          <label>Content *</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts about your Pokemon hero... Use #hashtags!"
            rows={6}
            required
          />
        </div>

        <div className="form-group">
          <label>Image URL (Optional)</label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
          <small className="form-hint">
            Must be a valid image URL ending with .jpg, .jpeg, .png, .gif, .webp, .bmp, or .svg
          </small>
        </div>

        {!repostData && !initialData?.post_id && (
          <div className="form-group">
            <label>Repost (Optional)</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={repostId}
                onChange={(e) => setRepostId(e.target.value)}
                placeholder="Enter post ID to repost"
              />
              <button
                type="button"
                onClick={handleRepostLookup}
                className="btn-secondary"
                style={{ whiteSpace: 'nowrap' }}
              >
                🔍 Find
              </button>
            </div>
            <small className="form-hint">
              Enter a post ID to create a repost thread. The original post will be displayed below your content.
            </small>
          </div>
        )}

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Saving...' : initialData ? 'Update Post' : 'Create Post'}
          </button>
        </div>
      </form>

      {showPokemonSelector && (
        <PokemonSelector
          onSelect={(pokemon) => {
            setSelectedPokemon(pokemon)
            setShowPokemonSelector(false)
          }}
          onClose={() => setShowPokemonSelector(false)}
        />
      )}
    </div>
  )
}
