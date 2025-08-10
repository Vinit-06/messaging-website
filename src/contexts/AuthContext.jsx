import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.warn('Supabase auth error (using demo mode):', error.message)
          // In demo mode, just set loading to false
          setLoading(false)
          return
        }
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      } catch (err) {
        console.warn('Auth initialization failed (using demo mode):', err.message)
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    let subscription
    try {
      const { data } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          setSession(session)
          setUser(session?.user ?? null)
          setLoading(false)

          if (event === 'SIGNED_IN') {
            // Redirect to dashboard after successful login
            window.location.href = '/dashboard'
          } else if (event === 'SIGNED_OUT') {
            // Redirect to login after logout
            window.location.href = '/login'
          }
        }
      )
      subscription = data.subscription
    } catch (err) {
      console.warn('Auth listener setup failed (using demo mode):', err.message)
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [])

  const signInWithEmail = async (email, password) => {
    setLoading(true)
    try {
      // Check if we're in demo mode (no proper Supabase config)
      if (supabase.supabaseUrl === 'https://demo-project.supabase.co') {
        // Demo mode - simulate successful login
        await new Promise(resolve => setTimeout(resolve, 1000))
        const demoUser = {
          id: 'demo-user-123',
          email: email,
          user_metadata: {
            full_name: 'Demo User',
            avatar_url: null
          },
          created_at: new Date().toISOString()
        }
        setUser(demoUser)
        setSession({ user: demoUser })
        return { data: { user: demoUser }, error: null }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signUpWithEmail = async (email, password, metadata = {}) => {
    setLoading(true)
    try {
      // Check if we're in demo mode
      if (supabase.supabaseUrl === 'https://demo-project.supabase.co') {
        await new Promise(resolve => setTimeout(resolve, 1000))
        return {
          data: {
            user: null, // In demo mode, simulate email verification needed
            session: null
          },
          error: null
        }
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: metadata.fullName || '',
            avatar_url: metadata.avatarUrl || ''
          }
        }
      })
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signInWithProvider = async (provider) => {
    setLoading(true)
    try {
      // Check if we're in demo mode
      if (supabase.supabaseUrl === 'https://demo-project.supabase.co') {
        await new Promise(resolve => setTimeout(resolve, 1000))
        const demoUser = {
          id: `demo-${provider}-user`,
          email: `demo@${provider}.com`,
          user_metadata: {
            full_name: `Demo ${provider} User`,
            avatar_url: `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=256&h=256&fit=face`
          },
          created_at: new Date().toISOString()
        }
        setUser(demoUser)
        setSession({ user: demoUser })
        return { data: { user: demoUser }, error: null }
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      })
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const updateProfile = async (updates) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: updates
      })
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const value = {
    user,
    session,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signInWithProvider,
    signOut,
    resetPassword,
    updateProfile,
    isAuthenticated: !!user,
    isAdmin: user?.user_metadata?.role === 'admin'
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
