import type { Curriculum } from "./types";
import { gettingStarted } from "./modules/01-getting-started";
import { syntax } from "./modules/02-syntax";
import { variables } from "./modules/03-variables";
import { strings } from "./modules/04-strings";
import { operators } from "./modules/05-operators";
import { conditionals } from "./modules/06-conditionals";
import { loops } from "./modules/07-loops";
import { collections } from "./modules/08-collections";
import { functions } from "./modules/09-functions";
import { errorsAndFiles } from "./modules/10-errors-files";
import { finalExam } from "./final-exam";

// Module order is the order students must work through — each one assumes only
// what came before it. Changing the order here changes it in the database on
// the next run, so keep the dependency chain in mind:
//   1-2 running code and syntax → 3-5 values and operators →
//   6-7 control flow → 8 collections → 9 functions → 10 errors, files, modules
export const curriculum: Curriculum = {
  courseSlugContains: "python-for-beginners",
  modules: [
    gettingStarted,
    syntax,
    variables,
    strings,
    operators,
    conditionals,
    loops,
    collections,
    functions,
    errorsAndFiles,
  ],
  finalExam,
};
