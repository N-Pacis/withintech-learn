# Workflows

## Student Enrollment

1. Student signs up, verifies email, or accepts an invitation.
2. Student opens a published course.
3. Free courses can be enrolled directly.
4. Paid courses go through checkout and Xentripay.
5. API creates or updates `StudentCourse`.
6. Web redirects into `/learn/courses/[slug]`.

## Course Completion

1. Student reads module and lesson content.
2. Web calls progress endpoints for lessons and modules.
3. Course quiz becomes available when required content is complete.
4. Passing quiz updates progress and can create certificate eligibility.
5. Certificate record is unique per user and course.

## Challenge Submission

1. Student opens `/learn/challenges/[slug]`.
2. Web sends language and code to student challenge submit route.
3. API loads challenge, starter metadata, and test cases.
4. Executor sends code to Judge0.
5. API stores `ChallengeSubmission`.
6. Accepted submissions create `ChallengeProgress` and update score.

## Admin Content Publishing

1. Admin creates a course in draft.
2. Admin adds modules, lessons, blocks, and quizzes.
3. Admin uploads images when content needs media.
4. Admin publishes the course.
5. Public and student course lists can show the course.

## Student Import

1. Admin uploads `.xlsx`, `.xls`, or `.csv`.
2. API accepts up to 500 rows and 10MB.
3. Required fields are first name, last name, and email.
4. API creates students and reports created, skipped, and failed rows.

## Payment

1. Web calls `/payments/initiate`.
2. API creates a `Payment` with Xentripay reference.
3. Student completes provider flow.
4. Web checks `/payments/status/:txId`.
5. Paid course access or certificate access is unlocked.
