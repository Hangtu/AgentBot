# Deployment Guide

## Vercel (Recommended)

1. Push your code to GitHub
2. Connect the repo to [Vercel](https://vercel.com)
3. Set environment variables in Vercel dashboard (see `.env.example`)
4. Set `SKIP_ENV_VALIDATION=true` as a build env var if needed
5. Deploy

### Environment Variables

Copy all variables from `.env.example` to Vercel's Environment Variables panel. See `CONTEXT.MD` Section 9 for full documentation.

### Branch Strategy

| Branch           | Environment              |
| ---------------- | ------------------------ |
| `main`           | Production (auto-deploy) |
| `develop`        | Staging (if applicable)  |
| Feature branches | Preview deployments      |

## Database (NeonDB)

1. Create a project at [console.neon.tech](https://console.neon.tech)
2. Copy the connection string to `DATABASE_URL`
3. Run `npm run db:push` to sync your schema

## Other Providers

This boilerplate works with any hosting provider that supports Next.js 16:

- Railway
- Fly.io
- AWS Amplify
- Self-hosted (Docker)

Adjust the build command and environment variables accordingly.
