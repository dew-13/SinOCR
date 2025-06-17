const bcrypt = require("bcryptjs")
const { neon } = require("@neondatabase/serverless")

// Make sure to set your DATABASE_URL environment variable
const sql = neon(process.env.DATABASE_URL)

async function updateUserPasswords() {
  try {
    console.log("🔄 Starting password update process...")

    // Generate hash for 'admin123'
    const passwordHash = await bcrypt.hash("admin123", 12)
    console.log('✅ Generated password hash for "admin123"')

    // Update or insert owner user
    const ownerResult = await sql`
      INSERT INTO users (email, password_hash, full_name, role) 
      VALUES ('owner@system.com', ${passwordHash}, 'System Owner', 'owner')
      ON CONFLICT (email) 
      DO UPDATE SET 
        password_hash = ${passwordHash},
        updated_at = CURRENT_TIMESTAMP
      RETURNING id, email, full_name, role
    `

    console.log("✅ Owner user updated:", ownerResult[0])

    // Insert admin user
    const adminResult = await sql`
      INSERT INTO users (email, password_hash, full_name, role, created_by) 
      VALUES ('admin@system.com', ${passwordHash}, 'System Admin', 'admin', 1)
      ON CONFLICT (email) 
      DO UPDATE SET 
        password_hash = ${passwordHash},
        updated_at = CURRENT_TIMESTAMP
      RETURNING id, email, full_name, role
    `

    console.log("✅ Admin user updated:", adminResult[0])

    // Insert teacher user
    const teacherResult = await sql`
      INSERT INTO users (email, password_hash, full_name, role, created_by) 
      VALUES ('teacher@system.com', ${passwordHash}, 'System Teacher', 'teacher', 1)
      ON CONFLICT (email) 
      DO UPDATE SET 
        password_hash = ${passwordHash},
        updated_at = CURRENT_TIMESTAMP
      RETURNING id, email, full_name, role
    `

    console.log("✅ Teacher user updated:", teacherResult[0])

    // Verify all users
    const allUsers = await sql`
      SELECT id, email, full_name, role, created_at 
      FROM users 
      WHERE is_active = true 
      ORDER BY id
    `

    console.log("\n📋 All active users:")
    allUsers.forEach((user) => {
      console.log(`- ${user.email} (${user.role})`)
    })

    console.log("\n🎉 Password update completed successfully!")
    console.log("\n🔑 Login credentials:")
    console.log("Owner: owner@system.com / admin123")
    console.log("Admin: admin@system.com / admin123")
    console.log("Teacher: teacher@system.com / admin123")
  } catch (error) {
    console.error("❌ Error updating passwords:", error)
    process.exit(1)
  }
}

updateUserPasswords()
