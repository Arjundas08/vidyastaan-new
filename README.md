# Vidyastaan - India's #1 Peer-to-Peer Learning Platform for V

> **A new possibility for every child** — Connecting underserved school students with passionate college volunteers for academic support and real-world skill development.

Vidyastaan is a comprehensive platform that bridges the education gap in India by enabling peer-to-peer mentorship between college volunteers and school students. Our mission is to ensure every child gets the personalized guidance they deserve, regardless of their socioeconomic background.

## 🎯 The Problem We Solve

- **58%** of government school students lack a trained mentor for personalized guidance
- **70%** of tutoring programs have no progress tracking, leading to learning gaps
- **1 in 3** children fall behind their grade level by Grade 5 without early intervention

## ✨ Key Features

### 🤖 AI-Powered Matching
Smart algorithms find the perfect mentor based on grade, subjects, and language preferences, ensuring optimal learning partnerships.

### 📞 Voice Access Helpers
Students can interact via phone calls if they lack internet access or smartphones, making education truly accessible to all.

### 🎓 Skill Workshops
Go beyond textbooks with expert-led sessions covering coding, financial literacy, and other real-world skills.

### 📊 NGO Impact Dashboard
Real-time tracking of student progress and volunteer engagement for our NGO partners to measure and optimize impact.

### 👥 Multi-Role Platform
- **Students**: Access personalized mentorship, workshops, AI-buddy support, and portfolio building tools
- **Volunteers**: Mentor students, conduct workshops, access AI tools for teaching support
- **Admins**: Manage volunteers, students, assignments, and track impact metrics

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm installed
- Firebase account (for authentication and database)
- Modern web browser



## 📦 Tech Stack

- **Frontend**: [Next.js 16](https://nextjs.org/) with React 19
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Database & Auth**: [Firebase](https://firebase.google.com/)
- **Form Management**: [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) validation
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Notifications**: [React Hot Toast](https://react-hot-toast.com/)
- **AI Integration**: Claude AI (via Anthropic)
- **TypeScript**: Full type safety

## 🏗️ Project Structure

```
src/
├── app/              # Next.js app router pages
│   ├── auth/        # Authentication pages (login, register)
│   ├── dashboard/   # Role-based dashboards (student, volunteer, admin)
│   └── onboarding/  # User onboarding flows
├── components/      # Reusable React components
│   ├── landing/     # Landing page sections
│   ├── dashboard/   # Dashboard components
│   └── auth/        # Authentication components
├── context/         # React context for state management
├── lib/             # Utility functions and configurations
│   ├── firebase.ts  # Firebase initialization
│   ├── claude.ts    # Claude AI integration
│   └── db.ts        # Database utilities
└── public/          # Static assets
```

## 🔧 Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 📖 Usage

### For Students
1. Visit the platform and register as a student
2. Complete your profile with grade and subjects
3. Get matched with a volunteer mentor
4. Access workshops and AI-buddy for homework help
5. Build your portfolio and track your progress

### For Volunteers
1. Apply to become a volunteer
2. Go through the verification process
3. Get matched with students
4. Conduct one-on-one sessions and workshops
5. Use AI tools to enhance your teaching

### For Admins
1. Access the admin dashboard
2. Manage volunteers and students
3. Create and assign assignments
4. Track impact metrics and engagement

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## TEAM 36

