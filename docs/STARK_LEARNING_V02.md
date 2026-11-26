# Stark Learning 0.2 — review candidate

26 November 2026. Built from production source commit `a0aa9a5807bd5063755bbd585c3b5f1b12f2daf2` on a separate feature branch. The production deployment is retained.

## Student relationship

One student file connects course enrollment, dated contracts, meeting arrangements, scheduled/held meetings, monthly tuition, homework and chosen platform work. Existing academic, contact, administration and learning records remain in their original screens.

Each contract can contain several arrangements, including a mix of 30-minute and 60-minute meetings. Every arrangement records a price per meeting and a weekly frequency. Monthly tuition is **four times the sum of the agreed weekly meeting costs**. For example: one R$50 meeting and two R$90 meetings per week produce R$920 monthly tuition. No 4.33-week conversion, five-week surcharge or prorating rule is inferred. Tuition entries are explicit records, and marking them paid records an externally received payment; it does not collect money.

Principal/Coordinator permissions control financial actions. Assigned teachers can schedule meetings and assign homework. Other staff receive the existing role-based access. Students see their own agreement and work. Financial values are redacted from ordinary teachers' records.

Homework belongs to a meeting and is due at the next scheduled meeting in the same contract. It can refer to an existing lesson assignment or a named amount of other work. The next meeting must exist before homework is assigned. A meeting with linked homework cannot be cancelled without reviewing those links.

## AgroEnglish

The supplied workbook, `AgroEnglish_Checklist_Comunicativa_2_0 - Copy.xlsx`, supplies the exact 96 skill descriptions, language resources, task briefs, evidence criteria and suggested modalities. Four new series contain 24 episodes each:

| Level | Series | Episodes |
| --- | --- | ---: |
| A1 | Meet the farm | 24 |
| A2 | Make things happen | 24 |
| B1 | Work with confidence | 24 |
| B2 | Lead the conversation | 24 |

All 96 have original text models, focused bilingual glossaries, model language, substitution/change/translation/creation rehearsal and a final evidence workspace. Models use fictional cases. The first greeting lesson also links to a Speechify model; no browser speech is used. Additional audio/video and complete classroom source packs are not claimed for the remaining episodes. Some checklist tasks refer to longer source documents, pictures, event cards or longer performances: the current teaching examples are a starting collection for editorial calibration, not a claim that every full source pack has been produced or approved.

The native interface follows: model and final challenge → vocabulary → language noticing → rehearsal → original proof → feedback → stronger attempt. It uses the same authenticated submissions, private files and teacher review infrastructure as the other courses.

The learner commits to an amount of work and a deadline. A scheduled next meeting takes precedence over a manually chosen deadline. Repeated commitment/open requests reuse the assignment and attempt. Browser drafts are backed up locally and saved to the cloud in order. A newer local draft can be recovered explicitly. Required proof is checked in the database, including audio for speaking skills. A failed audio upload can be retried.

Every submitted version snapshots the written payload and associated audio IDs. Revision retains the earlier performance. Teacher reviews use three criteria scored 0–4: task achievement, communication and language. Missing/out-of-range final scores are rejected. All criteria at least 3, with finalized evidence, count as one demonstrated checklist skill. This does not certify a whole CEFR level. Browser-recorded active time, finalized workload and demonstrated skills remain separate measures.

The original 48 AgroEnglish episodes, original Agriculture 101 page, existing evidence and the Stark English/SVO, Med-English and Business English implementations are retained. The new 96 database episodes remain drafts; the review interface allows an enrolled learner to access their explicitly chosen preview assignment without publishing all new lessons in the legacy catalog.

## Verification

- TypeScript validation and optimized Next.js build passed.
- Content checks passed: 96 unique source mappings and 96 models, glossaries and translation examples; exactly 24 per level.
- Five tuition calculation checks passed, including mixed durations, several weekly sessions, zero-price agreements and cent precision.
- Database integration passed using synthetic identities and the authenticated database role. All fixture writes were rolled back: contract calculation/overlap; tuition idempotency and payment record; meeting deadlines; financial redaction; cross-student privacy; commitment reuse/routing; active-time idempotency; speaking-proof and rehearsal validation; teacher eligibility; rubric validation; revision history; finalized status and one completion credit.
- The tests found and repaired an existing attempt → assessment-schema → attempt RLS recursion. The repair retains every original ownership, assignment, status and schema-binding check.
- New tables have RLS; new RPCs have explicit authentication/authorization checks and no anonymous execution grants. Advisor flags for authenticated definer RPCs are intentional API entry points; existing unrelated advisor notices were not changed.
- A local-only launcher adapter resolved the managed preview's Vite/Next.js flag mismatch without changing the application's scripts. Desktop browser review passed for the four-series home, first model-led lesson, flashcard reveal, a four-out-of-four recall result, rehearsal entry retained across stages, and the final evidence requirements. The first lesson is left open for review. The legacy course-selector navigation remained pending in this local environment and was not certified by this check.
- Theo explicitly approved publishing the candidate branch to the existing public GitHub repository and creating a separate Vercel preview on 26 November. The current production deployment is retained. Real-device audio/login acceptance and deployed UI checks remain separate release checks.

Database tests establish data and permission behavior; they do not establish a real-device microphone workflow or whole-platform production readiness. Keep this release as a review candidate until those tests and the pedagogical review are complete.

## Entry points

- `/courses/agroenglish`: new four-series home.
- `/courses/agroenglish/series/a1/1`: first model-led episode.
- `/learning`: the learner's file, evidence, commitments, meetings and tuition.
- `/teacher/students/[id]/course-plan`: student relationship management.
- `/teacher/reviews`: the existing review queue, now with v0.2 evidence history.

Schema additions and seeds are recorded in the SQL files beside this document. The test SQL is `scripts/test-stark02.sql`; the content/math checks are `node scripts/test-stark02-content.mjs`.
