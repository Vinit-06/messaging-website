import React from 'react'

const TypingIndicator = ({ senderName = 'Someone' }) => {
  return (
    <div className="flex justify-start">
      <div className="max-w-[70%] lg:max-w-[60%]">
        <p className="text-xs text-gray-500 mb-1 px-1">
          {senderName} is typing...
        </p>
        
        <div className="relative px-4 py-3 bg-white border border-gray-200 rounded-2xl animate-slide-in-left">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
          </div>

          {/* Message tail */}
          <div className="absolute top-0 left-0 -translate-x-1 w-0 h-0 border-r-8 border-r-white border-t-8 border-t-transparent" />
        </div>
      </div>
    </div>
  )
}

export default TypingIndicator
