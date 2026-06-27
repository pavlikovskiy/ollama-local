# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project does

Batch-generates HTML country description pages using a local Ollama LLM, then uploads them into a MySQL database (`WIKIPROXY` table). The pipeline has three stages:

1. **Generate** (`gen-countrues.js`) — reads a CSV of country IDs + Wikipedia URLs from `in/wiki-countries-*.csv`, calls Ollama for each country not yet in `out/`, writes `out/<id>.html`.
2. **Index probe** (`index.js`) — one-off ad-hoc prompt runner; writes timestamped files to `out/`.
3. **Upload** (`update-db.js`) — reads every `out/*.html`, UPDATEs the `WIKIPROXY` table by ID, moves processed files to `done/`.

## Running scripts

```bash
node gen-countrues.js     # generate HTML for all unprocessed countries
node update-db.js         # push generated HTML into MySQL
node index.js             # run the ad-hoc prompt in index.js
```

All scripts are ES modules (`"type": "module"` in package.json), so Node ≥ 18 is required.

## Configuration

**Ollama server** — hardcoded to `http://192.168.0.123:11434`. Change the `host` in the `new Ollama({host})` call in each script.

**Model** — currently `qwen3.5:9b-64k`. Change the `model` field in the `ollamaSrv.generate()` call.

**MySQL** — `update-db.js` reads from env vars with these defaults:

| Var | Default |
|-----|---------|
| `DB_HOST` | `localhost` |
| `DB_PORT` | `3306` |
| `DB_USER` | `root` |
| `DB_PASSWORD` | *(empty)* |
| `DB_NAME` | `wiki` |

## Input files (`in/`)

- `wiki-countries-ru.csv` / `wiki-countries-en.csv` — `id,wikiUrl` rows, one per country
- `prompt-gpt-ru.txt` / `prompt-gpt-en.txt` — the LLM prompt template appended after `COUNTRY_NAME = <url>`
- `prompt-gpt-ru-master.txt` — master/reference version of the Russian prompt

## Output convention

- `out/<id>.html` — freshly generated, awaiting DB upload
- `done/<id>.html` (or `done-en/<id>.html`) — successfully uploaded; `update-db.js` moves files here after a successful UPDATE

## Database schema

```sql
CREATE TABLE `WIKIPROXY` (
  `ID`           varchar(24)   NOT NULL,
  `URL`          varchar(1024) DEFAULT NULL,
  `pageClob`     longtext,
  `creationDate` datetime      DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
```

`update-db.js` does UPDATE (not INSERT) — rows must already exist in the table before running it.
