import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  HelpCircle,
  ChevronRight,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Globe,
  Smartphone
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import UserProfile from '../components/dashboard/UserProfile'

const Settings = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [showUserProfile, setShowUserProfile] = useState(false)
  const [notifications, setNotifications] = useState({
    messages: true,
    mentions: true,
    sounds: true,
    desktop: false
  })
  const [theme, setTheme] = useState('light')
  const [language, setLanguage] = useState('en')

  const settingSections = [
    {
      title: 'Account',
      items: [
        {
          icon: User,
          label: 'Profile',
          description: 'Update your profile information',
          onClick: () => setShowUserProfile(true)
        }
      ]
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: Bell,
          label: 'Notifications',
          description: 'Manage notification settings',
          content: (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Message notifications</p>
                  <p className="text-sm text-gray-500">Get notified for new messages</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.messages}
                    onChange={(e) => setNotifications(prev => ({
                      ...prev,
                      messages: e.target.checked
                    }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Mention notifications</p>
                  <p className="text-sm text-gray-500">Get notified when mentioned</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.mentions}
                    onChange={(e) => setNotifications(prev => ({
                      ...prev,
                      mentions: e.target.checked
                    }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Sound notifications</p>
                  <p className="text-sm text-gray-500">Play sound for notifications</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.sounds}
                    onChange={(e) => setNotifications(prev => ({
                      ...prev,
                      sounds: e.target.checked
                    }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Desktop notifications</p>
                  <p className="text-sm text-gray-500">Show desktop notifications</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.desktop}
                    onChange={(e) => setNotifications(prev => ({
                      ...prev,
                      desktop: e.target.checked
                    }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          )
        },
        {
          icon: Palette,
          label: 'Appearance',
          description: 'Customize your theme',
          content: (
            <div className="space-y-4">
              <div>
                <p className="font-medium mb-3">Theme</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setTheme('light')}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-colors ${
                      theme === 'light'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Sun className="w-5 h-5" />
                    <span>Light</span>
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-colors ${
                      theme === 'dark'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Moon className="w-5 h-5" />
                    <span>Dark</span>
                  </button>
                </div>
              </div>
            </div>
          )
        },
        {
          icon: Globe,
          label: 'Language',
          description: 'Choose your language',
          content: (
            <div className="space-y-4">
              <div>
                <p className="font-medium mb-3">Language</p>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                  <option value="it">Italiano</option>
                  <option value="pt">Português</option>
                </select>
              </div>
            </div>
          )
        }
      ]
    },
    {
      title: 'Security',
      items: [
        {
          icon: Shield,
          label: 'Privacy & Security',
          description: 'Manage your privacy settings',
          onClick: () => navigate('/settings/privacy')
        }
      ]
    },
    {
      title: 'Support',
      items: [
        {
          icon: HelpCircle,
          label: 'Help & Support',
          description: 'Get help or contact support',
          onClick: () => window.open('https://help.chatapp.com', '_blank')
        }
      ]
    }
  ]

  const [expandedSection, setExpandedSection] = useState(null)

  const toggleSection = (sectionIndex, itemIndex) => {
    const key = `${sectionIndex}-${itemIndex}`
    setExpandedSection(expandedSection === key ? null : key)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 py-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600">Manage your account and preferences</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {settingSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="card">
              <div className="card-content">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {section.title}
                </h2>
                <div className="space-y-1">
                  {section.items.map((item, itemIndex) => {
                    const isExpanded = expandedSection === `${sectionIndex}-${itemIndex}`
                    const hasContent = !!item.content
                    
                    return (
                      <div key={itemIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => {
                            if (hasContent) {
                              toggleSection(sectionIndex, itemIndex)
                            } else if (item.onClick) {
                              item.onClick()
                            }
                          }}
                          className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left"
                        >
                          <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <item.icon className="w-5 h-5 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{item.label}</p>
                            <p className="text-sm text-gray-500">{item.description}</p>
                          </div>
                          {hasContent ? (
                            <ChevronRight 
                              className={`w-5 h-5 text-gray-400 transition-transform ${
                                isExpanded ? 'rotate-90' : ''
                              }`} 
                            />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                        
                        {hasContent && isExpanded && (
                          <div className="px-4 pb-4 border-t border-gray-100">
                            <div className="pt-4">
                              {item.content}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Profile Modal */}
      {showUserProfile && (
        <UserProfile
          user={user}
          onClose={() => setShowUserProfile(false)}
        />
      )}
    </div>
  )
}

export default Settings
