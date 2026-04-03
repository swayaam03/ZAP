import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize the API using the key from .env
// We handle missing keys gracefully in the UI.
const apiKey = import.meta.env.VITE_GEMINI_API_KEY
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null

export async function generateInsight(prompt, contextItems = []) {
  if (!genAI) {
    return "Error:AI issue"
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
    
    // Construct the context string
    let systemContext = `You are the "AI Doubt Solver" inside a SaaS productivity app called QuestMind. 
Your goal is to act as a personalized mentor and help the user by combining general knowledge with the specific context of their Notes and Tasks. Keep responses concise, supportive, and formatted cleanly in markdown.\n\n`
    
    if (contextItems.length > 0) {
      systemContext += `Here is context from the user's personal notes and tasks:\n`
      contextItems.forEach(item => {
        systemContext += `- [${item.type.toUpperCase()}] ${item.text}\n`
      })
      systemContext += `\n`
    }

    const fullPrompt = `${systemContext}\nUser's Question: ${prompt}`

    const result = await model.generateContent(fullPrompt)
    const response = await result.response
    return response.text()

  } catch (error) {
    console.error("Gemini API Error:", error)
    return "I encountered an error connecting to the AI service. Please verify your API key and try again."
  }
}
