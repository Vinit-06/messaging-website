import React from 'react'
import { 
  MessageCircle, 
  Settings, 
  Users, 
  Bot, 
  Shield, 
  Menu, 
  LogOut,
  Wifi,
  WifiOff
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

const Sidebar = ({ 
  collapsed, 
  onToggleCollapse, 
  onShowUserProfile, 
  onShowAIFeatures,
  connectionStatus = false 
}) => {
  const { signOut, isAdmin } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
  }

  const navItems = [
    { 
      icon: MessageCircle, 
      label: 'Chats', 
      active: true,
      onClick: () => navigate('/dashboard')
    },
    { 
      icon: Bot, 
      label: 'AI Assistant', 
      onClick: onShowAIFeatures
    },
    { 
      icon: Settings, 
      label: 'Settings', 
      onClick: () => navigate('/settings')
    }
  ]

  if (isAdmin) {
    navItems.push({
      icon: Shield,
      label: 'Admin Panel',
      onClick: () => navigate('/admin')
    })
  }

  return (
    <div className={`${collapsed ? 'w-16' : 'w-64'} glass-sidebar text-white transition-all duration-300 flex flex-col relative overflow-hidden`}>
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl -translate-x-16 -translate-y-16 animate-float"></div>
      <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tr from-pink-500/20 to-cyan-500/20 rounded-full blur-2xl translate-x-12 translate-y-12" style={{animationDelay: '1s'}}></div>

      {/* Header */}
      <div className="p-4 border-b border-white/10 backdrop-blur-sm relative z-10">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-3 group">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">ChatApp</h1>
                <p className="text-xs text-white/60">AI-Powered Messaging</p>
              </div>
            </div>
          )}
          <button
            onClick={onToggleCollapse}
            className="p-2 hover:bg-white/10 rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/10 hover:border-white/20 floating-element"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Connection Status */}
      <div className="px-4 py-3 border-b border-white/10 relative z-10">
        <div className={`flex items-center gap-2 ${collapsed ? 'justify-center' : ''}`}>
          <div className={`p-1.5 rounded-lg ${connectionStatus ? 'bg-green-500/20 border border-green-400/30' : 'bg-red-500/20 border border-red-400/30'} backdrop-blur-sm`}>
            {connectionStatus ? (
              <Wifi className="w-3 h-3 text-green-400" />
            ) : (
              <WifiOff className="w-3 h-3 text-red-400" />
            )}
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className={`text-xs font-medium ${connectionStatus ? 'text-green-400' : 'text-red-400'}`}>
                {connectionStatus ? 'Connected' : 'Disconnected'}
              </span>
              <span className="text-xs text-white/40">
                {connectionStatus ? 'Real-time sync active' : 'Trying to reconnect...'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 relative z-10">
        <ul className="space-y-3">
          {navItems.map((item, index) => (
            <li key={index}>
              <button
                onClick={item.onClick}
                className={`group w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 floating-element ${
                  item.active
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25 border border-blue-400/30'
                    : 'text-white/70 hover:bg-white/10 hover:text-white hover:border-white/20 border border-transparent backdrop-blur-sm'
                } ${collapsed ? 'justify-center' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <div className={`p-1 rounded-lg transition-all duration-300 ${
                  item.active
                    ? 'bg-white/20'
                    : 'group-hover:bg-white/10'
                }`}>
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                </div>
                {!collapsed && (
                  <div className="flex flex-col items-start">
                    <span className="font-medium text-sm">{item.label}</span>
                    {item.active && <span className="text-xs text-white/60">Active</span>}
                  </div>
                )}
                {item.active && (
                  <div className="absolute right-2 w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-white/10 backdrop-blur-sm relative z-10">
        <div className="space-y-3">
          <button
            onClick={onShowUserProfile}
            className={`group w-full flex items-center gap-3 p-3 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-all duration-300 floating-element border border-transparent hover:border-white/20 backdrop-blur-sm ${
              collapsed ? 'justify-center' : ''
            }`}
            title={collapsed ? 'User Profile' : undefined}
          >
            <div className="p-1 rounded-lg group-hover:bg-white/10 transition-all duration-300">
              <Users className="w-4 h-4 flex-shrink-0" />
            </div>
            {!collapsed && (
              <div className="flex flex-col items-start">
                <span className="font-medium text-sm">Profile</span>
                <span className="text-xs text-white/40">Manage account</span>
              </div>
            )}
          </button>

          <button
            onClick={handleSignOut}
            className={`group w-full flex items-center gap-3 p-3 rounded-xl text-white/70 hover:bg-gradient-to-r hover:from-red-500/20 hover:to-pink-500/20 hover:text-white transition-all duration-300 floating-element border border-transparent hover:border-red-400/30 backdrop-blur-sm ${
              collapsed ? 'justify-center' : ''
            }`}
            title={collapsed ? 'Sign Out' : undefined}
          >
            <div className="p-1 rounded-lg group-hover:bg-red-500/20 transition-all duration-300">
              <LogOut className="w-4 h-4 flex-shrink-0" />
            </div>
            {!collapsed && (
              <div className="flex flex-col items-start">
                <span className="font-medium text-sm">Sign Out</span>
                <span className="text-xs text-white/40">Leave safely</span>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
