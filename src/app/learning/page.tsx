import Link from 'next/link';
import {requireUser} from '@/lib/auth';
import {StudentRelationship} from '@/components/StudentRelationship';
import {getAgro02Progress} from '@/lib/agro02-progress';
import {AGRO_LEVELS} from '@/lib/agro02';
import type {StudentRelationshipRecord} from '@/lib/stark02';
export const dynamic='force-dynamic';
export default async function MyLearningFile(){
 const {sb,user}=await requireUser();
 const [{data:record,error},{data:assigned,error:assignmentError},progress]=await Promise.all([
  sb.rpc('stark02_student_file',{p_student:user.id}),
  sb.from('lesson_assignments').select('id,episodes(title,code)').eq('student_id',user.id),
  getAgro02Progress(sb,user.id).catch(()=>null)
 ]);
 if(error||assignmentError)return <section className="panel"><h1>My learning file</h1><p role="alert">Unable to load your learning record. Please try again.</p><Link href="/dashboard">Back to my course</Link></section>;
 const assignments=(assigned||[]).map(a=>{const e=(Array.isArray(a.episodes)?a.episodes[0]:a.episodes) as {title:string;code:string}|null;return {id:a.id,title:e?e.code+' · '+e.title:'Assigned lesson'}});
 return <div className="a02-page"><header className="a02-lesson-title"><p className="a02-eyebrow">STARK LEARNING · MY STUDENT FILE</p><h1>My course, one commitment at a time.</h1><p>My work, my meetings and the evidence of what I can do.</p></header>
  <section className="a02-file-section"><p className="a02-eyebrow">AGROENGLISH · OBSERVABLE COMMUNICATIVE SKILLS</p><h2>My evidence by level</h2>{progress===null?<p role="alert">Your skill evidence could not be loaded.</p>:<div className="a02-file-summary">{AGRO_LEVELS.map(l=><div key={l}><small>{l}</small><strong>{progress.filter(p=>p.code.startsWith('AGRO02-'+l)&&p.verified).length} / 24</strong><span>Skills with assessed proof at 3–4 / 4</span></div>)}</div>}
   <p className="a02-hint">Reviewed episodes, study time and demonstrated skills measure different things. Your teacher uses further assessment to judge CEFR progress.</p></section>
  <StudentRelationship studentId={user.id} record={record as StudentRelationshipRecord} assignments={assignments}/>
 </div>;
}
