'use client';
import {useState} from 'react';
import {browserClient} from '@/lib/supabase/browser';
type Attempt={id:string;student_id:string;status:string;claimed_by:string|null;episode_id:string};
type Response={id:string;activity_key:string;field_key:string;response:Record<string,unknown>};
type FileRow={id:string;activity_key:string;storage_path:string;mime_type:string};
type Criterion={key:string;label:string;scale:number[]};
const activityOrder=['reading','vocabulary','substitution','word_families','first_production','transfer','feedback'];
function responseLabel(field:string){
 return field==='28'?'Flashcard familiarity (28 words)':field==='first-final'||field==='transfer-final'?'Final written performance':field.replaceAll('-',' ').replaceAll('_',' ');
}
function responseDisplay(row:Response){
 const raw=Object.prototype.hasOwnProperty.call(row.response,'value')?row.response.value:row.response.text;
 if(Array.isArray(raw)&&row.field_key==='28'){
  const classified=raw.filter(x=>x!==null&&x!==undefined).length;
  return classified+'/28 vocabulary cards classified; '+raw.filter(x=>x===0).length+' marked confident';
 }
 if(typeof raw==='boolean')return raw?'Yes':'No';
 if(typeof raw==='string'||typeof raw==='number')return String(raw);
 return JSON.stringify(raw,null,2);
}

export function TeacherReview({attempt,responses,files,currentTeacher,criteria,studentName,episodeTitle}:{attempt:Attempt;responses:Response[];files:FileRow[];currentTeacher:string;criteria:Criterion[];studentName:string;episodeTitle:string}){
 const [status,setStatus]=useState(attempt.status),[claimedBy,setClaimedBy]=useState(attempt.claimed_by);
 const [feedback,setFeedback]=useState(''),[scores,setScores]=useState<Record<string,number>>({}),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 async function claim(){
  setBusy(true);setMessage('');
  const {error}=await browserClient().rpc('claim_lesson_attempt',{p_attempt:attempt.id});
  if(error)setMessage(error.message);else{setStatus('claimed');setClaimedBy(currentTeacher);setMessage('Claimed. You can now review this submission.')}
  setBusy(false);
 }
 async function review(outcome:'finalized'|'revision_requested'){
  setBusy(true);setMessage('');
  const {error}=await browserClient().rpc('review_lesson_attempt',{p_attempt:attempt.id,p_outcome:outcome,p_feedback:feedback,p_scores:scores});
  if(error)setMessage(error.message);else{setStatus(outcome);setMessage('Teacher review saved: '+outcome.replaceAll('_',' '))}
  setBusy(false);
 }
 async function open(path:string){
  const {data,error}=await browserClient().storage.from('lesson-submissions').createSignedUrl(path,90);
  if(error)setMessage(error.message);else window.open(data.signedUrl,'_blank','noopener,noreferrer');
 }
 return <section className="panel"><a href="/teacher/reviews">← Review queue</a><h1>{episodeTitle} · Review</h1><p><strong>Student:</strong> {studentName}</p><p><span className="tag">{status.replaceAll('_',' ')}</span></p>
  <h2>Evidence and submissions</h2>{responses.length===0&&<p>No written evidence saved.</p>}
  <div className="responses">{responses.slice().sort((a,b)=>activityOrder.indexOf(a.activity_key)-activityOrder.indexOf(b.activity_key)||a.field_key.localeCompare(b.field_key)).map(r=><section className="response" key={r.id}><strong>{r.activity_key.replaceAll('_',' ')} · {responseLabel(r.field_key)}</strong><p style={{whiteSpace:'pre-wrap'}}>{responseDisplay(r)}</p></section>)}</div>
  <h2>Audio and attached evidence</h2>{!files.length&&<p>No files submitted.</p>}{files.map(f=><p key={f.id}><button className="secondary" onClick={()=>open(f.storage_path)}>Open {f.activity_key.replaceAll('_',' ')} · {f.mime_type}</button></p>)}
  {status==='submitted'&&<button className="gold" disabled={busy} onClick={claim}>Claim submission</button>}
  {status==='claimed'&&claimedBy===currentTeacher&&<div className="panel"><h2>Assess the performance</h2><p>Evaluate the observable language performance. Give specific, actionable feedback.</p>
  {criteria.map(c=><label key={c.key} className="field">{c.label}<select value={scores[c.key]??''} onChange={e=>setScores(v=>({...v,[c.key]:Number(e.target.value)}))}><option value="">Not assessed</option>{(c.scale||[1,2,3,4]).map(n=><option value={n} key={n}>{n}</option>)}</select></label>)}
  <label>Teacher feedback<textarea rows={6} value={feedback} onChange={e=>setFeedback(e.target.value)} placeholder="What worked well? What should the student improve? What is the next communicative challenge?"/></label>
  <p className="row"><button className="secondary" disabled={busy||!feedback.trim()} onClick={()=>review('revision_requested')}>Request revision</button><button className="gold" disabled={busy||!feedback.trim()||criteria.some(c=>!scores[c.key])} onClick={()=>review('finalized')}>Finalize lesson</button></p></div>}
  {message&&<p role="status" className="notice">{message}</p>}
 </section>;
}
