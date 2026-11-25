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
export function StreamingLessonFrame({slug,title,code,level,seriesName,seriesId,status,children,steps}:Props){
 const d=PORTALS[slug];
 const state=status==='finalized'?'Completed':status==='submitted'||status==='claimed'?'Awaiting teacher review':
  status==='revision_requested'?'Revision requested':'In progress';
 const back=seriesId?'/series/'+seriesId:'/courses/'+slug;
 const sequence=steps||flows[slug];
 return <main className={'svo-player streaming-lesson-frame streaming-lesson-'+slug}>
  <nav className="svo-back"><Link href={back}>← {seriesName||d.label}</Link>
   <span>STARK LEARNING · {level} · {state}</span></nav>
  <header className="svo-hero streaming-lesson-hero">
   <div><p>{d.label} / SERIES / {level}</p>
    <h1>{title}</h1>
    <div>Keep learning in context. Save your work and submit it for teacher feedback when ready.</div>
    <div className="streaming-lesson-meta"><span>{code}</span><span>{seriesName}</span>
     <span>{state}</span></div></div>
   <div className="streaming-lesson-symbol" aria-hidden="true">{d.icon}</div>
  </header>
  <section className="streaming-lesson-path" aria-label="Lesson learning sequence">
   <div className="streaming-lesson-path-heading"><strong>YOUR LEARNING PATH</strong>
    <small>The steps inside the lesson preserve their original activities and scoring.</small></div>
   <div className="streaming-lesson-path-items">{sequence.map((name,i)=>
    <div className="streaming-lesson-path-item" key={name}>
     <span>{String(i+1).padStart(2,'0')}</span><strong>{name}</strong>
    </div>)}</div>
  </section>
  <section className="streaming-lesson-activity" aria-label="Interactive learning activities">{children}</section>
  <footer className="svo-attribution"><Link href={back}>← Back to {seriesName||d.label}</Link>
   {' · '}Actual completion and estimated hours are awarded only after teacher finalization.</footer>
 </main>;
}
