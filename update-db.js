import mysql from 'mysql2/promise'
import fs from 'fs'

const config = {
  host:     process.env.DB_HOST     || 'localhost',
  port:     process.env.DB_PORT     || 3306,
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'wiki',
}

const updateDb = async () => {
  const connection = await mysql.createConnection(config)

  try {
    const files = fs.readdirSync('out').filter(f => f.endsWith('.html'))
    console.log(`Found ${files.length} file(s) in out/`)

    for (const file of files) {
      const id = file.slice(0, -'.html'.length)
      const pageClob = fs.readFileSync(`out/${file}`, 'utf8')
      const creationDate = new Date()

      const [result] = await connection.execute(
          'UPDATE WIKIPROXY SET pageClob = ?, creationDate = ? WHERE ID = ?',
          [pageClob, creationDate, id]
      )

      if (result.affectedRows > 0) {
        fs.renameSync(`out/${file}`, `done/${file}`)
        console.log(`Updated ${id} -> moved to done/`)
      } else {
        console.warn(`No row for id ${id}, skipping (left in out/)`)
      }
    }
  } catch (error) {
    console.error('Error updating the database:', error)
  } finally {
    await connection.end()
  }
}

await updateDb()
