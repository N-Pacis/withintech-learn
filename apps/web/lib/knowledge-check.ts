export interface CheckQuestion {
  q: string;
  options: string[];
  /** 0-based index of the right option. */
  answer: number;
  /** Explanation shown after answering. */
  why: string;
}

const MARKER = "const QUESTIONS =";

function isQuestion(value: unknown): value is CheckQuestion {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.q === "string" &&
    v.q.trim().length > 0 &&
    Array.isArray(v.options) &&
    v.options.length >= 2 &&
    v.options.length <= 6 &&
    v.options.every((o) => typeof o === "string") &&
    typeof v.answer === "number" &&
    Number.isInteger(v.answer) &&
    v.answer >= 0 &&
    v.answer < v.options.length &&
    typeof v.why === "string"
  );
}

/**
 * Knowledge checks are stored as playground blocks whose JS starts with
 * `const QUESTIONS = [...]` (plain JSON). Returns the questions when the block
 * is one, or null so the caller falls back to the regular code playground.
 */
export function parseKnowledgeCheck(js?: string | null): CheckQuestion[] | null {
  if (!js) return null;
  const start = js.indexOf(MARKER);
  if (start === -1) return null;
  const open = js.indexOf("[", start + MARKER.length);
  if (open === -1) return null;

  // Walk to the matching "]" while skipping brackets inside JSON strings.
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = open; i < js.length; i++) {
    const ch = js[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === "[") depth++;
    else if (ch === "]" && --depth === 0) {
      try {
        const parsed: unknown = JSON.parse(js.slice(open, i + 1));
        if (!Array.isArray(parsed) || parsed.length === 0) return null;
        return parsed.every(isQuestion) ? parsed : null;
      } catch {
        return null;
      }
    }
  }
  return null;
}
