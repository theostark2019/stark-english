-- SVO shared vocabulary progress: reusable across lessons and visible to authorized teachers.
-- Dates use the school's timezone, America/Sao_Paulo.
create table if not exists public.svo_vocabulary(
 word_key text primary key,
 english text not null,
 first_lesson text not null references public.episodes(code),
 item_kind text not null default 'word',
 created_at timestamptz not null default now()
);
create table if not exists public.svo_student_vocabulary(
 student_id uuid not null references public.profiles(id) on delete cascade,
 word_key text not null references public.svo_vocabulary(word_key),
 status text not null default 'learning' check(status in ('learning','mastered')),
 selected_at timestamptz not null default now(),
 correct_streak integer not null default 0 check(correct_streak between 0 and 100),
 reviews integer not null default 0 check(reviews>=0),
 mastered_at timestamptz,
 last_reviewed_at timestamptz,
 primary key(student_id,word_key)
);
create index if not exists svo_student_vocabulary_week on public.svo_student_vocabulary(student_id,selected_at);
alter table public.svo_vocabulary enable row level security;
alter table public.svo_student_vocabulary enable row level security;
revoke all on public.svo_vocabulary,public.svo_student_vocabulary from anon,authenticated;
grant select on public.svo_student_vocabulary to authenticated;
drop policy if exists svo_students_read_own on public.svo_student_vocabulary;
create policy svo_students_read_own on public.svo_student_vocabulary for select to authenticated
 using (student_id=(select auth.uid()) or app_private.can_supervise_student(student_id,2));
insert into public.svo_vocabulary(word_key,english,first_lesson,item_kind)
values
 ('drink','drink','SVO-L01','verb'),('study','study','SVO-L01','verb'),
 ('water','water','SVO-L01','word'),('milk','milk','SVO-L01','word'),
 ('juice','juice','SVO-L01','word'),('coffee','coffee','SVO-L01','word'),
 ('tea','tea','SVO-L01','word'),('soda','soda','SVO-L01','word'),
 ('orange','orange','SVO-L01','word'),('grape','grape','SVO-L01','word'),
 ('apple','apple','SVO-L01','word'),('english','English','SVO-L01','word'),
 ('spanish','Spanish','SVO-L01','word'),('portuguese','Portuguese','SVO-L01','word'),
 ('math','Math','SVO-L01','word'),('geography','Geography','SVO-L01','word'),
 ('i','I','SVO-L01','pronoun'),('you','You','SVO-L01','pronoun'),
 ('and','and','SVO-L01','connector'),('every-day','every day','SVO-L01','chunk')
on conflict(word_key) do nothing;

create or replace function public.svo_weekly_word_kpi()
returns jsonb language sql stable security definer set search_path='' as $$
select jsonb_build_object(
 'weeklyTarget',30,
 'selectedThisWeek',(select count(*) from public.svo_student_vocabulary w
  where w.student_id=auth.uid()
  and (w.selected_at at time zone 'America/Sao_Paulo') >=
    date_trunc('week',now() at time zone 'America/Sao_Paulo')),
 'masteredThisWeek',(select count(*) from public.svo_student_vocabulary w
  where w.student_id=auth.uid() and w.status='mastered' and w.mastered_at is not null
  and (w.mastered_at at time zone 'America/Sao_Paulo') >=
    date_trunc('week',now() at time zone 'America/Sao_Paulo')),
 'learningTotal',(select count(*) from public.svo_student_vocabulary w
  where w.student_id=auth.uid() and w.status='learning'),
 'masteredTotal',(select count(*) from public.svo_student_vocabulary w
  where w.student_id=auth.uid() and w.status='mastered')
);
$$;
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
 if p_action not in ('unknown','recall_success','recall_missed')
 then raise exception 'Invalid vocabulary action';end if;
 if p_action='unknown' then
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
create or replace function public.svo_word_progress()
returns table(word_key text,status text,correct_streak integer,reviews integer,
 selected_at timestamptz,mastered_at timestamptz)
