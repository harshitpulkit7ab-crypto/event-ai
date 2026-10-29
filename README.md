# Gatherly

Gatherly helps plan weddings, birthdays, and community events with a personalized budget, timeline, vendor checklist, and creative ideas. Plan generation works out of the box using the built-in planner: **no API key, account, or environment variables are needed to build, deploy, or use the app.**

## Deploy to Vercel

1. Import this repository into [Vercel](https://vercel.com/new).
2. Select **Next.js** and keep the default build settings.
3. Deploy. No environment variables or API secrets are required.

The built-in planner generates complete personalized plans without connecting to a third-party service. To optionally enhance plans with Gemini, set `GEMINI_API_KEY` in your server environment; this is entirely optional, is never requested by the app, and the built-in planner continues to work if the service is unavailable. Never commit API keys.

## Run locally

Requires Node.js 20.9 or later.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The planner works immediately without environment variables.

## Checks

```bash
npm run build
npm run typecheck
npm run test:smoke
```
