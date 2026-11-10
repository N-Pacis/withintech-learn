import { randInts, type ChallengeDraft } from "../types";

function solve(elevations: number[]): number {
  let climb = 0;
  for (let i = 1; i < elevations.length; i++) {
    const step = elevations[i] - elevations[i - 1];
    if (step > 0) climb += step;
  }
  return climb;
}

export const tourDuRwandaClimb: ChallengeDraft = {
  title: "Tour du Rwanda: Total Climb",
  difficulty: "easy",
  description: `
<p>In the land of a thousand hills, a Tour du Rwanda stage is rarely flat. Riders care less about the finish altitude than about <strong>how much climbing</strong> they do on the way.</p>
<p>A GPS unit records the road's elevation in metres once every kilometre.</p>
<p><strong>You are given:</strong></p>
<ul>
<li><code>elevations</code>: elevations in metres, in the order the riders pass them</li>
</ul>
<p><strong>Rules:</strong></p>
<ol>
<li>Every time the road goes up from one point to the next, add that rise to the total.</li>
<li>Descents do not cancel climbs: going down 100 m and back up 100 m is still 100 m of climbing.</li>
<li>A stage with fewer than two points has no climbing.</li>
</ol>
<p><strong>Return the total ascent in metres.</strong></p>`,
  functionParams: [{ name: "elevations", type: "int[]" }],
  returnType: "int",
  solve,
  visible: [
    [[1500, 1620, 1580, 1700, 1650]],
    [[2200, 2100, 1900, 1550]],
  ],
  hidden: [
    [[]],
    [[1567]],
    [[1400, 1400, 1400]],
    [[1000, 1100, 1000, 1100, 1000, 1100]],
    [[1350, 1480, 1702, 1890, 2050, 2297]],
    [randInts(2201, 2000, 1300, 2500)],
  ],
};
