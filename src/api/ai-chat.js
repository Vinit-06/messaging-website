// AI Chat API endpoint for intelligent chat assistance
import { supabase } from '../lib/supabase'

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY
const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY

// OpenAI Chat Completion
export const openAIChat = async (messages, options = {}) => {
  if (!OPENAI_API_KEY || OPENAI_API_KEY.includes('your-')) {
    return mockAIResponse(messages[messages.length - 1]?.content || '')
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: options.model || 'gpt-3.5-turbo',
        messages: messages.map(msg => ({
          role: msg.role || 'user',
          content: msg.content
        })),
        max_tokens: options.maxTokens || 150,
        temperature: options.temperature || 0.7,
        stream: options.stream || false
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      content: data.choices[0]?.message?.content || 'Sorry, I couldn\'t generate a response.',
      usage: data.usage,
      model: data.model
    }
  } catch (error) {
    console.error('OpenAI API Error:', error)
    return mockAIResponse(messages[messages.length - 1]?.content || '')
  }
}

// Anthropic Claude Chat
export const anthropicChat = async (messages, options = {}) => {
  if (!ANTHROPIC_API_KEY || ANTHROPIC_API_KEY.includes('your-')) {
    return mockAIResponse(messages[messages.length - 1]?.content || '')
  }

  try {
    // Convert messages to Anthropic format
    const prompt = messages.map(msg => {
      const role = msg.role === 'assistant' ? 'Assistant' : 'Human'
      return `${role}: ${msg.content}`
    }).join('\n\n') + '\n\nAssistant:'

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: options.model || 'claude-3-sonnet-20240229',
        max_tokens: options.maxTokens || 150,
        messages: messages.map(msg => ({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content
        }))
      })
    })

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      content: data.content[0]?.text || 'Sorry, I couldn\'t generate a response.',
      usage: data.usage,
      model: data.model
    }
  } catch (error) {
    console.error('Anthropic API Error:', error)
    return mockAIResponse(messages[messages.length - 1]?.content || '')
  }
}

// Mock AI response for demo/development
const mockAIResponse = (userMessage) => {
  const responses = [
    "That's an interesting point! Let me think about that...",
    "I understand what you're saying. Here's my perspective:",
    "Great question! Based on what you've shared:",
    "I can help you with that. Here's what I suggest:",
    "That's a complex topic. Let me break it down:",
    "I see where you're coming from. Consider this:",
    "Thanks for sharing that. My thoughts are:",
    "Good insight! To add to that point:"
  ]
  
  const randomResponse = responses[Math.floor(Math.random() * responses.length)]
  const contextualResponse = generateContextualResponse(userMessage)
  
  return {
    content: `${randomResponse} ${contextualResponse}`,
    usage: { prompt_tokens: 10, completion_tokens: 25, total_tokens: 35 },
    model: 'demo-ai-assistant'
  }
}

const generateContextualResponse = (userMessage) => {
  const message = userMessage.toLowerCase()
  
  if (message.includes('hello') || message.includes('hi')) {
    return "Hello! How can I assist you today? I'm here to help with any questions or conversations you'd like to have."
  }
  
  if (message.includes('help')) {
    return "I'm here to help! I can assist with various topics, provide information, help solve problems, or just have a friendly conversation."
  }
  
  if (message.includes('weather')) {
    return "I don't have access to real-time weather data, but I'd recommend checking a reliable weather service for current conditions in your area."
  }
  
  if (message.includes('code') || message.includes('programming')) {
    return "I can help with coding questions! Whether it's debugging, explaining concepts, or writing code snippets, feel free to ask."
  }
  
  if (message.includes('translate')) {
    return "I can help with translations between many languages. Just let me know what you'd like translated and to which language."
  }
  
  return "That's a thoughtful message. I appreciate you sharing that with me. Is there anything specific you'd like to explore further?"
}

// AI Chat Assistant for the app
export const getAIChatResponse = async (chatHistory, userMessage, provider = 'openai') => {
  const messages = [
    {
      role: 'system',
      content: 'You are a helpful AI assistant in a chat application. Be friendly, concise, and helpful. Keep responses conversational and under 150 words unless asked for detailed explanations.'
    },
    ...chatHistory.map(msg => ({
      role: msg.isAI ? 'assistant' : 'user',
      content: msg.content
    })),
    {
      role: 'user',
      content: userMessage
    }
  ]

  let response
  if (provider === 'anthropic') {
    response = await anthropicChat(messages)
  } else {
    response = await openAIChat(messages)
  }

  // Store AI conversation in database
  try {
    const { data: user } = await supabase.auth.getUser()
    if (user?.user) {
      await supabase.from('ai_conversations').insert({
        user_id: user.user.id,
        messages: messages,
        response: response.content,
        provider: provider,
        usage: response.usage
      })
    }
  } catch (error) {
    console.warn('Failed to store AI conversation:', error)
  }

  return response
}

// Smart reply suggestions
export const getSmartReplySuggestions = async (messageHistory, provider = 'openai') => {
  const recentMessages = messageHistory.slice(-5) // Last 5 messages for context
  
  const prompt = {
    role: 'user',
    content: `Based on this conversation context, suggest 3 short, appropriate reply options (each under 10 words):
    
Context: ${recentMessages.map(msg => `${msg.sender}: ${msg.content}`).join('\n')}

Provide 3 different reply suggestions that are:
1. Casual and friendly
2. Asking a follow-up question
3. Showing agreement or acknowledgment

Format as JSON: ["reply1", "reply2", "reply3"]`
  }

  try {
    const response = provider === 'anthropic' 
      ? await anthropicChat([prompt], { maxTokens: 100 })
      : await openAIChat([prompt], { maxTokens: 100 })
    
    // Parse JSON response
    const suggestions = JSON.parse(response.content)
    return suggestions.slice(0, 3) // Ensure only 3 suggestions
  } catch (error) {
    console.warn('Failed to generate smart replies:', error)
    return [
      "That's interesting!",
      "Tell me more",
      "I agree with that"
    ]
  }
}

// Conversation summarization
export const summarizeConversation = async (messages, provider = 'openai') => {
  if (messages.length < 10) {
    return "Conversation is too short to summarize."
  }

  const prompt = {
    role: 'user',
    content: `Please provide a concise summary of this conversation (2-3 sentences):

${messages.map(msg => `${msg.sender}: ${msg.content}`).join('\n')}

Summary:`
  }

  try {
    const response = provider === 'anthropic' 
      ? await anthropicChat([prompt], { maxTokens: 100 })
      : await openAIChat([prompt], { maxTokens: 100 })
    
    return response.content
  } catch (error) {
    console.warn('Failed to summarize conversation:', error)
    return "Unable to generate summary at this time."
  }
}

export default {
  openAIChat,
  anthropicChat,
  getAIChatResponse,
  getSmartReplySuggestions,
  summarizeConversation
}
