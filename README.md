# Gatherly

Gatherly helps plan weddings, birthdays, and community events with an AI-generated budget, timeline, vendor checklist, and creative ideas. It uses Chrome's built-in Gemini Nano model through the Prompt API when the visitor's browser supports on-device AI. Browser AI runs locally; when it is unavailable, the built-in fallback uses the app's own endpoint and no external AI service.

## Deploy to Vercel

1. Import this repository into [Vercel](https://vercel.com/new).
2. Select **Next.js** and keep the default build settings.
3. Deploy. No environment variables, API secrets, or AI provider account are required.

### On-device AI

On supported desktop Chrome versions (Chrome 148+), Gatherly uses Chrome's built-in Prompt API and Gemini Nano to generate plans locally. Chrome downloads the model on first use; the app displays the download progress. Chrome currently requires a supported desktop device, sufficient hardware, and approximately 22 GB of free space for its built-in model. Check [Chrome's current requirements](https://developer.chrome.com/docs/ai/prompt-api#review_the_hardware_requirements) for details.

On-device AI is not available in every browser or device. Gatherly detects availability and uses its built-in personalized planner as a fallback. Deployment never depends on model availability, external AI services, an API key, or an account. When on-device AI is used, event details are processed locally by Chrome's model. When the fallback is used, details are sent only to the app's own planning endpoint; they are never sent to an AI provider.

Chrome manages the on-device model; its first-use download is separate from the app deployment.

## Run locally

Requires Node.js 20.9 or later.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The built-in planner works immediately without environment variables. Test on-device AI in a supported Chrome installation using `localhost` or a deployed HTTPS origin.

## Checks

```bash
npm run build
npm run typecheck
npm run test:smoke
```
