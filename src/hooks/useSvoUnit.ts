'use client';
import {useEffect,useRef,useState} from 'react';
import {browserClient} from '@/lib/supabase/browser';
export type SvoAttempt={id:string;student_id:string;assignment_id:string;status:string};
export type SvoKpi={weeklyTarget:number;selectedThisWeek:number;masteredThisWeek:number;learningTotal:number;masteredTotal:number};
export type SvoWordRow={word_key:string;status:'learning'|'mastered';correct_streak:number;reviews:number};
export function speakSvo(value:string,rate=.88):boolean{
 if(typeof window==='undefined'||!('speechSynthesis' in window))return false;
 window.speechSynthesis.cancel();
 const u=new SpeechSynthesisUtterance(value);
 u.lang='en-US';u.rate=rate;u.pitch=1;
 const voices=window.speechSynthesis.getVoices();
 const v=voices.find(x=>x.lang.toLowerCase().startsWith('en')&&/samantha|aria|zira|female/i.test(x.name))
  ||voices.find(x=>x.lang.toLowerCase().startsWith('en'));
 if(v)u.voice=v;
 window.speechSynthesis.speak(u);return true;
}
export function useSvoUnit<T extends object>(opts:{
 attempt:SvoAttempt|null;initial:T;code:string;activityKey:'svo_course'|'svo_review';
 missing:(answers:T)=>string[];
}){
 const {attempt,initial,code,activityKey,missing}=opts;
 const [value,setValue]=useState<T>(initial);
 const ref=useRef(value),queue=useRef<Promise<boolean>>(Promise.resolve(true));
 const [busy,setBusy]=useState(false),[saving,setSaving]=useState(false),[saved,setSaved]=useState(true);
 const [error,setError]=useState(''),[notice,setNotice]=useState('');
 const [submitted,setSubmitted]=useState(['submitted','claimed','finalized'].includes(attempt?.status||''));
 const isLive=Boolean(attempt);
 const editable=!attempt||(['draft','revision_requested'].includes(attempt.status)&&!submitted);
 const missingItems=missing(value);
 const ready=missingItems.length===0;
 const update=(recipe:(prev:T)=>T)=>{
  if(!editable)return;
  const next=recipe(ref.current);
  ref.current=next;setValue(next);setSaved(false);setError('');setNotice('');
 };
 const navigate=(step:number,max:number)=>{
  if(step<0||step>=max)return;
  if(editable)update(v=>({...v,step,visited:[...new Set([...(Array.isArray((v as {visited?:number[]}).visited)?(v as {visited:number[]}).visited:[]),step])]}));
  else {const next={...ref.current,step};ref.current=next;setValue(next);}
  if(typeof window!=='undefined'&&'speechSynthesis' in window)window.speechSynthesis.cancel();
 };
 function persist(snapshot:T){
  if(!attempt||!editable)return Promise.resolve(true);
  const run=async()=>{
   setSaving(true);
   const {error:e}=await browserClient().from('lesson_responses').upsert({
    attempt_id:attempt.id,activity_key:activityKey,field_key:'portfolio',
    response:{value:{...snapshot,code}}
   },{onConflict:'attempt_id,activity_key,field_key'});
   setSaving(false);
   if(e){setError('Unable to save: '+e.message);return false;}
   if(ref.current===snapshot)setSaved(true);
   return true;
  };
  const result=queue.current.then(run,run);
  queue.current=result.then(()=>true,()=>true);
  return result;
 }
 useEffect(()=>{
  if(!attempt||!editable||saved)return;
  const timer=window.setTimeout(()=>{void persist(ref.current)},900);
  return()=>window.clearTimeout(timer);
 },[value,editable,attempt?.id,saved]);
 useEffect(()=>{
  return()=>{if(typeof window!=='undefined'&&'speechSynthesis'in window)window.speechSynthesis.cancel()};
 },[]);
 const submit=async()=>{
  if(!attempt||!editable||!ready||busy)return;
  setBusy(true);setError('');setNotice('');
  const snapshot=ref.current;
  const ok=await persist(snapshot);
  await queue.current;
  if(!ok){setBusy(false);return;}
  if(!window.confirm('Submit this SVO unit to your teacher?')){setBusy(false);return;}
  const {error:e}=await browserClient().rpc('submit_lesson_attempt',{p_attempt:attempt.id});
  if(e)setError('Submission was rejected: '+e.message);
  else{setSubmitted(true);setSaved(true);setNotice('Submitted to your teacher. Your responses are now saved for review.');}
  setBusy(false);
 };
 const play=(line:string,rate=.88)=>{
  if(!speakSvo(line,rate))setError('Text-to-speech audio is not supported in this browser.');
 };
 return {value,update,navigate,isLive,editable,missingItems,ready,saved,saving,submit,submitted,busy,
  error,notice,setError,setNotice,play};
}
