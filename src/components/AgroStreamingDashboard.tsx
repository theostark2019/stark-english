import Link from 'next/link';
import type {CoursePreview,CourseStatus} from '@/lib/course-portals';
import type {StreamLearning} from '@/lib/course-stream-data';
import type {AgroMediaManifest} from '@/lib/agro-media';

type Props={course:CoursePreview;status:CourseStatus;learning:StreamLearning|null;media:AgroMediaManifest;isEditor:boolean;query:string};
const num=(n:number)=>new Intl.NumberFormat('en-US',{maximumFractionDigits:1}).format(n);
const progress=(n:number,d:number)=>d>0?Math.round(n/d*100):0;
function Tile({src,alt,kind,label}:{src?:string;alt:string;kind:string;label?:string}){
 return <div className={'agrs-thumb '+kind}>
   {src?<img src={src} alt={alt} loading="lazy"/>:<div className="agrs-thumb-fallback" aria-label={alt}><span>🌾</span><small>AGROENGLISH</small></div>}
   {label&&<span className="agrs-thumb-badge">{label}</span>}
  </div>;
}
export function AgroStreamingDashboard({course,status,learning,media,isEditor,query}:Props){
 const enrolled=!!learning?.enrolled;
 const assigned=learning?.assignments||[],finished=learning?.finished||[];
 const latest=assigned.find(a=>a.code==='AGRO-A1-01')||assigned[0]||null;
 const lessonHref=latest?'/lessons/'+latest.id:'/courses/agroenglish/agriculture-101';
 const lessonProgress=latest?.status==='finalized'?100:0;
 const series=(course.series||[]).filter(c=>!query||c.name.toLowerCase().includes(query.toLowerCase()));
 const courses=course.publishedEpisodes||[];
 const agroItems=[
  {title:'Agriculture 101',sub:'Visit a coffee farm and learn to describe crops, field work and teams.',href:'/courses/agroenglish/agriculture-101',thumb:media['a1-coffee']||media.hero,badge:'A1 · A2'},
  {title:'Agribiology',sub:'Plants, agricultural organisms and the vocabulary of life.',href:assigned.find(a=>a.code==='AGRO-A1-02')?'/lessons/'+assigned.find(a=>a.code==='AGRO-A1-02')?.id:'/courses/agroenglish#series',thumb:undefined,badge:'A1'},
  {title:'Agrichemistry',sub:'Substances, reactions and chemistry in agricultural settings.',href:'/courses/agroenglish#series',thumb:undefined,badge:'A1'},
 ];
 const outcomes=[
  {title:'Build your farm vocabulary',desc:'Coffee, soybeans, corn, crops, soil and teamwork.',href:'/courses/agroenglish/agriculture-101#vocabulary',icon:'🌱'},
  {title:'Practice your field notes',desc:'Introduce yourself, record what farmers do, and describe work.',href:'/courses/agroenglish/agriculture-101#field-notes',icon:'▤'},
  {title:'Prepare for the next farm visit',desc:'Move from a simple A1 introduction to a detailed A2 report.',href:'/courses/agroenglish/agriculture-101#a2-reading',icon:'◎'}
 ];
 return <div className="agrs-page">
  <div className="agrs-shell">
   <header className="agrs-header">
    <Link href="/courses" className="agrs-brand"><span className="agrs-brand-mark">🌾</span><span><strong>AgroEnglish</strong><small>English for Agriculture</small></span></Link>
    <nav aria-label="AgroEnglish navigation">
      <a href="#home" className="agrs-current">⌂ Home</a>
      <a href="#series">▷ Series</a><a href="#lessons">▣ Lessons</a>
      <Link href="/courses/agroenglish/agriculture-101#field-notes">▤ Field Notes</Link>
      <Link href={enrolled?'/dashboard':'/login'}>◷ My learning</Link>
    </nav>
    <div className="agrs-tools">
      <form action="/courses/agroenglish" role="search"><input aria-label="Search AgroEnglish" name="q" defaultValue={query} placeholder="Search lessons, series, topics..."/><button type="submit">⌕</button></form>
      {isEditor&&<Link href="/teacher/agro-media" className="agrs-manage">Manage media</Link>}
      <Link href="/courses" aria-label="Choose other course" className="agrs-avatar">✦</Link>
    </div>
   </header>
   <section className="agrs-hero" id="home">
     {media.hero?<img className="agrs-hero-img" src={media.hero} alt="Marina speaking to two farmers during a rural field visit"/>:
      <div className="agrs-hero-fallback" aria-hidden="true"><span>🌱</span></div>}
     <div className="agrs-hero-shade"/>
     <div className="agrs-hero-text">
       <div className="agrs-kicker">AGROENGLISH · SERIES 1 · LESSON 1</div>
       <h1>Agriculture 101</h1>
       <h2>My Place in Agriculture</h2>
       <p>Visit different farms, observe coffee, soybeans and corn, and connect agricultural English to real-life work.</p>
       <div className="agrs-hero-meta"><span>A1 foundations · A2 extension</span><span>60 min estimated</span></div>
       <div className="agrs-hero-actions">
        <Link href="/courses/agroenglish/agriculture-101" className="agrs-main-button">▶ Explore Lesson 1</Link>
        <Link href={lessonHref} className="agrs-outline-button">{latest?'↪ Continue assigned work':'See learning activities'}</Link>
       </div>
     </div>
   </section>
   <section className="agrs-kpis" aria-label="Learning KPIs">
     {[
      {icon:'◷',label:'Hours credited',value:enrolled?num(learning?.hours||0)+' h':'—',desc:'Completed learning workload'},
      {icon:'▱',label:'Content acquired',value:enrolled?String(learning?.completed||0):'—',desc:'Teacher-finalized lessons'},
      {icon:'↗',label:'Efficiency',value:enrolled&&learning?.completionRate!==null?String(learning?.completionRate)+'%':'—',desc:'Completed / assigned'},
      {icon:'◈',label:'Effectiveness',value:enrolled&&learning?.effectiveness!==null?String(learning?.effectiveness)+'%':'—',desc:'Teacher rubric results'}
     ].map(k=><div className="agrs-kpi" key={k.label}><div className="agrs-kpi-icon">{k.icon}</div><div>
       <div className="agrs-kpi-label">{k.label}</div><strong>{k.value}</strong><small>{k.desc}</small>
     </div></div>)}
   </section>
   <div className="agrs-layout">
    <aside className="agrs-suggestions">
      <h2><span>✧</span> Suggestions for you</h2>
      {outcomes.map(o=><Link className="agrs-suggestion" href={o.href} key={o.title}>
       <span>{o.icon}</span><div><strong>{o.title}</strong><small>{o.desc}</small></div><b>›</b>
      </Link>)}
      <div className="agrs-suggestion-footer"><span>Learning grows from the field.</span></div>
    </aside>
    <div className="agrs-main">
     <section className="agrs-continue" id="lessons">
      <div className="agrs-section-heading"><h2>Continue learning</h2><Link href="/courses/agroenglish/agriculture-101">Lesson overview ↗</Link></div>
      <div className="agrs-continue-card">
       <Tile src={media['a1-coffee']||media.hero} alt="Marina visits a coffee farm" kind="agrs-continue-thumb" label="LESSON 1"/>
       <div><div className="agrs-mini-kicker">SERIES 1 · LESSON 1</div>
        <h3>Agriculture 101 — My Place in Agriculture</h3>
        <p>Visit a farm, meet its people, and describe what they do using A1 and A2 English.</p>
        <div className="agrs-continue-meter"><span style={{width:lessonProgress+'%'}}/><small>{latest?latest.status.replaceAll('_',' '):'Not assigned'}</small></div>
       </div>
       <Link href={lessonHref}>{latest?'▶ Continue':'▶ Open'} </Link>
      </div>
     </section>
     <section className="agrs-shelf" id="series">
      <div className="agrs-section-heading"><h2>Explore by category</h2><span>{course.seriesCount} series · {course.publishedCount} published lessons</span></div>
      <nav className="agrs-category-tabs" aria-label="AgroEnglish content categories">
       <a href="#series" className="selected">▱ Series</a><a href="#field-visits">⌖ Field visits</a>
       <a href="#shorts">▷ Shorts</a><a href="#interviews">♧ Interviews</a>
      </nav>
      <div className="agrs-card-grid">
       <Link className="agrs-film-card" href="/courses/agroenglish/agriculture-101">
        <Tile src={media['a2-photo-story']||media['a2-mixed-farms']} alt="Agriculture 101 farm landscapes" kind="agrs-film-thumb" label="SERIES 1"/>
        <div><strong>Agriculture 101</strong><small>Foundations for English in agriculture</small><span>A1 → A2 · 1 pilot lesson</span></div>
       </Link>
       {agroItems.slice(0,3).map((item,i)=><Link key={item.title} href={item.href} className="agrs-film-card">
        <Tile src={item.thumb} alt={item.title} kind="agrs-film-thumb" label={item.badge}/>
        <div><strong>{item.title}</strong><small>{item.sub}</small><span>{i===0?'A1/A2 readings · 60 min':'Browse course'}</span></div>
       </Link>)}
      </div>
      {series.length>0&&<div className="agrs-available-series">
       <h3>Available curriculum</h3>
       {series.map(s=><div key={s.name}><strong>{s.name}</strong><span>{s.published} published · {s.count} total episodes · {s.levels.join(' / ')}</span></div>)}
      </div>}
     </section>
     <section className="agrs-field-strip" id="field-visits">
      <h2>Field visits & real work</h2>
      <p>Learn from Marina’s farm visits, then turn her observations into your own agricultural English.</p>
      <div className="agrs-field-cards">
       <Link href="/courses/agroenglish/agriculture-101#a1-reading"><Tile src={media['a1-farmwork']||media['a1-coffee']} alt="Coffee farm workers and Marina" kind="agrs-field-image"/><strong>Visit a coffee farm</strong></Link>
       <Link href="/courses/agroenglish/agriculture-101#a2-reading"><Tile src={media['a2-mixed-farms']} alt="A mixed crops farm visit" kind="agrs-field-image"/><strong>Compare different farms</strong></Link>
      </div>
     </section>
     <div className="agrs-empty-collections" id="shorts"><h2>Shorts & interviews</h2><p>Additional formats will appear when their lessons are published. Current progress counts only real completed work.</p></div>
    </div>
   </div>
   <footer className="agrs-footer"><span>AgroEnglish · Stark Learning</span><Link href="/courses">Choose another course ↗</Link></footer>
  </div>
 </div>;
}
