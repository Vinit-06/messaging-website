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
  Mic,
  MicOff,
  AlertCircle,
  RefreshCw,
  Edit3,
  Trash2
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useAuth } from '../../contexts/AuthContext'
import { useRealTimeMessages } from '../../hooks/useRealTimeMessages'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'
import FileUploadModal from './FileUploadModal'

const EnhancedChatWindow = ({ chat, onClose }) => {
  const [newMessage, setNewMessage] = useState('')
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [typingTimeout, setTypingTimeout] = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const [editingMessageId, setEditingMessageId] = useState(null)
  const [editContent, setEditContent] = useState('')
  const messagesEndRef = useRef(null)
  const messageInputRef = useRef(null)
  const { user } = useAuth()

  const {
    messages,
    loading,
    error,
    typingUsers,
    sendMessage,
    sendTypingIndicator,
    markAsRead,
    retryMessage,
    deleteMessage,
    editMessage,
    refresh
  } = useRealTimeMessages(chat?.id)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Mark messages as read when component is focused
  useEffect(() => {
    const unreadMessages = messages
      .filter(msg => msg.senderId !== user?.id && !msg.readBy.includes(user?.id))
      .map(msg => msg.id)

    if (unreadMessages.length > 0) {
      markAsRead(unreadMessages)
    }
  }, [messages, user?.id, markAsRead])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const content = newMessage.trim()
    setNewMessage('')
    
    // Clear typing indicator
    sendTypingIndicator(false)
    if (typingTimeout) {
      clearTimeout(typingTimeout)
      setTypingTimeout(null)
    }

    const result = await sendMessage(content)
    
    if (!result.success) {
      // Show error to user
      console.error('Failed to send message:', result.error)
    }
  }

  const handleTyping = (e) => {
    setNewMessage(e.target.value)
    
    // Send typing indicator
    sendTypingIndicator(true)
    
    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout)
    }
    
    // Set new timeout to stop typing indicator
    const timeout = setTimeout(() => {
      sendTypingIndicator(false)
    }, 1000)
    
    setTypingTimeout(timeout)
  }

  const handleFileUpload = async (file) => {
    // TODO: Upload file to storage and get URL
    const fileData = {
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size
    }

    const result = await sendMessage(file.name, 'file', fileData)
    
    if (!result.success) {
      console.error('Failed to upload file:', result.error)
    }
  }

  const handleRetryMessage = async (messageId) => {
    const result = await retryMessage(messageId)
    if (!result.success) {
      console.error('Failed to retry message:', result.error)
    }
  }

  const handleEditMessage = async (messageId) => {
    if (!editContent.trim()) return

    const result = await editMessage(messageId, editContent)
    if (result.success) {
      setEditingMessageId(null)
      setEditContent('')
    } else {
      console.error('Failed to edit message:', result.error)
    }
  }

  const handleDeleteMessage = async (messageId) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      const result = await deleteMessage(messageId)
      if (!result.success) {
        console.error('Failed to delete message:', result.error)
      }
    }
  }

  const startEdit = (message) => {
    setEditingMessageId(message.id)
    setEditContent(message.content)
  }

  const cancelEdit = () => {
    setEditingMessageId(null)
    setEditContent('')
  }

  const handleVoiceRecord = () => {
    // TODO: Implement voice recording
    setIsRecording(!isRecording)
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">Failed to load messages</p>
          <button
            onClick={refresh}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Select a chat to start messaging</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col glass-chat-window relative overflow-hidden m-4 mr-6">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-400/5 to-purple-400/5 rounded-full blur-3xl translate-x-48 -translate-y-48"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-pink-400/5 to-cyan-400/5 rounded-full blur-3xl -translate-x-32 translate-y-32"></div>

      {/* Chat Header */}
      <div className="p-6 border-b border-white/20 backdrop-blur-sm relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
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
              {chat.type === 'direct' && chat.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-lg animate-pulse" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-lg">{chat.name}</h3>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${chat.isOnline ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                <p className="text-sm text-gray-600 font-medium">
                  {chat.type === 'direct'
                    ? (chat.isOnline ? 'Online now' : 'Last seen recently')
                    : `${chat.memberCount || 0} members`
                  }
                  {typingUsers.length > 0 && (
                    <span className="text-blue-500 ml-2">
                      {typingUsers.length === 1 
                        ? `${typingUsers[0].user_name} is typing...`
                        : `${typingUsers.length} people are typing...`
                      }
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-3 hover:bg-white/20 rounded-xl transition-all duration-300 floating-element border border-white/10 hover:border-white/30 backdrop-blur-sm">
              <Phone className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-3 hover:bg-white/20 rounded-xl transition-all duration-300 floating-element border border-white/10 hover:border-white/30 backdrop-blur-sm">
              <Video className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-3 hover:bg-white/20 rounded-xl transition-all duration-300 floating-element border border-white/10 hover:border-white/30 backdrop-blur-sm">
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 relative z-10">
        {messages.map((message, index) => {
          const isLastMessage = index === messages.length - 1
          const showTimestamp = index === 0 ||
            (new Date(message.timestamp) - new Date(messages[index - 1].timestamp)) > 5 * 60 * 1000
          const isOwn = message.senderId === user?.id
          const isEditing = editingMessageId === message.id

          return (
            <div key={message.id}>
              {showTimestamp && (
                <div className="text-center mb-6">
                  <span className="inline-block px-4 py-2 text-xs text-gray-500 bg-white/40 backdrop-blur-sm rounded-full border border-white/30">
                    {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                  </span>
                </div>
              )}
              
              <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
                <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
                  {/* Message bubble or edit form */}
                  {isEditing ? (
                    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-white/30">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg resize-none"
                        rows={2}
                        autoFocus
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleEditMessage(message.id)}
                          className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-3 py-1 bg-gray-500 text-white rounded-lg text-sm hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="group relative">
                      <MessageBubble
                        message={message}
                        isOwn={isOwn}
                        showStatus={isLastMessage && isOwn}
                        onRetry={() => handleRetryMessage(message.id)}
                      />
                      
                      {/* Message actions (only for own messages) */}
                      {isOwn && (
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <button
                            onClick={() => startEdit(message)}
                            className="p-1 bg-white/20 rounded-full hover:bg-white/30 backdrop-blur-sm"
                            title="Edit message"
                          >
                            <Edit3 className="w-3 h-3 text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleDeleteMessage(message.id)}
                            className="p-1 bg-white/20 rounded-full hover:bg-red-200/50 backdrop-blur-sm"
                            title="Delete message"
                          >
                            <Trash2 className="w-3 h-3 text-red-600" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Avatar for received messages */}
                {!isOwn && (
                  <div className="order-1 mr-3">
                    {message.senderAvatar ? (
                      <img
                        src={message.senderAvatar}
                        alt={message.senderName}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-medium">
                          {message.senderName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <TypingIndicator users={typingUsers} />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-6 border-t border-white/20 backdrop-blur-sm relative z-10">
        <form onSubmit={handleSendMessage} className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setShowFileUpload(true)}
            className="p-3 hover:bg-white/20 rounded-xl transition-all duration-300 floating-element border border-white/10 hover:border-white/30 backdrop-blur-sm"
          >
            <Paperclip className="w-5 h-5 text-gray-600" />
          </button>

          <div className="flex-1 relative">
            <input
              ref={messageInputRef}
              type="text"
              value={newMessage}
              onChange={handleTyping}
              placeholder="Type your message..."
              className="w-full px-6 py-4 bg-white/60 border border-white/30 rounded-2xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 backdrop-blur-md pr-20 transition-all duration-300 placeholder:text-gray-500"
              maxLength={1000}
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
              <button
                type="button"
                className="p-2 hover:bg-white/20 rounded-xl transition-all duration-300 backdrop-blur-sm"
              >
                <Smile className="w-5 h-5 text-gray-600" />
              </button>
              <button
                type="button"
                onClick={handleVoiceRecord}
                className={`p-2 rounded-xl transition-all duration-300 backdrop-blur-sm ${
                  isRecording 
                    ? 'bg-red-500 text-white' 
                    : 'hover:bg-white/20 text-gray-600'
                }`}
              >
                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={!newMessage.trim()}
            className={`p-4 rounded-2xl transition-all duration-300 floating-element ${
              newMessage.trim()
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-lg shadow-blue-500/25'
                : 'bg-gray-200/50 text-gray-400 cursor-not-allowed backdrop-blur-sm'
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

export default EnhancedChatWindow
