import Link from 'next/link';
import {serverClient} from '@/lib/supabase/server';
import {agroMediaManifest} from '@/lib/agro-media';
import {Agro101ReadingPlayer} from '@/components/Agro101ReadingPlayer';

const steps=[
 {n:1,title:'Reading A1',desc:'Meet Marina and Paulo on a coffee farm. Build a simple introduction.',anchor:'#a1-reading',icon:'▤'},
 {n:2,title:'Reading A2',desc:'Compare coffee, soybean and corn farms. Observe work and resources.',anchor:'#a1-reading',icon:'▣'},
 {n:3,title:'Vocabulary',desc:'Learn up to 28 agricultural words through guided, cumulative flashcards.',anchor:'#vocabulary',icon:'▤'},
 {n:4,title:'Substitution',desc:'Make meaningful sentences using crops, farm roles and work routines.',anchor:'#workflow',icon:'⇄'},
 {n:5,title:'Word families',desc:'Connect words such as plan, planning and planned.',anchor:'#workflow',icon:'✳'},
 {n:6,title:'First production',desc:'Write about a farm visit, its crops, and the people who work there.',anchor:'#workflow',icon:'✎'},
 {n:7,title:'Transfer',desc:'Describe an agricultural situation connected to your own experience.',anchor:'#workflow',icon:'↗'},
 {n:8,title:'Feedback',desc:'Submit your evidence for teacher feedback and a revision if needed.',anchor:'#workflow',icon:'◎'}
];
export const dynamic='force-dynamic';
export default async function Agro101Hub(){
 const sb=await serverClient();
 const [{data:{user}},mediaData,{data:episode}]=await Promise.all([
  sb.auth.getUser(),agroMediaManifest(sb),
  sb.from('episodes').select('id,code,title,level,minutes,status').eq('code','AGRO-A1-01').maybeSingle()
 ]);
 const media=mediaData;
 let assignmentId:string|null=null,status:string|null=null;
 if(user&&episode){
  const {data:assignment}=await sb.from('lesson_assignments').select('id')
   .eq('student_id',user.id).eq('episode_id',episode.id).order('created_at',{ascending:false}).limit(1).maybeSingle();
  if(assignment){
   assignmentId=assignment.id;
   const {data:attempt}=await sb.from('lesson_attempts').select('status')
    .eq('assignment_id',assignment.id).order('created_at',{ascending:false}).limit(1).maybeSingle();
   status=attempt?.status||'assigned';
  }
 }
 const action=assignmentId?'/lessons/'+assignmentId:'/courses/agroenglish/agriculture-101/activities';
 return <div className="agrs-page agrs-lesson-hub"><div className="agrs-shell">
  <nav className="agrs-breadcrumb"><Link href="/courses/agroenglish">← AgroEnglish</Link><span>/</span>
   <Link href="/courses/agroenglish#series">Series 1</Link><span>/</span><strong>Agriculture 101</strong></nav>
  <div className="agrs-lesson-hero">
   {media.hero?<img src={media.hero} alt="Marina meets farmers in a farm workshop" />:<div className="agrs-lesson-hero-placeholder" aria-hidden="true">🌾</div>}
   <div className="agrs-lesson-gradient"/>
   <div className="agrs-lesson-hero-copy">
    <span className="agrs-kicker">AGROENGLISH · SERIES 1 · LESSON 1 · A1/A2</span>
    <h1>Agriculture 101</h1><h2>My Place in Agriculture</h2>
    <p>Visit different farms, observe coffee, soybeans and corn, and learn to describe work and agriculture in English.</p>
    <div className="agrs-lesson-metadata"><span>60 min estimated</span><span>Two reading levels</span><span>8 activities</span>
      <span>{status==='finalized'?'✓ Finalized':status==='submitted'?'Awaiting review':assignmentId?'Assigned':'Preview mode'}</span></div>
    <div className="agrs-hero-actions"><Link className="agrs-main-button" href={action}>
      ▶ {assignmentId?'Continue assigned lesson':'Start interactive preview'}</Link>
     <a className="agrs-outline-button" href="#workflow">View lesson overview ↓</a></div>
    {!assignmentId&&<small className="agrs-hub-preview-hint">Preview work is not submitted or credited. An enrolled student needs a teacher assignment to save progress.</small>}
   </div>
  </div>
  <section className="agrs-hub-meta">
   <div><span className="agrs-hub-icon">◷</span><div><strong>{status==='finalized'?'✓ Completed':'60 minutes'}</strong><small>{status==='finalized'?'Teacher-confirmed completion':'Estimated learning workload'}</small></div></div>
   <div><span className="agrs-hub-icon">◇</span><div><strong>A1 with A2 extension</strong><small>Simple and detailed versions</small></div></div>
   <div><span className="agrs-hub-icon">◎</span><div><strong>{status==='finalized'?'100%':'Not yet finalized'}</strong><small>Completion requires teacher feedback</small></div></div>
  </section>
  <Agro101ReadingPlayer media={media}/>
  <div className="agrs-lesson-layout" id="workflow">
   <aside className="agrs-hub-aside">
    <section className="agrs-hub-panel" id="field-notes">
     <span className="agrs-kicker">MARINA'S FIELD NOTES</span><h2>What do we learn?</h2>
     <div className="agrs-notes">
      {['Visit the coffee farm','Observe soybean and corn production','Ask about the growing season','Describe teamwork and shared resources'].map(t=><div key={t}><span>✓</span>{t}</div>)}
     </div>
     {media['a2-field-notes']?<img src={media['a2-field-notes']} alt="Marina's notes and agricultural field visit" loading="lazy" />:
      <div className="agrs-notes-placeholder" aria-hidden="true">🌱</div>}
    </section>
    <section className="agrs-hub-panel"><span className="agrs-kicker">LESSON OBJECTIVES</span><h3>Use English beyond the classroom</h3>
     <p>Introduce yourself, describe crops and farming roles, ask basic questions, and connect classroom vocabulary to actual agricultural work.</p>
    </section>
   </aside>
   <main className="agrs-hub-main">
     <div className="agrs-section-heading"><div><span className="agrs-mini-kicker">WORK THROUGH THE LESSON</span>
      <h2>Activities & learning steps</h2><p>Two readings lead into vocabulary, guided language practice and teacher-reviewed transfer.</p></div></div>
     <div className="agrs-hub-steps">
      {steps.map(step=><article key={step.n} className="agrs-step-card">
       <span className="agrs-step-number">{step.n}</span><div className="agrs-step-icon">{step.icon}</div>
       <div><h3>{step.title}</h3><p>{step.desc}</p></div>
       <Link href={step.n<=2?step.anchor:action} aria-label={'Open '+step.title}>{step.n<=2?'See reading':'▶ Start'}</Link>
      </article>)}
     </div>
     <div className="agrs-hub-final"><div><h2>Ready to practice?</h2>
      <p>The lesson uses the existing Stark Learning autosave, written submissions, audio recording, teacher feedback and review workflow.</p></div>
      <Link href={action}>▶ {assignmentId?'Go to my lesson':'Explore activities'}</Link></div>
   </main>
  </div>
  <footer className="agrs-footer"><Link href="/courses/agroenglish">← AgroEnglish home</Link><span>Stark Learning · Agriculture 101</span></footer>
 </div></div>;
}
