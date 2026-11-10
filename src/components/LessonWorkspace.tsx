'use client';
import {useEffect,useRef,useState} from 'react';
import {browserClient} from '@/lib/supabase/browser';
import {StudentSubmission} from '@/components/StudentSubmission';
import {IntegratedAgricultureLesson} from '@/components/IntegratedAgricultureLesson';
type Attempt={id:string;assignment_id:string;student_id:string;episode_id:string;status:string};
type Activity={activity_key:string;activity_type:string;position:number;config:Record<string,unknown>};
type Episode={title:string;code:string;level:string;description?:string;lesson_body?:string};

export function LessonWorkspace({assignment,studentId,episode,initialAttempt,activities,responses,files,reviews}:{assignment:{id:string;episode_id:string};studentId:string;episode:Episode|null;initialAttempt:Attempt|null;activities:Activity[];responses:any[];files:any[];reviews:any[]}){
 const [attempt,setAttempt]=useState(initialAttempt);
 const [loading,setLoading]=useState(false);
 const [error,setError]=useState('');
 const started=useRef(false);
 async function start(){
  setLoading(true);setError('');
  const {data,error:creationError}=await browserClient().from('lesson_attempts').insert({
   assignment_id:assignment.id,student_id:studentId,episode_id:assignment.episode_id,status:'draft'
  }).select('id,assignment_id,student_id,episode_id,status').single();
  if(creationError){setError(creationError.message);setLoading(false);return;}
  setAttempt(data);setLoading(false);
 }
 useEffect(()=>{
  if(initialAttempt||started.current)return;
  started.current=true;
  void start();
 },[initialAttempt]);
 if(attempt&&episode?.code==='AGRO-A1-01')return <IntegratedAgricultureLesson attempt={attempt} initialResponses={responses} initialFiles={files} reviews={reviews}/>;
 if(attempt)return <StudentSubmission attempt={attempt} episode={episode} activities={activities} initialResponses={responses} initialFiles={files} reviews={reviews}/>;
 return <div className="unified-lesson">
  <header className="unified-hero"><p>STARK LEARNING · {episode?.code||'LESSON'}</p><h1>{episode?.title||'Your lesson'}</h1><p>Your answers and teacher feedback will stay in this lesson.</p></header>
  <div className="unified-inner"><section className="unified-panel"><h2>{error?'Unable to open your lesson':'Preparing your lesson'}</h2>
   {error?<><p className="unified-message unified-error">{error}</p><button type="button" className="unified-primary" disabled={loading} onClick={()=>void start()}>Try again</button></>:<p>Loading the lesson workspace…</p>}
  </section></div>
 </div>;
}
