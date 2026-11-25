create or replace function public.supervision_student_invite_roster()
returns table(
 invite_id uuid,registry_student_id uuid,full_name text,course_title text,
 status text,issued_at timestamptz,expires_at timestamptz,
 claimed_at timestamptz,claimed_email text,linked_student_id uuid)
language plpgsql stable security definer set search_path='' as $$
begin
 if auth.uid() is null or app_private.staff_rank(app_private.staff_level())<5
 then raise exception 'School leadership access required';end if;
 return query
 select i.id,r.id,r.full_name::text,c.title::text,
  (case when i.status='issued' and i.expires_at<=now() then 'expired' else i.status end)::text,
  i.issued_at,i.expires_at,i.claimed_at,u.email::text,r.linked_student_id
 from public.notion_student_registry r
 join public.courses c on c.id=r.assigned_course_id
 left join lateral(
   select * from public.student_registration_invites ii
   where ii.registry_student_id=r.id order by ii.issued_at desc limit 1
 ) i on true
 left join auth.users u on u.id=i.claimed_by
 order by r.full_name;
end $$;
revoke all on function public.supervision_student_invite_roster() from public,anon,authenticated;
grant execute on function public.supervision_student_invite_roster() to authenticated;