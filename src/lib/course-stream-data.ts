import 'server-only';
import type {SupabaseClient} from '@supabase/supabase-js';
import type {CoursePreview,PortalSlug} from '@/lib/course-portals';

export type StreamAssignment={
 id:string;episodeId:string;code:string;title:string;series:string;level:string;
 minutes:number;seriesId:string;status:string;dueAt:string|null;isCompleted:boolean;
};
export type StreamLearning={
 enrolled:boolean;hours:number;assigned:number;completed:number;completionRate:number|null;
 effectiveness:number|null;reviewCount:number;activeDays30:number|null;
 assignments:StreamAssignment[];finished:StreamAssignment[];
 seriesIds:Record<string,string>;nextGoal:string|null;studentFirstName:string|null;
};
type CatalogRow={
 series_id:string;series_name:string;episode_id:string;episode_code:string;
 episode_title:string;episode_level:string;episode_minutes:number;episode_status:string;
};
type DBRecord={id:string;episode_id:string;due_at:string|null};
type DBAttempt={id:string;assignment_id:string;status:string;created_at:string};
type Review={rubric_scores:Record<string,unknown>|null;outcome:string};

export async function getCourseStreamLearning(
 sb:SupabaseClient, userId:string, slug:PortalSlug, preview:CoursePreview
):Promise<StreamLearning>{
 const initial:StreamLearning={
  enrolled:true,hours:0,assigned:0,completed:0,completionRate:null,
  effectiveness:null,reviewCount:0,activeDays30:null,assignments:[],finished:[],
  seriesIds:{},nextGoal:null,studentFirstName:null
 };
 const {data:catalog, error:catalogError}=await sb.rpc('course_catalog',{p_course_slug:slug});
 if(catalogError)throw new Error('Unable to load the enrolled course curriculum: '+catalogError.message);
 const items=(catalog||[]) as CatalogRow[];
 const episodes=new Map(items.map(x=>[x.episode_id,x]));
 items.forEach(x=>{initial.seriesIds[x.series_name]=x.series_id});
 const [{data:profile},{data:goals},{data:days}]=await Promise.all([
  sb.from('profiles').select('full_name').eq('id',userId).maybeSingle(),
  sb.from('student_learning_goals').select('title').eq('student_id',userId).eq('status','active').order('created_at',{ascending:false}).limit(1),
  sb.from('student_learning_days').select('activity_day').eq('student_id',userId)
    .gte('activity_day',new Date(Date.now()-29*86400000).toISOString().slice(0,10))
 ]);
 initial.studentFirstName=profile?.full_name?.trim()?.split(/\s+/)?.[0]||null;
 initial.nextGoal=goals?.[0]?.title||null;
 initial.activeDays30=days?.length??null;
 if(!items.length)return initial;
 const episodeIds=items.map(x=>x.episode_id);
 const [{data:assignedRows},{data:creditRows}]=await Promise.all([
  sb.from('lesson_assignments').select('id,episode_id,due_at')
   .eq('student_id',userId).in('episode_id',episodeIds),
  sb.from('credit_ledger').select('minutes').eq('student_id',userId)
   .in('episode_id',episodeIds)
 ]);
 const assigned=(assignedRows||[]) as DBRecord[];
 initial.hours=(creditRows||[]).reduce((n,x)=>n+Number(x.minutes||0),0)/60;
 if(!assigned.length)return initial;
 const {data:attemptRows}=await sb.from('lesson_attempts')
  .select('id,assignment_id,status,created_at').eq('student_id',userId)
  .in('assignment_id',assigned.map(x=>x.id)).order('created_at',{ascending:false});
 const attempts=(attemptRows||[]) as DBAttempt[];
 const latest=new Map<string,DBAttempt>();
 for(const a of attempts)if(!latest.has(a.assignment_id))latest.set(a.assignment_id,a);
 const all=assigned.map(a=>{
   const ep=episodes.get(a.episode_id);
   if(!ep)return null;
   const attempt=latest.get(a.id);
   return {
    id:a.id,episodeId:a.episode_id,code:ep.episode_code,title:ep.episode_title,
    series:ep.series_name,level:ep.episode_level,minutes:ep.episode_minutes,
    seriesId:ep.series_id,status:attempt?.status||'not_started',dueAt:a.due_at,
    isCompleted:attempt?.status==='finalized'
   } satisfies StreamAssignment;
 }).filter((x):x is StreamAssignment=>x!==null);
 initial.assigned=all.length;
 initial.completed=all.filter(x=>x.isCompleted).length;
 initial.completionRate=all.length?Math.round(initial.completed/all.length*100):null;
 initial.assignments=all.filter(x=>!x.isCompleted).sort((a,b)=>{
  const weights:Record<string,number>={revision_requested:0,draft:1,not_started:2,submitted:3,claimed:4};
  return (weights[a.status]??9)-(weights[b.status]??9)||a.code.localeCompare(b.code);
 });
 initial.finished=all.filter(x=>x.isCompleted).sort((a,b)=>a.code.localeCompare(b.code));
 if(attempts.length){
  const {data:reviews}=await sb.from('lesson_reviews').select('rubric_scores,outcome')
    .in('attempt_id',attempts.map(x=>x.id));
  const valid=((reviews||[]) as Review[]).filter(x=>x.outcome==='finalized')
    .flatMap(x=>Object.values(x.rubric_scores||{})).filter(x=>typeof x==='number'&&x>=1&&x<=4) as number[];
  if(valid.length)initial.effectiveness=Math.round(valid.reduce((n,x)=>n+x,0)/valid.length/4*100);
  initial.reviewCount=valid.length;
 }
 return initial;
}
