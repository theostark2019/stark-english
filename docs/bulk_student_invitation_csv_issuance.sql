create or replace function public.supervision_generate_invites_bulk(p_days integer default 14)
returns table(student_id uuid,student_name text,course_title text,invite_token text,expires_at timestamptz)
language plpgsql security definer set search_path='' as $$
declare r record;secret text;expiry timestamptz;
begin
 if auth.uid() is null or app_private.staff_rank(app_private.staff_level())<5
 then raise exception 'School leadership access required';end if;
 if p_days<1 or p_days>30 then raise exception 'Expiry must be between 1 and 30 days';end if;
 for r in
  select n.id,n.full_name,c.title as course
  from public.notion_student_registry n
  join public.courses c on c.id=n.assigned_course_id
  where n.linked_student_id is null
  order by n.full_name for update of n
 loop
  update public.student_registration_invites set status='expired'
    where registry_student_id=r.id and status='issued' and expires_at<=now();
  if exists(select 1 from public.student_registration_invites
   where registry_student_id=r.id and status in ('issued','claimed')) then
    continue;
  end if;
  secret:=pg_catalog.encode(extensions.gen_random_bytes(32),'hex');
  expiry:=now()+pg_catalog.make_interval(days=>p_days);
  insert into public.student_registration_invites(
    registry_student_id,token_hash,issued_by,expires_at)
  values(r.id,extensions.digest(pg_catalog.convert_to(secret,'UTF8'),'sha256'),
    auth.uid(),expiry);
  student_id:=r.id;student_name:=r.full_name;course_title:=r.course;
  invite_token:=secret;expires_at:=expiry;
  return next;
 end loop;
end $$;
revoke all on function public.supervision_generate_invites_bulk(integer) from public,anon,authenticated;
grant execute on function public.supervision_generate_invites_bulk(integer) to authenticated;