'use client';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {useState} from 'react';
import {browserClient} from '@/lib/supabase/browser';
import {PORTALS,PORTAL_ORDER,type PortalSlug,type CoursePreview,type CourseStatus} from '@/lib/course-portals';

type CatalogProps={catalog:CoursePreview[];status:CourseStatus};
const fmt=(n:number)=>new Intl.NumberFormat('en-US').format(n);
function courseData(catalog:CoursePreview[],slug:PortalSlug){
 return catalog.find(c=>c.slug===slug);
}
function PortalChip({course,slug}:{course?:CoursePreview;slug:PortalSlug}){
 if(!course)return <span className="portal-chip">In preparation</span>;
 return <span className={'portal-chip '+(course.publishedCount?'live':'concept')}>
  {course.publishedCount?course.publishedCount+' lessons published':'Portal concept'}</span>;
}
export function CourseChooseButton({course,status}:{course:CoursePreview;status:CourseStatus}){
 const router=useRouter();
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState('');
 const [isError,setError]=useState(false);
 const [chosen,setChosen]=useState(false);
 const enrolled=(status.enrolled||[]).includes(course.slug);
 const requested=status.pending?.slug===course.slug||chosen;
 async function choose(){
  if(busy)return;
  setBusy(true);setMessage('');
  const {data,error}=await browserClient().rpc('student_choose_course',{p_course:course.id});
  setBusy(false);
  if(error){setError(true);setMessage('Unable to save your choice: '+error.message);return;}
  setError(false);
  if(data?.status==='enrolled'){
   setMessage('You already have access to this course.');
  }else{
   setMessage('Course selected. Your teacher can approve access in the supervision workspace.');
   setChosen(true);
  }
  router.refresh();
 }
 return <div className="portal-choice-panel">
  {enrolled?<><p className="portal-choice-overline">YOUR ENROLLMENT</p>
   <h3>You're enrolled in this course.</h3>
   <p>Keep studying and submit the lessons assigned by your teacher.</p>
   <Link className="portal-choice-primary" href={course.slug==='agroenglish'?'/agroenglish':'/dashboard'}>Open my learning <span>↗</span></Link>
  </>:requested?<><p className="portal-choice-overline">CHOICE SAVED</p>
   <h3>You've selected {course.title}.</h3>
   <p>Your request is pending a teacher's approval. You can still preview other portals.</p>
   <span className="portal-choice-pending">Awaiting approval</span>
  </>:status.signedIn?<><p className="portal-choice-overline">CHOOSE YOUR PATH</p>
   <h3>Interested in {course.title}?</h3>
   <p>Save your choice. A teacher will confirm your enrollment; your current course remains unchanged.</p>
   <button className="portal-choice-primary" onClick={()=>void choose()} disabled={busy}>{busy?'Saving…':'Choose this course'} <span>↗</span></button>
  </>:<><p className="portal-choice-overline">YOUR LEARNING PATH</p>
   <h3>Want to study {course.title}?</h3><p>Sign in to select it and request access.</p>
   <Link className="portal-choice-primary" href={'/login?next='+encodeURIComponent('/courses/'+course.slug)}>Sign in to choose <span>↗</span></Link>
  </>}
  {message&&<p role="status" className={'portal-choice-message'+(isError?' error':'')}>{message}</p>}
 </div>;
}
export function CourseExplorer({catalog,status}:{catalog:CoursePreview[];status:CourseStatus}){
 const totalPublished=catalog.reduce((n,c)=>n+c.publishedCount,0);
 return <div className="course-explorer">
   <div className="course-explorer-hero"><p className="course-eyebrow">STARK LEARNING <span>/ THE COURSE LIBRARY</span></p>
    <h1>Where will English <em>take you?</em></h1>
    <p>One learning platform. Four ways to make English matter. Explore every portal before choosing the course that's right for you.</p>
    <div className="course-explorer-hero-stat"><span><strong>04</strong> pathways</span><span><strong>{fmt(totalPublished)}</strong> lessons currently published</span><span><strong>01</strong> learning journey, built around you</span></div>
   </div>
   <section className="course-explorer-heading">
    <div><p className="course-eyebrow">FIND YOUR EXPERIENCE</p><h2>Choose the English you want to use.</h2></div>
    <Link href="/dashboard" className="course-return-link">My learning ↗</Link>
   </section>
   {status.pending&&<div className="course-selection-note" role="status">Your current choice: <strong>{status.pending.title}</strong> — awaiting teacher approval. You can choose another course if your plans change.</div>}
   <div className="course-explorer-grid">{PORTAL_ORDER.map((slug,index)=>{
    const d=PORTALS[slug],c=courseData(catalog,slug);
    const enrolled=status.enrolled?.includes(slug);
    return <Link key={slug} className={'course-explorer-card portal-theme-'+slug} href={'/courses/'+slug}>
      <span className="course-card-top"><span className="course-card-number">0{index+1} / 04</span><span className="course-card-icon">{d.icon}</span></span>
      <span className="course-card-body"><span className="course-card-eyebrow">{d.subtitle}</span><strong>{d.label}</strong><span className="course-card-copy">{d.description}</span></span>
      <span className="course-card-foot"><span>{enrolled?'✓ Enrolled':status.pending?.slug===slug?'◷ Selected':d.audience}</span><span className="course-card-arrow">↗</span></span>
      <span className="course-card-published"><PortalChip course={c} slug={slug}/></span>
    </Link>;
   })}</div>
   <div className="course-explorer-explainer"><span className="course-explainer-icon">✧</span><div><strong>Your choice, your teacher, your progress.</strong>
      <p>Portal previews are open for exploration. Course access and assignments are managed through your teacher. Selecting a course sends a request; it does not replace an existing enrollment.</p></div></div>
 </div>;
}
export function PortalPreview({course,status}:{course:CoursePreview;status:CourseStatus}){
 const slug=course.slug as PortalSlug,d=PORTALS[slug];
 const concepts=course.seriesCount===0,active=course.publishedCount>0;
 const [tab,setTab]=useState<'series'|'skills'>('series');
 return <div className={'portal-preview portal-theme-'+slug}>
   <div className="portal-crumbs"><Link href="/courses">← All courses</Link><span>STARK LEARNING / {d.label}</span><Link href="/dashboard">My learning ↗</Link></div>
   <section className="portal-preview-hero">
    <div className="portal-preview-hero-content">
     <p className="portal-overline">{d.subtitle} <span>· {d.audience}</span></p>
     <span className="portal-brand-lockup">{d.icon} {d.label}</span>
     <h1>{d.headline}</h1><p>{d.description}</p>
     <div className="portal-preview-hero-actions"><a href="#portal-library" className="portal-hero-action">Explore the portal <span>↓</span></a>
      <Link href="/courses" className="portal-hero-action secondary">Compare courses ↗</Link></div>
    </div>
    <div className="portal-preview-art" aria-hidden="true"><span className="portal-preview-orbit a"/><span className="portal-preview-orbit b"/>
     <span className="portal-art-main">{d.icon}</span><span className="portal-art-caption">LEARN THROUGH EXPERIENCE</span></div>
   </section>
   <div className="portal-preview-stats">
    <div><strong>{course.seriesCount||'—'}</strong><span>Series in the LMS</span></div>
    <div><strong>{course.episodeCount||'—'}</strong><span>Curriculum episodes</span></div>
    <div><strong>{course.publishedCount}</strong><span>Lessons published</span></div>
    <div><strong>{active?'Live content':'Design preview'}</strong><span>Current release status</span></div>
   </div>
   <div className="portal-preview-content">
    <div className="portal-preview-main" id="portal-library">
     <div className="portal-heading-row"><div><p className="portal-overline">WELCOME TO YOUR LIBRARY</p>
      <h2>{d.stage}</h2><p>Modules presented as series, with purposeful tasks and teacher feedback.</p></div>
      <PortalChip course={course} slug={slug}/></div>
     <div className="portal-feature-banner"><div className="portal-feature-banner-icon">{d.icon}</div><div>
       <span>START WITH A REAL SITUATION</span><h3>Watch, notice, practice. Then try again.</h3>
       <p>Each learning experience connects language to an observable task. Your teacher reviews the evidence and guides the next attempt.</p></div></div>
     <div className="portal-tab-row" role="tablist" aria-label="Portal content">
      <button role="tab" aria-selected={tab==='series'} className={tab==='series'?'selected':''} onClick={()=>setTab('series')}>Series & modules</button>
      <button role="tab" aria-selected={tab==='skills'} className={tab==='skills'?'selected':''} onClick={()=>setTab('skills')}>What you'll practice</button>
     </div>
     {tab==='series'?<section aria-label="Course series">
      {concepts?<><p className="portal-work-in-progress">The series below are <strong>proposed pathways</strong>, not published episodes. This course portal is ready for its content to be developed.</p>
        <div className="portal-series-list">{d.paths.map((s,i)=><article className="portal-series-preview" key={s.title}>
          <span className="portal-series-cover"><i>{s.icon}</i><small>PREVIEW {String(i+1).padStart(2,'0')}</small></span>
          <div><span className="portal-series-meta">PROPOSED SERIES · {d.subtitle.toUpperCase()}</span><h3>{s.title}</h3>
           <p>{s.description}</p><small>No published episodes yet</small></div><span className="portal-series-end">Concept</span></article>)}</div>
       </>:<><div className="portal-series-list">{course.series.map((s,i)=><article key={s.name} className="portal-series-preview">
        <span className="portal-series-cover"><i>{d.paths[i%d.paths.length]?.icon||d.icon}</i><small>SERIES {String(i+1).padStart(2,'0')}</small></span>
        <div><span className="portal-series-meta">{s.levels.join(' · ')} · {s.count} EPISODES</span><h3>{s.name}</h3>
         <p>{s.published} available · {s.count-s.published} still in development</p>
         <div className="portal-inline-progress"><i style={{width:(s.count?100*s.published/s.count:0)+'%'}}/></div></div>
        <span className="portal-series-end">{s.published?'Published':'Planned'}</span>
       </article>)}</div>
       {active&&<div className="portal-published-list"><h3>Published episodes</h3><p>Existing LMS content. Open workspaces only when the lesson is assigned to you.</p>
        <div className="portal-published-grid">{course.publishedEpisodes.slice(0,6).map(x=><div className="portal-published-episode" key={x.code}>
         <span>{x.code} <b>{x.level}</b></span><strong>{x.title}</strong><small>{x.minutes} min · Published</small></div>)}</div>
       </div>}
      </>}
     </section>:<div className="portal-skills-panel"><p>Learning activities in this portal will build the communication you need for these situations:</p>
       <div>{d.focus.map((x,i)=><article key={x}><span>0{i+1}</span><strong>{x}</strong></article>)}</div>
      </div>}
    </div>
    <aside className="portal-preview-aside"><CourseChooseButton key={course.slug} course={course} status={status}/>
     <section className="portal-sidebar-card"><p className="portal-overline">YOUR LEARNING LOOP</p><h3>Progress you can demonstrate.</h3>
      <ol><li><span>01</span> Understand the situation</li><li><span>02</span> Produce your first response</li><li><span>03</span> Receive teacher feedback</li><li><span>04</span> Revise, transfer and improve</li></ol></section>
     <section className="portal-sidebar-card portal-themes"><p className="portal-overline">AT A GLANCE</p>
      {d.themes.map(x=><div key={x.label}><small>{x.label}</small><strong>{x.value}</strong></div>)}</section>
    </aside>
   </div>
   <div className="portal-preview-bottom"><Link href="/courses">Explore the other three portals ↗</Link></div>
 </div>;
}
