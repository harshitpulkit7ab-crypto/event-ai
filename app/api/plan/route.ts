import { NextResponse } from "next/server";

const eventTypes = new Set(["Wedding", "Birthday", "Community"]);

type PlanRequest = {
  eventType: "Wedding" | "Birthday" | "Community";
  eventName: string;
  date: string;
  location: string;
  budget: number;
  guests: number;
  style: string;
  notes: string;
};

type Plan = {
  summary: string;
  budgetBreakdown: { category: string; amount: number }[];
  timeline: { timing: string; title: string; detail: string }[];
  vendorChecklist: { name: string; priority: "Essential" | "Helpful" }[];
  ideas: { title: string; detail: string }[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isText(value: unknown, maximumLength = 500): value is string {
  return typeof value === "string" && value.length <= maximumLength;
}

function isPlanRequest(value: unknown): value is PlanRequest {
  if (!isRecord(value) || typeof value.eventType !== "string" || !eventTypes.has(value.eventType)) return false;
  const dateIsValid =
    isText(value.date, 10)
    && (value.date === "" || (
      /^\d{4}-\d{2}-\d{2}$/.test(value.date)
      && !Number.isNaN(Date.parse(`${value.date}T12:00:00`))
      && new Date(`${value.date}T12:00:00`).toISOString().slice(0, 10) === value.date
    ));

  return isText(value.eventName, 100)
    && dateIsValid
    && isText(value.location, 100)
    && typeof value.budget === "number" && Number.isInteger(value.budget) && value.budget >= 100 && value.budget <= 1_000_000
    && typeof value.guests === "number" && Number.isInteger(value.guests) && value.guests >= 1 && value.guests <= 10_000
    && isText(value.style, 120)
    && isText(value.notes, 1_000);
}

const budgetCategories = {
  Wedding: [
    { category: "Venue & rentals", share: 0.27 },
    { category: "Food & drinks", share: 0.25 },
    { category: "Photography", share: 0.1 },
    { category: "Flowers & styling", share: 0.09 },
    { category: "Music & entertainment", share: 0.07 },
    { category: "Attire & beauty", share: 0.07 },
    { category: "Invitations & details", share: 0.05 },
    { category: "Contingency", share: 0.1 },
  ],
  Birthday: [
    { category: "Venue & setup", share: 0.2 },
    { category: "Food & drinks", share: 0.25 },
    { category: "Decorations", share: 0.12 },
    { category: "Cake & dessert", share: 0.08 },
    { category: "Entertainment", share: 0.12 },
    { category: "Invitations", share: 0.05 },
    { category: "Rentals & supplies", share: 0.08 },
    { category: "Contingency", share: 0.1 },
  ],
  Community: [
    { category: "Venue & permits", share: 0.2 },
    { category: "Food & refreshments", share: 0.25 },
    { category: "Equipment & supplies", share: 0.15 },
    { category: "Activities & entertainment", share: 0.12 },
    { category: "Accessibility", share: 0.08 },
    { category: "Promotion & signage", share: 0.07 },
    { category: "Cleanup & waste", share: 0.05 },
    { category: "Contingency", share: 0.08 },
  ],
} satisfies Record<PlanRequest["eventType"], { category: string; share: number }[]>;

const eventDetails = {
  Wedding: {
    vendors: [
      ["Venue & rentals", "Essential"],
      ["Caterer & bar service", "Essential"],
      ["Photographer", "Essential"],
      ["Florist", "Essential"],
      ["Officiant", "Essential"],
      ["DJ or live music", "Helpful"],
      ["Hair & makeup artist", "Helpful"],
      ["Day-of coordinator", "Helpful"],
    ],
    ideas: [
      ["A table that tells your story", "Add handwritten place cards and family photos for a personal touch."],
      ["A seasonal local menu", "Ask your caterer to build the menu around ingredients from nearby farms."],
      ["A quiet golden-hour moment", "Leave time for sunset portraits and a breather together between celebrations."],
    ],
    milestones: [
      ["10–12 months before", "Set the date and find your venue", "Tour venues, confirm wet-weather options, and reserve your date."],
      ["6–8 months before", "Book your core team", "Secure catering, photography, flowers, and your ceremony officiant."],
      ["3–4 months before", "Make the day yours", "Choose the menu, send invitations, and plan music and personal details."],
      ["1 month before", "Tie up the little things", "Confirm the guest count, share the run-of-show, and check in with vendors."],
    ],
  },
  Birthday: {
    vendors: [
      ["Venue or party space", "Essential"],
      ["Food & drinks", "Essential"],
      ["Cake or dessert baker", "Essential"],
      ["Decorations & balloons", "Helpful"],
      ["DJ or playlist setup", "Helpful"],
      ["Photographer", "Helpful"],
      ["Tables, chairs & rentals", "Helpful"],
      ["Activity host or entertainer", "Helpful"],
    ],
    ideas: [
      ["A favorite-things table", "Invite guests to bring a photo or small story about the guest of honor."],
      ["A make-something-together station", "Set out a simple craft or shared playlist activity that suits the group."],
      ["The birthday person's greatest hits", "Build the playlist, menu, and decorations around things they genuinely love."],
    ],
    milestones: [
      ["4–6 weeks before", "Choose the place and guest list", "Set a date, book your space, and send a simple save-the-date."],
      ["2–3 weeks before", "Make the party feel personal", "Confirm food, cake, decorations, and one activity everyone can enjoy."],
      ["1 week before", "Check the details", "Confirm headcount, dietary needs, deliveries, and setup help."],
      ["The day before", "Set yourself up for fun", "Prepare decorations and a short setup list so you can enjoy the day."],
    ],
  },
  Community: {
    vendors: [
      ["Community venue & permits", "Essential"],
      ["Food & refreshments", "Essential"],
      ["Tables, chairs & shade", "Essential"],
      ["Accessibility & first aid", "Essential"],
      ["Sound equipment", "Helpful"],
      ["Local performers or activity hosts", "Helpful"],
      ["Printed signs & outreach", "Helpful"],
      ["Waste, recycling & cleanup", "Essential"],
    ],
    ideas: [
      ["A neighborhood welcome wall", "Invite guests to pin a favorite local spot or a welcome note for newcomers."],
      ["A local talent corner", "Ask nearby musicians, makers, or clubs to host a short, low-pressure activity."],
      ["A potluck with a little structure", "Share a signup sheet by dish type so there is a good mix for different diets."],
    ],
    milestones: [
      ["8–10 weeks before", "Pick a place and get permission", "Reserve an accessible venue and check permits, noise, and weather requirements."],
      ["4–6 weeks before", "Bring your neighbors in", "Share the event locally and invite volunteers, vendors, and activity hosts."],
      ["2 weeks before", "Make it comfortable for everyone", "Confirm food labels, access needs, shade, water, and first aid."],
      ["The week before", "Get the day-of crew ready", "Confirm setup, sound, cleanup, and a simple wet-weather plan."],
    ],
  },
} satisfies Record<
  PlanRequest["eventType"],
  {
    vendors: [string, "Essential" | "Helpful"][];
    ideas: [string, string][];
    milestones: [string, string, string][];
  }
>;

function createLocalPlan(input: PlanRequest): Plan {
  const categories = budgetCategories[input.eventType];
  const budgetBreakdown = categories.map((item) => ({
    category: item.category,
    amount: Math.round(input.budget * item.share * 100) / 100,
  }));
  const roundingDifference =
    Math.round((input.budget - budgetBreakdown.reduce((sum, item) => sum + item.amount, 0)) * 100) / 100;
  budgetBreakdown[budgetBreakdown.length - 1].amount += roundingDifference;

  const event = eventDetails[input.eventType];
  const styles = input.style.trim();
  const focus = input.notes.trim().split(/[.!?\n]/)[0]?.trim();
  const ideas = event.ideas.map(([title, detail], index) => {
    if (index === 0 && styles) {
      return { title: `${styles.charAt(0).toUpperCase()}${styles.slice(1)} details`, detail: `${detail} Let your ${styles.toLowerCase()} style guide the colors and finishing touches.` };
    }
    if (index === 1 && focus) {
      return { title: "Make room for what matters", detail: `Plan around your note: “${focus.slice(0, 140)}.” ${detail}` };
    }
    return { title, detail };
  });

  const eventDate = input.date ? new Date(`${input.date}T12:00:00`) : null;
  const dateOffsets = {
    Wedding: [330, 210, 105, 30],
    Birthday: [42, 17, 7, 1],
    Community: [63, 35, 14, 7],
  } satisfies Record<PlanRequest["eventType"], number[]>;
  const milestones = event.milestones.map(([timing, title, detail], index) => {
    if (!eventDate) return { timing, title, detail };
    const dueDate = new Date(eventDate);
    dueDate.setDate(dueDate.getDate() - dateOffsets[input.eventType][index]);
    const formattedDate = dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return { timing: formattedDate, title, detail };
  });

  const eventName = input.eventName.trim() || `Your ${input.eventType.toLowerCase()}`;
  const styleDescription = styles ? ` with a ${styles.toLowerCase()} feel` : "";
  const locationDescription = input.location.trim() ? ` in ${input.location.trim()}` : "";

  return {
    summary: `${eventName} is shaping up as a welcoming ${input.eventType.toLowerCase()} for ${input.guests} guests${locationDescription}${styleDescription}. Here’s a practical starting plan, tailored to your budget and the details you shared.`,
    budgetBreakdown,
    timeline: milestones,
    vendorChecklist: event.vendors.map(([name, priority]) => ({ name, priority })),
    ideas,
  };
}

export async function POST(request: Request) {
  let value: unknown;
  try {
    value = await request.json();
  } catch {
    return NextResponse.json({ error: "Please submit valid event details." }, { status: 400 });
  }

  if (!isPlanRequest(value)) {
    return NextResponse.json({ error: "Some event details are missing or invalid. Please check the form and try again." }, { status: 400 });
  }

  return NextResponse.json({ plan: createLocalPlan(value), mode: "built-in" });
}
