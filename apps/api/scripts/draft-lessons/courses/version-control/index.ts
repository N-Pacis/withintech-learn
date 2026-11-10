import type { CourseDraft } from "../../types";
import { lesson as l01 } from "./01-intro";
import { lesson as l02 } from "./02-first-repo";
import { lesson as l03 } from "./03-working-with-files";
import { lesson as l04 } from "./04-undo";
import { lesson as l05 } from "./05-branching";
import { lesson as l06 } from "./06-merging";
import { lesson as l07 } from "./07-remotes";
import { lesson as l08 } from "./08-push-pull";
import { lesson as l09 } from "./09-collaboration";
import { lesson as l10 } from "./10-good-practices";

export const versionControl: CourseDraft = {
  key: "git",
  courseSlug: "version-control-1773661561862",
  lessons: [l01, l02, l03, l04, l05, l06, l07, l08, l09, l10],
};
