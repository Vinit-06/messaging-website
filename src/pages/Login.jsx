import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Github, Mail, Eye, EyeOff, MessageCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { signInWithEmail, signInWithProvider, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  const from = location.state?.from?.pathname || '/dashboard'

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, from])

  const handleEmailLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error } = await signInWithEmail(email, password)
      if (error) {
        setError(error.message)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleProviderLogin = async (provider) => {
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
              <p className="text-gray-600">Welcome back! Sign in to continue.</p>
              {(import.meta.env.VITE_SUPABASE_URL === 'https://demo-project.supabase.co' ||
                !import.meta.env.VITE_SUPABASE_URL) && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-700 text-sm">
                    <strong>Demo Mode:</strong> Use any email/password to try the app
                  </p>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Email Login Form */}
            <form onSubmit={handleEmailLogin} className="space-y-4 mb-6">
              <div className="form-group">
                <label className="form-label" htmlFor="email">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  placeholder="Enter your email"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input pr-10"
                    placeholder="Enter your password"
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

              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={loading}
              >
                {loading ? <LoadingSpinner size="sm" /> : 'Sign In'}
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

            {/* Social Login */}
            <div className="space-y-3 mb-6">
              <button
                onClick={() => handleProviderLogin('google')}
                className="btn btn-secondary w-full"
                disabled={loading}
              >
                <Mail className="w-4 h-4" />
                Continue with Google
              </button>
              
              <button
                onClick={() => handleProviderLogin('github')}
                className="btn btn-secondary w-full"
                disabled={loading}
              >
                <Github className="w-4 h-4" />
                Continue with GitHub
              </button>
            </div>

            {/* Footer */}
            <div className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary-blue hover:text-primary-blue-dark font-medium">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
