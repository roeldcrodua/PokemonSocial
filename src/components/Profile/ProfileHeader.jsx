import { useState, useEffect } from 'react'
import { supabase } from '../../services/supabase'
import './Profile.css'

export default function ProfileHeader({ userId, isOwnProfile }) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [userId])

  const loadProfile = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      if (data) setProfile(data)
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading profile...</div>
  }

  if (!profile) {
    return <div className="error">Profile not found</div>
  }

  return (
    <div className="profile-header">
      <div className="profile-banner">
        {profile.banner_url && (
          <img src={profile.banner_url} alt="Profile banner" className="banner-image" />
        )}
      </div>

      <div className="profile-info">
        <div className="avatar-large-wrapper">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.display_name} className="avatar-large" />
          ) : (
            <div className="avatar-large avatar-placeholder">
              {profile.display_name?.[0]?.toUpperCase() || '?'}
            </div>
          )}
        </div>

        <div className="profile-details">
          <h1 className="display-name">{profile.display_name}</h1>
          <p className="username">@{profile.username}</p>
          {profile.bio && <p className="bio">{profile.bio}</p>}
          
          <div className="profile-meta">
            <span>Joined {new Date(profile.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {isOwnProfile && (
          <button 
            className="btn-edit-profile"
            onClick={() => setShowEditModal(true)}
          >
            Edit Profile
          </button>
        )}
      </div>

      {showEditModal && (
        <EditProfileModal
          profile={profile}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false)
            loadProfile()
          }}
        />
      )}
    </div>
  )
}

function EditProfileModal({ profile, onClose, onSuccess }) {
  const [displayName, setDisplayName] = useState(profile.display_name || '')
  const [bio, setBio] = useState(profile.bio || '')
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || '')
  const [bannerUrl, setBannerUrl] = useState(profile.banner_url || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          display_name: displayName.trim(),
          bio: bio.trim() || null,
          avatar_url: avatarUrl.trim() || null,
          banner_url: bannerUrl.trim() || null
        })
        .eq('user_id', profile.user_id)

      if (updateError) throw updateError

      onSuccess()
    } catch (err) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        
        <h2>Edit Profile</h2>

        <form onSubmit={handleSubmit} className="edit-profile-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label>Display Name *</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              rows={4}
            />
          </div>

          <div className="form-group">
            <label>Avatar URL</label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
            />
          </div>

          <div className="form-group">
            <label>Banner URL</label>
            <input
              type="url"
              value={bannerUrl}
              onChange={(e) => setBannerUrl(e.target.value)}
              placeholder="https://example.com/banner.jpg"
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
