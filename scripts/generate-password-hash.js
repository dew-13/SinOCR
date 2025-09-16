const bcrypt = require("bcryptjs")

async function generateHash(password) {
  const hash = await bcrypt.hash(password, 12)
  console.log(`Password: ${password}`)
  console.log(`Hash: ${hash}`)
  console.log("---")
}

// Generate hashes for common passwords
async function main() {
  await generateHash("admin123")
  await generateHash("password123")
  await generateHash("teacher123")
}

main().catch(console.error)
