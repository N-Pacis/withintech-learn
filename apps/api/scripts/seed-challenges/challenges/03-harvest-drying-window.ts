import { randInts, type ChallengeDraft } from "../types";

function solve(rainMm: number[], days: number, maxRain: number): number {
  let run = 0;
  for (let i = 0; i < rainMm.length; i++) {
    run = rainMm[i] <= maxRain ? run + 1 : 0;
    if (run === days) return i - days + 1;
  }
  return -1;
}

/** A long, mostly rainy forecast whose only qualifying window sits near the end. */
function longForecast(): number[] {
  const rain = randInts(3301, 30000, 0, 40).map((mm, i) => (i % 97 === 0 ? 30 : mm));
  // Exactly 5000 dry days (24000..28999), walled in by heavy rain on both sides.
  for (let i = 24000; i < 29000; i++) rain[i] = i % 3;
  rain[23999] = 35;
  rain[29000] = 35;
  return rain;
}

export const harvestDryingWindow: ChallengeDraft = {
  title: "Drying Window for the Harvest",
  difficulty: "medium",
  description: `
<p>After harvest, a maize cooperative spreads its grain on tarpaulins to sun-dry. If it rains heavily on any of those days, the maize stays damp and can grow mould, so the cooperative needs an unbroken run of dry days.</p>
<p><strong>You are given:</strong></p>
<ul>
<li><code>rainMm</code>: the forecast rainfall in mm for each day, starting from day 0</li>
<li><code>days</code>: how many consecutive days the drying needs (at least 1)</li>
<li><code>maxRain</code>: the most rain in mm a day can have and still count as a drying day</li>
</ul>
<p><strong>Rules:</strong></p>
<ol>
<li>A window is <code>days</code> consecutive days, each with rain ≤ <code>maxRain</code>.</li>
<li>Pick the window that starts earliest.</li>
<li>If no window exists, return <code>-1</code>.</li>
</ol>
<p><strong>Return the 0-based index of the first day of the window.</strong></p>
<p>Forecasts can be long (tens of thousands of days in a historical study), so re-checking every window from scratch will be too slow.</p>`,
  functionParams: [
    { name: "rainMm", type: "int[]" },
    { name: "days", type: "int" },
    { name: "maxRain", type: "int" },
  ],
  returnType: "int",
  solve,
  visible: [
    [[12, 0, 1, 25, 0, 0, 2, 0, 9], 3, 2],
    [[5, 18, 4, 30], 2, 4],
  ],
  hidden: [
    [[], 1, 5],
    [[3], 1, 3],
    [[4], 1, 3],
    [[0, 0, 0, 0], 4, 0],
    [[0, 0, 7, 0, 0, 0], 3, 5],
    [[9, 9, 0, 0, 9, 0, 0, 0], 3, 0],
    [longForecast(), 5000, 2],
    [longForecast(), 5001, 2],
  ],
};
