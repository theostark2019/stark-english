CREATE OR REPLACE FUNCTION public.supervision_roster()
 RETURNS TABLE(student_id uuid, student_name text, courses text[], academic_fields jsonb, enrolled_at timestamp with time zone, minutes_confirmed bigint, assigned_count bigint, completed_count bigint, mastery_average numeric, submitted_waiting bigint, active_days date[], last_activity date, homework_due_count bigint, homework_ontime_count bigint)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
 if app_private.staff_rank(app_private.staff_level())=0 then
  raise exception 'Staff access required';
 end if;
 return query
 select p.id,coalesce(nullif(port.fields->>'Nome Completo',''),p.full_name),
   array(select distinct c.title from public.enrollments en2 join public.courses c on c.id=en2.course_id
     where en2.student_id=p.id order by c.title),
   coalesce(port.fields,'{}'::jsonb),min(en.enrolled_at),
   coalesce((
    select sum(credits.minutes) from (
      select distinct on (all_credits.episode_id) all_credits.episode_id,all_credits.minutes
      from (
        select cl.episode_id,cl.minutes,1 as source_order from public.credit_ledger cl
         where cl.student_id=p.id
        union all
        select lc.episode_id,lc.minutes,2 as source_order from public.lesson_completion_credits lc
         where lc.student_id=p.id
      ) all_credits order by all_credits.episode_id,all_credits.source_order
    ) credits
  ),0)::bigint,
   (select count(*) from public.lesson_assignments a where a.student_id=p.id),
   (select count(distinct a.assignment_id) from public.lesson_attempts a where a.student_id=p.id and a.status='finalized'),
   (select round(avg(m.score)::numeric/4*100,1) from public.mastery m where m.student_id=p.id),
   (select count(*) from public.lesson_attempts a where a.student_id=p.id and a.status in ('submitted','claimed')),
   array(select ld.activity_day from public.student_learning_days ld where ld.student_id=p.id
     and ld.activity_day>=((now() at time zone 'America/Sao_Paulo')::date-90) order by ld.activity_day),
   (select max(ld.activity_day) from public.student_learning_days ld where ld.student_id=p.id),
   (select count(*) from public.lesson_assignments a where a.student_id=p.id
     and a.due_at is not null and a.due_at<=now() and a.due_at>now()-interval '30 days'),
   (select count(*) from public.lesson_assignments a where a.student_id=p.id
     and a.due_at is not null and a.due_at<=now() and a.due_at>now()-interval '30 days'
     and exists (select 1 from public.lesson_attempts at where at.assignment_id=a.id
       and at.submitted_at<=a.due_at))
 from public.profiles p join public.enrollments en on en.student_id=p.id
 left join public.student_portfolios port on port.student_id=p.id
 where app_private.can_supervise_student(p.id,1)
 group by p.id,p.full_name,port.fields
 order by p.full_name;
end $function$
