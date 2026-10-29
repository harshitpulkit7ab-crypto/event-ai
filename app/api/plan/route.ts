import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

const eventTypes = new Set(["Wedding", "Birthday", "Community"]);
const priorities = new Set(["Essential", "Helpful"]);

type PlanRequest = {
  eventType: string;
  eventName: string;
  date: string;
  location: string;
  budget: number;
  guests: number;
  style: string;
  notes: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isText(value: unknown, maximumLength = 500): value is string {
  return typeof value === "string" && value.length <= maximumLength;
}

function isPlan(value: unknown): value is {
  summary: string;
  budgetBreakdown: { category: string; amount: number }[];
  timeline: { timing: string; title: string; detail: string }[];
  vendorChecklist: { name: string; priority: "Essential" | "Helpful" }[];
  ideas: { title: string; detail: string }[];
} {
  if (!isRecord(value) || !isText(value.summary, 800)) return false;
  if (!Array.isArray(value.budgetBreakdown) || value.budgetBreakdown.length < 1 || value.budgetBreakdown.length > 12) return false;
  if (!Array.isArray(value.timeline) || value.timeline.length < 1 || value.timeline.length > 10) return false;
  if (!Array.isArray(value.vendorChecklist) || value.vendorChecklist.length < 1 || value.vendorChecklist.length > 16) return false;
  if (!Array.isArray(value.ideas) || value.ideas.length < 1 || value.ideas.length > 6) return false;

  return value.budgetBreakdown.every(
    (item) => isRecord(item) && isText(item.category, 80) && typeof item.amount === "number" && Number.isFinite(item.amount) && item.amount >= 0,
  ) && value.timeline.every(
    (item) => isRecord(item) && isText(item.timing, 80) && isText(item.title, 120) && isText(item.detail, 300),
  ) && value.vendorChecklist.every(
    (item) => isRecord(item) && isText(item.name, 100) && typeof item.priority === "string" && priorities.has(item.priority),
  ) && value.ideas.every(
    (item) => isRecord(item) && isText(item.title, 120) && isText(item.detail, 300),
  );
}

function isPlanRequest(value: unknown): value is PlanRequest {
  if (!isRecord(value)) return false;
  return typeof value.eventType === "string" && eventTypes.has(value.eventType)
    && isText(value.eventName, 100)
    && isText(value.date, 30)
    && isText(value.location, 100)
    && typeof value.budget === "number" && Number.isFinite(value.budget) && value.budget >= 100 && value.budget <= 1_000_000
    && typeof value.guests === "number" && Number.isInteger(value.guests) && value.guests >= 1 && value.guests <= 10_000
    && isText(value.style, 120)
    && isText(value.notes, 1_000);
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI planning isn’t configured yet. Add GEMINI_API_KEY to your deployment environment and try again." },
      { status: 503 },
    );
  }

  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: "Please submit valid event details." }, { status: 400 });
  }

  if (!isPlanRequest(input)) {
    return NextResponse.json({ error: "Some event details are missing or invalid. Please check the form and try again." }, { status: 400 });
  }

  const prompt = `You are Gatherly, a thoughtful and practical event planner. Create a warm, specific, realistic event plan using the details below. Stay within the total budget. All amounts are USD. Make the budget categories add up to the total budget, including a contingency category. Tailor the timeline to the event date if provided; otherwise use relative planning steps.

Event type: ${input.eventType}
Event name: ${input.eventName || "Not specified"}
Date: ${input.date || "Not specified"}
Location: ${input.location || "Not specified"}
Total budget: $${input.budget}
Guest count: ${input.guests}
Style: ${input.style || "Open to ideas"}
Additional notes: ${input.notes || "None"}

Return only a JSON object with this exact structure:
{
  "summary": "A concise, personal 1-2 sentence description",
  "budgetBreakdown": [{"category": "Category name", "amount": 123}],
  "timeline": [{"timing": "When", "title": "Milestone", "detail": "Practical next step"}],
  "vendorChecklist": [{"name": "Vendor or service", "priority": "Essential"}],
  "ideas": [{"title": "Personalized idea", "detail": "How to make it happen"}]
}
Provide 6-8 budget categories, 4-6 timeline steps, 6-10 vendors, and 3 personalized ideas. Vendor priority must be either "Essential" or "Helpful".`;

  let providerResponse: Response;
  try {
    providerResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.7, maxOutputTokens: 4096 },
        }),
        signal: AbortSignal.timeout(25_000),
      },
    );
  } catch {
    return NextResponse.json(
      { error: "We couldn’t reach the planning assistant right now. Please try again in a moment." },
      { status: 502 },
    );
  }

  if (!providerResponse.ok) {
    console.error("Gemini planning request failed with status", providerResponse.status);
    return NextResponse.json(
      { error: "The planning assistant is temporarily unavailable. Please try again shortly." },
      { status: 502 },
    );
  }

  let providerResult: unknown;
  try {
    providerResult = await providerResponse.json();
  } catch {
    return NextResponse.json({ error: "The planning assistant returned an unreadable response. Please try again." }, { status: 502 });
  }
  if (!isRecord(providerResult) || !Array.isArray(providerResult.candidates)) {
    console.error("Gemini planning response did not contain candidates.");
    return NextResponse.json({ error: "The planning assistant returned an unexpected response. Please try again." }, { status: 502 });
  }

  const candidate = providerResult.candidates[0];
  if (!isRecord(candidate) || !isRecord(candidate.content) || !Array.isArray(candidate.content.parts)) {
    return NextResponse.json({ error: "The planning assistant didn’t finish your plan. Please try again." }, { status: 502 });
  }

  const textPart = candidate.content.parts.find(
    (part: unknown) => isRecord(part) && typeof part.text === "string",
  );
  if (!isRecord(textPart) || typeof textPart.text !== "string") {
    return NextResponse.json({ error: "The planning assistant returned an empty plan. Please try again." }, { status: 502 });
  }

  let plan: unknown;
  try {
    plan = JSON.parse(textPart.text);
  } catch {
    return NextResponse.json({ error: "The planning assistant returned an unreadable plan. Please try again." }, { status: 502 });
  }

  if (!isPlan(plan)) {
    return NextResponse.json({ error: "The planning assistant returned an incomplete plan. Please try again." }, { status: 502 });
  }

  const generatedTotal = plan.budgetBreakdown.reduce((sum, item) => sum + item.amount, 0);
  if (generatedTotal <= 0) {
    return NextResponse.json({ error: "The planning assistant returned an invalid budget. Please try again." }, { status: 502 });
  }

  const budgetBreakdown = plan.budgetBreakdown.map((item) => ({
    ...item,
    amount: Math.round((item.amount / generatedTotal) * input.budget * 100) / 100,
  }));
  const roundingDifference =
    Math.round((input.budget - budgetBreakdown.reduce((sum, item) => sum + item.amount, 0)) * 100) / 100;
  const largestCategory = budgetBreakdown.reduce(
    (largest, item, index, items) => item.amount > items[largest].amount ? index : largest,
    0,
  );
  budgetBreakdown[largestCategory].amount += roundingDifference;

  return NextResponse.json({ plan: { ...plan, budgetBreakdown } });
}
