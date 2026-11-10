'use client';
import {useState} from 'react';
import {browserClient} from '@/lib/supabase/browser';
type Attempt={id:string;student_id:string;episode_id:string;status:string;assignment_id:string};
type ResponseRow={activity_key:string;field_key:string;response:Record<string,unknown>};
type FileRow={id:string;activity_key:string;storage_path:string;mime_type:string;bytes:number};
type ReviewRow={id:string;feedback:string;outcome:string;created_at:string;rubric_scores:Record<string,number>};
type Activity={activity_key:string;activity_type:string;config:Record<string,unknown>;position:number};
const defaults=[{activity_key:'reading',activity_type:'reading',position:1},{activity_key:'vocabulary',activity_type:'flashcards',position:2},{activity_key:'substitution',activity_type:'guided_practice',position:3},{activity_key:'word_families',activity_type:'multiple_choice',position:4},{activity_key:'first_production',activity_type:'scaffolded_production',position:5},{activity_key:'transfer',activity_type:'scaffolded_transfer',position:6},{activity_key:'feedback',activity_type:'self_assessment',position:7}];
export function StudentSubmission({attempt,episode,activities,initialResponses,initialFiles,reviews}:{attempt:Attempt;episode:{title:string;code:string;level:string}|null;activities:Activity[];initialResponses:ResponseRow[];initialFiles:FileRow[];reviews:ReviewRow[]}){
 const [responses,setResponses]=useState(initialResponses);
 const [files,setFiles]=useState(initialFiles);
 const [status,setStatus]=useState(attempt.status),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 const [drafts,setDrafts]=useState<Record<string,string>>(()=>Object.fromEntries(initialResponses.map(x=>[x.activity_key+':'+x.field_key,typeof x.response?.text==='string'?x.response.text:''])));
 const editable=status==='draft'||status==='revision_requested';
 const list=activities.length?activities:defaults.map(a=>({...a,config:{}}));
 const [saved,setSaved]=useState<Record<string,boolean>>({});
 async function save(activity_key:string,field_key:string){
  const key=activity_key+':'+field_key;const value=drafts[key]||'';
  setBusy(true);setMessage('');
  const response={text:value};
  const {error}=await browserClient().from('lesson_responses').upsert({attempt_id:attempt.id,activity_key,field_key,response},{onConflict:'attempt_id,activity_key,field_key'});
  if(error)setMessage(error.message);else {setResponses(old=>[...old.filter(x=>x.activity_key!==activity_key||x.field_key!==field_key),{activity_key,field_key,response}]);setSaved(v=>({...v,[key]:true}));setMessage('Response saved');}
  setBusy(false);
 }
 async function upload(activity:string,file:File){
  if(!editable)return;setBusy(true);setMessage('');
  try{
   const type=file.type||'application/octet-stream';
   if(!['audio/webm','audio/mp4','audio/mpeg','audio/wav','application/pdf','text/plain'].includes(type))throw Error('Use WebM, MP4, MP3, WAV, PDF or TXT');
   if(file.size>52428800)throw Error('Maximum file size is 50 MB');
   const path=`${attempt.student_id}/${attempt.id}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g,'_')}`;
   const sb=browserClient();const {error:up}=await sb.storage.from('lesson-submissions').upload(path,file,{contentType:type,upsert:false});
   if(up)throw up;
   const {data,error}=await sb.from('lesson_submission_files').insert({attempt_id:attempt.id,activity_key:activity,storage_path:path,mime_type:type,bytes:file.size}).select().single();
   if(error)throw error;
   setFiles(old=>[...old,data]);setMessage('File uploaded');
  }catch(e){setMessage(e instanceof Error?e.message:'Upload failed')}finally{setBusy(false)}
 }
 async function submit(){
  if(!confirm('Submit all saved responses and files for teacher feedback?'))return;
  setBusy(true);setMessage('');
  const {error}=await browserClient().rpc('submit_lesson_attempt',{p_attempt:attempt.id});
  if(error)setMessage(error.message);else {setStatus('submitted');setMessage('Lesson submitted for teacher review');}
  setBusy(false);
 }
 async function download(path:string){
  const {data,error}=await browserClient().storage.from('lesson-submissions').createSignedUrl(path,90);
  if(error)setMessage(error.message);else window.open(data.signedUrl,'_blank','noopener,noreferrer');
 }
 const recorded=responses.length+files.length;
 return <section className="panel">
  <p className="eyebrow">{episode?.code||'Lesson'} · {episode?.level||''}</p><h1>{episode?.title||'Lesson'} · Submission</h1>
  <p><span className="tag">{status.replaceAll('_',' ')}</span> · {recorded} saved evidence items</p>
  <p className="notice">Complete the learning activities first. Save the relevant text and recordings here, then submit everything together. Fields entered in the separate original lesson are not yet synchronized automatically.</p>
  {episode?.code==='AGRO-A1-01'&&<p><a className="button secondary" href="https://agroenglish-frames-preview-lw8au8gvl-theomichigan-2676.vercel.app/" target="_blank" rel="noopener noreferrer">Open approved Agriculture 101 lesson</a></p>}
  {list.map(item=>{const a=item.activity_key;const key=a+':main_text';const existing=responses.filter(r=>r.activity_key===a);
   return <section key={a} className="panel" style={{margin:'14px 0'}}>
    <p className="eyebrow">Activity {item.position} · {item.activity_type.replaceAll('_',' ')}</p><h2>{a.replaceAll('_',' ')}</h2>
    {editable?<><label htmlFor={key}>Written evidence / answer
      <textarea id={key} rows={a==='first_production'||a==='transfer'?7:4} value={drafts[key]||''} onChange={e=>{setDrafts(d=>({...d,[key]:e.target.value}));setSaved(s=>({...s,[key]:false}))}} placeholder="Your answer, reflection or final text"/>
     </label><div className="row"><button disabled={busy||saved[key]} type="button" onClick={()=>save(a,'main_text')}>{saved[key]?'Saved ✓':'Save response'}</button><label style={{flex:1,fontWeight:400}}>Attach audio or file<input aria-label={'Attach file for '+a} style={{width:'100%'}} type="file" accept="audio/webm,audio/mp4,audio/mpeg,audio/wav,.mp3,.pdf,.txt" disabled={busy} onChange={e=>{const f=e.target.files?.[0];if(f)void upload(a,f)}}/></label></div></>:null}
    {!editable&&existing.map((r,i)=><div className="response" key={i}><strong>{r.field_key.replaceAll('_',' ')}</strong><p style={{whiteSpace:'pre-wrap'}}>{typeof r.response.text==='string'?r.response.text:JSON.stringify(r.response)}</p></div>)}
    {files.filter(f=>f.activity_key===a).map(f=><p key={f.id}><button type="button" className="secondary" onClick={()=>download(f.storage_path)}>Open {f.storage_path.split('/').at(-1)}</button></p>)}
   </section>;
  })}
  {reviews.map(r=><section className="panel" key={r.id}><h3>Teacher feedback · {r.outcome.replaceAll('_',' ')}</h3><p style={{whiteSpace:'pre-wrap'}}>{r.feedback}</p><p className="muted">{new Date(r.created_at).toLocaleString()}</p></section>)}
  {editable&&<section className="panel"><h2>Final submission</h2><p>Check that your writing is saved and audio has finished uploading before submitting.</p><button className="gold" disabled={busy||responses.length===0||Object.values(saved).some(x=>x===false)} onClick={submit}>Submit lesson to teacher</button></section>}
  {message&&<p role="status" className="notice">{message}</p>}
 </section>
}
