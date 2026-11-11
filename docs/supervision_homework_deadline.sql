
alter table public.student_portfolios
add column if not exists created_at timestamptz not null default now();

create or replace function public.set_supervision_homework_due(p_assignment uuid,p_due timestamptz)
returns timestamptz language plpgsql security definer set search_path='' as $$
declare sid uuid;
begin
 select student_id into sid from public.lesson_assignments where id=p_assignment;
 if sid is null or not app_private.can_supervise_student(sid,3) then
   raise exception 'Not authorized to schedule homework';
 end if;
 if exists(select 1 from public.lesson_attempts where assignment_id=p_assignment
   and status in ('submitted','claimed','revision_requested','finalized')) then
   raise exception 'Deadline cannot be changed after an initial submission';
 end if;
 update public.lesson_assignments set due_at=p_due where id=p_assignment;
 return p_due;
end $$;
revoke all on function public.set_supervision_homework_due(uuid,timestamptz) from public,anon;
grant execute on function public.set_supervision_homework_due(uuid,timestamptz) to authenticated;
