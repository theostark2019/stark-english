import Link from 'next/link';
import {notFound} from 'next/navigation';
import {requireSupervisor} from '@/lib/auth';
import {StudentRelationship} from '@/components/StudentRelationship';
import type {StudentRelationshipRecord} from '@/lib/stark02';
export const dynamic='force-dynamic';
export default async function StudentCoursePlan({params}:{params:Promise<{id:string}>}){
 const {id}=await params;const {sb,user}=await requireSupervisor();
 if(!/^[0-9a-f-]{36}$/i.test(id))notFound();
 const [{data:record,error},{data:detail,error:detailError},{data:courses},{data:lessons}]=await Promise.all([
  sb.rpc('stark02_student_file',{p_student:id}),sb.rpc('supervision_student_detail',{p_student:id}),
  sb.from('enrollments').select('course_id,courses(title)').eq('student_id',id),
  sb.rpc('supervision_available_lessons',{p_student:id})
 ]);
 if(error||detailError)return <section className="panel"><h1>Student course plan</h1><p role="alert">Unable to open this student record. {error?.message||detailError?.message}</p></section>;
 const teachers=(detail?.staff||[]) as {id:string;name:string}[];
 const teacherOptions=teachers.some(t=>t.id===user.id)?teachers:[{id:user.id,name:'Me'},...teachers];
 const courseOptions=(courses||[]).map(c=>({id:c.course_id,name:String((Array.isArray(c.courses)?c.courses[0]:c.courses)?.title||'Course')}));
 const assignments=((lessons||[]) as {assigned_id:string|null;episode_title:string;episode_code:string}[]).filter(l=>l.assigned_id).map(l=>({id:l.assigned_id!,title:l.episode_code+' · '+l.episode_title}));
 for(const c of (record as StudentRelationshipRecord).commitments)if(!assignments.some(a=>a.id===c.assignment_id))assignments.push({id:c.assignment_id,title:c.code+' · '+c.title});
 return <div className="a02-page"><header className="a02-lesson-title"><Link href={'/teacher/students/'+id}>← Complete student file</Link><p className="a02-eyebrow">STARK LEARNING · COURSE RELATIONSHIP</p><h1>Commitments, meetings & tuition</h1><p>Keep the agreed teaching relationship connected to the student's work.</p></header>
  <StudentRelationship key={JSON.stringify(record)} studentId={id} record={record as StudentRelationshipRecord} courses={courseOptions} teachers={teacherOptions} assignments={assignments}/>
 </div>;
}
