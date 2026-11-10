import type { CourseDraft } from "../types";
import { aiAssistedDevelopment } from "./ai-assisted-development";
import { htmlFoundations } from "./html-foundations";
import { versionControl } from "./version-control";

export const courses: CourseDraft[] = [aiAssistedDevelopment, versionControl, htmlFoundations];
