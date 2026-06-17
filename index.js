import ollama, {Ollama} from 'ollama'
import { readFileSync } from 'fs'

// Initialize the client with your external URL
const ollamaSrv = new Ollama({
  host: 'http://192.168.0.123:11434'
})

const getPrompt = () =>
    `translate following text to Russian: ` + readFileSync('translation-input', 'utf8')


const translationWithOllama = async () => {
  const response = await ollamaSrv.generate({
    model: 'qwen3.5:4b',
    prompt: getPrompt(),
    stream: false // Disables line-by-line streaming
  })

// Access the flat response field
  console.log(JSON.stringify(response.response))
}

await translationWithOllama()
