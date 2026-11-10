import type { FunctionParam } from "../../src/routes/challenges.constants";

export type ReturnType = "int" | "int[]" | "string" | "string[]";

/** One argument list, in functionParams order. */
export type Args = unknown[];

export interface ChallengeDraft {
  title: string;
  difficulty: "easy" | "medium" | "hard";
  /** Rich-text HTML shown on the challenge page. Visible test cases render as examples on their own. */
  description: string;
  functionParams: FunctionParam[];
  returnType: ReturnType;
  timeLimit?: number;
  /** Reference solution. Every expectedOutput is computed from it at seed time. */
  solve: (...args: never[]) => unknown;
  visible: Args[];
  hidden: Args[];
}

/** Deterministic PRNG so large hidden inputs are identical on every run. */
export function rng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randInts(seed: number, n: number, min: number, max: number): number[] {
  const r = rng(seed);
  return Array.from({ length: n }, () => min + Math.floor(r() * (max - min + 1)));
}
