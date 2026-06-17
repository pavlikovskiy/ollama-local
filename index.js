import ollama, {Ollama} from 'ollama'
import fs from 'fs'

// Initialize the client with your external URL
const ollamaSrv = new Ollama({
  host: 'http://localhost:11434'
})

const getPrompt = () =>
    `Translate the following text from English to Russian. ` +
    `Output only the translation, with no explanations or notes:\n\n` +
    fs.readFileSync('translation-input.txt', 'utf8')


const translationWithOllama = async () => {
  const start = Date.now()
  const response = await ollamaSrv.generate({
    model: 'qwen3.5:2b',
    prompt: getPrompt(),
    stream: false // Disables line-by-line streaming
  })
  const seconds = (Date.now() - start) / 1000

// Access the flat response field
  const outputFile = `translation-output-${Date.now()}-${seconds.toFixed(2)}s.txt`
  fs.writeFileSync(outputFile, response.response)
  console.log(response.response)
  console.log(`Generation time: ${seconds.toFixed(2)}s`)
}

await translationWithOllama()
