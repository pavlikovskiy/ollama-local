import ollama, {Ollama} from 'ollama'
import { readFileSync } from 'fs'

// Initialize the client with your external URL
const ollamaSrv = new Ollama({
  host: 'http://localhost:11434'
})

const getPrompt = () =>
    `Translate the following text from English to Russian. ` +
    `Output only the translation, with no explanations or notes:\n\n` +
    readFileSync('translation-input.txt', 'utf8')


const translationWithOllama = async () => {
  const response = await ollamaSrv.generate({
    model: 'qwen3.5:2b',
    prompt: getPrompt(),
    stream: false // Disables line-by-line streaming
  })

// Access the flat response field
  console.log(JSON.stringify(response.response))
}

await translationWithOllama()
