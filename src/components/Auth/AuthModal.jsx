import { useState } from 'react'
import LoginForm from './LoginForm'
import SignupForm from './SignupForm'
import ForgotPasswordForm from './ForgotPasswordForm'
import './Auth.css'

export default function AuthModal({ isOpen, onClose, initialForm = 'login' }) {
  const [currentForm, setCurrentForm] = useState(initialForm)

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        
        {currentForm === 'login' && (
          <LoginForm onToggle={setCurrentForm} onClose={onClose} />
        )}
        {currentForm === 'signup' && (
          <SignupForm onToggle={setCurrentForm} onClose={onClose} />
        )}
        {currentForm === 'forgot' && (
          <ForgotPasswordForm onToggle={setCurrentForm} />
        )}
      </div>
    </div>
  )
}
