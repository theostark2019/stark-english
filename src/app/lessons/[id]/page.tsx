export const dynamic='force-dynamic';
import {notFound} from 'next/navigation';
import {requireUser} from '@/lib/auth';
import {LessonWorkspace} from '@/components/LessonWorkspace';
export default async function Lesson({params}:{params:Promise<{id:string}>}){
 const {id}=await params;const {sb,user}=await requireUser();
 const {data:assignment}=await sb.from('lesson_assignments').select('id,episode_id').eq('id',id).eq('student_id',user.id).maybeSingle();
 if(!assignment)notFound();
 const [{data:episode},{data:attempts},{data:activities}]=await Promise.all([
  sb.from('episodes').select('title,code,level').eq('id',assignment.episode_id).maybeSingle(),
  sb.from('lesson_attempts').select('id,assignment_id,student_id,episode_id,status,created_at').eq('assignment_id',id).order('created_at',{ascending:false}).limit(1),
  sb.from('lesson_activity_definitions').select('activity_key,activity_type,position,config').eq('episode_id',assignment.episode_id).order('position')
 ]);
 const attempt=attempts?.[0]||null;
 const [{data:responses},{data:files},{data:reviews}]=attempt?await Promise.all([
  sb.from('lesson_responses').select('activity_key,field_key,response').eq('attempt_id',attempt.id),
  sb.from('lesson_submission_files').select('id,activity_key,storage_path,mime_type,bytes').eq('attempt_id',attempt.id),
  sb.from('lesson_reviews').select('id,feedback,outcome,created_at,rubric_scores').eq('attempt_id',attempt.id).order('created_at')
 ]):[{data:[]},{data:[]},{data:[]}];
 return <LessonWorkspace key={id} assignment={assignment} studentId={user.id} episode={episode} initialAttempt={attempt} activities={activities||[]} responses={responses||[]} files={files||[]} reviews={reviews||[]}/>;
}
