"use client";

import { FormEvent, useState } from "react";

type EventType = "Wedding" | "Birthday" | "Community";

type PlanRequest = {
  eventType: EventType;
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

const initialForm: PlanRequest = {
  eventType: "Wedding",
  eventName: "A summer garden wedding",
  date: "",
  location: "Portland, Oregon",
  budget: 18000,
  guests: 85,
  style: "Garden party",
  notes: "",
};

const samplePlan: Plan = {
  summary:
    "A relaxed garden celebration with seasonal flowers, a long-table dinner, and thoughtful details that bring everyone together.",
  budgetBreakdown: [
    { category: "Venue & rentals", amount: 5400 },
    { category: "Food & drinks", amount: 4500 },
    { category: "Photography", amount: 1800 },
    { category: "Flowers & styling", amount: 1620 },
    { category: "Music & entertainment", amount: 1260 },
    { category: "Attire & beauty", amount: 1260 },
    { category: "Invitations & details", amount: 720 },
    { category: "Contingency", amount: 1440 },
  ],
  timeline: [
    {
      timing: "10–12 months before",
      title: "Set your date & find your venue",
      detail: "Tour garden venues, check wet-weather options, and reserve your date.",
    },
    {
      timing: "8–10 months before",
      title: "Book your core team",
      detail: "Secure your caterer, photographer, florist, and ceremony officiant.",
    },
    {
      timing: "4–6 months before",
      title: "Make the day yours",
      detail: "Choose your menu, send invitations, and plan music and personal touches.",
    },
    {
      timing: "1–2 months before",
      title: "Tie up the little things",
      detail: "Confirm headcount, share the run-of-show, and check in with every vendor.",
    },
  ],
  vendorChecklist: [
    { name: "Garden venue & rentals", priority: "Essential" },
    { name: "Caterer & bar service", priority: "Essential" },
    { name: "Photographer", priority: "Essential" },
    { name: "Florist", priority: "Essential" },
    { name: "Officiant", priority: "Essential" },
    { name: "DJ or live music", priority: "Helpful" },
    { name: "Hair & makeup artist", priority: "Helpful" },
    { name: "Day-of coordinator", priority: "Helpful" },
  ],
  ideas: [
    {
      title: "A table that tells your story",
      detail: "Mix bud vases with handwritten place cards and family photos from both sides.",
    },
    {
      title: "Local-seasonal menu",
      detail: "Ask your caterer to build the menu around what nearby farms are harvesting.",
    },
    {
      title: "Golden-hour garden stroll",
      detail: "Leave a little breathing room for sunset portraits and a quiet moment together.",
    },
  ],
};

const eventTypes: { name: EventType; icon: string }[] = [
  { name: "Wedding", icon: "♡" },
  { name: "Birthday", icon: "✳" },
  { name: "Community", icon: "⌂" },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function Home() {
  const [form, setForm] = useState(initialForm);
  const [plan, setPlan] = useState(samplePlan);
  const [checked, setChecked] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  const allocatedBudget = plan.budgetBreakdown.reduce((sum, item) => sum + item.amount, 0);
  const essentialCount = plan.vendorChecklist.filter(
    (item) => item.priority === "Essential",
  ).length;

  function updateForm<K extends keyof PlanRequest>(key: K, value: PlanRequest[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function generatePlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsGenerating(true);
    setError("");

    try {
      const response = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Your plan could not be generated. Please try again.");
      }

      setPlan(result.plan as Plan);
      setChecked([]);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Your plan could not be generated. Please try again.",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  function toggleChecklistItem(name: string) {
    setChecked((current) =>
      current.includes(name)
        ? current.filter((item) => item !== name)
        : [...current, name],
    );
  }

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#" aria-label="Gatherly home">
          <span className="brand-mark" aria-hidden="true">g</span>
          <span>gatherly<span className="brand-period">.</span></span>
        </a>
        <nav className="topnav" aria-label="Main navigation">
          <a href="#planner">The planner</a>
          <a href="#your-plan">Your plan</a>
        </nav>
        <a className="topbar-cta" href="#planner">Plan something lovely <span aria-hidden="true">↗</span></a>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-dot" /> A little help for a lot of love</div>
          <h1>Good things happen<br />when we <span>gather.</span></h1>
          <p>Big day, big birthday, or bringing your whole neighborhood together. Let’s make it feel like you.</p>
          <a className="primary-button hero-button" href="#planner">Let’s make a plan <span aria-hidden="true">↓</span></a>
          <div className="hero-note">
            <div className="avatar-stack" aria-hidden="true"><span>J</span><span>M</span><span>A</span><span>+</span></div>
            <span>Thoughtful plans, less overwhelm.</span>
          </div>
        </div>
        <div className="hero-art" aria-label="Illustration of a garden gathering">
          <div className="sun-disc" />
          <div className="art-note art-note-top"><span>✳</span> made for your kind of gathering</div>
          <div className="flower flower-one"><i /><i /><i /><i /><b /></div>
          <div className="flower flower-two"><i /><i /><i /><i /><b /></div>
          <div className="flower flower-three"><i /><i /><i /><i /><b /></div>
          <div className="arch">
            <div className="arch-inside">
              <span className="arch-ribbon">CELEBRATE THE GOOD</span>
              <div className="arch-table"><span>✿</span><span>◡</span><span>✿</span></div>
              <div className="arch-ground" />
            </div>
          </div>
          <div className="art-note art-note-bottom">a day to remember <span>✷</span></div>
          <div className="art-sparkle sparkle-one">✦</div>
          <div className="art-sparkle sparkle-two">✳</div>
        </div>
      </section>

      <section className="planner-section" id="planner">
        <div className="section-heading">
          <div><div className="eyebrow">YOUR VERY OWN PLANNING BUDDY</div><h2>Start with the feeling.</h2></div>
          <p>A few little details are all we need to dream up a plan that feels like yours.</p>
        </div>

        <div className="planner-grid">
          <form className="planner-card" onSubmit={generatePlan}>
            <div className="card-heading"><span className="step-number">01</span><div><h3>Tell us what you’re celebrating</h3><p>No spreadsheets required. Promise.</p></div></div>

            <fieldset className="event-type-group">
              <legend>What kind of gathering?</legend>
              <div className="event-type-options">
                {eventTypes.map((type) => (
                  <button
                    className={`event-type${form.eventType === type.name ? " selected" : ""}`}
                    key={type.name}
                    onClick={() => updateForm("eventType", type.name)}
                    type="button"
                    aria-pressed={form.eventType === type.name}
                  >
                    <span className="event-icon" aria-hidden="true">{type.icon}</span>
                    <span>{type.name}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            <label className="field-label" htmlFor="eventName">Give it a name <span>OPTIONAL</span></label>
            <input id="eventName" maxLength={100} onChange={(event) => updateForm("eventName", event.target.value)} placeholder="e.g. Maya’s 30th, Summer block party" value={form.eventName} />

            <div className="field-row">
              <div><label className="field-label" htmlFor="date">When’s the big day?</label><input id="date" onChange={(event) => updateForm("date", event.target.value)} type="date" value={form.date} /></div>
              <div><label className="field-label" htmlFor="location">Where are we gathering?</label><input id="location" maxLength={100} onChange={(event) => updateForm("location", event.target.value)} placeholder="City or neighborhood" value={form.location} /></div>
            </div>

            <div className="field-row">
              <div><label className="field-label" htmlFor="budget">Your happy budget</label><div className="input-with-prefix"><span>$</span><input id="budget" max={1000000} min={100} onChange={(event) => updateForm("budget", Number(event.target.value))} required type="number" value={form.budget} /></div></div>
              <div><label className="field-label" htmlFor="guests">How many lovely people?</label><div className="input-with-suffix"><input id="guests" max={10000} min={1} onChange={(event) => updateForm("guests", Number(event.target.value))} required type="number" value={form.guests} /><span>guests</span></div></div>
            </div>

            <label className="field-label" htmlFor="style">What’s the vibe? <span>THE MORE YOU TELL US, THE BETTER</span></label>
            <input id="style" maxLength={120} onChange={(event) => updateForm("style", event.target.value)} placeholder="e.g. cozy, colorful, laid-back, garden party" value={form.style} />

            <label className="field-label" htmlFor="notes">Anything else on your mind? <span>OPTIONAL</span></label>
            <textarea id="notes" maxLength={1000} onChange={(event) => updateForm("notes", event.target.value)} placeholder="Dietary needs, must-haves, things you’d rather skip..." rows={3} value={form.notes} />

            {error && <div className="error-message" role="alert">{error}</div>}
            <button className="primary-button generate-button" disabled={isGenerating} type="submit">
              {isGenerating ? <><span className="spinner" /> Dreaming up your plan…</> : <>Make my plan <span aria-hidden="true">✦</span></>}
            </button>
            <p className="privacy-note"><span aria-hidden="true">✿</span> Your details stay yours. We just use them to make your plan.</p>
          </form>

          <div className="plan-column" id="your-plan">
            <div className="plan-heading">
              <div><div className="eyebrow"><span className="live-dot" /> YOUR GATHERLY GAME PLAN</div><h3>{form.eventName || `${form.eventType} celebration`}</h3></div>
              <span className="plan-badge">A good place to start</span>
            </div>
            <p className="plan-summary">{plan.summary}</p>

            <section className="plan-panel budget-panel">
              <div className="panel-title"><span className="panel-icon budget-icon">◒</span><div><h4>Your feel-good budget</h4><p>Every dollar has a little purpose.</p></div><span className="budget-total">{formatCurrency(form.budget)}</span></div>
              <div className="budget-bar" role="img" aria-label={`Budget divided into ${plan.budgetBreakdown.length} categories`}>
                {plan.budgetBreakdown.map((item, index) => <span key={item.category} style={{ width: `${allocatedBudget > 0 ? (item.amount / allocatedBudget) * 100 : 0}%`, background: ["#d77b5f", "#83a58b", "#edbc72", "#a68daa", "#759a9d", "#e7a28b", "#b4a176", "#d9d4c8"][index % 8] }} />)}
              </div>
              <div className="budget-list">
                {plan.budgetBreakdown.map((item, index) => <div className="budget-item" key={item.category}><span className="budget-key" style={{ background: ["#d77b5f", "#83a58b", "#edbc72", "#a68daa", "#759a9d", "#e7a28b", "#b4a176", "#d9d4c8"][index % 8] }} />{item.category}<strong>{formatCurrency(item.amount)}</strong></div>)}
              </div>
              <div className="budget-footer"><span>Planned so far</span><strong>{formatCurrency(allocatedBudget)}</strong><span>of {formatCurrency(form.budget)}</span></div>
            </section>

            <section className="plan-panel timeline-panel">
              <div className="panel-title"><span className="panel-icon timeline-icon">◷</span><div><h4>A timeline that breathes</h4><p>Little steps, right on time.</p></div></div>
              <div className="timeline-list">
                {plan.timeline.map((item) => <div className="timeline-item" key={item.title}><div className="timeline-marker" /><div><span className="timeline-timing">{item.timing}</span><h5>{item.title}</h5><p>{item.detail}</p></div></div>)}
              </div>
            </section>

            <section className="plan-panel checklist-panel">
              <div className="panel-title"><span className="panel-icon checklist-icon">✓</span><div><h4>Your vendor wish list</h4><p>{checked.length} of {plan.vendorChecklist.length} checked off. Look at you go!</p></div><span className="checklist-count">{essentialCount} essentials</span></div>
              <div className="vendor-list">
                {plan.vendorChecklist.map((item) => <label className={`vendor-item${checked.includes(item.name) ? " completed" : ""}`} key={item.name}><input checked={checked.includes(item.name)} onChange={() => toggleChecklistItem(item.name)} type="checkbox" /><span className="custom-checkbox" />{item.name}<span className={`priority-tag ${item.priority.toLowerCase()}`}>{item.priority}</span></label>)}
              </div>
            </section>

            <section className="idea-section">
              <div className="idea-heading"><span aria-hidden="true">✦</span><div><h4>A few ideas, just for you</h4><p>Little touches make big memories.</p></div></div>
              {plan.ideas.map((idea, index) => <article className="idea-card" key={idea.title}><span className="idea-number">0{index + 1}</span><div><h5>{idea.title}</h5><p>{idea.detail}</p></div><span className="idea-sparkle" aria-hidden="true">✳</span></article>)}
            </section>
          </div>
        </div>
      </section>

      <footer className="footer"><a className="brand footer-brand" href="#"><span className="brand-mark" aria-hidden="true">g</span><span>gatherly<span className="brand-period">.</span></span></a><span>Made for bringing people a little closer. <span aria-hidden="true">♡</span></span><a href="#planner">Back to your plan ↑</a></footer>
    </main>
  );
}
