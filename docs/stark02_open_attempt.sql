-- Opening the same lesson in two tabs reuses its existing attempt.
create function public.stark02_open_attempt(p_assignment uuid) returns public.lesson_attempts
 language plpgsql security definer set search_path='' as $$
declare assignment public.lesson_assignments;result public.lesson_attempts;schema_id uuid;
begin
 if auth.uid() is null then raise exception 'Sign in to open your lesson';end if;
 select a.* into assignment from public.lesson_assignments a join public.episodes e on e.id=a.episode_id
 where a.id=p_assignment and a.student_id=auth.uid() and e.code like 'AGRO02-%';
 if assignment.id is null then raise exception 'Lesson unavailable';end if;
 perform pg_advisory_xact_lock(hashtextextended(p_assignment::text,2));
 select * into result from public.lesson_attempts where assignment_id=p_assignment order by created_at desc limit 1;
 if result.id is not null then return result;end if;
 select id into schema_id from public.lesson_assessment_schemas where episode_id=assignment.episode_id order by version desc limit 1;
 insert into public.lesson_attempts(assignment_id,student_id,episode_id,assessment_schema_id,status)
 values(assignment.id,auth.uid(),assignment.episode_id,schema_id,'draft') returning * into result;
 return result;
end $$;
revoke all on function public.stark02_open_attempt(uuid) from public,anon;
grant execute on function public.stark02_open_attempt(uuid) to authenticated;
