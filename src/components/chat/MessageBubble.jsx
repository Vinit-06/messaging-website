import React from 'react'
import { Check, CheckCheck, Clock, AlertCircle, Download, Eye } from 'lucide-react'
import { format } from 'date-fns'

const MessageBubble = ({ message, isOwn, showStatus = false }) => {
  const formatTime = (timestamp) => {
    return format(new Date(timestamp), 'HH:mm')
  }

  const getStatusIcon = () => {
    switch (message.status) {
      case 'sending':
        return <Clock className="w-3 h-3 text-gray-400" />
      case 'sent':
        return <Check className="w-3 h-3 text-gray-400" />
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-gray-400" />
      case 'read':
        return <CheckCheck className="w-3 h-3 text-blue-500" />
      case 'failed':
        return <AlertCircle className="w-3 h-3 text-red-500" />
      default:
        return null
    }
  }

  const renderFileContent = () => {
    if (message.type !== 'file') return null

    const isImage = message.fileName?.match(/\.(jpg|jpeg|png|gif|webp)$/i)
    const isVideo = message.fileName?.match(/\.(mp4|webm|ogg)$/i)
    
    if (isImage) {
      return (
        <div className="relative group">
          <img
            src={message.fileUrl}
            alt={message.fileName}
            className="max-w-xs rounded-lg cursor-pointer"
            onClick={() => window.open(message.fileUrl, '_blank')}
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity rounded-lg flex items-center justify-center">
            <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      )
    }
    
    if (isVideo) {
      return (
        <video
          src={message.fileUrl}
          controls
          className="max-w-xs rounded-lg"
        />
      )
    }

    // Generic file
    return (
      <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg max-w-xs">
        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {message.fileName}
          </p>
          <p className="text-xs text-gray-500">
            {message.fileSize ? `${(message.fileSize / 1024 / 1024).toFixed(1)} MB` : 'File'}
          </p>
        </div>
        <button
          onClick={() => {
            const link = document.createElement('a')
            link.href = message.fileUrl
            link.download = message.fileName
            link.click()
          }}
          className="flex-shrink-0 p-1 hover:bg-gray-200 rounded-full transition-colors"
        >
          <Download className="w-4 h-4 text-gray-600" />
        </button>
      </div>
    )
  }

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className="max-w-[70%] lg:max-w-[60%]">
        {/* Sender name for group chats */}
        {!isOwn && message.senderName && (
          <p className="text-xs text-gray-500 mb-1 px-1">
            {message.senderName}
          </p>
        )}
        
        <div
          className={`relative px-4 py-2 rounded-2xl ${
            isOwn
              ? 'bg-blue-600 text-white animate-slide-in-right'
              : 'bg-white text-gray-900 border border-gray-200 animate-slide-in-left'
          } ${message.status === 'failed' ? 'bg-red-100 border-red-300' : ''}`}
        >
          {/* Message Content */}
          {message.type === 'text' ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {message.content}
            </p>
          ) : (
            renderFileContent()
          )}

          {/* Message Time & Status */}
          <div className={`flex items-center gap-1 mt-1 ${
            message.type === 'file' ? 'justify-end' : ''
          }`}>
            <span className={`text-xs ${
              isOwn ? 'text-blue-100' : 'text-gray-500'
            }`}>
              {formatTime(message.timestamp)}
            </span>
            
            {showStatus && isOwn && (
              <div className="flex items-center">
                {getStatusIcon()}
              </div>
            )}
          </div>

          {/* Message tail */}
          <div
            className={`absolute top-0 w-0 h-0 ${
              isOwn
                ? 'right-0 translate-x-1 border-l-8 border-l-blue-600 border-t-8 border-t-transparent'
                : 'left-0 -translate-x-1 border-r-8 border-r-white border-t-8 border-t-transparent'
            }`}
          />
        </div>

        {/* Retry button for failed messages */}
        {message.status === 'failed' && isOwn && (
          <button className="text-xs text-red-600 hover:text-red-700 mt-1 px-1">
            Tap to retry
          </button>
        )}
      </div>
    </div>
  )
}

export default MessageBubble
