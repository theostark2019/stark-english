# Stark Learning — reusable lesson submissions

The learning platform uses **one shared submission infrastructure** for every course, including AgroEnglish, Med-English and new programs.

## Runtime layout

- Next.js App Router for student and teacher experiences.
- Supabase Auth authenticates individual users.
- Supabase Postgres stores enrollments, teacher eligibility, assignments, attempts, responses, file references, and rubric reviews.
- Private Supabase Storage bucket `lesson-submissions` stores up to 50 MB evidence files.
- Server Components use authenticated Supabase clients; mutations are guarded by row-level security or validated Postgres RPCs.

## Submission workflow

1. Admin registers active teacher profiles and assigns lessons to enrolled students.
2. Student opens `/lessons/[assignment_id]`, which automatically creates a draft when needed, and sees the green lesson workspace.
3. Student reads the original material from `episodes.lesson_body`, practices in the corresponding lesson tab, writes responses (autosaved to `lesson_responses`), and uploads audio/files to the private attempt.
4. Student submits the attempt with `submit_lesson_attempt`. A complete response is required by the database function.
5. Eligible teacher finds it in `/teacher/reviews` and atomically claims it with `claim_lesson_attempt`.
6. Teacher reviews evidence against the per-episode assessment schema and sends feedback using `review_lesson_attempt`.
7. Student can revise after `revision_requested`, or sees the finalized feedback.

## Assignment routing

- `individual`: a particular active teacher.
- `group`: active members of the selected teacher group.
- `pool`: any active registered teacher.

Authorization is enforced in the database, not by choosing a link.

## Known limitations before student release

- The approved static **Agriculture 101** page remains separate as a reference only. The student-facing green LMS lesson renders pedagogical content already stored in `episodes.lesson_body` and saves its own fields directly; no copy/paste through a white submission form is required. This is a rebuilt native interface, not a byte-for-byte migration of every control on the original static page; test all exercises and mobile behaviors before release.
- Credits and `mastery` updates are **not yet** performed automatically when a teacher finalizes the lesson.
- Teacher group creation is available; group membership administration is not yet built.
- This repository is a reconstructed, independent Next.js baseline based on the available deployed project structure. It has **not** been verified to contain every file of the existing production app; do not overwrite production with it.
- Do not enable GitHub production auto-deploy or merge until preview builds, authenticated role tests and cross-user security tests have passed.
- A teacher profile and student enrollment are prerequisites; existing Supabase currently contains only one admin profile.

## Test cases

1. Unauthenticated user cannot view private pages or execute review RPCs.
2. Student A cannot view or change student B's assignments/responses/files.
3. Student can create one active attempt per assignment and save multiple activity fields.
4. Student cannot submit an empty attempt or write a submitted attempt.
5. Teacher eligible by each routing type can claim; second claim loses cleanly.
6. Ineligible or inactive teacher cannot access another teacher's submissions or storage.
7. Request revision, resubmit and finalize.
8. Storage rejects unsupported MIME and files above 50 MB.
9. Private signed links expire; student cannot download another student's files.
10. Production remains on the existing deployment throughout testing.
