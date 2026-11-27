# AgroEnglish — Module 1: A1 Foundations

**Stark Learning / AgroEnglish** · 12 episodes · 60 minutes each · 12 hours of planned learning experiences.

The approved **Agriculture 101** (01) and **Agribiology** (02) are preserved. Episodes 03–12 were authored and published on November 11, 2026 in the existing Supabase episode rows (not a separate module or cloned course).

## Episode sequence

| Code | Episode | Communicative outcome | Linked A1 competencies |
| --- | --- | --- | --- |
| AGRO-A1-01 | Agriculture 101 | Greet someone and introduce your agricultural interest | 001–002 |
| AGRO-A1-02 | Agribiology | Describe living plants and observable greenhouse differences | 003–004 |
| AGRO-A1-03 | Agrichemistry | Describe material labels and ask for verified safety information | 005–006 |
| AGRO-A1-04 | Farm Physics | Explain simple movement and direction across a farm | 007–008 |
| AGRO-A1-05 | Math for Agricultural Engineers | Count inventory items, report units and ask for missing measurements | 009–010 |
| AGRO-A1-06 | Animals, Pets & Livestock | Identify animals, report their needs and caretaker routines | 011–012 |
| AGRO-A1-07 | Plants, Plant Parts & Growth | Sequence seed germination and explain basic plant functions | 013–014 |
| AGRO-A1-08 | Weather, Seasons & Fieldwork | Report changing conditions and ask how a field plan may change | 015–016 |
| AGRO-A1-09 | Farm Supplies & Basic Inputs | Report inventory quantities/locations and request missing items | 017–018 |
| AGRO-A1-10 | PPE & Basic Farm Safety | Identify protective equipment, report a hazard and ask a supervisor | 019–020 |
| AGRO-A1-11 | Rural Life & Farm Work-Life | Describe daily routines, work schedules and community activities | 021–022 |
| AGRO-A1-12 | Farm Ownership, Preferences & Roles | Introduce the farm team and explain preferences and responsibilities | 023–024 |

### Lesson structure

Each of Episodes 03–12 follows the approved seven-activity green-page lesson:

1. **Reading & Listening — 12 minutes:** original A1 text plus optional A2, B1 and B2 reading versions; browser text-to-speech.
2. **Vocabulary — 8 minutes:** 28 emoji-supported English-to-Portuguese flashcards per lesson, plus sentence application.
3. **SVO substitution — 9 minutes:** five cue substitutions and two independent examples.
4. **Word families — 7 minutes:** five choices with an answer key hidden until revealed.
5. **First Production — 12 minutes:** a 5–7 sentence situational message (optional audio), followed by guided revision.
6. **Transfer — 8 minutes:** different listener/purpose, reduced scaffolding, 5–7 new sentences (optional audio).
7. **Reflection & Feedback — 4 minutes:** self-assessment, revision note, teacher rubric.

**Output level:** A1 for every episode. A2–B2 readings are extensions, not mandatory output standards.

**Curriculum mapping:** The pre-existing 24 A1 competency links were retained. Episodes 03–12 include additional, specifically worded practice bridges in Substitution, First Production and Transfer for their assigned functional competencies, so no competency records were replaced.

### LMS integration

- Existing `public.episodes` rows for AGRO-A1-03 to AGRO-A1-12 are published, with the full lesson in `lesson_body`.
- Every new episode has seven `lesson_activity_definitions` records and one `lesson_assessment_schemas` rubric.
- New episodes were assigned to the existing enrolled test-student account using pool-review routing; other students only see lessons if assigned according to LMS permissions.
- Student responses save directly to `lesson_responses` in the green workspace. Submitting an attempt uses the existing `submit_lesson_attempt` function. Uploaded files are intended to use the private `lesson-submissions` bucket.
- The linked development branch is `feature/reusable-lesson-submissions` in `theostark2019/stark-english`.

### Verification record

- Database checked: all 12 A1 episode records are published; each has seven activities, an assessment schema and an assignment to the enrolled test account.
- Course catalog queried under simulated authenticated test-student context: all 12 appeared as published.
- Episodes 03–12 checked for seven numbered lesson sections, four reading levels, 28 bilingual vocabulary cards and CEFR-linked practice in First Production and Transfer.
- Simulated authenticated create-attempt → save First Production and Transfer → submit sequence succeeded with all test writes rolled back.
- Vercel build for the green lesson renderer: READY on the dedicated preview project.

**Release boundaries:** The original Stark Learning production project was not overwritten. New narrated Speechify soundbite URLs were not generated; the platform currently uses browser speech synthesis. Teacher-review testing with an active teacher account, mobile usability testing, storage upload checks and automatic credit/mastery awarding remain separate release work.
