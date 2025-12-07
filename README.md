# CareerKart - Your Job. Our Guidance.

A modern Next.js application for AI-powered job search and career guidance.

## 🚀 Features

- **AI Recruiters**: Chat with Donna (Resume Expert) and Harvey (Interview Coach)
- **Smart Job Matching**: AI-powered job recommendations based on your profile
- **Resume Analysis**: Get detailed feedback and improvement suggestions
- **Interview Prep**: Practice with AI-powered mock interviews
- **Dark/Light Mode**: Full theme support with smooth transitions
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5
- **UI Library**: Material-UI (MUI) 6
- **Styling**: Tailwind CSS 3
- **State Management**: Zustand 5
- **Server State**: TanStack Query 5
- **Forms**: React Hook Form + Zod
- **Animations**: Framer Motion

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth-related routes
│   ├── jobs/              # Jobs listing page
│   └── layout.tsx         # Root layout
├── components/
│   ├── ui/                # Reusable UI components
│   ├── features/          # Feature-specific components
│   ├── layouts/           # Layout components (Header, Footer)
│   └── providers/         # Context providers
├── lib/
│   ├── api/               # API client and hooks
│   │   ├── hooks/         # React Query hooks
│   │   └── mock/          # Mock data for development
│   └── utils/             # Utility functions
├── store/                 # Zustand stores
├── types/                 # TypeScript types/interfaces
└── styles/
    └── theme.ts           # MUI theme configuration
```

## 🎨 Design System

### Colors
- **Primary**: Blue (#2563EB)
- **Accent**: Yellow/Gold (#EAB308)
- **Success**: Green (#10B981)
- **Error**: Red (#EF4444)
- **Warning**: Orange (#F97316)

### Typography
- **Font Family**: IBM Plex Sans
- **Headings**: H1 (56px) to H6 (16px)
- **Responsive**: Different sizes for desktop, tablet, mobile

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Environment Variables

Create a `.env.local` file:

```env
# API Configuration (for future backend integration)
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Authentication (for future implementation)
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

## 📱 Pages

1. **Home** (`/`) - Landing page with hero, features, testimonials
2. **Jobs** (`/jobs`) - Job listings with filters and search
3. **Profile** (`/profile`) - User profile and resume management
4. **Donna Chat** (`/donna`) - AI resume assistant
5. **Harvey Chat** (`/harvey`) - AI interview coach

## 🔧 Development

### Code Style
- ESLint for linting
- Prettier for formatting
- TypeScript strict mode enabled

### Component Guidelines
- Use functional components with hooks
- Prefer composition over inheritance
- Keep components small and focused
- Use TypeScript interfaces for props

### State Management
- **Zustand**: Global UI state, auth, theme
- **TanStack Query**: Server state, API caching

## 📦 API Integration

The app is designed for easy backend integration:

1. Mock data is in `src/lib/api/mock/`
2. API hooks are in `src/lib/api/hooks/`
3. Types are defined in `src/types/`

To connect to a real backend:
1. Update the API base URL
2. Replace mock functions with actual API calls
3. Update types as needed

## 🎯 Future Enhancements

- [ ] Authentication (Google, LinkedIn OAuth)
- [ ] Real-time chat with AI recruiters
- [ ] Resume upload and parsing
- [ ] Job application tracking
- [ ] Interview scheduling
- [ ] Push notifications
- [ ] Analytics dashboard

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

Built with ❤️ by CareerKart Team
