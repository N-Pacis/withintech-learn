# Enforce Course → Module → Lesson → LessonBlock hierarchy

## Goal
Remove the ability to attach content blocks directly to a Module (`ModuleBlock`), forcing all module content through a Lesson, add a publish-time rule that a Module must have at least one Lesson, and fix the admin module-creation wizard so it can no longer be used to skip lessons.

## What was read
- `apps/api/prisma/schema.prisma` — full schema, confirmed `Module` has both `blocks: ModuleBlock[]` and `lessons: Lesson[]`.
- `apps/api/src/routes/admin/modules.service.ts`, `modules.controller.ts`, `modules.routes.ts`, `modules.schemas.ts` — module + module-block CRUD.
- `apps/api/src/services/course-cache.service.ts` — Redis caching of course/module/lesson content.
- `apps/api/src/routes/student/courses.service.ts` (`getStudentModule`) — student-facing module read.
- `apps/api/src/routes/admin/courses.service.ts` (`getCourse`, `publishCourse`) — publish-time validation currently allows either module blocks or lesson blocks.
- `apps/api/scripts/seed.ts` — pattern for one-off data scripts.
- `apps/api/prisma/migrations/*` — confirmed `ModuleBlock` predates `Lesson`/`LessonBlock`.
- Web: `app/admin/courses/[courseId]/modules/[moduleId]/page.tsx`, `components/admin/ModuleBlocksEditor.tsx`, `components/admin/LessonBlocksEditor.tsx`, `hooks/queries/modules.ts`, `hooks/queries/courses.ts`, `app/learn/courses/[slug]/modules/[moduleId]/page.tsx`.
- Web: `app/admin/courses/[courseId]/modules/new/page.tsx` (module creation wizard — 4 steps: Module Info → Content Blocks → Lessons → Quiz), `app/admin/courses/[courseId]/components/ModuleCards.tsx` (links to the wizard), `components/admin/LessonEditor.tsx` (already has its own lesson empty-state, reused for gating).
- Queried the local dev Postgres DB directly (read-only): 0 `ModuleBlock` rows exist locally.

## Assumptions (confirmed with the user)
- Production has real `ModuleBlock` content that must be migrated, not discarded — a backfill script is required.
- Full removal of `ModuleBlock` (not soft deprecation) is the intended enforcement.
- Add a publish-time rule: a Course can't be published if any Module has zero Lessons.
- Migrated content becomes a single new Lesson per affected Module, titled after the module, placed first (existing lessons shift down).
- The module-creation wizard drops its "Content Blocks" step entirely and gates the "Next: Quiz" button on the Lessons step until at least one lesson exists — quiz itself stays optional (unchanged product rule).

## Files that change
See `C:\Users\bruce\.claude\plans\flickering-herding-tarjan.md` for the full file-by-file breakdown (backend: schema, modules service/controller/routes/schemas, course-cache service, student courses service, admin courses service, swagger.json, new backfill script; frontend: admin module page, ModuleBlocksEditor + duplicate AddBlockForms/BlockCard deletion, modules query hooks, learn module page, courses query types).

## Security requirements
No new secrets or external calls involved. The backfill script uses the same `DATABASE_URL` as every other script (`prisma`/`db/prisma.ts`) — no credentials are introduced or logged.

## Acceptance criteria
- `ModuleBlock` model/table no longer exists after migration.
- No route, service, or UI can create a block directly on a Module — only on a Lesson.
- Publishing a course with a module that has zero lessons is rejected with a clear error.
- Existing module-only content (if any, in staging/prod) is preserved as a Lesson after running the backfill script.
- Student module page redirects straight to the first lesson (no direct-block rendering path left).
- The "Add Module" wizard has no Content Blocks step and cannot be finished past the Lessons step without at least one lesson.

## Checks to run
- `apps/api`: `npx tsc --noEmit`, `pnpm lint`.
- `apps/web`: `pnpm lint`, `pnpm build`.
- No automated test suite exists in this repo (per `AGENTS.md`) — verification is manual, see below.

## How to verify
1. Run the backfill script against a DB with a manually-created module-only block, confirm a Lesson + LessonBlock appear correctly ordered.
2. Run `npx prisma migrate dev` locally, confirm `pnpm dev` still starts cleanly.
3. Admin UI: open a module, confirm only "Lessons" and "Quiz" tabs exist.
4. Try publishing a course with an empty (lesson-less) module — confirm rejection.
5. Student UI: open a module, confirm it redirects into the first lesson.
6. Click "Add Module": confirm the wizard is Module Info → Lessons → Quiz, and "Next: Quiz" is disabled until a lesson is added.
