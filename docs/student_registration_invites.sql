
-- One-time teacher-issued invitations for existing Notion student records.
-- Invitation secrets are never stored in plaintext. A student must first verify email.
create table if not exists public.student_registration_invites(
 id uuid primary key default gen_random_uuid(),
 registry_student_id uuid not null references public.notion_student_registry(id) on delete cascade,
 token_hash bytea not null unique,
 status text not null default 'issued'
   check(status in ('issued','claimed','redeemed','revoked','declined','expired')),
 issued_by uuid not null references public.profiles(id),
 issued_at timestamptz not null default now(),
 expires_at timestamptz not null,
 claimed_by uuid references public.profiles(id),
 claimed_at timestamptz,
 decided_by uuid references public.profiles(id),
 decided_at timestamptz,
 constraint invitation_claim_state check(
   (status in ('claimed','redeemed') and claimed_by is not null and claimed_at is not null)
   or status in ('issued','revoked','declined','expired'))
);
create unique index if not exists student_registration_one_open_invitation
 on public.student_registration_invites(registry_student_id) where status in ('issued','claimed');
create index if not exists student_registration_invite_student_index
 on public.student_registration_invites(registry_student_id,issued_at desc);
alter table public.student_registration_invites enable row level security;
revoke all on public.student_registration_invites from anon,authenticated;

-- Internal linkage is deliberately not callable from the Data API.
create or replace function app_private.complete_student_invite_link(p_registry uuid,p_user uuid)
returns void language plpgsql security definer set search_path='' as $$
declare r public.notion_student_registry;
begin
 select * into r from public.notion_student_registry where id=p_registry for update;
 if not found or (r.linked_student_id is not null and r.linked_student_id<>p_user)
 then raise exception 'This student record has already been claimed';end if;
 if exists(select 1 from public.notion_student_registry
   where linked_student_id=p_user and id<>p_registry)
 then raise exception 'This account is already linked to another student';end if;
 if not exists(select 1 from public.staff_profiles sp
   join public.teacher_profiles tp on tp.user_id=sp.user_id
   where sp.user_id=r.assigned_teacher_id and sp.active and tp.active)
 then raise exception 'Assigned teacher must be active';end if;
 update public.notion_student_registry
  set linked_student_id=p_user,updated_at=now() where id=p_registry;
 update public.profiles set full_name=r.full_name
  where id=p_user and role='student';
 insert into public.enrollments(student_id,course_id)
  values(p_user,r.assigned_course_id)
  on conflict(student_id,course_id) do nothing;
 insert into public.staff_student_assignments(staff_id,student_id,active)
  values(r.assigned_teacher_id,p_user,true)
  on conflict(staff_id,student_id) do update set active=true;
 insert into public.student_portfolios(student_id,fields,notion_page_url)
  values(p_user,r.academic_fields,r.source_page_url)
  on conflict(student_id) do update set
    fields=excluded.fields||public.student_portfolios.fields,
    notion_page_url=excluded.notion_page_url,updated_at=now();
 insert into public.student_contact_profiles(student_id,fields)
  values(p_user,r.contact_fields)
  on conflict(student_id) do update set
    fields=excluded.fields||public.student_contact_profiles.fields,updated_at=now();
end $$;
revoke all on function app_private.complete_student_invite_link(uuid,uuid) from public,anon,authenticated;

-- Principal / Coordinator explicitly creates each invitation and receives its raw code ONCE.
create or replace function public.supervision_issue_student_invite(p_registry uuid,p_days integer default 14)
returns jsonb language plpgsql security definer set search_path='' as $$
declare r public.notion_student_registry; secret text;invite_id uuid;expiry timestamptz;
begin
 if auth.uid() is null or app_private.staff_rank(app_private.staff_level())<5
 then raise exception 'School leadership access required';end if;
 if p_days<1 or p_days>30 then raise exception 'Invite expiry must be from 1 to 30 days';end if;
 select * into r from public.notion_student_registry where id=p_registry for update;
 if not found then raise exception 'Student not found';end if;
 if r.linked_student_id is not null then raise exception 'Student already linked to an LMS account';end if;
 update public.student_registration_invites set status='expired'
 where registry_student_id=p_registry and status='issued' and expires_at<=now();
 update public.student_registration_invites set status='revoked'
 where registry_student_id=p_registry and status in ('issued','claimed');
 secret:=pg_catalog.encode(extensions.gen_random_bytes(32),'hex');
 expiry:=now()+pg_catalog.make_interval(days=>p_days);
 insert into public.student_registration_invites(
  registry_student_id,token_hash,status,issued_by,expires_at)
 values(p_registry,extensions.digest(pg_catalog.convert_to(secret,'UTF8'),'sha256'),
   'issued',auth.uid(),expiry) returning id into invite_id;
 return pg_catalog.jsonb_build_object('inviteId',invite_id,'token',secret,'expiresAt',expiry);
end $$;

