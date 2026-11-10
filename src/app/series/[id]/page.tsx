export const dynamic='force-dynamic';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {requireUser} from '@/lib/auth';
type Episode={course_id:string;course_title:string;series_id:string;series_name:string;episode_id:string;episode_code:string;episode_title:string;episode_level:string;episode_status:string;episode_minutes:number};
export default async function Series({params}:{params:Promise<{id:string}>}){
 const {id}=await params;const {sb,user}=await requireUser();
 const {data:enrollments}=await sb.from('enrollments').select('course_id').eq('student_id',user.id);
 const ids=(enrollments||[]).map(x=>x.course_id);
 const {data:courses}=ids.length?await sb.from('courses').select('id,slug,title').in('id',ids):{data:[]};
 const catalogs=await Promise.all((courses||[]).map(c=>sb.rpc('course_catalog',{p_course_slug:c.slug})));
 const episodes=catalogs.flatMap(x=>(x.data||[]) as Episode[]).filter(e=>e.series_id===id);
 if(!episodes.length)notFound();
 const {data:assignments}=await sb.from('lesson_assignments').select('id,episode_id').eq('student_id',user.id).in('episode_id',episodes.map(e=>e.episode_id));
 const amap=new Map((assignments||[]).map(x=>[x.episode_id,x.id]));
 const {data:attempts}=assignments?.length?await sb.from('lesson_attempts').select('assignment_id,status').in('assignment_id',assignments.map(a=>a.id)):{data:[]};
 const statuses=new Map((attempts||[]).map(a=>[a.assignment_id,a.status]));
 const available=episodes.filter(e=>e.episode_status==='published');
 return <div className="stream-series-page">
 <Link href="/dashboard#series" className="stream-back">← All series</Link>
 <section className="stream-series-banner"><div><p className="stream-kicker">STARK LEARNING · {episodes[0].course_title}</p><h1>{episodes[0].series_name}</h1><p>Build English for real professional situations, one episode at a time.</p><div className="row"><span className="tag">{episodes[0].episode_level}</span><span className="tag">{episodes.length} episodes</span><span className="tag">{available.length} published</span></div></div><span aria-hidden="true">🌾</span></section>
 <div className="stream-heading"><h2>Episodes</h2><span className="stream-tiny">{available.length} available in this series</span></div>
 <div className="stream-series-episode-list">{episodes.map((e,i)=>{const a=amap.get(e.episode_id);const canOpen=e.episode_status==='published'&&!!a;return <article className="stream-series-episode" key={e.episode_id}><div className="stream-episode-number">{String(i+1).padStart(2,'0')}</div><div className="stream-episode-icon">{['🚜','🌱','🧪','🌦️','🌻','🐄','🌾','🔬'][i%8]}</div><div className="stream-episode-details"><span>{e.episode_code} · {e.episode_minutes} MIN</span><h3>{e.episode_title}</h3><p>{e.episode_level} · {canOpen?(statuses.get(a!)||'Ready to start').replaceAll('_',' '):e.episode_status==='published'?'Awaiting assignment':'Coming soon'}</p></div>{canOpen?<Link className="button gold" href={'/lessons/'+a}>Open episode ▶</Link>:<span className="stream-locked">Not available yet</span>}</article>})}</div></div>;
}
