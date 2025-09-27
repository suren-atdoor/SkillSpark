# Quiz Master (MERN web app)

A Next.js App Router application for creating and taking quizzes with advanced question types, security settings, and user progress tracking.

Quick links:
- User Guide (for end users): docs/user-guide.md
- Developer Guide (for contributors): docs/developer-guide.md

Live workflow with Git + Vercel
- Pushes to your Git repository create Preview deployments and merging to your production branch (commonly "main") creates a Production deployment. This makes it easy to review changes before going live [^2][^3][^4].
- You can also create a deployment from a specific commit SHA or branch directly from the Vercel dashboard if automatic deployments are interrupted [^2][^4].
- Configure environment variables in your Vercel project settings so both preview and production deployments have what they need [^5][^2].

Notes on environment variables
- By default, environment variables are only available on the server. To read a variable on the client, prefix it with NEXT_PUBLIC_ [^5].
- When deploying on Vercel, set your environment variables in Project Settings. You can also pull preview values locally via vercel env pull [^5].

Sources:
- [^2]: Deploying Git Repositories with Vercel
- [^3]: Deploying GitHub Projects with Vercel
- [^4]: Deploying Git Repositories with Vercel (overview)
- [^5]: Next.js Environment Variables
