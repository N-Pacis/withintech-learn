# prompts/

This folder holds AI-drafted implementation plans, saved before code is written.

Convention:

1. For each feature or task, the AI writes a plan to `prompts/<short-feature-name>.md`.
2. The plan covers: goal, what it read, assumptions, files that will change, implementation requirements, security requirements, acceptance criteria, checks to run, and how to verify it — see the review checklist in the Vibe Engineering guide.
3. You review the plan and reply with a simple approval before any code is written.
4. Files are committed to git, so this folder doubles as a history of what was planned and approved for each feature.

See `AGENTS.md` at the repo root for the full workflow these plans are part of.
