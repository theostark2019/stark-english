import Link from 'next/link';
import {durationLabel} from '@/lib/stark-catalog';
import {PORTALS,type PortalSlug} from '@/lib/course-portals';

export type StreamingSeriesEpisode={
 episode_id:string;episode_code:string;episode_title:string;
 episode_level:string;episode_status:string;episode_minutes:number;
 assignmentId:string|null;status:string;
};
const visual:Record<PortalSlug,{eyebrow:string;tagline:string;about:string;icon:string;chapters:string[]}> = {
 'stark-english':{eyebrow:'EVERYDAY ENGLISH',tagline:'Speak with confidence, one episode at a time.',
  about:'Sentence patterns, real communication and teacher-guided practice.',icon:'✦',chapters:['Foundations','Practice','Communication']},
 agroenglish:{eyebrow:'ENGLISH FOR AGRICULTURE',tagline:'From the field to the world.',
  about:'Learn agricultural English through reading, vocabulary, fieldwork and communicative tasks.',icon:'🌱',chapters:['Agricultural foundations','Professional practice','Transfer']},
 'med-english':{eyebrow:'ENGLISH FOR MEDICINE',tagline:'Understand the language of healthcare.',
  about:'Use professional English to explain the human body, medical concepts and care.',icon:'✚',chapters:['Foundation','Clinical practice','Communication']},
 'business-english':{eyebrow:'PROFESSIONAL ENGLISH',tagline:'Make your English work for you.',
  about:'Practise professional communication through tasks and teacher-reviewed outcomes.',icon:'▥',chapters:['Core skills','Workplace practice','Transfer']}
};
function statusName(s:string){
 if(s==='finalized')return 'Completed';
 if(s==='claimed'||s==='submitted')return 'Awaiting teacher feedback';
 if(s==='revision_requested')return 'Revision requested';
 if(s==='draft')return 'In progress';
 if(s==='assigned')return 'Ready to start';
 return 'Not assigned';
}
export function StreamingSeriesDetail({slug,name,episodes}:{slug:PortalSlug;name:string;episodes:StreamingSeriesEpisode[]}){
 const theme=visual[slug],n=episodes.length;
 const completed=episodes.filter(e=>e.status==='finalized').length;
 const percent=n?Math.round(completed/n*100):0;
 const estimated=episodes.reduce((sum,e)=>sum+Math.max(e.episode_minutes,0),0);
 const earned=episodes.filter(e=>e.status==='finalized').reduce((sum,e)=>sum+Math.max(e.episode_minutes,0),0);
 const next=episodes.find(e=>e.assignmentId&&e.status!=='finalized'&&e.episode_status==='published');
 const nextHref=next?'/lessons/'+next.assignmentId:'#episodes';
 const levels=[...new Set(episodes.map(e=>e.episode_level).filter(Boolean))].join(' · ');
 return <main className={'scd-page shared-series-page shared-series-'+slug}>
  <div className="scd-shell">
   <nav className="scd-breadcrumb" aria-label="Breadcrumb">
    <Link href={'/courses/'+slug}>← {PORTALS[slug].label}</Link><span>/</span>
    <Link href={'/courses/'+slug+'#series'}>Series</Link><span>/</span><span>{name}</span>
   </nav>
   <section className="scd-feature">
    <div className="scd-feature-ambient" aria-hidden="true"/>
    <div className="scd-feature-copy">
     <div className="scd-feature-identity"><span className="scd-mini-mark">S</span> STARK LEARNING <b>ORIGINAL SERIES</b></div>
     <div className="scd-feature-type"><span className="scd-live-dot"/> {theme.eyebrow} · {levels||'CEFR'}</div>
     <h1>{name}</h1><h2>{theme.tagline}</h2><p>{theme.about}</p>
     <div className="scd-feature-tags"><span>{n} episodes</span><span>{durationLabel(estimated)} estimated</span>
      <span>{episodes.filter(e=>e.episode_status==='published').length} available</span></div>
     <div className="scd-feature-actions">
      {next?<Link className="scd-play" href={nextHref}>▶ {next.status==='draft'?'Continue':'Start'} episode</Link>:
       <a className="scd-play" href="#episodes">Browse episodes ↓</a>}
      <a className="scd-secondary-action" href="#learning-results">What you'll learn</a>
     </div>
     {!next&&<small className="scd-preview-note">Assigned episodes appear here when your teacher adds them to your learning plan.</small>}
    </div>
    <div className="scd-feature-visual" aria-hidden="true">
     <div className="scd-poster-frame"><div className="scd-poster-top">THE STARK LEARNING COLLECTION</div>
      <div className="scd-poster-art"><span className="scd-poster-orbit orbit-one"/>
       <span className="scd-poster-orbit orbit-two"/><span className="scd-poster-mono">{theme.icon}</span>
       <div className="scd-poster-logo">{theme.icon} {name.split(' ').slice(0,2).join(' ')}</div>
      </div><div className="scd-poster-bottom"><span>ENGLISH FOR REAL LIFE</span><strong>{levels||'CEFR'}</strong></div>
     </div>
    </div>
   </section>
   <section className="scd-metrics" aria-label="Series progress">
    <div className="scd-metric main-metric"><div className="scd-progress-ring">
     <svg viewBox="0 0 116 116" aria-hidden="true" style={{transform:'rotate(-90deg)'}}>
      <circle cx="58" cy="58" r="48" className="scd-ring-bg"/>
      <circle cx="58" cy="58" r="48" className="scd-ring-fill" strokeDasharray={2*Math.PI*48}
       strokeDashoffset={2*Math.PI*48*(1-percent/100)}/></svg>
     <div><strong>{percent}%</strong><span>COMPLETE</span></div></div>
     <div><small>SERIES COMPLETION</small><strong>{completed} <span>/ {n} episodes</span></strong>
      <p>Teacher-finalized lessons count as complete.</p></div>
    </div>
    <div className="scd-metric"><small>EXPECTED STUDY</small><strong>{durationLabel(estimated)}</strong>
     <p>Planned duration for the full series</p></div>
    <div className="scd-metric"><small>COMPLETED WORKLOAD</small><strong>{durationLabel(earned)}</strong>
     <p>Estimated duration of finalized episodes</p></div>
    <div className="scd-metric"><small>READY TO STUDY</small>
     <strong>{episodes.filter(e=>e.assignmentId).length} <span>assigned</span></strong>
     <p>Lessons available in your learning plan</p></div>
   </section>
   <div className="scd-progress-foot"><div className="scd-progress-descriptor">
    <span>{completed} of {n} completed</span><span>{durationLabel(Math.max(0,estimated-earned))} planned workload remaining</span></div>
    <div className="scd-progress-track"><span style={{width:percent+'%'}}/></div></div>
   <div className="scd-content">
    <div className="scd-maincol">
     <section className="scd-outcomes" id="learning-results"><div className="scd-section-kicker">YOUR LEARNING JOURNEY</div>
      <h2>Learn, practise and demonstrate</h2>
      <div className="scd-outcome-grid">{[
       ['01','Explore the language','Read or listen to real examples and observe how the language works.'],
       ['02','Practise in context','Work through the lesson activities, keeping the original exercises.'],
       ['03','Create your own response','Use your own situations, vocabulary and professional experiences.'],
       ['04','Receive feedback','Submit evidence and improve it with your teacher.']
      ].map(x=><div key={x[0]} className="scd-outcome"><div className="scd-outcome-num">{x[0]}</div>
       <div><strong>{x[1]}</strong><small>{x[2]}</small></div></div>)}</div>
     </section>
     <section className="scd-episodes" id="episodes">
      <div className="scd-section-heading"><div><div className="scd-section-kicker">SERIES PLAYLIST</div>
       <h2>Episodes</h2><p>Select an assigned episode to continue learning. Your teacher controls assignments.</p></div>
       <span className="scd-episode-total">{n} episodes</span></div>
      <section className="scd-chapter"><div className="scd-chapter-header">
       <div className="scd-chapter-index">01</div><div><p>SEASON 01</p><h3>{name}</h3>
       <small>{n} episodes · {durationLabel(estimated)} estimated</small></div>
       <div className="scd-chapter-count">{completed} / {n}<span>complete</span></div></div>
       <div className="scd-episode-list">{episodes.map((e,i)=>{
        const available=e.episode_status==='published';
        const actionable=available&&!!e.assignmentId;
        return <article key={e.episode_id} className={'scd-episode'+(e.status==='finalized'?' scd-unit-completed':'')}>
         <div className="scd-episode-thumb"><span>{i===0?'PREMIERE':'EPISODE'}</span>
          <strong>{String(i+1).padStart(2,'0')}</strong><small>{e.episode_level}</small></div>
         <div className="scd-episode-copy"><div className="scd-episode-meta">
          <span>{e.episode_code}</span><span>·</span><span>{durationLabel(e.episode_minutes)}</span></div>
          <h4>{e.episode_title}</h4>
          <p>{available?'Read, practise and complete the lesson with teacher feedback.':'This episode is still in preparation.'}</p>
          <div className={'scd-episode-status '+(e.status==='finalized'?'status-complete':'status-locked')}>
           {e.status==='finalized'?'✓':'○'} {statusName(e.status)}</div></div>
         <div className="scd-episode-actions">{actionable?
          <Link className="scd-episode-watch" href={'/lessons/'+e.assignmentId}>▶ {e.status==='finalized'?'Review':e.status==='draft'?'Continue':'Open'}</Link>:
          <span className="scd-episode-unavailable">{available?'Awaiting assignment':'Coming later'}</span>}</div>
        </article>;
       })}</div></section>
     </section>
    </div>
    <aside className="scd-sidebar">
     <section className="scd-sidebar-card"><div className="scd-section-kicker">ABOUT THIS SERIES</div>
      <h3>One series, one learning journey</h3><p>{theme.about}</p>
      <p>Course progress, expected hours and reviewed submissions remain linked to your student account.</p></section>
     <section className="scd-sidebar-card"><div className="scd-section-kicker">HOW IT WORKS</div>
      <div className="scd-how-line"><strong>01</strong><p>Begin the episode assigned by your teacher.</p></div>
      <div className="scd-how-line"><strong>02</strong><p>Complete the activities, save and submit your work.</p></div>
      <div className="scd-how-line"><strong>03</strong><p>Once reviewed and finalized, the episode is checked off.</p></div>
     </section>
     <section className="scd-sidebar-card"><h3>Explore the course</h3><Link href={'/courses/'+slug}>← Back to {PORTALS[slug].label}</Link></section>
    </aside>
   </div>
  </div>
 </main>;
}