language sql stable security definer set search_path='' as $$
select v.word_key,v.status,v.correct_streak,v.reviews,v.selected_at,v.mastered_at
from public.svo_student_vocabulary v where v.student_id=auth.uid();
$$;
create or replace function public.supervision_svo_word_kpi(p_student uuid)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare result jsonb;
begin
 if auth.uid() is null or not app_private.can_supervise_student(p_student,2)
 then raise exception 'Not authorized to view student vocabulary';end if;
 select jsonb_build_object('weeklyTarget',30,'selectedThisWeek',count(*) filter(
    where (v.selected_at at time zone 'America/Sao_Paulo')>=date_trunc('week',now() at time zone 'America/Sao_Paulo')),
    'masteredThisWeek',count(*) filter(where v.status='mastered'
      and (v.mastered_at at time zone 'America/Sao_Paulo')>=date_trunc('week',now() at time zone 'America/Sao_Paulo')),
    'learningTotal',count(*) filter(where v.status='learning'),
    'masteredTotal',count(*) filter(where v.status='mastered')) into result
 from public.svo_student_vocabulary v where v.student_id=p_student;
 return result;
end $$;
revoke all on function public.svo_weekly_word_kpi(),public.svo_word_event(text,text),
 public.svo_word_progress(),public.supervision_svo_word_kpi(uuid) from public,anon,authenticated;
grant execute on function public.svo_weekly_word_kpi(),public.svo_word_event(text,text),
 public.svo_word_progress(),public.supervision_svo_word_kpi(uuid) to authenticated;

-- Lesson 1 now has a reusable step itinerary, and a teacher rubric. Keep draft until pilot QA.
insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
select e.id,x.activity_key,x.activity_type,x.position,
 jsonb_build_object('source','SVO Protocol, Module 1, p.10','version',1)
from public.episodes e cross join (
 values
 ('vocabulary_check','vocab_check',1),
 ('flashcards','flashcards',2),
 ('context','reading',3),
 ('translation','translation',4),
 ('substitution','substitution',5),
 ('grammar','grammar',6),
 ('chunks','chunks',7),
 ('practice_choice','multiple_choice',8),
 ('practice_gap','gap_fill',9),
 ('dictation','dictation',10)
) x(activity_key,activity_type,position)
where e.code='SVO-L01'
and not exists(select 1 from public.lesson_activity_definitions d
 where d.episode_id=e.id and d.activity_key=x.activity_key);

insert into public.lesson_assessment_schemas(episode_id,version,definition)
select id,1,'{"criteria":[{"key":"communicative_effectiveness","label":"Meaningful SVO communication","scale":[1,2,3,4]},{"key":"language_accuracy","label":"Present Simple with I / You","scale":[1,2,3,4]},{"key":"vocabulary_use","label":"Vocabulary and chunks in context","scale":[1,2,3,4]},{"key":"listening_transcription","label":"Dictation and listening comprehension","scale":[1,2,3,4]}],"outcomes":["revision_requested","finalized"],"feedback_prompts":["What worked?","Which chunks need practice?","Which words should be reviewed next?"]}'::jsonb
from public.episodes
where code='SVO-L01' and not exists(select 1 from public.lesson_assessment_schemas s where s.episode_id=episodes.id and s.version=1);
update public.episodes
set description='SVO A1 · To Drink / To Study · 10 guided steps, vocabulary and dictation (teacher pilot)',
lesson_body='Source: The SVO Protocol, Module 1, Lesson 1 (p.10). Vocabulary · Context · Express it · Patterns. Platform pilot expands original material with personal word selection, targeted flashcards, contextual reading, 7 translations, sentence substitutions, grammar, chunks, 2 practice activities and 5 dictated sentences.',
minutes=60,updated_at=now()
where code='SVO-L01';
