// WebSocket Demo Server Simulation
// This simulates real-time messaging when a WebSocket server is not available

class WebSocketDemo {
  constructor() {
    this.connections = new Map()
    this.rooms = new Map()
    this.eventHandlers = new Map()
    this.isConnected = false
    this.userId = null
    this.userMetadata = null
  }

  // Simulate connection
  connect(userId, userMetadata) {
    this.userId = userId
    this.userMetadata = userMetadata
    this.isConnected = true
    
    // Simulate connection delay
    setTimeout(() => {
      this.emit('connect')
      this.emit('online-users', this.getOnlineUsers())
    }, 500)
  }

  // Simulate disconnection
  disconnect() {
    this.isConnected = false
    this.emit('disconnect', 'client disconnect')
    this.connections.clear()
    this.rooms.clear()
  }

  // Event listener registration
  on(event, callback) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, [])
    }
    this.eventHandlers.get(event).push(callback)
  }

  // Remove event listener
  off(event, callback) {
    if (this.eventHandlers.has(event)) {
      const handlers = this.eventHandlers.get(event)
      const index = handlers.indexOf(callback)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    }
  }

  // Emit event to all listeners
  emit(event, data) {
    if (this.eventHandlers.has(event)) {
      this.eventHandlers.get(event).forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.warn('WebSocket event handler error:', error)
        }
      })
    }
  }

  // Join a chat room
  joinChat(chatId) {
    if (!this.rooms.has(chatId)) {
      this.rooms.set(chatId, new Set())
    }
    this.rooms.get(chatId).add(this.userId)
    console.log(`User ${this.userId} joined chat ${chatId}`)
  }

  // Leave a chat room
  leaveChat(chatId) {
    if (this.rooms.has(chatId)) {
      this.rooms.get(chatId).delete(this.userId)
      if (this.rooms.get(chatId).size === 0) {
        this.rooms.delete(chatId)
      }
    }
    console.log(`User ${this.userId} left chat ${chatId}`)
  }

  // Send a message (simulate received message from another user)
  sendMessage(chatId, message) {
    // In a real scenario, this would send to server
    // For demo, we'll simulate receiving a response from another user
    setTimeout(() => {
      this.simulateIncomingMessage(chatId, message)
    }, 2000 + Math.random() * 3000) // Random delay 2-5 seconds
  }

  // Simulate incoming message from another user
  simulateIncomingMessage(chatId, originalMessage) {
    // Don't respond to file messages or if no one is listening
    if (originalMessage.type !== 'text' || !this.rooms.has(chatId)) {
      return
    }

    const responses = [
      "That's interesting! Tell me more.",
      "I see what you mean.",
      "Thanks for sharing that!",
      "How did that work out?",
      "I have a similar experience.",
      "That sounds great!",
      "I agree with that.",
      "What do you think about it?",
      "That's a good point.",
      "I'll keep that in mind."
    ]

    // Generate contextual responses based on message content
    let response = this.generateContextualResponse(originalMessage.content)
    if (!response) {
      response = responses[Math.floor(Math.random() * responses.length)]
    }

    const incomingMessage = {
      id: `demo-${Date.now()}`,
      chatId: chatId,
      content: response,
      senderId: chatId === '1' ? 'demo-user-1' : 'demo-user-2',
      senderName: chatId === '1' ? 'John Doe' : 'Jane Smith',
      senderAvatar: `https://images.unsplash.com/photo-${chatId === '1' ? '1472099645785-5658abf4ff4e' : '1494790108755-2616c2b9a6fe'}?w=256&h=256&fit=face`,
      timestamp: new Date().toISOString(),
      type: 'text',
      status: 'sent'
    }

    // Emit the incoming message
    this.emit('new-message', incomingMessage)
  }

  // Generate contextual responses
  generateContextualResponse(content) {
    const lowerContent = content.toLowerCase()

    if (lowerContent.includes('hello') || lowerContent.includes('hi')) {
      return "Hello! Great to hear from you! 👋"
    }

    if (lowerContent.includes('how are you')) {
      return "I'm doing well, thanks for asking! How about you?"
    }

    if (lowerContent.includes('good morning')) {
      return "Good morning! Hope you're having a great day!"
    }

    if (lowerContent.includes('thank')) {
      return "You're very welcome! Happy to help."
    }

    if (lowerContent.includes('project') || lowerContent.includes('work')) {
      return "That sounds like an exciting project! What's the most challenging part?"
    }

    if (lowerContent.includes('ai') || lowerContent.includes('artificial intelligence')) {
      return "AI is fascinating! It's amazing how it's transforming everything."
    }

    if (lowerContent.includes('react') || lowerContent.includes('javascript')) {
      return "Nice! React is such a powerful framework. Are you working on something specific?"
    }

    if (lowerContent.includes('supabase') || lowerContent.includes('database')) {
      return "Supabase is awesome for real-time features! Great choice for this app."
    }

    if (lowerContent.includes('weather')) {
      return "It's been pretty nice lately! Perfect weather for coding 😄"
    }

    if (lowerContent.includes('?')) {
      return "That's a great question! Let me think about that..."
    }

    return null // No contextual response, use random
  }

  // Send typing indicator
  setTyping(chatId, isTyping) {
    // Simulate typing indicator from other users
    if (isTyping && Math.random() > 0.7) { // 30% chance of triggering counter-typing
      setTimeout(() => {
        this.emit('user-typing', {
          userId: chatId === '1' ? 'demo-user-1' : 'demo-user-2',
          chatId: chatId,
          isTyping: true
        })

        // Stop typing after a while
        setTimeout(() => {
          this.emit('user-typing', {
            userId: chatId === '1' ? 'demo-user-1' : 'demo-user-2',
            chatId: chatId,
            isTyping: false
          })
        }, 2000 + Math.random() * 3000)
      }, 500 + Math.random() * 1500)
    }
  }

  // Mark message as read
  markAsRead(messageId, chatId) {
    // Simulate read receipt
    setTimeout(() => {
      this.emit('message-read', {
        messageId,
        chatId,
        userId: this.userId,
        timestamp: new Date().toISOString()
      })
    }, 100)
  }

  // Get online users (demo data)
  getOnlineUsers() {
    return [
      'demo-user-1',
      'demo-user-2',
      this.userId
    ].filter(Boolean)
  }

  // Simulate connection status
  get connected() {
    return this.isConnected
  }

  // Simulate random events for demo purposes
  startRandomEvents() {
    if (!this.isConnected) return

    // Simulate random user status changes
    setInterval(() => {
      if (Math.random() > 0.8) { // 20% chance every 10 seconds
        this.emit('user-status-change', {
          userId: Math.random() > 0.5 ? 'demo-user-1' : 'demo-user-2',
          status: Math.random() > 0.5 ? 'online' : 'away',
          timestamp: new Date().toISOString()
        })
      }
    }, 10000)

    // Simulate random chat updates
    setInterval(() => {
      if (Math.random() > 0.9) { // 10% chance every 30 seconds
        this.emit('chat-update', {
          chatId: Math.random() > 0.5 ? '1' : '2',
          type: 'member_joined',
          data: {
            userId: 'demo-user-3',
            userName: 'Alice Johnson'
          },
          timestamp: new Date().toISOString()
        })
      }
    }, 30000)
  }
}

// Create singleton instance
export const webSocketDemo = new WebSocketDemo()

// Export demo check function
export const isWebSocketDemo = () => {
  const wsUrl = import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:3001'
  return wsUrl.includes('localhost') || wsUrl.includes('demo')
}

export default WebSocketDemo
