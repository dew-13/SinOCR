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

async function fixPlacements() {
  try {
    console.log('🔧 Fixing placements table...')
    
    // Read the SQL file
    const sqlFile = path.join(__dirname, '05-fix-placements-table.sql')
    const sqlContent = fs.readFileSync(sqlFile, 'utf8')
    
    // Execute the SQL
    await sql([sqlContent])
    
    console.log('✅ Placements table fixed successfully!')
    
    // Verify the fix
    const columns = await sql`
      SELECT column_name, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'placements' AND column_name = 'photo'
    `
    
    if (columns[0]?.is_nullable === 'YES') {
      console.log('✅ Photo field is now nullable')
    } else {
      console.log('❌ Photo field is still not nullable')
    }
    
  } catch (error) {
    console.error('❌ Error fixing placements table:', error)
    process.exit(1)
  }
}

fixPlacements() 