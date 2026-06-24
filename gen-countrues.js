import ollama, {Ollama} from 'ollama'
import fs from 'fs'

// Initialize the client with your external URL
const ollamaSrv = new Ollama({
  host: 'http://192.168.0.123:11434'
})

const getPrompt = (wikiUrl) =>
    `COUNTRY_NAME = ${ wikiUrl }` +
    `\n\n` +
    fs.readFileSync('in/prompt-gpt.txt', 'utf8')


const generateWithOllama = async (id, wikiUrl) => {
  console.log(`Generating ${id} with ${wikiUrl}`);

  const start = Date.now()
  const response = await ollamaSrv.generate({
    model: 'qwen3.5:9b-64k',
    prompt: getPrompt(wikiUrl),
    stream: false // Disables line-by-line streaming
  })
  const seconds = (Date.now() - start) / 1000

// Access the flat response field
  const outputFile = `out/${id}.html`
  fs.writeFileSync(outputFile, response.response)
  // console.log(response.response)
  console.log(`Generation time: ${seconds.toFixed(0)}s`)
}

const generate = async () => {
  try {
    // Read local CSV file path
    const rawData = fs.readFileSync('in/wiki-countries.csv', 'utf-8');

    // Process string structure into a 2D array
    const parsedData = rawData
        .split('\n')
        .filter(row => row.trim() !== '')
        .map(row => row.split(','));

    for (const row of parsedData) {
      if (!fs.existsSync(`out/${row[0]}.html`, 'utf8'))
        await generateWithOllama(row[0], row[1]);
    }

    // console.log(parsedData);
  } catch (error) {
    console.error("Error reading the CSV file:", error);
  }
}

await generate()

// await translationWithOllama()