-- This RPC has no authorization to see the school record, only to consume the provided token.
create or replace function public.student_claim_registration_invite(p_token text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare invite public.student_registration_invites;
declare reg public.notion_student_registry;
declare student_email text;confirmed timestamptz;existing_profile_role text;known_email text;
begin
 if auth.uid() is null then raise exception 'Sign in before accepting the invitation';end if;
 if p_token is null or p_token !~ '^[a-f0-9]{64}$'
 then raise exception 'Invalid invitation';end if;
 select email,email_confirmed_at into student_email,confirmed
 from auth.users where id=auth.uid();
 if confirmed is null or student_email is null then
  raise exception 'Please confirm your email before accepting the invitation';end if;
 select role into existing_profile_role from public.profiles where id=auth.uid();
 if existing_profile_role is distinct from 'student'
 then raise exception 'A student account is required for this invitation';end if;
 select * into invite from public.student_registration_invites
 where token_hash=extensions.digest(pg_catalog.convert_to(p_token,'UTF8'),'sha256') for update;
 if not found then raise exception 'Invalid invitation';end if;
 if invite.status='redeemed' and invite.claimed_by=auth.uid() then
  return jsonb_build_object('status','enrolled');end if;
 if invite.status='claimed' and invite.claimed_by=auth.uid() then
  return jsonb_build_object('status','pending_approval');end if;
 if invite.status<>'issued' or invite.expires_at<=now()
 then raise exception 'Invitation expired or already used';end if;
 select * into reg from public.notion_student_registry where id=invite.registry_student_id for update;
 if reg.linked_student_id is not null then raise exception 'Student already linked to an account';end if;
 if exists(select 1 from public.notion_student_registry where linked_student_id=auth.uid())
 then raise exception 'Your account already belongs to a student record';end if;
 if exists(select 1 from public.student_registration_invites
   where claimed_by=auth.uid() and status='claimed')
 then raise exception 'You already have a pending invitation';end if;
 known_email:=pg_catalog.lower(pg_catalog.btrim(coalesce(reg.contact_fields->>'Email','')));
 update public.student_registration_invites set
   status=case when known_email<>'' and known_email=pg_catalog.lower(pg_catalog.btrim(student_email))
     then 'redeemed' else 'claimed' end,
   claimed_by=auth.uid(),claimed_at=now(),
   decided_at=case when known_email<>'' and known_email=pg_catalog.lower(pg_catalog.btrim(student_email))
     then now() else null end
 where id=invite.id;
 if known_email<>'' and known_email=pg_catalog.lower(pg_catalog.btrim(student_email)) then
  perform app_private.complete_student_invite_link(reg.id,auth.uid());
  return jsonb_build_object('status','enrolled');
 end if;
 return jsonb_build_object('status','pending_approval');
end $$;

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
 select i.id,r.id,r.full_name,c.title,
  case when i.status='issued' and i.expires_at<=now() then 'expired' else i.status end,
  i.issued_at,i.expires_at,i.claimed_at,
  u.email,r.linked_student_id
 from public.notion_student_registry r
 join public.courses c on c.id=r.assigned_course_id
 left join lateral(
   select * from public.student_registration_invites ii
   where ii.registry_student_id=r.id order by ii.issued_at desc limit 1
 ) i on true
 left join auth.users u on u.id=i.claimed_by
 order by r.full_name;
end $$;

create or replace function public.supervision_decide_student_invite(
 p_invite uuid,p_approve boolean)
returns jsonb language plpgsql security definer set search_path='' as $$
declare i public.student_registration_invites;confirmed timestamptz;
begin
 if auth.uid() is null or app_private.staff_rank(app_private.staff_level())<5
 then raise exception 'School leadership access required';end if;
 select * into i from public.student_registration_invites where id=p_invite for update;
 if not found or i.status<>'claimed' or i.claimed_by is null
 then raise exception 'No pending identity confirmation for this invitation';end if;
 select email_confirmed_at into confirmed from auth.users where id=i.claimed_by;
 if confirmed is null then raise exception 'Student email is not confirmed';end if;
 if p_approve then
  perform app_private.complete_student_invite_link(i.registry_student_id,i.claimed_by);
 end if;
 update public.student_registration_invites
 set status=case when p_approve then 'redeemed' else 'declined' end,
   decided_by=auth.uid(),decided_at=now()
 where id=i.id;
 return jsonb_build_object('status',case when p_approve then 'enrolled' else 'declined' end);
end $$;
create or replace function public.supervision_revoke_student_invite(p_invite uuid)
returns boolean language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or app_private.staff_rank(app_private.staff_level())<5
 then raise exception 'School leadership access required';end if;
 update public.student_registration_invites set status='revoked',decided_by=auth.uid(),decided_at=now()
 where id=p_invite and status in ('issued','claimed');
 return found;
end $$;
-- Raw links only returned on explicit issuance. No student/admin direct table grants.
revoke all on function public.supervision_issue_student_invite(uuid,integer),
 public.student_claim_registration_invite(text),
 public.supervision_student_invite_roster(),
 public.supervision_decide_student_invite(uuid,boolean),
 public.supervision_revoke_student_invite(uuid)
 from public,anon,authenticated;
grant execute on function public.supervision_issue_student_invite(uuid,integer),
 public.student_claim_registration_invite(text),
 public.supervision_student_invite_roster(),
 public.supervision_decide_student_invite(uuid,boolean),
 public.supervision_revoke_student_invite(uuid) to authenticated;
