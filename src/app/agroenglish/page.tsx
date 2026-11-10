export const dynamic='force-dynamic';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {requireUser} from '@/lib/auth';
type CatalogRow={course_id:string;course_title:string;series_id:string;series_name:string;episode_id:string;episode_code:string;episode_title:string;episode_level:string;episode_status:string;episode_minutes:number};
export default async function AgroEnglish(){
 const {sb,user}=await requireUser();
 const {data,error}=await sb.rpc('course_catalog',{p_course_slug:'agroenglish'});
 if(error) return <section className="panel"><h1>AgroEnglish</h1><p role="alert">Course catalog unavailable: {error.message}</p></section>;
 const rows=(data||[]) as CatalogRow[];
 if(!rows.length)notFound();
 const {data:assignments}=await sb.from('lesson_assignments').select('id,episode_id').eq('student_id',user.id).in('episode_id',rows.map(x=>x.episode_id));
 const assignmentMap=new Map((assignments||[]).map(x=>[x.episode_id,x.id]));
 const {data:attempts}=assignments?.length?await sb.from('lesson_attempts').select('assignment_id,status').in('assignment_id',assignments.map(x=>x.id)):{data:[]};
 const attemptMap=new Map((attempts||[]).map(x=>[x.assignment_id,x.status]));
 const grouped=new Map<string,CatalogRow[]>();
 for(const row of rows){const group=row.series_name;grouped.set(group,[...(grouped.get(group)||[]),row])}
 const available=rows.filter(x=>x.episode_status==='published').length;
 return <div className="agro-page">
 <div className="agro-hero">
 <div className="agro-orbit" aria-hidden="true">🌾</div>
 <p className="eyebrow" style={{color:'#c6da9a'}}>STARK LEARNING · SPECIALIZED ENGLISH</p>
 <h1>Agro<span>English</span></h1>
 <p>English for agriculture. Real situations, field vocabulary and communicative tasks — from foundational introductions to professional conversations.</p>
 <div className="agro-stats"><div><strong>{rows.length}</strong><span>Curriculum episodes</span></div><div><strong>{grouped.size}</strong><span>Learning stages</span></div><div><strong>{available}</strong><span>Available now</span></div></div>
 <div className="row"><a href="#curriculum" className="button gold">Explore the curriculum</a>{assignmentMap.has('e0039ba6-585a-4e60-af04-1d887b22b083')&&<Link href={'/lessons/'+assignmentMap.get('e0039ba6-585a-4e60-af04-1d887b22b083')} className="button secondary">Start Agriculture 101</Link>}</div>
 </div>
 <section className="agro-feature panel"><div className="agro-feature-emoji">🚜</div><div><p className="eyebrow">YOUR FIRST MISSION</p><h2>Agriculture 101</h2><p>Introduce yourself at a farm visit, understand agricultural roles and crops, and communicate your background with confidence.</p><div className="row"><span className="tag">A1</span><span className="tag">60 minutes</span><span className="tag">7 activities</span></div></div><div className="agro-feature-actions">{assignmentMap.has('e0039ba6-585a-4e60-af04-1d887b22b083')?<Link className="button gold" href={'/lessons/'+assignmentMap.get('e0039ba6-585a-4e60-af04-1d887b22b083')}>Open lesson</Link>:<span className="tag">Awaiting assignment</span>}<span className="tag">Activities and submission in one place</span></div></section>
 <div id="curriculum"><p className="eyebrow">YOUR LEARNING PATH</p><h2>Course curriculum</h2><p className="muted">Published episodes can be studied. Draft episodes are displayed as a roadmap and will unlock after publication and assignment.</p></div>
 {[...grouped.entries()].map(([name,episodes],i)=><section className="agro-stage" key={name}><div className="agro-stage-head"><div className="agro-stage-number">{String(i+1).padStart(2,'0')}</div><div><p className="eyebrow">LEARNING STAGE {i+1}</p><h2>{name}</h2><p className="muted">{episodes.filter(x=>x.episode_status==='published').length} of {episodes.length} episodes available</p></div></div><div className="agro-cards">{episodes.map(e=>{const assignment=assignmentMap.get(e.episode_id);const open=e.episode_status==='published'&&!!assignment;const status=assignment?attemptMap.get(assignment):null;return <article className={'agro-card '+(open?'agro-card-open':'')} key={e.episode_id}><div className="row" style={{justifyContent:'space-between'}}><span className="agro-code">{e.episode_code}</span><span className={'tag '+(open?'agro-ready':'')}>{open?(status?status.replaceAll('_',' '):'Ready to start'):e.episode_status==='published'?'Published':'Coming soon'}</span></div><h3>{e.episode_title}</h3><p className="muted">{e.episode_level} · {e.episode_minutes} min</p>{open?<Link className="button" href={'/lessons/'+assignment}>Open lesson</Link>:<span className="agro-lock" aria-label="Unavailable">◌ Available when assigned</span>}</article>})}</div></section>)}
 </div>
}
