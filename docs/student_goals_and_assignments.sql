-- 2026-11-13 Student learning goals, achievements and teacher assignment workflow.
-- All changes additive, no user-specific records are inserted.
create table if not exists public.student_learning_goals (
 id uuid primary key default gen_random_uuid(),
 student_id uuid not null references public.profiles(id) on delete cascade,
 title text not null check (char_length(title) between 3 and 180),
 description text not null default '' check(char_length(description)<=2500),
 domain text not null default 'General English' check(char_length(domain) between 2 and 80),
 target_value integer not null default 1 check(target_value between 1 and 1000),
 progress_value integer not null default 0 check(progress_value>=0),
 due_on date,
 status text not null default 'active' check(status in ('active','paused','achieved')),
 achieved_at timestamptz,
 created_by uuid not null references public.profiles(id),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 constraint learning_goal_count_valid check(progress_value<=target_value),
 constraint learning_goal_achievement_valid check(
   (status='achieved' and progress_value=target_value and achieved_at is not null)
   or (status<>'achieved' and progress_value<target_value and achieved_at is null))
);
create index if not exists student_goals_student_created
 on public.student_learning_goals(student_id,created_at desc);
create table if not exists public.student_goal_activities (
 id uuid primary key default gen_random_uuid(),
 goal_id uuid not null references public.student_learning_goals(id) on delete cascade,
 event_type text not null check (event_type in ('created','progress','achieved','paused','resumed')),
 units integer not null default 0 check(units>=0),
 note text not null default '' check(char_length(note)<=2500),
 assignment_id uuid references public.lesson_assignments(id),
 actor_id uuid not null references public.profiles(id),
 created_at timestamptz not null default now()
);
create index if not exists student_goal_activities_goal_date on public.student_goal_activities(goal_id,created_at desc);
create table if not exists public.student_goal_assignments(
 goal_id uuid not null references public.student_learning_goals(id) on delete cascade,
 assignment_id uuid not null references public.lesson_assignments(id) on delete cascade,
 created_by uuid not null references public.profiles(id),
 created_at timestamptz not null default now(),
 primary key(goal_id,assignment_id)
);
create index if not exists student_goal_assignments_assignment on public.student_goal_assignments(assignment_id);
alter table public.student_learning_goals enable row level security;
alter table public.student_goal_activities enable row level security;
alter table public.student_goal_assignments enable row level security;
revoke all on public.student_learning_goals,public.student_goal_activities,public.student_goal_assignments from anon,authenticated;
grant select on public.student_learning_goals,public.student_goal_activities,public.student_goal_assignments to authenticated;
create policy student_goal_view on public.student_learning_goals for select to authenticated using
 (student_id=auth.uid() or app_private.can_supervise_student(student_id,1));
create policy student_goal_activity_view on public.student_goal_activities for select to authenticated using
 (exists(select 1 from public.student_learning_goals g where g.id=goal_id and
 (g.student_id=auth.uid() or app_private.can_supervise_student(g.student_id,1))));
create policy student_goal_assignment_view on public.student_goal_assignments for select to authenticated using
 (exists(select 1 from public.student_learning_goals g where g.id=goal_id and
 (g.student_id=auth.uid() or app_private.can_supervise_student(g.student_id,1))));

create or replace function public.supervision_create_goal(
 p_student uuid,p_title text,p_domain text,p_description text default '',p_target integer default 1,p_due date default null
) returns uuid
language plpgsql security definer set search_path='' as $$
declare result uuid;
begin
 if auth.uid() is null or not app_private.can_supervise_student(p_student,2) then
  raise exception 'Not authorized to create goals'; end if;
 if char_length(trim(coalesce(p_title,''))) not between 3 and 180
 or char_length(trim(coalesce(p_domain,''))) not between 2 and 80
 or char_length(coalesce(p_description,''))>2500
 or p_target not between 1 and 1000 then raise exception 'Invalid goal parameters'; end if;
 insert into public.student_learning_goals(student_id,title,domain,description,target_value,due_on,created_by)
 values(p_student,trim(p_title),trim(p_domain),coalesce(p_description,''),p_target,p_due,auth.uid())
 returning id into result;
 insert into public.student_goal_activities(goal_id,event_type,note,actor_id)
 values(result,'created','Goal established',auth.uid());
 return result;
end $$;

