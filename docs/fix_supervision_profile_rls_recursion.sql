
create or replace function app_private.can_read_supervised_profile(p_student uuid)
returns boolean language sql stable security definer set search_path='' as $$
select app_private.can_supervise_student(p_student,1)
or exists (
 select 1 from public.lesson_attempts a where a.student_id=p_student
   and app_private.can_review_attempt(a.id,auth.uid())
)
$$;
drop policy if exists supervised_student_profile_read on public.profiles;
create policy supervised_student_profile_read on public.profiles
for select to authenticated using (app_private.can_read_supervised_profile(id));
