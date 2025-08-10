import { useState, useCallback } from 'react'
import { aiBackend } from '../api/ai-backend'
import { useAuth } from '../contexts/AuthContext'

// Enhanced useChat hook with AI backend integration
export const useChat = ({ api, initialMessages = [], provider, model, maxTokens, temperature } = {}) => {
  const [messages, setMessages] = useState(initialMessages)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const { user } = useAuth()

  const handleInputChange = useCallback((e) => {
    setInput(e.target.value)
  }, [])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      isAI: false,
      createdAt: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const currentInput = input
    setInput('')
    setIsLoading(true)
    setError(null)

    try {
      // Use AI backend for response
      const response = await aiBackend.chatAssistance(
        [...messages, userMessage], 
        user?.id || 'anonymous',
        {
          provider: provider || import.meta.env.VITE_AI_DEFAULT_PROVIDER || 'openai',
          model: model,
          maxTokens: maxTokens || 150,
          temperature: temperature || 0.7
        }
      )

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content,
        isAI: true,
        createdAt: new Date(),
        provider: response.provider || 'ai',
        usage: response.usage
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (err) {
      console.warn('AI response failed, using fallback:', err)
      setError(err)
      
      // Fallback to mock response
      const fallbackMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateFallbackResponse(currentInput, err.message),
        isAI: true,
        createdAt: new Date(),
        provider: 'fallback'
      }
      
      setMessages(prev => [...prev, fallbackMessage])
    } finally {
      setIsLoading(false)
    }
  }, [input, isLoading, messages, user, provider, model, maxTokens, temperature])

  const reload = useCallback(async () => {
    if (messages.length === 0) return
    
    setIsLoading(true)
    setError(null)
    
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')
    
    if (lastUserMessage) {
      try {
        const response = await aiBackend.chatAssistance(
          messages.filter(m => m.id !== messages[messages.length - 1].id),
          user?.id || 'anonymous',
          { provider, model, maxTokens, temperature }
        )

        const newMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: response.content,
          isAI: true,
          createdAt: new Date(),
          provider: response.provider || 'ai'
        }

        setMessages(prev => [...prev.slice(0, -1), newMessage])
      } catch (err) {
        console.warn('Reload failed:', err)
        setError(err)
      }
    }
    setIsLoading(false)
  }, [messages, user, provider, model, maxTokens, temperature])

  const append = useCallback((message) => {
    setMessages(prev => [...prev, message])
  }, [])

  const stop = useCallback(() => {
    setIsLoading(false)
  }, [])

  // Get smart reply suggestions
  const getSmartReplies = useCallback(async () => {
    try {
      return await aiBackend.smartReplies(messages, user?.id || 'anonymous', { provider })
    } catch (error) {
      console.warn('Smart replies failed:', error)
      return ['Thanks!', 'Got it', 'Sounds good']
    }
  }, [messages, user, provider])

  // Translate message
  const translateMessage = useCallback(async (messageId, targetLanguage) => {
    const message = messages.find(m => m.id === messageId)
    if (!message) return null

    try {
      const result = await aiBackend.translate(
        message.content, 
        targetLanguage, 
        user?.id || 'anonymous',
        { provider }
      )
      
      return {
        ...message,
        translatedContent: result.translatedText,
        originalContent: message.content,
        targetLanguage,
        translationProvider: result.provider
      }
    } catch (error) {
      console.warn('Translation failed:', error)
      return null
    }
  }, [messages, user, provider])

  // Summarize conversation
  const summarizeConversation = useCallback(async () => {
    try {
      const { summarizeConversation } = await import('../api/ai-chat')
      const chatHistory = messages.map(m => ({
        sender: m.role === 'user' ? (user?.email || 'User') : 'AI',
        content: m.content
      }))

      return await summarizeConversation(chatHistory, provider)
    } catch (error) {
      console.warn('Summarization failed:', error)
      return 'Unable to summarize conversation at this time.'
    }
  }, [messages, user, provider])

  // Get usage statistics
  const getUsageStats = useCallback(() => {
    return aiBackend.getUsageStats(user?.id || 'anonymous')
  }, [user])

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    reload,
    append,
    stop,
    getSmartReplies,
    translateMessage,
    summarizeConversation,
    getUsageStats
  }
}

const generateFallbackResponse = (userInput, errorMessage) => {
  const fallbackResponses = [
    "I apologize, but I'm having trouble processing that right now. Could you try rephrasing your question?",
    "I'm experiencing some technical difficulties. Please try again in a moment.",
    "Sorry, I couldn't generate a proper response. Is there another way I can help you?",
    "I'm not able to respond properly at the moment. Please check your connection and try again."
  ]

  const userLower = userInput.toLowerCase()
  
  if (userLower.includes('hello') || userLower.includes('hi')) {
    return "Hello! I'm having some technical issues right now, but I'm still here to help as best I can."
  }
  
  if (userLower.includes('help')) {
    return "I'd like to help, but I'm experiencing some difficulties connecting to my full capabilities. Please try again shortly."
  }

  if (errorMessage.includes('rate limit')) {
    return "I'm receiving a lot of requests right now. Please wait a moment before trying again."
  }
  
  if (errorMessage.includes('not available')) {
    return "AI features are currently not configured. Please check your API settings or contact an administrator."
  }

  return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]
}

export default useChat
