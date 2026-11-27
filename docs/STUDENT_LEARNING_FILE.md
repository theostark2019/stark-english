# Student learning file — teaching plan and achievement record

**Environment:** Stark Learning development preview
**Location:** \`/teacher/students/[student_id]\`
**Repository branch:** \`feature/reusable-lesson-submissions\`
**Implemented:** 2026-11-13

## What the teacher sees

The student record now opens with:

1. **Learning KPIs** — hours, finalized lessons, mastery, streak, days active and homework assiduity.
2. **Teaching roadmap** — active and achieved goals, measurable milestones, due dates, goal descriptions, links to learning episodes, teacher evidence with timestamps and the achievement date.
3. **Assign new lessons** — choose a published episode of a course in which the student is enrolled, set a future deadline, select an optional learning goal, and assign it to the student with the supervising teacher as reviewer. Already assigned lessons can be linked to goals without duplicating the assignment.
4. **Teacher feedback** — actual lesson reviews, outcomes, feedback notes, teacher and date.
5. **Assigned lessons** — statuses, titles, lesson codes and due-date editor (existing data).
6. **Academic file, contact information and restricted administration** — existing Notion-style property sections; permissions remain separate.

Navigation shortcuts: Learning goals / Assign a lesson / Assigned lessons / Feedback / Profile.

## Evidence and achievement policy

Goals do **not** become achieved merely because the student views a lesson. Each goal has:
- Domain/skill area (Speaking, Listening, Reading, Writing, Vocabulary, Grammar, Professional English, Study habits, Assessment, Other);
- Descriptive target and observable success criteria;
- Number of milestones required and confirmed;
- Optional target date;
- Active, paused or achieved state;
- An append-only teacher action history containing actor, timestamp, note, progress units and an optional real lesson assignment;
- An achieved timestamp created only when confirmed milestones reach the target.

The last milestone automatically changes the goal to **achieved**. A goal already achieved cannot be deleted or reopened through the teaching API. Pausing and resuming unfinished goals is logged, preserving the history.

The \`public.student_learning_goals\`, \`public.student_goal_activities\` and \`public.student_goal_assignments\` tables have RLS. Direct client writes are denied; the six RPC endpoints authorize the user's school role and student scope. Monitors can view scoped records, Instructors and higher can create/confirm goals, and Teachers and higher can assign lessons. A new lesson must be published and belong to a course in which the student is enrolled.

## Application / database interface

- \`src/components/StudentLearningPlan.tsx\` — goals, evidence, assignments and feedback UI
- \`src/components/StudentPortfolioEditor.tsx\` — integrates the new section, before academic/contact/financial fields
- \`src/app/teacher/students/[id]/page.tsx\` — secure server-side data retrieval
- \`docs/student_goals_and_assignments.sql\` — additive schema migration and scoped, authenticated APIs

RPCs:
- \`supervision_create_goal\`
- \`supervision_record_goal_progress\`
- \`supervision_set_goal_state\`
- \`supervision_available_lessons\`
- \`supervision_assign_lesson\`
- \`supervision_student_learning_record\`

## Verification

Performed in roll-back-only database transactions:
- Principal creates goal; links existing course assignment; adds two evidence events; goal automatically becomes achieved; audit history and linked lesson appear in the learning record — **pass**.
- Principal assigns a newly published temporary course episode; due date and individual reviewer are saved; goal link is written — **pass** (temporary episode rolled back).
- Authenticated identity without staff scope denied goal creation, assignment catalog and learning-record access — **pass**.
- Scoped Monitor can view the learning record but cannot create goals or assign lessons — **pass**.
- Latest Vercel deployment for branch commit \`25f1404bed68bc456472a16154c8e56b67b553d1\` compiled and returned **READY**.
- Health endpoint returned HTTP 200, and the protected teacher/student URLs require sign-in.

**What was not tested:** authenticated real-browser click-through and live media recording, complete teacher review/credits, and mobile-browser interaction. The existing production project was not promoted.

**Important existing-data limitation:** The LMS currently has one enrolled account, and all 12 published AgroEnglish A1 episodes are already assigned to that account. Teachers can link those lessons to goals and set permitted deadlines now; new lesson assignment will become available as more published episodes or student enrollments are added. Historical Notion People records are not automatically imported.

**No fictional educational goals or accomplishments were inserted into a real student's record.** A teacher must define goals and certify accomplishments with evidence.
