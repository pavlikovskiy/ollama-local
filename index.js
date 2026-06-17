import ollama, {Ollama} from 'ollama'
import fs from 'fs'

// Initialize the client with your external URL
const ollamaSrv = new Ollama({
  host: 'http://192.168.0.123:11434'
})

//     `Output only the translation, with no explanations or notes:\n\n` +
//     `Translate the following segment into Russian, without additional explanation. ` +

const getPrompt = () =>
    `Translate the following segment into Spanish, without additional explanation. ` +
    `\n\n` +
    fs.readFileSync('translation-input.txt', 'utf8')


const translationWithOllama = async () => {
  const start = Date.now()
  const response = await ollamaSrv.generate({
    model: 'translategemma:4b',
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
