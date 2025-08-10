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
    <div className="h-full flex flex-col glass-strong backdrop-blur-md relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-blue-400/10 to-purple-400/10 rounded-full blur-3xl translate-x-20 -translate-y-20"></div>

      {/* Header */}
      <div className="p-6 border-b border-white/20 backdrop-blur-sm relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-1">Messages</h2>
            <p className="text-sm text-gray-600">Stay connected with everyone</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 floating-element"
            title="New Chat"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input pl-12 pr-4 py-3 glass border-white/30 backdrop-blur-md placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto p-4 relative z-10">
        {filteredChats.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">{searchQuery ? 'No conversations found' : 'No conversations yet'}</p>
            <p className="text-gray-400 text-sm mt-1">Start a new conversation to get chatting!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => onChatSelect(chat)}
                className={`group w-full p-4 rounded-2xl transition-all duration-300 floating-element backdrop-blur-sm border ${
                  activeChat?.id === chat.id
                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-300/50 shadow-lg shadow-blue-500/20'
                    : 'bg-white/40 border-white/30 hover:bg-white/60 hover:border-white/50 hover:shadow-md'
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
                        <div
                          className="p-1 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation()
                            // Handle menu action here
                          }}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              e.stopPropagation()
                              // Handle menu action here
                            }
                          }}
                          aria-label="Chat options"
                        >
                          <MoreVertical className="w-3 h-3 text-gray-400" />
                        </div>
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
