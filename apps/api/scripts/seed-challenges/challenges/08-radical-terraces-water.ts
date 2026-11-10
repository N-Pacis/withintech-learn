import { randInts, type ChallengeDraft } from "../types";

function solve(heights: number[]): number {
  let left = 0;
  let right = heights.length - 1;
  let leftMax = 0;
  let rightMax = 0;
  let water = 0;
  while (left < right) {
    if (heights[left] <= heights[right]) {
      leftMax = Math.max(leftMax, heights[left]);
      water += leftMax - heights[left];
      left++;
    } else {
      rightMax = Math.max(rightMax, heights[right]);
      water += rightMax - heights[right];
      right--;
    }
  }
  return water;
}

export const radicalTerracesWater: ChallengeDraft = {
  title: "Water Held by Radical Terraces",
  difficulty: "hard",
  description: `
<p>Many Rwandan hillsides are cut into <strong>radical terraces</strong>: steps with raised earth bunds that hold rainwater on the field instead of letting it run off and wash the soil downhill. An agronomist modelling a slope wants to know how much water a cross-section holds after a heavy storm.</p>
<p><strong>You are given:</strong></p>
<ul>
<li><code>heights</code>: the ground height of each 1-metre column across the slope, from one side to the other</li>
</ul>
<p><strong>Rules:</strong></p>
<ol>
<li>Rain fills every dip until the water would spill over its lower side.</li>
<li>Water above a column can rise only to the <strong>lower</strong> of the tallest point on its left and the tallest point on its right.</li>
<li>Water flows off both ends of the cross-section.</li>
</ol>
<p><strong>Return the total units of water held</strong> (one unit = one column 1 unit high).</p>
<p>Survey lines can have 50,000 columns. Aim for one or two passes over the array, not a scan left and right from every column.</p>`,
  functionParams: [{ name: "heights", type: "int[]" }],
  returnType: "int",
  solve,
  visible: [
    [[3, 0, 2, 0, 4]],
    [[5, 4, 3, 2, 1]],
  ],
  hidden: [
    [[]],
    [[7]],
    [[2, 2]],
    [[4, 2, 0, 3, 2, 5]],
    [[1, 0, 1, 0, 1, 0, 1]],
    [[0, 6, 1, 1, 1, 6, 0, 3, 0, 3]],
    [randInts(8801, 50000, 0, 1000)],
    [Array.from({ length: 50000 }, (_, i) => (i === 0 || i === 49999 ? 1000 : i % 50))],
  ],
};
