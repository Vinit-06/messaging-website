// AI Translation API for multi-language chat support
import { openAIChat, anthropicChat } from './ai-chat'

const GOOGLE_TRANSLATE_API_KEY = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY

// Supported languages
export const SUPPORTED_LANGUAGES = {
  'en': 'English',
  'es': 'Spanish',
  'fr': 'French',
  'de': 'German',
  'it': 'Italian',
  'pt': 'Portuguese',
  'ru': 'Russian',
  'ja': 'Japanese',
  'ko': 'Korean',
  'zh': 'Chinese (Simplified)',
  'ar': 'Arabic',
  'hi': 'Hindi',
  'nl': 'Dutch',
  'sv': 'Swedish',
  'no': 'Norwegian',
  'da': 'Danish',
  'fi': 'Finnish',
  'pl': 'Polish',
  'tr': 'Turkish',
  'th': 'Thai'
}

// Google Translate API
export const googleTranslate = async (text, targetLanguage, sourceLanguage = 'auto') => {
  if (!GOOGLE_TRANSLATE_API_KEY || GOOGLE_TRANSLATE_API_KEY.includes('your-')) {
    return aiTranslate(text, targetLanguage, sourceLanguage)
  }

  try {
    const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_TRANSLATE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: text,
        target: targetLanguage,
        source: sourceLanguage === 'auto' ? undefined : sourceLanguage,
        format: 'text'
      })
    })

    if (!response.ok) {
      throw new Error(`Google Translate API error: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      translatedText: data.data.translations[0].translatedText,
      detectedSourceLanguage: data.data.translations[0].detectedSourceLanguage,
      confidence: 1.0,
      provider: 'google'
    }
  } catch (error) {
    console.warn('Google Translate failed, falling back to AI:', error)
    return aiTranslate(text, targetLanguage, sourceLanguage)
  }
}

// AI-powered translation using OpenAI/Anthropic
export const aiTranslate = async (text, targetLanguage, sourceLanguage = 'auto', provider = 'openai') => {
  const targetLangName = SUPPORTED_LANGUAGES[targetLanguage] || targetLanguage
  const sourceLangName = sourceLanguage === 'auto' 
    ? 'the detected language' 
    : SUPPORTED_LANGUAGES[sourceLanguage] || sourceLanguage

  const prompt = {
    role: 'user',
    content: sourceLanguage === 'auto' 
      ? `Translate the following text to ${targetLangName}. Respond with only the translation:

"${text}"`
      : `Translate the following text from ${sourceLangName} to ${targetLangName}. Respond with only the translation:

"${text}"`
  }

  try {
    const response = provider === 'anthropic' 
      ? await anthropicChat([prompt], { maxTokens: 200 })
      : await openAIChat([prompt], { maxTokens: 200 })
    
    return {
      translatedText: response.content.replace(/^"|"$/g, ''), // Remove quotes if present
      detectedSourceLanguage: sourceLanguage,
      confidence: 0.9,
      provider: provider
    }
  } catch (error) {
    console.error('AI Translation failed:', error)
    return mockTranslation(text, targetLanguage)
  }
}

// Mock translation for demo mode
const mockTranslation = (text, targetLanguage) => {
  const mockTranslations = {
    'es': 'Hola, esta es una traducción de demostración.',
    'fr': 'Bonjour, ceci est une traduction de démonstration.',
    'de': 'Hallo, das ist eine Demo-Übersetzung.',
    'it': 'Ciao, questa è una traduzione dimostrativa.',
    'pt': 'Olá, esta é uma tradução de demonstração.',
    'ru': 'Привет, это демонстрационный перевод.',
    'ja': 'こんにちは、これは��モ翻訳です。',
    'ko': '안녕하세요, 이것은 데모 번역입니다.',
    'zh': '你好，这是一个演示翻译。',
    'ar': 'مرحبا، هذه ترجمة تجريبية.'
  }

  return {
    translatedText: mockTranslations[targetLanguage] || `[${targetLanguage.toUpperCase()}] ${text}`,
    detectedSourceLanguage: 'en',
    confidence: 0.8,
    provider: 'demo'
  }
}

// Language detection
export const detectLanguage = async (text, provider = 'openai') => {
  const prompt = {
    role: 'user',
    content: `Detect the language of this text and respond with only the ISO 639-1 language code (like "en", "es", "fr", etc.):

"${text}"`
  }

  try {
    const response = provider === 'anthropic' 
      ? await anthropicChat([prompt], { maxTokens: 10 })
      : await openAIChat([prompt], { maxTokens: 10 })
    
    const detectedCode = response.content.trim().toLowerCase()
    return SUPPORTED_LANGUAGES[detectedCode] ? detectedCode : 'en'
  } catch (error) {
    console.warn('Language detection failed:', error)
    return 'en' // Default to English
  }
}

// Batch translation for multiple messages
export const batchTranslate = async (messages, targetLanguage, provider = 'google') => {
  const translations = []
  
  for (const message of messages) {
    try {
      const result = provider === 'google' 
        ? await googleTranslate(message.content, targetLanguage)
        : await aiTranslate(message.content, targetLanguage, 'auto', provider)
      
      translations.push({
        ...message,
        translatedContent: result.translatedText,
        originalContent: message.content,
        translationProvider: result.provider
      })
    } catch (error) {
      console.warn(`Failed to translate message ${message.id}:`, error)
      translations.push({
        ...message,
        translatedContent: message.content, // Keep original if translation fails
        originalContent: message.content,
        translationProvider: 'none'
      })
    }
  }
  
  return translations
}

// Smart translation with context awareness
export const contextualTranslate = async (text, targetLanguage, conversationContext = [], provider = 'openai') => {
  if (!conversationContext.length) {
    return aiTranslate(text, targetLanguage, 'auto', provider)
  }

  const contextualPrompt = {
    role: 'user',
    content: `Given this conversation context, translate the following message to ${SUPPORTED_LANGUAGES[targetLanguage]} while maintaining the conversational tone and context:

Previous messages for context:
${conversationContext.slice(-3).map(msg => `- ${msg.content}`).join('\n')}

Message to translate: "${text}"

Respond with only the translation:`
  }

  try {
    const response = provider === 'anthropic' 
      ? await anthropicChat([contextualPrompt], { maxTokens: 200 })
      : await openAIChat([contextualPrompt], { maxTokens: 200 })
    
    return {
      translatedText: response.content.replace(/^"|"$/g, ''),
      detectedSourceLanguage: 'auto',
      confidence: 0.95,
      provider: `${provider}-contextual`
    }
  } catch (error) {
    console.warn('Contextual translation failed, using standard translation:', error)
    return aiTranslate(text, targetLanguage, 'auto', provider)
  }
}

// Translation quality assessment
export const assessTranslationQuality = async (originalText, translatedText, provider = 'openai') => {
  const prompt = {
    role: 'user',
    content: `Assess the quality of this translation on a scale of 1-10 (10 being perfect). Respond with only the number:

Original: "${originalText}"
Translation: "${translatedText}"`
  }

  try {
    const response = provider === 'anthropic' 
      ? await anthropicChat([prompt], { maxTokens: 5 })
      : await openAIChat([prompt], { maxTokens: 5 })
    
    const score = parseInt(response.content.trim())
    return isNaN(score) ? 7 : Math.max(1, Math.min(10, score)) // Clamp between 1-10
  } catch (error) {
    console.warn('Translation quality assessment failed:', error)
    return 7 // Default score
  }
}

export default {
  googleTranslate,
  aiTranslate,
  detectLanguage,
  batchTranslate,
  contextualTranslate,
  assessTranslationQuality,
  SUPPORTED_LANGUAGES
}
