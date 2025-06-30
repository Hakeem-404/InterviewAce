import React from 'react'
import { useAuth } from '../context/AuthContext'
import LoadingStates from './LoadingStates'
import AuthModal from './auth/AuthModal'

const ProtectedRoute = ({ children, requireAuth = true }) => {
  const { user, loading } = useAuth()
  const [showAuthModal, setShowAuthModal] = React.useState(false)

  React.useEffect(() => {
    if (!loading && requireAuth && !user) {
      setShowAuthModal(true)
    }
  }, [user, loading, requireAuth])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingStates type="processing" message="Loading..." />
      </div>
    )
  }

  if (requireAuth && !user) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
            <p className="text-gray-600 mb-6">Please sign in to access this feature</p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          initialForm="login"
        />
      </>
    )
  }

  return children
}

export default ProtectedRoute