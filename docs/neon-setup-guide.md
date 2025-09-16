# Neon Database Setup Guide

## Step 1: Create Neon Account

1. Go to [https://neon.tech](https://neon.tech)
2. Click "Sign Up" and create a free account
3. Verify your email address

## Step 2: Create a New Project

1. After logging in, click "Create Project"
2. Choose a project name (e.g., "Student Management System")
3. Select a region (choose closest to your location)
4. Click "Create Project"

## Step 3: Get Connection String

1. In your project dashboard, click "Connect"
2. Select "Node.js" as the connection method
3. Copy the connection string that looks like:
   \`\`\`
   postgresql://neondb_owner:your-password@ep-example-123456.us-east-1.aws.neon.tech/neondb?sslmode=require
   \`\`\`

## Step 4: Configure Environment Variables

1. In your project root, copy `.env.local.example` to `.env.local`:
   \`\`\`bash
   cp .env.local.example .env.local
   \`\`\`

2. Edit `.env.local` and add your connection string:
   \`\`\`env
   DATABASE_URL="postgresql://neondb_owner:your-password@ep-example-123456.us-east-1.aws.neon.tech/neondb?sslmode=require"
   JWT_SECRET="your-super-secret-jwt-key-change-this"
   \`\`\`

## Step 5: Install Dependencies

Make sure you have the required packages:
\`\`\`bash
npm install @neondatabase/serverless bcryptjs jsonwebtoken
\`\`\`

## Step 6: Run Database Setup

1. Check your environment:
   \`\`\`bash
   node scripts/check-environment.js
   \`\`\`

2. If everything looks good, run the setup:
   \`\`\`bash
   node scripts/setup-database.js
   \`\`\`

## Step 7: Start the Application

\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000` and login with:
- **Owner**: owner@system.com / admin123
- **Admin**: admin@system.com / admin123
- **Teacher**: teacher@system.com / admin123

## Troubleshooting

### Connection Issues
- Make sure your connection string is correct
- Check that you're using the pooled connection string
- Verify your Neon project is active

### Permission Issues
- Ensure the database user has proper permissions
- Try using the database owner connection string

### SSL Issues
- Make sure `?sslmode=require` is at the end of your connection string
- Neon requires SSL connections

## Neon Dashboard Features

- **Query Editor**: Run SQL queries directly in the browser
- **Monitoring**: View connection and query metrics
- **Branching**: Create database branches for development
- **Backups**: Automatic backups and point-in-time recovery

## Security Best Practices

1. Never commit `.env.local` to version control
2. Use different databases for development/production
3. Rotate your database passwords regularly
4. Monitor database access logs
5. Use connection pooling for production
