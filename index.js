import ollama, {Ollama} from 'ollama'
import fs from 'fs'

// Initialize the client with your external URL
const ollamaSrv = new Ollama({
  host: 'http://192.168.0.123:11434'
})

const getPrompt = () => fs.readFileSync('prompt-input.txt', 'utf8')


const translationWithOllama = async () => {
  const start = Date.now()
  const response = await ollamaSrv.generate({
    model: 'qwen3.5:9b-64k',
    prompt: getPrompt(),
    stream: false // Disables line-by-line streaming
  })
  const seconds = (Date.now() - start) / 1000

// Access the flat response field
  const outputFile = `translation-output-${Date.now()}-${seconds.toFixed(2)}s.html`
  fs.writeFileSync(outputFile, response.response)
  console.log(response.response)
  console.log(`Generation time: ${seconds.toFixed(2)}s`)
}

await translationWithOllama()
