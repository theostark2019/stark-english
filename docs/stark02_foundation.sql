-- Additive v0.2 foundation. Existing courses, lessons, responses and reviews are retained.
begin;
create table public.stark02_contracts(
 id uuid primary key default gen_random_uuid(), student_id uuid not null references public.profiles(id),
 course_id uuid not null references public.courses(id), starts_on date not null, ends_on date not null,
 status text not null default 'active' check(status in ('active','ended')),
 created_by uuid not null references public.profiles(id), created_at timestamptz not null default now(),
 check(ends_on>=starts_on)
);
create index on public.stark02_contracts(student_id,starts_on);
create index on public.stark02_contracts(course_id);
create index on public.stark02_contracts(created_by);
create table public.stark02_meeting_plans(
 id uuid primary key default gen_random_uuid(),contract_id uuid not null references public.stark02_contracts(id),
 minutes integer not null check(minutes in (30,60)),price_cents integer not null check(price_cents between 0 and 100000000),
 times_per_week integer not null check(times_per_week between 1 and 14)
);
create index on public.stark02_meeting_plans(contract_id);
create table public.stark02_meetings(
 id uuid primary key default gen_random_uuid(),contract_id uuid not null references public.stark02_contracts(id),
 plan_id uuid not null references public.stark02_meeting_plans(id),student_id uuid not null references public.profiles(id),
 teacher_id uuid not null references public.teacher_profiles(user_id),starts_at timestamptz not null,
 minutes integer not null check(minutes in (30,60)),price_cents integer not null check(price_cents>=0),
 status text not null default 'scheduled' check(status in ('scheduled','held','cancelled')),
 created_at timestamptz not null default now(),unique(student_id,starts_at)
);
create index on public.stark02_meetings(student_id,starts_at);
create index on public.stark02_meetings(contract_id);
create index on public.stark02_meetings(plan_id);
create index on public.stark02_meetings(teacher_id);
create table public.stark02_tuitions(
 id uuid primary key default gen_random_uuid(),contract_id uuid not null references public.stark02_contracts(id),
 month date not null check(extract(day from month)=1),amount_cents bigint not null check(amount_cents>=0),
 status text not null default 'pending' check(status in ('pending','paid')),paid_at timestamptz,
 created_at timestamptz not null default now(),unique(contract_id,month)
);
create index on public.stark02_tuitions(contract_id);
create table public.stark02_commitments(
 id uuid primary key default gen_random_uuid(),student_id uuid not null references public.profiles(id),
 episode_id uuid not null references public.episodes(id),assignment_id uuid not null unique references public.lesson_assignments(id),
 amount numeric(8,2) not null check(amount>0 and amount<=1000),
 unit text not null check(unit in ('lesson','episode','chapter','activity','minute','hour')),
 created_at timestamptz not null default now(),unique(student_id,episode_id)
);
create index on public.stark02_commitments(student_id);
create index on public.stark02_commitments(episode_id);
create table public.stark02_homework(
 id uuid primary key default gen_random_uuid(),student_id uuid not null references public.profiles(id),
 from_meeting uuid not null references public.stark02_meetings(id),due_meeting uuid not null references public.stark02_meetings(id),
 assignment_id uuid references public.lesson_assignments(id),label text not null check(length(btrim(label)) between 3 and 300),
 amount numeric(8,2) not null check(amount>0 and amount<=1000),
 unit text not null check(unit in ('lesson','episode','chapter','activity','minute','hour')),
 created_at timestamptz not null default now(),check(from_meeting<>due_meeting)
);
create index on public.stark02_homework(student_id);
create index on public.stark02_homework(from_meeting);
create index on public.stark02_homework(due_meeting);
create index on public.stark02_homework(assignment_id);
create table public.stark02_work_sessions(
 id uuid primary key,student_id uuid not null references public.profiles(id),
 assignment_id uuid not null references public.lesson_assignments(id),
 seconds integer not null default 0 check(seconds between 0 and 14400),
 created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
create index on public.stark02_work_sessions(student_id);
create index on public.stark02_work_sessions(assignment_id);
create table public.stark02_evidence_versions(
 id uuid primary key default gen_random_uuid(),attempt_id uuid not null references public.lesson_attempts(id),
 payload jsonb not null,file_ids uuid[] not null default '{}',submitted_at timestamptz not null default now()
);
create index on public.stark02_evidence_versions(attempt_id);

-- Staff financial access follows the existing Principal / Coordinator hierarchy.
alter table public.stark02_contracts enable row level security;
alter table public.stark02_meeting_plans enable row level security;
alter table public.stark02_meetings enable row level security;
alter table public.stark02_tuitions enable row level security;
alter table public.stark02_commitments enable row level security;
alter table public.stark02_homework enable row level security;
alter table public.stark02_work_sessions enable row level security;
alter table public.stark02_evidence_versions enable row level security;
create policy contract_read on public.stark02_contracts for select to authenticated
 using(student_id=(select auth.uid()) or app_private.can_supervise_student(student_id,5));
create policy plan_read on public.stark02_meeting_plans for select to authenticated
 using(exists(select 1 from public.stark02_contracts c where c.id=contract_id));
-- Meetings contain a price snapshot, so direct reads are limited to the learner and finance staff.
-- Other supervisors obtain a redacted schedule from stark02_student_file().
create policy meeting_read on public.stark02_meetings for select to authenticated
 using(student_id=(select auth.uid()) or app_private.can_supervise_student(student_id,5));
create policy tuition_read on public.stark02_tuitions for select to authenticated
 using(exists(select 1 from public.stark02_contracts c where c.id=contract_id));
create policy commitment_read on public.stark02_commitments for select to authenticated
 using(student_id=(select auth.uid()) or app_private.can_supervise_student(student_id,1));
create policy homework_read on public.stark02_homework for select to authenticated
 using(student_id=(select auth.uid()) or app_private.can_supervise_student(student_id,1));
create policy work_read on public.stark02_work_sessions for select to authenticated
 using(student_id=(select auth.uid()) or app_private.can_supervise_student(student_id,1));
create policy evidence_read on public.stark02_evidence_versions for select to authenticated
 using(exists(select 1 from public.lesson_attempts a where a.id=attempt_id and a.student_id=(select auth.uid()))
 or app_private.can_review_attempt(attempt_id,(select auth.uid())));
grant select on public.stark02_contracts,public.stark02_meeting_plans,public.stark02_meetings,
 public.stark02_tuitions,public.stark02_commitments,public.stark02_homework,
 public.stark02_work_sessions,public.stark02_evidence_versions to authenticated;
revoke all on public.stark02_contracts,public.stark02_meeting_plans,public.stark02_meetings,
 public.stark02_tuitions,public.stark02_commitments,public.stark02_homework,
 public.stark02_work_sessions,public.stark02_evidence_versions from anon;

create function public.stark02_create_contract(p_student uuid,p_course uuid,p_start date,p_end date,p_plans jsonb)
 returns uuid language plpgsql security definer set search_path='' as $$
declare cid uuid;item jsonb;
begin
 if auth.uid() is null or not app_private.can_supervise_student(p_student,5) then raise exception 'Finance access required';end if;
 if p_start is null or p_end is null or p_end<p_start then raise exception 'Choose a valid contract period';end if;
 if not exists(select 1 from public.enrollments where student_id=p_student and course_id=p_course)
 then raise exception 'The student must be enrolled in this course';end if;
 if jsonb_typeof(p_plans) is distinct from 'array' or jsonb_array_length(p_plans) not between 1 and 8
 then raise exception 'Add between one and eight meeting arrangements';end if;
 perform pg_advisory_xact_lock(hashtextextended(p_student::text||p_course::text,2));
 if exists(select 1 from public.stark02_contracts where student_id=p_student and course_id=p_course
  and status='active' and daterange(starts_on,ends_on,'[]')&&daterange(p_start,p_end,'[]'))
 then raise exception 'This period overlaps an existing contract for the course';end if;
 insert into public.stark02_contracts(student_id,course_id,starts_on,ends_on,created_by)
 values(p_student,p_course,p_start,p_end,auth.uid()) returning id into cid;
 for item in select value from jsonb_array_elements(p_plans) loop
  if jsonb_typeof(item->'minutes') is distinct from 'number' or jsonb_typeof(item->'price_cents') is distinct from 'number'
   or jsonb_typeof(item->'times_per_week') is distinct from 'number' then raise exception 'Invalid meeting arrangement';end if;
  if (item->>'minutes')::numeric<>trunc((item->>'minutes')::numeric)
   or (item->>'price_cents')::numeric<>trunc((item->>'price_cents')::numeric)
   or (item->>'times_per_week')::numeric<>trunc((item->>'times_per_week')::numeric)
  then raise exception 'Use whole minutes, whole cents and whole meeting counts';end if;
  insert into public.stark02_meeting_plans(contract_id,minutes,price_cents,times_per_week)
   values(cid,(item->>'minutes')::integer,(item->>'price_cents')::integer,(item->>'times_per_week')::integer);
 end loop;
 return cid;
end $$;

create function public.stark02_schedule_meeting(p_plan uuid,p_teacher uuid,p_start timestamptz)
 returns uuid language plpgsql security definer set search_path='' as $$
declare plan public.stark02_meeting_plans;contract public.stark02_contracts;mid uuid;
begin
 select * into plan from public.stark02_meeting_plans where id=p_plan;
 select * into contract from public.stark02_contracts where id=plan.contract_id;
 if auth.uid() is null or not app_private.can_supervise_student(contract.student_id,3)
 then raise exception 'Assigned teacher access required';end if;
 if p_start is null or contract.status<>'active' or (p_start at time zone 'America/Sao_Paulo')::date
  not between contract.starts_on and contract.ends_on then raise exception 'Meeting must fall within the contract';end if;
 if not exists(select 1 from public.teacher_profiles tp join public.staff_profiles sp on sp.user_id=tp.user_id
  where tp.user_id=p_teacher and tp.active and sp.active and
  (exists(select 1 from public.staff_student_assignments sa where sa.student_id=contract.student_id and sa.staff_id=p_teacher and sa.active)
   or sp.hierarchy in ('Principal','Coordinator')))
 then raise exception 'Choose an active teacher assigned to this student';end if;
 insert into public.stark02_meetings(contract_id,plan_id,student_id,teacher_id,starts_at,minutes,price_cents)
 values(contract.id,plan.id,contract.student_id,p_teacher,p_start,plan.minutes,plan.price_cents) returning id into mid;
 return mid;
end $$;

create function public.stark02_set_meeting_status(p_meeting uuid,p_status text)
 returns void language plpgsql security definer set search_path='' as $$
declare m public.stark02_meetings;
begin
 select * into m from public.stark02_meetings where id=p_meeting for update;
 if auth.uid() is null or not app_private.can_supervise_student(m.student_id,3)
 then raise exception 'Assigned teacher access required';end if;
 if p_status not in ('held','cancelled','scheduled') then raise exception 'Invalid meeting status';end if;
 if p_status='held' and m.starts_at>now() then raise exception 'A future meeting cannot be marked held';end if;
 if p_status='cancelled' and exists(select 1 from public.stark02_homework where from_meeting=m.id or due_meeting=m.id)
 then raise exception 'This meeting has linked homework; keep it scheduled until the learning plan is reviewed';end if;
 update public.stark02_meetings set status=p_status where id=m.id;
end $$;

create function public.stark02_record_tuition(p_contract uuid,p_month date)
 returns uuid language plpgsql security definer set search_path='' as $$
declare c public.stark02_contracts;tid uuid;total bigint;
begin
 select * into c from public.stark02_contracts where id=p_contract;
 if auth.uid() is null or not app_private.can_supervise_student(c.student_id,5) then raise exception 'Finance access required';end if;
 if p_month is null or extract(day from p_month)<>1 or date_trunc('month',p_month)<date_trunc('month',c.starts_on)
  or date_trunc('month',p_month)>date_trunc('month',c.ends_on) then raise exception 'Choose a month within the contract';end if;
 select sum(price_cents::bigint*times_per_week*4) into total from public.stark02_meeting_plans where contract_id=c.id;
 insert into public.stark02_tuitions(contract_id,month,amount_cents) values(c.id,p_month,total)
 on conflict(contract_id,month) do nothing;
 select id into tid from public.stark02_tuitions where contract_id=c.id and month=p_month;
 return tid;
end $$;
create function public.stark02_mark_tuition_paid(p_tuition uuid)
 returns void language plpgsql security definer set search_path='' as $$
declare sid uuid;
begin
 select c.student_id into sid from public.stark02_tuitions t join public.stark02_contracts c on c.id=t.contract_id where t.id=p_tuition;
 if auth.uid() is null or not app_private.can_supervise_student(sid,5) then raise exception 'Finance access required';end if;
 update public.stark02_tuitions set status='paid',paid_at=now() where id=p_tuition and status='pending';
end $$;

create function public.stark02_assign_homework(p_meeting uuid,p_label text,p_amount numeric,p_unit text,p_assignment uuid default null)
 returns uuid language plpgsql security definer set search_path='' as $$
declare m public.stark02_meetings;next_id uuid;deadline timestamptz;hid uuid;
begin
 select * into m from public.stark02_meetings where id=p_meeting;
 if auth.uid() is null or not app_private.can_supervise_student(m.student_id,3)
 then raise exception 'Assigned teacher access required';end if;
 if m.status='cancelled' then raise exception 'Use a scheduled or held meeting';end if;
 select id,starts_at into next_id,deadline from public.stark02_meetings
 where student_id=m.student_id and contract_id=m.contract_id and starts_at>m.starts_at and status='scheduled'
 order by starts_at limit 1;
 if next_id is null then raise exception 'Schedule the next meeting first; homework is due at that meeting';end if;
 if p_assignment is not null then
  if not exists(select 1 from public.lesson_assignments a join public.episodes e on e.id=a.episode_id
   join public.series s on s.id=e.series_id join public.stark02_contracts c on c.id=m.contract_id
   where a.id=p_assignment and a.student_id=m.student_id and s.course_id=c.course_id)
  then raise exception 'Homework lesson does not belong to this student and course';end if;
 end if;
 insert into public.stark02_homework(student_id,from_meeting,due_meeting,label,amount,unit,assignment_id)
 values(m.student_id,m.id,next_id,btrim(p_label),p_amount,p_unit,p_assignment) returning id into hid;
 if p_assignment is not null then update public.lesson_assignments set due_at=deadline where id=p_assignment;end if;
 return hid;
end $$;

create function public.stark02_commit_lesson(p_code text,p_amount numeric default 1,p_unit text default 'episode',p_due timestamptz default null)
 returns uuid language plpgsql security definer set search_path='' as $$
declare ep public.episodes;sid uuid:=auth.uid();aid uuid;teacher uuid;deadline timestamptz;
begin
 if sid is null then raise exception 'Sign in to commit to a lesson';end if;
 select e.* into ep from public.episodes e join public.series s on s.id=e.series_id
 join public.courses c on c.id=s.course_id join public.enrollments en on en.course_id=c.id and en.student_id=sid
 where e.code=p_code and e.code like 'AGRO02-%' and c.slug='agroenglish';
 if ep.id is null then raise exception 'Enroll in AgroEnglish before committing to its lessons';end if;
 if p_amount is null or p_amount<=0 or p_amount>1000 or p_unit is null or p_unit not in ('lesson','episode','chapter','activity','minute','hour')
 then raise exception 'Choose a positive amount and a learning unit';end if;
 if p_due is not null and (p_due<=now() or p_due>now()+interval '2 years') then raise exception 'Choose a future deadline within two years';end if;
 perform pg_advisory_xact_lock(hashtextextended(sid::text||ep.id::text,2));
 select a.id into aid from public.lesson_assignments a where a.student_id=sid and a.episode_id=ep.id order by created_at limit 1;
 if aid is not null then return aid;end if;
 select sa.staff_id into teacher from public.staff_student_assignments sa
 join public.staff_profiles sp on sp.user_id=sa.staff_id join public.teacher_profiles tp on tp.user_id=sa.staff_id
 where sa.student_id=sid and sa.active and sp.active and tp.active order by app_private.staff_rank(sp.hierarchy) desc limit 1;
 if teacher is null then
  select tp.user_id into teacher from public.teacher_profiles tp join public.staff_profiles sp on sp.user_id=tp.user_id
  where tp.active and sp.active and sp.hierarchy='Principal' order by sp.user_id limit 1;
 end if;
 select min(m.starts_at) into deadline from public.stark02_meetings m join public.stark02_contracts c on c.id=m.contract_id
  join public.series s on s.course_id=c.course_id where m.student_id=sid and s.id=ep.series_id
  and m.status='scheduled' and m.starts_at>now();
 deadline:=coalesce(deadline,p_due);
 if deadline is null then raise exception 'Choose a deadline, or ask your teacher to schedule your next meeting';end if;
 insert into public.lesson_assignments(episode_id,student_id,reviewer_mode,teacher_id,due_at)
 values(ep.id,sid,case when teacher is null then 'pool' else 'individual' end,teacher,deadline) returning id into aid;
 insert into public.stark02_commitments(student_id,episode_id,assignment_id,amount,unit)
 values(sid,ep.id,aid,p_amount,p_unit);
 return aid;
end $$;

create function public.stark02_log_work(p_session uuid,p_assignment uuid,p_seconds integer)
 returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or not exists(select 1 from public.lesson_assignments where id=p_assignment and student_id=auth.uid())
 then raise exception 'Learning session unavailable';end if;
 if p_seconds is null or p_seconds not between 0 and 14400 then raise exception 'Invalid session duration';end if;
 insert into public.stark02_work_sessions(id,student_id,assignment_id,seconds)
 values(p_session,auth.uid(),p_assignment,p_seconds)
 on conflict(id) do update set seconds=greatest(public.stark02_work_sessions.seconds,excluded.seconds),updated_at=now()
 where public.stark02_work_sessions.student_id=auth.uid() and public.stark02_work_sessions.assignment_id=p_assignment;
 if not found then raise exception 'This session belongs to another learning record';end if;
end $$;

-- Keep validation scoped to the new curriculum. Existing SVO and legacy AgroEnglish remain unchanged.
create function app_private.stark02_validate_attempt() returns trigger language plpgsql security definer set search_path='' as $$
declare code text;payload jsonb;skill text;mode text;file_list uuid[];
begin
 if new.status<>'submitted' or new.status is not distinct from old.status then return new;end if;
 select e.code into code from public.episodes e where e.id=new.episode_id;
 if code not like 'AGRO02-%' then return new;end if;
 select response->'value' into payload from public.lesson_responses where attempt_id=new.id and activity_key='agro02' and field_key='portfolio';
 if payload->>'code' is distinct from code then raise exception 'The evidence does not match this episode';end if;
 foreach skill in array array['substitute','change','translate','create'] loop
  if length(btrim(coalesce(payload->'practice'->>skill,'')))<3 then raise exception 'Complete all four rehearsal activities';end if;
 end loop;
 select d.config->>'modality' into mode from public.lesson_activity_definitions d where d.episode_id=new.episode_id and d.activity_key='agro02';
 select array_agg(id) into file_list from public.lesson_submission_files where attempt_id=new.id and activity_key='agro02_proof' and mime_type like 'audio/%' and bytes>0;
 if mode like 'Speaking%' and coalesce(array_length(file_list,1),0)=0 then raise exception 'Record or upload your spoken performance for this speaking skill';end if;
 if mode='Writing' and length(btrim(coalesce(payload->>'proof','')))<20 then raise exception 'Write your final performance before submitting';end if;
 if mode<>'Writing' and coalesce(array_length(file_list,1),0)=0 and length(btrim(coalesce(payload->>'proof','')))<20
 then raise exception 'Add your final evidence';end if;
 insert into public.stark02_evidence_versions(attempt_id,payload,file_ids)
 values(new.id,payload,coalesce(file_list,'{}'));
 return new;
end $$;
create trigger stark02_validate_submission before update of status on public.lesson_attempts
 for each row execute function app_private.stark02_validate_attempt();

create function app_private.stark02_validate_review() returns trigger language plpgsql security definer set search_path='' as $$
declare code text;k text;score jsonb;
begin
 select e.code into code from public.episodes e join public.lesson_attempts a on a.episode_id=e.id where a.id=new.attempt_id;
 if code not like 'AGRO02-%' or new.outcome<>'finalized' then return new;end if;
 foreach k in array array['task','communication','language'] loop
  score:=new.rubric_scores->k;
  if jsonb_typeof(score) is distinct from 'number' then raise exception 'Assess every criterion on the 0–4 rubric';end if;
  if (score::text)::numeric not between 0 and 4 or trunc((score::text)::numeric)<>(score::text)::numeric
  then raise exception 'Rubric scores must be whole numbers from 0 to 4';end if;
 end loop;
 return new;
end $$;
create trigger stark02_validate_review before insert on public.lesson_reviews for each row execute function app_private.stark02_validate_review();

create function public.stark02_student_file(p_student uuid) returns jsonb
 language plpgsql stable security definer set search_path='' as $$
declare financial boolean;
begin
 if auth.uid() is null or (p_student<>auth.uid() and not app_private.can_supervise_student(p_student,1))
 then raise exception 'Student file unavailable';end if;
 financial:=p_student=auth.uid() or app_private.can_supervise_student(p_student,5);
 return jsonb_build_object(
  'canManage',app_private.can_supervise_student(p_student,5),'canTeach',app_private.can_supervise_student(p_student,3),'financial',financial,
  'contracts',coalesce((select jsonb_agg(jsonb_build_object('id',c.id,'course_id',c.course_id,'course',co.title,
    'starts_on',c.starts_on,'ends_on',c.ends_on,'status',c.status,
    'plans',(select coalesce(jsonb_agg(jsonb_build_object('id',p.id,'contract_id',p.contract_id,'minutes',p.minutes,
      'times_per_week',p.times_per_week,'price_cents',case when financial then p.price_cents else null end)),'[]')
      from public.stark02_meeting_plans p where p.contract_id=c.id),
    'monthlyCents',case when financial then (select coalesce(sum(p.price_cents::bigint*p.times_per_week*4),0)
      from public.stark02_meeting_plans p where p.contract_id=c.id) else null end))
    from public.stark02_contracts c join public.courses co on co.id=c.course_id where c.student_id=p_student),'[]'),
  'meetings',coalesce((select jsonb_agg((to_jsonb(m)-'price_cents')||jsonb_build_object('teacher',p.full_name,
    'price_cents',case when financial then m.price_cents else null end) order by m.starts_at)
    from public.stark02_meetings m join public.profiles p on p.id=m.teacher_id where m.student_id=p_student),'[]'),
  'tuitions',case when financial then coalesce((select jsonb_agg(to_jsonb(t) order by t.month desc) from public.stark02_tuitions t
    join public.stark02_contracts c on c.id=t.contract_id where c.student_id=p_student),'[]') else '[]'::jsonb end,
  'homework',coalesce((select jsonb_agg(to_jsonb(h)||jsonb_build_object('dueAt',m.starts_at) order by m.starts_at)
    from public.stark02_homework h join public.stark02_meetings m on m.id=h.due_meeting where h.student_id=p_student),'[]'),
  'commitments',coalesce((select jsonb_agg(to_jsonb(k)||jsonb_build_object('title',e.title,'code',e.code,'dueAt',a.due_at,
    'status',(select x.status from public.lesson_attempts x where x.assignment_id=k.assignment_id order by x.created_at desc limit 1)))
    from public.stark02_commitments k join public.episodes e on e.id=k.episode_id join public.lesson_assignments a on a.id=k.assignment_id
    where k.student_id=p_student),'[]')
 );
end $$;

-- Definer RPCs are the only write path; every entry point checks authenticated ownership/role.
revoke all on function public.stark02_create_contract(uuid,uuid,date,date,jsonb),public.stark02_schedule_meeting(uuid,uuid,timestamptz),
 public.stark02_set_meeting_status(uuid,text),public.stark02_record_tuition(uuid,date),public.stark02_mark_tuition_paid(uuid),
 public.stark02_assign_homework(uuid,text,numeric,text,uuid),public.stark02_commit_lesson(text,numeric,text,timestamptz),
 public.stark02_log_work(uuid,uuid,integer),public.stark02_student_file(uuid) from public,anon;
grant execute on function public.stark02_create_contract(uuid,uuid,date,date,jsonb),public.stark02_schedule_meeting(uuid,uuid,timestamptz),
 public.stark02_set_meeting_status(uuid,text),public.stark02_record_tuition(uuid,date),public.stark02_mark_tuition_paid(uuid),
 public.stark02_assign_homework(uuid,text,numeric,text,uuid),public.stark02_commit_lesson(text,numeric,text,timestamptz),
 public.stark02_log_work(uuid,uuid,integer),public.stark02_student_file(uuid) to authenticated;
revoke all on function app_private.stark02_validate_attempt(),app_private.stark02_validate_review() from public,anon,authenticated;
commit;
