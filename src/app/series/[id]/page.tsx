export const dynamic='force-dynamic';
import {notFound} from 'next/navigation';
import {requireUser} from '@/lib/auth';
import {StreamingSeriesDetail,type StreamingSeriesEpisode} from '@/components/StreamingSeriesDetail';
import {isPortalSlug} from '@/lib/course-portals';

export default async function Series({params}:{params:Promise<{id:string}>}){
 const {id}=await params;
 if(!/^[0-9a-f-]{36}$/i.test(id))notFound();
 const {sb,user}=await requireUser();
 // Authorization remains enforced by the series/courses/episodes RLS policies:
 // enrolled students see their courses, and authorized teaching staff can inspect all.
 const {data:series}=await sb.from('series').select('id,course_id,name').eq('id',id).maybeSingle();
 if(!series)notFound();
 const [{data:course},{data:episodes}]=await Promise.all([
  sb.from('courses').select('id,slug,title').eq('id',series.course_id).maybeSingle(),
  sb.from('episodes').select('id,code,title,level,status,minutes')
   .eq('series_id',id).order('code')
 ]);
 if(!course||!isPortalSlug(course.slug))notFound();
 const visible=episodes||[];
 const ids=visible.map(e=>e.id);
 const {data:assignments}=ids.length?await sb.from('lesson_assignments')
  .select('id,episode_id,created_at').eq('student_id',user.id).in('episode_id',ids)
  .order('created_at',{ascending:false}):{data:[]};
 const assignmentMap=new Map<string,string>();
 for(const a of assignments||[])if(!assignmentMap.has(a.episode_id))assignmentMap.set(a.episode_id,a.id);
 const assignmentIds=[...assignmentMap.values()];
 const {data:attempts}=assignmentIds.length?await sb.from('lesson_attempts')
  .select('assignment_id,status,created_at').in('assignment_id',assignmentIds)
  .order('created_at',{ascending:false}):{data:[]};
 const statuses=new Map<string,string>();
 for(const a of attempts||[])if(!statuses.has(a.assignment_id))statuses.set(a.assignment_id,a.status);
 const {data:credits}=ids.length?await sb.from('lesson_completion_credits')
  .select('episode_id').eq('student_id',user.id).in('episode_id',ids):{data:[]};
 const credited=new Set((credits||[]).map(x=>x.episode_id));
 const rows:StreamingSeriesEpisode[]=visible.map(e=>{
  const assignmentId=assignmentMap.get(e.id)||null;
  const status=credited.has(e.id)?'finalized':
   assignmentId?statuses.get(assignmentId)||'assigned':'not_assigned';
  return {
   episode_id:e.id,episode_code:e.code,episode_title:e.title,episode_level:e.level,
   episode_status:e.status,episode_minutes:e.minutes,assignmentId,status
  };
 });
 return <StreamingSeriesDetail slug={course.slug} name={series.name} episodes={rows}/>;
}
