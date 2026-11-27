-- Fix reviewer variable ambiguity in course approval.
-- If the authenticated student has a verified Notion registry link, keep their assigned course in sync.
create or replace function public.teacher_review_course_request(
 p_request uuid,p_approve boolean,p_note text default ''
) returns jsonb language plpgsql security definer set search_path='' as $$
declare selected public.student_course_requests; v_reviewer uuid:=auth.uid(); old_row public.notion_student_registry;
begin
 select * into selected from public.student_course_requests where id=p_request for update;
 if not found or selected.status<>'pending' then raise exception 'Pending request not found';end if;
 if v_reviewer is null or (
  app_private.staff_rank(app_private.staff_level())<5
  and not app_private.can_supervise_student(selected.student_id,3)
 ) then raise exception 'Not authorized to review course choice';end if;
 if char_length(coalesce(p_note,''))>1200 then raise exception 'Review note too long';end if;
 if p_approve then
  insert into public.enrollments(student_id,course_id)
   values(selected.student_id,selected.course_id)
  on conflict(student_id,course_id) do nothing;
  insert into public.staff_student_assignments(staff_id,student_id,active)
   values(v_reviewer,selected.student_id,true)
  on conflict(staff_id,student_id) do update set active=true;
  select * into old_row from public.notion_student_registry
   where linked_student_id=selected.student_id for update;
  if found and old_row.assigned_course_id is distinct from selected.course_id then
   update public.notion_student_registry set
    assigned_course_id=selected.course_id,course_assignment_basis='manual_override',
    assignment_updated_at=now(),updated_at=now()
    where id=old_row.id;
   insert into public.notion_registry_assignment_audit(
    registry_student_id,previous_course_id,new_course_id,
    previous_teacher_id,new_teacher_id,changed_by)
   values(old_row.id,old_row.assigned_course_id,selected.course_id,
    old_row.assigned_teacher_id,old_row.assigned_teacher_id,v_reviewer);
  end if;
 end if;
 update public.student_course_requests
 set status=case when p_approve then 'approved' else 'declined' end,
 reviewed_by=v_reviewer,reviewed_at=now(),review_note=coalesce(p_note,'')
 where id=selected.id;
 return jsonb_build_object('status',case when p_approve then 'approved' else 'declined' end,
  'studentId',selected.student_id,'courseId',selected.course_id);
end $$;
revoke all on function public.teacher_review_course_request(uuid,boolean,text)
 from public,anon,authenticated;
grant execute on function public.teacher_review_course_request(uuid,boolean,text)
 to authenticated;