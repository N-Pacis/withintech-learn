import type { ChallengeDraft } from "../types";

const TIERS = [
  { upTo: 20, price: 89 },
  { upTo: 50, price: 212 },
  { upTo: Infinity, price: 249 },
];

function solve(usedKwh: number, money: number): number {
  let used = usedKwh;
  let left = money;
  let bought = 0;
  for (const tier of TIERS) {
    if (used >= tier.upTo) continue;
    const room = tier.upTo - used;
    const affordable = Math.floor(left / tier.price);
    const take = Math.min(room, affordable);
    bought += take;
    used += take;
    left -= take * tier.price;
    if (take < room) break; // ran out of money inside this tier
  }
  return bought;
}

export const cashPowerTiers: ChallengeDraft = {
  title: "Cash Power Tokens Across Tiers",
  difficulty: "medium",
  description: `
<p>Households buy prepaid electricity ("Cash Power") as tokens. Residential prices rise with how much a household has already bought <strong>this month</strong>, so the same 5,000 RWF buys fewer kWh at the end of the month than at the start.</p>
<p>Use these rates for this exercise:</p>
<ul>
<li>the first 20 kWh of the month: <strong>89 RWF/kWh</strong></li>
<li>kWh 21 to 50: <strong>212 RWF/kWh</strong></li>
<li>every kWh after the first 50: <strong>249 RWF/kWh</strong></li>
</ul>
<p><strong>You are given:</strong></p>
<ul>
<li><code>usedKwh</code>: kWh the household already bought earlier this month</li>
<li><code>money</code>: RWF they are spending now</li>
</ul>
<p><strong>Rules:</strong></p>
<ol>
<li>Tokens are sold in whole kWh only. Leftover francs that cannot buy a full kWh are returned.</li>
<li>Each kWh is priced by the tier it falls in, counting from <code>usedKwh</code>. One purchase can cross into a higher tier, or two.</li>
</ol>
<p><strong>Return the number of kWh the household receives.</strong></p>
<p>Amounts can reach the hundreds of millions of RWF (a factory's monthly purchase), so work out each tier at once rather than buying 1 kWh at a time.</p>`,
  functionParams: [
    { name: "usedKwh", type: "int" },
    { name: "money", type: "int" },
  ],
  returnType: "int",
  solve,
  visible: [
    [0, 1000],
    [15, 5000],
  ],
  hidden: [
    [0, 0],
    [0, 88],
    [0, 1780],
    [0, 1781],
    [20, 212],
    [48, 600],
    [0, 8140],
    [60, 10000],
    [10, 900000000],
  ],
};
