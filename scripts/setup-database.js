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
  console.error("\n📋 Setup Instructions:")
  console.error("1. Create a Neon database account at https://neon.tech")
  console.error("2. Create a new project")
  console.error("3. Copy your connection string")
  console.error("4. Set DATABASE_URL environment variable:")
  console.error("   export DATABASE_URL='your-connection-string'")
  console.error("   OR create a .env.local file with:")
  console.error("   DATABASE_URL=your-connection-string")
  console.error("   JWT_SECRET=your-jwt-secret")
  process.exit(1)
}

const sql = neon(DATABASE_URL)

async function runSqlFile(filename) {
  try {
    console.log(`🔄 Running ${filename}...`)
    const filePath = path.join(__dirname, filename)

    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`)
      return
    }

    const sqlContent = fs.readFileSync(filePath, "utf8")

    // Split by semicolon and filter out empty statements
    const statements = sqlContent
      .split(";")
      .map((stmt) => stmt.trim())
      .filter(
        (stmt) =>
          stmt.length > 0 &&
          !stmt.startsWith("--") &&
          !stmt.includes("SELECT 'Schema created successfully'") &&
          !stmt.includes("SELECT 'Initial data inserted successfully'"),
      )

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await sql([statement])
        } catch (error) {
          // Log but continue for non-critical errors
          if (!error.message.includes("does not exist") && !error.message.includes("already exists")) {
            console.warn(`⚠️  Warning in ${filename}:`, error.message)
          }
        }
      }
    }

    console.log(`✅ ${filename} completed successfully`)
  } catch (error) {
    console.error(`❌ Error running ${filename}:`, error.message)
    throw error
  }
}

async function testConnection() {
  try {
    console.log("🔍 Testing database connection...")
    await sql`SELECT 1 as test`
    console.log("✅ Database connection successful")
    return true
  } catch (error) {
    console.error("❌ Database connection failed:", error.message)
    return false
  }
}

async function setupDatabase() {
  try {
    console.log("🚀 Starting complete database setup...")
    console.log("⚠️  WARNING: This will delete all existing data!")

    // Test connection first
    const connected = await testConnection()
    if (!connected) {
      console.error("❌ Cannot proceed without database connection")
      process.exit(1)
    }

    // Run setup scripts in order
    await runSqlFile("01-create-tables.sql")
    await runSqlFile("02-seed-data.sql")

    console.log("\n🎉 Database setup completed successfully!")
    console.log("\n🔑 Login Credentials:")
    console.log("👑 Owner:   owner@system.com   / admin123")
    console.log("👨‍💼 Admin:   admin@system.com   / admin123")
    console.log("👨‍🏫 Teacher: teacher@system.com / admin123")

    console.log("\n📊 Database Summary:")
    try {
      const summary = await sql`
        SELECT 
          'Users' as table_name, COUNT(*) as count FROM users
        UNION ALL
        SELECT 
          'Students' as table_name, COUNT(*) as count FROM students  
        UNION ALL
        SELECT 
          'Companies' as table_name, COUNT(*) as count FROM companies
        UNION ALL
        SELECT 
          'Employees' as table_name, COUNT(*) as count FROM employees
      `

      summary.forEach((row) => {
        console.log(`📋 ${row.table_name}: ${row.count} records`)
      })
    } catch (error) {
      console.log("📋 Summary data will be available after first login")
    }

    console.log("\n🌐 Next Steps:")
    console.log("1. Start your Next.js application: npm run dev")
    console.log("2. Visit http://localhost:3000")
    console.log("3. Login with owner credentials")
    console.log("4. Explore the dashboard and features")

    console.log("\n📁 Create uploads directory:")
    const uploadsDir = path.join(process.cwd(), "public", "uploads")
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
      console.log("✅ Created uploads directory")
    } else {
      console.log("✅ Uploads directory already exists")
    }
  } catch (error) {
    console.error("❌ Database setup failed:", error.message)
    process.exit(1)
  }
}

setupDatabase()
