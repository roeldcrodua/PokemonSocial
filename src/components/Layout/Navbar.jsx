import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import AuthModal from '../Auth/AuthModal'
import './Layout.css'

export default function Navbar() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-brand">
            ⚡ PokemonSocial
          </Link>

          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search posts, pokemon, users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-button">🔍</button>
          </form>

          <div className="navbar-actions">
            {user ? (
              <>
                <Link to="/my-heroes" className="nav-link">My Heroes</Link>
                <Link to={`/profile/${profile?.username}`} className="nav-link">
                  {profile?.display_name || 'Profile'}
                </Link>
                <button onClick={handleSignOut} className="btn-secondary">
                  Logout
                </button>
              </>
            ) : (
              <button onClick={() => setIsAuthModalOpen(true)} className="btn-primary">
                Login / Sign Up
              </button>
            )}
          </div>
        </div>
      </nav>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </>
  )
}
