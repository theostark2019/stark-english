-- Course names are non-sensitive; permit active teaching staff to see the four-course catalog.
-- Enrollment-specific lessons and private student data continue to use their existing RLS.
drop policy if exists courses_active_staff_read on public.courses;
create policy courses_active_staff_read on public.courses for select to authenticated
using (app_private.staff_rank(app_private.staff_level())>=2);
