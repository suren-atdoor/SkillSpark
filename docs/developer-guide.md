# Quiz Master — Developer Guide

This document covers architecture, local development, configuration, deployments, and contribution guidelines.

Overview
- Framework: Next.js (App Router) with TypeScript and Tailwind CSS
- UI: shadcn/ui + Lucide icons
- Data models: TypeScript interfaces in types/quiz.ts and types/user.ts
- APIs: Route Handlers under app/api
- State: Client-side via React hooks; server logic via route handlers
- Optional: Real-time server (Socket.io) is included as a library stub (lib/socket-server.ts). It’s not required for the core flows.

Architecture at a glance
- app/
  - page.tsx — main UI entry with views: Home, Take Quiz, Manage, Dashboard
  - api/
    - auth/… — register, login, me
    - quiz/… — CRUD, sample, submit
    - progress/… — GET/POST saved progress
    - presets/… — analytics and share endpoints
- components/
  - quiz-taker.tsx — quiz flow, security controls, auto-save
  - quiz-results.tsx — results and explanations
  - quiz-manager.tsx + quiz-editor.tsx — authoring
  - user-dashboard.tsx — in-progress list and stats
  - auth/… — auth modal and forms
- types/
  - quiz.ts — question and quiz data models (including matching, ordering, etc.)
  - user.ts — user, auth, and saved progress shapes
- data/
  - sample-quiz.json — importable sample
  - presets and tags — sample metadata
- config/
  - app-config.ts — read-through of environment variables on server
- lib/
  - mongodb.ts — connection placeholder (replace with real connection in production)
  - socket-server.ts — Socket.io server (optional, not started by Next.js build)

Local development

Prerequisites
- Node.js 18+
- Optional: MongoDB and Redis locally (or configure cloud variants)
- Git

Install and run
1) Install dependencies:
   - npm install
2) Create environment file:
   - cp .env.example .env.local (if provided) or create .env.local manually
3) Start dev server:
   - npm run dev
4) App runs at:
   - http://localhost:3000

Environment variables
- Server vs client availability:
  - By default, env vars are server-only. To expose to the browser, prefix with NEXT_PUBLIC_ [^5].
- Configure env vars on Vercel:
  - Use Project Settings → Environment Variables (supports separate development/preview/production values). You can pull preview values locally using vercel env pull [^5].

Minimum required for core flows in .env.local
- MONGODB_URI=mongodb://localhost:27017
- DB_NAME=quiz_master
- JWT_SECRET=replace-with-a-secure-random-string
- BASE_URL=http://localhost:3000
- API_URL=http://localhost:3000/api

Common optional vars
- JWT_EXPIRES_IN=7d
- REFRESH_TOKEN_EXPIRES_IN=30d
- BCRYPT_ROUNDS=12
- SESSION_TIMEOUT=3600
- SOCKET_PORT=3001
- SOCKET_URL=http://localhost:3001
- CORS_ORIGINS=http://localhost:3000,http://localhost:3001
- ENABLE_SHARING=true
- ENABLE_LEADERBOARDS=true
- ENABLE_ACHIEVEMENTS=true

Note: In development, you can keep using in-memory stores (default in API routes) to test without Mongo. For production, wire up lib/mongodb.ts and replace in-memory arrays with persistent collections.

Key flows and files

Authentication
- Endpoints:
  - POST /api/auth/register — create new user (in-memory demo)
  - POST /api/auth/login — authenticate and receive JWT
  - GET  /api/auth/me — validate token and return user
- Client:
  - components/auth/auth-modal.tsx manages Sign In / Sign Up
  - Tokens stored in localStorage (dev-friendly; consider HttpOnly cookies for production)

Quiz taking and submission
- components/quiz-taker.tsx
  - Loads from /api/quiz/sample by default (adjust as needed)
  - Supports per-section timing (if configured), global timers, security warnings
  - Auto-save (signed-in users): POST /api/progress
- Results:
  - components/quiz-results.tsx
  - Per-question result, explanations, print/export

Quiz management
- components/quiz-manager.tsx + components/quiz-editor.tsx
  - Create, edit, reorder, tag, section, and security settings

Saved progress
- Endpoints:
  - GET /api/progress — list in-progress attempts for the authenticated user
  - POST /api/progress — upsert progress
- Client:
  - components/user-dashboard.tsx displays saved progress and Continue actions

Data models (TypeScript)
- types/quiz.ts includes:
  - Question types: multiple-choice, multiple-select, true-false, fill-blank, short-answer, essay, matching, ordering
  - Copy/paste and screenshot settings
  - Sections, dependencies, adaptive timing
  - Attempt structure with securityEvents
- types/user.ts includes:
  - User, AuthResponse, QuizProgress (saved attempt shape)

API overview (request/response)

Auth
- POST /api/auth/register
  - body: { email, username, password, confirmPassword, firstName?, lastName? }
  - returns: { user, token, expiresIn }
- POST /api/auth/login
  - body: { email, password, rememberMe? }
  - returns: { user, token, expiresIn }
- GET /api/auth/me
  - header: Authorization: Bearer <token>
  - returns: user

Quizzes
- GET /api/quiz
  - returns: Quiz[]
- POST /api/quiz
  - body: Quiz
  - returns: saved Quiz
- DELETE /api/quiz/[id]
  - returns: { ok: true }
- GET /api/quiz/sample
  - returns: sample Quiz shape
- POST /api/quiz/submit
  - body: { quizId, answers, timeSpent, security flags }
  - returns: QuizAttempt (score, totalPoints, etc.)

Progress
- GET /api/progress
  - header: Authorization: Bearer <token>
  - returns: QuizProgress[] In-progress only
- POST /api/progress
  - header: Authorization: Bearer <token>
  - body: Partial<QuizProgress> (quizId, answers, currentQuestionIndex, etc.)
  - returns: upserted QuizProgress

Deployment

Git + Vercel workflow
- Connect your repository to Vercel. Each push creates a Preview deployment; merging to your production branch creates a Production deployment [^2][^3][^4].
- Changing environment variables can be done in Vercel Project Settings. You can also create deployments from a commit SHA or a branch via the Vercel dashboard if automatic deployments are interrupted [^2][^4].
- Keep production secrets set in Vercel; do not commit .env files to Git [^5].

Local vs preview vs production envs
- Use .env.local only for local development.
- On Vercel, define variables per environment (Preview/Production) [^5].
- To test preview values locally, run: vercel env pull [^5].

Testing and quality
- Unit tests are not included by default. You can add Jest/Vitest as preferred.
- Consider adding ESLint and Prettier for consistency. Next.js can be configured to run TypeScript checks and ESLint during CI.

Security notes
- JWT secrets must be strong and private. Consider HttpOnly cookies for tokens in production deployments.
- Clipboard/screenshot restrictions are best-effort and depend on the browser/OS.
- Do not expose server-only secrets to the client; use NEXT_PUBLIC_ only for values safe to ship to the browser [^5].

Roadmap ideas
- Persistent database (MongoDB with proper models) for auth, quizzes, and attempts
- Real-time features (Socket.io) for live quizzes and leaderboards
- Admin area and analytics dashboards
- Test suite and CI integration
- Role-based access control (RBAC)

Sources:
- [^2]: Deploying Git Repositories with Vercel
- [^3]: Deploying GitHub Projects with Vercel
- [^4]: Deploying Git Repositories with Vercel (overview)
- [^5]: Next.js Environment Variables
