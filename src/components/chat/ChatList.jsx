import React, { useState } from 'react'
import { Search, Plus, Users, User, MoreVertical } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useWebSocket } from '../../contexts/WebSocketContext'
import CreateChatModal from './CreateChatModal'

const ChatList = ({ chats, activeChat, onChatSelect, onNewChat, collapsed }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const { isUserOnline } = useWebSocket()

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatTime = (date) => {
    const now = new Date()
    const messageDate = new Date(date)
    const diffInMinutes = Math.floor((now - messageDate) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'now'
    if (diffInMinutes < 60) return `${diffInMinutes}m`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`
    return formatDistanceToNow(messageDate, { addSuffix: false })
  }

  const ChatAvatar = ({ chat }) => {
    if (chat.type === 'group') {
      return (
        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
          <Users className="w-6 h-6 text-white" />
        </div>
      )
    }

    return (
      <div className="relative">
        {chat.avatar ? (
          <img
            src={chat.avatar}
            alt={chat.name}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
        )}
        {chat.type === 'direct' && (
          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
            isUserOnline(chat.userId) || chat.isOnline ? 'bg-green-400' : 'bg-gray-400'
          }`} />
        )}
      </div>
    )
  }

  if (collapsed) {
    return (
      <div className="h-full flex flex-col items-center py-4">
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white mb-4 transition-colors"
          title="New Chat"
        >
          <Plus className="w-5 h-5" />
        </button>
        
        <div className="space-y-2 flex-1 overflow-y-auto">
          {filteredChats.slice(0, 5).map((chat) => (
            <button
              key={chat.id}
              onClick={() => onChatSelect(chat)}
              className={`relative w-10 h-10 rounded-full transition-all ${
                activeChat?.id === chat.id 
                  ? 'ring-2 ring-blue-500 ring-offset-2' 
                  : 'hover:ring-2 hover:ring-gray-300 hover:ring-offset-2'
              }`}
              title={chat.name}
            >
              <ChatAvatar chat={chat} />
              {chat.unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                </div>
              )}
            </button>
          ))}
        </div>

        {showCreateModal && (
          <CreateChatModal
            onClose={() => setShowCreateModal(false)}
            onChatCreated={onNewChat}
          />
        )}
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="New Chat"
          >
            <Plus className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {searchQuery ? 'No conversations found' : 'No conversations yet'}
          </div>
        ) : (
          <div className="space-y-1">
            {filteredChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => onChatSelect(chat)}
                className={`w-full p-4 hover:bg-gray-50 transition-colors ${
                  activeChat?.id === chat.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <ChatAvatar chat={chat} />
                  
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`font-medium truncate ${
                        activeChat?.id === chat.id ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {chat.name}
                        {chat.type === 'group' && chat.memberCount && (
                          <span className="text-sm text-gray-500 ml-1">
                            ({chat.memberCount})
                          </span>
                        )}
                      </h3>
                      <div className="flex items-center gap-1">
                        {chat.lastMessageTime && (
                          <span className="text-xs text-gray-400">
                            {formatTime(chat.lastMessageTime)}
                          </span>
                        )}
                        <button className="p-1 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="w-3 h-3 text-gray-400" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 truncate flex-1">
                        {chat.lastMessage || 'No messages yet'}
                      </p>
                      {chat.unreadCount > 0 && (
                        <div className="ml-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Create Chat Modal */}
      {showCreateModal && (
        <CreateChatModal
          onClose={() => setShowCreateModal(false)}
          onChatCreated={onNewChat}
        />
      )}
    </div>
  )
}

export default ChatList
