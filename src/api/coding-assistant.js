// AI Coding Assistant Integration for Developer Features
import { openAIChat, anthropicChat } from './ai-chat'

// Code analysis and suggestions
export const analyzeCode = async (code, language = 'javascript', provider = 'openai') => {
  const prompt = {
    role: 'user',
    content: `Analyze this ${language} code and provide feedback on:
1. Code quality and best practices
2. Potential bugs or issues
3. Performance improvements
4. Security concerns
5. Suggestions for improvement

Code:
\`\`\`${language}
${code}
\`\`\`

Respond in JSON format:
{
  "quality": "poor/fair/good/excellent",
  "score": 1-10,
  "issues": [{"type": "bug/performance/security/style", "line": number, "description": "text", "severity": "low/medium/high"}],
  "suggestions": ["suggestion1", "suggestion2"],
  "summary": "brief overall assessment"
}`
  }

  try {
    const response = provider === 'anthropic' 
      ? await anthropicChat([prompt], { maxTokens: 500 })
      : await openAIChat([prompt], { maxTokens: 500 })
    
    const analysis = JSON.parse(response.content)
    return {
      ...analysis,
      provider,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.warn('Code analysis failed:', error)
    return mockCodeAnalysis(code, language)
  }
}

// Generate code based on description
export const generateCode = async (description, language = 'javascript', framework = null, provider = 'openai') => {
  const frameworkContext = framework ? ` using ${framework}` : ''
  
  const prompt = {
    role: 'user',
    content: `Generate ${language} code${frameworkContext} based on this description:

"${description}"

Requirements:
- Write clean, well-commented code
- Follow best practices for ${language}
- Include error handling where appropriate
- Make it production-ready

Respond with just the code, no explanations:`
  }

  try {
    const response = provider === 'anthropic' 
      ? await anthropicChat([prompt], { maxTokens: 800 })
      : await openAIChat([prompt], { maxTokens: 800 })
    
    return {
      code: response.content,
      language,
      framework,
      description,
      provider,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.warn('Code generation failed:', error)
    return {
      code: `// Error generating code: ${error.message}\n// Please try again with a more specific description`,
      language,
      framework,
      description,
      provider: 'error',
      timestamp: new Date().toISOString()
    }
  }
}

// Explain code functionality
export const explainCode = async (code, language = 'javascript', provider = 'openai') => {
  const prompt = {
    role: 'user',
    content: `Explain what this ${language} code does in clear, simple terms:

\`\`\`${language}
${code}
\`\`\`

Provide:
1. Overall purpose
2. Step-by-step breakdown
3. Key concepts used
4. Potential use cases

Keep the explanation beginner-friendly but thorough.`
  }

  try {
    const response = provider === 'anthropic' 
      ? await anthropicChat([prompt], { maxTokens: 400 })
      : await openAIChat([prompt], { maxTokens: 400 })
    
    return {
      explanation: response.content,
      code,
      language,
      provider,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.warn('Code explanation failed:', error)
    return {
      explanation: 'Unable to explain code at this time. Please try again.',
      code,
      language,
      provider: 'error',
      timestamp: new Date().toISOString()
    }
  }
}

// Debug code issues
export const debugCode = async (code, errorMessage, language = 'javascript', provider = 'openai') => {
  const prompt = {
    role: 'user',
    content: `Help debug this ${language} code that's producing an error:

Error: ${errorMessage}

Code:
\`\`\`${language}
${code}
\`\`\`

Provide:
1. Likely cause of the error
2. Step-by-step fix
3. Corrected code
4. Prevention tips

Respond in JSON format:
{
  "cause": "description of the issue",
  "fix": "step-by-step solution",
  "correctedCode": "fixed code",
  "tips": ["tip1", "tip2"]
}`
  }

  try {
    const response = provider === 'anthropic' 
      ? await anthropicChat([prompt], { maxTokens: 600 })
      : await openAIChat([prompt], { maxTokens: 600 })
    
    const debug = JSON.parse(response.content)
    return {
      ...debug,
      originalCode: code,
      error: errorMessage,
      language,
      provider,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.warn('Code debugging failed:', error)
    return {
      cause: 'Unable to analyze the error',
      fix: 'Please check syntax and variable names',
      correctedCode: code,
      tips: ['Check for typos', 'Verify variable declarations'],
      originalCode: code,
      error: errorMessage,
      language,
      provider: 'error',
      timestamp: new Date().toISOString()
    }
  }
}

// Code optimization suggestions
export const optimizeCode = async (code, language = 'javascript', focus = 'performance', provider = 'openai') => {
  const prompt = {
    role: 'user',
    content: `Optimize this ${language} code for ${focus}:

\`\`\`${language}
${code}
\`\`\`

Focus areas: ${focus === 'performance' ? 'speed and efficiency' : focus === 'readability' ? 'clarity and maintainability' : focus === 'memory' ? 'memory usage' : 'all aspects'}

Provide:
1. Optimized version of the code
2. Explanation of changes made
3. Performance impact
4. Trade-offs (if any)

Respond in JSON format:
{
  "optimizedCode": "improved code",
  "changes": ["change1", "change2"],
  "impact": "description of improvements",
  "tradeoffs": "any downsides or considerations"
}`
  }

  try {
    const response = provider === 'anthropic' 
      ? await anthropicChat([prompt], { maxTokens: 600 })
      : await openAIChat([prompt], { maxTokens: 600 })
    
    const optimization = JSON.parse(response.content)
    return {
      ...optimization,
      originalCode: code,
      language,
      focus,
      provider,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.warn('Code optimization failed:', error)
    return {
      optimizedCode: code,
      changes: [],
      impact: 'Unable to optimize at this time',
      tradeoffs: 'N/A',
      originalCode: code,
      language,
      focus,
      provider: 'error',
      timestamp: new Date().toISOString()
    }
  }
}

// Generate unit tests
export const generateTests = async (code, language = 'javascript', framework = 'jest', provider = 'openai') => {
  const prompt = {
    role: 'user',
    content: `Generate comprehensive unit tests for this ${language} code using ${framework}:

\`\`\`${language}
${code}
\`\`\`

Include:
1. Test cases for normal operation
2. Edge cases and error conditions
3. Mock setup if needed
4. Good test descriptions

Respond with complete test code:`
  }

  try {
    const response = provider === 'anthropic' 
      ? await anthropicChat([prompt], { maxTokens: 800 })
      : await openAIChat([prompt], { maxTokens: 800 })
    
    return {
      testCode: response.content,
      originalCode: code,
      language,
      framework,
      provider,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.warn('Test generation failed:', error)
    return {
      testCode: `// Error generating tests: ${error.message}\n// Please try again`,
      originalCode: code,
      language,
      framework,
      provider: 'error',
      timestamp: new Date().toISOString()
    }
  }
}

// Code refactoring suggestions
export const refactorCode = async (code, language = 'javascript', goal = 'clean_code', provider = 'openai') => {
  const refactoringGoals = {
    'clean_code': 'readability and maintainability',
    'performance': 'speed and efficiency',
    'modularity': 'separation of concerns and reusability',
    'modern_syntax': 'latest language features and best practices'
  }

  const prompt = {
    role: 'user',
    content: `Refactor this ${language} code focusing on ${refactoringGoals[goal] || goal}:

\`\`\`${language}
${code}
\`\`\`

Goals:
- Improve ${refactoringGoals[goal] || goal}
- Follow modern best practices
- Maintain functionality
- Add appropriate comments

Provide the refactored code with explanations of changes made.`
  }

  try {
    const response = provider === 'anthropic' 
      ? await anthropicChat([prompt], { maxTokens: 800 })
      : await openAIChat([prompt], { maxTokens: 800 })
    
    return {
      refactoredCode: response.content,
      originalCode: code,
      language,
      goal,
      provider,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.warn('Code refactoring failed:', error)
    return {
      refactoredCode: code,
      originalCode: code,
      language,
      goal,
      provider: 'error',
      timestamp: new Date().toISOString()
    }
  }
}

// Mock analysis for demo mode
const mockCodeAnalysis = (code, language) => {
  const lines = code.split('\n').length
  const hasComments = code.includes('//') || code.includes('/*')
  const hasErrorHandling = code.includes('try') || code.includes('catch')
  
  let score = 5
  if (hasComments) score += 2
  if (hasErrorHandling) score += 2
  if (lines < 50) score += 1
  
  return {
    quality: score > 7 ? 'good' : score > 5 ? 'fair' : 'poor',
    score: Math.min(score, 10),
    issues: [
      {
        type: 'style',
        line: 1,
        description: 'Consider adding more comments',
        severity: 'low'
      }
    ],
    suggestions: [
      'Add error handling',
      'Include more documentation',
      'Consider breaking into smaller functions'
    ],
    summary: `${language} code with ${lines} lines. ${hasComments ? 'Well commented.' : 'Needs more comments.'}`,
    provider: 'demo',
    timestamp: new Date().toISOString()
  }
}

// Comprehensive code assistant
export const codeAssistant = async (query, context = {}, provider = 'openai') => {
  const { code, language = 'javascript', operation } = context
  
  switch (operation) {
    case 'analyze':
      return analyzeCode(code, language, provider)
    case 'generate':
      return generateCode(query, language, context.framework, provider)
    case 'explain':
      return explainCode(code, language, provider)
    case 'debug':
      return debugCode(code, query, language, provider)
    case 'optimize':
      return optimizeCode(code, language, context.focus, provider)
    case 'test':
      return generateTests(code, language, context.framework, provider)
    case 'refactor':
      return refactorCode(code, language, context.goal, provider)
    default:
      // General coding help
      const prompt = {
        role: 'user',
        content: `Help with this coding question: ${query}
        
${code ? `Related code:\n\`\`\`${language}\n${code}\n\`\`\`` : ''}

Provide a helpful response with examples if applicable.`
      }
      
      try {
        const response = provider === 'anthropic' 
          ? await anthropicChat([prompt], { maxTokens: 400 })
          : await openAIChat([prompt], { maxTokens: 400 })
        
        return {
          response: response.content,
          query,
          context,
          provider,
          timestamp: new Date().toISOString()
        }
      } catch (error) {
        return {
          response: 'I apologize, but I cannot assist with that right now. Please try again.',
          query,
          context,
          provider: 'error',
          timestamp: new Date().toISOString()
        }
      }
  }
}

export default {
  analyzeCode,
  generateCode,
  explainCode,
  debugCode,
  optimizeCode,
  generateTests,
  refactorCode,
  codeAssistant
}
