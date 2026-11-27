
-- Stark Learning: staff hierarchy, student portfolios and supervision telemetry.
-- Additive, RLS-protected tables. No CRM records are copied from Notion.
create table if not exists public.staff_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  hierarchy text not null check (hierarchy in ('Principal','Coordinator','Leader','Teacher','Instructor','Monitor')),
  manager_id uuid references public.staff_profiles(user_id) on delete set null,
  active boolean not null default true,
  job_title text not null default '',
  biography text not null default '',
  specializations text[] not null default '{}',
  cefr_levels text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint staff_no_self_manager check(manager_id is distinct from user_id)
);
create table if not exists public.staff_student_assignments (
  staff_id uuid not null references public.staff_profiles(user_id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  primary key(staff_id,student_id)
);
create table if not exists public.student_portfolios (
  student_id uuid primary key references public.profiles(id) on delete cascade,
  fields jsonb not null default '{}'::jsonb check(jsonb_typeof(fields)='object'),
  notion_page_url text,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id)
);
create table if not exists public.student_contact_profiles (
  student_id uuid primary key references public.profiles(id) on delete cascade,
  fields jsonb not null default '{}'::jsonb check(jsonb_typeof(fields)='object'),
  updated_at timestamptz not null default now()
);
create table if not exists public.student_admin_profiles (
  student_id uuid primary key references public.profiles(id) on delete cascade,
  fields jsonb not null default '{}'::jsonb check(jsonb_typeof(fields)='object'),
  updated_at timestamptz not null default now()
);
create table if not exists public.student_learning_days (
  student_id uuid not null references public.profiles(id) on delete cascade,
  activity_day date not null,
  last_event_at timestamptz not null default now(),
  primary key(student_id,activity_day)
);
create index if not exists idx_learning_days_recent on public.student_learning_days(activity_day desc,student_id);
create index if not exists idx_staff_scope_student on public.staff_student_assignments(student_id,staff_id);

create or replace function app_private.staff_rank(p_hierarchy text)
returns integer language sql immutable set search_path='' as $$
select case p_hierarchy when 'Principal' then 6 when 'Coordinator' then 5
when 'Leader' then 4 when 'Teacher' then 3 when 'Instructor' then 2
when 'Monitor' then 1 else 0 end
$$;

create or replace function app_private.staff_level()
returns text language sql stable security definer set search_path='' as $$
select hierarchy from public.staff_profiles where user_id=auth.uid() and active
$$;

create or replace function app_private.can_supervise_student(p_student uuid, p_minimum_rank int default 1)
returns boolean language sql stable security definer set search_path='' as $$
select exists(
 select 1 from public.staff_profiles me
 where me.user_id=auth.uid() and me.active and app_private.staff_rank(me.hierarchy)>=p_minimum_rank
 and exists(select 1 from public.enrollments en where en.student_id=p_student)
 and (
  me.hierarchy in ('Principal','Coordinator')
  or exists (
    select 1 from public.staff_student_assignments sa
    left join public.staff_profiles assigned on assigned.user_id=sa.staff_id
    where sa.student_id=p_student and sa.active
      and (sa.staff_id=me.user_id
        or (me.hierarchy='Leader' and assigned.manager_id=me.user_id))
  )
 )
)
$$;

create or replace function app_private.can_manage_staff(p_target_level text, p_target_user uuid default null)
returns boolean language sql stable security definer set search_path='' as $$
select exists(
 select 1 from public.staff_profiles me
 where me.user_id=auth.uid() and me.active
 and (me.hierarchy='Principal'
   or (me.hierarchy='Coordinator'
      and app_private.staff_rank(p_target_level)<5
      and (p_target_user is null or not exists (
        select 1 from public.staff_profiles t where t.user_id=p_target_user
        and app_private.staff_rank(t.hierarchy)>=5
      ))
   ))
)
$$;

alter table public.staff_profiles enable row level security;
alter table public.staff_student_assignments enable row level security;
alter table public.student_portfolios enable row level security;
alter table public.student_contact_profiles enable row level security;
alter table public.student_admin_profiles enable row level security;
alter table public.student_learning_days enable row level security;

