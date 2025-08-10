import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Search, 
  Users, 
  User, 
  MoreHorizontal,
  Check,
  CheckCheck,
  Clock,
  AlertCircle
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useAuth } from '../../contexts/AuthContext'
import { supabase, getUserChats, createChat } from '../../lib/supabase'
import CreateChatModal from './CreateChatModal'

const EnhancedChatList = ({ activeChat, onChatSelect, onCreateChat }) => {
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [error, setError] = useState(null)
  const { user } = useAuth()

  // Load chats from database
  const loadChats = async () => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await getUserChats()
      
      if (fetchError) throw fetchError

      // Transform database chats to UI format
      const transformedChats = (data || []).map(chat => ({
        id: chat.id,
        name: chat.name || 'Unnamed Chat',
        type: chat.type,
        avatar: chat.avatar_url,
        description: chat.description,
        memberCount: chat.chat_members?.length || 0,
        lastMessage: chat.messages?.[0]?.content || 'No messages yet',
        lastMessageTime: chat.messages?.[0]?.created_at 
          ? new Date(chat.messages[0].created_at)
          : new Date(chat.created_at),
        unreadCount: 0, // TODO: Calculate unread messages
        isOnline: false, // TODO: Check online status
        lastSeen: new Date(),
        typingUsers: []
      }))

      setChats(transformedChats)
    } catch (err) {
      console.error('Error loading chats:', err)
      setError(err.message)
      
      // Set demo chats if database fails
      setChats(getDemoChats(user))
    } finally {
      setLoading(false)
    }
  }

  // Subscribe to real-time chat updates
  useEffect(() => {
    loadChats()

    // Subscribe to chat changes
    const chatsChannel = supabase
      .channel('chats-list')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'chats' },
        (payload) => {
          console.log('New chat created:', payload)
          // Add new chat to the list
          const newChat = {
            id: payload.new.id,
            name: payload.new.name || 'Unnamed Chat',
            type: payload.new.type,
            avatar: payload.new.avatar_url,
            description: payload.new.description,
            memberCount: 1,
            lastMessage: 'Chat created',
            lastMessageTime: new Date(payload.new.created_at),
            unreadCount: 0,
            isOnline: false,
            lastSeen: new Date(),
            typingUsers: []
          }
          setChats(prev => [newChat, ...prev])
        }
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'chats' },
        (payload) => {
          console.log('Chat updated:', payload)
          // Update chat in the list
          setChats(prev => prev.map(chat => 
            chat.id === payload.new.id
              ? { 
                  ...chat, 
                  name: payload.new.name || chat.name,
                  description: payload.new.description,
                  avatar: payload.new.avatar_url
                }
              : chat
          ))
        }
      )
      .on('postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'chats' },
        (payload) => {
          console.log('Chat deleted:', payload)
          // Remove chat from the list
          setChats(prev => prev.filter(chat => chat.id !== payload.old.id))
        }
      )
      .subscribe()

    // Subscribe to new messages to update last message
    const messagesChannel = supabase
      .channel('messages-list')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        async (payload) => {
          console.log('New message for chat list:', payload)
          
          // Get sender profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', payload.new.user_id)
            .single()

          // Update the chat's last message
          setChats(prev => prev.map(chat => 
            chat.id === payload.new.chat_id
              ? {
                  ...chat,
                  lastMessage: payload.new.content,
                  lastMessageTime: new Date(payload.new.created_at),
                  unreadCount: payload.new.user_id !== user?.id 
                    ? chat.unreadCount + 1 
                    : chat.unreadCount
                }
              : chat
          ).sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)))
        }
      )
      .subscribe()

    // Cleanup
    return () => {
      supabase.removeChannel(chatsChannel)
      supabase.removeChannel(messagesChannel)
    }
  }, [user?.id])

  // Filter chats based on search term
  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateChat = async (chatData) => {
    try {
      const { data, error } = await createChat(
        chatData.name,
        chatData.type,
        chatData.description
      )

      if (error) throw error

      // Add members if it's a group chat
      if (chatData.members && chatData.members.length > 0) {
        // TODO: Add members to the chat
      }

      setShowCreateModal(false)
      
      // The new chat will be added via real-time subscription
      // Select the new chat
      if (onChatSelect) {
        onChatSelect({
          ...data,
          name: data.name,
          type: data.type,
          memberCount: 1,
          isOnline: false,
          lastMessage: 'Chat created',
          lastMessageTime: new Date(data.created_at)
        })
      }

      if (onCreateChat) {
        onCreateChat(data)
      }

      return { success: true }
    } catch (err) {
      console.error('Error creating chat:', err)
      return { success: false, error: err.message }
    }
  }

  const handleChatClick = (chat) => {
    // Mark chat as read when selected
    if (chat.unreadCount > 0) {
      setChats(prev => prev.map(c => 
        c.id === chat.id ? { ...c, unreadCount: 0 } : c
      ))
    }

    if (onChatSelect) {
      onChatSelect(chat)
    }
  }

  if (loading) {
    return (
      <div className="w-80 glass-sidebar border-r border-white/20 p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-white/20 rounded-xl"></div>
          <div className="h-12 bg-white/20 rounded-xl"></div>
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-2xl"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-white/20 rounded w-3/4"></div>
                  <div className="h-3 bg-white/20 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-80 glass-sidebar border-r border-white/20 p-4">
        <div className="text-center py-8">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 mb-4">Failed to load chats</p>
          <button
            onClick={loadChats}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-80 glass-sidebar border-r border-white/20 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-2xl -translate-x-16 -translate-y-16"></div>
      <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-pink-400/10 to-cyan-400/10 rounded-full blur-2xl translate-x-12 translate-y-12"></div>

      <div className="relative z-10 h-full flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Messages</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="p-2 hover:bg-white/20 rounded-xl transition-all duration-300 floating-element border border-white/10 hover:border-white/30 backdrop-blur-sm"
              title="New Chat"
            >
              <Plus className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/60 border border-white/30 rounded-2xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 backdrop-blur-md transition-all duration-300 placeholder:text-gray-500"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredChats.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'No chats match your search' : 'No conversations yet'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
                >
                  Start a conversation
                </button>
              )}
            </div>
          ) : (
            filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => handleChatClick(chat)}
                className={`flex items-center p-4 rounded-2xl cursor-pointer transition-all duration-300 group hover:bg-white/20 backdrop-blur-sm border border-white/10 hover:border-white/30 floating-element ${
                  activeChat?.id === chat.id
                    ? 'bg-white/30 border-white/40 shadow-lg'
                    : ''
                }`}
              >
                {/* Avatar */}
                <div className="relative mr-4">
                  {chat.avatar ? (
                    <img
                      src={chat.avatar}
                      alt={chat.name}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white/20"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                      {chat.type === 'group' ? (
                        <Users className="w-6 h-6 text-white" />
                      ) : (
                        <User className="w-6 h-6 text-white" />
                      )}
                    </div>
                  )}
                  
                  {/* Online status */}
                  {chat.type === 'direct' && chat.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-lg animate-pulse" />
                  )}
                  
                  {/* Unread count */}
                  {chat.unreadCount > 0 && (
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 font-medium">
                      {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                    </div>
                  )}
                </div>

                {/* Chat Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-800 truncate">
                      {chat.name}
                    </h3>
                    <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                      {formatDistanceToNow(chat.lastMessageTime, { addSuffix: false })}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 truncate flex-1">
                      {chat.typingUsers.length > 0 ? (
                        <span className="text-blue-500 italic">
                          {chat.typingUsers.length === 1 
                            ? `${chat.typingUsers[0]} is typing...`
                            : `${chat.typingUsers.length} people are typing...`
                          }
                        </span>
                      ) : (
                        chat.lastMessage
                      )}
                    </p>
                    
                    {/* Message status */}
                    {chat.lastMessageSenderId === user?.id && (
                      <div className="ml-2 flex-shrink-0">
                        {chat.lastMessageStatus === 'sending' && (
                          <Clock className="w-3 h-3 text-gray-400" />
                        )}
                        {chat.lastMessageStatus === 'sent' && (
                          <Check className="w-3 h-3 text-gray-400" />
                        )}
                        {chat.lastMessageStatus === 'delivered' && (
                          <CheckCheck className="w-3 h-3 text-gray-400" />
                        )}
                        {chat.lastMessageStatus === 'read' && (
                          <CheckCheck className="w-3 h-3 text-blue-500" />
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* More options */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    // TODO: Show chat options menu
                  }}
                  className="p-1 hover:bg-white/20 rounded opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                >
                  <MoreHorizontal className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Chat Modal */}
      {showCreateModal && (
        <CreateChatModal
          onClose={() => setShowCreateModal(false)}
          onCreateChat={handleCreateChat}
        />
      )}
    </div>
  )
}

// Demo chats for when database is not configured
const getDemoChats = (user) => {
  return [
    {
      id: '1',
      name: 'John Doe',
      type: 'direct',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=256&h=256&fit=face',
      lastMessage: 'Hey! How are you doing?',
      lastMessageTime: new Date(Date.now() - 2 * 60 * 1000),
      unreadCount: 2,
      isOnline: true,
      lastSeen: new Date(),
      typingUsers: []
    },
    {
      id: '2',
      name: 'Jane Smith',
      type: 'direct',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616c2b9a6fe?w=256&h=256&fit=face',
      lastMessage: 'Thanks for the help!',
      lastMessageTime: new Date(Date.now() - 30 * 60 * 1000),
      unreadCount: 0,
      isOnline: false,
      lastSeen: new Date(Date.now() - 15 * 60 * 1000),
      typingUsers: []
    },
    {
      id: '3',
      name: 'Project Team',
      type: 'group',
      avatar: null,
      memberCount: 5,
      lastMessage: 'Meeting at 3 PM today',
      lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
      unreadCount: 1,
      isOnline: false,
      lastSeen: new Date(),
      typingUsers: []
    }
  ]
}

export default EnhancedChatList
