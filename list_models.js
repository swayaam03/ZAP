import { GoogleGenerativeAI } from '@google/generative-ai'
import fs from 'fs'

const envStr = fs.readFileSync('.env', 'utf8')
const keyMatch = envStr.match(/VITE_GEMINI_API_KEY=(.*)/)
const key = keyMatch ? keyMatch[1] : null
console.log("Key found:", !!key)

if (key) {
  const genAI = new GoogleGenerativeAI(key)
  try {
     const models = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`)
     const data = await models.json()
     console.log("AVAILABLE MODELS:")
     data.models.forEach(m => console.log(m.name, " - ", m.supportedGenerationMethods))
  } catch (e) {
     console.error(e)
  }
}
