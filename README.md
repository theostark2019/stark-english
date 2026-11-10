# Stark Learning LMS

Source repository for the Stark Learning educational platform (AgroEnglish, Med-English, and future courses).

## Deployment

- Production application: https://stark-learning.vercel.app
- Backend: existing Stark Learning Supabase project
- The existing Vercel application is **not yet linked** to this GitHub repository. Do not connect `main` to production until the reconstructed application is reviewed and tested.
- Development work is prepared on a feature branch and tested in a Vercel preview deployment before any production release.

Do not commit `.env.local`, Supabase service-role keys, secrets, or student/teacher personal data.
