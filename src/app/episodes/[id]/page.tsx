export const dynamic='force-dynamic';
import {notFound} from 'next/navigation';
import Link from 'next/link';
import {requireUser} from '@/lib/auth';
export default async function Episode({params}:{params:Promise<{id:string}>}){
 const {id}=await params;const {sb,user}=await requireUser();
 const {data:e}=await sb.from('episodes').select('id,title,code,level,description,lesson_body').eq('id',id).eq('status','published').maybeSingle();if(!e)notFound();
 const {data:x}=await sb.from('lesson_assignments').select('id').eq('episode_id',id).eq('student_id',user.id).maybeSingle();
 return <section className="panel"><Link href="/dashboard">← Dashboard</Link><p className="eyebrow">{e.code} · {e.level}</p><h1>{e.title}</h1><p>{e.description}</p><p className="notice">For interactive work, use the approved original lesson. Results are not automatically imported from that separate page yet; add the required evidence to the Stark Learning submission.</p>{e.code==='AGRO-A1-01'&&<p><a className="button secondary" href="https://agroenglish-frames-preview-lw8au8gvl-theomichigan-2676.vercel.app/" target="_blank" rel="noopener noreferrer">Open Agriculture 101 activities</a></p>}{x?<Link className="button" href={'/lessons/'+x.id}>Open submission</Link>:<p>Ask your teacher to assign this lesson before submission.</p>}</section>
}
