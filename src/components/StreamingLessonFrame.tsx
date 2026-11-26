import Link from 'next/link';
import {PORTALS,type PortalSlug} from '@/lib/course-portals';

type Props={
 slug:PortalSlug;title:string;code:string;level:string;seriesName:string;seriesId:string|null;
 status:string;children:React.ReactNode;steps?:string[];
};
const flows:Record<PortalSlug,string[]>={
 'stark-english':['Explore','Practise','Create','Reflect','Submit'],
 agroenglish:['Read & understand','Vocabulary','Substitution','Word families','First production','Transfer','Feedback'],
 'med-english':['Understand','Build language','Guided practice','Production','Submit'],
 'business-english':['Explore context','Identify language','Practise','Apply to work','Feedback']
};
const stateLabel=(status:string)=>{
 if(status==='finalized')return 'Completed';
 if(status==='submitted'||status==='claimed')return 'Awaiting teacher review';
 if(status==='revision_requested')return 'Revision requested';
 return 'In progress';
};
export function StreamingLessonFrame({slug,title,code,level,seriesName,seriesId,status,children,steps}:Props){
 const portal=PORTALS[slug];
 const back=seriesId?'/series/'+seriesId:'/courses/'+slug;
 const sequence=steps||flows[slug];
 const finalized=status==='finalized';
 const answered=status==='submitted'||status==='claimed';
 return <main className={'svo-player streaming-lesson-frame streaming-lesson-'+slug}>
  <nav className="svo-back" aria-label="Course navigation">
   <Link href={back}>← {seriesName||portal.label}</Link>
   <span>{portal.label} · {level} · {stateLabel(status)}</span>
  </nav>
  <header className="svo-hero streaming-lesson-hero">
   <div><p>{portal.label} / {seriesName||'SERIES'} / {level}</p>
    <h1>{title}</h1>
    <div>Explore the lesson, complete its activities and submit your work for teacher feedback.</div>
    <div className="streaming-lesson-meta">
     <span>{code}</span><span>{seriesName||'Learning series'}</span>
     <span>{stateLabel(status)}</span></div>
   </div>
   <div className="streaming-lesson-symbol" aria-hidden="true">{portal.icon}</div>
  </header>
  <div className="streaming-player-info">
   <div><small>EPISODE STATUS</small><strong>{finalized?'✓ Teacher finalized':answered?'◷ Under review':status==='revision_requested'?'↻ Revision requested':'▶ Learning in progress'}</strong>
    <p>{finalized?'Your completion is recorded.':answered?'Your submitted work is waiting for feedback.':
     'Your responses are saved by the lesson engine as you work.'}</p></div>
   <div><small>LEARNING PATH</small><strong>{sequence.length} stages</strong>
    <p>The learning stages and exercises stay exactly as defined in this course.</p></div>
   <div><small>TEACHER REVIEW</small><strong>{finalized?'Complete':answered?'Pending':'After submission'}</strong>
    <p>Completion credit is awarded only after the teacher finalizes the lesson.</p></div>
  </div>
  <div className="streaming-lesson-grid">
   <aside className="streaming-lesson-sidebar" aria-label="Lesson learning map">
    <div className="streaming-lesson-sidebar-title">YOUR LEARNING PATH</div>
    <p>Use the activities on the right in their original sequence.</p>
    <ol>{sequence.map((name,i)=><li key={name}><span>{String(i+1).padStart(2,'0')}</span>
     <strong>{name}</strong></li>)}</ol>
    <a className="streaming-lesson-focus" href="#lesson-activity">Go to activities ↓</a>
    <Link className="streaming-lesson-back" href={back}>← All episodes</Link>
   </aside>
   <section className="streaming-lesson-activity" id="lesson-activity" aria-label="Interactive learning activities">
    {children}
   </section>
  </div>
  <footer className="svo-attribution"><Link href={back}>← Back to {seriesName||portal.label}</Link>
   {' · '}The original course exercises, submissions and teacher feedback are preserved.</footer>
 </main>;
}
