import { spawn } from "node:child_process";
import assert from "node:assert/strict";

const port = 3100;
const origin = `http://127.0.0.1:${port}`;
const server = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", String(port)],
  {
    env: { ...process.env, GEMINI_API_KEY: "", NEXT_TELEMETRY_DISABLED: "1" },
    stdio: "ignore",
  },
);

function pause(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function waitForServer() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    if (server.exitCode !== null) throw new Error("The production server exited before becoming ready.");
    try {
      const response = await fetch(origin);
      if (response.ok) return;
    } catch {
      await pause(500);
      continue;
    }
    await pause(500);
  }
  throw new Error("The production server did not start in time.");
}

try {
  await waitForServer();

  const response = await fetch(`${origin}/api/plan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      eventType: "Birthday",
      eventName: "Riley's picnic",
      date: "",
      location: "Portland",
      budget: 2400,
      guests: 36,
      style: "Colorful and relaxed",
      notes: "Include a low-cost craft table.",
    }),
  });
  assert.equal(response.status, 200, "The planner should work without an API key.");

  const result = await response.json();
  assert.equal(result.mode, "built-in");
  assert.equal(result.plan.budgetBreakdown.reduce((sum, item) => sum + item.amount, 0), 2400);
  assert.equal(result.plan.timeline.length, 4);
  assert.equal(result.plan.vendorChecklist.length >= 6, true);
  assert.match(result.plan.ideas[0].title, /colorful and relaxed/i);
  assert.match(result.plan.ideas[1].detail, /low-cost craft table/i);

  const invalidResponse = await fetch(`${origin}/api/plan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventType: "Birthday" }),
  });
  assert.equal(invalidResponse.status, 400, "Invalid form submissions should be rejected.");

  console.log("Production planner smoke test passed without a Gemini API key.");
} finally {
  server.kill();
}
