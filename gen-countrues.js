import {Ollama} from 'ollama'
import fs from 'fs'

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Initialize the client with your external URL
const ollamaSrv = new Ollama({
  host: 'http://192.168.0.123:11434'
})

const fetchWikiText = async (wikiUrl) => {
  try {
    const url = new URL(wikiUrl)
    const title = decodeURIComponent(url.pathname.replace(/^\/wiki\//, ''))
    const apiBase = `${url.protocol}//${url.host}`
    const apiUrl = `${apiBase}/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=extracts&explaintext=1&redirects=1&format=json&formatversion=2`
    const res = await fetch(apiUrl)
    const data = await res.json()
    const page = data.query.pages[0]
    if (page.missing || !page.extract) return ''
    return page.extract.slice(0, 8000)
  } catch (e) {
    console.warn(`  Wikipedia fetch failed for ${wikiUrl}: ${e.message}`)
    return ''
  }
}

const getPrompt = async (wikiUrl, lang) => {
  const wikiText = await fetchWikiText(wikiUrl)
  const context = wikiText
      ? `WIKIPEDIA_CONTEXT:\n${wikiText}\n\n`
      : ''
  return `COUNTRY_NAME = ${wikiUrl}\n\n${context}` +
      fs.readFileSync(`in/prompt-gpt-${lang}.txt`, 'utf8')
}


const generateWithOllama = async (id, wikiUrl, lang) => {
  console.log(`Generating ${lang} ${id} with ${wikiUrl}`);

  const prompt = await getPrompt(wikiUrl, lang)
  const start = Date.now()
  const response = await ollamaSrv.generate({
    model: 'qwen3.5:9b-64k',
    prompt,
    stream: false // Disables line-by-line streaming
  })
  const seconds = (Date.now() - start) / 1000
  console.log(`Generation time: ${seconds.toFixed(0)}s`)
  return response
}

const generate = async (lang) => {
  try {
    // Read local CSV file path
    const rawData = fs.readFileSync(`in/wiki-countries-${lang}.csv`, 'utf-8');

    // Process string structure into a 2D array
    const parsedData = rawData
        .split('\n')
        .filter(row => row.trim() !== '')
        .map(row => row.split(','));

    for (const row of parsedData) {
      if (!fs.existsSync(`done-${lang}/${row[0]}.html`) && !fs.existsSync(`out-${lang}/${row[0]}.html`)) {
        try {
          let response = await generateWithOllama(row[0], row[1], lang);
          let id = row[0];
          const outputFile = `out-${lang}/${id}.html`
          fs.writeFileSync(outputFile, response.response)

        } catch (er1) {
          console.error(`Error ${row[0]} - ${row[1]}`, er1);
          await delay(3000);
        }
      } // if (!fs.existsSync(`out-${lang}/${row[0]}.html`))
    } // for (const row of parsedData)

  } catch (error) {
    console.error("Error reading the CSV file:", error);
  }
}

await generate('uk')
await generate('zh')
await generate('de')
await generate('es')
await generate('fr')
await generate('it')
