import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import './Auth.css'

export default function LoginForm({ onToggle, onClose }) {
  const [emailOrUsername, setEmailOrUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await signIn(emailOrUsername, password)

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      onClose && onClose()
    }
  }

  return (
    <div className="auth-form-container">
      <h2>Login to PokemonSocial</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        {error && <div className="error-message">{error}</div>}
        
        <div className="form-group">
          <label htmlFor="emailOrUsername">Email or Username</label>
          <input
            id="emailOrUsername"
            type="text"
            value={emailOrUsername}
            onChange={(e) => setEmailOrUsername(e.target.value)}
            placeholder="Enter your email or username"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div className="auth-links">
        <button onClick={() => onToggle('forgot')} className="link-button">
          Forgot Password?
        </button>
        <p>
          Don't have an account?{' '}
          <button onClick={() => onToggle('signup')} className="link-button">
            Sign Up
          </button>
        </p>
      </div>
    </div>
  )
}
