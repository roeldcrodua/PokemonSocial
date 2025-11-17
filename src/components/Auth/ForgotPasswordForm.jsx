import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import './Auth.css'

export default function ForgotPasswordForm({ onToggle }) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const { resetPassword } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await resetPassword(email)

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
          We've sent you a password reset link. Please check your inbox.
        </p>
        <button onClick={() => onToggle('login')} className="btn-primary">
          Back to Login
        </button>
      </div>
    )
  }

  return (
    <div className="auth-form-container">
      <h2>Reset Password</h2>
      <p>Enter your email address and we'll send you a link to reset your password.</p>
      
      <form onSubmit={handleSubmit} className="auth-form">
        {error && <div className="error-message">{error}</div>}
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@example.com"
            required
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>

      <div className="auth-links">
        <button onClick={() => onToggle('login')} className="link-button">
          Back to Login
        </button>
      </div>
    </div>
  )
}
