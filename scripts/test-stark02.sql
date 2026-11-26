-- Database integration tests. Synthetic identities and every test write are rolled back.
-- This exercises authenticated database roles; it is not a real-device microphone test.
do $$
declare
 sa uuid:=gen_random_uuid();sb uuid:=gen_random_uuid();ta uuid:=gen_random_uuid();tb uuid:=gen_random_uuid();principal uuid:=gen_random_uuid();
 course uuid;cid uuid;pid uuid;mid0 uuid;mid1 uuid;aid uuid;bid uuid;attempt uuid;tid uuid;hid uuid;session_id uuid:=gen_random_uuid();
 result jsonb;payload jsonb;blocked boolean;counter integer;route_teacher uuid;
begin
 begin
  insert into auth.users(id,email,raw_user_meta_data) values
   (sa,'stark02-a-'||sa||'@example.invalid','{"full_name":"V02 test student A"}'),
   (sb,'stark02-b-'||sb||'@example.invalid','{"full_name":"V02 test student B"}'),
   (ta,'stark02-ta-'||ta||'@example.invalid','{"full_name":"V02 test teacher A"}'),
   (tb,'stark02-tb-'||tb||'@example.invalid','{"full_name":"V02 test teacher B"}'),
   (principal,'stark02-principal-'||principal||'@example.invalid','{"full_name":"V02 test principal"}');
  insert into public.profiles(id,full_name,role) values(sa,'V02 test student A','student'),(sb,'V02 test student B','student'),
   (ta,'V02 test teacher A','teacher'),(tb,'V02 test teacher B','teacher'),(principal,'V02 test principal','admin')
   on conflict(id) do update set role=excluded.role,full_name=excluded.full_name;
  insert into public.teacher_profiles(user_id,active) values(ta,true),(tb,true),(principal,true);
  insert into public.staff_profiles(user_id,hierarchy,active) values(ta,'Teacher',true),(tb,'Teacher',true),(principal,'Principal',true);
  select id into course from public.courses where slug='agroenglish';
  insert into public.enrollments(student_id,course_id) values(sa,course),(sb,course);
  insert into public.staff_student_assignments(staff_id,student_id,active) values(ta,sa,true);
  perform set_config('role','authenticated',true);
  perform set_config('request.jwt.claim.sub',principal::text,true);
  cid:=public.stark02_create_contract(sa,course,current_date-30,current_date+30,
   '[{"minutes":30,"price_cents":5000,"times_per_week":1},{"minutes":60,"price_cents":9000,"times_per_week":2}]');
  result:=public.stark02_student_file(sa);
  if (result#>>'{contracts,0,monthlyCents}')::bigint<>92000 then raise exception 'FAIL mixed meeting tuition calculation';end if;
  blocked:=false;
  begin perform public.stark02_create_contract(sa,course,current_date,current_date+10,'[{"minutes":30,"price_cents":5000,"times_per_week":1}]');
  exception when others then blocked:=true;end;
  if not blocked then raise exception 'FAIL overlapping contract accepted';end if;
  select id into pid from public.stark02_meeting_plans where contract_id=cid and minutes=30;
  mid0:=public.stark02_schedule_meeting(pid,ta,now()-interval '1 day');
  mid1:=public.stark02_schedule_meeting(pid,ta,now()+interval '3 days');
  tid:=public.stark02_record_tuition(cid,date_trunc('month',current_date)::date);
  if tid<>public.stark02_record_tuition(cid,date_trunc('month',current_date)::date) then raise exception 'FAIL duplicate tuition';end if;
  if (select amount_cents from public.stark02_tuitions where id=tid)<>92000 then raise exception 'FAIL tuition snapshot';end if;
  perform public.stark02_mark_tuition_paid(tid);
  if (select status from public.stark02_tuitions where id=tid)<>'paid' then raise exception 'FAIL payment record';end if;
  perform set_config('request.jwt.claim.sub',ta::text,true);
  result:=public.stark02_student_file(sa);
  if result->>'financial'<>'false' or result#>>'{contracts,0,monthlyCents}' is not null
   or result#>>'{contracts,0,plans,0,price_cents}' is not null or result#>>'{meetings,0,price_cents}' is not null
   or jsonb_array_length(result->'tuitions')<>0 then raise exception 'FAIL teacher financial redaction';end if;
  if (select count(*) from public.stark02_tuitions)>0 then raise exception 'FAIL tuition RLS';end if;
  blocked:=false;
  begin perform public.stark02_create_contract(sa,course,current_date+31,current_date+60,'[{"minutes":30,"price_cents":5000,"times_per_week":1}]');
  exception when others then blocked:=true;end;
  if not blocked then raise exception 'FAIL teacher created financial contract';end if;
  perform set_config('request.jwt.claim.sub',sa::text,true);
  aid:=public.stark02_commit_lesson('AGRO02-B1-20',1,'episode',now()+interval '7 days');
  if aid<>public.stark02_commit_lesson('AGRO02-B1-20',1,'episode',now()+interval '7 days') then raise exception 'FAIL duplicate commitment';end if;
  if (select due_at from public.lesson_assignments where id=aid)<>(select starts_at from public.stark02_meetings where id=mid1)
   then raise exception 'FAIL next meeting deadline';end if;
  select teacher_id into route_teacher from public.lesson_assignments where id=aid;
  if route_teacher<>ta then raise exception 'FAIL teacher routing';end if;
  if not exists(select 1 from public.episodes e join public.lesson_assignments a on a.episode_id=e.id where a.id=aid and e.status='draft')
   then raise exception 'FAIL assigned preview lesson access';end if;
  perform public.stark02_log_work(session_id,aid,30);perform public.stark02_log_work(session_id,aid,60);perform public.stark02_log_work(session_id,aid,30);
  if (select seconds from public.stark02_work_sessions where id=session_id)<>60 then raise exception 'FAIL study time duplicated or decreased';end if;
  perform set_config('request.jwt.claim.sub',sb::text,true);
  bid:=public.stark02_commit_lesson('AGRO02-A1-01',1,'episode',now()+interval '7 days');
  if exists(select 1 from public.stark02_commitments where student_id=sa) then raise exception 'FAIL cross-student commitment access';end if;
  if exists(select 1 from public.stark02_work_sessions where student_id=sa) then raise exception 'FAIL cross-student work-time access';end if;
  blocked:=false;begin perform public.stark02_student_file(sa);exception when others then blocked:=true;end;
  if not blocked then raise exception 'FAIL cross-student file access';end if;
  select id into attempt from public.stark02_open_attempt(bid);
  if attempt<>(select id from public.stark02_open_attempt(bid)) then raise exception 'FAIL duplicate active attempt';end if;
  if (select assessment_schema_id from public.lesson_attempts where id=attempt) is null then raise exception 'FAIL rubric not pinned';end if;
  insert into public.lesson_responses(attempt_id,activity_key,field_key,response)
   values(attempt,'agro02','portfolio',jsonb_build_object('value',jsonb_build_object('code','AGRO02-A1-01','practice',
    jsonb_build_object('substitute','A test sentence','change','Another test sentence','translate','A translated sentence','create','An original sentence'),'proof','This is a written plan only.')));
  blocked:=false;begin perform public.submit_lesson_attempt(attempt);exception when others then blocked:=true;end;
  if not blocked then raise exception 'FAIL speaking task accepted without audio';end if;
  perform set_config('request.jwt.claim.sub',sa::text,true);
  insert into public.lesson_attempts(assignment_id,episode_id,student_id,status)
   select aid,episode_id,sa,'draft' from public.lesson_assignments where id=aid returning id into attempt;
  insert into public.lesson_responses(attempt_id,activity_key,field_key,response) values(attempt,'agro02','portfolio','{"value":{"code":"AGRO02-B1-20","proof":"A final written email with meaningful original evidence."}}');
  blocked:=false;begin perform public.submit_lesson_attempt(attempt);exception when others then blocked:=true;end;
  if not blocked then raise exception 'FAIL incomplete rehearsal accepted';end if;
  payload:=jsonb_build_object('code','AGRO02-B1-20','practice',jsonb_build_object('substitute','A test substitution','change','A test change','translate','A test translation','create','An original rehearsal'),
   'proof','Dear supplier, please correct invoice 104 to match the signed delivery record. Thank you.');
  update public.lesson_responses set response=jsonb_build_object('value',payload) where attempt_id=attempt;
  perform public.submit_lesson_attempt(attempt);
  if (select count(*) from public.stark02_evidence_versions where attempt_id=attempt)<>1 then raise exception 'FAIL evidence snapshot';end if;
  perform set_config('request.jwt.claim.sub',tb::text,true);
  blocked:=false;begin perform public.claim_lesson_attempt(attempt);exception when others then blocked:=true;end;
  if not blocked then raise exception 'FAIL ineligible teacher claim';end if;
  perform set_config('request.jwt.claim.sub',ta::text,true);
  hid:=public.stark02_assign_homework(mid0,'Write the invoice email',1,'lesson',aid);
  if (select due_meeting from public.stark02_homework where id=hid)<>mid1 then raise exception 'FAIL homework due next meeting';end if;
  perform public.claim_lesson_attempt(attempt);
  blocked:=false;begin perform public.review_lesson_attempt(attempt,'finalized','Teacher feedback','{"task":5,"communication":3,"language":3}');exception when others then blocked:=true;end;
  if not blocked then raise exception 'FAIL out-of-range score accepted';end if;
  blocked:=false;begin perform public.review_lesson_attempt(attempt,'finalized','Teacher feedback','{"task":3}');exception when others then blocked:=true;end;
  if not blocked then raise exception 'FAIL incomplete rubric accepted';end if;
  perform public.review_lesson_attempt(attempt,'revision_requested','Add the invoice number and the requested action.','{}');
  perform set_config('request.jwt.claim.sub',sa::text,true);
  payload:=jsonb_set(payload,'{proof}','"Dear supplier, please correct invoice 104 from twenty bags to eighteen, as shown in the signed delivery record, and send the revised invoice by Friday. Thank you."');
  update public.lesson_responses set response=jsonb_build_object('value',payload) where attempt_id=attempt;
  perform public.submit_lesson_attempt(attempt);
  if (select count(*) from public.stark02_evidence_versions where attempt_id=attempt)<>2 then raise exception 'FAIL revision history lost';end if;
  perform set_config('request.jwt.claim.sub',ta::text,true);
  perform public.claim_lesson_attempt(attempt);
  perform public.review_lesson_attempt(attempt,'finalized','Clear purpose, evidence and desired action.','{"task":3,"communication":4,"language":3}');
  if (select status from public.lesson_attempts where id=attempt)<>'finalized' then raise exception 'FAIL finalization';end if;
  perform set_config('request.jwt.claim.sub',sa::text,true);
  if (select count(*) from public.lesson_completion_credits where student_id=sa and attempt_id=attempt)<>1 then raise exception 'FAIL completion credit';end if;
  if (select count(*) from public.lesson_reviews where attempt_id=attempt)<>2 then raise exception 'FAIL feedback history';end if;
  perform set_config('request.jwt.claim.sub','',true);
  blocked:=false;begin perform public.stark02_commit_lesson('AGRO02-A1-01',1,'episode',now()+interval '1 day');exception when others then blocked:=true;end;
  if not blocked then raise exception 'FAIL anonymous commitment accepted';end if;
  raise sqlstate 'ST002' using message='All test assertions passed; roll back every synthetic fixture';
 exception when sqlstate 'ST002' then null;
 end;
end $$;
select jsonb_build_object('result','PASS','scope','Contract math and overlap; tuition idempotency; meeting deadlines; role and cross-student privacy; lesson commitment and teacher routing; time idempotency; evidence requirements; teacher eligibility; rubric validation; revision history; finalization and single credit. All synthetic test writes rolled back.') as stark02_integration_test;
