import type { ChallengeDraft } from "../types";

const DISTRICT_ORDER = ["KN", "KG", "KK"];
const VALID = /^(KN|KG|KK) ([1-9][0-9]*) (St|Ave|Rd)$/;

function solve(addresses: string[]): string[] {
  const valid: { text: string; district: number; num: number }[] = [];
  const invalid: string[] = [];
  for (const text of addresses) {
    const m = VALID.exec(text);
    if (!m) { invalid.push(text); continue; }
    valid.push({ text, district: DISTRICT_ORDER.indexOf(m[1]), num: Number(m[2]) });
  }
  valid.sort((a, b) =>
    a.district - b.district ||
    a.num - b.num ||
    (a.text < b.text ? -1 : a.text > b.text ? 1 : 0),
  );
  return [...valid.map((v) => v.text), ...invalid];
}

export const kigaliStreetAddresses: ChallengeDraft = {
  title: "Sort Kigali Street Addresses",
  difficulty: "medium",
  description: `
<p>Kigali's street addresses carry their district in the prefix: <code>KN</code> is Nyarugenge, <code>KG</code> is Gasabo and <code>KK</code> is Kicukiro. They look like <code>KG 11 Ave</code> or <code>KN 5 Rd</code>. A delivery company wants its daily drop list grouped by district and in street order so riders don't zig-zag across town.</p>
<p><strong>You are given:</strong></p>
<ul>
<li><code>addresses</code>: street names typed in by customers</li>
</ul>
<p><strong>An address is valid when it is exactly</strong> <code>&lt;prefix&gt; &lt;number&gt; &lt;type&gt;</code> with single spaces, where the prefix is <code>KN</code>, <code>KG</code> or <code>KK</code>, the number is a positive integer with no leading zero, and the type is <code>St</code>, <code>Ave</code> or <code>Rd</code>.</p>
<p><strong>Rules:</strong></p>
<ol>
<li>Valid addresses come first, sorted by district in the order <strong>KN, KG, KK</strong>, then by street number <strong>as a number</strong> (<code>KG 2 Ave</code> before <code>KG 11 Ave</code>), then by the full text in character-code order.</li>
<li>Invalid addresses go at the end, in the order they were given.</li>
<li>Keep duplicates.</li>
</ol>
<p><strong>Return the sorted list.</strong></p>`,
  functionParams: [{ name: "addresses", type: "string[]" }],
  returnType: "string[]",
  solve,
  visible: [
    [["KG 11 Ave", "KN 5 Rd", "KG 2 Ave", "KK 15 Rd"]],
    [["KK 3 St", "kg 7 Ave", "KN 3 St", "KG 9 Rd"]],
  ],
  hidden: [
    [[]],
    [["KN 1 St"]],
    [["KG 11 St", "KG 11 Ave", "KG 11 Rd"]],
    [["KG 100 Ave", "KG 20 Ave", "KG 3 Ave", "KG 1000 Ave"]],
    [["KG 011 Ave", "KG 11 Ave", "KG 0 St", "KX 4 Rd"]],
    [["KG 5 Road", "KG  5 Rd", "KN 2 St", "KN 2 St"]],
    [["KK 500 St", "KN 82 St", "KG 1 Rd", "Kimironko", "KN 7 Rd", "KK 18 Ave", "KG 563 St", "KN 82 Ave"]],
  ],
};
