-- Estimated learning credit is awarded only when a teacher finalizes an LMS attempt.
-- This is a planned-duration credit, NOT a stopwatch measurement. One credit per student/episode.
create table if not exists public.lesson_completion_credits(
 id uuid primary key default gen_random_uuid(),
 student_id uuid not null references public.profiles(id) on delete cascade,
 episode_id uuid not null references public.episodes(id),
 attempt_id uuid not null references public.lesson_attempts(id),
 minutes integer not null check(minutes > 0),
 credited_at timestamptz not null default now(),
 unique(student_id,episode_id),
 unique(attempt_id)
);
create index if not exists lesson_completion_credits_student_idx
 on public.lesson_completion_credits(student_id,credited_at desc);
alter table public.lesson_completion_credits enable row level security;
revoke all on public.lesson_completion_credits from public,anon,authenticated;
grant select on public.lesson_completion_credits to authenticated;
drop policy if exists lesson_completion_student_read on public.lesson_completion_credits;
create policy lesson_completion_student_read on public.lesson_completion_credits
 for select to authenticated
 using (student_id=(select auth.uid()) or app_private.can_supervise_student(student_id,1));

create or replace function app_private.credit_finalized_lesson_attempt()
returns trigger language plpgsql security definer set search_path='' as $$
declare planned integer;
begin
 if new.status='finalized' and (tg_op='INSERT' or old.status is distinct from 'finalized') then
  if not exists(
    select 1 from public.lesson_assignments a
    where a.id=new.assignment_id and a.student_id=new.student_id and a.episode_id=new.episode_id
  ) then raise exception 'Finalized attempt assignment mismatch';end if;
  select minutes into planned from public.episodes where id=new.episode_id;
  if planned is null or planned<=0 then raise exception 'Estimated minutes are invalid';end if;
  insert into public.lesson_completion_credits(student_id,episode_id,attempt_id,minutes)
    values(new.student_id,new.episode_id,new.id,planned)
    on conflict(student_id,episode_id) do nothing;
 end if;
 return new;
end $$;
drop trigger if exists credit_finalized_lesson on public.lesson_attempts;
create trigger credit_finalized_lesson
 after insert or update of status on public.lesson_attempts for each row
 execute function app_private.credit_finalized_lesson_attempt();

-- Backfill pre-existing finalized LMS attempts without duplicates.
insert into public.lesson_completion_credits(student_id,episode_id,attempt_id,minutes,credited_at)
select distinct on (a.student_id,a.episode_id)
 a.student_id,a.episode_id,a.id,e.minutes,coalesce(a.finalized_at,a.updated_at)
from public.lesson_attempts a
join public.lesson_assignments x on x.id=a.assignment_id and x.student_id=a.student_id and x.episode_id=a.episode_id
join public.episodes e on e.id=a.episode_id
where a.status='finalized' and e.minutes>0
order by a.student_id,a.episode_id,a.finalized_at asc nulls last,a.created_at
on conflict(student_id,episode_id) do nothing;

-- A student's self-check is about PRIOR KNOWLEDGE only, never mastery or credit.
create table if not exists public.stark_collection_skill_definitions(
 collection_id uuid not null references public.stark_catalog_collections(id) on delete cascade,
 skill_key text not null check(skill_key ~ '^[a-z][a-z0-9_]{1,60}$'),
 skill_label text not null,
 sort_order integer not null,
 primary key(collection_id,skill_key)
);
create table if not exists public.stark_collection_self_checks(
 student_id uuid not null references public.profiles(id) on delete cascade,
 collection_id uuid not null,
 skill_key text not null,
 checked boolean not null default false,
 updated_at timestamptz not null default now(),
 primary key(student_id,collection_id,skill_key),
 foreign key(collection_id,skill_key) references public.stark_collection_skill_definitions(collection_id,skill_key) on delete cascade
);
alter table public.stark_collection_skill_definitions enable row level security;
alter table public.stark_collection_self_checks enable row level security;
revoke all on public.stark_collection_skill_definitions,public.stark_collection_self_checks from public,anon,authenticated;

with c as(select id from public.stark_catalog_collections where slug='svo')
insert into public.stark_collection_skill_definitions(collection_id,skill_key,skill_label,sort_order)
select c.id, v.skill_key,v.skill_label,v.sort_order from c cross join(values
 ('basic_sentences','Build simple sentences using subject, verb and object',1),
 ('routines','Describe routines, preferences and everyday activities',2),
 ('be_sentences','Use am, is and are in descriptions, negatives and questions',3),
 ('questions','Ask and answer questions with do, does and WH words',4),
 ('past_events','Describe past events and ask questions with did',5)
) v(skill_key,skill_label,sort_order)
on conflict(collection_id,skill_key) do update
 set skill_label=excluded.skill_label,sort_order=excluded.sort_order;