create or replace function public.supervision_record_goal_progress(
 p_goal uuid,p_units integer,p_note text,p_assignment uuid default null
) returns public.student_learning_goals
language plpgsql security definer set search_path='' as $$
declare goal public.student_learning_goals; actual integer; next_status text;
begin
 select * into goal from public.student_learning_goals where id=p_goal for update;
 if not found or auth.uid() is null or not app_private.can_supervise_student(goal.student_id,2)
 then raise exception 'Not authorized to assess this goal'; end if;
 if goal.status<>'active' then raise exception 'This goal is not active'; end if;
 if p_units is null or p_units<1 or p_units>1000 then raise exception 'Progress must be positive'; end if;
 if char_length(trim(coalesce(p_note,''))) not between 8 and 2500
 then raise exception 'Write an evidence note (at least 8 characters)'; end if;
 if p_assignment is not null and not exists
 (select 1 from public.lesson_assignments a where a.id=p_assignment and a.student_id=goal.student_id)
 then raise exception 'Evidence must belong to this student'; end if;
 actual:=least(p_units,goal.target_value-goal.progress_value);
 if actual=0 then raise exception 'Goal already complete'; end if;
 next_status:=case when goal.progress_value+actual=goal.target_value then 'achieved' else 'active' end;
 update public.student_learning_goals set
 progress_value=progress_value+actual,status=next_status,
 achieved_at=case when next_status='achieved' then now() else null end,
 updated_at=now()
 where id=goal.id returning * into goal;
 insert into public.student_goal_activities(goal_id,event_type,units,note,assignment_id,actor_id)
 values(goal.id,case when next_status='achieved' then 'achieved' else 'progress' end,
 actual,trim(p_note),p_assignment,auth.uid());
 return goal;
end $$;

create or replace function public.supervision_set_goal_state(
 p_goal uuid,p_state text,p_note text default ''
) returns public.student_learning_goals
language plpgsql security definer set search_path='' as $$
declare goal public.student_learning_goals;
begin
 select * into goal from public.student_learning_goals where id=p_goal for update;
 if not found or auth.uid() is null or not app_private.can_supervise_student(goal.student_id,2)
 then raise exception 'Not authorized to change goal state'; end if;
 if goal.status='achieved' then raise exception 'Achieved goals are permanent historical records'; end if;
 if p_state not in ('active','paused') then raise exception 'Invalid state'; end if;
 if goal.status=p_state then return goal; end if;
 if char_length(coalesce(p_note,''))>2500 then raise exception 'Note is too long';end if;
 update public.student_learning_goals set status=p_state,updated_at=now() where id=p_goal returning * into goal;
 insert into public.student_goal_activities(goal_id,event_type,note,actor_id)
 values(p_goal,case when p_state='paused' then 'paused' else 'resumed' end,
 coalesce(p_note,''),auth.uid());
 return goal;
end $$;

create or replace function public.supervision_available_lessons(p_student uuid)
returns table(
 episode_id uuid,episode_title text,episode_code text,episode_level text,
 series_name text,course_title text,assigned_id uuid
) language plpgsql stable security definer set search_path='' as $$
begin
 if auth.uid() is null or not app_private.can_supervise_student(p_student,3)
 then raise exception 'Not authorized to assign lessons'; end if;
 return query
 select e.id,e.title,e.code,e.level,s.name,c.title,a.id
 from public.enrollments en
 join public.courses c on c.id=en.course_id
 join public.series s on s.course_id=c.id
 join public.episodes e on e.series_id=s.id and e.status='published'
 left join public.lesson_assignments a on a.episode_id=e.id and a.student_id=p_student
 where en.student_id=p_student
 order by c.title,s.name,e.code
 limit 1000;
end $$;

