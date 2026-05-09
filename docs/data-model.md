# Data Model

## Main Entities

| Entity | Meaning |
| --- | --- |
| `User` | Student or admin account. Stores auth state, score, OTP, and profile data. |
| `Role` | Role lookup used by users. |
| `Course` | Learning product with status, pricing, modules, quiz, enrollments, payments, certificates. |
| `Module` | Ordered course section. Can contain blocks, lessons, quiz, and progress. |
| `Lesson` | Ordered module content. Can contain blocks, quiz, and progress. |
| `Quiz` | Assessment attached to a course, module, or lesson. |
| `Question` | Ordered quiz question. |
| `QuestionOption` | Answer choice with correctness flag. |
| `StudentCourse` | Enrollment join table with status. |
| `Certificate` | Completion proof for a user and course. |
| `Payment` | Xentripay payment record for course access or certificate. |
| `Challenge` | Coding challenge with starter code, signature metadata, and test cases. |
| `ChallengeSubmission` | User code result for a challenge. |
| `ChallengeProgress` | Completion marker for a challenge. |

## Important Constraints

- `User.email`, `Course.slug`, `Challenge.slug`, and `Payment.xentripayRefId` are unique.
- Course/module/lesson order uses `orderIndex`.
- Module and lesson blocks are unique by parent and `orderIndex`.
- Certificate is unique by user and course.
- Challenge progress is unique by user and challenge.

## Progress Records

| Record | Created when |
| --- | --- |
| `LessonProgress` | Student completes a lesson. |
| `ModuleProgress` | Student completes a module. |
| `StudentCourse.status = PASSED` | Student satisfies course completion rules. |
| `Certificate` | Student earns course proof of completion. |
| `ChallengeProgress` | Student gets an accepted challenge submission. |

## Status Enums

| Enum | Values |
| --- | --- |
| Course status | `draft`, `published`, `archived` |
| Course access | `FREE`, `PAID_COURSE`, `PAID_CERTIFICATE` |
| Enrollment | `PENDING`, `ENROLLED`, `PASSED` |
| Payment | `PENDING`, `PAID`, `FAILED`, `EXPIRED` |
| Challenge | `draft`, `published` |
| Submission | `accepted`, `wrong_answer`, `time_limit_exceeded`, `runtime_error`, `compile_error` |
