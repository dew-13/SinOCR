const fs = require("fs")
const path = require("path")

function checkEnvironment() {
  console.log("🔍 Checking environment setup...")

  // Check for .env.local file
  const envPath = path.join(process.cwd(), ".env.local")
  const envExists = fs.existsSync(envPath)

  console.log(`📄 .env.local file: ${envExists ? "✅ Found" : "❌ Not found"}`)

  if (envExists) {
    try {
      const envContent = fs.readFileSync(envPath, "utf8")
      const hasDbUrl = envContent.includes("DATABASE_URL=")
      const hasJwtSecret = envContent.includes("JWT_SECRET=")

      console.log(`🔗 DATABASE_URL: ${hasDbUrl ? "✅ Set" : "❌ Missing"}`)
      console.log(`🔐 JWT_SECRET: ${hasJwtSecret ? "✅ Set" : "❌ Missing"}`)

      if (hasDbUrl) {
        const match = envContent.match(/DATABASE_URL=(.+)/)
        if (match) {
          const url = match[1].replace(/["']/g, "").trim()
          console.log(`📊 Database URL format: ${url.startsWith("postgresql://") ? "✅ Valid" : "❌ Invalid"}`)
        }
      }
    } catch (error) {
      console.error("❌ Error reading .env.local:", error.message)
    }
  }

  // Check environment variables
  console.log(`🌍 Environment DATABASE_URL: ${process.env.DATABASE_URL ? "✅ Set" : "❌ Not set"}`)
  console.log(`🌍 Environment JWT_SECRET: ${process.env.JWT_SECRET ? "✅ Set" : "❌ Not set"}`)

  console.log("\n" + "=".repeat(50))

  if (!envExists && !process.env.DATABASE_URL) {
    console.log("❌ No database configuration found!")
    console.log("\n📋 Setup Instructions:")
    console.log("1. Copy .env.local.example to .env.local")
    console.log("2. Fill in your Neon database connection string")
    console.log("3. Add a JWT secret")
    console.log("4. Run the setup script again")
  } else {
    console.log("✅ Environment looks good!")
  }
}

checkEnvironment()
