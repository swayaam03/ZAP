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
    let systemContext = `You are the "AI Doubt Solver" inside a SaaS productivity app called ZAP. 
Your goal is to act as a personalized mentor and help the user by combining general knowledge with the specific context of their Notes and Tasks. Keep responses concise, supportive, and formatted cleanly in markdown.\n\n`;
    
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

export async function simulateScheduleImpact(targetTask, delayDays, allTasks, workloads) {
  if (!genAI) {
    return {
      issues: ["AI service is not configured (missing API key)."],
      originalRisk: 0,
      newRisk: 0,
      suggestion: "Unable to analyze schedule without AI context.",
      impactedTasks: [],
      bestAlternativeDay: null
    }
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    // A lightweight summary of all tasks for context
    const taskSummaries = allTasks.map(t => 
      `- Title: "${t.title}", Start: ${t.startDate || 'floating'}, End: ${t.endDate || 'none'}, Priority: ${t.priority || 'none'}, Time: ${t.estimatedTime || 'N/A'}`
    ).join("\n")

    const systemPrompt = `You are the intelligent scheduling engine for the ZAP productivity app.
Your task is to analyze the impact of a user delaying a specific task.

# Risk Score Calculation Guidelines:
- Number of conflicts (overlapping tasks or excessive workload) increases risk (+ medium weight).
- Missed deadines increases risk greatly (+ high weight).
- Overloaded days (e.g., > 360 total mins estimated work on a single day) increases risk (+ medium weight).
- High priority delays increase risk (+ high weight).
Risk Score Range: 0 to 100.

# Context:
- Target Task: "${targetTask.title}", Original Start: "${workloads.originalDateStr}"
- Delay amount: ${delayDays} day(s). Target New Date: "${workloads.delayedDateStr}"
- Task List Context:
${taskSummaries}

- Existing Workloads (Total minutes of work per day BEFORE delay): 
${JSON.stringify(workloads.beforeWorkloads, null, 2)}
- New Workloads (Total minutes of work per day AFTER delay): 
${JSON.stringify(workloads.afterWorkloads, null, 2)}

You must return ONLY a JSON response without any markdown wrappers matching the schema below:
{
  "issues": [ "Detailed array of string insights (e.g., 'Delaying this task will cause 2 tasks to overlap on Tuesday', 'You will exceed available time by 1.5 hours', '1 high-priority task will be impacted')" ],
  "originalRisk": number (0-100),
  "newRisk": number (0-100),
  "suggestion": "string explaining why the delay is safe/unsafe contextually (e.g., 'This delay creates conflicts on Tuesday and increases risk by 40%')",
  "impactedTasks": [ "array of task titles that are impacted, max 3" ],
  "bestAlternativeDay": "string (YYYY-MM-DD) if you recommend a safer day nearby, or null"
}`

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    })

    const responseText = result.response.text()
    return JSON.parse(responseText)
  } catch (error) {
    console.error("Gemini API Error in simulation:", error)
    return {
      issues: ["AI encountered an error analyzing your schedule."],
      originalRisk: 0,
      newRisk: 0,
      suggestion: "Please verify your API key and try again.",
      impactedTasks: [],
      bestAlternativeDay: null
    }
  }
}
