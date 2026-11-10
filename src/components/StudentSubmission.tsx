'use client';
import {useEffect,useMemo,useRef,useState} from 'react';
import {browserClient} from '@/lib/supabase/browser';

type Attempt={id:string;student_id:string;episode_id:string;status:string;assignment_id:string};
type ResponseRow={activity_key:string;field_key:string;response:Record<string,unknown>};
type FileRow={id:string;activity_key:string;storage_path:string;mime_type:string;bytes:number};
type ReviewRow={id:string;feedback:string;outcome:string;created_at:string;rubric_scores:Record<string,number>};
type Activity={activity_key:string;activity_type:string;config:Record<string,unknown>;position:number};
type Episode={title:string;code:string;level:string;lesson_body?:string;description?:string};
const labels:Record<string,string>={reading:'Reading',vocabulary:'Vocabulary',substitution:'Substitution',word_families:'Word Families',first_production:'First Production',transfer:'Transfer',feedback:'Feedback'};
const defaultActivities:Activity[]=[
 {activity_key:'reading',activity_type:'reading',position:1,config:{}},
 {activity_key:'vocabulary',activity_type:'flashcards',position:2,config:{}},
 {activity_key:'substitution',activity_type:'guided_practice',position:3,config:{}},
 {activity_key:'word_families',activity_type:'multiple_choice',position:4,config:{}},
 {activity_key:'first_production',activity_type:'scaffolded_production',position:5,config:{}},
 {activity_key:'transfer',activity_type:'scaffolded_transfer',position:6,config:{}},
 {activity_key:'feedback',activity_type:'self_assessment',position:7,config:{}}
];
function textParts(value:string){
 return value.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((s,i)=>s.startsWith('**')&&s.endsWith('**')?<strong key={i}>{s.slice(2,-2)}</strong>:s.startsWith('*')&&s.endsWith('*')?<em key={i}>{s.slice(1,-1)}</em>:s);
}
function MarkdownLesson({source,reveal}:{source:string;reveal:boolean}){
 const rows=source.split('\n');
 let hideNext=false;
 return <div className="unified-text">{rows.map((line,i)=>{
  const t=line.trim();
  if(!t)return null;
  if(t.startsWith('## '))return null;
  const answer=/^\*\*(?:Key|Answers|Model for comparison|Possible model)/i.test(t);
  if(answer){hideNext=!reveal;return reveal?<p key={i} className="unified-answer">{textParts(t)}</p>:null;}
  if(hideNext){if(t.startsWith('**')||t.startsWith('###')||t.startsWith('##'))hideNext=false;else return null;}
  if(!reveal&&/^\*\*Teacher note:/i.test(t))return null;
  if(t.startsWith('### '))return <h3 key={i}>{textParts(t.slice(4))}</h3>;
  if(t.startsWith('#### '))return <h4 key={i}>{textParts(t.slice(5))}</h4>;
  if(t.startsWith('---'))return <hr key={i}/>;
  return <p key={i}>{textParts(t)}</p>;
 })}</div>;
}
function sectionAt(body:string,position:number){
 const sections=body.split(/\n(?=##\s*\d+\s*[·.])/);
 return sections.find(s=>new RegExp('^##\\s*'+position+'\\s*[·.]').test(s))||'';
}
function readingText(section:string,level:string){
 const m=section.match(new RegExp('###\\s*'+level+'[^\\n]*\\n([\\s\\S]*?)(?=\\n###\\s*(?:A1|A2|B1|B2)|\\n\\*\\*Reading check|$)'));
 return m?m[1].trim():'';
}
function readingQuestions(section:string){
 const m=section.match(/\*\*Reading check[^:]*:\*\*\s*([\s\S]*?)(?=\n\*\*Answers|$)/i);
 return m?m[1].trim():'';
}
function glossary(section:string){
 const output:{word:string;meaning:string}[]=[];
 for(const line of section.split('\n')){
  if(!/^\*\*(People|Places|Crops|Actions):\*\*/.test(line))continue;
  const rest=line.replace(/^\*\*[^*]+:\*\*\s*/,'');
  for(const pair of rest.split(';')){
   const index=pair.indexOf('=');
   if(index>0)output.push({word:pair.slice(0,index).trim().replace(/[. ]+$/,''),meaning:pair.slice(index+1).trim().replace(/[. ]+$/,'')});
  }
 }
 return output;
}
function selectIntro(code:string){
 return code.startsWith('AGRO')?'AGROENGLISH':code.startsWith('MED')?'MED-ENGLISH':'STARK LEARNING';
}
function examplePlaceholder(key:string){
 if(key==='reading')return 'Answer the reading-check questions here.';
 if(key==='vocabulary')return 'Use three new words in sentences about agriculture or your work.';
 if(key==='substitution')return 'Write your new sentences using the substitution patterns.';
 if(key==='word_families')return 'Write your answers and make one sentence with a word family.';
 if(key==='first_production')return 'Write your first introduction (5–7 sentences).';
 if(key==='transfer')return 'Write a new introduction for the visiting researcher.';
 return 'What did you change, and why?';
}
export function StudentSubmission({attempt,episode,activities,initialResponses,initialFiles,reviews}:{attempt:Attempt;episode:Episode|null;activities:Activity[];initialResponses:ResponseRow[];initialFiles:FileRow[];reviews:ReviewRow[]}){
 const lesson=episode?.lesson_body||'';
 const list=useMemo(()=>activities.length?activities:defaultActivities,[activities]);
 const [active,setActive]=useState(0);
 const [level,setLevel]=useState('A1');
 const [reveal,setReveal]=useState<Record<string,boolean>>({});
 const [cardIndex,setCardIndex]=useState(0);
 const [cardFlipped,setCardFlipped]=useState(false);
 const [responses,setResponses]=useState(initialResponses);
 const [files,setFiles]=useState(initialFiles);
 const [status,setStatus]=useState(attempt.status);
 const [busy,setBusy]=useState(false);
 const [saving,setSaving]=useState(false);
 const [message,setMessage]=useState('');
 const [error,setError]=useState('');
 const [recording,setRecording]=useState(false);
 const [drafts,setDrafts]=useState<Record<string,string>>(()=>Object.fromEntries(initialResponses.filter(r=>r.field_key==='main_text').map(r=>[r.activity_key,typeof r.response?.text==='string'?r.response.text:''])));
 const [dirty,setDirty]=useState<Record<string,boolean>>({});
 const draftsRef=useRef(drafts);
 const chain=useRef<Promise<unknown>>(Promise.resolve());
 const recorder=useRef<MediaRecorder|null>(null);
 const media=useRef<MediaStream|null>(null);
 const editable=status==='draft'||status==='revision_requested';
 const current=list[active]||list[0];
 const key=current.activity_key;
 const section=useMemo(()=>sectionAt(lesson,current.position),[lesson,current.position]);
 const cards=useMemo(()=>glossary(sectionAt(lesson,2)),[lesson]);
 const savedResponses=responses.filter(r=>r.field_key==='main_text'&&typeof r.response.text==='string'&&r.response.text.trim()).length;
 const evidenceCount=savedResponses+files.length;
 function changeDraft(activity:string,value:string){
  draftsRef.current={...draftsRef.current,[activity]:value};
  setDrafts(draftsRef.current);
  setDirty(d=>({...d,[activity]:true}));
  setError('');
 }
 function saveOne(activity:string,value:string){
  const run=async()=>{
   setSaving(true);
   const {error:saveError}=await browserClient().from('lesson_responses').upsert({
    attempt_id:attempt.id,activity_key:activity,field_key:'main_text',response:{text:value}
   },{onConflict:'attempt_id,activity_key,field_key'});
   if(saveError){setError('Unable to save: '+saveError.message);setSaving(false);return false;}
   setResponses(old=>[...old.filter(r=>r.activity_key!==activity||r.field_key!=='main_text'),{activity_key:activity,field_key:'main_text',response:{text:value}}]);
   if(draftsRef.current[activity]===value)setDirty(d=>({...d,[activity]:false}));
   setSaving(false);
   return true;
  };
  const next=chain.current.then(run,run);
  chain.current=next.then(()=>undefined,()=>undefined);
  return next;
 }
 useEffect(()=>{
  if(!editable||!Object.values(dirty).some(Boolean))return;
  const t=setTimeout(()=>{for(const [a,flag] of Object.entries(dirty))if(flag)void saveOne(a,draftsRef.current[a]||'');},950);
  return ()=>clearTimeout(t);
 },[drafts,dirty,editable]);
 async function flush(){
  const tasks=Object.entries(dirty).filter(([,flag])=>flag).map(([a])=>saveOne(a,draftsRef.current[a]||''));
  const results=await Promise.all(tasks);
  await chain.current;
  return results.every(Boolean);
 }
 async function upload(activity:string,file:File){
  if(!editable)return;
  setBusy(true);setError('');setMessage('');
  try{
   const type=file.type||'application/octet-stream';
   if(!['audio/webm','audio/mp4','audio/mpeg','audio/wav','application/pdf','text/plain'].includes(type))throw Error('Use WebM, MP4, MP3, WAV, PDF or TXT.');
   if(file.size>52428800)throw Error('Maximum file size is 50 MB.');
   const path=attempt.student_id+'/'+attempt.id+'/'+crypto.randomUUID()+'-'+file.name.replace(/[^a-zA-Z0-9._-]/g,'_');
   const sb=browserClient();
   const {error:up}=await sb.storage.from('lesson-submissions').upload(path,file,{contentType:type,upsert:false});
   if(up)throw up;
   const {data,error:db}=await sb.from('lesson_submission_files').insert({
    attempt_id:attempt.id,activity_key:activity,storage_path:path,mime_type:type,bytes:file.size
   }).select().single();
   if(db)throw db;
   setFiles(f=>[...f,data]);setMessage('Evidence uploaded successfully.');
  }catch(e){setError(e instanceof Error?e.message:'Upload failed.')}finally{setBusy(false);}
 }
 async function startRecording(){
  setError('');
  if(!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder==='undefined'){setError('Recording is unavailable on this device. Attach an audio file instead.');return;}
  try{
   const stream=await navigator.mediaDevices.getUserMedia({audio:true});
   media.current=stream;
   const type=['audio/webm','audio/mp4'].find(t=>MediaRecorder.isTypeSupported(t))||'';
   const chunks:BlobPart[]=[];
   const r=new MediaRecorder(stream,type?{mimeType:type}:undefined);
   const activity=key;
   r.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
   r.onstop=()=>{
    stream.getTracks().forEach(t=>t.stop());
    media.current=null;setRecording(false);
    const mime=r.mimeType||type||'audio/webm';
    const ext=mime.includes('mp4')?'m4a':'webm';
    const file=new File([new Blob(chunks,{type:mime})],activity+'-recording.'+ext,{type:mime});
    if(file.size)void upload(activity,file);
   };
   recorder.current=r;r.start();setRecording(true);
  }catch(e){setError(e instanceof Error?e.message:'Microphone permission was not granted.');}
 }
 function stopRecording(){if(recorder.current?.state==='recording')recorder.current.stop();}
 useEffect(()=>()=>{if(recorder.current?.state==='recording')recorder.current.stop();media.current?.getTracks().forEach(t=>t.stop());},[]);
 async function download(path:string){
  const {data,error:err}=await browserClient().storage.from('lesson-submissions').createSignedUrl(path,90);
  if(err)setError(err.message);else window.open(data.signedUrl,'_blank','noopener,noreferrer');
 }
 async function submit(){
  if(!editable||busy)return;
  setError('');setMessage('');
  if(!Object.values(draftsRef.current).some(v=>v.trim())){setError('Write at least one response before submitting.');return;}
  setBusy(true);
  const ok=await flush();
  if(!ok){setBusy(false);return;}
  if(!window.confirm('Send your saved lesson to your teacher? You can revise it when requested.')){setBusy(false);return;}
  const {error:err}=await browserClient().rpc('submit_lesson_attempt',{p_attempt:attempt.id});
  if(err)setError(err.message);
  else{setStatus('submitted');setMessage('Lesson submitted. Teacher feedback will appear here.');}
  setBusy(false);
 }
 function playReading(value:string){
  if(!('speechSynthesis' in window)){setError('Text-to-speech is unavailable in this browser.');return;}
  window.speechSynthesis.cancel();
  const speech=new SpeechSynthesisUtterance(value);
  speech.lang='en-US';speech.rate=.88;
  window.speechSynthesis.speak(speech);
 }
 const reading=readingText(section,level);
 const genericTitle=labels[key]||key.replaceAll('_',' ');
 const title=episode?.code==='AGRO-A1-01'?'Agriculture 101 — My Place in Agriculture':episode?.title||'Lesson';
 return <div className="unified-lesson">
  <header className="unified-hero">
   <p>STARK LEARNING · {selectIntro(episode?.code||'')} · {episode?.code||'EPISODE'}</p>
   <h1>{title}</h1>
   <p>{episode?.code==='AGRO-A1-01'?'Complete lesson · A1 foundations with A2–B2 extensions':(episode?.description||'Complete lesson · '+(episode?.level||'CEFR'))}</p>
  </header>
  <div className="unified-inner">
   <nav className="unified-tabs" aria-label="Lesson activities">
    {list.map((a,i)=><button type="button" key={a.activity_key} className={i===active?'selected':''} aria-current={i===active?'step':undefined} onClick={()=>{if(recording)stopRecording();setActive(i);setReveal({});setCardFlipped(false);}}>{a.position}. {labels[a.activity_key]||a.activity_key.replaceAll('_',' ')}</button>)}
   </nav>
   <section className="unified-panel" aria-labelledby="activity-title">
    <div className="unified-meta"><span>{episode?.level||'Lesson'} · Activity {current.position} of {list.length}</span><span>{saving?'Saving…':Object.values(dirty).some(Boolean)?'Unsaved changes':editable?'Auto-save enabled':status.replaceAll('_',' ')}</span></div>
    <h2 id="activity-title">{key==='reading'?'Reading ladder':genericTitle}</h2>
    {key==='reading'&&reading?<>
     <p className="unified-muted">Read A1 first. A2–B2 are optional extensions. Use your browser voice for listening practice.</p>
     <div className="unified-levels">{['A1','A2','B1','B2'].map(l=><button type="button" key={l} className={level===l?'selected':''} onClick={()=>setLevel(l)}>{l}</button>)}</div>
     <div className="unified-reading-text"><MarkdownLesson source={reading} reveal={false}/></div>
     <button type="button" className="unified-soft" onClick={()=>playReading(reading.replace(/[*#]/g,''))}>▶ Listen to this reading</button>
     {level==='A1'&&readingQuestions(section)&&<div className="unified-prompts"><strong>Reading check</strong><p>{readingQuestions(section)}</p></div>}
    </>:<MarkdownLesson source={section||'Complete the activity and write your response below.'} reveal={!!reveal[key]}/>}
    {key==='vocabulary'&&cards.length>0&&<div className="unified-flashcard">
     <p className="unified-muted">Vocabulary card {cardIndex+1} / {cards.length} · Tap the card to reveal the translation</p>
     <button className="unified-flash-face" type="button" onClick={()=>setCardFlipped(!cardFlipped)}>
      <strong>{cardFlipped?cards[cardIndex].meaning:cards[cardIndex].word}</strong><small>{cardFlipped?'Portuguese translation':'Tap to flip'}</small>
     </button>
     <div className="unified-row"><button className="unified-soft" type="button" onClick={()=>{setCardIndex((cardIndex+cards.length-1)%cards.length);setCardFlipped(false);}}>← Previous</button><button className="unified-soft" type="button" onClick={()=>{setCardIndex((cardIndex+1)%cards.length);setCardFlipped(false);}}>Next →</button></div>
    </div>}
    {section&&key!=='reading'&&/(\*\*Key:|\*\*Answers:|\*\*Model for comparison|\*\*Possible model)/.test(section)&&<button className="unified-soft" type="button" onClick={()=>setReveal(r=>({...r,[key]:!r[key]}))}>{reveal[key]?'Hide model / answer key':'Reveal model / answer key'}</button>}
    <div className="unified-evidence">
     <label htmlFor={'answer-'+key}>{key==='feedback'?'My reflection / revision note':key==='first_production'||key==='transfer'?'My writing':'My answers / practice'}</label>
     <textarea id={'answer-'+key} rows={key==='first_production'||key==='transfer'?8:5} placeholder={examplePlaceholder(key)} value={drafts[key]||''} disabled={!editable||busy} onChange={e=>changeDraft(key,e.target.value)}/>
     <div className="unified-row">
      {editable&&<button className="unified-soft" type="button" disabled={busy||saving||!dirty[key]} onClick={()=>void saveOne(key,draftsRef.current[key]||'')}>{saving?'Saving…':'Save now'}</button>}
      {editable&&<label className="unified-upload">Attach audio or document<input type="file" accept="audio/webm,audio/mp4,audio/mpeg,audio/wav,.mp3,.m4a,.pdf,.txt" disabled={busy||recording} onChange={e=>{const f=e.target.files?.[0];if(f)void upload(key,f);e.target.value='';}}/></label>}
      {editable&&<button className="unified-soft" type="button" disabled={busy} onClick={recording?stopRecording:()=>void startRecording()}>{recording?'■ Stop recording':'● Record answer'}</button>}
     </div>
     {files.filter(f=>f.activity_key===key).map(f=><button type="button" className="unified-file" key={f.id} onClick={()=>void download(f.storage_path)}>◉ {f.storage_path.split('/').at(-1)}</button>)}
    </div>
    <div className="unified-row unified-navigation">
     {active>0&&<button className="unified-soft" type="button" onClick={()=>setActive(i=>i-1)}>← Previous activity</button>}
     {active<list.length-1&&<button className="unified-primary" type="button" onClick={()=>{setActive(i=>i+1);setReveal({});}}>Next activity →</button>}
    </div>
   </section>
   {reviews.map(r=><section className="unified-panel unified-feedback" key={r.id}><p className="unified-eyebrow">Teacher feedback · {r.outcome.replaceAll('_',' ')}</p><p style={{whiteSpace:'pre-wrap'}}>{r.feedback}</p><small>{new Date(r.created_at).toLocaleString()}</small></section>)}
   <section className="unified-panel unified-final">
    <div><p className="unified-eyebrow">Final submission</p><h2>{status==='submitted'||status==='claimed'?'Waiting for teacher feedback':status==='finalized'?'Lesson reviewed':'Ready to send your lesson?'}</h2><p>{evidenceCount} saved response(s) or file(s). {editable?'Your answers are saved within this lesson. Submit when your work is complete.':'Your work remains available here for review.'}</p></div>
    {editable&&<button type="button" className="unified-primary" disabled={busy||saving||(!Object.values(drafts).some(v=>v.trim())&&savedResponses===0)} onClick={()=>void submit()}>{busy?'Submitting…':'Submit to Teacher →'}</button>}
   </section>
   {(error||message)&&<p className={error?'unified-message unified-error':'unified-message'} role="status">{error||message}</p>}
  </div>
 </div>;
}
