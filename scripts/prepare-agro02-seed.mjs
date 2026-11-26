import fs from 'node:fs';
const checklist=JSON.parse(fs.readFileSync('src/data/agro02-checklist.json','utf8'));
const quote=s=>"'"+String(s).replaceAll("'","''")+"'";
const series={A1:'Meet the farm',A2:'Make things happen',B1:'Work with confidence',B2:'Lead the conversation'};
const statements=[`-- Four versioned series, 96 exact checklist mappings. Legacy curriculum remains intact.`,
 `begin;`,
 `create policy episodes_agro02_assignment_preview_read on public.episodes for select to authenticated
 using(code like 'AGRO02-%' and exists(select 1 from public.lesson_assignments a where a.episode_id=episodes.id and a.student_id=(select auth.uid())));`];
for(const [level,title] of Object.entries(series)){
 statements.push(`insert into public.series(course_id,slug,name)
 select id,${quote('agro02-'+level.toLowerCase())},${quote('AgroEnglish 0.2 · '+level+' · '+title)} from public.courses where slug='agroenglish'
 on conflict(course_id,slug) do nothing;`);
}
for(const r of checklist){
 const criteria={criteria:[{key:'task',label:'Task achieved · '+r.evidence,scale:[0,1,2,3,4]},
  {key:'communication',label:'Meaning is clear and appropriate to the audience',scale:[0,1,2,3,4]},
  {key:'language',label:'Language resources support the message · '+r.resources,scale:[0,1,2,3,4]}],
  ratingGuide:{0:'No usable performance yet',1:'Needs substantial support',2:'Partly independent; important gaps remain',3:'Independent, clear and successful',4:'Confident, flexible and transferable'},
  demonstratedRule:'All three criteria >= 3, with submitted performance evidence. This is one checklist skill, not CEFR certification.'};
 statements.push(`insert into public.episodes(series_id,code,title,description,lesson_body,level,minutes,status)
 select s.id,${quote(r.code)},${quote(r.title)},${quote(r.task)},${quote(r.evidence)},${quote(r.level)},${{A1:30,A2:40,B1:50,B2:60}[r.level]},'draft'
 from public.series s join public.courses c on c.id=s.course_id where c.slug='agroenglish' and s.slug=${quote('agro02-'+r.level.toLowerCase())}
 on conflict(code) do nothing;
 insert into public.competencies(id,level,description,language_resources,assessment_task,expected_evidence,mode)
 values(${quote('AGRO02-C'+String(r.number).padStart(3,'0'))},${quote(r.level)},${quote(r.title)},${quote(r.resources)},${quote(r.task)},${quote(r.evidence)},${quote(r.modality)}) on conflict(id) do nothing;
 insert into public.episode_competencies(episode_id,competency_id,link_kind)
 select id,${quote('AGRO02-C'+String(r.number).padStart(3,'0'))},'assessed' from public.episodes where code=${quote(r.code)} on conflict do nothing;
 insert into public.lesson_activity_definitions(episode_id,activity_key,activity_type,position,config)
 select id,'agro02','portfolio',1,${quote(JSON.stringify({modality:r.modality,requiredPractice:['substitute','change','translate','create'],expectedEvidence:r.evidence,sourceNumber:r.number}))}::jsonb from public.episodes where code=${quote(r.code)}
 on conflict(episode_id,activity_key) do nothing;
 insert into public.lesson_assessment_schemas(episode_id,version,definition)
 select id,1,${quote(JSON.stringify(criteria))}::jsonb from public.episodes where code=${quote(r.code)} on conflict(episode_id,version) do nothing;`);
}
statements.push('commit;');
fs.writeFileSync('docs/agro02_checklist_seed.sql',statements.join('\n')+'\n');
console.log('Prepared four series and 96 non-destructive episode/competency seeds.');
