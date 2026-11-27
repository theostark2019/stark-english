
create or replace function public.update_own_supervision_profile(
 p_job_title text, p_biography text, p_specializations text[], p_cefr_levels text[]
)
returns public.staff_profiles language plpgsql security definer set search_path='' as $$
declare updated public.staff_profiles;
begin
 if pg_catalog.length(coalesce(p_job_title,''))>120 or pg_catalog.length(coalesce(p_biography,''))>3000
  or coalesce(array_length(p_specializations,1),0)>20 or coalesce(array_length(p_cefr_levels,1),0)>10
  then raise exception 'Profile field limit exceeded'; end if;
 update public.staff_profiles
 set job_title=coalesce(p_job_title,''),biography=coalesce(p_biography,''),
 specializations=coalesce(p_specializations,'{}'),cefr_levels=coalesce(p_cefr_levels,'{}'),
 updated_at=now()
 where user_id=auth.uid() and active returning * into updated;
 if not found then raise exception 'Active staff profile required'; end if;
 update public.teacher_profiles
 set specializations=updated.specializations,cefr_levels=updated.cefr_levels
 where user_id=auth.uid();
 return updated;
end $$;
revoke all on function public.update_own_supervision_profile(text,text,text[],text[]) from public,anon;
grant execute on function public.update_own_supervision_profile(text,text,text[],text[]) to authenticated;
