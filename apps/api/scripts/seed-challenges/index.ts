import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });

import { prisma } from "../../src/db/prisma";
import redis from "../../src/db/redis";
import { PARAM_TYPES, generateStarterCode } from "../../src/routes/challenges.constants";
import { umugandaSaturday } from "./challenges/01-umuganda-saturday";
import { tourDuRwandaClimb } from "./challenges/02-tour-du-rwanda-climb";
import { harvestDryingWindow } from "./challenges/03-harvest-drying-window";
import { momoAgentFloat } from "./challenges/04-momo-agent-float";
import { nyabugogoLeaveWhenFull } from "./challenges/05-nyabugogo-leave-when-full";
import { cashPowerTiers } from "./challenges/06-cash-power-tiers";
import { kigaliStreetAddresses } from "./challenges/07-kigali-street-addresses";
import { radicalTerracesWater } from "./challenges/08-radical-terraces-water";
import type { Args, ChallengeDraft } from "./types";

// Add-only loader for drafted coding challenges.
//
//   node dist/scripts/seed-challenges/index.js            dry run: validate and print
//   node dist/scripts/seed-challenges/index.js --apply    create missing challenges as drafts
//   ... --dump <dir>                                       also write each test case to JSON (for cross-checking)
//
// Every expectedOutput is computed from the draft's reference solution.
// A challenge whose title already exists is skipped; nothing is ever updated or deleted.

const challenges: ChallengeDraft[] = [
  umugandaSaturday,
  tourDuRwandaClimb,
  harvestDryingWindow,
  momoAgentFloat,
  nyabugogoLeaveWhenFull,
  cashPowerTiers,
  kigaliStreetAddresses,
  radicalTerracesWater,
];

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const dumpDir = args.includes("--dump") ? args[args.indexOf("--dump") + 1] : undefined;

const INT32_MAX = 2_147_483_647;

interface BuiltTestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
  orderIndex: number;
}

/** Matches what the executor wrappers print: raw scalars, compact JSON arrays. */
function formatOutput(value: unknown): string {
  return Array.isArray(value) ? JSON.stringify(value) : String(value);
}

function checkInt(label: string, v: unknown, errors: string[]): void {
  if (typeof v !== "number" || !Number.isInteger(v) || Math.abs(v) > INT32_MAX) {
    errors.push(`${label}: ${String(v).slice(0, 40)} is not a 32-bit int`);
  }
}

function checkValue(label: string, type: string, v: unknown, errors: string[]): void {
  if (type === "int") return checkInt(label, v, errors);
  if (type === "string") {
    if (typeof v !== "string") errors.push(`${label}: expected string`);
    return;
  }
  if (type.endsWith("[]")) {
    if (!Array.isArray(v)) return void errors.push(`${label}: expected array`);
    const inner = type.slice(0, -2);
    v.forEach((item, i) => checkValue(`${label}[${i}]`, inner, item, errors));
    return;
  }
  errors.push(`${label}: unsupported type ${type}`);
}

function build(draft: ChallengeDraft): { testCases: BuiltTestCase[]; errors: string[] } {
  const errors: string[] = [];
  for (const p of draft.functionParams) {
    if (!PARAM_TYPES.includes(p.type)) errors.push(`param ${p.name}: unknown type ${p.type}`);
  }
  if (draft.visible.length < 2) errors.push("needs at least 2 visible test cases");
  if (draft.hidden.length < 5) errors.push("needs at least 5 hidden test cases");

  const all: { args: Args; isHidden: boolean }[] = [
    ...draft.visible.map((a) => ({ args: a, isHidden: false })),
    ...draft.hidden.map((a) => ({ args: a, isHidden: true })),
  ];
  const seen = new Set<string>();
  const testCases = all.map(({ args: a, isHidden }, orderIndex) => {
    const label = `${isHidden ? "hidden" : "visible"} #${orderIndex}`;
    if (a.length !== draft.functionParams.length) {
      errors.push(`${label}: ${a.length} args for ${draft.functionParams.length} params`);
    }
    draft.functionParams.forEach((p, i) => checkValue(`${label} ${p.name}`, p.type, a[i], errors));
    const input = JSON.stringify(a);
    if (seen.has(input)) errors.push(`${label}: duplicate input`);
    seen.add(input);
    const result = (draft.solve as (...x: unknown[]) => unknown)(...a.map((x) => structuredClone(x)));
    checkValue(`${label} result`, draft.returnType, result, errors);
    return { input, expectedOutput: formatOutput(result), isHidden, orderIndex };
  });
  return { testCases, errors };
}

function preview(s: string): string {
  return s.length > 60 ? `${s.slice(0, 57)}... (${s.length} chars)` : s;
}

async function main(): Promise<void> {
  let failed = false;
  const built = challenges.map((draft) => ({ draft, ...build(draft) }));

  for (const { draft, testCases, errors } of built) {
    console.log(`\n[${draft.difficulty}] ${draft.title}  (${testCases.length} test cases)`);
    for (const tc of testCases) {
      console.log(`  ${tc.isHidden ? "hidden " : "visible"} ${preview(tc.input)}  ->  ${preview(tc.expectedOutput)}`);
    }
    for (const e of errors) console.log(`  ERROR ${e}`);
    if (errors.length) failed = true;
  }

  if (dumpDir) {
    const fs = await import("fs");
    fs.mkdirSync(dumpDir, { recursive: true });
    for (const { draft, testCases } of built) {
      const file = path.join(dumpDir, `${draft.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.json`);
      fs.writeFileSync(file, JSON.stringify({ params: draft.functionParams, returnType: draft.returnType, testCases }));
    }
    console.log(`\nWrote test cases to ${dumpDir}`);
  }

  if (failed) throw new Error("Validation failed; nothing written.");
  if (!apply) {
    console.log("\nDry run. Re-run with --apply to create the challenges as drafts.");
    return;
  }

  const admin = await prisma.user.findFirst({
    where: { role: { name: "admin" } },
    orderBy: { createdAt: "asc" },
    select: { id: true, email: true },
  });
  if (!admin) throw new Error("No admin user found to own the challenges.");

  const last = await prisma.challenge.aggregate({ _max: { orderIndex: true } });
  let orderIndex = (last._max.orderIndex ?? 0) + 1;

  for (const { draft, testCases } of built) {
    const existing = await prisma.challenge.findFirst({ where: { title: draft.title }, select: { id: true } });
    if (existing) {
      console.log(`skip   ${draft.title} (already exists)`);
      continue;
    }
    const slugBase = draft.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const created = await prisma.challenge.create({
      data: {
        title: draft.title,
        slug: `${slugBase}-${Date.now()}`,
        description: draft.description.trim(),
        difficulty: draft.difficulty,
        status: "draft",
        starterCode: generateStarterCode(draft.functionParams, draft.returnType),
        functionParams: draft.functionParams as object[],
        returnType: draft.returnType,
        timeLimit: draft.timeLimit ?? 5,
        orderIndex: orderIndex++,
        createdById: admin.id,
        testCases: { create: testCases },
      },
      select: { number: true, slug: true },
    });
    console.log(`create #${created.number} ${created.slug} (${testCases.length} test cases, draft)`);
  }
}

main()
  .catch((err: unknown) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    redis.disconnect();
  });
