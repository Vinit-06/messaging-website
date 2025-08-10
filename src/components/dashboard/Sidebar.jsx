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
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item, index) => (
            <li key={index}>
              <button
                onClick={item.onClick}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  item.active 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                } ${collapsed ? 'justify-center' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span className="font-medium">{item.label}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-gray-700">
        <div className="space-y-2">
          <button
            onClick={onShowUserProfile}
            className={`w-full flex items-center gap-3 p-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors ${
              collapsed ? 'justify-center' : ''
            }`}
            title={collapsed ? 'User Profile' : undefined}
          >
            <Users className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="font-medium">Profile</span>}
          </button>
          
          <button
            onClick={handleSignOut}
            className={`w-full flex items-center gap-3 p-3 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition-colors ${
              collapsed ? 'justify-center' : ''
            }`}
            title={collapsed ? 'Sign Out' : undefined}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="font-medium">Sign Out</span>}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
