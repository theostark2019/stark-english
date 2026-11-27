-- Extend word self-assessment with safe undo before practice begins.
create or replace function public.svo_word_event(p_word_key text,p_action text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_user uuid:=auth.uid();v public.svo_student_vocabulary;
begin
 if v_user is null or not exists(
   select 1 from public.enrollments en join public.courses c on c.id=en.course_id
    where en.student_id=v_user and c.slug='stark-english'
 ) then raise exception 'Enrollment in Stark English is required';end if;
 if not exists(select 1 from public.svo_vocabulary where word_key=p_word_key)
 then raise exception 'Unknown SVO vocabulary item';end if;
 if p_action not in ('unknown','undo_selection','recall_success','recall_missed')
 then raise exception 'Invalid vocabulary action';end if;
 if p_action='undo_selection' then
  delete from public.svo_student_vocabulary where student_id=v_user and word_key=p_word_key
   and reviews=0;
  if not found then raise exception 'This word already has a learning history. Keep it in the review list.';end if;
  return jsonb_build_object('key',p_word_key,'status','unselected','streak',0,'reviews',0);
 elsif p_action='unknown' then
  insert into public.svo_student_vocabulary(student_id,word_key)
   values(v_user,p_word_key)
  on conflict(student_id,word_key) do update set
   status='learning',correct_streak=0,mastered_at=null;
 elsif p_action='recall_success' then
  update public.svo_student_vocabulary set
   reviews=reviews+1,correct_streak=least(correct_streak+1,100),
   status=case when correct_streak+1>=2 then 'mastered' else 'learning' end,
   mastered_at=case when correct_streak+1>=2 then coalesce(mastered_at,now()) else null end,
   last_reviewed_at=now()
  where student_id=v_user and word_key=p_word_key;
  if not found then raise exception 'Select this unfamiliar word before reviewing it';end if;
 else
  update public.svo_student_vocabulary set
   reviews=reviews+1,correct_streak=0,status='learning',mastered_at=null,last_reviewed_at=now()
  where student_id=v_user and word_key=p_word_key;
  if not found then raise exception 'Select this unfamiliar word before reviewing it';end if;
 end if;
 select * into v from public.svo_student_vocabulary
  where student_id=v_user and word_key=p_word_key;
 return jsonb_build_object('key',v.word_key,'status',v.status,'streak',v.correct_streak,'reviews',v.reviews);
end $$;
revoke all on function public.svo_word_event(text,text) from public,anon,authenticated;
grant execute on function public.svo_word_event(text,text) to authenticated;

-- The existing shared student->teacher submission RPC stays unchanged for all other courses.
-- SVO-L01 additionally requires the actual authored steps, not merely an empty response row.
create or replace function public.submit_lesson_attempt(p_attempt uuid)
returns public.lesson_attempts language plpgsql security definer set search_path='' as $$
declare v public.lesson_attempts;payload jsonb;code text;num integer;
begin
 select a.* into v from public.lesson_attempts a
 where a.id=p_attempt and a.student_id=auth.uid()
 and a.status in ('draft','revision_requested') for update;
 if not found then raise exception 'Attempt unavailable for submission';end if;
 if not exists(select 1 from public.lesson_responses r where r.attempt_id=p_attempt)
 then raise exception 'No lesson responses';end if;
 select e.code into code from public.episodes e where e.id=v.episode_id;
 if code='SVO-L01' then
  select r.response->'value' into payload from public.lesson_responses r
   where r.attempt_id=p_attempt and r.activity_key='svo_l01' and r.field_key='portfolio';
  if payload is null or jsonb_typeof(payload)<>'object' then
   raise exception 'SVO lesson evidence is missing';end if;
  if jsonb_typeof(payload->'translations') is distinct from 'array'
     or jsonb_array_length(payload->'translations')<>7 then
   raise exception 'Complete all 7 Express it translations';end if;
  select count(*) into num from jsonb_array_elements_text(payload->'translations') x
   where length(btrim(x.value))>0;
  if num<>7 then raise exception 'Complete all 7 Express it translations';end if;
  if jsonb_typeof(payload->'substitutions') is distinct from 'array'
    or jsonb_array_length(payload->'substitutions')<>2 then
   raise exception 'Write 2 original sentences';end if;
  select count(*) into num from jsonb_array_elements_text(payload->'substitutions') x
   where length(btrim(x.value))>0;
  if num<>2 then raise exception 'Write 2 original sentences';end if;
  if jsonb_typeof(payload->'practiceChoice') is distinct from 'object'
    or (select count(*) from jsonb_object_keys(payload->'practiceChoice'))<6
   then raise exception 'Complete the first immediate-practice exercise';end if;
  if jsonb_typeof(payload->'practiceGap') is distinct from 'array'
    or jsonb_array_length(payload->'practiceGap')<>5 then
   raise exception 'Complete the second immediate-practice exercise';end if;
  select count(*) into num from jsonb_array_elements_text(payload->'practiceGap') x
   where length(btrim(x.value))>0;
  if num<>5 then raise exception 'Complete the second immediate-practice exercise';end if;
  if jsonb_typeof(payload->'dictation') is distinct from 'array'
    or jsonb_array_length(payload->'dictation')<>5 then
   raise exception 'Complete all 5 dictated sentences';end if;
  select count(*) into num from jsonb_array_elements_text(payload->'dictation') x
   where length(btrim(x.value))>0;
  if num<>5 then raise exception 'Complete all 5 dictated sentences';end if;
 end if;
 update public.lesson_attempts a set status='submitted',submitted_at=now(),
   claimed_by=null,claimed_at=null,updated_at=now()
 where a.id=p_attempt and a.student_id=auth.uid() and a.status in ('draft','revision_requested')
 returning * into v;
 if not found then raise exception 'Attempt unavailable for submission';end if;
 return v;
end $$;
revoke all on function public.submit_lesson_attempt(uuid) from public,anon,authenticated;
grant execute on function public.submit_lesson_attempt(uuid) to authenticated;
