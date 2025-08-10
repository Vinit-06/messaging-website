# AI Backend Configuration Guide

## Overview

Your ChatApp now includes a comprehensive AI-powered backend with support for multiple AI providers and advanced features like content moderation, translation, and coding assistance.

## 🤖 Supported AI Providers

### 1. OpenAI (Recommended)
- **Models**: GPT-3.5 Turbo, GPT-4, GPT-4 Turbo
- **Features**: Chat assistance, translation, moderation, coding help
- **Setup**: Get API key from [OpenAI Platform](https://platform.openai.com/api-keys)

### 2. Anthropic Claude
- **Models**: Claude-3 Sonnet, Claude-3 Opus, Claude-3 Haiku
- **Features**: Chat assistance, translation, coding help
- **Setup**: Get API key from [Anthropic Console](https://console.anthropic.com/)

### 3. Google Services
- **Features**: Translation (Google Translate API)
- **Setup**: Get API key from [Google Cloud Console](https://console.cloud.google.com/apis/credentials)

## 🚀 Quick Setup

### Step 1: Get API Keys

1. **OpenAI** (Primary recommendation)
   ```bash
   # Visit https://platform.openai.com/api-keys
   # Create new secret key
   # Copy the key (starts with sk-)
   ```

2. **Anthropic** (Alternative/Secondary)
   ```bash
   # Visit https://console.anthropic.com/
   # Generate API key
   # Copy the key
   ```

3. **Google Translate** (Optional, for translation)
   ```bash
   # Visit https://console.cloud.google.com/apis/credentials
   # Enable Translation API
   # Create credentials
   ```

### Step 2: Configure Environment Variables

Update your `.env` file:

```env
# AI Configuration
VITE_OPENAI_API_KEY=sk-your-actual-openai-key-here
VITE_ANTHROPIC_API_KEY=your-anthropic-key-here
VITE_GOOGLE_TRANSLATE_API_KEY=your-google-translate-key-here

# AI Settings (Optional)
VITE_AI_DEFAULT_PROVIDER=openai
VITE_AI_RATE_LIMIT_PER_MINUTE=60
VITE_AI_RATE_LIMIT_PER_HOUR=1000
VITE_AI_MAX_MESSAGE_LENGTH=4000
```

### Step 3: Test Configuration

```bash
# Start your development server
npm run dev

# The AI status will show in your dashboard
# Green = Configured and working
# Yellow = Demo mode (no API keys)
```

## 🎯 Available AI Features

### 1. Chat Assistance
- **Smart AI responses** in conversations
- **Context-aware** conversations
- **Multiple provider support**

```javascript
// Usage in components
import { useChat } from '../hooks/useChat'

const { messages, input, handleSubmit, isLoading } = useChat({
  provider: 'openai', // or 'anthropic'
  model: 'gpt-3.5-turbo',
  maxTokens: 150
})
```

### 2. Smart Reply Suggestions
- **AI-generated** quick replies
- **Context-aware** suggestions
- **Reduces typing** for users

```javascript
// Get smart replies
const smartReplies = await getSmartReplies()
// Returns: ["That's interesting!", "Tell me more", "I agree"]
```

### 3. Real-time Translation
- **Multi-language support** (20+ languages)
- **Google Translate API** integration
- **AI fallback** translation
- **Context-aware** translations

```javascript
// Translate text
const result = await translateText("Hello world", "es", userId)
// Returns: { translatedText: "Hola mundo", provider: "google" }
```

### 4. Content Moderation
- **Automatic content filtering**
- **Sentiment analysis**
- **Spam detection**
- **Safety scoring**

```javascript
// Moderate content
const result = await moderateMessage("User message", userId)
// Returns: { action: "approve", riskScore: 0.1, safe: true }
```

### 5. Coding Assistant
- **Code analysis** and suggestions
- **Bug detection** and fixes
- **Code generation** from descriptions
- **Code optimization** tips

```javascript
// Get coding help
const help = await getCodeHelp("How to optimize this React component?", userId, {
  context: { code: "const MyComponent = () => {...}", language: "javascript" }
})
```

## ⚙️ Advanced Configuration

### Rate Limiting
Customize rate limits based on your usage:

```env
# Requests per minute per user
VITE_AI_RATE_LIMIT_PER_MINUTE=60

# Requests per hour per user  
VITE_AI_RATE_LIMIT_PER_HOUR=1000

# Maximum message length
VITE_AI_MAX_MESSAGE_LENGTH=4000
```

### Provider Fallbacks
The system automatically falls back:
1. **OpenAI** → **Anthropic** → **Mock responses**
2. **Google Translate** → **AI Translation** → **Mock translation**

### Custom Models
Configure specific models per provider:

```javascript
// In your components
const { messages } = useChat({
  provider: 'openai',
  model: 'gpt-4', // or 'gpt-3.5-turbo'
  temperature: 0.7,
  maxTokens: 200
})
```

## 🔒 Security & Privacy

### API Key Security
- ✅ Store keys in environment variables
- ✅ Never commit keys to version control
- ✅ Use different keys for dev/production
- ✅ Rotate keys regularly

### Content Privacy
- 🔒 Messages are processed securely
- 🔒 No permanent storage by AI providers
- 🔒 Rate limiting prevents abuse
- 🔒 Content moderation protects users

### Usage Monitoring
```javascript
// Check usage stats
const stats = getUsageStats()
// {
//   requests_last_minute: 5,
//   requests_last_hour: 45,
//   remaining_minute: 55,
//   remaining_hour: 955
// }
```

## 🎛️ Integration Examples

### Basic AI Chat
```jsx
import { useChat } from '../hooks/useChat'

function AIChatComponent() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat()
  
  return (
    <div>
      <div className="messages">
        {messages.map(msg => (
          <div key={msg.id} className={msg.role}>
            {msg.content}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <input value={input} onChange={handleInputChange} />
        <button disabled={isLoading}>Send</button>
      </form>
    </div>
  )
}
```

### Translation Feature
```jsx
import { translateText } from '../api/ai-backend'

function TranslateButton({ message, targetLang }) {
  const [translation, setTranslation] = useState('')
  
  const handleTranslate = async () => {
    const result = await translateText(message.content, targetLang, userId)
    setTranslation(result.translatedText)
  }
  
  return (
    <button onClick={handleTranslate}>
      Translate to {targetLang}
    </button>
  )
}
```

### Content Moderation
```jsx
import { moderateMessage } from '../api/ai-backend'

function MessageInput({ onSend }) {
  const handleSubmit = async (message) => {
    const moderation = await moderateMessage(message, userId)
    
    if (moderation.action === 'block') {
      alert('Message blocked: ' + moderation.message)
      return
    }
    
    onSend(message)
  }
}
```

## 🔧 Troubleshooting

### Common Issues

1. **"AI features not available"**
   - Check API keys in `.env`
   - Verify keys are valid
   - Check rate limits

2. **"Rate limit exceeded"**
   - Wait before retrying
   - Increase rate limits
   - Check usage stats

3. **"Translation failed"**
   - Check Google Translate API key
   - Verify language codes
   - Check AI fallback

4. **Slow responses**
   - Check network connection
   - Try different provider
   - Reduce maxTokens

### Health Check
```javascript
// Check AI backend status
const health = await aiBackend.healthCheck()
console.log(health)
// {
//   status: "healthy",
//   providers: { openai: "available", anthropic: "disabled" },
//   features: { chat_assistance: true, translation: true }
// }
```

## 💰 Cost Management

### Estimated Costs (OpenAI)
- **GPT-3.5 Turbo**: ~$0.001 per message
- **GPT-4**: ~$0.01 per message
- **Translation**: ~$0.0001 per message

### Cost Optimization
- Use **GPT-3.5** for most conversations
- Reserve **GPT-4** for complex queries
- Set **maxTokens** limits
- Implement **smart caching**

## 📊 Monitoring & Analytics

The system automatically logs:
- **API usage** per user
- **Rate limit** violations
- **Error rates** by provider
- **Content moderation** actions

Check the database tables:
- `ai_conversations` - Chat history
- `moderation_logs` - Content flags
- `translation_history` - Translation usage

## 🔮 Advanced Features

### Custom Prompts
```javascript
// Custom system prompts
const customChat = useChat({
  systemPrompt: "You are a helpful coding assistant specialized in React development."
})
```

### Batch Operations
```javascript
// Translate multiple messages
const translations = await batchTranslate(messages, 'es', userId)
```

### Contextual AI
```javascript
// Context-aware responses
const response = await contextualTranslate(text, 'fr', conversationHistory)
```

## 🤝 Integration with Replit/Codeium

While Replit AI and Codeium are coding assistants (not backend services), you can enhance your development workflow:

### Replit AI Integration
If developing in Replit:
1. Use Replit AI for code suggestions
2. Our AI backend handles runtime AI features
3. Replit AI helps write/debug the AI integration code

### Codeium Integration
If using Codeium in your IDE:
1. Codeium assists with writing AI integration code
2. Our backend provides the actual AI features for users
3. Use Codeium to optimize AI backend performance

## 📚 API Reference

### Main AI Backend Class
```javascript
import { aiBackend } from '../api/ai-backend'

// Chat assistance
await aiBackend.chatAssistance(messages, userId, options)

// Translation
await aiBackend.translate(text, targetLang, userId, options)

// Moderation
await aiBackend.moderateContent(text, userId, options)

// Code assistance
await aiBackend.codeAssistance(query, userId, options)

// Health check
await aiBackend.healthCheck()

// Usage stats
aiBackend.getUsageStats(userId)
```

## 🎉 You're All Set!

Your ChatApp now has enterprise-grade AI capabilities:
- ✅ **Multi-provider AI** chat assistance
- ✅ **Real-time translation** in 20+ languages  
- ✅ **Smart content moderation**
- ✅ **AI-powered coding help**
- ✅ **Rate limiting** and security
- ✅ **Usage monitoring** and analytics

Start chatting with AI, translate messages, and enjoy the intelligent features! 🚀
