-- Four versioned series, 96 exact checklist mappings. Legacy curriculum remains intact.
begin;
create policy episodes_agro02_assignment_preview_read on public.episodes for select to authenticated
 using(code like 'AGRO02-%' and exists(select 1 from public.lesson_assignments a where a.episode_id=episodes.id and a.student_id=(select auth.uid())));
insert into public.series(course_id,slug,name)
 select id,'agro02-a1','AgroEnglish 0.2 · A1 · Meet the farm' from public.courses where slug='agroenglish'
 on conflict(course_id,slug) do nothing;
insert into public.series(course_id,slug,name)
 select id,'agro02-a2','AgroEnglish 0.2 · A2 · Make things happen' from public.courses where slug='agroenglish'
 on conflict(course_id,slug) do nothing;
insert into public.series(course_id,slug,name)
 select id,'agro02-b1','AgroEnglish 0.2 · B1 · Work with confidence' from public.courses where slug='agroenglish'
 on conflict(course_id,slug) do nothing;
insert into public.series(course_id,slug,name)
 select id,'agro02-b2','AgroEnglish 0.2 · B2 · Lead the conversation' from public.courses where slug='agroenglish'
 on conflict(course_id,slug) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-A1-01','Greet and introduce yourself','Meet a visiting agronomist. Greet them and introduce yourself, your role and workplace in 3–4 sentences.','Greeting + name + role + workplace; intelligible without reading.','A1',30,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-a1'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C001','A1','Greet and introduce yourself','be: am/are; subject pronouns','Meet a visiting agronomist. Greet them and introduce yourself, your role and workplace in 3–4 sentences.','Greeting + name + role + workplace; intelligible without reading.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C001','assessed' from public.episodes where code='AGRO02-A1-01' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"Greeting + name + role + workplace; intelligible without reading.","sourceNumber":1}'::jsonb from public.episodes where code='AGRO02-A1-01'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · Greeting + name + role + workplace; intelligible without reading.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · be: am/are; subject pronouns","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-A1-01' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-A1-02','Introduce a colleague and ask how they are','Introduce your supervisor to a visitor, then ask the visitor how they are and respond.','Correct third-person introduction, 1 question and a suitable response.','A1',30,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-a1'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C002','A1','Introduce a colleague and ask how they are','be: is; possessive adjectives','Introduce your supervisor to a visitor, then ask the visitor how they are and respond.','Correct third-person introduction, 1 question and a suitable response.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C002','assessed' from public.episodes where code='AGRO02-A1-02' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"Correct third-person introduction, 1 question and a suitable response.","sourceNumber":2}'::jsonb from public.episodes where code='AGRO02-A1-02'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · Correct third-person introduction, 1 question and a suitable response.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · be: is; possessive adjectives","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-A1-02' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-A1-03','Exchange names and contact information','Role-play registering a new supplier: ask their full name, spell your surname and exchange a phone number.','At least 3 relevant questions/answers; letters and digits understood.','A1',30,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-a1'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C003','A1','Exchange names and contact information','Wh-questions; alphabet; numbers','Role-play registering a new supplier: ask their full name, spell your surname and exchange a phone number.','At least 3 relevant questions/answers; letters and digits understood.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C003','assessed' from public.episodes where code='AGRO02-A1-03' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"At least 3 relevant questions/answers; letters and digits understood.","sourceNumber":3}'::jsonb from public.episodes where code='AGRO02-A1-03'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · At least 3 relevant questions/answers; letters and digits understood.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · Wh-questions; alphabet; numbers","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-A1-03' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-A1-04','Identify common farm objects','Look at 8 farm-object pictures and name them; identify 2 plurals.','At least 6/8 recognizable nouns; a/an and plural forms when relevant.','A1',30,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-a1'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C004','A1','Identify common farm objects','a/an; singular/plural nouns','Look at 8 farm-object pictures and name them; identify 2 plurals.','At least 6/8 recognizable nouns; a/an and plural forms when relevant.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C004','assessed' from public.episodes where code='AGRO02-A1-04' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"At least 6/8 recognizable nouns; a/an and plural forms when relevant.","sourceNumber":4}'::jsonb from public.episodes where code='AGRO02-A1-04'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · At least 6/8 recognizable nouns; a/an and plural forms when relevant.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · a/an; singular/plural nouns","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-A1-04' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-A1-05','Describe a tool or animal simply','Choose 2 farm tools or animals and give 2 observable characteristics of each.','4 meaningful descriptors attached to the correct objects.','A1',30,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-a1'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C005','A1','Describe a tool or animal simply','be + adjective; adjective order','Choose 2 farm tools or animals and give 2 observable characteristics of each.','4 meaningful descriptors attached to the correct objects.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C005','assessed' from public.episodes where code='AGRO02-A1-05' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"4 meaningful descriptors attached to the correct objects.","sourceNumber":5}'::jsonb from public.episodes where code='AGRO02-A1-05'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · 4 meaningful descriptors attached to the correct objects.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · be + adjective; adjective order","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-A1-05' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-A1-06','Say where you and your farm are from','Tell a foreign visitor your country, state, town and farm location.','4 intelligible location details in coherent sentences.','A1',30,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-a1'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C006','A1','Say where you and your farm are from','be from; locations; country names','Tell a foreign visitor your country, state, town and farm location.','4 intelligible location details in coherent sentences.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C006','assessed' from public.episodes where code='AGRO02-A1-06' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"4 intelligible location details in coherent sentences.","sourceNumber":6}'::jsonb from public.episodes where code='AGRO02-A1-06'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · 4 intelligible location details in coherent sentences.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · be from; locations; country names","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-A1-06' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-A1-07','Locate tools and animals','Using a simple barn picture, ask 2 location questions and answer 4 location questions.','At least 3/4 locations described accurately.','A1',30,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-a1'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C007','A1','Locate tools and animals','where; in/on/under/next to','Using a simple barn picture, ask 2 location questions and answer 4 location questions.','At least 3/4 locations described accurately.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C007','assessed' from public.episodes where code='AGRO02-A1-07' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"At least 3/4 locations described accurately.","sourceNumber":7}'::jsonb from public.episodes where code='AGRO02-A1-07'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · At least 3/4 locations described accurately.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · where; in/on/under/next to","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-A1-07' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-A1-08','Identify ownership of objects','Sort 5 equipment items by owner and explain who each belongs to.','At least 4/5 owner-object matches expressed clearly.','A1',30,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-a1'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C008','A1','Identify ownership of objects','possessive adjectives; possessive ''s','Sort 5 equipment items by owner and explain who each belongs to.','At least 4/5 owner-object matches expressed clearly.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C008','assessed' from public.episodes where code='AGRO02-A1-08' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"At least 4/5 owner-object matches expressed clearly.","sourceNumber":8}'::jsonb from public.episodes where code='AGRO02-A1-08'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · At least 4/5 owner-object matches expressed clearly.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · possessive adjectives; possessive ''s","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-A1-08' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-A1-09','Describe actions happening now','Watch a 30-second farm video; say what 4 workers or machines are doing.','At least 3 accurate current-action statements.','A1',30,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-a1'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C009','A1','Describe actions happening now','present continuous','Watch a 30-second farm video; say what 4 workers or machines are doing.','At least 3 accurate current-action statements.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C009','assessed' from public.episodes where code='AGRO02-A1-09' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"At least 3 accurate current-action statements.","sourceNumber":9}'::jsonb from public.episodes where code='AGRO02-A1-09'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · At least 3 accurate current-action statements.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · present continuous","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-A1-09' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-A1-10','Discuss likes and dislikes','Tell a new coworker 2 farm activities you enjoy and 2 you dislike; give one simple reason.','4 preferences expressed understandably and 1 relevant reason.','A1',30,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-a1'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C010','A1','Discuss likes and dislikes','like/love/dislike + noun/-ing','Tell a new coworker 2 farm activities you enjoy and 2 you dislike; give one simple reason.','4 preferences expressed understandably and 1 relevant reason.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C010','assessed' from public.episodes where code='AGRO02-A1-10' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"4 preferences expressed understandably and 1 relevant reason.","sourceNumber":10}'::jsonb from public.episodes where code='AGRO02-A1-10'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · 4 preferences expressed understandably and 1 relevant reason.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · like/love/dislike + noun/-ing","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-A1-10' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-A1-11','Ask about time and price','At a farm shop, ask for the opening time and prices of 3 items, then repeat the prices.','Time plus at least 2/3 prices accurately exchanged.','A1',30,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-a1'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C011','A1','Ask about time and price','time; numbers; how much','At a farm shop, ask for the opening time and prices of 3 items, then repeat the prices.','Time plus at least 2/3 prices accurately exchanged.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C011','assessed' from public.episodes where code='AGRO02-A1-11' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"Time plus at least 2/3 prices accurately exchanged.","sourceNumber":11}'::jsonb from public.episodes where code='AGRO02-A1-11'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · Time plus at least 2/3 prices accurately exchanged.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · time; numbers; how much","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-A1-11' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-A1-12','Explain your daily work routine','Describe 5 actions from your normal workday in chronological order.','At least 4 routine actions, including a time or sequence marker.','A1',30,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-a1'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C012','A1','Explain your daily work routine','present simple; time expressions','Describe 5 actions from your normal workday in chronological order.','At least 4 routine actions, including a time or sequence marker.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C012','assessed' from public.episodes where code='AGRO02-A1-12' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"At least 4 routine actions, including a time or sequence marker.","sourceNumber":12}'::jsonb from public.episodes where code='AGRO02-A1-12'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · At least 4 routine actions, including a time or sequence marker.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · present simple; time expressions","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-A1-12' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-A1-13','Discuss family and farm roles','Describe 3 family members or colleagues and explain each person''s role in the farm business.','3 persons and 3 roles clearly identified.','A1',30,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-a1'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C013','A1','Discuss family and farm roles','have/has; family words','Describe 3 family members or colleagues and explain each person''s role in the farm business.','3 persons and 3 roles clearly identified.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C013','assessed' from public.episodes where code='AGRO02-A1-13' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"3 persons and 3 roles clearly identified.","sourceNumber":13}'::jsonb from public.episodes where code='AGRO02-A1-13'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · 3 persons and 3 roles clearly identified.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · have/has; family words","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-A1-13' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-A1-14','Describe farm facilities and layout','Using a farm map, describe 5 facilities and where 3 are located.','At least 4 facilities + 2 accurate spatial relationships.','A1',30,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-a1'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C014','A1','Describe farm facilities and layout','there is/are; between/opposite','Using a farm map, describe 5 facilities and where 3 are located.','At least 4 facilities + 2 accurate spatial relationships.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C014','assessed' from public.episodes where code='AGRO02-A1-14' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"At least 4 facilities + 2 accurate spatial relationships.","sourceNumber":14}'::jsonb from public.episodes where code='AGRO02-A1-14'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · At least 4 facilities + 2 accurate spatial relationships.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · there is/are; between/opposite","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-A1-14' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-A1-15','Discuss weather and seasons','Read a 3-day forecast and tell a colleague the conditions and the safest day for outdoor work.','3 weather details and 1 sensible day choice.','A1',30,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-a1'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C015','A1','Discuss weather and seasons','weather expressions; seasons','Read a 3-day forecast and tell a colleague the conditions and the safest day for outdoor work.','3 weather details and 1 sensible day choice.','Speaking + reading') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C015','assessed' from public.episodes where code='AGRO02-A1-15' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking + reading","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"3 weather details and 1 sensible day choice.","sourceNumber":15}'::jsonb from public.episodes where code='AGRO02-A1-15'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · 3 weather details and 1 sensible day choice.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · weather expressions; seasons","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-A1-15' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-A1-16','Order food or basic supplies','Role-play buying 3 items at a supply store; ask for quantity and total price.','At least 3 items ordered and one clarification question.','A1',30,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-a1'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C016','A1','Order food or basic supplies','I''d like; can I have','Role-play buying 3 items at a supply store; ask for quantity and total price.','At least 3 items ordered and one clarification question.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C016','assessed' from public.episodes where code='AGRO02-A1-16' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"At least 3 items ordered and one clarification question.","sourceNumber":16}'::jsonb from public.episodes where code='AGRO02-A1-16'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · At least 3 items ordered and one clarification question.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · I''d like; can I have","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-A1-16' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-A1-17','Describe abilities','Tell a farm manager 3 tasks you can do and 2 you cannot yet do.','5 understandable ability statements with suitable verbs.','A1',30,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-a1'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C017','A1','Describe abilities','can/can''t + verb','Tell a farm manager 3 tasks you can do and 2 you cannot yet do.','5 understandable ability statements with suitable verbs.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C017','assessed' from public.episodes where code='AGRO02-A1-17' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"5 understandable ability statements with suitable verbs.","sourceNumber":17}'::jsonb from public.episodes where code='AGRO02-A1-17'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · 5 understandable ability statements with suitable verbs.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · can/can''t + verb","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-A1-17' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-A1-18','Describe past states','Compare the farm yesterday and today using 4 facts about weather, workers or equipment.','At least 3 appropriate was/were statements.','A1',30,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-a1'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C018','A1','Describe past states','was/were','Compare the farm yesterday and today using 4 facts about weather, workers or equipment.','At least 3 appropriate was/were statements.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C018','assessed' from public.episodes where code='AGRO02-A1-18' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"At least 3 appropriate was/were statements.","sourceNumber":18}'::jsonb from public.episodes where code='AGRO02-A1-18'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · At least 3 appropriate was/were statements.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · was/were","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-A1-18' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-A1-19','Describe your last working weekend','Tell a colleague what you did on your last working weekend in 5 steps.','At least 4 completed actions with past-time reference.','A1',30,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-a1'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C019','A1','Describe your last working weekend','past simple regular; time expressions','Tell a colleague what you did on your last working weekend in 5 steps.','At least 4 completed actions with past-time reference.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C019','assessed' from public.episodes where code='AGRO02-A1-19' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"At least 4 completed actions with past-time reference.","sourceNumber":19}'::jsonb from public.episodes where code='AGRO02-A1-19'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · At least 4 completed actions with past-time reference.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · past simple regular; time expressions","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-A1-19' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-A1-20','Shop for farm supplies','Role-play purchasing fertilizer bags and gloves with a fixed budget; ask for quantities and prices.','Correctly communicate two quantities, two prices and purchase choice.','A1',30,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-a1'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C020','A1','Shop for farm supplies','prices; quantities; how much/many','Role-play purchasing fertilizer bags and gloves with a fixed budget; ask for quantities and prices.','Correctly communicate two quantities, two prices and purchase choice.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C020','assessed' from public.episodes where code='AGRO02-A1-20' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"Correctly communicate two quantities, two prices and purchase choice.","sourceNumber":20}'::jsonb from public.episodes where code='AGRO02-A1-20'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · Correctly communicate two quantities, two prices and purchase choice.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · prices; quantities; how much/many","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-A1-20' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-A1-21','Describe personal protective equipment','Look at a worker image; describe 4 PPE items and identify one missing item.','At least 3 correct items and a clear missing-item statement.','A1',30,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-a1'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C021','A1','Describe personal protective equipment','wearing; PPE vocabulary','Look at a worker image; describe 4 PPE items and identify one missing item.','At least 3 correct items and a clear missing-item statement.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C021','assessed' from public.episodes where code='AGRO02-A1-21' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"At least 3 correct items and a clear missing-item statement.","sourceNumber":21}'::jsonb from public.episodes where code='AGRO02-A1-21'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · At least 3 correct items and a clear missing-item statement.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · wearing; PPE vocabulary","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-A1-21' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-A1-22','Discuss hobbies and free time','Ask a coworker 3 leisure questions and explain your own 3 weekly habits.','3 questions and 3 frequency statements understood.','A1',30,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-a1'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C022','A1','Discuss hobbies and free time','present simple; frequency adverbs','Ask a coworker 3 leisure questions and explain your own 3 weekly habits.','3 questions and 3 frequency statements understood.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C022','assessed' from public.episodes where code='AGRO02-A1-22' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"3 questions and 3 frequency statements understood.","sourceNumber":22}'::jsonb from public.episodes where code='AGRO02-A1-22'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · 3 questions and 3 frequency statements understood.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · present simple; frequency adverbs","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-A1-22' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-A1-23','Suggest simple farm tasks','Given a messy storeroom, make 3 practical suggestions to organize work.','3 actionable suggestions, appropriately phrased.','A1',30,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-a1'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C023','A1','Suggest simple farm tasks','let''s; simple imperatives','Given a messy storeroom, make 3 practical suggestions to organize work.','3 actionable suggestions, appropriately phrased.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C023','assessed' from public.episodes where code='AGRO02-A1-23' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"3 actionable suggestions, appropriately phrased.","sourceNumber":23}'::jsonb from public.episodes where code='AGRO02-A1-23'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · 3 actionable suggestions, appropriately phrased.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · let''s; simple imperatives","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-A1-23' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-A1-24','Explain a simple farm procedure','Explain how to clean and store a hand tool in 4–6 ordered steps.','At least 4 logical, safe steps in sequence.','A1',30,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-a1'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C024','A1','Explain a simple farm procedure','sequence markers; imperatives','Explain how to clean and store a hand tool in 4–6 ordered steps.','At least 4 logical, safe steps in sequence.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C024','assessed' from public.episodes where code='AGRO02-A1-24' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"At least 4 logical, safe steps in sequence.","sourceNumber":24}'::jsonb from public.episodes where code='AGRO02-A1-24'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · At least 4 logical, safe steps in sequence.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · sequence markers; imperatives","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-A1-24' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-A2-01','Describe work routines across seasons','Compare your routine during planting and harvest with at least 3 differences.','At least 3 clear contrasts including frequency or time.','A2',40,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-a2'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C025','A2','Describe work routines across seasons','present simple; frequency expressions','Compare your routine during planting and harvest with at least 3 differences.','At least 3 clear contrasts including frequency or time.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C025','assessed' from public.episodes where code='AGRO02-A2-01' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"At least 3 clear contrasts including frequency or time.","sourceNumber":25}'::jsonb from public.episodes where code='AGRO02-A2-01'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · At least 3 clear contrasts including frequency or time.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · present simple; frequency expressions","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-A2-01' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-A2-02','Contrast current actions and habits','Look at an irrigation scene: explain 3 things happening now and 2 things normally done.','3 current and 2 habitual actions distinguishable.','A2',40,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-a2'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C026','A2','Contrast current actions and habits','present simple vs continuous','Look at an irrigation scene: explain 3 things happening now and 2 things normally done.','3 current and 2 habitual actions distinguishable.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C026','assessed' from public.episodes where code='AGRO02-A2-02' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"3 current and 2 habitual actions distinguishable.","sourceNumber":26}'::jsonb from public.episodes where code='AGRO02-A2-02'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · 3 current and 2 habitual actions distinguishable.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · present simple vs continuous","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-A2-02' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-A2-03','Discuss next-season plans','Present 4 planned activities for the next crop season and their intended timing.','4 specific intentions with reasonable temporal order.','A2',40,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-a2'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C027','A2','Discuss next-season plans','going to + verb','Present 4 planned activities for the next crop season and their intended timing.','4 specific intentions with reasonable temporal order.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C027','assessed' from public.episodes where code='AGRO02-A2-03' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"4 specific intentions with reasonable temporal order.","sourceNumber":27}'::jsonb from public.episodes where code='AGRO02-A2-03'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · 4 specific intentions with reasonable temporal order.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · going to + verb","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-A2-03' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-A2-04','Describe plant or animal conditions','Inspect 2 plant photos and describe symptoms or healthy traits without diagnosing.','At least 4 accurate observations, distinguished from guesses.','A2',40,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-a2'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C028','A2','Describe plant or animal conditions','descriptive adjectives; have/has','Inspect 2 plant photos and describe symptoms or healthy traits without diagnosing.','At least 4 accurate observations, distinguished from guesses.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C028','assessed' from public.episodes where code='AGRO02-A2-04' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"At least 4 accurate observations, distinguished from guesses.","sourceNumber":28}'::jsonb from public.episodes where code='AGRO02-A2-04'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · At least 4 accurate observations, distinguished from guesses.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · descriptive adjectives; have/has","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-A2-04' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-A2-05','Compare crops, fields or equipment','Compare 2 tractors or plots on cost, size, efficiency and one other criterion.','4 meaningful comparisons supported by supplied facts.','A2',40,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-a2'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C029','A2','Compare crops, fields or equipment','comparatives; than','Compare 2 tractors or plots on cost, size, efficiency and one other criterion.','4 meaningful comparisons supported by supplied facts.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C029','assessed' from public.episodes where code='AGRO02-A2-05' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"4 meaningful comparisons supported by supplied facts.","sourceNumber":29}'::jsonb from public.episodes where code='AGRO02-A2-05'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · 4 meaningful comparisons supported by supplied facts.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · comparatives; than","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-A2-05' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-A2-06','Report completed agricultural activities','Explain last season''s harvest using 5 supplied timeline events.','At least 4 ordered, intelligible past events.','A2',40,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-a2'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C030','A2','Report completed agricultural activities','past simple; irregular verbs','Explain last season''s harvest using 5 supplied timeline events.','At least 4 ordered, intelligible past events.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C030','assessed' from public.episodes where code='AGRO02-A2-06' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"At least 4 ordered, intelligible past events.","sourceNumber":30}'::jsonb from public.episodes where code='AGRO02-A2-06'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · At least 4 ordered, intelligible past events.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · past simple; irregular verbs","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-A2-06' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-A2-07','Explain an interrupted activity','Describe 3 incidents: what people were doing when each unexpected event happened.','3 coherent background/event relationships.','A2',40,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-a2'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C031','A2','Explain an interrupted activity','past continuous + when','Describe 3 incidents: what people were doing when each unexpected event happened.','3 coherent background/event relationships.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C031','assessed' from public.episodes where code='AGRO02-A2-07' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"3 coherent background/event relationships.","sourceNumber":31}'::jsonb from public.episodes where code='AGRO02-A2-07'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · 3 coherent background/event relationships.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · past continuous + when","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-A2-07' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-A2-08','Give directions around a farm','Using a farm map, direct a visitor from the entrance to 2 destinations.','2 navigable routes with landmarks and direction terms.','A2',40,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-a2'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C032','A2','Give directions around a farm','imperatives; movement prepositions','Using a farm map, direct a visitor from the entrance to 2 destinations.','2 navigable routes with landmarks and direction terms.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C032','assessed' from public.episodes where code='AGRO02-A2-08' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"2 navigable routes with landmarks and direction terms.","sourceNumber":32}'::jsonb from public.episodes where code='AGRO02-A2-08'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · 2 navigable routes with landmarks and direction terms.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · imperatives; movement prepositions","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-A2-08' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-A2-09','Make polite requests and offers','Role-play asking to borrow a moisture meter and offering help with loading.','One polite request, clarification and appropriate offer.','A2',40,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-a2'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C033','A2','Make polite requests and offers','could/would/can; offers','Role-play asking to borrow a moisture meter and offering help with loading.','One polite request, clarification and appropriate offer.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C033','assessed' from public.episodes where code='AGRO02-A2-09' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"One polite request, clarification and appropriate offer.","sourceNumber":33}'::jsonb from public.episodes where code='AGRO02-A2-09'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · One polite request, clarification and appropriate offer.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · could/would/can; offers","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-A2-09' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-A2-10','Explain safety rules','Brief a new employee on 5 safety rules for a sprayer-storage area.','5 understandable rules; at least 2 prohibitions.','A2',40,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-a2'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C034','A2','Explain safety rules','must/mustn''t; have to','Brief a new employee on 5 safety rules for a sprayer-storage area.','5 understandable rules; at least 2 prohibitions.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C034','assessed' from public.episodes where code='AGRO02-A2-10' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"5 understandable rules; at least 2 prohibitions.","sourceNumber":34}'::jsonb from public.episodes where code='AGRO02-A2-10'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · 5 understandable rules; at least 2 prohibitions.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · must/mustn''t; have to","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-A2-10' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-A2-11','Discuss abilities and possibilities','During equipment planning, distinguish 3 confirmed operator skills from 2 possible options.','3 ability claims plus 2 appropriately uncertain possibilities.','A2',40,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-a2'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C035','A2','Discuss abilities and possibilities','can/could; may/might','During equipment planning, distinguish 3 confirmed operator skills from 2 possible options.','3 ability claims plus 2 appropriately uncertain possibilities.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C035','assessed' from public.episodes where code='AGRO02-A2-11' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"3 ability claims plus 2 appropriately uncertain possibilities.","sourceNumber":35}'::jsonb from public.episodes where code='AGRO02-A2-11'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · 3 ability claims plus 2 appropriately uncertain possibilities.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · can/could; may/might","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-A2-11' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-A2-12','Describe a farm visited','Give a 60-second report on a farm visit: facilities, practices and impressions.','At least 5 linked facts in an intelligible report.','A2',40,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-a2'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C036','A2','Describe a farm visited','past simple; there was/were','Give a 60-second report on a farm visit: facilities, practices and impressions.','At least 5 linked facts in an intelligible report.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C036','assessed' from public.episodes where code='AGRO02-A2-12' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"At least 5 linked facts in an intelligible report.","sourceNumber":36}'::jsonb from public.episodes where code='AGRO02-A2-12'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · At least 5 linked facts in an intelligible report.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · past simple; there was/were","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-A2-12' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-A2-13','Discuss career experience','Interview a colleague about 3 work experiences, then summarize your own history.','3 experience exchanges, with accurate time framing.','A2',40,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-a2'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C037','A2','Discuss career experience','present perfect; ever/never; for/since','Interview a colleague about 3 work experiences, then summarize your own history.','3 experience exchanges, with accurate time framing.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C037','assessed' from public.episodes where code='AGRO02-A2-13' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"3 experience exchanges, with accurate time framing.","sourceNumber":37}'::jsonb from public.episodes where code='AGRO02-A2-13'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · 3 experience exchanges, with accurate time framing.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · present perfect; ever/never; for/since","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-A2-13' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-A2-14','Report recent changes','Using a maintenance board, report 4 completed or pending tasks.','At least 3 accurate updates and pending/completed distinction.','A2',40,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-a2'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C038','A2','Report recent changes','present perfect; just/already/yet','Using a maintenance board, report 4 completed or pending tasks.','At least 3 accurate updates and pending/completed distinction.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C038','assessed' from public.episodes where code='AGRO02-A2-14' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"At least 3 accurate updates and pending/completed distinction.","sourceNumber":38}'::jsonb from public.episodes where code='AGRO02-A2-14'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · At least 3 accurate updates and pending/completed distinction.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · present perfect; just/already/yet","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-A2-14' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-A2-15','Explain a farming process in detail','Explain soil sampling from choosing points through labeling samples.','At least 6 ordered stages with no crucial safety/quality omission.','A2',40,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-a2'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C039','A2','Explain a farming process in detail','sequencing; process verbs','Explain soil sampling from choosing points through labeling samples.','At least 6 ordered stages with no crucial safety/quality omission.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C039','assessed' from public.episodes where code='AGRO02-A2-15' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"At least 6 ordered stages with no crucial safety/quality omission.","sourceNumber":39}'::jsonb from public.episodes where code='AGRO02-A2-15'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · At least 6 ordered stages with no crucial safety/quality omission.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · sequencing; process verbs","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-A2-15' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-A2-16','Advise on a farm problem','A coworker reports yellowing leaves. Offer 3 reasonable next steps without claiming a diagnosis.','3 distinct justified recommendations and appropriate caution.','A2',40,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-a2'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C040','A2','Advise on a farm problem','should/shouldn''t; because','A coworker reports yellowing leaves. Offer 3 reasonable next steps without claiming a diagnosis.','3 distinct justified recommendations and appropriate caution.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C040','assessed' from public.episodes where code='AGRO02-A2-16' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"3 distinct justified recommendations and appropriate caution.","sourceNumber":40}'::jsonb from public.episodes where code='AGRO02-A2-16'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · 3 distinct justified recommendations and appropriate caution.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · should/shouldn''t; because","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-A2-16' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-A2-17','Discuss future schedules and forecasts','Use a harvest calendar and weather chart to distinguish fixed activities and predictions.','2 scheduled facts + 2 evidence-based predictions clearly separated.','A2',40,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-a2'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C041','A2','Discuss future schedules and forecasts','timetables; will vs scheduled present','Use a harvest calendar and weather chart to distinguish fixed activities and predictions.','2 scheduled facts + 2 evidence-based predictions clearly separated.','Speaking + reading') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C041','assessed' from public.episodes where code='AGRO02-A2-17' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking + reading","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"2 scheduled facts + 2 evidence-based predictions clearly separated.","sourceNumber":41}'::jsonb from public.episodes where code='AGRO02-A2-17'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · 2 scheduled facts + 2 evidence-based predictions clearly separated.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · timetables; will vs scheduled present","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-A2-17' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-A2-18','Make promises and spontaneous decisions','In a role-play with a delayed delivery, react immediately and make 3 feasible commitments.','3 appropriately phrased decisions/promises with responsibility.','A2',40,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-a2'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C042','A2','Make promises and spontaneous decisions','will + verb','In a role-play with a delayed delivery, react immediately and make 3 feasible commitments.','3 appropriately phrased decisions/promises with responsibility.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C042','assessed' from public.episodes where code='AGRO02-A2-18' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"3 appropriately phrased decisions/promises with responsibility.","sourceNumber":42}'::jsonb from public.episodes where code='AGRO02-A2-18'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · 3 appropriately phrased decisions/promises with responsibility.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · will + verb","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-A2-18' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-A2-19','Report an operational problem','Brief a manager on a malfunction: what happened, what has been done and what remains.','Timeline, action taken and unresolved issue all clear.','A2',40,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-a2'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C043','A2','Report an operational problem','past simple; present perfect','Brief a manager on a malfunction: what happened, what has been done and what remains.','Timeline, action taken and unresolved issue all clear.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C043','assessed' from public.episodes where code='AGRO02-A2-19' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"Timeline, action taken and unresolved issue all clear.","sourceNumber":43}'::jsonb from public.episodes where code='AGRO02-A2-19'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · Timeline, action taken and unresolved issue all clear.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · past simple; present perfect","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-A2-19' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-A2-20','Explain why tools and actions are used','Explain the purposes of 5 pieces of farm equipment to a trainee.','At least 4/5 purposes correctly related to function.','A2',40,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-a2'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C044','A2','Explain why tools and actions are used','to + infinitive; for + noun/-ing','Explain the purposes of 5 pieces of farm equipment to a trainee.','At least 4/5 purposes correctly related to function.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C044','assessed' from public.episodes where code='AGRO02-A2-20' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"At least 4/5 purposes correctly related to function.","sourceNumber":44}'::jsonb from public.episodes where code='AGRO02-A2-20'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · At least 4/5 purposes correctly related to function.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · to + infinitive; for + noun/-ing","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-A2-20' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-A2-21','Specify supply quantities','Check an inventory and tell the buyer what is sufficient, low or missing.','At least 5 accurate quantity statements using the inventory.','A2',40,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-a2'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C045','A2','Specify supply quantities','countable/uncountable; some/any/much/many','Check an inventory and tell the buyer what is sufficient, low or missing.','At least 5 accurate quantity statements using the inventory.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C045','assessed' from public.episodes where code='AGRO02-A2-21' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"At least 5 accurate quantity statements using the inventory.","sourceNumber":45}'::jsonb from public.episodes where code='AGRO02-A2-21'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · At least 5 accurate quantity statements using the inventory.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · countable/uncountable; some/any/much/many","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-A2-21' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-A2-22','Describe agricultural landscapes','Describe a rural landscape photo, locating fields, roads, water and buildings.','At least 5 grounded features with 3 location relationships.','A2',40,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-a2'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C046','A2','Describe agricultural landscapes','location expressions; spatial language','Describe a rural landscape photo, locating fields, roads, water and buildings.','At least 5 grounded features with 3 location relationships.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C046','assessed' from public.episodes where code='AGRO02-A2-22' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"At least 5 grounded features with 3 location relationships.","sourceNumber":46}'::jsonb from public.episodes where code='AGRO02-A2-22'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · At least 5 grounded features with 3 location relationships.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · location expressions; spatial language","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-A2-22' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-A2-23','Compare agricultural practices','Compare two weed-control approaches using cost, labor, risk and efficiency data.','4 evidence-based comparisons and one reasoned preference.','A2',40,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-a2'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C047','A2','Compare agricultural practices','comparatives/superlatives; contrast','Compare two weed-control approaches using cost, labor, risk and efficiency data.','4 evidence-based comparisons and one reasoned preference.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C047','assessed' from public.episodes where code='AGRO02-A2-23' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"4 evidence-based comparisons and one reasoned preference.","sourceNumber":47}'::jsonb from public.episodes where code='AGRO02-A2-23'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · 4 evidence-based comparisons and one reasoned preference.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · comparatives/superlatives; contrast","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-A2-23' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-A2-24','Narrate a farm incident','Tell the story of an irrigation failure using 6 event cards in order.','Clear beginning, complication, response and outcome.','A2',40,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-a2'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C048','A2','Narrate a farm incident','past simple/continuous; sequencing','Tell the story of an irrigation failure using 6 event cards in order.','Clear beginning, complication, response and outcome.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C048','assessed' from public.episodes where code='AGRO02-A2-24' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"Clear beginning, complication, response and outcome.","sourceNumber":48}'::jsonb from public.episodes where code='AGRO02-A2-24'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · Clear beginning, complication, response and outcome.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · past simple/continuous; sequencing","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-A2-24' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-B1-01','Present career history clearly','Explain your professional timeline and 2 experiences relevant to a new role.','Past finished periods and current experience correctly distinguished.','B1',50,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-b1'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C049','B1','Present career history clearly','past simple vs present perfect','Explain your professional timeline and 2 experiences relevant to a new role.','Past finished periods and current experience correctly distinguished.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C049','assessed' from public.episodes where code='AGRO02-B1-01' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"Past finished periods and current experience correctly distinguished.","sourceNumber":49}'::jsonb from public.episodes where code='AGRO02-B1-01'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · Past finished periods and current experience correctly distinguished.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · past simple vs present perfect","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-B1-01' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-B1-02','Discuss agricultural trends','Use a 5-year rainfall or productivity chart to describe 3 continuing trends.','3 chart-grounded trends with suitable duration expressions.','B1',50,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-b1'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C050','B1','Discuss agricultural trends','present perfect continuous; trends','Use a 5-year rainfall or productivity chart to describe 3 continuing trends.','3 chart-grounded trends with suitable duration expressions.','Speaking + reading') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C050','assessed' from public.episodes where code='AGRO02-B1-02' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking + reading","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"3 chart-grounded trends with suitable duration expressions.","sourceNumber":50}'::jsonb from public.episodes where code='AGRO02-B1-02'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · 3 chart-grounded trends with suitable duration expressions.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · present perfect continuous; trends","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-B1-02' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-B1-03','Present a project timeline','Present a 6-month rotation project, distinguishing ongoing activities and completion milestones.','2 in-progress future activities and 2 deadlines accurately expressed.','B1',50,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-b1'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C051','B1','Present a project timeline','future forms; future continuous/perfect','Present a 6-month rotation project, distinguishing ongoing activities and completion milestones.','2 in-progress future activities and 2 deadlines accurately expressed.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C051','assessed' from public.episodes where code='AGRO02-B1-03' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"2 in-progress future activities and 2 deadlines accurately expressed.","sourceNumber":51}'::jsonb from public.episodes where code='AGRO02-B1-03'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · 2 in-progress future activities and 2 deadlines accurately expressed.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · future forms; future continuous/perfect","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-B1-03' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-B1-04','Explain likely consequences','For 4 realistic field decisions, describe what will probably happen if conditions change.','At least 3 plausible if–result relationships.','B1',50,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-b1'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C052','B1','Explain likely consequences','first conditional','For 4 realistic field decisions, describe what will probably happen if conditions change.','At least 3 plausible if–result relationships.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C052','assessed' from public.episodes where code='AGRO02-B1-04' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"At least 3 plausible if–result relationships.","sourceNumber":52}'::jsonb from public.episodes where code='AGRO02-B1-04'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · At least 3 plausible if–result relationships.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · first conditional","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-B1-04' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-B1-05','Advise strongly and infer causes','Respond to a storage safety case; distinguish mandatory action, advice and possible cause.','3 categories clearly distinguished with justification.','B1',50,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-b1'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C053','B1','Advise strongly and infer causes','must/should/ought to; degrees of certainty','Respond to a storage safety case; distinguish mandatory action, advice and possible cause.','3 categories clearly distinguished with justification.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C053','assessed' from public.episodes where code='AGRO02-B1-05' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"3 categories clearly distinguished with justification.","sourceNumber":53}'::jsonb from public.episodes where code='AGRO02-B1-05'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · 3 categories clearly distinguished with justification.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · must/should/ought to; degrees of certainty","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-B1-05' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-B1-06','Explain obligations and permissions','Compare 4 workplace rules for employees and contractors, including a rule that changed.','At least 4 correct obligations/permissions and a past–present contrast.','B1',50,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-b1'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C054','B1','Explain obligations and permissions','must/have to; allowed to; past forms','Compare 4 workplace rules for employees and contractors, including a rule that changed.','At least 4 correct obligations/permissions and a past–present contrast.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C054','assessed' from public.episodes where code='AGRO02-B1-06' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"At least 4 correct obligations/permissions and a past–present contrast.","sourceNumber":54}'::jsonb from public.episodes where code='AGRO02-B1-06'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · At least 4 correct obligations/permissions and a past–present contrast.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · must/have to; allowed to; past forms","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-B1-06' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-B1-07','Explain earlier causes of a past event','Tell the story of a failed planting operation and what had happened before it.','At least 3 accurate prior-event links.','B1',50,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-b1'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C055','B1','Explain earlier causes of a past event','past perfect; past simple','Tell the story of a failed planting operation and what had happened before it.','At least 3 accurate prior-event links.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C055','assessed' from public.episodes where code='AGRO02-B1-07' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"At least 3 accurate prior-event links.","sourceNumber":55}'::jsonb from public.episodes where code='AGRO02-B1-07'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · At least 3 accurate prior-event links.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · past perfect; past simple","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-B1-07' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-B1-08','Report prices and technical advice','Read 3 messages from suppliers/consultants and brief your team without quoting verbatim.','3 faithful reported messages including source and key fact.','B1',50,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-b1'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C056','B1','Report prices and technical advice','reported speech; reporting verbs','Read 3 messages from suppliers/consultants and brief your team without quoting verbatim.','3 faithful reported messages including source and key fact.','Speaking + reading') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C056','assessed' from public.episodes where code='AGRO02-B1-08' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking + reading","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"3 faithful reported messages including source and key fact.","sourceNumber":56}'::jsonb from public.episodes where code='AGRO02-B1-08'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · 3 faithful reported messages including source and key fact.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · reported speech; reporting verbs","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-B1-08' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-B1-09','Ask indirect professional questions','Interview a visiting buyer using 4 indirect questions about specifications and delivery.','At least 3 grammatically and pragmatically appropriate questions.','B1',50,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-b1'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C057','B1','Ask indirect professional questions','indirect question word order','Interview a visiting buyer using 4 indirect questions about specifications and delivery.','At least 3 grammatically and pragmatically appropriate questions.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C057','assessed' from public.episodes where code='AGRO02-B1-09' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"At least 3 grammatically and pragmatically appropriate questions.","sourceNumber":57}'::jsonb from public.episodes where code='AGRO02-B1-09'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · At least 3 grammatically and pragmatically appropriate questions.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · indirect question word order","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-B1-09' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-B1-10','Define tools, roles and processes','Explain 5 agricultural terms to a non-specialist without using the target word itself.','4/5 useful definitions using precise relative information.','B1',50,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-b1'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C058','B1','Define tools, roles and processes','relative clauses','Explain 5 agricultural terms to a non-specialist without using the target word itself.','4/5 useful definitions using precise relative information.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C058','assessed' from public.episodes where code='AGRO02-B1-10' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"4/5 useful definitions using precise relative information.","sourceNumber":58}'::jsonb from public.episodes where code='AGRO02-B1-10'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · 4/5 useful definitions using precise relative information.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · relative clauses","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-B1-10' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-B1-11','Justify agricultural decisions','Recommend a cover crop in a short memo explaining the objective, rationale and expected result.','Clear decision, 2 reasons and an intended outcome.','B1',50,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-b1'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C059','B1','Justify agricultural decisions','because/so/so that/therefore','Recommend a cover crop in a short memo explaining the objective, rationale and expected result.','Clear decision, 2 reasons and an intended outcome.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C059','assessed' from public.episodes where code='AGRO02-B1-11' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"Clear decision, 2 reasons and an intended outcome.","sourceNumber":59}'::jsonb from public.episodes where code='AGRO02-B1-11'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · Clear decision, 2 reasons and an intended outcome.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · because/so/so that/therefore","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-B1-11' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-B1-12','Summarize a technical text','Read a 300-word extension note and give a 90-second briefing of its key recommendations.','Main purpose, 3 key points and no major distortion.','B1',50,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-b1'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C060','B1','Summarize a technical text','paraphrasing; discourse markers','Read a 300-word extension note and give a 90-second briefing of its key recommendations.','Main purpose, 3 key points and no major distortion.','Speaking + reading') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C060','assessed' from public.episodes where code='AGRO02-B1-12' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking + reading","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"Main purpose, 3 key points and no major distortion.","sourceNumber":60}'::jsonb from public.episodes where code='AGRO02-B1-12'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · Main purpose, 3 key points and no major distortion.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · paraphrasing; discourse markers","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-B1-12' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-B1-13','Discuss alternative past outcomes','Review 3 historical farm incidents and explain how different actions might have changed results.','3 credible counterfactuals, correctly anchored in the past.','B1',50,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-b1'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C061','B1','Discuss alternative past outcomes','third conditional','Review 3 historical farm incidents and explain how different actions might have changed results.','3 credible counterfactuals, correctly anchored in the past.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C061','assessed' from public.episodes where code='AGRO02-B1-13' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"3 credible counterfactuals, correctly anchored in the past.","sourceNumber":61}'::jsonb from public.episodes where code='AGRO02-B1-13'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · 3 credible counterfactuals, correctly anchored in the past.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · third conditional","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-B1-13' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-B1-14','Infer causes of past problems','Given a crop-loss case with 4 clues, propose 3 hypotheses and rank their likelihood.','3 evidence-linked hypotheses with appropriate uncertainty.','B1',50,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-b1'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C062','B1','Infer causes of past problems','past deduction modals','Given a crop-loss case with 4 clues, propose 3 hypotheses and rank their likelihood.','3 evidence-linked hypotheses with appropriate uncertainty.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C062','assessed' from public.episodes where code='AGRO02-B1-14' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"3 evidence-linked hypotheses with appropriate uncertainty.","sourceNumber":62}'::jsonb from public.episodes where code='AGRO02-B1-14'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · 3 evidence-linked hypotheses with appropriate uncertainty.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · past deduction modals","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-B1-14' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-B1-15','Describe processes objectively','Convert a 5-step produce-handling procedure into a factual inspection description.','At least 4 accurate passive/process statements with correct sequence.','B1',50,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-b1'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C063','B1','Describe processes objectively','passive voice present/past; reporting','Convert a 5-step produce-handling procedure into a factual inspection description.','At least 4 accurate passive/process statements with correct sequence.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C063','assessed' from public.episodes where code='AGRO02-B1-15' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"At least 4 accurate passive/process statements with correct sequence.","sourceNumber":63}'::jsonb from public.episodes where code='AGRO02-B1-15'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · At least 4 accurate passive/process statements with correct sequence.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · passive voice present/past; reporting","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-B1-15' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-B1-16','Negotiate politely','Role-play a delivery dispute: request a change, offer a concession and confirm agreement.','Clear request, concession and mutually understandable outcome.','B1',50,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-b1'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C064','B1','Negotiate politely','conditionals; tactful requests','Role-play a delivery dispute: request a change, offer a concession and confirm agreement.','Clear request, concession and mutually understandable outcome.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C064','assessed' from public.episodes where code='AGRO02-B1-16' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"Clear request, concession and mutually understandable outcome.","sourceNumber":64}'::jsonb from public.episodes where code='AGRO02-B1-16'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · Clear request, concession and mutually understandable outcome.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · conditionals; tactful requests","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-B1-16' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-B1-17','Debate an agricultural issue','Debate whether to adopt precision agriculture, responding to 2 counterarguments.','Position + 2 evidence-based reasons + respectful responses.','B1',50,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-b1'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C065','B1','Debate an agricultural issue','opinion; agreement; concession','Debate whether to adopt precision agriculture, responding to 2 counterarguments.','Position + 2 evidence-based reasons + respectful responses.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C065','assessed' from public.episodes where code='AGRO02-B1-17' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"Position + 2 evidence-based reasons + respectful responses.","sourceNumber":65}'::jsonb from public.episodes where code='AGRO02-B1-17'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · Position + 2 evidence-based reasons + respectful responses.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · opinion; agreement; concession","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-B1-17' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-B1-18','Discuss an article or documentary','After reading an agro case study, summarize its argument and discuss two implications.','Accurate summary, 2 relevant implications and one question.','B1',50,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-b1'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C066','B1','Discuss an article or documentary','summarizing; inference; narrative','After reading an agro case study, summarize its argument and discuss two implications.','Accurate summary, 2 relevant implications and one question.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C066','assessed' from public.episodes where code='AGRO02-B1-18' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"Accurate summary, 2 relevant implications and one question.","sourceNumber":66}'::jsonb from public.episodes where code='AGRO02-B1-18'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · Accurate summary, 2 relevant implications and one question.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · summarizing; inference; narrative","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-B1-18' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-B1-19','Evaluate professional strengths','Recommend a candidate for farm supervisor using 3 experiences as evidence.','3 strengths linked to concrete examples; balanced assessment.','B1',50,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-b1'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C067','B1','Evaluate professional strengths','character/competency language','Recommend a candidate for farm supervisor using 3 experiences as evidence.','3 strengths linked to concrete examples; balanced assessment.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C067','assessed' from public.episodes where code='AGRO02-B1-19' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"3 strengths linked to concrete examples; balanced assessment.","sourceNumber":67}'::jsonb from public.episodes where code='AGRO02-B1-19'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · 3 strengths linked to concrete examples; balanced assessment.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · character/competency language","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-B1-19' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-B1-20','Write a formal professional email','Write 130–170 words requesting a correction to a seed delivery invoice.','Clear subject/purpose, evidence, desired action and professional tone.','B1',50,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-b1'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C068','B1','Write a formal professional email','email conventions; cohesion','Write 130–170 words requesting a correction to a seed delivery invoice.','Clear subject/purpose, evidence, desired action and professional tone.','Writing') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C068','assessed' from public.episodes where code='AGRO02-B1-20' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Writing","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"Clear subject/purpose, evidence, desired action and professional tone.","sourceNumber":68}'::jsonb from public.episodes where code='AGRO02-B1-20'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · Clear subject/purpose, evidence, desired action and professional tone.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · email conventions; cohesion","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-B1-20' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-B1-21','Solve a multifactor farm problem','Given rising irrigation costs, propose 3 solutions and compare trade-offs.','3 options, benefits/risks and justified preferred solution.','B1',50,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-b1'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C069','B1','Solve a multifactor farm problem','conditionals; contrast; modals','Given rising irrigation costs, propose 3 solutions and compare trade-offs.','3 options, benefits/risks and justified preferred solution.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C069','assessed' from public.episodes where code='AGRO02-B1-21' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"3 options, benefits/risks and justified preferred solution.","sourceNumber":69}'::jsonb from public.episodes where code='AGRO02-B1-21'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · 3 options, benefits/risks and justified preferred solution.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · conditionals; contrast; modals","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-B1-21' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-B1-22','Compare systems and technologies','Compare manual and mechanized harvesting from a supplied cost/output table.','At least 4 supported comparisons and one defensible recommendation.','B1',50,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-b1'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C070','B1','Compare systems and technologies','comparatives; contrast linkers','Compare manual and mechanized harvesting from a supplied cost/output table.','At least 4 supported comparisons and one defensible recommendation.','Speaking + reading') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C070','assessed' from public.episodes where code='AGRO02-B1-22' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking + reading","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"At least 4 supported comparisons and one defensible recommendation.","sourceNumber":70}'::jsonb from public.episodes where code='AGRO02-B1-22'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · At least 4 supported comparisons and one defensible recommendation.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · comparatives; contrast linkers","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-B1-22' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-B1-23','Give a short technical presentation','Give a 3-minute presentation on a known farm practice and answer 2 questions.','Opening, 3 organized points, conclusion and answers understood.','B1',50,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-b1'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C071','B1','Give a short technical presentation','structure; signposting','Give a 3-minute presentation on a known farm practice and answer 2 questions.','Opening, 3 organized points, conclusion and answers understood.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C071','assessed' from public.episodes where code='AGRO02-B1-23' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"Opening, 3 organized points, conclusion and answers understood.","sourceNumber":71}'::jsonb from public.episodes where code='AGRO02-B1-23'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · Opening, 3 organized points, conclusion and answers understood.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · structure; signposting","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-B1-23' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-B1-24','Describe career ambitions','Explain a 3-year agribusiness career plan with 3 milestones and contingencies.','Clear goal, 3 timed steps and 1 alternative route.','B1',50,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-b1'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C072','B1','Describe career ambitions','future forms; goals; milestones','Explain a 3-year agribusiness career plan with 3 milestones and contingencies.','Clear goal, 3 timed steps and 1 alternative route.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C072','assessed' from public.episodes where code='AGRO02-B1-24' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"Clear goal, 3 timed steps and 1 alternative route.","sourceNumber":72}'::jsonb from public.episodes where code='AGRO02-B1-24'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · Clear goal, 3 timed steps and 1 alternative route.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · future forms; goals; milestones","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-B1-24' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-B2-01','Analyze extended past processes','Explain why a soil issue worsened before an intervention, based on a timeline.','Duration, prior activity and present or later impact accurately linked.','B2',60,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-b2'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C073','B2','Analyze extended past processes','past perfect continuous; causal framing','Explain why a soil issue worsened before an intervention, based on a timeline.','Duration, prior activity and present or later impact accurately linked.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C073','assessed' from public.episodes where code='AGRO02-B2-01' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"Duration, prior activity and present or later impact accurately linked.","sourceNumber":73}'::jsonb from public.episodes where code='AGRO02-B2-01'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · Duration, prior activity and present or later impact accurately linked.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · past perfect continuous; causal framing","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-B2-01' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-B2-02','Negotiate with nuanced language','Negotiate a service contract renewal with 3 constraints and one non-negotiable point.','Priorities, trade-offs, conditional offers and clear agreement/impasse.','B2',60,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-b2'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C074','B2','Negotiate with nuanced language','mixed conditionals; hedging; diplomacy','Negotiate a service contract renewal with 3 constraints and one non-negotiable point.','Priorities, trade-offs, conditional offers and clear agreement/impasse.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C074','assessed' from public.episodes where code='AGRO02-B2-02' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"Priorities, trade-offs, conditional offers and clear agreement/impasse.","sourceNumber":74}'::jsonb from public.episodes where code='AGRO02-B2-02'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · Priorities, trade-offs, conditional offers and clear agreement/impasse.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · mixed conditionals; hedging; diplomacy","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-B2-02' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-B2-03','Forecast complex future operations','Present a 2-year irrigation expansion forecast with milestones and uncertainty.','4 precise future milestones/activities and 2 risks distinguished.','B2',60,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-b2'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C075','B2','Forecast complex future operations','future perfect/continuous; scenario planning','Present a 2-year irrigation expansion forecast with milestones and uncertainty.','4 precise future milestones/activities and 2 risks distinguished.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C075','assessed' from public.episodes where code='AGRO02-B2-03' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"4 precise future milestones/activities and 2 risks distinguished.","sourceNumber":75}'::jsonb from public.episodes where code='AGRO02-B2-03'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · 4 precise future milestones/activities and 2 risks distinguished.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · future perfect/continuous; scenario planning","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-B2-03' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-B2-04','Use emphasis deliberately','Rewrite 4 neutral risk statements for an executive briefing, then justify emphasis.','3 effective emphatic revisions without changing meaning.','B2',60,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-b2'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C076','B2','Use emphasis deliberately','inversion; cleft/contrast constructions','Rewrite 4 neutral risk statements for an executive briefing, then justify emphasis.','3 effective emphatic revisions without changing meaning.','Writing') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C076','assessed' from public.episodes where code='AGRO02-B2-04' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Writing","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"3 effective emphatic revisions without changing meaning.","sourceNumber":76}'::jsonb from public.episodes where code='AGRO02-B2-04'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · 3 effective emphatic revisions without changing meaning.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · inversion; cleft/contrast constructions","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-B2-04' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-B2-05','Report with advanced passive structures','Write a 120-word neutral audit update from disputed observations.','Facts vs reported claims distinguished; 3 accurate passive structures.','B2',60,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-b2'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C077','B2','Report with advanced passive structures','passive with modals; reporting structures','Write a 120-word neutral audit update from disputed observations.','Facts vs reported claims distinguished; 3 accurate passive structures.','Writing') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C077','assessed' from public.episodes where code='AGRO02-B2-05' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Writing","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"Facts vs reported claims distinguished; 3 accurate passive structures.","sourceNumber":77}'::jsonb from public.episodes where code='AGRO02-B2-05'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · Facts vs reported claims distinguished; 3 accurate passive structures.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · passive with modals; reporting structures","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-B2-05' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-B2-06','Express wishes and regrets with nuance','Reflect on a failed harvest decision: 2 regrets, 2 desired changes and lessons.','Past vs present wishes clearly distinguished with feasible lessons.','B2',60,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-b2'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C078','B2','Express wishes and regrets with nuance','wish/if only; would; past perfect','Reflect on a failed harvest decision: 2 regrets, 2 desired changes and lessons.','Past vs present wishes clearly distinguished with feasible lessons.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C078','assessed' from public.episodes where code='AGRO02-B2-06' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"Past vs present wishes clearly distinguished with feasible lessons.","sourceNumber":78}'::jsonb from public.episodes where code='AGRO02-B2-06'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · Past vs present wishes clearly distinguished with feasible lessons.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · wish/if only; would; past perfect","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-B2-06' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-B2-07','Condense technical writing','Reduce 5 verbose research sentences, preserving agent, chronology and meaning.','At least 4 concise, unambiguous rewrites.','B2',60,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-b2'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C079','B2','Condense technical writing','participle clauses; reduced clauses','Reduce 5 verbose research sentences, preserving agent, chronology and meaning.','At least 4 concise, unambiguous rewrites.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C079','assessed' from public.episodes where code='AGRO02-B2-07' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"At least 4 concise, unambiguous rewrites.","sourceNumber":79}'::jsonb from public.episodes where code='AGRO02-B2-07'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · At least 4 concise, unambiguous rewrites.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · participle clauses; reduced clauses","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-B2-07' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-B2-08','Report nuanced exchanges','Summarize a 4-person planning meeting including warnings, objections and decisions.','Accurate speaker attribution, 4 positions and agreed actions.','B2',60,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-b2'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C080','B2','Report nuanced exchanges','reporting verbs; stance','Summarize a 4-person planning meeting including warnings, objections and decisions.','Accurate speaker attribution, 4 positions and agreed actions.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C080','assessed' from public.episodes where code='AGRO02-B2-08' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"Accurate speaker attribution, 4 positions and agreed actions.","sourceNumber":80}'::jsonb from public.episodes where code='AGRO02-B2-08'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · Accurate speaker attribution, 4 positions and agreed actions.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · reporting verbs; stance","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-B2-08' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-B2-09','Use natural agricultural collocations','Edit a 150-word report containing 10 awkward word combinations.','At least 8 natural corrections justified in context.','B2',60,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-b2'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C081','B2','Use natural agricultural collocations','collocations; register','Edit a 150-word report containing 10 awkward word combinations.','At least 8 natural corrections justified in context.','Writing') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C081','assessed' from public.episodes where code='AGRO02-B2-09' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Writing","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"At least 8 natural corrections justified in context.","sourceNumber":81}'::jsonb from public.episodes where code='AGRO02-B2-09'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · At least 8 natural corrections justified in context.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · collocations; register","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-B2-09' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-B2-10','Critique research and proposals','Review a short field-trial proposal, identifying design flaws and practical improvements.','2 methodological limitations, 2 fixes and qualified conclusion.','B2',60,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-b2'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C082','B2','Critique research and proposals','evaluative language; limitations','Review a short field-trial proposal, identifying design flaws and practical improvements.','2 methodological limitations, 2 fixes and qualified conclusion.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C082','assessed' from public.episodes where code='AGRO02-B2-10' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"2 methodological limitations, 2 fixes and qualified conclusion.","sourceNumber":82}'::jsonb from public.episodes where code='AGRO02-B2-10'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · 2 methodological limitations, 2 fixes and qualified conclusion.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · evaluative language; limitations","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-B2-10' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-B2-11','Present complex technical content','Deliver a 5-minute presentation about a farm investment, answer 3 challenging questions.','Coherent argument, evidence, time control and responsive Q&A.','B2',60,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-b2'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C083','B2','Present complex technical content','signposting; Q&A','Deliver a 5-minute presentation about a farm investment, answer 3 challenging questions.','Coherent argument, evidence, time control and responsive Q&A.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C083','assessed' from public.episodes where code='AGRO02-B2-11' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"Coherent argument, evidence, time control and responsive Q&A.","sourceNumber":83}'::jsonb from public.episodes where code='AGRO02-B2-11'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · Coherent argument, evidence, time control and responsive Q&A.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · signposting; Q&A","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-B2-11' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-B2-12','Write a formal report or proposal','Draft a 350-word proposal for a field demonstration with budget, risks and indicators.','Purpose, method, costs, risks, indicators and actionable conclusion.','B2',60,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-b2'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C084','B2','Write a formal report or proposal','report organization; nominalization','Draft a 350-word proposal for a field demonstration with budget, risks and indicators.','Purpose, method, costs, risks, indicators and actionable conclusion.','Writing') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C084','assessed' from public.episodes where code='AGRO02-B2-12' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Writing","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"Purpose, method, costs, risks, indicators and actionable conclusion.","sourceNumber":84}'::jsonb from public.episodes where code='AGRO02-B2-12'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · Purpose, method, costs, risks, indicators and actionable conclusion.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · report organization; nominalization","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-B2-12' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-B2-13','Interpret figurative business language','Explain 6 idioms from an agribusiness meeting and restate them in plain English.','At least 5 meanings accurate; knows when not to use them.','B2',60,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-b2'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C085','B2','Interpret figurative business language','idioms/metaphors; register','Explain 6 idioms from an agribusiness meeting and restate them in plain English.','At least 5 meanings accurate; knows when not to use them.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C085','assessed' from public.episodes where code='AGRO02-B2-13' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"At least 5 meanings accurate; knows when not to use them.","sourceNumber":85}'::jsonb from public.episodes where code='AGRO02-B2-13'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · At least 5 meanings accurate; knows when not to use them.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · idioms/metaphors; register","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-B2-13' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-B2-14','Argue persuasively and respond to objections','Defend a sustainability investment to a skeptical board; address 3 objections.','Clear thesis, quantified evidence and 3 substantive responses.','B2',60,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-b2'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C086','B2','Argue persuasively and respond to objections','argument; concessions; rebuttals','Defend a sustainability investment to a skeptical board; address 3 objections.','Clear thesis, quantified evidence and 3 substantive responses.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C086','assessed' from public.episodes where code='AGRO02-B2-14' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"Clear thesis, quantified evidence and 3 substantive responses.","sourceNumber":86}'::jsonb from public.episodes where code='AGRO02-B2-14'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · Clear thesis, quantified evidence and 3 substantive responses.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · argument; concessions; rebuttals","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-B2-14' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-B2-15','Interpret implied meaning','Read a policy excerpt and identify 3 implied concerns, citing text for each.','3 defensible inferences with relevant evidence and caveats.','B2',60,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-b2'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C087','B2','Interpret implied meaning','inference; stance; pragmatics','Read a policy excerpt and identify 3 implied concerns, citing text for each.','3 defensible inferences with relevant evidence and caveats.','Speaking + reading') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C087','assessed' from public.episodes where code='AGRO02-B2-15' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking + reading","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"3 defensible inferences with relevant evidence and caveats.","sourceNumber":87}'::jsonb from public.episodes where code='AGRO02-B2-15'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · 3 defensible inferences with relevant evidence and caveats.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · inference; stance; pragmatics","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-B2-15' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-B2-16','Handle delicate professional situations','Role-play telling a key supplier their quality has declined without damaging the relationship.','Firm concern, specific evidence, tactful request and clear follow-up.','B2',60,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-b2'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C088','B2','Handle delicate professional situations','diplomatic phrasing; face-saving','Role-play telling a key supplier their quality has declined without damaging the relationship.','Firm concern, specific evidence, tactful request and clear follow-up.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C088','assessed' from public.episodes where code='AGRO02-B2-16' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"Firm concern, specific evidence, tactful request and clear follow-up.","sourceNumber":88}'::jsonb from public.episodes where code='AGRO02-B2-16'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · Firm concern, specific evidence, tactful request and clear follow-up.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · diplomatic phrasing; face-saving","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-B2-16' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-B2-17','Discuss ethical and strategic dilemmas','Discuss worker welfare versus cost pressure using an agricultural case and two stakeholders.','Multiple viewpoints, explicit trade-offs and nuanced judgment.','B2',60,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-b2'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C089','B2','Discuss ethical and strategic dilemmas','abstract language; complex clauses','Discuss worker welfare versus cost pressure using an agricultural case and two stakeholders.','Multiple viewpoints, explicit trade-offs and nuanced judgment.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C089','assessed' from public.episodes where code='AGRO02-B2-17' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"Multiple viewpoints, explicit trade-offs and nuanced judgment.","sourceNumber":89}'::jsonb from public.episodes where code='AGRO02-B2-17'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · Multiple viewpoints, explicit trade-offs and nuanced judgment.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · abstract language; complex clauses","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-B2-17' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-B2-18','Model uncertain future scenarios','Present optimistic, baseline and adverse climate scenarios for a crop investment.','3 distinct scenarios, assumptions, risks and adaptive actions.','B2',60,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-b2'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C090','B2','Model uncertain future scenarios','probability modals; conditionals','Present optimistic, baseline and adverse climate scenarios for a crop investment.','3 distinct scenarios, assumptions, risks and adaptive actions.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C090','assessed' from public.episodes where code='AGRO02-B2-18' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"3 distinct scenarios, assumptions, risks and adaptive actions.","sourceNumber":90}'::jsonb from public.episodes where code='AGRO02-B2-18'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · 3 distinct scenarios, assumptions, risks and adaptive actions.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · probability modals; conditionals","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-B2-18' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-B2-19','Synthesize multiple information sources','Combine a research abstract, market note and grower interview into a 200-word briefing.','3 sources integrated; agreements, tensions and limitations identified.','B2',60,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-b2'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C091','B2','Synthesize multiple information sources','paraphrase; synthesis; attribution','Combine a research abstract, market note and grower interview into a 200-word briefing.','3 sources integrated; agreements, tensions and limitations identified.','Writing') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C091','assessed' from public.episodes where code='AGRO02-B2-19' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Writing","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"3 sources integrated; agreements, tensions and limitations identified.","sourceNumber":91}'::jsonb from public.episodes where code='AGRO02-B2-19'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · 3 sources integrated; agreements, tensions and limitations identified.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · paraphrase; synthesis; attribution","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-B2-19' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-B2-20','Facilitate a technical meeting','Lead a 10-minute mock crop-planning meeting with conflicting priorities.','Agenda, balanced participation, decisions, owners and recap.','B2',60,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-b2'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C092','B2','Facilitate a technical meeting','chairing; turn-taking; summarizing','Lead a 10-minute mock crop-planning meeting with conflicting priorities.','Agenda, balanced participation, decisions, owners and recap.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C092','assessed' from public.episodes where code='AGRO02-B2-20' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"Agenda, balanced participation, decisions, owners and recap.","sourceNumber":92}'::jsonb from public.episodes where code='AGRO02-B2-20'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · Agenda, balanced participation, decisions, owners and recap.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · chairing; turn-taking; summarizing","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-B2-20' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-B2-21','Interpret humor and irony appropriately','Analyze 3 ambiguous meeting remarks; explain literal and intended meaning and safe responses.','At least 2 correct interpretations; culturally sensitive responses.','B2',60,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-b2'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C093','B2','Interpret humor and irony appropriately','tone; cultural pragmatics','Analyze 3 ambiguous meeting remarks; explain literal and intended meaning and safe responses.','At least 2 correct interpretations; culturally sensitive responses.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C093','assessed' from public.episodes where code='AGRO02-B2-21' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"At least 2 correct interpretations; culturally sensitive responses.","sourceNumber":93}'::jsonb from public.episodes where code='AGRO02-B2-21'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · At least 2 correct interpretations; culturally sensitive responses.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · tone; cultural pragmatics","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-B2-21' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-B2-22','Write an executive summary','Write a 180–220-word executive summary of a two-page agribusiness proposal.','Problem, evidence, alternatives, recommendation and risks, no filler.','B2',60,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-b2'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C094','B2','Write an executive summary','synthesis; concise recommendation','Write a 180–220-word executive summary of a two-page agribusiness proposal.','Problem, evidence, alternatives, recommendation and risks, no filler.','Writing') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C094','assessed' from public.episodes where code='AGRO02-B2-22' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Writing","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"Problem, evidence, alternatives, recommendation and risks, no filler.","sourceNumber":94}'::jsonb from public.episodes where code='AGRO02-B2-22'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · Problem, evidence, alternatives, recommendation and risks, no filler.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · synthesis; concise recommendation","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-B2-22' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-B2-23','Negotiate contract terms','Negotiate pricing, delivery, quality tolerances and penalties using a draft supply contract.','4 clauses discussed precisely; clear concessions and final terms.','B2',60,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-b2'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C095','B2','Negotiate contract terms','commercial language; conditions','Negotiate pricing, delivery, quality tolerances and penalties using a draft supply contract.','4 clauses discussed precisely; clear concessions and final terms.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C095','assessed' from public.episodes where code='AGRO02-B2-23' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"4 clauses discussed precisely; clear concessions and final terms.","sourceNumber":95}'::jsonb from public.episodes where code='AGRO02-B2-23'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · 4 clauses discussed precisely; clear concessions and final terms.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · commercial language; conditions","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-B2-23' on conflict(episode_id,version) do nothing;
insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,'AGRO02-B2-24','Mediate across languages and cultures','Mediate a 3-party misunderstanding between producer, foreign buyer and technician.','Accurate two-way paraphrases, confirmed understanding and agreed next action.','B2',60,'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug='agro02-b2'
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values('AGRO02-C096','B2','Mediate across languages and cultures','clarification; paraphrase; intercultural awareness','Mediate a 3-party misunderstanding between producer, foreign buyer and technician.','Accurate two-way paraphrases, confirmed understanding and agreed next action.','Speaking / role-play') on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,'AGRO02-C096','assessed' from public.episodes where code='AGRO02-B2-24' on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,'{"modality":"Speaking / role-play","requiredPractice":["substitute","change","translate","create"],"expectedEvidence":"Accurate two-way paraphrases, confirmed understanding and agreed next action.","sourceNumber":96}'::jsonb from public.episodes where code='AGRO02-B2-24'
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,'{"criteria":[{"key":"task","label":"Task achieved · Accurate two-way paraphrases, confirmed understanding and agreed next action.","scale":[0,1,2,3,4]},{"key":"communication","label":"Meaning is clear and appropriate to the audience","scale":[0,1,2,3,4]},{"key":"language","label":"Language resources support the message · clarification; paraphrase; intercultural awareness","scale":[0,1,2,3,4]}],"ratingGuide":{"0":"No usable performance yet","1":"Needs substantial support","2":"Partly independent; important gaps remain","3":"Independent, clear and successful","4":"Confident, flexible and transferable"},"demonstratedRule":"All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification."}'::jsonb from public.episodes where code='AGRO02-B2-24' on conflict(episode_id,version) do nothing;
commit;
