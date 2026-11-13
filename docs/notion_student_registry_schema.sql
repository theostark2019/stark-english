
-- Private initial Notion student registry. This is NOT the auth.users or enrollments table.
-- Individual learner profiles are linked only after secure onboarding/identity matching.
create table if not exists public.notion_student_registry (
 id uuid primary key default gen_random_uuid(),
 source_page_url text not null unique,
 full_name text not null check (length(trim(full_name)) between 1 and 300),
 source_status text not null default 'Student',
 academic_fields jsonb not null default '{}'::jsonb check (jsonb_typeof(academic_fields)='object'),
 contact_fields jsonb not null default '{}'::jsonb check (jsonb_typeof(contact_fields)='object'),
 linked_student_id uuid unique references public.profiles(id) on delete set null,
 imported_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists idx_notion_registry_name on public.notion_student_registry(full_name);
alter table public.notion_student_registry enable row level security;
revoke all on public.notion_student_registry from anon,authenticated;
-- Principal/Coordinator may view the staging records. Other staff cannot see unassigned minors/contact data.
grant select on public.notion_student_registry to authenticated;
drop policy if exists notion_student_registry_senior_read on public.notion_student_registry;
create policy notion_student_registry_senior_read on public.notion_student_registry for select
to authenticated using ((select app_private.staff_rank(app_private.staff_level()))>=5);
-- No browser INSERT, UPDATE or DELETE; import is a server-side administrative operation only.
create or replace function public.supervision_import_registry()
returns table(
 student_id uuid,student_name text,source_status text,cefr jsonb,study_group text,
 interests jsonb,objectives jsonb,has_phone boolean,has_email boolean,
 linked_student_id uuid,source_page_url text)
language plpgsql stable security definer set search_path='' as $$
begin
 if auth.uid() is null or app_private.staff_rank(app_private.staff_level())<5 then
  raise exception 'Senior staff permission required'; end if;
 return query
 select n.id,n.full_name,n.source_status,
 coalesce(n.academic_fields->'CEFR','[]'::jsonb),n.academic_fields->>'Group',
 coalesce(n.academic_fields->'Interesses','[]'::jsonb),
 coalesce(n.academic_fields->'Objetivos','[]'::jsonb),
 length(coalesce(n.contact_fields->>'Contact',''))>0,
 length(coalesce(n.contact_fields->>'Email',''))>0,
 n.linked_student_id,n.source_page_url
 from public.notion_student_registry n
 order by n.full_name,n.id;
end $$;
create or replace function public.supervision_import_registry_detail(p_id uuid)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare result jsonb;
begin
 if auth.uid() is null or app_private.staff_rank(app_private.staff_level())<5 then
  raise exception 'Senior staff permission required'; end if;
 select jsonb_build_object('id',n.id,'fullName',n.full_name,'status',n.source_status,
  'academic',n.academic_fields,'contact',n.contact_fields,
  'linkedStudentId',n.linked_student_id,'sourceUrl',n.source_page_url,
  'importedAt',n.imported_at,'updatedAt',n.updated_at)
 into result from public.notion_student_registry n where n.id=p_id;
 if result is null then raise exception 'Student registry record not found'; end if;
 return result;
end $$;
revoke all on function public.supervision_import_registry() from public,anon,authenticated;
revoke all on function public.supervision_import_registry_detail(uuid) from public,anon,authenticated;
grant execute on function public.supervision_import_registry(),
 public.supervision_import_registry_detail(uuid) to authenticated;
