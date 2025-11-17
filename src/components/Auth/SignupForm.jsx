import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import './Auth.css'

export default function SignupForm({ onToggle, onClose }) {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    displayName: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    const { data, error } = await signUp(
      formData.email,
      formData.password,
      formData.username,
      formData.displayName
    )

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="auth-form-container">
        <h2>Check Your Email</h2>
        <p className="success-message">
          We've sent you an email confirmation link. Please check your inbox and verify your email address.
        </p>
        <button onClick={() => onToggle('login')} className="btn-primary">
          Back to Login
        </button>
      </div>
    )
  }

  return (
    <div className="auth-form-container">
      <h2>Join PokemonSocial</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        {error && <div className="error-message">{error}</div>}
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="your.email@example.com"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            placeholder="Choose a unique username"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="displayName">Display Name</label>
          <input
            id="displayName"
            name="displayName"
            type="text"
            value={formData.displayName}
            onChange={handleChange}
            placeholder="How should we call you?"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="At least 6 characters"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter your password"
            required
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>

      <div className="auth-links">
        <p>
          Already have an account?{' '}
          <button onClick={() => onToggle('login')} className="link-button">
            Login
          </button>
        </p>
      </div>
    </div>
  )
}
