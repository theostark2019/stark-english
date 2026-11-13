-- Course catalog + staff-owned registration allocations for Stark Learning's private Notion student registry.
-- This migration contains NO personal data and does not create auth users, LMS enrollments or assignments.
insert into public.courses(slug,title,description)
values
 ('stark-english','Stark English','General English, communication, and contextual learning'),
 ('business-english','Business English','English for professional and business contexts')
on conflict(slug) do nothing;

alter table public.notion_student_registry
 add column if not exists assigned_course_id uuid references public.courses(id),
 add column if not exists assigned_teacher_id uuid references public.staff_profiles(user_id),
 add column if not exists course_assignment_basis text,
 add column if not exists assignment_updated_at timestamptz;

alter table public.notion_student_registry
 drop constraint if exists notion_registry_assignment_basis_check;
alter table public.notion_student_registry
 add constraint notion_registry_assignment_basis_check
 check(course_assignment_basis is null or course_assignment_basis in
 ('explicit_agroenglish','default_stark_english','manual_override'));

create index if not exists idx_notion_registry_assigned_course
 on public.notion_student_registry(assigned_course_id);
create index if not exists idx_notion_registry_assigned_teacher
 on public.notion_student_registry(assigned_teacher_id);

create or replace function public.supervision_registry_roster()
returns table(
 student_id uuid, student_name text, source_status text, cefr jsonb, study_group text,
 interests jsonb, objectives jsonb, has_phone boolean, has_email boolean,
 linked_student_id uuid, source_page_url text,
 course_id uuid, course_slug text, course_title text, teacher_id uuid, teacher_name text,
 teacher_hierarchy text, assignment_basis text
)
language plpgsql stable security definer set search_path='' as $$
begin
 if auth.uid() is null or app_private.staff_rank(app_private.staff_level())<5 then
  raise exception 'Senior staff permission required'; end if;
 return query
 select n.id,n.full_name,n.source_status,
   coalesce(n.academic_fields->'CEFR','[]'::jsonb),
   n.academic_fields->>'Group',
   coalesce(n.academic_fields->'Interesses','[]'::jsonb),
   coalesce(n.academic_fields->'Objetivos','[]'::jsonb),
   length(coalesce(n.contact_fields->>'Contact',''))>0,
   length(coalesce(n.contact_fields->>'Email',''))>0,
   n.linked_student_id,n.source_page_url,
   c.id,c.slug,c.title,t.user_id,
   coalesce(nullif(p.full_name,''),'Staff member'),
   t.hierarchy,n.course_assignment_basis
 from public.notion_student_registry n
 left join public.courses c on c.id=n.assigned_course_id
 left join public.staff_profiles t on t.user_id=n.assigned_teacher_id
 left join public.profiles p on p.id=t.user_id
 order by n.full_name,n.id;
end $$;

create or replace function public.supervision_import_registry_detail(p_id uuid)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare result jsonb;
begin
 if auth.uid() is null or app_private.staff_rank(app_private.staff_level())<5 then
  raise exception 'Senior staff permission required'; end if;
 select jsonb_build_object(
 'id',n.id,'fullName',n.full_name,'status',n.source_status,
 'academic',n.academic_fields,'contact',n.contact_fields,
 'linkedStudentId',n.linked_student_id,'sourceUrl',n.source_page_url,
 'importedAt',n.imported_at,'updatedAt',n.updated_at,
 'courseId',c.id,'courseSlug',c.slug,'courseTitle',c.title,
 'teacherId',t.user_id,'teacherName',coalesce(nullif(p.full_name,''),'Staff member'),
 'teacherHierarchy',t.hierarchy,'assignmentBasis',n.course_assignment_basis
 ) into result
 from public.notion_student_registry n
 left join public.courses c on c.id=n.assigned_course_id
 left join public.staff_profiles t on t.user_id=n.assigned_teacher_id
 left join public.profiles p on p.id=t.user_id
 where n.id=p_id;
 if result is null then raise exception 'Student registry record not found'; end if;
 return result;
end $$;

create or replace function public.supervision_set_registry_assignment(
 p_student_registry_id uuid,p_course_id uuid,p_teacher_id uuid
) returns jsonb
language plpgsql security definer set search_path='' as $$
declare out_record jsonb;
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
 update public.notion_student_registry
 set assigned_course_id=p_course_id,assigned_teacher_id=p_teacher_id,
     course_assignment_basis='manual_override',
     assignment_updated_at=now(),updated_at=now()
 where id=p_student_registry_id;
 if not found then raise exception 'Student registry record not found';end if;
 select jsonb_build_object('studentId',n.id,'courseId',c.id,'courseTitle',c.title,
 'teacherId',p.id,'teacherName',p.full_name)
 into out_record from public.notion_student_registry n
 join public.courses c on c.id=n.assigned_course_id
 join public.profiles p on p.id=n.assigned_teacher_id
 where n.id=p_student_registry_id;
 return out_record;
end $$;

revoke all on function public.supervision_registry_roster() from public,anon,authenticated;
revoke all on function public.supervision_set_registry_assignment(uuid,uuid,uuid) from public,anon,authenticated;
grant execute on function public.supervision_registry_roster(),
 public.supervision_set_registry_assignment(uuid,uuid,uuid) to authenticated;
