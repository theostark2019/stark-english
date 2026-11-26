-- Break the attempt -> assessment schema -> attempt policy cycle.
-- Keep every existing student, status, assignment and schema-binding restriction.
begin;
create function app_private.stark02_schema_matches_episode(p_schema uuid,p_episode uuid)
 returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(
  select 1 from public.lesson_assessment_schemas s
  join public.lesson_assignments a on a.episode_id=s.episode_id
  where s.id=p_schema and s.episode_id=p_episode and a.student_id=auth.uid()
 );
$$;
revoke all on function app_private.stark02_schema_matches_episode(uuid,uuid) from public,anon;
grant execute on function app_private.stark02_schema_matches_episode(uuid,uuid) to authenticated;
alter policy attempt_student_create on public.lesson_attempts with check(
 student_id=(select auth.uid()) and status='draft' and submitted_at is null and claimed_by is null
 and claimed_at is null and finalized_at is null
 and exists(select 1 from public.lesson_assignments a where a.id=lesson_attempts.assignment_id
  and a.student_id=(select auth.uid()) and a.episode_id=lesson_attempts.episode_id)
 and (assessment_schema_id is null or app_private.stark02_schema_matches_episode(assessment_schema_id,episode_id))
);
commit;
