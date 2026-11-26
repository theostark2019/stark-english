import 'server-only';
import type {SupabaseClient} from '@supabase/supabase-js';
import type {AgroProgress} from './agro02';

export async function getAgro02Progress(sb:SupabaseClient,studentId:string):Promise<AgroProgress[]>{
 const {data:episodes,error:epError}=await sb.from('episodes').select('id,code').like('code','AGRO02-%');
 if(epError)throw epError;
 if(!episodes?.length)return [];
 const {data:assignments,error:asError}=await sb.from('lesson_assignments').select('id,episode_id,due_at')
  .eq('student_id',studentId).in('episode_id',episodes.map(e=>e.id));
 if(asError)throw asError;
 if(!assignments?.length)return [];
 const ids=assignments.map(a=>a.id);
 const [{data:attempts,error:atError},{data:sessions,error:seError}]=await Promise.all([
  sb.from('lesson_attempts').select('id,assignment_id,status,created_at').eq('student_id',studentId).in('assignment_id',ids).order('created_at',{ascending:false}),
  sb.from('stark02_work_sessions').select('assignment_id,seconds').eq('student_id',studentId).in('assignment_id',ids)
 ]);
 if(atError||seError)throw atError||seError;
 const {data:reviews,error:reError}=attempts?.length?await sb.from('lesson_reviews').select('attempt_id,rubric_scores,created_at,outcome')
  .in('attempt_id',attempts.map(a=>a.id)).eq('outcome','finalized').order('created_at',{ascending:false}):{data:[],error:null};
 if(reError)throw reError;
 const codes=new Map(episodes.map(e=>[e.id,e.code]));
 return assignments.map(a=>{
  const attempt=attempts?.find(t=>t.assignment_id===a.id);
  const review=reviews?.find(r=>r.attempt_id===attempt?.id);
  const scores=review?.rubric_scores as Record<string,unknown>|undefined;
  const values=['task','communication','language'].map(k=>scores?.[k]);
  const valid=values.every(v=>typeof v==='number'&&Number.isInteger(v)&&v>=0&&v<=4);
  const score=valid?Math.min(...values as number[]):null;
  return {code:codes.get(a.episode_id)!,assignmentId:a.id,attemptId:attempt?.id||null,
   status:attempt?.status||'not_started',dueAt:a.due_at,score,
   verified:attempt?.status==='finalized'&&score!==null&&score>=3,
   seconds:(sessions||[]).filter(s=>s.assignment_id===a.id).reduce((n,s)=>n+s.seconds,0)};
 });
}
