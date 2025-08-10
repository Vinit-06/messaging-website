import { useState, useCallback } from 'react'

// Mock implementation of useChat hook for development
// Replace with actual ai/react import when API is configured
export const useChat = ({ api, initialMessages = [] }) => {
  const [messages, setMessages] = useState(initialMessages)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleInputChange = useCallback((e) => {
    setInput(e.target.value)
  }, [])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setError(null)

    try {
      // Simulate AI response delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
      
      // Mock AI responses
      const responses = [
        "I understand your question. Let me help you with that.",
        "That's an interesting point. Here's what I think about it...",
        "I can assist you with that. Would you like me to provide more details?",
        "Based on what you've asked, I'd recommend the following approach...",
        "I'm here to help! Let me break this down for you."
      ]
      
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)]
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (err) {
      setError(err)
    } finally {
      setIsLoading(false)
    }
  }, [input, isLoading, api])

  const reload = useCallback(() => {
    setError(null)
  }, [])

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    reload
  }
}
