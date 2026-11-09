import type { CourseDraft } from "../../types";
import { lesson as l01 } from "./01-introduction";
import { lesson as l02 } from "./02-setup";
import { lesson as l03 } from "./03-prompting";
import { lesson as l04 } from "./04-everyday-coding";
import { lesson as l05 } from "./05-debugging";
import { lesson as l06 } from "./06-testing";
import { lesson as l07 } from "./07-refactoring";
import { lesson as l08 } from "./08-documentation";
import { lesson as l09 } from "./09-agents";

export const aiAssistedDevelopment: CourseDraft = {
  key: "ai",
  courseSlug: "ai-assisted-development-1773768627045",
  lessons: [l01, l02, l03, l04, l05, l06, l07, l08, l09],
};
