import React, { useState } from 'react'
import { X, Search, User, Users, Plus } from 'lucide-react'

const CreateChatModal = ({ onClose, onChatCreated }) => {
  const [chatType, setChatType] = useState('direct') // 'direct' or 'group'
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUsers, setSelectedUsers] = useState([])
  const [groupName, setGroupName] = useState('')
  const [loading, setLoading] = useState(false)

  // Mock users - replace with actual API call
  const availableUsers = [
    { id: '1', name: 'Alice Johnson', email: 'alice@example.com', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
    { id: '2', name: 'Bob Smith', email: 'bob@example.com', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
    { id: '3', name: 'Carol Davis', email: 'carol@example.com', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
    { id: '4', name: 'David Wilson', email: 'david@example.com', avatar: null },
    { id: '5', name: 'Eva Brown', email: 'eva@example.com', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' }
  ]

  const filteredUsers = availableUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleUserToggle = (user) => {
    if (chatType === 'direct') {
      setSelectedUsers([user])
    } else {
      setSelectedUsers(prev => {
        const isSelected = prev.find(u => u.id === user.id)
        if (isSelected) {
          return prev.filter(u => u.id !== user.id)
        } else {
          return [...prev, user]
        }
      })
    }
  }

  const handleCreateChat = async () => {
    if (selectedUsers.length === 0) return
    if (chatType === 'group' && !groupName.trim()) return

    setLoading(true)

    try {
      // Simulate API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 1000))

      const newChat = {
        id: Date.now().toString(),
        name: chatType === 'direct' ? selectedUsers[0].name : groupName,
        type: chatType,
        lastMessage: null,
        lastMessageTime: null,
        unreadCount: 0,
        avatar: chatType === 'direct' ? selectedUsers[0].avatar : null,
        memberCount: chatType === 'group' ? selectedUsers.length + 1 : null,
        members: selectedUsers
      }

      onChatCreated(newChat)
      onClose()
    } catch (error) {
      console.error('Error creating chat:', error)
    } finally {
      setLoading(false)
    }
  }

  const UserAvatar = ({ user }) => (
    user.avatar ? (
      <img
        src={user.avatar}
        alt={user.name}
        className="w-10 h-10 rounded-full object-cover"
      />
    ) : (
      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
        <User className="w-5 h-5 text-white" />
      </div>
    )
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">New Chat</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Chat Type Selector */}
          <div className="mt-4 flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setChatType('direct')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md transition-colors ${
                chatType === 'direct' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <User className="w-4 h-4" />
              Direct Message
            </button>
            <button
              onClick={() => setChatType('group')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md transition-colors ${
                chatType === 'group' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users className="w-4 h-4" />
              Group Chat
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {/* Group Name Input */}
          {chatType === 'group' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Group Name
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter group name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Search Users */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {chatType === 'direct' ? 'Select a user' : 'Add members'}
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Selected Users */}
          {selectedUsers.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    <UserAvatar user={user} />
                    <span>{user.name}</span>
                    <button
                      onClick={() => handleUserToggle(user)}
                      className="ml-1 hover:bg-blue-200 rounded-full p-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* User List */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredUsers.map((user) => {
              const isSelected = selectedUsers.find(u => u.id === user.id)
              return (
                <button
                  key={user.id}
                  onClick={() => handleUserToggle(user)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    isSelected 
                      ? 'bg-blue-50 border border-blue-200' 
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <UserAvatar user={user} />
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                      <Plus className="w-3 h-3 text-white rotate-45" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleCreateChat}
              disabled={loading || selectedUsers.length === 0 || (chatType === 'group' && !groupName.trim())}
              className="flex-1 btn btn-primary"
            >
              {loading ? 'Creating...' : `Create ${chatType === 'direct' ? 'Chat' : 'Group'}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateChatModal
