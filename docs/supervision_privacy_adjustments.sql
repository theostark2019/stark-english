
drop policy if exists portfolio_staff_read on public.student_portfolios;
create policy portfolio_staff_read on public.student_portfolios
for select to authenticated using(app_private.can_supervise_student(student_id,1));

create policy supervision_episode_read on public.episodes
for select to authenticated using(
 status='published' and exists(
  select 1 from public.lesson_assignments a
  where a.episode_id=episodes.id and app_private.can_supervise_student(a.student_id,2)
 )
);
create policy supervision_activity_read on public.lesson_activity_definitions
for select to authenticated using(
 exists(select 1 from public.lesson_assignments a
  where a.episode_id=lesson_activity_definitions.episode_id
  and app_private.can_supervise_student(a.student_id,2))
);
create policy supervision_rubric_read on public.lesson_assessment_schemas
for select to authenticated using(
 exists(select 1 from public.lesson_assignments a
  where a.episode_id=lesson_assessment_schemas.episode_id
  and app_private.can_supervise_student(a.student_id,2))
);
