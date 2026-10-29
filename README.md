# Gatherly

Gatherly is a GenAI-powered planning assistant for weddings, birthdays, and community events. It turns a few event details into a personalized budget, planning timeline, vendor checklist, and creative ideas.

## Deploy to Vercel

1. Import this repository into [Vercel](https://vercel.com/new).
2. Keep the detected Next.js framework and default build settings.
3. In the Vercel project settings, add `GEMINI_API_KEY` as an environment variable for the environments you want to use.
4. Redeploy. The app is then available at your Vercel project URL.

Create a Gemini API key in [Google AI Studio](https://aistudio.google.com/apikey). Keep the key in Vercel's environment-variable settings; never put it in client-side code or commit it to the repository. Copy `.env.example` to `.env.local` for local development.

## Run locally

Requires Node.js 20.9 or later.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Add `GEMINI_API_KEY` to `.env.local` to generate personalized plans. A sample plan is included so the planner UI is useful before the key is configured.

## Checks

```bash
npm run build
npm run typecheck
```
