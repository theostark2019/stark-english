-- Enforce course/teacher allocation for all private staged students.
-- Options are exposed only to authenticated senior staff; no personal data in this migration.
alter table public.notion_student_registry
 alter column assigned_course_id set not null,
 alter column assigned_teacher_id set not null,
 alter column course_assignment_basis set not null;

create table if not exists public.notion_registry_assignment_audit(
 id uuid primary key default gen_random_uuid(),
 registry_student_id uuid not null references public.notion_student_registry(id) on delete cascade,
 previous_course_id uuid references public.courses(id),
 new_course_id uuid not null references public.courses(id),
 previous_teacher_id uuid references public.staff_profiles(user_id),
 new_teacher_id uuid not null references public.staff_profiles(user_id),
 changed_by uuid not null references public.profiles(id),
 changed_at timestamptz not null default now()
);
create index if not exists idx_registry_assignment_audit_student
 on public.notion_registry_assignment_audit(registry_student_id,changed_at desc);
alter table public.notion_registry_assignment_audit enable row level security;
revoke all on public.notion_registry_assignment_audit from anon,authenticated;
grant select on public.notion_registry_assignment_audit to authenticated;
drop policy if exists registry_assignment_audit_senior_read on public.notion_registry_assignment_audit;
create policy registry_assignment_audit_senior_read on public.notion_registry_assignment_audit
for select to authenticated using (app_private.staff_rank(app_private.staff_level())>=5);

create or replace function public.supervision_registry_assignment_options()
returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare val jsonb;
begin
 if auth.uid() is null or app_private.staff_rank(app_private.staff_level())<5
 then raise exception 'Senior staff permission required'; end if;
 select jsonb_build_object(
   'courses',coalesce(
     (select jsonb_agg(jsonb_build_object('id',c.id,'slug',c.slug,'title',c.title) order by c.title)
      from public.courses c),'[]'::jsonb),
   'teachers',coalesce(
     (select jsonb_agg(jsonb_build_object('id',sp.user_id,'name',p.full_name,
       'hierarchy',sp.hierarchy) order by p.full_name)
      from public.staff_profiles sp
      join public.profiles p on p.id=sp.user_id
      join public.teacher_profiles tp on tp.user_id=sp.user_id
      where sp.active and tp.active and app_private.staff_rank(sp.hierarchy)>=2),
     '[]'::jsonb)
 ) into val;
 return val;
end $$;
revoke all on function public.supervision_registry_assignment_options() from public,anon,authenticated;
grant execute on function public.supervision_registry_assignment_options() to authenticated;

-- Update with audit and scoped authorization. No LMS enrollment or course credit created.
create or replace function public.supervision_set_registry_assignment(
 p_student_registry_id uuid,p_course_id uuid,p_teacher_id uuid
) returns jsonb
language plpgsql security definer set search_path='' as $$
declare out_record jsonb;
declare before_row public.notion_student_registry;
begin
 if auth.uid() is null or app_private.staff_rank(app_private.staff_level())<5
 then raise exception 'Senior staff permission required'; end if;
 if not exists(select 1 from public.courses where id=p_course_id)
 then raise exception 'Course not found'; end if;
 if not exists(select 1 from public.staff_profiles sp
 join public.teacher_profiles tp on tp.user_id=sp.user_id
 where sp.user_id=p_teacher_id and sp.active and tp.active
 and app_private.staff_rank(sp.hierarchy)>=2)
 then raise exception 'Teacher must be an active teaching staff member'; end if;
 select * into before_row from public.notion_student_registry
 where id=p_student_registry_id for update;
 if not found then raise exception 'Student registry record not found'; end if;
 if before_row.assigned_course_id=p_course_id and before_row.assigned_teacher_id=p_teacher_id then
   select jsonb_build_object('studentId',before_row.id,'courseId',c.id,
   'courseTitle',c.title,'teacherId',p.id,'teacherName',p.full_name)
   into out_record from public.courses c join public.profiles p on p.id=p_teacher_id
   where c.id=p_course_id;
   return out_record;
 end if;
 update public.notion_student_registry
 set assigned_course_id=p_course_id,assigned_teacher_id=p_teacher_id,
     course_assignment_basis='manual_override',
     assignment_updated_at=now(),updated_at=now()
 where id=p_student_registry_id;
 insert into public.notion_registry_assignment_audit(
 registry_student_id,previous_course_id,new_course_id,
 previous_teacher_id,new_teacher_id,changed_by)
 values(p_student_registry_id,before_row.assigned_course_id,p_course_id,
 before_row.assigned_teacher_id,p_teacher_id,auth.uid());
 select jsonb_build_object('studentId',n.id,'courseId',c.id,'courseTitle',c.title,
 'teacherId',p.id,'teacherName',p.full_name)
 into out_record from public.notion_student_registry n
 join public.courses c on c.id=n.assigned_course_id
 join public.profiles p on p.id=n.assigned_teacher_id
 where n.id=p_student_registry_id;
 return out_record;
end $$;
