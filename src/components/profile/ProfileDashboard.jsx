import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../hooks/useToast'
import { 
  User, Briefcase, Award, TrendingUp, Settings, Calendar, 
  MapPin, ExternalLink, Edit3, Save, X, Mail, Shield
} from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import Button from '../Button'
import LoadingStates from '../LoadingStates'

const ProfileDashboard = () => {
  const { user, updateProfile, signOut } = useAuth()
  const { addToast } = useToast()
  const [profileData, setProfileData] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [stats, setStats] = useState({
    totalSessions: 0,
    avgScore: 0,
    improvementRate: 0,
    lastSession: null,
    bestScore: 0,
    totalQuestions: 0
  })

  const [editForm, setEditForm] = useState({
    full_name: '',
    profession: '',
    experience_level: '',
    bio: '',
    location: '',
    linkedin_url: '',
    github_url: '',
    website_url: ''
  })

  useEffect(() => {
    if (user) {
      setProfileData(user.user_metadata)
      setEditForm({
        full_name: user.user_metadata.full_name || '',
        profession: user.user_metadata.profession || '',
        experience_level: user.user_metadata.experience_level || '',
        bio: user.user_metadata.bio || '',
        location: user.user_metadata.location || '',
        linkedin_url: user.user_metadata.linkedin_url || '',
        github_url: user.user_metadata.github_url || '',
        website_url: user.user_metadata.website_url || ''
      })
      loadUserStats()
    }
  }, [user])

  const loadUserStats = async () => {
    try {
      setIsLoading(true)
      
      // Load interview sessions from database
      const { data: sessions, error } = await supabase
        .from('interview_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching sessions:', error)
        throw error
      }
      
      if (sessions && sessions.length > 0) {
        const totalSessions = sessions.length
        const scores = sessions.map(s => s.overall_score || 0).filter(s => s > 0)
        const avgScore = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0
        const bestScore = scores.length > 0 ? Math.max(...scores) : 0
        const lastSession = sessions[0]?.created_at
        const totalQuestions = sessions.reduce((sum, session) => {
          return sum + (session.questions_data?.length || 0)
        }, 0)
        
        // Calculate improvement rate
        const improvementRate = calculateImprovementRate(sessions)
        
        setStats({
          totalSessions,
          avgScore: Math.round(avgScore * 10) / 10,
          improvementRate,
          lastSession,
          bestScore,
          totalQuestions
        })
      } else {
        // Fallback to localStorage if no database records
        const localSessions = JSON.parse(localStorage.getItem('interviewSessions') || '[]')
        const userSessions = localSessions.filter(session => session.userId === user?.id)

        if (userSessions.length > 0) {
          const totalSessions = userSessions.length
          const scores = userSessions.map(s => s.overallScore || 0).filter(s => s > 0)
          const avgScore = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0
          const bestScore = scores.length > 0 ? Math.max(...scores) : 0
          const lastSession = userSessions[0]?.timestamp
          const totalQuestions = userSessions.reduce((sum, session) => sum + (session.totalQuestions || 0), 0)
          
          setStats({
            totalSessions,
            avgScore: Math.round(avgScore * 10) / 10,
            improvementRate: calculateImprovementRate(userSessions),
            lastSession,
            bestScore,
            totalQuestions
          })
        }
      }
    } catch (error) {
      console.error('Failed to load user stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateImprovementRate = (sessions) => {
    if (sessions.length < 2) return 0
    
    const scores = sessions.map(s => s.overall_score || s.overallScore || 0).filter(s => s > 0)
    if (scores.length < 2) return 0
    
    const recentCount = Math.min(3, Math.floor(scores.length / 2))
    const recent = scores.slice(0, recentCount).reduce((sum, s) => sum + s, 0) / recentCount
    const older = scores.slice(-recentCount).reduce((sum, s) => sum + s, 0) / recentCount
    
    return older > 0 ? Math.round(((recent - older) / older * 100) * 10) / 10 : 0
  }

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true)
      await updateProfile(editForm)
      setIsEditing(false)
      setProfileData({ ...profileData, ...editForm })
      addToast('Profile updated successfully!', 'success')
    } catch (error) {
      console.error('Failed to update profile:', error)
      addToast('Failed to update profile. Please try again.', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditForm({
      full_name: user.user_metadata.full_name || '',
      profession: user.user_metadata.profession || '',
      experience_level: user.user_metadata.experience_level || '',
      bio: user.user_metadata.bio || '',
      location: user.user_metadata.location || '',
      linkedin_url: user.user_metadata.linkedin_url || '',
      github_url: user.user_metadata.github_url || '',
      website_url: user.user_metadata.website_url || ''
    })
  }

  const getInitials = (name) => {
    if (!name) return user?.email?.charAt(0)?.toUpperCase() || 'U'
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2)
  }

  const getExperienceColor = (level) => {
    switch (level) {
      case 'entry': return 'bg-green-100 text-green-800'
      case 'mid': return 'bg-blue-100 text-blue-800'
      case 'senior': return 'bg-purple-100 text-purple-800'
      case 'lead': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingStates type="processing" message="Loading your profile..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-soft p-8 border border-gray-100">
          <div className="flex flex-col lg:flex-row items-start gap-8">
            <div className="flex flex-col items-center lg:items-start">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg mb-4">
                {getInitials(profileData?.full_name)}
              </div>
              <div className="text-center lg:text-left">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <Mail className="h-4 w-4" />
                  {user?.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  Joined {new Date(user?.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
            
            <div className="flex-1 w-full">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {profileData?.full_name || 'Complete Your Profile'}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3">
                    {profileData?.profession && (
                      <span className="flex items-center gap-1 text-gray-600">
                        <Briefcase className="h-4 w-4" />
                        {profileData.profession}
                      </span>
                    )}
                    {profileData?.experience_level && (
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getExperienceColor(profileData.experience_level)}`}>
                        {profileData.experience_level.charAt(0).toUpperCase() + profileData.experience_level.slice(1)} Level
                      </span>
                    )}
                    {profileData?.location && (
                      <span className="flex items-center gap-1 text-gray-600">
                        <MapPin className="h-4 w-4" />
                        {profileData.location}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-3 mt-4 sm:mt-0">
                  {!isEditing ? (
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Edit3 className="h-4 w-4" />
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSaveProfile}
                        loading={isSaving}
                        className="flex items-center gap-2"
                        size="sm"
                      >
                        <Save className="h-4 w-4" />
                        Save
                      </Button>
                      <Button
                        onClick={handleCancelEdit}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </Button>
                    </div>
                  )}
                  <Button
                    onClick={signOut}
                    variant="outline"
                    className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Shield className="h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              </div>
              
              {isEditing ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        placeholder="Your full name"
                        value={editForm.full_name}
                        onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Profession</label>
                      <input
                        type="text"
                        placeholder="Software Engineer, Product Manager, etc."
                        value={editForm.profession}
                        onChange={(e) => setEditForm({ ...editForm, profession: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
                      <select
                        value={editForm.experience_level}
                        onChange={(e) => setEditForm({ ...editForm, experience_level: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select experience level</option>
                        <option value="entry">Entry Level (0-2 years)</option>
                        <option value="mid">Mid Level (3-5 years)</option>
                        <option value="senior">Senior Level (6+ years)</option>
                        <option value="lead">Lead/Principal (10+ years)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                      <input
                        type="text"
                        placeholder="City, Country"
                        value={editForm.location}
                        onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                    <textarea
                      placeholder="Tell us about yourself, your experience, and career goals..."
                      value={editForm.bio}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-24"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn URL</label>
                      <input
                        type="url"
                        placeholder="https://linkedin.com/in/username"
                        value={editForm.linkedin_url}
                        onChange={(e) => setEditForm({ ...editForm, linkedin_url: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">GitHub URL</label>
                      <input
                        type="url"
                        placeholder="https://github.com/username"
                        value={editForm.github_url}
                        onChange={(e) => setEditForm({ ...editForm, github_url: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Website URL</label>
                      <input
                        type="url"
                        placeholder="https://yourwebsite.com"
                        value={editForm.website_url}
                        onChange={(e) => setEditForm({ ...editForm, website_url: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {profileData?.bio ? (
                    <p className="text-gray-700 leading-relaxed">{profileData.bio}</p>
                  ) : (
                    <p className="text-gray-500 italic">Add a bio to tell us about yourself and your career goals.</p>
                  )}
                  
                  {(profileData?.linkedin_url || profileData?.github_url || profileData?.website_url) && (
                    <div className="flex flex-wrap gap-3">
                      {profileData.linkedin_url && (
                        <a
                          href={profileData.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                        >
                          <ExternalLink className="h-4 w-4" />
                          LinkedIn
                        </a>
                      )}
                      {profileData.github_url && (
                        <a
                          href={profileData.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 text-sm"
                        >
                          <ExternalLink className="h-4 w-4" />
                          GitHub
                        </a>
                      )}
                      {profileData.website_url && (
                        <a
                          href={profileData.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-green-600 hover:text-green-800 text-sm"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Website
                        </a>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-soft p-6 text-center border border-gray-100">
            <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.totalSessions}</h3>
            <p className="text-gray-600 text-sm">Practice Sessions</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-soft p-6 text-center border border-gray-100">
            <Award className="h-8 w-8 text-green-600 mx-auto mb-3" />
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.avgScore}</h3>
            <p className="text-gray-600 text-sm">Average Score</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-soft p-6 text-center border border-gray-100">
            <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-3" />
            <h3 className="text-3xl font-bold text-gray-900 mb-1">
              {stats.improvementRate > 0 ? '+' : ''}{stats.improvementRate}%
            </h3>
            <p className="text-gray-600 text-sm">Improvement Rate</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-soft p-6 text-center border border-gray-100">
            <User className="h-8 w-8 text-orange-600 mx-auto mb-3" />
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.bestScore}</h3>
            <p className="text-gray-600 text-sm">Best Score</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-soft p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h3>
          {stats.totalSessions > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Last Practice Session</p>
                  <p className="text-sm text-gray-600">
                    {stats.lastSession ? new Date(stats.lastSession).toLocaleDateString() : 'No sessions yet'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">{stats.totalQuestions}</p>
                  <p className="text-sm text-gray-600">Questions Answered</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No practice sessions yet</p>
              <Button onClick={() => window.location.href = '/upload'}>
                Start Your First Practice Session
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfileDashboard