// Comprehensive AI Backend Configuration and Management
import aiChat from './ai-chat'
import translation from './translation'
import moderation from './moderation'
import codingAssistant from './coding-assistant'

// AI Backend Configuration
export const AI_CONFIG = {
  providers: {
    openai: {
      name: 'OpenAI',
      models: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'],
      features: ['chat', 'translation', 'moderation', 'coding'],
      enabled: !!import.meta.env.VITE_OPENAI_API_KEY
    },
    anthropic: {
      name: 'Anthropic',
      models: ['claude-3-sonnet-20240229', 'claude-3-opus-20240229', 'claude-3-haiku-20240307'],
      features: ['chat', 'translation', 'coding'],
      enabled: !!import.meta.env.VITE_ANTHROPIC_API_KEY
    },
    google: {
      name: 'Google',
      models: ['gemini-pro'],
      features: ['translation'],
      enabled: !!import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY
    }
  },
  features: {
    chat_assistance: true,
    smart_replies: true,
    translation: true,
    moderation: true,
    sentiment_analysis: true,
    spam_detection: true,
    code_analysis: true,
    code_generation: true,
    code_debugging: true
  },
  limits: {
    requests_per_minute: 60,
    requests_per_hour: 1000,
    max_message_length: 4000,
    max_code_length: 10000
  }
}

// Rate limiting
const rateLimiter = new Map()

const checkRateLimit = (userId, limit = 60) => {
  const now = Date.now()
  const windowStart = now - 60000 // 1 minute window
  
  if (!rateLimiter.has(userId)) {
    rateLimiter.set(userId, [])
  }
  
  const userRequests = rateLimiter.get(userId)
  const recentRequests = userRequests.filter(time => time > windowStart)
  
  if (recentRequests.length >= limit) {
    return false
  }
  
  recentRequests.push(now)
  rateLimiter.set(userId, recentRequests)
  return true
}

// Main AI Backend API
export class AIBackend {
  constructor(defaultProvider = 'openai') {
    this.defaultProvider = defaultProvider
    this.features = AI_CONFIG.features
  }

  // Check if a feature is available
  isFeatureAvailable(feature, provider = this.defaultProvider) {
    return (
      this.features[feature] && 
      AI_CONFIG.providers[provider]?.enabled &&
      AI_CONFIG.providers[provider]?.features.includes(feature.split('_')[0])
    )
  }

  // Get available providers for a feature
  getAvailableProviders(feature) {
    return Object.entries(AI_CONFIG.providers)
      .filter(([_, config]) => 
        config.enabled && config.features.includes(feature.split('_')[0])
      )
      .map(([provider, config]) => ({
        provider,
        name: config.name,
        models: config.models
      }))
  }

  // Chat assistance
  async chatAssistance(messages, userId, options = {}) {
    if (!checkRateLimit(userId)) {
      throw new Error('Rate limit exceeded. Please wait before making another request.')
    }

    if (!this.isFeatureAvailable('chat_assistance', options.provider)) {
      throw new Error('Chat assistance is not available with the current configuration.')
    }

    return aiChat.getAIChatResponse(
      messages, 
      messages[messages.length - 1]?.content || '',
      options.provider || this.defaultProvider
    )
  }

  // Smart reply suggestions
  async smartReplies(messageHistory, userId, options = {}) {
    if (!checkRateLimit(userId, 30)) { // Lower limit for suggestions
      throw new Error('Rate limit exceeded for smart replies.')
    }

    if (!this.isFeatureAvailable('smart_replies', options.provider)) {
      return ['Thanks!', 'Got it', 'Sounds good'] // Fallback replies
    }

    return aiChat.getSmartReplySuggestions(
      messageHistory,
      options.provider || this.defaultProvider
    )
  }

  // Translation services
  async translate(text, targetLanguage, userId, options = {}) {
    if (!checkRateLimit(userId, 100)) { // Higher limit for translation
      throw new Error('Translation rate limit exceeded.')
    }

    if (!this.isFeatureAvailable('translation', options.provider)) {
      throw new Error('Translation is not available.')
    }

    // Prefer Google Translate if available, fallback to AI
    if (AI_CONFIG.providers.google.enabled && !options.provider) {
      return translation.googleTranslate(text, targetLanguage, options.sourceLanguage)
    }

    return translation.aiTranslate(
      text, 
      targetLanguage, 
      options.sourceLanguage || 'auto',
      options.provider || this.defaultProvider
    )
  }

