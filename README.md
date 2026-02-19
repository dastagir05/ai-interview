# IPrepWithAI 🎯

> An AI-powered interview preparation platform that helps job seekers practice smarter, get meaningful feedback, and track their growth — all in one place.

---

## 🚀 Features

### 🎤 AI Interview Experience
- **Voice Input Support** — Practice like a real interview with speech-to-text
- **Adaptive Difficulty Levels** — Junior, Mid, and Senior level questions
- **Domain-Specific Interviews** — Tailored questions for different job roles and industries
- **Real-Time Streaming Responses** — Instant AI feedback without waiting

### ⚡ Practice Modes
- **Quick Quiz** — Fast-paced questions to test your knowledge on the go
- **Technical Questions** — Deep dive into role-specific technical concepts and problem solving
- **Resume Review on Any Job** — Upload your resume and get AI feedback tailored to any specific job role or description

### 📊 Feedback & Analytics
- **Per-Answer Feedback** — Detailed review tied to the specific job role
- **Overall Performance Reports** — Session summaries with strengths and weaknesses
- **User Analytics Dashboard** — Track your improvement over time across sessions
- **Resume Review** — AI-powered resume analysis aligned to job descriptions

### 💼 Job Management
- **Public Jobs** — Admin-created job roles available to all users
- **Personal Jobs** — Users can create their own custom interview tracks
- **Role-Based Access** — Separate experiences for users and admins

### 🔐 Auth & Security
- **JWT Authentication** — Secure token-based auth
- **OAuth Login** — Sign in with Google and other providers
- **Redis Session Management** — Fast, scalable session handling

### 💳 Monetization
- **Basic Plan** — Payment integration for basic features
- **Pro Plan** — Payment integration for premium features

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router) |
| Backend | Spring Boot 3.5 (Java) |
| Database | PostgreSQL (NeonDB — serverless) |
| Cache / Sessions | Redis |
| Auth | JWT + OAuth 2.0 |
| AI | Gemini API |
| Payments | Razorpay |

---

## 🏗️ Architecture Overview

```
┌─────────────────┐        ┌──────────────────────┐
│   Next.js 15    │ ──────▶│  Spring Boot 3.5 API │
│   (Frontend)    │        │     (Java)           │
└─────────────────┘        └──────────┬───────────┘
                                      │
              ┌───────────────────────┼───────────────────────┐
              │                       │                       │
     ┌────────▼───────┐    ┌──────────▼──────┐    ┌──────────▼──────┐
     │  PostgreSQL DB  │    │  Redis Cache    │    │   Gemini API    │
     │   (NeonDB)      │    │  (Sessions)     │    │  (AI Engine)    │
     └────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 📁 Project Structure

```
iprepwithai/
├── frontend/                  # Next.js 15 App
│   ├── app/
│   │   ├── (auth)/            # Login, Register
│   │   ├── dashboard/         # User dashboard & analytics
│   │   ├── interview/         # Interview session pages
│   │   ├── resume/            # Resume review
│   │   └── admin/             # Admin panel
│   ├── components/
│   └── lib/
│
└── backend/                   # Spring Boot API
    └── src/main/java/
        ├── auth/              # JWT & OAuth logic
        ├── interview/         # Interview session handling
        ├── feedback/          # AI feedback engine
        ├── jobs/              # Job management
        ├── resume/            # Resume analysis
        ├── analytics/         # Performance tracking
        └── payments/          # Pro subscription
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js 18+
- Java 21+
- PostgreSQL (or NeonDB connection string)
- Redis instance
- Gemini API Key

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

### Backend Setup

```bash
cd backend
cp src/main/resources/application.example.yml src/main/resources/application.yml
# Fill in your DB, Redis, and API keys
./mvnw spring-boot:run
```

### Environment Variables

**Frontend (`.env.local`)**
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_OAUTH_CLIENT_ID=your_oauth_client_id
```

**Backend (`application.yml`)**
```yaml
spring:
  datasource:
    url: your_neondb_postgresql_url
  redis:
    host: your_redis_host
    port: 6379

jwt:
  secret: your_jwt_secret

Gemini:
  api-key: your_Gemini_key
```

---

## 📸 Screenshots

> *(Add screenshots here — analytics dashboard, interview session, feedback page)*

---

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Team/company accounts for mock interview panels
- [ ] Peer-to-peer mock interviews
- [ ] LinkedIn integration for profile-based question generation
- [ ] Leaderboard and community features

---

## 🤝 Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change.

---

## 📄 License

[MIT](LICENSE)

---

## 👤 Author

**Your Name**  
[LinkedIn](https://linkedin.com/in/dastagirpinjari)

---

> Built with ❤️ to make interview prep smarter, not harder.