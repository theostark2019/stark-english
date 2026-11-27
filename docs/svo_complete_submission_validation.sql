CREATE OR REPLACE FUNCTION public.submit_lesson_attempt(p_attempt uuid)
 RETURNS lesson_attempts
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v public.lesson_attempts;payload jsonb;code text;num integer;spec public.svo_unit_specs;
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

 elsif exists(select 1 from public.svo_unit_specs s where s.episode_id=v.episode_id) then
  select s.* into spec from public.svo_unit_specs s where s.episode_id=v.episode_id;
  select r.response->'value' into payload from public.lesson_responses r
   where r.attempt_id=p_attempt
   and r.activity_key=case when spec.kind='review' then 'svo_review' else 'svo_course' end
   and r.field_key='portfolio';
  if payload is null or jsonb_typeof(payload) is distinct from 'object'
    or payload->>'code' is distinct from code then
   raise exception 'SVO unit evidence is missing or mismatched';
  end if;
  if spec.kind='lesson' then
   if jsonb_typeof(payload->'translations') is distinct from 'array'
     or jsonb_array_length(payload->'translations')<>spec.expected_translations
     or (select count(*) from jsonb_array_elements_text(payload->'translations') x
          where length(btrim(x.value))>0)<>spec.expected_translations
   then raise exception 'Complete all original Express it translations';end if;
   if jsonb_typeof(payload->'substitutions') is distinct from 'array'
     or jsonb_array_length(payload->'substitutions')<>spec.expected_originals
     or (select count(*) from jsonb_array_elements_text(payload->'substitutions') x
          where length(btrim(x.value))>0)<>spec.expected_originals
   then raise exception 'Write two original sentences';end if;
   if jsonb_typeof(payload->'practiceChoice') is distinct from 'object'
     or exists(select 1 from generate_series(0,spec.expected_choices-1) i
       where jsonb_typeof(payload->'practiceChoice'->(i::text)) is distinct from 'number'
        or (payload->'practiceChoice'->>(i::text))::integer not between 0 and 2)
   then raise exception 'Answer every immediate-practice choice';end if;
   if jsonb_typeof(payload->'practiceGap') is distinct from 'array'
     or jsonb_array_length(payload->'practiceGap')<>spec.expected_gaps
     or (select count(*) from jsonb_array_elements_text(payload->'practiceGap') x
          where length(btrim(x.value))>0)<>spec.expected_gaps
   then raise exception 'Complete every sentence gap';end if;
   if jsonb_typeof(payload->'dictation') is distinct from 'array'
     or jsonb_array_length(payload->'dictation')<>spec.expected_dictation
     or (select count(*) from jsonb_array_elements_text(payload->'dictation') x
          where length(btrim(x.value))>0)<>spec.expected_dictation
   then raise exception 'Complete all five dictations';end if;
  else
   if length(btrim(coalesce(payload->>'changed','')))<20
   then raise exception 'Complete the Change it passage';end if;
   if jsonb_typeof(payload->'answers') is distinct from 'array'
     or jsonb_array_length(payload->'answers')<>spec.expected_questions
     or (select count(*) from jsonb_array_elements_text(payload->'answers') x
          where length(btrim(x.value))>0)<>spec.expected_questions
   then raise exception 'Answer all source review questions';end if;
   if jsonb_typeof(payload->'fills') is distinct from 'array'
     or jsonb_array_length(payload->'fills')<>spec.expected_fills
     or (select count(*) from jsonb_array_elements_text(payload->'fills') x
          where length(btrim(x.value))>0)<>spec.expected_fills
   then raise exception 'Complete all source sentence frames';end if;
   if length(btrim(coalesce(payload->>'translation','')))<20
   then raise exception 'Translate the Express it+ passage';end if;
   if jsonb_typeof(payload->'originals') is distinct from 'array'
     or jsonb_array_length(payload->'originals')<>spec.expected_originals
     or (select count(*) from jsonb_array_elements_text(payload->'originals') x
          where length(btrim(x.value))>0)<>spec.expected_originals
   then raise exception 'Provide your personal original sentences';end if;
  end if;
 end if;
 update public.lesson_attempts a set status='submitted',submitted_at=now(),
   claimed_by=null,claimed_at=null,updated_at=now()
 where a.id=p_attempt and a.student_id=auth.uid() and a.status in ('draft','revision_requested')
 returning * into v;
 if not found then raise exception 'Attempt unavailable for submission';end if;
 return v;
end $function$
