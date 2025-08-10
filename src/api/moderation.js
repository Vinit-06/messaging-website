// AI-powered content moderation for chat safety
import { openAIChat, anthropicChat } from './ai-chat'
import { supabase } from '../lib/supabase'

// OpenAI Moderation API
export const openAIModeration = async (text) => {
  const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY
  
  if (!OPENAI_API_KEY || OPENAI_API_KEY.includes('your-')) {
    return aiModeration(text)
  }

  try {
    const response = await fetch('https://api.openai.com/v1/moderations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        input: text
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI Moderation API error: ${response.statusText}`)
    }

    const data = await response.json()
    const result = data.results[0]
    
    return {
      flagged: result.flagged,
      categories: result.categories,
      categoryScores: result.category_scores,
      provider: 'openai',
      confidence: Math.max(...Object.values(result.category_scores))
    }
  } catch (error) {
    console.warn('OpenAI Moderation failed, using AI fallback:', error)
    return aiModeration(text)
  }
}

// AI-powered moderation using chat models
export const aiModeration = async (text, provider = 'openai') => {
  const prompt = {
    role: 'user',
    content: `Analyze this message for inappropriate content. Check for:
1. Hate speech or harassment
2. Sexual content
3. Violence or threats
4. Spam or excessive repetition
5. Personal information sharing
6. Profanity or offensive language

Message: "${text}"

Respond in JSON format:
{
  "flagged": true/false,
  "severity": "low/medium/high",
  "categories": ["category1", "category2"],
  "reason": "brief explanation",
  "confidence": 0.0-1.0
}

Only flag content that clearly violates community guidelines.`
  }

  try {
    const response = provider === 'anthropic' 
      ? await anthropicChat([prompt], { maxTokens: 200 })
      : await openAIChat([prompt], { maxTokens: 200 })
    
    const analysis = JSON.parse(response.content)
    return {
      flagged: analysis.flagged || false,
      severity: analysis.severity || 'low',
      categories: analysis.categories || [],
      reason: analysis.reason || '',
      confidence: analysis.confidence || 0.5,
      provider: provider
    }
  } catch (error) {
    console.warn('AI Moderation parsing failed:', error)
    return mockModeration(text)
  }
}

// Mock moderation for demo mode
const mockModeration = (text) => {
  const lowercaseText = text.toLowerCase()
  
  // Simple keyword-based flagging for demo
  const flaggedKeywords = [
    'spam', 'hate', 'threat', 'violence', 'inappropriate',
    'harassment', 'abuse', 'offensive', 'dangerous'
  ]
  
  const containsFlagged = flaggedKeywords.some(keyword => 
    lowercaseText.includes(keyword)
  )
  
  return {
    flagged: containsFlagged,
    severity: containsFlagged ? 'medium' : 'low',
    categories: containsFlagged ? ['inappropriate-content'] : [],
    reason: containsFlagged ? 'Contains potentially inappropriate content' : 'Content appears safe',
    confidence: containsFlagged ? 0.8 : 0.9,
    provider: 'demo'
  }
}

// Sentiment analysis for messages
export const analyzeSentiment = async (text, provider = 'openai') => {
  const prompt = {
    role: 'user',
    content: `Analyze the sentiment of this message and respond in JSON format:

Message: "${text}"

{
  "sentiment": "positive/negative/neutral",
  "score": -1.0 to 1.0,
  "emotions": ["emotion1", "emotion2"],
  "confidence": 0.0-1.0
}`
  }

  try {
    const response = provider === 'anthropic' 
      ? await anthropicChat([prompt], { maxTokens: 100 })
      : await openAIChat([prompt], { maxTokens: 100 })
    
    const analysis = JSON.parse(response.content)
    return {
      sentiment: analysis.sentiment || 'neutral',
      score: analysis.score || 0,
      emotions: analysis.emotions || [],
      confidence: analysis.confidence || 0.5,
      provider: provider
    }
  } catch (error) {
    console.warn('Sentiment analysis failed:', error)
    return {
      sentiment: 'neutral',
      score: 0,
      emotions: [],
      confidence: 0.5,
      provider: 'fallback'
    }
  }
}

// Spam detection
export const detectSpam = async (text, userHistory = [], provider = 'openai') => {
  // Quick spam indicators
  const spamIndicators = {
    repetitiveChars: /(.)\1{5,}/.test(text),
    excessiveCaps: (text.match(/[A-Z]/g) || []).length / text.length > 0.5,
    manyUrls: (text.match(/https?:\/\/[^\s]+/g) || []).length > 2,
    repetitiveMessage: userHistory.some(msg => 
      msg.content === text && Date.now() - new Date(msg.timestamp).getTime() < 60000
    )
  }

  const spamScore = Object.values(spamIndicators).filter(Boolean).length / 4

  if (spamScore > 0.3) {
    return {
      isSpam: true,
      score: spamScore,
      indicators: Object.entries(spamIndicators).filter(([_, value]) => value).map(([key]) => key),
      provider: 'heuristic'
    }
  }

  // AI-based spam detection for complex cases
  const prompt = {
    role: 'user',
    content: `Analyze if this message is spam. Consider promotional content, repetitive messages, or irrelevant content:

Message: "${text}"
${userHistory.length ? `Recent messages from user: ${userHistory.slice(-3).map(m => m.content).join(', ')}` : ''}

Respond in JSON:
{
  "isSpam": true/false,
  "score": 0.0-1.0,
  "reason": "explanation"
}`
  }

  try {
    const response = provider === 'anthropic' 
      ? await anthropicChat([prompt], { maxTokens: 100 })
      : await openAIChat([prompt], { maxTokens: 100 })
    
    const analysis = JSON.parse(response.content)
    return {
      isSpam: analysis.isSpam || false,
      score: Math.max(spamScore, analysis.score || 0),
      reason: analysis.reason || 'AI analysis',
      provider: provider
    }
  } catch (error) {
    console.warn('AI spam detection failed:', error)
    return {
      isSpam: spamScore > 0.5,
      score: spamScore,
      reason: 'Heuristic analysis only',
      provider: 'fallback'
    }
  }
}

// Content safety check (comprehensive)
export const checkContentSafety = async (text, userContext = {}, provider = 'openai') => {
  try {
    const [moderation, sentiment, spam] = await Promise.all([
      provider === 'openai' ? openAIModeration(text) : aiModeration(text, provider),
      analyzeSentiment(text, provider),
      detectSpam(text, userContext.messageHistory || [], provider)
    ])

    const overallRisk = calculateRiskScore(moderation, sentiment, spam)
    
    const result = {
      safe: !moderation.flagged && !spam.isSpam && overallRisk < 0.7,
      riskScore: overallRisk,
      moderation,
      sentiment,
      spam,
      recommendations: generateRecommendations(moderation, sentiment, spam)
    }

    // Log to database for analytics
    await logModerationResult(text, result, userContext.userId)
    
    return result
  } catch (error) {
    console.error('Content safety check failed:', error)
    return {
      safe: true, // Default to safe if checks fail
      riskScore: 0,
      error: error.message
    }
  }
}

// Calculate overall risk score
const calculateRiskScore = (moderation, sentiment, spam) => {
  let score = 0
  
  if (moderation.flagged) {
    score += moderation.confidence * 0.6
  }
  
  if (spam.isSpam) {
    score += spam.score * 0.3
  }
  
  if (sentiment.sentiment === 'negative' && sentiment.score < -0.5) {
    score += Math.abs(sentiment.score) * 0.1
  }
  
  return Math.min(score, 1.0)
}

// Generate moderation recommendations
const generateRecommendations = (moderation, sentiment, spam) => {
  const recommendations = []
  
  if (moderation.flagged) {
    recommendations.push({
      action: 'flag_message',
      severity: moderation.severity || 'medium',
      reason: moderation.reason || 'Inappropriate content detected'
    })
  }
  
  if (spam.isSpam) {
    recommendations.push({
      action: 'mark_spam',
      severity: 'low',
      reason: 'Message appears to be spam'
    })
  }
  
  if (sentiment.sentiment === 'negative' && sentiment.score < -0.8) {
    recommendations.push({
      action: 'review_tone',
      severity: 'low',
      reason: 'Very negative sentiment detected'
    })
  }
  
  return recommendations
}

// Log moderation results for analytics
const logModerationResult = async (text, result, userId) => {
  try {
    await supabase.from('moderation_logs').insert({
      user_id: userId,
      content_hash: btoa(text).slice(0, 32), // Hash for privacy
      risk_score: result.riskScore,
      flagged: !result.safe,
      provider: result.moderation?.provider || 'unknown',
      categories: result.moderation?.categories || [],
      created_at: new Date().toISOString()
    })
  } catch (error) {
    console.warn('Failed to log moderation result:', error)
  }
}

// Auto-moderate message
export const autoModerateMessage = async (messageData, userContext = {}) => {
  const safetyCheck = await checkContentSafety(messageData.content, userContext)
  
  if (!safetyCheck.safe) {
    // Take action based on risk score
    if (safetyCheck.riskScore > 0.8) {
      return {
        action: 'block',
        message: 'Message blocked due to policy violation',
        details: safetyCheck
      }
    } else if (safetyCheck.riskScore > 0.5) {
      return {
        action: 'flag',
        message: 'Message flagged for review',
        details: safetyCheck
      }
    } else {
      return {
        action: 'warn',
        message: 'Please keep messages appropriate',
        details: safetyCheck
      }
    }
  }
  
  return {
    action: 'approve',
    message: 'Message approved',
    details: safetyCheck
  }
}

export default {
  openAIModeration,
  aiModeration,
  analyzeSentiment,
  detectSpam,
  checkContentSafety,
  autoModerateMessage
}
