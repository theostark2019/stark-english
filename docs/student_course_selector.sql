
-- Course explorer & supervised student choice.
-- Catalog metadata contains no private lesson bodies, and browsing never changes enrollment.
create table if not exists public.student_course_requests(
 id uuid primary key default gen_random_uuid(),
 student_id uuid not null references public.profiles(id) on delete cascade,
 course_id uuid not null references public.courses(id) on delete cascade,
 status text not null default 'pending' check(status in ('pending','approved','declined','withdrawn')),
 requested_at timestamptz not null default now(),
 reviewed_at timestamptz,
 reviewed_by uuid references public.profiles(id),
 review_note text not null default '' check(char_length(review_note)<=1200)
);
create unique index if not exists one_open_student_course_request
 on public.student_course_requests(student_id) where status='pending';
create index if not exists student_course_requests_course_status
 on public.student_course_requests(course_id,status);
alter table public.student_course_requests enable row level security;
revoke all on public.student_course_requests from anon,authenticated;
grant select on public.student_course_requests to authenticated;
drop policy if exists read_own_course_requests on public.student_course_requests;
create policy read_own_course_requests on public.student_course_requests for select to authenticated
 using (student_id=auth.uid() or app_private.staff_rank(app_private.staff_level())>=3);

create or replace function public.course_preview_catalog()
returns jsonb language sql stable security definer set search_path='' as $$
select coalesce(jsonb_agg(jsonb_build_object(
 'id',c.id,'slug',c.slug,'title',c.title,'description',coalesce(c.description,''),
 'seriesCount',(select count(*) from public.series s where s.course_id=c.id),
 'episodeCount',(select count(*) from public.episodes e join public.series s on s.id=e.series_id where s.course_id=c.id),
 'publishedCount',(select count(*) from public.episodes e join public.series s on s.id=e.series_id where s.course_id=c.id and e.status='published'),
 'series',coalesce((
   select jsonb_agg(jsonb_build_object(
      'name',ss.name,'count',(select count(*) from public.episodes e where e.series_id=ss.id),
      'published',(select count(*) from public.episodes e where e.series_id=ss.id and e.status='published'),
      'levels',coalesce((select jsonb_agg(distinct e.level) from public.episodes e where e.series_id=ss.id),'[]'::jsonb)
   ) order by ss.name)
   from public.series ss where ss.course_id=c.id
 ),'[]'::jsonb),
 'publishedEpisodes',coalesce((
   select jsonb_agg(jsonb_build_object('title',t.title,'code',t.code,'level',t.level,'minutes',t.minutes)
      order by t.code)
   from (select e.title,e.code,e.level,e.minutes
    from public.episodes e join public.series s on s.id=e.series_id
    where s.course_id=c.id and e.status='published'
    order by e.code limit 12) t
 ),'[]'::jsonb)
) order by c.title),'[]'::jsonb)
from public.courses c
$$;
-- Public preview contains only course names and already-published lesson metadata.
revoke all on function public.course_preview_catalog() from public,anon,authenticated;
grant execute on function public.course_preview_catalog() to anon,authenticated;

create or replace function public.student_choose_course(p_course uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); rec record; pending_id uuid; enrolled boolean;
begin
 if uid is null then raise exception 'Sign in to choose a course';end if;
 if not exists(select 1 from public.profiles where id=uid) then raise exception 'Student profile not found';end if;
 select id,title,slug into rec from public.courses where id=p_course;
 if rec.id is null then raise exception 'Course not found';end if;
 select exists(select 1 from public.enrollments en where en.student_id=uid and en.course_id=p_course) into enrolled;
 if enrolled then
   return jsonb_build_object('status','enrolled','courseId',rec.id,'courseTitle',rec.title);
 end if;
 select id into pending_id from public.student_course_requests
 where student_id=uid and course_id=p_course and status='pending' limit 1;
 if pending_id is not null then
   return jsonb_build_object('status','pending','courseId',rec.id,'courseTitle',rec.title,'requestId',pending_id);
 end if;
 update public.student_course_requests
 set status='withdrawn', reviewed_at=now(), review_note='Replaced by a new student choice'
 where student_id=uid and status='pending';
 insert into public.student_course_requests(student_id,course_id)
 values(uid,p_course) returning id into pending_id;
 return jsonb_build_object('status','pending','courseId',rec.id,'courseTitle',rec.title,'requestId',pending_id);
