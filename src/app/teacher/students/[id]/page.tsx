export const dynamic='force-dynamic';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {requireSupervisor} from '@/lib/auth';
import {indicators,roleRank,type SupervisionRow} from '@/lib/supervision';
import type {StudentLearningRecord,AssignableEpisode} from '@/components/StudentLearningPlan';
import {StudentPortfolioEditor} from '@/components/StudentPortfolioEditor';
export default async function StudentSupervision({params}:{params:Promise<{id:string}>}){
 const {id}=await params;
 const {sb,staff}=await requireSupervisor();
 const [{data:rows,error},{data:detail,error:detailError},{data:portfolio},{data:learningRecord,error:learningError},{data:episodes,error:episodesError}]=await Promise.all([
  sb.rpc('supervision_roster'),sb.rpc('supervision_student_detail',{p_student:id}),
  sb.from('student_portfolios').select('created_at').eq('student_id',id).maybeSingle(),
  sb.rpc('supervision_student_learning_record',{p_student:id}),
  roleRank(staff.hierarchy)>=3?sb.rpc('supervision_available_lessons',{p_student:id}):Promise.resolve({data:[],error:null})
 ]);
 if(error||detailError||learningError||episodesError)return <section className="panel"><h1>Student record</h1><p className="error">Unable to access this record. {error?.message||detailError?.message||learningError?.message||episodesError?.message}</p></section>;
 const row=((rows||[]) as SupervisionRow[]).find(r=>r.student_id===id);
 if(!row||!detail)notFound();
 return <div className="supervision-home">
  <div className="supervision-hero"><div><p className="supervision-eyebrow">STUDENT LEARNING FILE</p>
   <Link className="supervision-back" href="/teacher">← All students</Link>
   <h1>{row.student_name}</h1>
   <p>{(row.courses||[]).join(' · ')||'Enrolled student'} · {String(row.academic_fields?.Group||'Group not set')}</p>
  </div><div className="supervision-hero-actions"><Link href="/teacher">Roster →</Link><Link href="/teacher/reviews">Review queue →</Link></div></div>
  <StudentPortfolioEditor studentId={id} role={staff.hierarchy} name={row.student_name}
   metrics={indicators(row)} stats={row} detail={detail} fileCreatedAt={portfolio?.created_at||null}
   learningRecord={learningRecord as StudentLearningRecord} availableLessons={(episodes||[]) as AssignableEpisode[]}/>
 </div>;
}
