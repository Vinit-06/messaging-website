import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Github, Mail, Eye, EyeOff, MessageCircle, User } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  
  const { signUpWithEmail, signInWithProvider, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError('Full name is required')
      return false
    }
    if (!formData.email) {
      setError('Email is required')
      return false
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    return true
  }

  const handleEmailSignup = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const { data, error } = await signUpWithEmail(
        formData.email, 
        formData.password, 
        { fullName: formData.fullName }
      )
      
      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
        // Clear form
        setFormData({
          fullName: '',
          email: '',
          password: '',
          confirmPassword: ''
        })
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleProviderSignup = async (provider) => {
    setError('')
    setLoading(true)

    try {
      const { error } = await signInWithProvider(provider)
      if (error) {
        setError(error.message)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 px-4">
        <div className="max-w-md w-full">
          <div className="card">
            <div className="card-content text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
                <p className="text-gray-600">
                  We've sent a confirmation link to <strong>{formData.email}</strong>
                </p>
              </div>
              <Link to="/login" className="btn btn-primary w-full">
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 px-4">
      <div className="max-w-md w-full">
        <div className="card">
          <div className="card-content">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <MessageCircle className="w-8 h-8 text-primary-blue" />
                <h1 className="text-2xl font-bold text-gray-900">ChatApp</h1>
              </div>
              <p className="text-gray-600">Create your account to get started.</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Signup Form */}
            <form onSubmit={handleEmailSignup} className="space-y-4 mb-6">
              <div className="form-group">
                <label className="form-label" htmlFor="fullName">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="form-input pl-10"
                    placeholder="Enter your full name"
                    required
                    disabled={loading}
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="email">
                  Email address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="form-input pl-10"
                    placeholder="Enter your email"
                    required
                    disabled={loading}
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    className="form-input pr-10"
                    placeholder="Create a password"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="form-input pr-10"
                    placeholder="Confirm your password"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={loading}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={loading}
              >
                {loading ? <LoadingSpinner size="sm" /> : 'Create Account'}
              </button>
            </form>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Social Signup */}
            <div className="space-y-3 mb-6">
              <button
                onClick={() => handleProviderSignup('google')}
                className="btn btn-secondary w-full"
                disabled={loading}
              >
                <Mail className="w-4 h-4" />
                Continue with Google
              </button>
              
              <button
                onClick={() => handleProviderSignup('github')}
                className="btn btn-secondary w-full"
                disabled={loading}
              >
                <Github className="w-4 h-4" />
                Continue with GitHub
              </button>
            </div>

            {/* Footer */}
            <div className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-blue hover:text-primary-blue-dark font-medium">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signup
