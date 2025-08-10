import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useWebSocket } from '../contexts/WebSocketContext'
import Sidebar from '../components/dashboard/Sidebar'
import ChatList from '../components/chat/ChatList'
import ChatWindow from '../components/chat/ChatWindow'
import UserProfile from '../components/dashboard/UserProfile'
import AIFeaturesPanel from '../components/ai/AIFeaturesPanel'
import LoadingSpinner from '../components/LoadingSpinner'

const ChatDashboard = () => {
  const [activeChat, setActiveChat] = useState(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showUserProfile, setShowUserProfile] = useState(false)
  const [showAIFeatures, setShowAIFeatures] = useState(false)
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(true)

  const { user } = useAuth()
  const { connected, onMessage, onChatUpdate } = useWebSocket()

  useEffect(() => {
    // Simulate loading chats - replace with actual API call
    const loadChats = async () => {
      setLoading(true)
      try {
        // This would be replaced with actual API call to load user's chats
        const mockChats = [
          {
            id: '1',
            name: 'John Doe',
            type: 'direct',
            lastMessage: 'Hey, how are you doing?',
            lastMessageTime: new Date(Date.now() - 5 * 60 * 1000),
            unreadCount: 2,
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
            isOnline: true
          },
          {
            id: '2',
            name: 'Design Team',
            type: 'group',
            lastMessage: 'Alice: The new mockups are ready',
            lastMessageTime: new Date(Date.now() - 30 * 60 * 1000),
            unreadCount: 0,
            avatar: null,
            memberCount: 8
          },
          {
            id: '3',
            name: 'Sarah Wilson',
            type: 'direct',
            lastMessage: 'Thanks for your help!',
            lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
            unreadCount: 0,
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
            isOnline: false
          }
        ]
        setChats(mockChats)
      } catch (error) {
        console.error('Error loading chats:', error)
      } finally {
        setLoading(false)
      }
    }

    loadChats()
  }, [])

  useEffect(() => {
    // Listen for new messages
    const unsubscribeMessage = onMessage && onMessage((messageData) => {
      setChats(prevChats => 
        prevChats.map(chat => {
          if (chat.id === messageData.chatId) {
            return {
              ...chat,
              lastMessage: messageData.content,
              lastMessageTime: new Date(messageData.timestamp),
              unreadCount: chat.id === activeChat?.id ? 0 : chat.unreadCount + 1
            }
          }
          return chat
        })
      )
    })

    // Listen for chat updates
    const unsubscribeChatUpdate = onChatUpdate && onChatUpdate((chatData) => {
      setChats(prevChats => {
        const existingChatIndex = prevChats.findIndex(chat => chat.id === chatData.id)
        if (existingChatIndex >= 0) {
          const newChats = [...prevChats]
          newChats[existingChatIndex] = { ...newChats[existingChatIndex], ...chatData }
          return newChats
        } else {
          return [chatData, ...prevChats]
        }
      })
    })

    return () => {
      unsubscribeMessage && unsubscribeMessage()
      unsubscribeChatUpdate && unsubscribeChatUpdate()
    }
  }, [onMessage, onChatUpdate, activeChat])

  const handleChatSelect = (chat) => {
    setActiveChat(chat)
    // Mark messages as read
    setChats(prevChats =>
      prevChats.map(c => 
        c.id === chat.id ? { ...c, unreadCount: 0 } : c
      )
    )
  }

  const handleNewChat = (chatData) => {
    setChats(prevChats => [chatData, ...prevChats])
    setActiveChat(chatData)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="h-screen flex overflow-hidden relative"
         style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)'}}>
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onShowUserProfile={() => setShowUserProfile(true)}
        onShowAIFeatures={() => setShowAIFeatures(true)}
        connectionStatus={connected}
      />

      {/* Chat List */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-80'} transition-all duration-300 border-r border-gray-200 bg-white flex-shrink-0`}>
        <ChatList
          chats={chats}
          activeChat={activeChat}
          onChatSelect={handleChatSelect}
          onNewChat={handleNewChat}
          collapsed={sidebarCollapsed}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {activeChat ? (
          <ChatWindow 
            chat={activeChat}
            user={user}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-white">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Welcome to ChatApp</h3>
              <p className="text-gray-500">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* User Profile Modal */}
      {showUserProfile && (
        <UserProfile
          user={user}
          onClose={() => setShowUserProfile(false)}
        />
      )}

      {/* AI Features Panel */}
      {showAIFeatures && (
        <AIFeaturesPanel
          onClose={() => setShowAIFeatures(false)}
          activeChat={activeChat}
        />
      )}

      {/* Connection Status Indicator */}
      {!connected && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-2 rounded-lg shadow-lg z-50">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Reconnecting...</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChatDashboard
