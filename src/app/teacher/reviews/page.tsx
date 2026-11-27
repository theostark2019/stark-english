export const dynamic='force-dynamic';
import Link from 'next/link';
import {requireTeacher} from '@/lib/auth';
export default async function Reviews(){
 const {sb}=await requireTeacher();
 const {data:attempts,error}=await sb.from('lesson_attempts').select('id,status,episode_id,student_id,submitted_at,claimed_by').in('status',['submitted','claimed']).order('submitted_at',{ascending:true}).limit(100);
 const items=attempts||[],ids=[...new Set(items.map(x=>x.episode_id))],studentIds=[...new Set(items.map(x=>x.student_id))];
 const [{data:episodes},{data:profiles}]=await Promise.all([
  ids.length?sb.from('episodes').select('id,title,code').in('id',ids):Promise.resolve({data:[]}),
  studentIds.length?sb.from('profiles').select('id,full_name').in('id',studentIds):Promise.resolve({data:[]})
 ]);
 const names=new Map((profiles||[]).map(p=>[p.id,p.full_name]));const titles=new Map((episodes||[]).map(p=>[p.id,p.title]));
 return <><p className="eyebrow">Teacher workspace</p><h1>Review queue</h1><p className="muted">Only submissions assigned to you, your teacher group or the eligible teacher pool appear here.</p>
 {error&&<p className="error">{error.message}</p>}
 <section className="grid">{items.map(a=><article key={a.id} className="panel"><p className="eyebrow">{a.status}</p><h2>{titles.get(a.episode_id)||'Lesson submission'}</h2><p>Student: {names.get(a.student_id)||'Student'}</p><p className="muted">{a.submitted_at?new Date(a.submitted_at).toLocaleString():''}</p><Link href={'/teacher/reviews/'+a.id} className="button">{a.claimed_by?'View review':'Claim and review'}</Link></article>)}</section>
 {!items.length&&<section className="panel">No submissions awaiting review.</section>}
 </>;
}
