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

async function checkPlacementsSchema() {
  try {
    console.log('🔍 Checking placements table schema...')
    
    // Check if table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'placements'
      )
    `
    
    if (!tableExists[0].exists) {
      console.log('❌ Placements table does not exist')
      return
    }
    
    console.log('✅ Placements table exists')
    
    // Get table structure
    const columns = await sql`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'placements' 
      ORDER BY ordinal_position
    `
    
    console.log('\n📋 Placements table structure:')
    columns.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(not null)'}`)
    })
    
    // Check for constraints
    const constraints = await sql`
      SELECT 
        constraint_name,
        constraint_type
      FROM information_schema.table_constraints 
      WHERE table_name = 'placements'
    `
    
    console.log('\n🔗 Constraints:')
    constraints.forEach(constraint => {
      console.log(`  ${constraint.constraint_name}: ${constraint.constraint_type}`)
    })
    
    // Check record count
    const count = await sql`SELECT COUNT(*) as count FROM placements`
    console.log(`\n📊 Total records: ${count[0].count}`)
    
  } catch (error) {
    console.error('❌ Error checking schema:', error)
  }
}

checkPlacementsSchema() 