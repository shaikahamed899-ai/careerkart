# CareerKart Backend API

A comprehensive job portal backend built with Express.js and MongoDB.

## Features

- **Authentication**: Local + Google OAuth, JWT tokens, refresh tokens
- **User Management**: Profile, resume upload, education, experience, skills
- **Onboarding**: Multi-step onboarding flow for job seekers and employers
- **Jobs**: CRUD, search, filters, applications, recommendations
- **Companies**: Profiles, reviews, salaries, interview experiences
- **Employer Dashboard**: Job posting, application management, interview scheduling
- **Notifications**: Real-time via Socket.IO + email notifications
- **Network**: Connections, suggestions, mutual connections
- **Interview Bot**: AI-powered mock interviews (OpenAI integration)
- **Salaries**: Salary insights, comparisons, submissions

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Variables

Create a `.env` file in the backend folder:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/careerkart

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRES_IN=30d

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email (Nodemailer) - Optional
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@careerkart.com

# OpenAI (for Interview Bot) - Optional
OPENAI_API_KEY=your-openai-api-key

# Encryption
ENCRYPTION_KEY=your-32-character-encryption-key!
```

### 3. Start MongoDB

Make sure MongoDB is running locally or use MongoDB Atlas.

### 4. Seed Database (Optional)

```bash
npm run seed
```

This creates demo users and sample data:
- Job Seeker: `demo@careerkart.com` / `Demo@123`
- Employer: `employer@careerkart.com` / `Demo@123`

### 5. Start Server

```bash
# Development
npm run dev

# Production
npm start
```

Server runs on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/google` - Google OAuth
- `POST /api/auth/refresh-token` - Refresh access token
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Users
- `GET /api/users/profile` - Get profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/avatar` - Upload avatar
- `POST /api/users/resume` - Upload resume
- `POST /api/users/education` - Add education
- `POST /api/users/experience` - Add experience

### Onboarding
- `GET /api/onboarding/questions` - Get onboarding questions
- `POST /api/onboarding/user-type` - Set user type
- `POST /api/onboarding/step` - Save step answers
- `POST /api/onboarding/complete` - Complete onboarding

### Jobs
- `GET /api/jobs` - List jobs with filters
- `GET /api/jobs/filters` - Get filter options
- `GET /api/jobs/:id` - Get job details
- `POST /api/jobs/:id/apply` - Apply for job
- `GET /api/jobs/applications/my` - Get my applications

### Companies
- `GET /api/companies` - List companies
- `GET /api/companies/:slug` - Get company details
- `GET /api/companies/:slug/jobs` - Get company jobs
- `GET /api/companies/:slug/reviews` - Get company reviews
- `POST /api/companies/:id/follow` - Follow company

### Employer
- `POST /api/employer/company` - Create company
- `POST /api/employer/jobs` - Post job
- `GET /api/employer/jobs/:id/applications` - Get applications
- `PUT /api/employer/applications/:id/status` - Update application status

### Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read

### Network
- `GET /api/network/connections` - Get connections
- `POST /api/network/connect/:userId` - Send connection request
- `GET /api/network/suggestions` - Get suggestions

### Salaries
- `GET /api/salaries/insights` - Get salary insights
- `GET /api/salaries/search` - Search salaries
- `POST /api/salaries` - Submit salary

### Interview Bot
- `POST /api/interviews/bot/start` - Start mock interview
- `POST /api/interviews/bot/:sessionId/answer` - Submit answer
- `GET /api/interviews/bot/history` - Get interview history

## Architecture

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Express middleware
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── scripts/         # Utility scripts
│   ├── socket/          # Socket.IO handlers
│   ├── utils/           # Helper functions
│   └── server.js        # Entry point
├── package.json
└── README.md
```

## Security Features

- Password hashing with bcrypt (12 rounds)
- JWT authentication with refresh tokens
- Rate limiting (100 requests per 15 minutes)
- Helmet.js for security headers
- CORS configuration
- Input validation with express-validator
- File upload restrictions
- Encrypted sensitive data

## License

MIT
