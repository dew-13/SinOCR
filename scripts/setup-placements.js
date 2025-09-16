const { neon } = require("@neondatabase/serverless")
const fs = require("fs")
const path = require("path")

// Check for DATABASE_URL in multiple places
function getDatabaseUrl() {
  // Check environment variables
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL
  }

  // Check for .env file
  try {
    const envPath = path.join(process.cwd(), ".env.local")
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, "utf8")
      const match = envContent.match(/DATABASE_URL=(.+)/)
      if (match) {
        return match[1].replace(/["']/g, "")
      }
    }
  } catch (error) {
    // Ignore file read errors
  }

  return null
}

const DATABASE_URL = getDatabaseUrl()

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL environment variable is required")
  process.exit(1)
}

const sql = neon(DATABASE_URL)

async function setupPlacements() {
  try {
    console.log('🔄 Setting up placements table...')
    
    // Read the SQL file
    const sqlFile = path.join(__dirname, '04-create-placements-table.sql')
    const sqlContent = fs.readFileSync(sqlFile, 'utf8')
    
    // Split by semicolon and filter out empty statements
    const statements = sqlContent
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0 && !stmt.startsWith("--"))

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await sql([statement])
        } catch (error) {
          // Log but continue for non-critical errors
          if (!error.message.includes("does not exist") && !error.message.includes("already exists")) {
            console.warn(`⚠️  Warning:`, error.message)
          }
        }
      }
    }
    
    console.log('✅ Placements table created successfully!')
    
    // Test the table
    const result = await sql`SELECT COUNT(*) as count FROM placements`
    console.log(`📊 Placements table has ${result[0].count} records`)
    
  } catch (error) {
    console.error('❌ Error setting up placements table:', error)
    process.exit(1)
  }
}

setupPlacements() 