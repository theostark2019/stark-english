'use client';
import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {browserClient} from '@/lib/supabase/browser';
import {agroHref,MODEL_AUDIO,AGRO_SERIES,type AgroEpisode} from '@/lib/agro02';

type Attempt={id:string;student_id:string;assignment_id:string;status:string};
type ProofFile={id:string;activity_key:string;storage_path:string;mime_type:string;bytes:number};
type Review={id:string;feedback:string;outcome:string;created_at:string;rubric_scores:Record<string,number>};
type Practice={substitute:string;change:string;translate:string;create:string};
export type AgroAnswers={code:string;practice:Practice;proof:string;reflection:string;wordRatings:Record<string,number>;updatedAt:string};
const stages=['See the outcome','Build vocabulary','Notice the language','Rehearse','Make your proof','Feedback & improve'];
const emptyPractice:Practice={substitute:'',change:'',translate:'',create:''};
function dateLabel(s:string){return new Date(s).toLocaleString('en-GB',{timeZone:'America/Sao_Paulo',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});}

export function Agro02Lesson({episode,attempt,initialAnswers,initialFiles=[],reviews=[]}:{
 episode:AgroEpisode;attempt?:Attempt;initialAnswers?:Partial<AgroAnswers>|null;initialFiles?:ProofFile[];reviews?:Review[];
}){
 const router=useRouter();
 const [stage,setStage]=useState(attempt?.status==='revision_requested'||attempt?.status==='finalized'?5:0);
 const [answers,setAnswers]=useState<AgroAnswers>({code:episode.code,practice:{...emptyPractice,...initialAnswers?.practice},
  proof:initialAnswers?.proof||'',reflection:initialAnswers?.reflection||'',wordRatings:initialAnswers?.wordRatings||{},updatedAt:initialAnswers?.updatedAt||''});
 const [status,setStatus]=useState(attempt?.status||'preview');
 const [dirty,setDirty]=useState(false),[saveStatus,setSaveStatus]=useState(''),[message,setMessage]=useState('');
 const [recovery,setRecovery]=useState<AgroAnswers|null>(null);
 const [files,setFiles]=useState(initialFiles.filter(f=>f.activity_key==='agro02_proof'));
 const [uploading,setUploading]=useState(false),[submitting,setSubmitting]=useState(false),[recording,setRecording]=useState(false);
 const [retryAudio,setRetryAudio]=useState<Blob|null>(null),[playback,setPlayback]=useState<Record<string,string>>({});
 const [flipped,setFlipped]=useState<Record<number,boolean>>({}),[check,setCheck]=useState<Record<number,string>>({}),[checked,setChecked]=useState(false);
 const [amount,setAmount]=useState(1),[unit,setUnit]=useState('episode'),[due,setDue]=useState(''),[committing,setCommitting]=useState(false);
 const queue=useRef<Promise<void>>(Promise.resolve());
 const latest=useRef(answers);latest.current=answers;
 const recorder=useRef<MediaRecorder|null>(null),stream=useRef<MediaStream|null>(null),alive=useRef(true);
 const editable=!!attempt&&['draft','revision_requested'].includes(status);
 const speaking=episode.modality.startsWith('Speaking');
 const backupKey=attempt?'stark02:'+attempt.student_id+':'+attempt.id:null;
 const lastReview=reviews.at(-1);

 useEffect(()=>{
  alive.current=true;
  return ()=>{alive.current=false;if(recorder.current?.state==='recording')recorder.current.stop();stream.current?.getTracks().forEach(t=>t.stop())};
 },[]);
 useEffect(()=>{
  if(!backupKey||!editable)return;
  try{const value=localStorage.getItem(backupKey);if(!value)return;
   const local=JSON.parse(value) as AgroAnswers;
   if(local.code===episode.code&&local.practice&&local.updatedAt>(initialAnswers?.updatedAt||''))setRecovery(local);
  }catch{/* Cloud data stays authoritative if the browser backup is unavailable. */}
 },[backupKey,episode.code,initialAnswers?.updatedAt,editable]);
 useEffect(()=>{
  if(!backupKey||!dirty)return;
  try{localStorage.setItem(backupKey,JSON.stringify(answers))}catch{setSaveStatus('Browser backup unavailable; use Save now before leaving.')}
 },[answers,backupKey,dirty]);
 function write(patch:Partial<AgroAnswers>){
  if(attempt&&!editable)return;
  setAnswers(a=>({...a,...patch,updatedAt:new Date().toISOString()}));setDirty(true);setSaveStatus('Unsaved changes');
 }
 function practice(key:keyof Practice,value:string){write({practice:{...latest.current.practice,[key]:value}})}
 async function save(value:AgroAnswers){
  if(!attempt||!editable)throw new Error('Commit to this lesson before saving your work.');
  const operation=queue.current.catch(()=>{}).then(async()=>{
   setSaveStatus('Saving…');
   const {error}=await browserClient().from('lesson_responses').upsert({attempt_id:attempt.id,activity_key:'agro02',field_key:'portfolio',response:{value}},
    {onConflict:'attempt_id,activity_key,field_key'});
   if(error)throw new Error(error.message);
   if(latest.current.updatedAt===value.updatedAt){setDirty(false);setSaveStatus('Saved to your student record');}
  });
  queue.current=operation;
  try{await operation}catch(e){setSaveStatus('Not synced. Your browser backup is retained.');throw e;}
 }
 useEffect(()=>{
  if(!editable||!dirty)return;
  const timer=setTimeout(()=>void save(answers).catch(()=>{}),1000);
  return ()=>clearTimeout(timer);
 // Save requests are serialized; the snapshot above is the version being saved.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[answers,dirty,editable]);
 useEffect(()=>{
  if(!dirty&&!recording&&!uploading)return;
  const warn=(e:BeforeUnloadEvent)=>{e.preventDefault();e.returnValue=''};
  window.addEventListener('beforeunload',warn);return ()=>window.removeEventListener('beforeunload',warn);
 },[dirty,recording,uploading]);
 useEffect(()=>{
  if(!attempt||!editable)return;
  const session=crypto.randomUUID();let seconds=0;let interaction=Date.now();let ticks=0;
  const touch=()=>{interaction=Date.now()};
  const flush=()=>{if(seconds>0)void browserClient().rpc('stark02_log_work',{p_session:session,p_assignment:attempt.assignment_id,p_seconds:seconds})};
  const timer=setInterval(()=>{if(!document.hidden&&Date.now()-interaction<120000)seconds=Math.min(14400,seconds+5);if(++ticks%6===0)flush()},5000);
  for(const event of ['pointerdown','keydown','scroll'])window.addEventListener(event,touch,{passive:true});
  const hide=()=>{if(document.hidden)flush()};document.addEventListener('visibilitychange',hide);
  return ()=>{clearInterval(timer);flush();for(const event of ['pointerdown','keydown','scroll'])window.removeEventListener(event,touch);document.removeEventListener('visibilitychange',hide)};
 },[attempt?.id,attempt?.assignment_id,editable]);

 async function commit(){
  setCommitting(true);setMessage('');
  try{
   const {data,error}=await browserClient().rpc('stark02_commit_lesson',{p_code:episode.code,p_amount:amount,p_unit:unit,p_due:due?new Date(due).toISOString():null});
   if(error)throw error;router.push('/lessons/'+data);
  }catch(e){setMessage(e instanceof Error?e.message:String((e as {message?:string}).message||e));}
  finally{setCommitting(false)}
 }
 async function upload(blob:Blob){
  if(!attempt||!editable)return;setUploading(true);setMessage('');setRetryAudio(blob);
  try{
   const rawMime=blob.type.split(';')[0].toLowerCase();
   const mime=rawMime==='audio/x-wav'?'audio/wav':rawMime;
   if(!['audio/webm','audio/mp4','audio/mpeg','audio/wav'].includes(mime))throw new Error('Choose an MP3, M4A, WAV or WebM audio file.');
   if(!blob.size||blob.size>50*1024*1024)throw new Error('Audio must contain sound and be under 50 MB.');
   const path=attempt.student_id+'/'+attempt.id+'/'+crypto.randomUUID()+'.'+(mime.includes('mp4')?'m4a':mime.includes('mpeg')?'mp3':mime.includes('wav')?'wav':mime.includes('ogg')?'ogg':'webm');
   const sb=browserClient();
   const {error:uploadError}=await sb.storage.from('lesson-submissions').upload(path,blob,{contentType:mime,upsert:false});
   if(uploadError)throw uploadError;
   const {data,error}=await sb.from('lesson_submission_files').insert({attempt_id:attempt.id,activity_key:'agro02_proof',storage_path:path,mime_type:mime,bytes:blob.size})
    .select('id,activity_key,storage_path,mime_type,bytes').single();
   if(error)throw error;setFiles(f=>[...f,data]);setRetryAudio(null);setMessage('Audio saved. Listen back before submitting.');
  }catch(e){setMessage('Audio not saved: '+String((e as {message?:string}).message||e));}
  finally{if(alive.current)setUploading(false)}
 }
 async function record(){
  setMessage('');
  try{
   if(!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder==='undefined')throw new Error('Recording is unavailable here. Upload an audio file instead.');
   stream.current=await navigator.mediaDevices.getUserMedia({audio:true});
   const mime=['audio/webm;codecs=opus','audio/mp4','audio/webm'].find(t=>MediaRecorder.isTypeSupported(t));
   const r=new MediaRecorder(stream.current,mime?{mimeType:mime}:undefined);const chunks:BlobPart[]=[];
   recorder.current=r;r.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
   r.onstop=()=>{stream.current?.getTracks().forEach(t=>t.stop());if(!alive.current)return;setRecording(false);void upload(new Blob(chunks,{type:r.mimeType||mime||'audio/webm'}))};
   r.start();setRecording(true);
  }catch(e){stream.current?.getTracks().forEach(t=>t.stop());setMessage(String((e as {message?:string}).message||e)+' You can allow microphone access or upload your recording.');}
 }
 async function listen(file:ProofFile){
  const {data,error}=await browserClient().storage.from('lesson-submissions').createSignedUrl(file.storage_path,600);
  if(error)setMessage(error.message);else setPlayback(p=>({...p,[file.id]:data.signedUrl}));
 }
 async function submit(){
  if(!attempt||!editable||recording||uploading||submitting)return;
  setSubmitting(true);setMessage('');
  try{
   await save(latest.current);
   const {error}=await browserClient().rpc('submit_lesson_attempt',{p_attempt:attempt.id});
   if(error)throw error;setStatus('submitted');setStage(5);setMessage('Your proof has been sent to your teacher.');router.refresh();
  }catch(e){setMessage(String((e as {message?:string}).message||e));}
  finally{setSubmitting(false)}
 }
 const rehearsalReady=Object.values(answers.practice).every(s=>s.trim().length>=3);
 const proofReady=speaking?files.length>0:answers.proof.trim().length>=20;
 const correct=episode.words.slice(0,4).filter((w,i)=>check[i]===w.pt).length;
 const first=episode.code==='AGRO02-A1-01';
 return <div className="a02-page a02-lesson">
  <header className="a02-nav"><Link href={'/courses/agroenglish/series/'+episode.level.toLowerCase()} className="a02-brand">🌾 <span>AgroEnglish<small>{episode.level} · {AGRO_SERIES[episode.level].title}</small></span></Link>
   <span className="a02-status">{status.replaceAll('_',' ')}</span></header>
  <header className="a02-lesson-title"><p className="a02-eyebrow">EPISODE {String(episode.episode).padStart(2,'0')} / 24 · {episode.minutes} MIN ESTIMATED</p><h1>{episode.title}</h1><p>{episode.task}</p></header>
  {!attempt&&<div className="a02-commit"><div><strong>Make this your next commitment.</strong><p>Choose your amount of work. If you have a next meeting, it becomes your deadline.</p></div>
   <label>Amount<input type="number" min="0.25" max="1000" step="0.25" value={amount} onChange={e=>setAmount(Number(e.target.value))}/></label>
   <label>Unit<select value={unit} onChange={e=>setUnit(e.target.value)}>{['episode','lesson','chapter','activity','minute','hour'].map(u=><option key={u}>{u}</option>)}</select></label>
   <label>Deadline if no meeting<input type="datetime-local" value={due} onChange={e=>setDue(e.target.value)}/></label>
   <button disabled={committing||!(amount>0)} onClick={()=>void commit()}>{committing?'Opening…':'Commit & start →'}</button>
   <small><Link href="/login">Sign in</Link> and enroll in AgroEnglish to save, record and send your work. The activities below are a preview.</small></div>}
  {recovery&&<div className="a02-recovery" role="status"><strong>A newer browser draft is available.</strong><p>Your last cloud save stays intact until you choose to recover it.</p>
   <button onClick={()=>{setAnswers(recovery);setDirty(true);setRecovery(null)}}>Recover browser draft</button> <button className="secondary" onClick={()=>setRecovery(null)}>Keep cloud version</button></div>}
  <div className="a02-workspace"><aside className="a02-steps"><p className="a02-eyebrow">YOUR LEARNING PATH</p>
   {stages.map((name,i)=><button key={name} aria-current={stage===i?'step':undefined} onClick={()=>setStage(i)}><span>{String(i+1).padStart(2,'0')}</span>{name}</button>)}
   <div className="a02-save" aria-live="polite">{attempt?(saveStatus||'Your work stays with this lesson'):'Preview · commit to save'}{editable&&<button className="a02-text-button" onClick={()=>void save(latest.current).catch(e=>setMessage(e.message))}>Save now</button>}</div>
  </aside><section className="a02-stage" aria-label={stages[stage]}>
   <p className="a02-eyebrow">{String(stage+1).padStart(2,'0')} · {stages[stage].toUpperCase()}</p>
   {stage===0&&<><h2>Start with the destination.</h2><p>This is the kind of communication you will create by the end.</p>
    <div className={'a02-model'+(first?' a02-model-farmer':'')}>
     {first&&<div className="a02-farmer" aria-label="João, a coffee farmer">👨🏽‍🌾<small>JOÃO · COFFEE FARMER</small></div>}
     <div><span className="a02-model-label">{first?'MEET JOÃO':'MODEL PERFORMANCE · FICTIONAL PRACTICE CASE'}</span><p className="a02-model-text">{episode.model}</p>
      {first&&<a className="a02-audio-link" href={MODEL_AUDIO} target="_blank" rel="noreferrer">▶ Listen to João · recorded model</a>}</div></div>
    <div className="a02-success"><h3>Your final challenge</h3><p>{episode.task}</p><strong>What your teacher will look for</strong><p>{episode.evidence}</p></div>
    <label>Before studying, try one sentence or note. What can you already say?<textarea rows={2} value={answers.reflection} readOnly={!!attempt&&!editable} onChange={e=>write({reflection:e.target.value})} placeholder="My first thought…"/></label>
   </>}
   {stage===1&&<><h2>Get the words you need.</h2><p>Say each word. Reveal the meaning, then mark how well you remember it.</p><div className="a02-word-grid">
    {episode.words.map((w,i)=><div className="a02-word" key={w.en}><button className="a02-flash" aria-expanded={!!flipped[i]} onClick={()=>setFlipped(f=>({...f,[i]:!f[i]}))}><strong>{w.en}</strong><span>{flipped[i]?w.pt:'Reveal meaning ↻'}</span></button>
     <label className="a02-small-label">My recall<select aria-label={'Recall for '+w.en} disabled={!!attempt&&!editable} value={answers.wordRatings[w.en]||''} onChange={e=>write({wordRatings:{...answers.wordRatings,[w.en]:Number(e.target.value)}})}>
      <option value="">Choose…</option><option value="4">I know it</option><option value="3">I knew it but didn't remember</option><option value="2">I've seen it</option><option value="1">I don't know it</option></select></label></div>)}
    </div><div className="a02-mini-check"><h3>Quick recall check</h3><p>Match the English words to their meanings. These results are practice, separate from teacher assessment.</p>
     {episode.words.slice(0,4).map((w,i)=><label key={w.en}>{w.en}<select value={check[i]||''} onChange={e=>{setCheck(c=>({...c,[i]:e.target.value}));setChecked(false)}}><option value="">Choose a meaning…</option>{[...episode.words.slice(0,4).slice(i),...episode.words.slice(0,i)].map(o=><option key={o.en}>{o.pt}</option>)}</select></label>)}
     <button onClick={()=>setChecked(true)}>Check my recall</button>{checked&&<p role="status">{correct} / {Math.min(4,episode.words.length)} correct. {correct===4?'Now use the words in your own message.':'Reveal the cards, then try again.'}</p>}</div>
   </>}
   {stage===2&&<><h2>Notice how the message works.</h2><p>Read the model again. Find the language that helps you perform the task.</p><div className="a02-language"><p className="a02-eyebrow">LANGUAGE TO USE</p><h3>{episode.resources}</h3></div>
    {first?<div className="a02-chunks">{[['Greet someone','Hello! / Good morning!'],['Say your name',"I'm João. / My name is João."],['Say your role',"I'm a farmer. / I'm an agronomist."],['Say where you work','I work on a coffee farm. / I work at a cooperative.'],['Respond politely','Nice to meet you. / Nice to meet you, too.']].map(([label,example])=><article key={label}><strong>{label}</strong><p>{example}</p></article>)}</div>:
     <div className="a02-chunks">{episode.chunks.map((c,i)=><article key={i}><strong>Useful model language {i+1}</strong><p>{c}</p></article>)}</div>}
    <div className="a02-success"><h3>Make the language yours</h3><p>{first?"Use I am / I'm for your name and role. Use I work on a farm, at a cooperative, or for a company. Keep your sentences short and clear.":'Select two expressions from the model. Keep their useful structure, then change the people, facts or details to fit your own task. Check that the result still means what you intend.'}</p></div>
   </>}
   {stage===3&&<><h2>Move from the model to your own meaning.</h2><p>Use each answer in the final task. You can return to the model whenever you need it.</p>
    <div className="a02-exercise"><label><span>1 · Substitute</span>{first?'Change João → your name, farmer → your role, and Lavras → your workplace. Write 3 sentences.':'Adapt two useful model sentences. Substitute the people, places, values or details for another realistic case.'}<textarea value={answers.practice.substitute} readOnly={!!attempt&&!editable} onChange={e=>practice('substitute',e.target.value)} rows={3}/></label></div>
    <div className="a02-exercise"><label><span>2 · Change</span>{first?"Introduce Ana instead of yourself: Ana is an agronomist. She works at a cooperative. Write her introduction.":episode.level==='A1'?'Make two sentences about a different person or farm. Change the subject and the verb where needed.':'Rewrite two statements for a different situation. Change one fact or condition, and adjust the language so the new meaning is clear.'}<textarea value={answers.practice.change} readOnly={!!attempt&&!editable} onChange={e=>practice('change',e.target.value)} rows={3}/></label></div>
    <div className="a02-exercise"><label><span>3 · Translate into English</span>{episode.translation}<textarea value={answers.practice.translate} readOnly={!!attempt&&!editable} onChange={e=>practice('translate',e.target.value)} rows={3}/></label>
     <details><summary>Compare with one possible answer after trying</summary><p>{episode.translationExample}</p><small>Other translations can be correct if they preserve the meaning.</small></details></div>
    <div className="a02-exercise"><label><span>4 · Create</span>{first?'A visitor has arrived. Write your own greeting, name, role and workplace. Use real or invented details.':episode.task+' Prepare a short original rehearsal. Use your own choices rather than copying the model.'}<textarea value={answers.practice.create} readOnly={!!attempt&&!editable} onChange={e=>practice('create',e.target.value)} rows={4}/></label></div>
   </>}
   {stage===4&&<><h2>Make proof of what you can do.</h2><p>{episode.task}</p><div className="a02-success"><strong>Success criteria</strong><p>{episode.evidence}</p><small>{speaking?'This is a speaking skill. Record or upload your voice; a written plan can help you rehearse.':'This is a writing skill. Your written performance is the evidence.'}</small></div>
    <label>{speaking?'My written plan (optional)':'My final written performance'}<textarea value={answers.proof} readOnly={!editable} onChange={e=>write({proof:e.target.value})} rows={episode.level==='B2'?12:6} placeholder={attempt?'Use your own words. Imagine the real person receiving your message.':'Commit to the episode to create and save your proof.'}/></label>
    {attempt&&<section className="a02-audio"><h3>{speaking?'My spoken performance':'Optional spoken version'}</h3>{editable&&<><div className="a02-actions"><button disabled={uploading||submitting} onClick={()=>recording?recorder.current?.stop():void record()}>{recording?'■ Stop & save recording':'● Record my voice'}</button>
     <label className="a02-upload">Upload audio<input type="file" accept="audio/webm,audio/mp4,audio/mpeg,audio/wav,.mp3,.m4a,.wav,.webm" disabled={uploading||recording} onChange={e=>{const f=e.target.files?.[0];if(f)void upload(f);e.target.value='';}}/></label></div>{recording&&<p role="status">Recording… Finish your performance, then press Stop & save recording.</p>}{uploading&&<p role="status">Saving your audio…</p>}
     {retryAudio&&!uploading&&<button className="secondary" onClick={()=>void upload(retryAudio)}>Retry saving my audio</button>}</>}
     {files.map((f,i)=><div className="a02-proof-file" key={f.id}><button className="a02-text-button" onClick={()=>void listen(f)}>▶ Listen to performance {i+1}</button>{playback[f.id]&&<audio controls src={playback[f.id]} aria-label={'Your performance '+(i+1)}/>}</div>)}
    </section>}
    {editable?<><p>{rehearsalReady?'✓ Four rehearsal activities ready':'Complete the four rehearsal activities before submitting.'} · {proofReady?'✓ Final evidence ready':speaking?'Add your spoken performance.':'Write your final performance.'}</p>
     <button className="a02-primary" disabled={!rehearsalReady||!proofReady||recording||uploading||submitting} onClick={()=>void submit()}>{submitting?'Sending…':status==='revision_requested'?'Send my stronger attempt →':'Send proof for teacher feedback →'}</button></>:<p className="a02-hint">{attempt?'Your submitted evidence is retained. Your teacher can request a revision.':'Commit to this episode to submit your performance.'}</p>}
   </>}
   {stage===5&&<><h2>{lastReview?'Use feedback to move forward.':'Your next step is feedback.'}</h2>
    {!reviews.length&&<p>{status==='submitted'||status==='claimed'?'Your teacher will review your proof and tell you what worked and what to improve.':'Create your proof and submit it. Your teacher’s feedback will appear here.'}</p>}
    {reviews.map(r=><article className="a02-review" key={r.id}><p className="a02-eyebrow">{dateLabel(r.created_at)} · {r.outcome.replaceAll('_',' ')}</p><p>{r.feedback}</p><div className="a02-rubric">{Object.entries(r.rubric_scores||{}).map(([key,value])=><span key={key}>{key}: <strong>{value} / 4</strong></span>)}</div></article>)}
    {status==='revision_requested'&&<div className="a02-success"><h3>A stronger second attempt</h3><p>Choose one improvement from your teacher's feedback. Rehearse it, then record or write the task again in a different real situation. Your previous submission remains in the evidence history.</p><button onClick={()=>setStage(4)}>Revise my proof →</button></div>}
    {status==='finalized'&&<div className="a02-success"><h3>{lastReview&&['task','communication','language'].every(k=>(lastReview.rubric_scores?.[k]??-1)>=3)?'Skill demonstrated ✓':'Reviewed · keep developing this skill'}</h3><p>A score of at least 3 in every criterion, supported by your proof, demonstrates this checklist skill. A CEFR level requires a broader assessment.</p><Link href={'/courses/agroenglish/series/'+episode.level.toLowerCase()}>Choose your next challenge →</Link></div>}
   </>}
   {message&&<p className="a02-message" role="status">{message}</p>}
   <div className="a02-stage-footer"><button className="a02-quiet" disabled={stage===0} onClick={()=>setStage(s=>s-1)}>← Back</button><small>{stage+1} / {stages.length}</small><button disabled={stage===5} onClick={()=>setStage(s=>s+1)}>Next →</button></div>
  </section></div>
  {message&&!attempt&&<p className="a02-message" role="alert">{message}</p>}
  <p className="a02-footnote">Teaching examples use fictional people and practice data. Study time, reviewed work and demonstrated skills are recorded separately.</p>
 </div>;
}