create or replace function public.stark_collection_self_check(
 p_slug text,p_skill_key text,p_checked boolean
) returns boolean language plpgsql security definer set search_path='' as $$
declare me uuid:=auth.uid(); coll uuid; parent_course uuid;
begin
 if me is null then raise exception 'Please sign in';end if;
 select c.id,c.course_id into coll,parent_course from public.stark_catalog_collections c
 where c.slug=p_slug and c.course_id=(select id from public.courses where slug='stark-english');
 if coll is null then raise exception 'Unknown collection';end if;
 if not exists(select 1 from public.enrollments en where en.student_id=me and en.course_id=parent_course)
 then raise exception 'Stark English enrollment is required';end if;
 if not exists(select 1 from public.stark_collection_skill_definitions k
  where k.collection_id=coll and k.skill_key=p_skill_key) then
  raise exception 'Unknown learning outcome';end if;
 insert into public.stark_collection_self_checks(student_id,collection_id,skill_key,checked)
 values(me,coll,p_skill_key,p_checked)
 on conflict(student_id,collection_id,skill_key)
 do update set checked=excluded.checked,updated_at=now();
 return p_checked;
end $$;
revoke all on function public.stark_collection_self_check(text,text,boolean) from public,anon,authenticated;
grant execute on function public.stark_collection_self_check(text,text,boolean) to authenticated;

-- Course detail: no personally identifying data for anonymous users.
-- Progress is calculated over the entire catalog, not merely assigned units.
create or replace function public.stark_collection_progress(p_slug text)
returns jsonb language sql stable security definer set search_path='' as $$
with coll as (
 select x.id,x.course_id from public.stark_catalog_collections x
 join public.courses c on c.id=x.course_id
 where x.slug=p_slug and c.slug='stark-english'
),
viewer as (
 select auth.uid() as uid,
 exists(select 1 from public.enrollments en join coll on coll.course_id=en.course_id
  where en.student_id=auth.uid()) as enrolled
),
units as (
 select u.code,u.sequence_no,u.kind,u.episode_id,coalesce(e.minutes,0) as expected_minutes,
  a.id as assignment_id,
  case when a.id is null then 'not_assigned'
    when z.id is null then 'assigned'
    when z.status='finalized' then 'completed'
    when z.status in ('submitted','claimed') then 'awaiting_review'
    when z.status='revision_requested' then 'revision_requested'
    when z.status='draft' then 'in_progress'
    else 'assigned' end as progress_status,
  coalesce(lc.minutes,0) as credited_minutes
 from public.stark_catalog_units u
 join coll on coll.id=u.collection_id
 left join public.episodes e on e.id=u.episode_id
 cross join viewer v
 left join lateral (
  select a.id from public.lesson_assignments a
   where a.student_id=v.uid and a.episode_id=u.episode_id and v.enrolled
   order by a.created_at desc,a.id desc limit 1
 ) a on true
 left join lateral (
   select t.id,t.status from public.lesson_attempts t
    where t.assignment_id=a.id and t.student_id=v.uid and t.episode_id=u.episode_id
    order by (t.status='finalized') desc,t.created_at desc limit 1
 ) z on true
 left join public.lesson_completion_credits lc on
  lc.student_id=v.uid and lc.episode_id=u.episode_id and v.enrolled
)
select coalesce((select jsonb_build_object(
 'signedIn',(v.uid is not null),'enrolled',v.enrolled,
 'totalUnits',(select count(*) from units),
 'assignedUnits',(select count(*) from units where assignment_id is not null),
 'completedUnits',(select count(*) from units where progress_status='completed'),
 'expectedMinutes',(select coalesce(sum(expected_minutes),0) from units),
 'earnedMinutes',(select coalesce(sum(credited_minutes),0) from units),
 'units',(select coalesce(jsonb_agg(jsonb_build_object(
   'code',u.code,'assignmentId',u.assignment_id,
   'status',u.progress_status,'minutes',u.expected_minutes
 ) order by u.sequence_no),'[]'::jsonb) from units u),
 'skills',(select coalesce(jsonb_agg(jsonb_build_object(
  'key',k.skill_key,'label',k.skill_label,'checked',coalesce(sc.checked,false)
 ) order by k.sort_order),'[]'::jsonb)
 from public.stark_collection_skill_definitions k
 join coll on coll.id=k.collection_id
 left join public.stark_collection_self_checks sc on
  sc.collection_id=k.collection_id and sc.skill_key=k.skill_key
  and sc.student_id=v.uid and v.enrolled)
) from viewer v),'null'::jsonb);
$$;
revoke all on function public.stark_collection_progress(text) from public,anon,authenticated;
grant execute on function public.stark_collection_progress(text) to anon,authenticated;