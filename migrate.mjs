import fs from 'fs'
import pkg from 'pg'
const { Client } = pkg
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const connectionString = process.env.CONNECTION_STRING || 'postgresql://postgres:2017201820192020@db.yfreeagbhtmnuwygkprl.supabase.co:5432/postgres'

async function migrate() {
  const client = new Client({
    connectionString,
  })

  try {
    await client.connect()
    console.log('Connected to Supabase Postgres database successfully.')

    const sql = fs.readFileSync('db.sql', 'utf8')
    console.log('Executing db.sql...')
    
    await client.query(sql)
    console.log('Migration completed successfully!')
  } catch (err) {
    console.error('Migration failed:', err)
  } finally {
    await client.end()
  }
}

migrate()
