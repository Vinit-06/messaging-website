import React, { useState, useRef, useEffect } from 'react'
import { 
  X, 
  Bot, 
  Send, 
  Sparkles, 
  MessageSquare, 
  Languages,
  FileText,
  Lightbulb,
  Copy,
  Check,
  RefreshCw
} from 'lucide-react'
import { useChat } from 'ai/react'
import LoadingSpinner from '../LoadingSpinner'

const AIFeaturesPanel = ({ onClose, activeChat }) => {
  const [activeFeature, setActiveFeature] = useState('chat')
  const [copiedText, setCopiedText] = useState('')
  const messagesEndRef = useRef(null)

  const { 
    messages, 
    input, 
    handleInputChange, 
    handleSubmit,
    isLoading,
    error,
    reload
  } = useChat({
    api: '/api/chat',
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Hello! I\'m your AI assistant. How can I help you today? I can help with writing, translation, summarization, and more!'
      }
    ]
  })

  const aiFeatures = [
    {
      id: 'chat',
      label: 'AI Chat',
      icon: Bot,
      description: 'Chat with AI assistant'
    },
    {
      id: 'translate',
      label: 'Translate',
      icon: Languages,
      description: 'Translate messages'
    },
    {
      id: 'summarize',
      label: 'Summarize',
      icon: FileText,
      description: 'Summarize conversations'
    },
    {
      id: 'suggestions',
      label: 'Suggestions',
      icon: Lightbulb,
      description: 'Get reply suggestions'
    }
  ]

  const [translateForm, setTranslateForm] = useState({
    text: '',
    from: 'auto',
    to: 'en',
    result: ''
  })

  const [summarizeLoading, setSummarizeLoading] = useState(false)
  const [summary, setSummary] = useState('')

  const [suggestions, setSuggestions] = useState([])
  const [suggestionsLoading, setSuggestionsLoading] = useState(false)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedText(text)
      setTimeout(() => setCopiedText(''), 2000)
    } catch (err) {
      console.error('Failed to copy text:', err)
    }
  }

  const handleTranslate = async () => {
    if (!translateForm.text.trim()) return

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: translateForm.text,
          from: translateForm.from,
          to: translateForm.to
        })
      })

      const data = await response.json()
      setTranslateForm(prev => ({ ...prev, result: data.translation }))
    } catch (error) {
      console.error('Translation error:', error)
      setTranslateForm(prev => ({ ...prev, result: 'Translation failed. Please try again.' }))
    }
  }

  const handleSummarize = async () => {
    if (!activeChat) return

    setSummarizeLoading(true)
    try {
      // Simulate API call for chat summarization
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const mockSummary = `Here's a summary of your conversation with ${activeChat.name}:

• Main topics discussed: Project planning and timeline
• Key decisions made: Sprint duration set to 2 weeks
• Action items: 
  - Finalize requirements by Friday
  - Schedule design review next week
  - Set up development environment

The conversation was productive and covered all major project aspects.`

      setSummary(mockSummary)
    } catch (error) {
      console.error('Summarization error:', error)
      setSummary('Failed to generate summary. Please try again.')
    } finally {
      setSummarizeLoading(false)
    }
  }

  const generateSuggestions = async () => {
    if (!activeChat) return

    setSuggestionsLoading(true)
    try {
      // Simulate API call for reply suggestions
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const mockSuggestions = [
        "That sounds great! When would be a good time to start?",
        "I agree with your approach. Let me know if you need any help.",
        "Thanks for the update. I'll review this and get back to you.",
        "Could you share more details about the timeline?",
        "Perfect! I'll add this to my calendar."
      ]

      setSuggestions(mockSuggestions)
    } catch (error) {
      console.error('Suggestions error:', error)
    } finally {
      setSuggestionsLoading(false)
    }
  }

  const languages = [
    { code: 'auto', name: 'Auto-detect' },
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' }
  ]

  const renderFeatureContent = () => {
    switch (activeFeature) {
      case 'chat':
        return (
          <div className="flex-1 flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    {message.role === 'assistant' && (
                      <button
                        onClick={() => handleCopy(message.content)}
                        className="mt-2 p-1 hover:bg-gray-200 rounded transition-colors"
                        title="Copy message"
                      >
                        {copiedText === message.content ? (
                          <Check className="w-3 h-3 text-green-600" />
                        ) : (
                          <Copy className="w-3 h-3 text-gray-500" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl px-4 py-2">
                    <LoadingSpinner size="sm" />
                  </div>
                </div>
              )}
              
              {error && (
                <div className="flex justify-center">
                  <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                    <p className="text-red-600 text-sm">Error: {error.message}</p>
                    <button
                      onClick={() => reload()}
                      className="mt-2 text-red-600 hover:text-red-700 text-sm flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Retry
                    </button>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Ask AI anything..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="btn btn-primary"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )

      case 'translate':
        return (
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text to translate
                </label>
                <textarea
                  value={translateForm.text}
                  onChange={(e) => setTranslateForm(prev => ({ ...prev, text: e.target.value }))}
                  placeholder="Enter text to translate..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
                  <select
                    value={translateForm.from}
                    onChange={(e) => setTranslateForm(prev => ({ ...prev, from: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {languages.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                  <select
                    value={translateForm.to}
                    onChange={(e) => setTranslateForm(prev => ({ ...prev, to: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {languages.filter(lang => lang.code !== 'auto').map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={handleTranslate}
                disabled={!translateForm.text.trim()}
                className="btn btn-primary w-full"
              >
                <Languages className="w-4 h-4" />
                Translate
              </button>

              {translateForm.result && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Translation
                  </label>
                  <div className="relative">
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-gray-900">{translateForm.result}</p>
                    </div>
                    <button
                      onClick={() => handleCopy(translateForm.result)}
                      className="absolute top-2 right-2 p-1 hover:bg-gray-200 rounded transition-colors"
                      title="Copy translation"
                    >
                      {copiedText === translateForm.result ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )

      case 'summarize':
        return (
          <div className="p-6 space-y-6">
            <div className="text-center">
              <FileText className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Conversation Summary
              </h3>
              <p className="text-gray-600 mb-6">
                {activeChat 
                  ? `Generate a summary of your conversation with ${activeChat.name}`
                  : 'Select a conversation to generate a summary'
                }
              </p>
              
              {activeChat && (
                <button
                  onClick={handleSummarize}
                  disabled={summarizeLoading}
                  className="btn btn-primary"
                >
                  {summarizeLoading ? <LoadingSpinner size="sm" /> : <Sparkles className="w-4 h-4" />}
                  {summarizeLoading ? 'Generating...' : 'Generate Summary'}
                </button>
              )}
            </div>

            {summary && (
              <div className="mt-6">
                <div className="relative">
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <pre className="text-sm text-gray-900 whitespace-pre-wrap">{summary}</pre>
                  </div>
                  <button
                    onClick={() => handleCopy(summary)}
                    className="absolute top-2 right-2 p-1 hover:bg-gray-200 rounded transition-colors"
                    title="Copy summary"
                  >
                    {copiedText === summary ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )

      case 'suggestions':
        return (
          <div className="p-6 space-y-6">
            <div className="text-center">
              <Lightbulb className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Smart Reply Suggestions
              </h3>
              <p className="text-gray-600 mb-6">
                {activeChat 
                  ? `Get AI-generated reply suggestions for ${activeChat.name}`
                  : 'Select a conversation to get reply suggestions'
                }
              </p>
              
              {activeChat && (
                <button
                  onClick={generateSuggestions}
                  disabled={suggestionsLoading}
                  className="btn btn-primary"
                >
                  {suggestionsLoading ? <LoadingSpinner size="sm" /> : <Lightbulb className="w-4 h-4" />}
                  {suggestionsLoading ? 'Generating...' : 'Get Suggestions'}
                </button>
              )}
            </div>

            {suggestions.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Suggested Replies:</h4>
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="relative p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => handleCopy(suggestion)}
                  >
                    <p className="text-gray-900 pr-8">{suggestion}</p>
                    <div className="absolute top-2 right-2">
                      {copiedText === suggestion ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">AI Assistant</h2>
                <p className="text-gray-600">Powered by AI to enhance your conversations</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 border-r border-gray-200 bg-gray-50 p-4">
            <nav className="space-y-2">
              {aiFeatures.map((feature) => (
                <button
                  key={feature.id}
                  onClick={() => setActiveFeature(feature.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                    activeFeature === feature.id
                      ? 'bg-purple-100 text-purple-900 border border-purple-200'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <feature.icon className="w-5 h-5" />
                  <div>
                    <p className="font-medium">{feature.label}</p>
                    <p className="text-xs opacity-75">{feature.description}</p>
                  </div>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col">
            {renderFeatureContent()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIFeaturesPanel
