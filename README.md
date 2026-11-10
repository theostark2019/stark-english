# Stark Learning LMS

**Source repository:** [theostark2019/stark-english](https://github.com/theostark2019/stark-english)  
**Existing production website:** [stark-learning.vercel.app](https://stark-learning.vercel.app)

A modular learning management system for **AgroEnglish**, **Med-English**, and future Stark courses. Teacher assignment, student work, and authentic performance feedback share the same infrastructure.

## Development

The implementation lives on the `feature/reusable-lesson-submissions` branch until it is reviewed.

```bash
npm install
cp .env.example .env.local
# Configure public Supabase URL and publishable key locally
npm run typecheck
npm run build
npm run dev
```

Use the existing Supabase project's public client URL and publishable key. Never commit the service-role key, other secrets, or student data.

## Modules

- `/dashboard`: student dashboard and assigned lessons
- `/lessons/[id]`: green, integrated student lesson with original episode reading/tasks, autosaved answers, voice/file evidence, one-button submission and visible teacher feedback
- `/teacher/reviews`: eligible teacher queue
- `/teacher/reviews/[id]`: claim, assess, request revision, finalize
- `/admin/assignments`: admin teacher registration, teacher group creation, and assignment

Read [Architecture](docs/ARCHITECTURE.md) for the data flow, access control, release blockers and test plan.

> **Release guard:** The feature branch includes a single green lesson workspace that renders the existing `episodes.lesson_body` and writes responses to the shared Supabase submission tables. The separate static Agriculture 101 preview remains an unchanged reference, not the student submission path. The reconstructed app has not replaced the original Stark Learning production project. End-to-end authenticated student/teacher tests must pass before replacing production.
