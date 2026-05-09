# Routes

## Web Routes

| Route | Purpose |
| --- | --- |
| `/` | Landing page. |
| `/courses`, `/courses/[slug]` | Public course catalog and detail. |
| `/challenges`, `/challenges/[slug]` | Public challenge catalog and detail. |
| `/sign-in`, `/sign-up` | Auth entry points. |
| `/verify-email` | Email OTP verification. |
| `/forgot-password` | Password reset flow. |
| `/accept-invitation` | Invitation onboarding. |
| `/learn` | Student dashboard. |
| `/learn/courses/[slug]` | Student course entry. |
| `/learn/courses/[slug]/modules/[moduleId]` | Module content. |
| `/learn/courses/[slug]/modules/[moduleId]/lessons/[lessonId]` | Lesson content. |
| `/learn/courses/[slug]/quiz` | Course quiz. |
| `/learn/courses/[slug]/checkout` | Course/certificate payment. |
| `/learn/challenges/[slug]` | Coding workspace. |
| `/learn/certificates` | Student certificates. |
| `/admin` | Admin dashboard. |
| `/admin/courses` | Course management. |
| `/admin/challenges` | Challenge management. |
| `/admin/users`, `/admin/students`, `/admin/admins` | People management. |
| `/admin/enrollments`, `/admin/payments`, `/admin/invitations` | Operations pages. |

## API Route Groups

| Group | Examples |
| --- | --- |
| Auth | `/auth/login`, `/auth/signup`, `/auth/refresh`, `/auth/profile`, `/auth/google` |
| Public courses | `/public/courses`, `/public/courses/:slug`, `/public/courses/:slug/preview` |
| Public challenges | `/public/challenges`, `/public/challenges/:slug` |
| Student courses | `/student/courses`, `/student/courses/:slug`, progress endpoints |
| Student quizzes | `/student/quizzes/:quizId/attempt` |
| Student challenges | `/student/challenges`, submit, submissions |
| Certificates | `/student/certificates`, `/certificates/:userId/:courseSlug` |
| Admin courses | CRUD, publish, archive, thumbnail upload |
| Admin modules | CRUD, reorder, blocks, block image upload |
| Admin lessons | CRUD, reorder, blocks, block image upload |
| Admin quizzes | course/module/lesson quizzes, questions, options |
| Admin challenges | CRUD, publish, run, stats, test cases |
| Admin users | list, export, activate, deactivate, verify, import |
| Analytics | enrollment trend, top courses, retention, daily learners, challenge stats |
| Payments | initiate, status, admin list |
