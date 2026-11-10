'use client';

import {useCallback,useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {browserClient} from '@/lib/supabase/browser';

type Attempt = {id:string;assignment_id:string;student_id:string;episode_id:string;status:string};
type ResponseRow = {activity_key:string;field_key:string;response:Record<string,unknown>};
type FileRow = {id:string;activity_key:string;storage_path:string;mime_type:string;bytes:number};
type ReviewRow = {id:string;feedback:string;outcome:string;created_at:string;rubric_scores:Record<string,number>};
type Fields = Record<string,unknown>;
type BridgeSync={type:'STARK_LESSON_SYNC';attemptId:string;fields:Fields};
type BridgeAudio={type:'STARK_LESSON_AUDIO';attemptId:string;activity:string;blob:Blob;mimeType:string};

function activityOf(key:string){
 if(key==='28')return 'vocabulary';
 if(/^(sub|own)\d+$/.test(key))return 'substitution';
 if(/^f\d+$/.test(key))return 'word_families';
 if(key.startsWith('first-'))return 'first_production';
 if(key.startsWith('transfer-'))return 'transfer';
 if(key.startsWith('reflect'))return 'feedback';
 return 'reading';
}
function stringValue(x:unknown){return typeof x==='string'?x:''}
function mimeFor(type:string){
 const mime=type.split(';')[0].trim().toLowerCase();
 return mime==='audio/mp4'?'audio/mp4':mime==='audio/mpeg'?'audio/mpeg':mime==='audio/wav'?'audio/wav':'audio/webm';
}
export function IntegratedAgricultureLesson({attempt,initialResponses,initialFiles,reviews}:{attempt:Attempt;initialResponses:ResponseRow[];initialFiles:FileRow[];reviews:ReviewRow[]}){
 const frame=useRef<HTMLIFrameElement|null>(null);
 const [ready,setReady]=useState(false);
 const [status,setStatus]=useState(attempt.status);
 const [files,setFiles]=useState(initialFiles);
 const [uploading,setUploading]=useState(0);
 const [saving,setSaving]=useState(false);
 const [submitting,setSubmitting]=useState(false);
 const [message,setMessage]=useState('');
 const [error,setError]=useState('');
 const [savedCount,setSavedCount]=useState(initialResponses.length);
 const savedSnapshot=useRef('');
 const saveChain=useRef<Promise<boolean>>(Promise.resolve(true));
 const uploadFail=useRef<Map<string,Blob>>(new Map());
 const lastSaveFailed=useRef(false);
 const [failedAudio,setFailedAudio]=useState<string[]>([]);
 const editable=status==='draft'||status==='revision_requested';
 const prefix=attempt.id+':ag101-';

 useEffect(()=>{
  // Keep local drafts isolated by attempt ID, and restore canonical cloud records
  // before loading the original lesson in a same-origin frame.
  for(let i=localStorage.length-1;i>=0;i--){
   const key=localStorage.key(i);
   if(key?.startsWith(prefix))localStorage.removeItem(key);
  }
  for(const row of initialResponses){
   const value=Object.prototype.hasOwnProperty.call(row.response,'value')?row.response.value:row.response.text;
   localStorage.setItem(prefix+row.field_key,JSON.stringify(value));
  }
  setReady(true);
 },[attempt.id]);

 const readFields=useCallback(()=>{
  const fields:Fields={};
  for(let i=0;i<localStorage.length;i++){
   const key=localStorage.key(i);
   if(!key?.startsWith(prefix))continue;
   const raw=localStorage.getItem(key);
   try{fields[key.slice(prefix.length)]=JSON.parse(raw||'null')}
   catch{fields[key.slice(prefix.length)]=raw}
  }
  return fields;
 },[prefix]);

 const persist=useCallback((fields:Fields,force=false)=>{
  if(!editable)return saveChain.current;
  const serial=JSON.stringify(fields);
  if(!force&&serial===savedSnapshot.current)return saveChain.current;
  savedSnapshot.current=serial;
  const rows=Object.entries(fields).map(([field_key,value])=>({
   attempt_id:attempt.id,activity_key:activityOf(field_key),field_key,
   response:{value,source:'agriculture101',schema_version:1}
  }));
  if(!rows.length)return saveChain.current;
  saveChain.current=saveChain.current.then(async()=>{
   setSaving(true);
   const {error:saveError}=await browserClient().from('lesson_responses')
    .upsert(rows,{onConflict:'attempt_id,activity_key,field_key'});
   if(saveError){
    lastSaveFailed.current=true;
    setError('Answers could not be saved: '+saveError.message);
    setSaving(false);return false;
   }
   lastSaveFailed.current=false;
   setSavedCount(rows.length);
   setSaving(false);
   return true;
  }).catch((cause)=>{
   lastSaveFailed.current=true;
   setError(cause instanceof Error?cause.message:'Could not save your answers');
   setSaving(false);return false;
  });
  return saveChain.current;
 },[attempt.id,editable]);

 async function uploadAudio(activity:string,blob:Blob){
  if(!editable)return;
  setUploading(n=>n+1);setError('');
  try{
   const mime=mimeFor(blob.type);
   const extension=mime==='audio/mp4'?'m4a':mime==='audio/wav'?'wav':mime==='audio/mpeg'?'mp3':'webm';
   const path=attempt.student_id+'/'+attempt.id+'/'+crypto.randomUUID()+'-'+activity+'.'+extension;
   const client=browserClient();
   const {error:storageError}=await client.storage.from('lesson-submissions').upload(path,blob,{contentType:mime,upsert:false});
   if(storageError)throw storageError;
   const {data,error:dbError}=await client.from('lesson_submission_files')
    .insert({attempt_id:attempt.id,activity_key:activity==='transfer'?'transfer':'first_production',storage_path:path,mime_type:mime,bytes:blob.size})
    .select('id,activity_key,storage_path,mime_type,bytes').single();
   if(dbError)throw dbError;
   setFiles(items=>[...items,data as FileRow]);
   uploadFail.current.delete(activity);
   setFailedAudio([...uploadFail.current.keys()]);
   setMessage('Recording saved to your lesson.');
  }catch(cause){
   uploadFail.current.set(activity,blob);
   setFailedAudio([...uploadFail.current.keys()]);
   setError('Recording upload failed. Retry before submitting: '+(cause instanceof Error?cause.message:String(cause)));
  }finally{setUploading(n=>Math.max(0,n-1))}
 }

 useEffect(()=>{
  function receive(event:MessageEvent){
   if(event.origin!==window.location.origin||event.source!==frame.current?.contentWindow)return;
   const data=event.data as {type:string;attemptId:string;fields?:Fields;blob?:Blob;activity?:string};
   if(!data||data.attemptId!==attempt.id)return;
   if(data.type==='STARK_LESSON_SYNC'){
    if(editable&&data.fields&&typeof data.fields==='object')void persist(data.fields);
   }else if(data.type==='STARK_LESSON_AUDIO'){
    if(editable&&data.blob instanceof Blob&&data.blob.size>0)
     void uploadAudio(data.activity||'first',data.blob);
   }else if(data.type==='STARK_LESSON_AUDIO_ERROR'){
    setError('Could not capture your recording. Please record it again.');
   }
  }
  window.addEventListener('message',receive);
  return()=>window.removeEventListener('message',receive);
 },[attempt.id,editable,persist]);

 async function submit(){
  if(!editable||submitting||uploading>0)return;
  setError('');setMessage('');
  if(uploadFail.current.size){
   setError('Retry failed audio uploads before submitting.');
   return;
  }
  const latest=readFields();
  if(!stringValue(latest['first-final']).trim()||!stringValue(latest['transfer-final']).trim()){
   setError('Complete the final written response in First Production and Transfer before submitting.');
   return;
  }
  if(!window.confirm('Submit your Agriculture 101 activities, writing and recordings for teacher feedback?'))return;
  setSubmitting(true);
  const ok=await persist(latest,true);
  if(!ok||lastSaveFailed.current){setSubmitting(false);return}
  const {error:submitError}=await browserClient().rpc('submit_lesson_attempt',{p_attempt:attempt.id});
  if(submitError)setError(submitError.message);
  else{setStatus('submitted');setMessage('Lesson submitted successfully. Your teacher will review the report and recordings.')}
  setSubmitting(false);
 }
 return <div className="agro-integrated">
  <div className="agro-integrated-head">
   <Link href="/dashboard" aria-label="Return to dashboard">← My learning</Link>
   <strong>🌱 Agriculture 101</strong>
   <span aria-live="polite">{saving?'Saving answers…':uploading?'Uploading audio…':status==='finalized'?'Reviewed':status==='submitted'||status==='claimed'?'Submitted':savedCount?'Answers saved':'Autosave on'}</span>
  </div>
  <div className="agro-integrated-stage">
   {ready?<iframe title="Agriculture 101 — interactive activities" ref={frame} src={'/lessons/agriculture101.html?attempt='+encodeURIComponent(attempt.id)} className="agro-integrated-frame" />:<div className="agro-integrated-loading">Opening your lesson…</div>}
  </div>
  {reviews.length>0&&<section className="agro-integrated-feedback" aria-label="Teacher feedback">
   <h2>Teacher feedback</h2>
   {reviews.map(review=><article key={review.id}><strong>{review.outcome.replaceAll('_',' ')}</strong><p>{review.feedback}</p></article>)}
  </section>}
  <div className="agro-integrated-toolbar">
   <div className="agro-integrated-meta">
    <strong>{status==='finalized'?'Lesson finalized':status==='submitted'||status==='claimed'?'Awaiting teacher review':'Your lesson saves as you work'}</strong>
    <span>{savedCount} responses · {files.length} recording(s) or attachment(s){uploading?' · Uploading…':''}</span>
   </div>
   {failedAudio.length>0&&<button type="button" className="agro-integrated-retry" disabled={uploading>0||submitting} onClick={()=>{failedAudio.forEach(k=>{const b=uploadFail.current.get(k);if(b)void uploadAudio(k,b)})}}>Retry audio upload</button>}
   {editable&&<button type="button" className="agro-integrated-submit" disabled={!ready||saving||submitting||uploading>0} onClick={()=>void submit()}>{submitting?'Submitting…':'Submit lesson →'}</button>}
   {(status==='submitted'||status==='claimed'||status==='finalized')&&<span className="agro-integrated-complete">{status==='finalized'?'✓ Finalized':'✓ Sent to teacher'}</span>}
  </div>
  {(error||message)&&<div className={error?'agro-integrated-alert error':'agro-integrated-alert'} role="status">{error||message}</div>}
 </div>;
}
