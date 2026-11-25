-- AgroEnglish Agriculture 101 course media: images and A1/A2 narrated readings.
-- Public assets are teaching media, never student data or audio submissions.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('agro-course-media','agro-course-media',true,8388608,
 array['image/jpeg','image/png','image/webp','audio/mpeg'])
on conflict(id) do update
 set public=true,file_size_limit=8388608,
 allowed_mime_types=array['image/jpeg','image/png','image/webp','audio/mpeg'];

create table if not exists public.agro_course_media(
 episode_code text not null references public.episodes(code),
 slot text not null check(slot in (
  'hero','a1-coffee','a1-farmwork','a1-visual-story','a2-mixed-farms',
  'a2-photo-story','a2-field-notes','a1-audio','a2-audio'
 )),
 storage_path text not null unique,
 mime_type text not null check(mime_type in ('image/jpeg','image/png','image/webp','audio/mpeg')),
 byte_size integer not null check(byte_size between 1 and 8388608),
 uploaded_by uuid not null references public.profiles(id),
 updated_at timestamptz not null default now(),
 primary key(episode_code,slot)
);
alter table public.agro_course_media enable row level security;
revoke all on public.agro_course_media from public,anon,authenticated;
grant select on public.agro_course_media to anon,authenticated;
grant insert,update,delete on public.agro_course_media to authenticated;
drop policy if exists agro_media_public_read on public.agro_course_media;
create policy agro_media_public_read on public.agro_course_media
 for select to anon,authenticated using(true);

create or replace function public.agro_media_is_editor()
returns boolean language sql stable security definer set search_path='' as $$
select auth.uid() is not null and exists(
 select 1 from public.staff_profiles sp
 where sp.user_id=auth.uid() and sp.active and sp.hierarchy='Principal'
);
$$;
revoke all on function public.agro_media_is_editor() from public,anon,authenticated;
grant execute on function public.agro_media_is_editor() to authenticated;

drop policy if exists agro_media_editor_insert on public.agro_course_media;
create policy agro_media_editor_insert on public.agro_course_media
 for insert to authenticated with check(
 public.agro_media_is_editor() and uploaded_by=auth.uid()
 and episode_code='AGRO-A1-01'
 and storage_path like 'agriculture101/%'
);
drop policy if exists agro_media_editor_update on public.agro_course_media;
create policy agro_media_editor_update on public.agro_course_media
 for update to authenticated using(public.agro_media_is_editor())
 with check(public.agro_media_is_editor() and uploaded_by=auth.uid()
 and episode_code='AGRO-A1-01' and storage_path like 'agriculture101/%');
drop policy if exists agro_media_editor_delete on public.agro_course_media;
create policy agro_media_editor_delete on public.agro_course_media
 for delete to authenticated using(public.agro_media_is_editor());

drop policy if exists agro_course_media_upload on storage.objects;
create policy agro_course_media_upload on storage.objects for insert to authenticated
 with check(bucket_id='agro-course-media'
  and (storage.foldername(name))[1]='agriculture101'
  and public.agro_media_is_editor());
drop policy if exists agro_course_media_update on storage.objects;
create policy agro_course_media_update on storage.objects for update to authenticated
 using(bucket_id='agro-course-media' and public.agro_media_is_editor())
 with check(bucket_id='agro-course-media' and public.agro_media_is_editor());
drop policy if exists agro_course_media_select on storage.objects;
create policy agro_course_media_select on storage.objects for select to authenticated
 using(bucket_id='agro-course-media' and public.agro_media_is_editor());
drop policy if exists agro_course_media_delete on storage.objects;
create policy agro_course_media_delete on storage.objects for delete to authenticated
 using(bucket_id='agro-course-media' and public.agro_media_is_editor());