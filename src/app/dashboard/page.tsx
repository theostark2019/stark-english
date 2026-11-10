export const dynamic = 'force-dynamic';
import Link from 'next/link';
import {requireUser} from '@/lib/auth';

type CatalogItem = {
 course_id:string;course_title:string;series_id:string;series_name:string;
 episode_id:string;episode_code:string;episode_title:string;episode_level:string;
 episode_status:string;episode_minutes:number
};
type Course = {id:string;slug:string;title:string};
type Assignment = {id:string;episode_id:string};
type Attempt = {id:string;assignment_id:string;status:string;created_at:string};
const arts = ['🌱','🌾','🚜','🌍','🌿','🫘','🌻','🔬'];
function labelStatus(status?:string){
 if(status==='finalized') return 'Completed';
 if(status==='submitted'||status==='claimed') return 'Awaiting feedback';
 if(status==='revision_requested') return 'Revision requested';
 if(status==='draft') return 'Continue lesson';
 return 'Start lesson';
}
export default async function Dashboard({searchParams}:{searchParams:Promise<{q?:string}>}){
 const {sb,user}=await requireUser();
 const search=(await searchParams).q?.trim().toLowerCase()||'';
 const [{data:profile},{data:enrollments},{data:teacher},{data:credits}]=await Promise.all([
  sb.from('profiles').select('full_name,role').eq('id',user.id).maybeSingle(),
  sb.from('enrollments').select('course_id').eq('student_id',user.id),
  sb.from('teacher_profiles').select('user_id,active').eq('user_id',user.id).maybeSingle(),
  sb.from('credit_ledger').select('minutes,episode_id').eq('student_id',user.id)
 ]);
 const courseIds=(enrollments||[]).map(e=>e.course_id);
 const {data:courseRows}=courseIds.length?await sb.from('courses').select('id,slug,title').in('id',courseIds):{data:[]};
 const courses=(courseRows||[]) as Course[];
 const catalogs=await Promise.all(courses.map(c=>sb.rpc('course_catalog',{p_course_slug:c.slug})));
 const catalog=catalogs.flatMap(r=>(r.data||[]) as CatalogItem[]);
 const allEpisodeIds=catalog.map(e=>e.episode_id);
 const [{data:assignments},{data:masteryRows}]=await Promise.all([
  allEpisodeIds.length?sb.from('lesson_assignments').select('id,episode_id').eq('student_id',user.id).in('episode_id',allEpisodeIds):Promise.resolve({data:[]}),
  sb.from('mastery').select('competency_id,score').eq('student_id',user.id)
 ]);
 const ass=(assignments||[]) as Assignment[];
 const {data:attemptRows}=ass.length?await sb.from('lesson_attempts').select('id,assignment_id,status,created_at').in('assignment_id',ass.map(a=>a.id)).order('created_at',{ascending:false}):{data:[]};
 const attempts=(attemptRows||[]) as Attempt[];
 const assignmentMap=new Map(ass.map(a=>[a.episode_id,a.id]));
 const attemptByAssignment=new Map<string,Attempt>();
 attempts.forEach(a=>{if(!attemptByAssignment.has(a.assignment_id))attemptByAssignment.set(a.assignment_id,a)});
 const episodeById=new Map(catalog.map(e=>[e.episode_id,e]));
 const working=ass.map(a=>({assignment:a,episode:episodeById.get(a.episode_id),attempt:attemptByAssignment.get(a.id)})).filter(x=>x.episode).filter(x=>x.attempt?.status!=='finalized');
 const completed=ass.map(a=>({assignment:a,episode:episodeById.get(a.episode_id),attempt:attemptByAssignment.get(a.id)})).filter(x=>x.attempt?.status==='finalized');
 const reviewed=(masteryRows||[]).filter(m=>typeof m.score==='number');
 const totalMinutes=(credits||[]).reduce((sum,x)=>sum+(x.minutes||0),0);
 const confirmedHours=(totalMinutes/60).toLocaleString('en-US',{maximumFractionDigits:1});
 const seriesMap=new Map<string,{id:string;name:string;course:Course|undefined;episodes:CatalogItem[]}>();
 catalog.forEach(e=>{
  if(!seriesMap.has(e.series_id))seriesMap.set(e.series_id,{id:e.series_id,name:e.series_name,course:courses.find(c=>c.id===e.course_id),episodes:[]});
  seriesMap.get(e.series_id)!.episodes.push(e);
 });
 const allSeries=[...seriesMap.values()];
 const filteredSeries=allSeries.filter(s=>!search||s.name.toLowerCase().includes(search)||s.course?.title.toLowerCase().includes(search)||s.episodes.some(e=>e.episode_title.toLowerCase().includes(search)||e.episode_code.toLowerCase().includes(search)));
 const showcased=catalog.filter(e=>e.episode_status==='published'&&assignmentMap.has(e.episode_id));
 const firstCourse=courses[0];
 const agro=courses.some(c=>c.slug==='agroenglish');
 return <div className="stream-home" id="inicio">
  <section className="stream-intro">
   <div><p className="stream-kicker">STARK LEARNING <span>/ STUDENT HOME</span></p>
   <h1>{agro?'AgroEnglish':firstCourse?.title||'Your learning'} <span className="stream-intro-spark">✦</span></h1>
   <p className="stream-subtitle">Welcome{profile?.full_name?', '+profile.full_name.split(' ')[0]:''}. Continue your journey through real situations and practical English.</p></div>
   <form className="stream-search" action="/dashboard" method="get" role="search"><span aria-hidden="true">⌕</span><input name="q" type="search" aria-label="Search series and episodes" placeholder="Search series and episodes..." defaultValue={search}/><button type="submit">Search</button></form>
  </section>
  <section className="stream-kpis" aria-label="Your learning indicators">
    <div className="stream-kpi"><span className="stream-kpi-icon">◷</span><div><h2>Hours invested</h2><strong>{confirmedHours} <small>h</small></strong><p>Teacher-confirmed lesson credit</p></div><span className="stream-kpi-mark">↗</span></div>
    <div className="stream-kpi"><span className="stream-kpi-icon">▤</span><div><h2>Content acquired</h2><strong>{completed.length} <small>lessons</small></strong><p>{ass.length} assigned · {catalog.length} in curriculum</p></div><span className="stream-kpi-mark">▥</span></div>
    <div className="stream-kpi"><span className="stream-kpi-icon">◎</span><div><h2>Efficiency</h2><strong>{reviewed.length?'Tracking':'—'}</strong><p>Based on reviewed competencies</p></div><span className="stream-kpi-mark">◌</span></div>
    <div className="stream-kpi"><span className="stream-kpi-icon">↗</span><div><h2>Effectiveness</h2><strong>{reviewed.length?Math.round(reviewed.reduce((sum,x)=>sum+x.score,0)/reviewed.length/4*100)+'%':'—'}</strong><p>{reviewed.length?'Average assessed mastery':'Awaiting your first assessment'}</p></div><span className="stream-kpi-mark">▦</span></div>
  </section>
  <div className="stream-layout">
   <aside className="stream-side" aria-label="Suggestions">
    <section className="stream-surface">
     <h2 className="stream-section-title"><span>✦</span> Suggestions for you</h2>
     {showcased.slice(0,3).map((e,i)=>{const a=assignmentMap.get(e.episode_id)!;return <Link className="stream-suggestion" href={'/lessons/'+a} key={e.episode_id}><span className={'stream-poster tone-'+i}>{arts[i]}</span><span><small>Series · {e.episode_level}</small><strong>{e.episode_title}</strong><em>{e.episode_minutes} min · Ready to learn</em></span><span className="stream-play">▶</span></Link>})}
     {!showcased.length&&<p className="stream-hint">Published lessons will appear as soon as they are assigned.</p>}
     <div className="stream-note"><span>✧</span> Your next lesson follows your enrolled course and teacher's assignments.</div>
    </section>
   </aside>
   <div className="stream-main">
    <section className="stream-surface" id="continuar">
     <div className="stream-heading"><h2 className="stream-section-title"><span>▷</span> Continue learning</h2><a href="#series">View all ›</a></div>
     <div className="stream-continue">
      {working.slice(0,3).map((x,i)=><Link className="stream-episode" key={x.assignment.id} href={'/lessons/'+x.assignment.id}><span className={'stream-thumb tone-'+i}>{arts[i]}</span><span className="stream-episode-body"><small>{x.episode?.series_name} · {x.episode?.episode_level}</small><strong>{x.episode?.episode_title}</strong><span className="stream-progress"><i style={{width:x.attempt?'45%':'7%'}}/></span><em>{labelStatus(x.attempt?.status)}</em></span><span className="stream-play">▶</span></Link>)}
      {!working.length&&<div className="stream-empty">{completed.length?'Your assigned lessons are complete. Well done!':'Your next lesson will appear here when assigned.'}</div>}
     </div>
    </section>
    <section className="stream-surface" id="series">
      <div className="stream-heading"><h2 className="stream-section-title"><span>▣</span> Series <small>Each module is a series</small></h2><span className="stream-tiny">{filteredSeries.length} series</span></div>
      <div className="stream-series-grid">{filteredSeries.map((s,i)=>{
       const released=s.episodes.filter(e=>e.episode_status==='published');
       const assigned=s.episodes.filter(e=>assignmentMap.has(e.episode_id));
       const done=assigned.filter(e=>attemptByAssignment.get(assignmentMap.get(e.episode_id)!)?.status==='finalized');
       const pct=assigned.length?Math.round(done.length/assigned.length*100):0;
       return <Link href={'/series/'+s.id} className="stream-series-card" key={s.id}>
         <span className={'stream-series-art tone-'+(i%8)}><span>{arts[i%8]}</span><small>{s.episodes[0]?.episode_level||'Series'}</small></span>
         <span className="stream-series-copy"><small>{s.course?.title||'Stark Learning'} · SERIES {String(i+1).padStart(2,'0')}</small><strong>{s.name}</strong><em>{s.episodes.length} episodes · {released.length} published</em><span className="stream-mini-progress"><i style={{width:pct+'%'}}/></span><small>{done.length} completed · {assigned.length} assigned</small></span>
         <span className="stream-play">▶</span></Link>
       })}</div>
       {!filteredSeries.length&&<p className="stream-hint">No series match your search.</p>}
    </section>
    <section className="stream-surface stream-discover">
      <div className="stream-heading"><h2 className="stream-section-title"><span>▦</span> Your courses</h2></div>
      <div className="stream-courses">{courses.map((c,i)=><Link className="stream-course-card" href={c.slug==='agroenglish'?'/agroenglish':'/dashboard#series'} key={c.id}><span>{i===0?'🌾':'📚'}</span><span><strong>{c.title}</strong><small>Explore your series and learning stages</small></span><span>›</span></Link>)}</div>
    </section>
   </div>
   <aside className="stream-side stream-right">
    <section className="stream-surface" id="concluidas">
      <div className="stream-heading"><h2 className="stream-section-title"><span>✓</span> Completed lessons</h2></div>
      {completed.slice(0,5).map(x=><Link href={'/lessons/'+x.assignment.id} key={x.assignment.id} className="stream-complete"><span>✓</span><strong>{x.episode?.episode_title}</strong><small>{x.episode?.episode_level}</small></Link>)}
      {!completed.length&&<p className="stream-hint">Your teacher-finalized lessons will be listed here.</p>}
    </section>
    <section className="stream-surface stream-cefr">
      <h2 className="stream-section-title"><span>◈</span> CEFR expectation</h2>
      <p className="stream-tiny">Your assessed English level</p>
      <h3>{reviewed.length?'Assessment in progress':'Awaiting assessment'}</h3>
      <div className="stream-cefr-track">{['A1','A2','B1','B2','C+'].map((level,i)=><div key={level}><span className={i===0&&reviewed.length?'active':''}>{i===0&&reviewed.length?'✓':'·'}</span><small>{level}</small></div>)}</div>
      <div className="stream-objective"><span>◎</span><div><strong>Next objective</strong><p>Complete your assigned lesson and receive teacher feedback to track your CEFR progress.</p></div></div>
    </section>
    <section className="stream-surface stream-profile"><p className="stream-kicker">LEARNING RECORD</p><strong>{ass.length} assignments</strong><p>{attempts.filter(a=>a.status==='submitted'||a.status==='claimed').length} awaiting review</p>{teacher?.active&&<Link href="/teacher/reviews">Open teacher workspace ›</Link>}{profile?.role==='admin'&&<Link href="/admin/assignments">Manage assignments ›</Link>}</section>
   </aside>
  </div>
 </div>;
}
