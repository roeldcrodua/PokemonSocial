import { useState } from 'react'
import { postService } from '../../services/postService'
import PokemonSelector from './PokemonSelector'
import { useAuth } from '../../context/AuthContext'

export default function PostForm({ onSuccess, onCancel, initialData = null }) {
  const { user } = useAuth()
  const [content, setContent] = useState(initialData?.content || '')
  const [imageUrl, setImageUrl] = useState(initialData?.image_url || '')
  const [selectedPokemon, setSelectedPokemon] = useState(initialData?.pokemon || null)
  const [showPokemonSelector, setShowPokemonSelector] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
        image_url: imageUrl.trim() || selectedPokemon?.imageUrl || null,
        pokemon_id: selectedPokemon?.pokemon_id || null
      }

      if (initialData) {
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
        <h3>{initialData ? 'Edit Post' : 'Create a New Post'}</h3>

        {error && <div className="error-message">{error}</div>}

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