create policy staff_profiles_read on public.staff_profiles for select to authenticated using(
  user_id=auth.uid() or manager_id=auth.uid() or app_private.staff_rank(app_private.staff_level())>=5
);
create policy staff_scope_read on public.staff_student_assignments for select to authenticated using(
  staff_id=auth.uid()
  or app_private.staff_rank(app_private.staff_level())>=5
  or exists (select 1 from public.staff_profiles p where p.user_id=staff_id and p.manager_id=auth.uid())
);
create policy portfolio_staff_read on public.student_portfolios for select to authenticated
 using (student_id=auth.uid() or app_private.can_supervise_student(student_id,1));
create policy portfolio_contact_read on public.student_contact_profiles for select to authenticated
 using (app_private.can_supervise_student(student_id,3));
create policy portfolio_admin_read on public.student_admin_profiles for select to authenticated
 using (app_private.can_supervise_student(student_id,5));
create policy learning_days_student_read on public.student_learning_days for select to authenticated
 using (student_id=auth.uid() or app_private.can_supervise_student(student_id,1));

-- No client direct insert/update/delete: use tightly validated RPCs and trusted triggers.
grant select on public.staff_profiles,public.staff_student_assignments,
 public.student_portfolios,public.student_contact_profiles,
 public.student_admin_profiles,public.student_learning_days to authenticated;
revoke insert,update,delete on public.staff_profiles,public.staff_student_assignments,
 public.student_portfolios,public.student_contact_profiles,
 public.student_admin_profiles,public.student_learning_days from anon,authenticated;

