import React, { useState } from 'react'
import { X } from 'lucide-react'
import LoginForm from './LoginForm'
import SignUpForm from './SignUpForm'
import ForgotPasswordForm from './ForgotPasswordForm'

const AuthModal = ({ isOpen, onClose, initialForm = 'login' }) => {
  const [currentForm, setCurrentForm] = useState(initialForm)

  if (!isOpen) return null

  const handleSuccess = () => {
    onClose()
  }

  const handleToggleForm = (formType) => {
    setCurrentForm(formType)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="relative max-w-md w-full">
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors z-10"
        >
          <X className="h-4 w-4 text-gray-600" />
        </button>

        {currentForm === 'login' && (
          <LoginForm onToggleForm={handleToggleForm} onSuccess={handleSuccess} />
        )}
        {currentForm === 'signup' && (
          <SignUpForm onToggleForm={handleToggleForm} onSuccess={handleSuccess} />
        )}
        {currentForm === 'forgot' && (
          <ForgotPasswordForm onToggleForm={handleToggleForm} />
        )}
      </div>
    </div>
  )
}

export default AuthModal