  // Content moderation
  async moderateContent(text, userId, options = {}) {
    if (!checkRateLimit(userId, 200)) { // High limit for moderation
      throw new Error('Moderation rate limit exceeded.')
    }

    if (!this.isFeatureAvailable('moderation')) {
      return { safe: true, riskScore: 0, provider: 'disabled' }
    }

    return moderation.checkContentSafety(text, {
      userId,
      ...options.userContext
    }, options.provider || this.defaultProvider)
  }

  // Auto-moderate messages
  async autoModerate(messageData, userId, options = {}) {
    if (!this.isFeatureAvailable('moderation')) {
      return { action: 'approve', message: 'Moderation disabled' }
    }

    return moderation.autoModerateMessage(messageData, {
      userId,
      ...options.userContext
    })
  }

  // Sentiment analysis
  async analyzeSentiment(text, userId, options = {}) {
    if (!checkRateLimit(userId, 50)) {
      throw new Error('Sentiment analysis rate limit exceeded.')
    }

    if (!this.isFeatureAvailable('sentiment_analysis')) {
      return { sentiment: 'neutral', score: 0, provider: 'disabled' }
    }

    return moderation.analyzeSentiment(text, options.provider || this.defaultProvider)
  }

  // Code assistance
  async codeAssistance(query, userId, options = {}) {
    if (!checkRateLimit(userId, 20)) { // Lower limit for coding assistance
      throw new Error('Code assistance rate limit exceeded.')
    }

    if (!this.isFeatureAvailable('code_analysis')) {
      throw new Error('Code assistance is not available.')
    }

    return codingAssistant.codeAssistant(
      query,
      options.context || {},
      options.provider || this.defaultProvider
    )
  }

  // Batch operations
  async batchTranslate(messages, targetLanguage, userId, options = {}) {
    if (!checkRateLimit(userId, 10)) { // Very low limit for batch operations
      throw new Error('Batch translation rate limit exceeded.')
    }

    return translation.batchTranslate(
      messages,
      targetLanguage,
      options.provider || 'google'
    )
  }

  // Health check
  async healthCheck() {
    const providers = {}
    
    for (const [provider, config] of Object.entries(AI_CONFIG.providers)) {
      providers[provider] = {
        enabled: config.enabled,
        features: config.features,
        status: config.enabled ? 'available' : 'disabled'
      }
    }

    return {
      status: 'healthy',
      providers,
      features: this.features,
      limits: AI_CONFIG.limits,
      timestamp: new Date().toISOString()
    }
  }

  // Get usage statistics
  getUsageStats(userId) {
    const userRequests = rateLimiter.get(userId) || []
    const now = Date.now()
    const lastHour = userRequests.filter(time => time > now - 3600000).length
    const lastMinute = userRequests.filter(time => time > now - 60000).length

    return {
      requests_last_minute: lastMinute,
      requests_last_hour: lastHour,
      limit_minute: AI_CONFIG.limits.requests_per_minute,
      limit_hour: AI_CONFIG.limits.requests_per_hour,
      remaining_minute: Math.max(0, AI_CONFIG.limits.requests_per_minute - lastMinute),
      remaining_hour: Math.max(0, AI_CONFIG.limits.requests_per_hour - lastHour)
    }
  }
}

// Create singleton instance
export const aiBackend = new AIBackend()

// Convenience functions
export const chatWithAI = (messages, userId, options) => 
  aiBackend.chatAssistance(messages, userId, options)

export const translateText = (text, targetLang, userId, options) =>
  aiBackend.translate(text, targetLang, userId, options)

export const moderateMessage = (text, userId, options) =>
  aiBackend.moderateContent(text, userId, options)

export const getCodeHelp = (query, userId, options) =>
  aiBackend.codeAssistance(query, userId, options)

export const getSentiment = (text, userId, options) =>
  aiBackend.analyzeSentiment(text, userId, options)

export const getSmartReplies = (history, userId, options) =>
  aiBackend.smartReplies(history, userId, options)

// Export individual modules for direct access
export {
  aiChat,
  translation,
  moderation,
  codingAssistant
}

export default aiBackend
