import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'
import { webSocketDemo, isWebSocketDemo } from '../lib/websocket-demo'

const WebSocketContext = createContext({})

export const useWebSocket = () => {
  const context = useContext(WebSocketContext)
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider')
  }
  return context
}

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState([])
  const [typingUsers, setTypingUsers] = useState({})
  const { user, isAuthenticated } = useAuth()
  const reconnectTimeoutRef = useRef(null)
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 5

  useEffect(() => {
    if (isAuthenticated && user) {
      connectSocket()
    } else {
      disconnectSocket()
    }

    return () => {
      disconnectSocket()
    }
  }, [isAuthenticated, user])

  const connectSocket = () => {
    if (socket?.connected) return

    try {
      const newSocket = io(import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:3001', {
        auth: {
          userId: user?.id,
          userEmail: user?.email,
          userMetadata: user?.user_metadata
        },
        transports: ['websocket', 'polling'],
        timeout: 5000
      })

      newSocket.on('connect', () => {
        console.log('WebSocket connected')
        setConnected(true)
        setSocket(newSocket)
        reconnectAttemptsRef.current = 0
      })

      newSocket.on('disconnect', (reason) => {
        console.log('WebSocket disconnected:', reason)
        setConnected(false)

        // Auto-reconnect on certain disconnect reasons
        if (reason === 'io server disconnect') {
          // Server disconnected, don't reconnect
          return
        }

        // Attempt to reconnect
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const timeout = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000)
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++
            connectSocket()
          }, timeout)
        }
      })

      newSocket.on('online-users', (users) => {
        setOnlineUsers(users)
      })

      newSocket.on('user-typing', ({ userId, chatId, isTyping }) => {
        setTypingUsers(prev => ({
          ...prev,
          [`${chatId}-${userId}`]: isTyping ? { userId, chatId } : undefined
        }))
      })

      newSocket.on('connect_error', (error) => {
        console.warn('WebSocket connection failed (demo mode):', error.message)
        setConnected(false)
      })
    } catch (error) {
      console.warn('WebSocket initialization failed (demo mode):', error.message)
      setConnected(false)
    }
  }

  const disconnectSocket = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    
    if (socket) {
      socket.disconnect()
      setSocket(null)
    }
    setConnected(false)
    setOnlineUsers([])
    setTypingUsers({})
  }

  // Message functions
  const sendMessage = (chatId, message) => {
    if (socket && connected) {
      socket.emit('send-message', {
        chatId,
        message,
        senderId: user?.id,
        timestamp: new Date().toISOString()
      })
    }
  }

  const joinChat = (chatId) => {
    if (socket && connected) {
      socket.emit('join-chat', chatId)
    }
  }

  const leaveChat = (chatId) => {
    if (socket && connected) {
      socket.emit('leave-chat', chatId)
    }
  }

  const setTyping = (chatId, isTyping) => {
    if (socket && connected) {
      socket.emit('typing', { chatId, isTyping })
    }
  }

  const markMessageAsRead = (messageId, chatId) => {
    if (socket && connected) {
      socket.emit('mark-read', { messageId, chatId })
    }
  }

  // Event listeners
  const onMessage = (callback) => {
    if (socket) {
      socket.on('new-message', callback)
      return () => socket.off('new-message', callback)
    }
  }

  const onMessageRead = (callback) => {
    if (socket) {
      socket.on('message-read', callback)
      return () => socket.off('message-read', callback)
    }
  }

  const onUserStatusChange = (callback) => {
    if (socket) {
      socket.on('user-status-change', callback)
      return () => socket.off('user-status-change', callback)
    }
  }

  const onChatUpdate = (callback) => {
    if (socket) {
      socket.on('chat-update', callback)
      return () => socket.off('chat-update', callback)
    }
  }

  const value = {
    socket,
    connected,
    onlineUsers,
    typingUsers,
    sendMessage,
    joinChat,
    leaveChat,
    setTyping,
    markMessageAsRead,
    onMessage,
    onMessageRead,
    onUserStatusChange,
    onChatUpdate,
    isUserOnline: (userId) => onlineUsers.includes(userId),
    isUserTyping: (userId, chatId) => !!typingUsers[`${chatId}-${userId}`]
  }

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  )
}