end $$;

create or replace function public.student_course_status()
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare uid uuid:=auth.uid(); data jsonb;
begin
 if uid is null then return jsonb_build_object('signedIn',false,'enrolled', '[]'::jsonb,'pending',null); end if;
 select jsonb_build_object(
  'signedIn',true,
  'enrolled',coalesce((select jsonb_agg(c.slug) from public.enrollments e join public.courses c on c.id=e.course_id where e.student_id=uid),'[]'::jsonb),
  'pending',(select jsonb_build_object('courseId',c.id,'slug',c.slug,'title',c.title)
    from public.student_course_requests r join public.courses c on c.id=r.course_id
    where r.student_id=uid and r.status='pending' order by r.requested_at desc limit 1)
 ) into data;
 return data;
end $$;

create or replace function public.teacher_course_requests()
returns table(request_id uuid,student_id uuid,student_name text,course_id uuid,course_slug text,
 course_title text,requested_at timestamptz)
language plpgsql stable security definer set search_path='' as $$
begin
 if auth.uid() is null or app_private.staff_rank(app_private.staff_level())<3
 then raise exception 'Active Teacher role required';end if;
 return query select r.id,r.student_id,p.full_name,r.course_id,c.slug,c.title,r.requested_at
 from public.student_course_requests r
 join public.profiles p on p.id=r.student_id
 join public.courses c on c.id=r.course_id
 where r.status='pending' and (
  app_private.staff_rank(app_private.staff_level())>=5
  or app_private.can_supervise_student(r.student_id,3))
 order by r.requested_at asc;
end $$;

create or replace function public.teacher_review_course_request(p_request uuid,p_approve boolean,p_note text default '')
returns jsonb language plpgsql security definer set search_path='' as $$
declare r public.student_course_requests; staff_id uuid:=auth.uid();
begin
 select * into r from public.student_course_requests where id=p_request for update;
 if not found or r.status<>'pending' then raise exception 'Pending request not found';end if;
 if staff_id is null or (
  app_private.staff_rank(app_private.staff_level())<5
  and not app_private.can_supervise_student(r.student_id,3)
 ) then raise exception 'Not authorized to review course choice';end if;
 if char_length(coalesce(p_note,''))>1200 then raise exception 'Review note too long';end if;
 if p_approve then
  insert into public.enrollments(student_id,course_id) values(r.student_id,r.course_id)
  on conflict(student_id,course_id) do nothing;
  insert into public.staff_student_assignments(staff_id,student_id,active)
  values(staff_id,r.student_id,true)
  on conflict(staff_id,student_id) do update set active=true;
 end if;
 update public.student_course_requests
 set status=case when p_approve then 'approved' else 'declined' end,
 reviewed_by=staff_id,reviewed_at=now(),review_note=coalesce(p_note,'')
 where id=r.id;
 return jsonb_build_object('status',case when p_approve then 'approved' else 'declined' end,
  'studentId',r.student_id,'courseId',r.course_id);
end $$;

revoke all on function public.student_choose_course(uuid),
 public.student_course_status(),public.teacher_course_requests(),
 public.teacher_review_course_request(uuid,boolean,text) from public,anon,authenticated;
grant execute on function public.student_choose_course(uuid),public.student_course_status(),
 public.teacher_course_requests(),public.teacher_review_course_request(uuid,boolean,text)
 to authenticated;
grant execute on function public.student_course_status() to anon;
