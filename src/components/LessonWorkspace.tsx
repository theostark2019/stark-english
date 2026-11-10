'use client';
import {useState} from 'react';
import {browserClient} from '@/lib/supabase/browser';
import {StudentSubmission} from '@/components/StudentSubmission';
type Attempt={id:string;assignment_id:string;student_id:string;episode_id:string;status:string};
type Activity={activity_key:string;activity_type:string;position:number;config:Record<string,unknown>};
export function LessonWorkspace({assignment,studentId,episode,initialAttempt,activities,responses,files,reviews}:{assignment:{id:string;episode_id:string};studentId:string;episode:{title:string;code:string;level:string}|null;initialAttempt:Attempt|null;activities:Activity[];responses:any[];files:any[];reviews:any[]}){
 const [attempt,setAttempt]=useState(initialAttempt),[loading,setLoading]=useState(false),[error,setError]=useState('');
 async function start(){
  setLoading(true);
  const {data,error}=await browserClient().from('lesson_attempts').insert({assignment_id:assignment.id,student_id:studentId,episode_id:assignment.episode_id,status:'draft'}).select('id,assignment_id,student_id,episode_id,status').single();
  if(error){setError(error.message);setLoading(false);return;}
  setAttempt(data);setLoading(false);
 }
 if(attempt)return <StudentSubmission attempt={attempt} episode={episode} activities={activities} initialResponses={responses} initialFiles={files} reviews={reviews}/>;
 return <section className="panel"><p className="eyebrow">Assigned lesson</p><h1>{episode?.title||'Start lesson'}</h1><p>Your answers and recordings will be stored in your private submission record.</p><button disabled={loading} onClick={start}>{loading?'Starting…':'Start my lesson'}</button>{error&&<p className="error" role="alert">{error}</p>}</section>
}
