import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Brain, Menu, X, User, LogOut, Settings, History, BarChart3, CreditCard, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import AuthModal from './auth/AuthModal';
import Button from './Button';
import UsageTracker from './premium/UsageTracker';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalForm, setAuthModalForm] = useState<'login' | 'signup'>('login');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const { user, signOut, loading } = useAuth();
  const { isPremium } = useSubscription();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Practice', href: '/upload' },
    { name: 'Pricing', href: '/pricing' },
    ...(user ? [{ name: 'History', href: '/history' }] : []),
  ];

  const getBreadcrumb = () => {
    switch (location.pathname) {
      case '/':
        return 'Home';
      case '/profile':
        return 'Profile';
      case '/history':
        return 'Interview History';
      case '/upload':
        return 'Upload Documents';
      case '/analysis':
        return 'Analyzing Documents';
      case '/analysis-results':
        return 'Analysis Results';
      case '/interview':
        return 'Interview Session';
      case '/results':
        return 'Results & Feedback';
      case '/pricing':
        return 'Pricing Plans';
      default:
        return 'InterviewAce';
    }
  };

  const handleAuthClick = (formType: 'login' | 'signup') => {
    setAuthModalForm(formType);
    setShowAuthModal(true);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowUserMenu(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return user?.email?.charAt(0)?.toUpperCase() || 'U';
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">InterviewAce</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`text-sm font-medium transition-colors duration-200 hover:text-blue-600 ${
                    location.pathname === item.href
                      ? 'text-blue-600'
                      : 'text-gray-700'
                  }`}
                >
                  {item.name}
                </Link>
              ))}

              {/* Auth Section */}
              {loading ? (
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
              ) : user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {getInitials(user.user_metadata?.full_name)}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {user.user_metadata?.full_name || user.email?.split('@')[0]}
                    </span>
                    {isPremium && (
                      <span className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium">
                        <Star className="h-3 w-3" />
                        Premium
                      </span>
                    )}
                  </button>

                  {/* User Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user.user_metadata?.full_name || 'User'}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User className="h-4 w-4 mr-3" />
                        Profile
                      </Link>
                      
                      <Link
                        to="/history"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <History className="h-4 w-4 mr-3" />
                        Interview History
                      </Link>
                      
                      <Link
                        to="/pricing"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <CreditCard className="h-4 w-4 mr-3" />
                        Subscription
                      </Link>
                      
                      <div className="border-t border-gray-100 my-1" />
                      <button
                        onClick={handleSignOut}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAuthClick('login')}
                  >
                    Sign In
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleAuthClick('signup')}
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 hover:text-blue-600 focus:outline-none focus:text-blue-600"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Breadcrumb */}
          {location.pathname !== '/' && (
            <div className="py-2 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">{getBreadcrumb()}</p>
                {user && !isPremium && location.pathname !== '/pricing' && (
                  <UsageTracker className="w-48" />
                )}
              </div>
            </div>
          )}

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-100">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`block px-3 py-2 text-base font-medium transition-colors duration-200 hover:text-blue-600 ${
                      location.pathname === item.href
                        ? 'text-blue-600'
                        : 'text-gray-700'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}

                {/* Mobile Auth Section */}
                {user ? (
                  <div className="pt-4 border-t border-gray-200 mt-4">
                    <div className="flex items-center px-3 py-2 mb-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                        {getInitials(user.user_metadata?.full_name)}
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">
                          {user.user_metadata?.full_name || user.email?.split('@')[0]}
                        </span>
                        {isPremium && (
                          <div className="flex items-center gap-1 text-xs text-blue-700">
                            <Star className="h-3 w-3" />
                            <span>Premium Member</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Link
                      to="/profile"
                      className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      to="/history"
                      className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Interview History
                    </Link>
                    <Link
                      to="/pricing"
                      className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Subscription
                    </Link>
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:text-red-800"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="pt-4 border-t border-gray-200 mt-4 space-y-2">
                    <button
                      onClick={() => {
                        handleAuthClick('login');
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => {
                        handleAuthClick('signup');
                        setIsMenuOpen(false);
                      }}
                      className="block w-full bg-blue-600 text-white px-3 py-2 rounded-lg text-base font-medium hover:bg-blue-700 transition-colors"
                    >
                      Sign Up
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialForm={authModalForm}
      />

      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </>
  );
};

export default Header;