export const dynamic='force-dynamic';
import {notFound} from 'next/navigation';
import {requireUser} from '@/lib/auth';
import {StreamingSeriesDetail,type StreamingSeriesEpisode} from '@/components/StreamingSeriesDetail';
import {isPortalSlug} from '@/lib/course-portals';

type Episode={
 course_id:string;course_title:string;series_id:string;series_name:string;
 episode_id:string;episode_code:string;episode_title:string;episode_level:string;
 episode_status:string;episode_minutes:number;
};
export default async function Series({params}:{params:Promise<{id:string}>}){
 const {id}=await params;
 if(!/^[0-9a-f-]{36}$/i.test(id))notFound();
 const {sb,user}=await requireUser();
 const {data:enrollments}=await sb.from('enrollments').select('course_id').eq('student_id',user.id);
 const ids=(enrollments||[]).map(x=>x.course_id);
 const {data:courses}=ids.length?await sb.from('courses').select('id,slug,title').in('id',ids):{data:[]};
 const records=await Promise.all((courses||[]).map(c=>sb.rpc('course_catalog',{p_course_slug:c.slug})));
 const episodes=records.flatMap(x=>(x.data||[]) as Episode[]).filter(e=>e.series_id===id);
 if(!episodes.length)notFound();
 const course=(courses||[]).find(c=>c.id===episodes[0].course_id);
 if(!course||!isPortalSlug(course.slug))notFound();
 const identifiers=episodes.map(e=>e.episode_id);
 const {data:assignments}=await sb.from('lesson_assignments')
  .select('id,episode_id,created_at').eq('student_id',user.id).in('episode_id',identifiers)
  .order('created_at',{ascending:false});
 const assignmentMap=new Map<string,string>();
 for(const a of assignments||[])if(!assignmentMap.has(a.episode_id))assignmentMap.set(a.episode_id,a.id);
 const assignmentIds=[...assignmentMap.values()];
 const {data:attempts}=assignmentIds.length?await sb.from('lesson_attempts')
  .select('assignment_id,status,created_at').in('assignment_id',assignmentIds)
  .order('created_at',{ascending:false}):{data:[]};
 const statuses=new Map<string,string>();
 for(const a of attempts||[])if(!statuses.has(a.assignment_id))statuses.set(a.assignment_id,a.status);
 const {data:credits}=await sb.from('lesson_completion_credits')
  .select('episode_id').eq('student_id',user.id).in('episode_id',identifiers);
 const credited=new Set((credits||[]).map(x=>x.episode_id));
 const rows:StreamingSeriesEpisode[]=episodes.map(e=>{
  const assignmentId=assignmentMap.get(e.episode_id)||null;
  const status=credited.has(e.episode_id)?'finalized':
   assignmentId?statuses.get(assignmentId)||'assigned':'not_assigned';
  return {...e,assignmentId,status};
 });
 return <StreamingSeriesDetail slug={course.slug} name={episodes[0].series_name} episodes={rows}/>;
}
