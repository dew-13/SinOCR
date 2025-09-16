# 🎓 Student Management System

A comprehensive student management system built with Next.js, TypeScript, and PostgreSQL (Neon). Features role-based access control, analytics dashboard, and employment tracking for overseas job placements.

## ✨ Features

### 👥 **User Roles & Permissions**
- **Owner**: Full system access, predictive analytics, company management
- **Admin**: Student/teacher management, basic analytics, employment tracking
- **Teacher**: Read-only access to student information

### 🎓 **Student Management**
- Comprehensive student profiles (20+ fields)
- Personal information, education, work experience
- Passport and driving license tracking
- Employment status management

### 🏢 **Company & Employment Tracking**
- Affiliated company management
- Student-to-employee conversion
- Employment contracts and salary tracking
- Overseas placement monitoring

### 📊 **Analytics & Reporting**
- **Descriptive Analytics**: Registration trends, geographic distribution
- **Predictive Analytics**: Enrollment predictions (Owner only)
- Interactive charts and visualizations
- Employment success rates

### 🔐 **Security Features**
- JWT authentication with secure token generation
- Password hashing using bcrypt
- Role-based access control
- SQL injection protection
- Input validation and sanitization

## 🚀 **Quick Start**

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Neon PostgreSQL account

### 1. Clone & Install
\`\`\`bash
git clone <repository-url>
cd student-management-system
npm install
\`\`\`

### 2. Database Setup
1. Create account at [neon.tech](https://neon.tech)
2. Create new project: "Student Management System"
3. Copy your connection string

### 3. Environment Configuration
\`\`\`bash
cp .env.local.example .env.local
\`\`\`

Edit `.env.local`:
\`\`\`env
DATABASE_URL="your-neon-connection-string"
JWT_SECRET="your-secure-jwt-secret"
\`\`\`

### 4. Database Initialization
\`\`\`bash
# Check environment
npm run db:check

# Setup database
npm run db:setup
\`\`\`

### 5. Start Application
\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000`

## 🔑 **Demo Credentials**

| Role | Email | Password |
|------|-------|----------|
| Owner | owner@system.com | admin123 |
| Admin | admin@system.com | admin123 |
| Teacher | teacher@system.com | admin123 |

## 📁 **Project Structure**

\`\`\`
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   └── login/            # Authentication
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── dashboard/        # Dashboard components
│   ├── students/         # Student management
│   └── ui/               # UI components
├── lib/                  # Utilities
│   ├── auth.ts           # Authentication logic
│   ├── db.ts             # Database queries
│   └── permissions.ts    # Role-based permissions
└── scripts/              # Database setup
    ├── setup-database.js # Automated setup
    └── *.sql             # Schema and data
\`\`\`

## 🛠️ **Available Scripts**

\`\`\`bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run db:setup     # Setup database
npm run db:check     # Check environment
\`\`\`

## 📊 **Database Schema**

### Core Tables
- **users**: Authentication and role management
- **students**: Comprehensive student profiles
- **companies**: Affiliated companies for employment
- **employees**: Employment tracking and contracts

### Key Features
- Foreign key relationships
- Automatic timestamps
- Performance indexes
- Data validation constraints

## 🔐 **Security Implementation**

- **Authentication**: JWT tokens with 24h expiration
- **Authorization**: Role-based permission system
- **Password Security**: bcrypt with 12 salt rounds
- **Database Security**: Parameterized queries
- **Input Validation**: Client and server-side validation

## 📈 **Analytics Features**

### Basic Analytics (All Roles)
- Total students and employment statistics
- Geographic distribution (district/province)
- Registration trends over time
- Employment success rates

### Predictive Analytics (Owner Only)
- Enrollment predictions based on historical data
- Seasonal registration patterns
- Success rate analysis by region
- Future planning insights

## 🌍 **Deployment**

### Environment Variables
\`\`\`env
DATABASE_URL="production-neon-connection"
JWT_SECRET="production-jwt-secret"
NODE_ENV="production"
\`\`\`

### Build & Deploy
\`\`\`bash
npm run build
npm run start
\`\`\`

## 🤝 **Contributing**

1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

## 📄 **License**

MIT License - see LICENSE file for details

## 🆘 **Support**

- Check troubleshooting in setup guide
- Review browser console for errors
- Test database connection: `/api/health`
- Verify environment: `npm run db:check`

---

**Built with ❤️ using Next.js, TypeScript, and Neon PostgreSQL**
\`\`\`
