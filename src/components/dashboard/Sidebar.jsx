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
    <div className={`${collapsed ? 'w-16' : 'w-64'} bg-gray-900 text-white transition-all duration-300 flex flex-col`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <MessageCircle className="w-8 h-8 text-blue-400" />
              <h1 className="text-xl font-bold">ChatApp</h1>
            </div>
          )}
          <button
            onClick={onToggleCollapse}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Connection Status */}
      <div className="px-4 py-2 border-b border-gray-700">
        <div className={`flex items-center gap-2 ${collapsed ? 'justify-center' : ''}`}>
          {connectionStatus ? (
            <Wifi className="w-4 h-4 text-green-400" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-400" />
          )}
          {!collapsed && (
            <span className={`text-xs ${connectionStatus ? 'text-green-400' : 'text-red-400'}`}>
              {connectionStatus ? 'Connected' : 'Disconnected'}
            </span>
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
