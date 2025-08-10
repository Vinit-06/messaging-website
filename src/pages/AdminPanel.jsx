import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft,
  Users,
  MessageSquare,
  Shield,
  BarChart3,
  Settings,
  Ban,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'

const AdminPanel = () => {
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalMessages: 0,
    totalChats: 0
  })
  const [users, setUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [userFilter, setUserFilter] = useState('all')

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard')
      return
    }
  }, [isAdmin, navigate])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // Simulate API calls - replace with actual API endpoints
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock stats
      setStats({
        totalUsers: 1247,
        activeUsers: 892,
        totalMessages: 45678,
        totalChats: 1543
      })

      // Mock users
      setUsers([
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          status: 'active',
          lastActive: new Date(Date.now() - 5 * 60 * 1000),
          joinDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          messageCount: 234,
          role: 'user'
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          status: 'banned',
          lastActive: new Date(Date.now() - 60 * 60 * 1000),
          joinDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
          messageCount: 89,
          role: 'user'
        },
        {
          id: '3',
          name: 'Alice Johnson',
          email: 'alice@example.com',
          status: 'active',
          lastActive: new Date(Date.now() - 2 * 60 * 1000),
          joinDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          messageCount: 567,
          role: 'moderator'
        }
      ])
    } catch (error) {
      console.error('Error loading admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUserAction = async (userId, action) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setUsers(prevUsers =>
        prevUsers.map(user => {
          if (user.id === userId) {
            switch (action) {
              case 'ban':
                return { ...user, status: 'banned' }
              case 'unban':
                return { ...user, status: 'active' }
              default:
                return user
            }
          }
          return user
        })
      )
    } catch (error) {
      console.error('Error performing user action:', error)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = 
      userFilter === 'all' || user.status === userFilter

    return matchesSearch && matchesFilter
  })

  const StatCard = ({ title, value, icon: Icon, color = 'blue' }) => (
    <div className="card">
      <div className="card-content">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center`}>
            <Icon className={`w-6 h-6 text-${color}-600`} />
          </div>
          <div>
            <p className="text-sm text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  )

  const UserStatusBadge = ({ status }) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      banned: 'bg-red-100 text-red-800',
      inactive: 'bg-gray-100 text-gray-800'
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'security', label: 'Security', icon: Shield }
  ]

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 py-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-gray-600">Manage users, content, and system settings</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard
                    title="Total Users"
                    value={stats.totalUsers}
                    icon={Users}
                    color="blue"
                  />
                  <StatCard
                    title="Active Users"
                    value={stats.activeUsers}
                    icon={CheckCircle}
                    color="green"
                  />
                  <StatCard
                    title="Total Messages"
                    value={stats.totalMessages}
                    icon={MessageSquare}
                    color="purple"
                  />
                  <StatCard
                    title="Total Chats"
                    value={stats.totalChats}
                    icon={MessageSquare}
                    color="orange"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Recent Activity */}
                  <div className="card">
                    <div className="card-header">
                      <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                    </div>
                    <div className="card-content">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Users className="w-4 h-4 text-blue-600" />
                          <div>
                            <p className="text-sm font-medium">New user registered</p>
                            <p className="text-xs text-gray-500">5 minutes ago</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Ban className="w-4 h-4 text-red-600" />
                          <div>
                            <p className="text-sm font-medium">User banned for policy violation</p>
                            <p className="text-xs text-gray-500">1 hour ago</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <MessageSquare className="w-4 h-4 text-green-600" />
                          <div>
                            <p className="text-sm font-medium">Message reported and reviewed</p>
                            <p className="text-xs text-gray-500">2 hours ago</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* System Status */}
                  <div className="card">
                    <div className="card-header">
                      <h3 className="text-lg font-semibold text-gray-900">System Status</h3>
                    </div>
                    <div className="card-content">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Server Status</span>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="text-sm text-green-600">Online</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Database</span>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="text-sm text-green-600">Connected</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">WebSocket</span>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="text-sm text-green-600">Active</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                {/* Filters */}
                <div className="card">
                  <div className="card-content">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <select
                        value={userFilter}
                        onChange={(e) => setUserFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">All Users</option>
                        <option value="active">Active</option>
                        <option value="banned">Banned</option>
                        <option value="inactive">Inactive</option>
                      </select>
                      <button
                        onClick={loadData}
                        className="btn btn-secondary"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                      </button>
                    </div>
                  </div>
                </div>

                {/* Users Table */}
                <div className="card">
                  <div className="card-content p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-6 font-medium text-gray-500">User</th>
                            <th className="text-left py-3 px-6 font-medium text-gray-500">Status</th>
                            <th className="text-left py-3 px-6 font-medium text-gray-500">Role</th>
                            <th className="text-left py-3 px-6 font-medium text-gray-500">Messages</th>
                            <th className="text-left py-3 px-6 font-medium text-gray-500">Last Active</th>
                            <th className="text-left py-3 px-6 font-medium text-gray-500">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsers.map((user) => (
                            <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-4 px-6">
                                <div>
                                  <p className="font-medium text-gray-900">{user.name}</p>
                                  <p className="text-sm text-gray-500">{user.email}</p>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <UserStatusBadge status={user.status} />
                              </td>
                              <td className="py-4 px-6">
                                <span className="capitalize text-gray-700">{user.role}</span>
                              </td>
                              <td className="py-4 px-6">
                                <span className="text-gray-700">{user.messageCount}</span>
                              </td>
                              <td className="py-4 px-6">
                                <span className="text-sm text-gray-500">
                                  {user.lastActive.toLocaleString()}
                                </span>
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex gap-2">
                                  {user.status === 'active' ? (
                                    <button
                                      onClick={() => handleUserAction(user.id, 'ban')}
                                      className="btn btn-sm bg-red-100 text-red-700 hover:bg-red-200"
                                    >
                                      <Ban className="w-3 h-3" />
                                      Ban
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleUserAction(user.id, 'unban')}
                                      className="btn btn-sm bg-green-100 text-green-700 hover:bg-green-200"
                                    >
                                      <CheckCircle className="w-3 h-3" />
                                      Unban
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Messages Tab */}
            {activeTab === 'messages' && (
              <div className="card">
                <div className="card-content">
                  <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Message Management</h3>
                    <p className="text-gray-500">Monitor and moderate messages across all chats</p>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="card">
                <div className="card-content">
                  <div className="text-center py-12">
                    <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Security Settings</h3>
                    <p className="text-gray-500">Configure security policies and monitoring</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default AdminPanel
