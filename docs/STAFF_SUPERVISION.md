# Stark Learning — Student Supervision and Staff Hierarchy

Version: 2026-11-11 · Branch: feature/reusable-lesson-submissions · Status: development preview.

## Where to find it
- **Supervision:** /teacher
- **Student file:** /teacher/students/[student UUID]
- **Staff directory / hierarchy:** /teacher/staff
- **My staff profile:** /teacher/profile
- **Review queue:** /teacher/reviews

Staff route entry requires an active staff profile; React hiding alone is never relied upon for authorization. The existing administrator has been initialized as Principal; no student accounts have been promoted automatically.

## Staff hierarchy and permissions

| Role | Student visibility | Academic file | Contact file | Administrative / finance file | Reviews | Manage staff and rosters |
| --- | --- | --- | --- | --- | --- | --- |
| Principal (6) | All enrolled | Edit | Edit | Edit | Yes | All levels; eligible junior roster assignments |
| Coordinator (5) | All enrolled | Edit | Edit | Edit | Yes | Lower roles only; eligible junior roster assignments |
| Leader (4) | Direct and direct-report students | Edit | Edit | No | Yes | Direct-report roster assignments only |
| Teacher (3) | Explicitly assigned students | Edit | Edit | No | Yes | No |
| Instructor (2) | Explicitly assigned students | Edit | No | No | Yes | No |
| Monitor (1) | Explicitly assigned students | Read-only | No | No | No | No |

Only registered accounts can be promoted. Staff can edit their own professional title, biography, expertise and CEFR teaching levels. They cannot promote themselves. Hierarchy, active status and manager relationship require a privileged assignment operation. Sensitive data is segregated in separate Supabase tables with row-level security, not merely hidden with CSS.

## KPI definitions

- **Enrolled students:** distinct students enrolled in accessible courses, filtered by the staff member's permitted scope.
- **Hours invested:** confirmed minutes in credit_ledger divided by 60; this is NOT all browsing time.
- **Content acquired:** distinct teacher-finalized assigned lessons.
- **Efficiency:** teacher-finalized lessons / assigned lessons. This is a transparent *completion-rate proxy*; not speed or psychological efficiency.
- **Effectiveness:** average available mastery scores normalized to a 0–100% scale. Unknown if no assessment.
- **Streak:** consecutive days with recorded learning activity, ending today or yesterday. Maximum displayed lookback currently 90 days.
- **Days active / last 30:** number of distinct school-local calendar days (America/Sao_Paulo) with meaningful LMS evidence in the last 30 dates.
- **Homework assiduity:** on-time submitted assignments / assignments whose due_at is within the past 30 days and has elapsed. An assignment with no due_at is excluded. If there are no due dates, display — (not 0%).
- **Needs follow-up:** no recorded learning for 7 days after engagement/enrollment, or homework assiduity below 50% when due dates exist.
- **Submitted waiting:** assignments in submitted/claimed statuses.

Activity days are recorded on saved nonempty lesson responses, uploaded evidence, and submission/finalization transitions; passive opening of a page does not count as participation. Existing saved response/submission timestamps have been backfilled. Edit or remove a homework deadline only before the first submission.

## Notion People-property mapping

Reference template: https://app.notion.com/p/3b534ff0b63d812bb9aff6cbdcc401b2

The field labels deliberately follow the existing *People* data-source names. The design creates a file for **each enrolled Stark Learning account**, not each person in Notion. The Notion page linked above served as a property schema reference only: no personal data from the example person has been imported or linked to an unrelated LMS user. Automatic bidirectional synchronization is **not** enabled.

**Academic (staff rank 2+ can edit, Monitor read-only):** Nome Completo, Status, CEFR, Group, Curso solicitado, Education, Occupation, Interesses, Experiência com inglês, Objetivos, Rotina de estudos, Adopted Strategy, Historico, Observacoes, Target, Turno, Compromisso, Onboarded, Dupla, Student.

**Contact and relationships (rank 3+):** Contact, Email, Address, Cidade, Estado, Birthdate, Guardian.

**Restricted administration (rank 5+):** CPF, Campanha, Contratos, Contratos  (legacy free text), Indicacao, Objetivo, prazo e investimento, PriceRange, Recover, SDR, Sales status, Action, Trigger.

**System-managed:** Created time (portfolio creation timestamp), enrollment date, learning activity and account ID.

Fields are editable in the staff interface. They start blank for existing LMS accounts unless explicitly entered; we do not infer or copy missing Notion data.

## Database implementation

- staff_profiles — role hierarchy and professional profile.
- staff_student_assignments — scoped direct supervision.
- student_portfolios — academic property map (JSONB) plus Notion link and created_at.
- student_contact_profiles — limited contact/relationship fields.
- student_admin_profiles — financial, commercial and identity fields.
- student_learning_days — deduplicated daily meaningful activity.
- RPCs: supervision_roster, supervision_student_detail, supervision_staff_directory, supervision_staff_candidates, save_supervision_portfolio, manage_supervision_staff, manage_supervision_roster, update_own_supervision_profile, set_supervision_homework_due.
- Activity triggers on lesson_responses, lesson_submission_files and lesson_attempts.
- Student files provision automatically when an enrollment is inserted; existing enrollees were backfilled.
- Existing lesson-assignment RLS episode matching was corrected, teacher access to assigned curricula/rubrics was added, and the initial recursive profile policy was replaced with a non-recursive security-definer check.
- New RPC endpoints revoke access from anon/public and explicitly grant authenticated users, with internal role/scope checks.

## Verification record

- Supabase schema migrations applied successfully.
- A seeded Principal can retrieve the roster, student details, and staff management functions.
- An ordinary student cannot read the protected academic or financial school files.
- A temporary Monitor could see assigned students but could not write academic data or view contact/administration data.
- A temporary Teacher could edit their authorized academic/contact fields but not administration fields.
- A Principal could create an Instructor profile and assign a student in a database transaction; all test updates were rolled back.
- Deadline updates pass under Principal scope in rolled-back tests.
- Vercel builds and application health endpoints must be verified against the latest exact commit before production promotion.

## Release limits

- The original Stark Learning production project was not overwritten.
- Browser-level authenticated mobile workflow, email identity onboarding, microphone/file upload, and a complete real teacher review are not covered by the database-only checks.
- There is currently one enrolled student account in the connected LMS database; Notion CRM People rows have **not** been bulk imported.
- No homework percentage exists until assignments have meaningful due dates; no mastery metric exists before assessment.
- Previous student submission/teacher workflow release issues should be separately verified before promoting the whole platform.
