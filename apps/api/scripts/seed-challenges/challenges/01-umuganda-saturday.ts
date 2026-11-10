import type { ChallengeDraft } from "../types";

function solve(year: number, month: number): number {
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const lastDow = new Date(Date.UTC(year, month - 1, daysInMonth)).getUTCDay(); // 0 = Sunday, 6 = Saturday
  return daysInMonth - ((lastDow - 6 + 7) % 7);
}

export const umugandaSaturday: ChallengeDraft = {
  title: "Which Saturday is Umuganda?",
  difficulty: "easy",
  description: `
<p>Umuganda, the national community work morning, takes place on the <strong>last Saturday of every month</strong>. A sector office wants to print the dates for next year's calendar.</p>
<p><strong>You are given:</strong></p>
<ul>
<li><code>year</code>: a year between 1900 and 2400</li>
<li><code>month</code>: 1 (January) to 12 (December)</li>
</ul>
<p><strong>Rules:</strong></p>
<ol>
<li>Find how many days the month has. February has 29 days in a leap year: divisible by 4, except centuries, unless divisible by 400 (2000 is leap, 2100 is not).</li>
<li>Find the weekday of the month's last day, then step back to the nearest Saturday (the last day itself counts).</li>
</ol>
<p><strong>Return the day of the month (an integer) on which Umuganda falls.</strong></p>
<p>Try it without your language's date library: Sakamoto's or Zeller's formula gives the weekday of any date.</p>`,
  functionParams: [
    { name: "year", type: "int" },
    { name: "month", type: "int" },
  ],
  returnType: "int",
  solve,
  visible: [
    [2026, 11],
    [2028, 2],
  ],
  hidden: [
    [2026, 2],
    [2024, 2],
    [2100, 2],
    [2000, 2],
    [2026, 1],
    [2025, 5],
    [2026, 12],
    [1994, 7],
    [2030, 8],
  ],
};