-- Academic and commercial fields correspond to the Notion People template.
create or replace function public.save_supervision_portfolio(p_student uuid, p_section text, p_fields jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare allowed text[]; item text; min_rank int; payload jsonb;
begin
 if jsonb_typeof(p_fields) <> 'object' then raise exception 'Fields must be an object'; end if;
 if pg_catalog.length(p_fields::text)>30000 then raise exception 'Payload too large'; end if;
 if p_section='academic' then
   min_rank:=2;
   allowed:=array['Nome Completo','Status','CEFR','Group','Curso solicitado','Education',
   'Occupation','Interesses','Experiência com inglês','Objetivos','Rotina de estudos',
   'Adopted Strategy','Historico','Observacoes','Target','Turno','Compromisso',
   'Onboarded','Dupla','Student'];
 elsif p_section='contact' then
   min_rank:=3;
   allowed:=array['Contact','Email','Address','Cidade','Estado','Birthdate','Guardian'];
 elsif p_section='administration' then
   min_rank:=5;
   allowed:=array['CPF','Campanha','Contratos','Contratos ','Indicacao','Objetivo, prazo e investimento',
   'PriceRange','Recover','SDR','Sales status','Action','Trigger'];
 else raise exception 'Unknown profile section'; end if;
 if not app_private.can_supervise_student(p_student,min_rank) then raise exception 'Not authorized'; end if;
 for item in select jsonb_object_keys(p_fields) loop
   if not item=any(allowed) then raise exception 'Field not editable in this section: %',item; end if;
 end loop;
 if p_section='academic' then
   insert into public.student_portfolios(student_id,fields,updated_by)
   values(p_student,p_fields,auth.uid())
   on conflict(student_id) do update set fields=public.student_portfolios.fields||excluded.fields,
       updated_at=now(),updated_by=excluded.updated_by returning fields into payload;
 elsif p_section='contact' then
   insert into public.student_contact_profiles(student_id,fields)
   values(p_student,p_fields)
   on conflict(student_id) do update set fields=public.student_contact_profiles.fields||excluded.fields,
       updated_at=now() returning fields into payload;
 else
   insert into public.student_admin_profiles(student_id,fields)
   values(p_student,p_fields)
   on conflict(student_id) do update set fields=public.student_admin_profiles.fields||excluded.fields,
       updated_at=now() returning fields into payload;
 end if;
 return payload;
end $$;

create or replace function public.manage_supervision_staff(
 p_user uuid,p_hierarchy text,p_active boolean default true,p_manager uuid default null,
 p_job_title text default '',p_biography text default ''
)
returns public.staff_profiles language plpgsql security definer set search_path='' as $$
declare old_level text; result public.staff_profiles; caller_admin boolean;
begin
 if app_private.staff_rank(p_hierarchy)=0 then raise exception 'Invalid hierarchy'; end if;
 select exists(select 1 from public.profiles where id=auth.uid() and role='admin') into caller_admin;
 if not caller_admin and not app_private.can_manage_staff(p_hierarchy,p_user) then raise exception 'Not authorized to manage this level'; end if;
 if not exists(select 1 from public.profiles where id=p_user) then raise exception 'Registered user not found'; end if;
 if p_user=auth.uid() and not caller_admin then raise exception 'Cannot change your own role'; end if;
 if p_manager=p_user then raise exception 'Cannot manage yourself'; end if;
 if p_manager is not null and not exists (
   select 1 from public.staff_profiles m where m.user_id=p_manager and m.active
     and app_private.staff_rank(m.hierarchy)>app_private.staff_rank(p_hierarchy)
 ) then raise exception 'Manager must have a higher, active role'; end if;
 insert into public.staff_profiles(user_id,hierarchy,manager_id,active,job_title,biography)
 values (p_user,p_hierarchy,p_manager,p_active,coalesce(p_job_title,''),coalesce(p_biography,''))
 on conflict(user_id) do update set hierarchy=excluded.hierarchy,manager_id=excluded.manager_id,
 active=excluded.active,job_title=excluded.job_title,biography=excluded.biography,updated_at=now()
 returning * into result;
 -- Monitors observe only; only Instructor+ can claim and review lesson evidence.
 insert into public.teacher_profiles(user_id,active)
 values (p_user,p_active and app_private.staff_rank(p_hierarchy)>=2)
 on conflict(user_id) do update set active=excluded.active;
 return result;
end $$;

create or replace function public.manage_supervision_roster(
 p_staff uuid,p_student uuid,p_active boolean default true
)
returns boolean language plpgsql security definer set search_path='' as $$
declare me text; target text; supervisor uuid;
begin
 select hierarchy into me from public.staff_profiles where user_id=auth.uid() and active;
 select hierarchy,manager_id into target,supervisor from public.staff_profiles where user_id=p_staff and active;
 if target is null then raise exception 'Target must be active staff'; end if;
 if not exists(select 1 from public.enrollments where student_id=p_student) then raise exception 'Student not enrolled'; end if;
 if not ((me in ('Principal','Coordinator') and app_private.staff_rank(me)>app_private.staff_rank(target))
     or (me='Leader' and supervisor=auth.uid() and app_private.staff_rank(target)<4)) then
   raise exception 'Cannot assign this student'; end if;
 insert into public.staff_student_assignments(staff_id,student_id,active)
 values(p_staff,p_student,p_active)
 on conflict(staff_id,student_id) do update set active=excluded.active;
 return true;
end $$;

create or replace function public.supervision_staff_directory()
returns table(user_id uuid,full_name text,hierarchy text,manager_id uuid,active boolean,
 job_title text,biography text,specializations text[],cefr_levels text[],student_count bigint)
language sql stable security definer set search_path='' as $$
 select sp.user_id,p.full_name,sp.hierarchy,sp.manager_id,sp.active,sp.job_title,sp.biography,
 sp.specializations,sp.cefr_levels,
 (select count(*) from public.staff_student_assignments sa where sa.staff_id=sp.user_id and sa.active)
 from public.staff_profiles sp join public.profiles p on p.id=sp.user_id
 where exists(select 1 from public.staff_profiles viewer where viewer.user_id=auth.uid() and viewer.active
   and (viewer.hierarchy in ('Principal','Coordinator') or sp.user_id=auth.uid()
    or (viewer.hierarchy='Leader' and sp.manager_id=viewer.user_id)))
 order by app_private.staff_rank(sp.hierarchy) desc,p.full_name
$$;

create or replace function public.supervision_staff_candidates()
returns table(user_id uuid,full_name text,current_level text)
language sql stable security definer set search_path='' as $$
select p.id,p.full_name,sp.hierarchy from public.profiles p left join public.staff_profiles sp on sp.user_id=p.id
where app_private.staff_rank(app_private.staff_level())>=5
order by p.full_name
$$;

-- Enrollment creates a student's portfolio, without importing Notion records.
create or replace function app_private.initialize_student_portfolio()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.student_portfolios(student_id) values(new.student_id) on conflict do nothing;
 return new;
end $$;
drop trigger if exists on_enroll_student_portfolio on public.enrollments;
create trigger on_enroll_student_portfolio after insert on public.enrollments
for each row execute function app_private.initialize_student_portfolio();
insert into public.student_portfolios(student_id)
select distinct student_id from public.enrollments on conflict do nothing;

-- Meaningful activity = a saved nonempty answer, uploaded evidence, or submission.
create or replace function app_private.mark_student_learning_day()
returns trigger language plpgsql security definer set search_path='' as $$
declare sid uuid;
begin
 if tg_table_name='lesson_responses' then
   if new.response='{}'::jsonb or pg_catalog.length(coalesce(new.response->>'text',''))=0
     and not (new.response ? 'value') then return new; end if;
   select student_id into sid from public.lesson_attempts where id=new.attempt_id;
 elsif tg_table_name='lesson_submission_files' then
   select student_id into sid from public.lesson_attempts where id=new.attempt_id;
 else
   if new.status not in ('submitted','finalized') or new.status is not distinct from old.status then return new; end if;
   sid:=new.student_id;
 end if;
 if sid is not null then
   insert into public.student_learning_days(student_id,activity_day,last_event_at)
   values(sid,(now() at time zone 'America/Sao_Paulo')::date,now())
   on conflict(student_id,activity_day) do update set last_event_at=excluded.last_event_at;
 end if;
 return new;
end $$;
drop trigger if exists mark_day_on_response on public.lesson_responses;
create trigger mark_day_on_response after insert or update of response on public.lesson_responses
for each row execute function app_private.mark_student_learning_day();
drop trigger if exists mark_day_on_evidence on public.lesson_submission_files;
create trigger mark_day_on_evidence after insert on public.lesson_submission_files
for each row execute function app_private.mark_student_learning_day();
drop trigger if exists mark_day_on_submission on public.lesson_attempts;
create trigger mark_day_on_submission after update of status on public.lesson_attempts
for each row execute function app_private.mark_student_learning_day();

-- Backfill recorded learning days from earlier answers and submissions.
insert into public.student_learning_days(student_id,activity_day,last_event_at)
select a.student_id,(r.updated_at at time zone 'America/Sao_Paulo')::date,max(r.updated_at)
from public.lesson_responses r join public.lesson_attempts a on a.id=r.attempt_id
where r.response<>'{}'::jsonb
group by 1,2
on conflict(student_id,activity_day) do update set last_event_at=greatest(public.student_learning_days.last_event_at,excluded.last_event_at);
insert into public.student_learning_days(student_id,activity_day,last_event_at)
select a.student_id,(a.submitted_at at time zone 'America/Sao_Paulo')::date,max(a.submitted_at)
from public.lesson_attempts a where a.submitted_at is not null
group by 1,2
on conflict(student_id,activity_day) do update set last_event_at=greatest(public.student_learning_days.last_event_at,excluded.last_event_at);

-- Private, server-authorized roster. Counts derived from real assignments/evidence.
create or replace function public.supervision_roster()
returns table(student_id uuid,student_name text,courses text[],academic_fields jsonb,
 enrolled_at timestamptz,minutes_confirmed bigint,assigned_count bigint,completed_count bigint,
 mastery_average numeric,submitted_waiting bigint,active_days date[],last_activity date,
 homework_due_count bigint,homework_ontime_count bigint)
language plpgsql stable security definer set search_path='' as $$
begin
 if app_private.staff_rank(app_private.staff_level())=0 then
  raise exception 'Staff access required';
 end if;
 return query
 select p.id,coalesce(nullif(port.fields->>'Nome Completo',''),p.full_name),
   array(select distinct c.title from public.enrollments en2 join public.courses c on c.id=en2.course_id
     where en2.student_id=p.id order by c.title),
   coalesce(port.fields,'{}'::jsonb),min(en.enrolled_at),
   coalesce((select sum(cl.minutes) from public.credit_ledger cl where cl.student_id=p.id),0)::bigint,
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
end $$;

create or replace function public.supervision_student_detail(p_student uuid)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare rank integer; info jsonb;
begin
 if not app_private.can_supervise_student(p_student,1) then raise exception 'Not authorized'; end if;
 rank:=app_private.staff_rank(app_private.staff_level());
 select pg_catalog.jsonb_build_object(
  'academic',coalesce((select fields from public.student_portfolios where student_id=p_student),'{}'::jsonb),
  'notionPageUrl',(select notion_page_url from public.student_portfolios where student_id=p_student),
  'contact',case when rank>=3 then coalesce((select fields from public.student_contact_profiles where student_id=p_student),'{}'::jsonb) else null end,
  'administration',case when rank>=5 then coalesce((select fields from public.student_admin_profiles where student_id=p_student),'{}'::jsonb) else null end,
  'assignments',coalesce((select jsonb_agg(jsonb_build_object('id',a.id,'title',e.title,'code',e.code,
    'dueAt',a.due_at,'status',(select att.status from public.lesson_attempts att
      where att.assignment_id=a.id order by att.created_at desc limit 1),
    'submittedAt',(select att.submitted_at from public.lesson_attempts att
      where att.assignment_id=a.id order by att.created_at desc limit 1)))
    from public.lesson_assignments a join public.episodes e on e.id=a.episode_id
    where a.student_id=p_student),'[]'::jsonb),
  'staff',coalesce((select jsonb_agg(jsonb_build_object('id',sa.staff_id,'name',p.full_name,
    'hierarchy',sp.hierarchy)) from public.staff_student_assignments sa
    join public.staff_profiles sp on sp.user_id=sa.staff_id
    join public.profiles p on p.id=sa.staff_id
    where sa.student_id=p_student and sa.active),'[]'::jsonb)
 ) into info;
 return info;
end $$;

revoke all on function public.save_supervision_portfolio(uuid,text,jsonb) from public,anon;
revoke all on function public.manage_supervision_staff(uuid,text,boolean,uuid,text,text) from public,anon;
revoke all on function public.manage_supervision_roster(uuid,uuid,boolean) from public,anon;
revoke all on function public.supervision_staff_directory() from public,anon;
revoke all on function public.supervision_staff_candidates() from public,anon;
revoke all on function public.supervision_roster() from public,anon;
revoke all on function public.supervision_student_detail(uuid) from public,anon;
grant execute on function public.save_supervision_portfolio(uuid,text,jsonb),
 public.manage_supervision_staff(uuid,text,boolean,uuid,text,text),
 public.manage_supervision_roster(uuid,uuid,boolean),
 public.supervision_staff_directory(),public.supervision_staff_candidates(),
 public.supervision_roster(),public.supervision_student_detail(uuid) to authenticated;

-- Existing administrators may access the new supervisory workspace as Principals.
-- Do not promote ordinary students or import real Notion records automatically.
insert into public.staff_profiles(user_id,hierarchy,job_title)
select id,'Principal','School principal' from public.profiles where role='admin'
on conflict(user_id) do nothing;
insert into public.teacher_profiles(user_id,active)
select sp.user_id,true from public.staff_profiles sp
where sp.hierarchy='Principal' and sp.active
on conflict(user_id) do nothing;


-- Repair previously observed cross-episode policy mistakes before enabling new staff access.
drop policy if exists attempt_student_create on public.lesson_attempts;
create policy attempt_student_create on public.lesson_attempts
for insert to authenticated with check (
 student_id=auth.uid() and status='draft' and submitted_at is null
 and claimed_by is null and claimed_at is null and finalized_at is null
 and exists(select 1 from public.lesson_assignments a where a.id=assignment_id
   and a.student_id=auth.uid() and a.episode_id=lesson_attempts.episode_id)
 and (assessment_schema_id is null or exists(
   select 1 from public.lesson_assessment_schemas s
   where s.id=assessment_schema_id and s.episode_id=lesson_attempts.episode_id
 ))
);
drop policy if exists activity_student_read on public.lesson_activity_definitions;
create policy activity_student_read on public.lesson_activity_definitions
for select to authenticated using (
 exists(select 1 from public.lesson_assignments a
 where a.student_id=auth.uid() and a.episode_id=lesson_activity_definitions.episode_id)
);
drop policy if exists rubric_student_read on public.lesson_assessment_schemas;
create policy rubric_student_read on public.lesson_assessment_schemas
for select to authenticated using (
 exists(select 1 from public.lesson_assignments a
 where a.student_id=auth.uid() and a.episode_id=lesson_assessment_schemas.episode_id)
);
create policy rubric_teacher_review_read on public.lesson_assessment_schemas
for select to authenticated using (
 exists(select 1 from public.lesson_attempts a
 where a.episode_id=lesson_assessment_schemas.episode_id
 and app_private.can_review_attempt(a.id,auth.uid()))
);
create policy supervised_student_profile_read on public.profiles
for select to authenticated using (
 app_private.can_supervise_student(id,1)
 or exists(select 1 from public.lesson_attempts a where a.student_id=profiles.id
  and app_private.can_review_attempt(a.id,auth.uid()))
);
create policy staff_episode_review_read on public.episodes
for select to authenticated using (
 exists(select 1 from public.lesson_attempts a where a.episode_id=episodes.id
  and app_private.can_review_attempt(a.id,auth.uid()))
);