create or replace function public.supervision_assign_lesson(
 p_student uuid,p_episode uuid,p_due timestamptz default null,p_goal uuid default null
) returns uuid
language plpgsql security definer set search_path='' as $$
declare course uuid; result uuid; teacher uuid; existing boolean:=false;
begin
 if auth.uid() is null or not app_private.can_supervise_student(p_student,3)
 then raise exception 'Not authorized to assign lessons'; end if;
 select s.course_id into course
 from public.episodes e join public.series s on s.id=e.series_id
 where e.id=p_episode and e.status='published';
 if course is null or not exists(select 1 from public.enrollments en
 where en.student_id=p_student and en.course_id=course)
 then raise exception 'Lesson is not published in an enrolled course'; end if;
 if p_due is not null and p_due<=now() then raise exception 'Deadline must be in the future'; end if;
 if p_goal is not null and not exists(select 1 from public.student_learning_goals g
   where g.id=p_goal and g.student_id=p_student)
 then raise exception 'The selected goal does not belong to this student';end if;
 select id into result from public.lesson_assignments where student_id=p_student and episode_id=p_episode;
 existing:=result is not null;
 if not existing then
   select user_id into teacher from public.teacher_profiles
   where user_id=auth.uid() and active;
   if teacher is null then raise exception 'Active teacher credentials required for lesson review';end if;
   insert into public.lesson_assignments(episode_id,student_id,reviewer_mode,teacher_id,teacher_group_id,due_at)
   values(p_episode,p_student,'individual',teacher,null,p_due) returning id into result;
 end if;
 -- Existing assignments are never silently overwritten.
 if p_goal is not null then
  insert into public.student_goal_assignments(goal_id,assignment_id,created_by)
  values(p_goal,result,auth.uid()) on conflict(goal_id,assignment_id) do nothing;
 end if;
 return result;
end $$;

create or replace function public.supervision_student_learning_record(p_student uuid)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare record jsonb;
begin
 if auth.uid() is null or not app_private.can_supervise_student(p_student,1)
 then raise exception 'Not authorized to view this learning record';end if;
 select jsonb_build_object(
 'goals',coalesce((select jsonb_agg(to_jsonb(g) order by g.created_at desc)
 from public.student_learning_goals g where g.student_id=p_student),'[]'::jsonb),
 'goalEvents',coalesce((select jsonb_agg(
  jsonb_build_object('id',x.id,'goalId',x.goal_id,'eventType',x.event_type,
   'units',x.units,'note',x.note,'createdAt',x.created_at,
   'actorName',coalesce(nullif(p.full_name,''),'Staff member'),
   'assignmentId',x.assignment_id,'episodeTitle',e.title)
   order by x.created_at desc,x.id desc)
 from public.student_goal_activities x
 join public.student_learning_goals g on g.id=x.goal_id
 left join public.profiles p on p.id=x.actor_id
 left join public.lesson_assignments a on a.id=x.assignment_id
 left join public.episodes e on e.id=a.episode_id
 where g.student_id=p_student),'[]'::jsonb),
 'goalAssignments',coalesce((select jsonb_agg(
 jsonb_build_object('goalId',ga.goal_id,'assignmentId',ga.assignment_id,
 'code',e.code,'title',e.title,'createdAt',ga.created_at)
 order by ga.created_at desc)
 from public.student_goal_assignments ga
 join public.student_learning_goals g on g.id=ga.goal_id
 join public.lesson_assignments a on a.id=ga.assignment_id
 join public.episodes e on e.id=a.episode_id
 where g.student_id=p_student),'[]'::jsonb),
 'feedback',coalesce((select jsonb_agg(
 jsonb_build_object('id',t.id,'episode',e.title,'code',e.code,'feedback',t.feedback,
   'outcome',t.outcome,'createdAt',t.created_at,
   'teacherName',coalesce(nullif(p.full_name,''),'Teacher'))
 order by t.created_at desc,t.id desc)
 from public.lesson_reviews t
 join public.lesson_attempts a on a.id=t.attempt_id
 join public.episodes e on e.id=a.episode_id
 left join public.profiles p on p.id=t.teacher_id
 where a.student_id=p_student),'[]'::jsonb)
 ) into record;
 return record;
end $$;

-- Default EXECUTE privilege on functions is PUBLIC; explicitly restrict all new APIs.
revoke all on function public.supervision_create_goal(uuid,text,text,text,integer,date) from public,anon,authenticated;
revoke all on function public.supervision_record_goal_progress(uuid,integer,text,uuid) from public,anon,authenticated;
revoke all on function public.supervision_set_goal_state(uuid,text,text) from public,anon,authenticated;
revoke all on function public.supervision_available_lessons(uuid) from public,anon,authenticated;
revoke all on function public.supervision_assign_lesson(uuid,uuid,timestamptz,uuid) from public,anon,authenticated;
revoke all on function public.supervision_student_learning_record(uuid) from public,anon,authenticated;
grant execute on function public.supervision_create_goal(uuid,text,text,text,integer,date),
 public.supervision_record_goal_progress(uuid,integer,text,uuid),
 public.supervision_set_goal_state(uuid,text,text),
 public.supervision_available_lessons(uuid),
 public.supervision_assign_lesson(uuid,uuid,timestamptz,uuid),
 public.supervision_student_learning_record(uuid) to authenticated;
