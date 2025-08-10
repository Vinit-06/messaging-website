import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { WebSocketProvider } from './contexts/WebSocketContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ChatDashboard from './pages/ChatDashboard'
import Settings from './pages/Settings'
import AdminPanel from './pages/AdminPanel'
import './styles/globals.css'

function App() {
  const isDemoMode = import.meta.env.VITE_SUPABASE_URL === 'https://demo-project.supabase.co' ||
                     !import.meta.env.VITE_SUPABASE_URL ||
                     import.meta.env.VITE_SUPABASE_URL === 'https://your-project.supabase.co'

  return (
    <AuthProvider>
      <WebSocketProvider>
        <Router>
          <div className="app">
            {isDemoMode && (
              <div className="fixed top-0 left-0 right-0 demo-banner px-6 py-3 text-center text-sm z-50 border-b border-white/20">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-white/80 rounded-full animate-pulse"></div>
                  <strong>Demo Mode:</strong> Using mock data. Configure Supabase to enable full functionality.
                  <div className="w-2 h-2 bg-white/80 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                </div>
              </div>
            )}
            <div className={isDemoMode ? 'pt-10' : ''}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <ChatDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } />
                <Route path="/admin" element={
                  <ProtectedRoute adminOnly>
                    <AdminPanel />
                  </ProtectedRoute>
                } />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </div>
          </div>
        </Router>
      </WebSocketProvider>
    </AuthProvider>
  )
}

export default App
