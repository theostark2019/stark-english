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
- `/lessons/[id]`: save responses and upload evidence files to a private student attempt
- `/teacher/reviews`: eligible teacher queue
- `/teacher/reviews/[id]`: claim, assess, request revision, finalize
- `/admin/assignments`: admin teacher registration, teacher group creation, and assignment

Read [Architecture](docs/ARCHITECTURE.md) for the data flow, access control, release blockers and test plan.

> **Release guard:** The application has been reconstructed from the accessible deployed structure and new components. It has not replaced or been linked to the production project. The approved Agriculture 101 static lesson remains unchanged, and its interactive fields have not yet been auto-connected to these submissions.
