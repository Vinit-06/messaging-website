import React, { useState, useEffect, useRef } from 'react'
import { 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical, 
  Phone, 
  Video,
  User,
  Users,
  Check,
  CheckCheck
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useWebSocket } from '../../contexts/WebSocketContext'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'
import FileUploadModal from './FileUploadModal'

const ChatWindow = ({ chat, user }) => {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [typingTimeout, setTypingTimeout] = useState(null)
  const messagesEndRef = useRef(null)
  const messageInputRef = useRef(null)

  const { 
    sendMessage, 
    joinChat, 
    leaveChat, 
    setTyping, 
    onMessage, 
    onMessageRead,
    markMessageAsRead,
    isUserTyping 
  } = useWebSocket()

  // Mock messages - replace with actual API call
  useEffect(() => {
    const loadMessages = async () => {
      setLoading(true)
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const mockMessages = [
          {
            id: '1',
            content: 'Hey! How are you doing?',
            senderId: chat.id === '1' ? chat.id : user.id,
            senderName: chat.id === '1' ? 'John Doe' : user.user_metadata?.full_name || 'You',
            timestamp: new Date(Date.now() - 60 * 60 * 1000),
            type: 'text',
            readBy: [user.id],
            status: 'read'
          },
          {
            id: '2',
            content: "I'm doing great! Just working on this new project. How about you?",
            senderId: user.id,
            senderName: user.user_metadata?.full_name || 'You',
            timestamp: new Date(Date.now() - 50 * 60 * 1000),
            type: 'text',
            readBy: [user.id, chat.id],
            status: 'read'
          },
          {
            id: '3',
            content: 'That sounds exciting! What kind of project is it?',
            senderId: chat.id === '1' ? chat.id : user.id,
            senderName: chat.id === '1' ? 'John Doe' : user.user_metadata?.full_name || 'You',
            timestamp: new Date(Date.now() - 40 * 60 * 1000),
            type: 'text',
            readBy: [user.id],
            status: 'read'
          }
        ]
        
        setMessages(mockMessages)
      } catch (error) {
        console.error('Error loading messages:', error)
      } finally {
        setLoading(false)
      }
    }

    loadMessages()
    joinChat(chat.id)

    return () => {
      leaveChat(chat.id)
    }
  }, [chat.id, joinChat, leaveChat])

  // Listen for new messages
  useEffect(() => {
    const unsubscribe = onMessage && onMessage((messageData) => {
      if (messageData.chatId === chat.id) {
        setMessages(prev => [...prev, messageData])
        // Mark as read if window is focused
        if (document.hasFocus() && messageData.senderId !== user.id) {
          markMessageAsRead(messageData.id, chat.id)
        }
      }
    })

    return unsubscribe
  }, [onMessage, chat.id, user.id, markMessageAsRead])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const message = {
      id: Date.now().toString(),
      content: newMessage.trim(),
      senderId: user.id,
      senderName: user.user_metadata?.full_name || 'You',
      timestamp: new Date(),
      type: 'text',
      readBy: [user.id],
      status: 'sending'
    }

    setMessages(prev => [...prev, message])
    setNewMessage('')
    
    // Clear typing indicator
    setTyping(chat.id, false)
    if (typingTimeout) {
      clearTimeout(typingTimeout)
      setTypingTimeout(null)
    }

    try {
      await sendMessage(chat.id, message)
      // Update message status to sent
      setMessages(prev => 
        prev.map(msg => 
          msg.id === message.id ? { ...msg, status: 'sent' } : msg
        )
      )
    } catch (error) {
      console.error('Error sending message:', error)
      // Update message status to failed
      setMessages(prev => 
        prev.map(msg => 
          msg.id === message.id ? { ...msg, status: 'failed' } : msg
        )
      )
    }
  }

  const handleTyping = (e) => {
    setNewMessage(e.target.value)
    
    // Send typing indicator
    setTyping(chat.id, true)
    
    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout)
    }
    
    // Set new timeout to stop typing indicator
    const timeout = setTimeout(() => {
      setTyping(chat.id, false)
    }, 1000)
    
    setTypingTimeout(timeout)
  }

  const handleFileUpload = (file) => {
    // Handle file upload logic here
    const message = {
      id: Date.now().toString(),
      content: file.name,
      senderId: user.id,
      senderName: user.user_metadata?.full_name || 'You',
      timestamp: new Date(),
      type: 'file',
      fileUrl: URL.createObjectURL(file),
      fileName: file.name,
      fileSize: file.size,
      readBy: [user.id],
      status: 'sent'
    }

    setMessages(prev => [...prev, message])
    sendMessage(chat.id, message)
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              {chat.avatar ? (
                <img
                  src={chat.avatar}
                  alt={chat.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                  {chat.type === 'group' ? (
                    <Users className="w-5 h-5 text-white" />
                  ) : (
                    <User className="w-5 h-5 text-white" />
                  )}
                </div>
              )}
              {chat.type === 'direct' && chat.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{chat.name}</h3>
              <p className="text-sm text-gray-500">
                {chat.type === 'direct' 
                  ? (chat.isOnline ? 'Online' : 'Last seen recently')
                  : `${chat.memberCount || 0} members`
                }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Phone className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Video className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message, index) => {
          const isLastMessage = index === messages.length - 1
          const showTimestamp = index === 0 || 
            (new Date(message.timestamp) - new Date(messages[index - 1].timestamp)) > 5 * 60 * 1000

          return (
            <div key={message.id}>
              {showTimestamp && (
                <div className="text-center text-xs text-gray-500 mb-4">
                  {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                </div>
              )}
              <MessageBubble
                message={message}
                isOwn={message.senderId === user.id}
                showStatus={isLastMessage && message.senderId === user.id}
              />
            </div>
          )
        })}
        
        {/* Typing Indicator */}
        {Object.keys(chat.typingUsers || {}).some(key => 
          isUserTyping(key.split('-')[1], chat.id) && key.split('-')[1] !== user.id
        ) && (
          <TypingIndicator />
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowFileUpload(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Paperclip className="w-5 h-5 text-gray-600" />
          </button>

          <div className="flex-1 relative">
            <input
              ref={messageInputRef}
              type="text"
              value={newMessage}
              onChange={handleTyping}
              placeholder="Type a message..."
              className="w-full px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
              maxLength={1000}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Smile className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <button
            type="submit"
            disabled={!newMessage.trim()}
            className={`p-3 rounded-full transition-all ${
              newMessage.trim()
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* File Upload Modal */}
      {showFileUpload && (
        <FileUploadModal
          onClose={() => setShowFileUpload(false)}
          onFileUpload={handleFileUpload}
        />
      )}
    </div>
  )
}

export default ChatWindow
