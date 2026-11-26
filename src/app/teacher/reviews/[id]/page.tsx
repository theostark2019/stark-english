export const dynamic='force-dynamic';
import {notFound} from 'next/navigation';
import {requireTeacher} from '@/lib/auth';
import {TeacherReview} from '@/components/TeacherReview';
export default async function Review({params}:{params:Promise<{id:string}>}){
 const {id}=await params;const {sb,user}=await requireTeacher();
 const {data:attempt}=await sb.from('lesson_attempts').select('id,episode_id,student_id,status,claimed_by,assessment_schema_id').eq('id',id).maybeSingle();
 if(!attempt)notFound();
 const [{data:responses},{data:files},{data:episode},{data:student},{data:schemas}]=await Promise.all([
  sb.from('lesson_responses').select('id,activity_key,field_key,response').eq('attempt_id',id),
  sb.from('lesson_submission_files').select('id,activity_key,storage_path,mime_type').eq('attempt_id',id),
  sb.from('episodes').select('title,code').eq('id',attempt.episode_id).maybeSingle(),
  sb.from('profiles').select('full_name').eq('id',attempt.student_id).maybeSingle(),
  attempt.assessment_schema_id?sb.from('lesson_assessment_schemas').select('definition').eq('id',attempt.assessment_schema_id).limit(1):sb.from('lesson_assessment_schemas').select('definition').eq('episode_id',attempt.episode_id).order('version',{ascending:false}).limit(1)
 ]);
 const definition=schemas?.[0]?.definition as {criteria?:{key:string;label:string;scale?:number[]}[]} | undefined;
 const criteria=(definition?.criteria||[]).map(c=>({...c,scale:c.scale||[1,2,3,4]}));
 const {data:history}=episode?.code?.startsWith('AGRO02-')?await sb.from('stark02_evidence_versions').select('id,payload,file_ids,submitted_at').eq('attempt_id',id).order('submitted_at'):{data:[]};
 return <TeacherReview attempt={attempt} responses={responses||[]} files={files||[]} history={history||[]} currentTeacher={user.id} criteria={criteria} studentName={student?.full_name||'Student'} episodeTitle={episode?.title||'Lesson'}/>;
}
