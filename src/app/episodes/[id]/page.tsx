export const dynamic='force-dynamic';
import {notFound,redirect} from 'next/navigation';
import Link from 'next/link';
import {requireUser} from '@/lib/auth';

export default async function Episode({params}:{params:Promise<{id:string}>}){
 const {id}=await params;
 const {sb,user}=await requireUser();
 const {data:e}=await sb.from('episodes').select('id,title,code,level,status').eq('id',id).eq('status','published').maybeSingle();
 if(!e)notFound();
 const {data:assignment}=await sb.from('lesson_assignments').select('id').eq('episode_id',id).eq('student_id',user.id).maybeSingle();
 if(assignment)redirect('/lessons/'+assignment.id);
 return <section className="panel"><Link href="/dashboard">← Dashboard</Link><p className="eyebrow">{e.code} · {e.level}</p><h1>{e.title}</h1><p>This episode is available, but it has not been assigned to your account. Ask your teacher to assign it before you start.</p></section>;
}
