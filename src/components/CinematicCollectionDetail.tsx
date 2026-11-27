import Link from 'next/link';
import {CollectionKnowledgeCheck} from '@/components/CollectionKnowledgeCheck';
import {collectionStage,detailUnitStatus,durationLabel,STARK_SECTION_LABELS,
 type CollectionProgress,type CollectionUnitProgress,type StarkCatalogSource,
 type StarkCollectionDetail,type StarkCatalogUnit} from '@/lib/stark-catalog';

const chapters=[
 'First meaningful sentences',
 'Everyday communication',
 'Describing people and places',
 'Questions and interaction',
 'Past events and independent transfer'
];
const learningOutcomes=[
 {name:'Build meaningful sentences',sub:'Subjects, actions, objects and familiar vocabulary'},
 {name:'Talk about everyday life',sub:'Daily routines, preferences and habits'},
 {name:'Describe people and situations',sub:'Be: am, is, are · statements and questions'},
 {name:'Ask purposeful questions',sub:'Do, does and WH questions in communication'},
 {name:'Talk about what happened',sub:'Past Simple statements, negatives and questions'}
];
function ProgressRing({percent}:{percent:number}){
 const radius=48,circ=2*Math.PI*radius;
 return <div className="scd-progress-ring" aria-label={percent+' percent completed'}>
  <svg viewBox="0 0 116 116" aria-hidden="true" focusable="false">
   <circle cx="58" cy="58" r={radius} className="scd-ring-bg"/>
   <circle cx="58" cy="58" r={radius} className="scd-ring-fill"
    strokeDasharray={circ} strokeDashoffset={circ*(1-percent/100)}/>
  </svg>
  <div><strong>{percent}%</strong><span>COMPLETE</span></div>
 </div>;
}
function unitLink(slug:string,u:StarkCatalogUnit,record:CollectionUnitProgress|null){
 if(record?.assignmentId)return '/lessons/'+record.assignmentId;
 if(slug!=='svo')return null;
 return u.code==='SVO-L01'?'/courses/stark-english/svo/lesson-1':
   '/courses/stark-english/svo/'+u.code;
}
function statusTone(s:CollectionUnitProgress['status']){
 if(s==='completed')return 'complete';
 if(s==='revision_requested')return 'revision';
 if(s==='in_progress')return 'ongoing';
 if(s==='awaiting_review')return 'waiting';
 if(s==='assigned')return 'assigned';
 return 'locked';
}
function featureName(c:StarkCollectionDetail){
 if(c.slug==='svo')return 'MASTER THE BASICS OF ENGLISH';
 if(c.slug==='dvc')return 'LEARN WITH STORIES, SCENES & DIALOGUE';
 return c.description.toUpperCase();
}
export function CinematicCollectionDetail({
 c,progress,sources
}:{c:StarkCollectionDetail;progress:CollectionProgress;sources:StarkCatalogSource[]}){
 const unitStatuses=new Map((progress.units||[]).map(x=>[x.code,x]));
 const units=c.units||[],total=progress.totalUnits||units.length;
 const done=progress.enrolled?progress.completedUnits:0;
 const percent=total?Math.round(done/total*100):0;
 const earned=progress.enrolled?progress.earnedMinutes:0;
 const totalTime=progress.expectedMinutes;
 const next=units.find(u=>{
  const p=unitStatuses.get(u.code);
  return p?.assignmentId&&p.status!=='completed';
 });
 const allDone=total>0&&done===total;
 const featureHref=next?unitLink(c.slug,next,unitStatuses.get(next.code)||null):
  c.slug==='svo'?'/courses/stark-english/svo/lesson-1':'#episodes';
 const buttonText=next?'▶ '+(unitStatuses.get(next.code)?.status==='in_progress'?'Continue lesson':'Open assigned lesson'):
  allDone?'✓ Review your episodes':c.slug==='svo'?'▶ Preview Episode 1':'Browse the curriculum';
 const grouping=new Map<number,StarkCatalogUnit[]>();
 for(const u of units){
  const key=u.block||1;
  grouping.set(key,[...(grouping.get(key)||[]),u]);
 }
 const sourceMap=new Map(sources.map(s=>[s.code,s]));
 const chapterGroups=[...grouping].sort((a,b)=>a[0]-b[0]);
 const ctaIsPreview=!next&&c.slug==='svo';
 const oneLine=(c.slug==='svo'?'15 lessons · 5 reviews · 5 chapters':
  c.slug==='dvc'?'30 lessons · 10 reviews':c.expectedLessons?c.expectedLessons+' proposed lessons':'Curated learning experience');
 return <main className="scd-page">
  <div className="scd-shell">
   <nav className="scd-breadcrumb" aria-label="Breadcrumb">
    <Link href="/courses/stark-english">← Stark English</Link>
    <span>/</span><Link href={'/courses/stark-english#'+(c.kind==='movie'?'filmes':c.kind==='short'?'shorts':c.kind==='interview'?'entrevistas':'series')}>{STARK_SECTION_LABELS[c.kind]}</Link>
    <span>/</span><span>{c.title}</span>
   </nav>
   <section className={'scd-feature scd-feature-'+c.kind}>
    <div className="scd-feature-ambient" aria-hidden="true"/>
    <div className="scd-feature-copy">
     <div className="scd-feature-identity"><span className="scd-mini-mark">S</span> STARK LEARNING <b>{c.kind==='series'?'ORIGINAL SERIES':'LEARNING COLLECTION'}</b></div>
     <div className="scd-feature-type"><span className="scd-live-dot"/> {STARK_SECTION_LABELS[c.kind].toUpperCase()} · {c.cefr} · {collectionStage(c)}</div>
     <h1>{c.title}</h1>
     <h2>{featureName(c)}</h2>
     <p>{c.slug==='svo'
       ?'From your first English sentence to a confident conversation. Build vocabulary, practice meaningful patterns, and develop independence one episode at a time.'
       :c.description}</p>
     <div className="scd-feature-tags">
      <span>{oneLine}</span>{totalTime>0&&<span>{durationLabel(totalTime)} estimated</span>}
      {c.status==='published'&&<span className="scd-live">AVAILABLE</span>}
     </div>
     <div className="scd-feature-actions">
      <Link className="scd-play" href={featureHref||'#episodes'}>{buttonText}</Link>
      <Link className="scd-secondary-action" href="#episodes">View episodes ↓</Link>
     </div>
     {ctaIsPreview&&<small className="scd-preview-note">Preview only. Your teacher must assign an episode for progress to be saved.</small>}
     {!progress.enrolled&&<small className="scd-preview-note">
      {progress.signedIn?'Progress and self-checks are saved for enrolled Stark English students.':
      <> <Link href="/login">Sign in</Link> to see your personal completion data.</>}
     </small>}
    </div>
    <div className="scd-feature-visual" aria-hidden="true">
      <div className="scd-poster-frame">
       <div className="scd-poster-top">THE STARK ENGLISH COLLECTION</div>
       <div className="scd-poster-art">
        <span className="scd-poster-orbit orbit-one"/><span className="scd-poster-orbit orbit-two"/>
        <span className="scd-poster-mono">{c.slug==='svo'?'S':c.slug==='dvc'?'D':'✦'}</span>
        <div className="scd-poster-logo">{c.slug==='svo'?'S · V · O':c.slug==='dvc'?'D V C':'STARK'}</div>
        <span className="scd-poster-cross">✧</span>
       </div>
       <div className="scd-poster-bottom"><span>ENGLISH AS IT IS USED</span><strong>{c.cefr}</strong></div>
      </div>
     </div>
   </section>

   {total>0&&<section className="scd-metrics" aria-label="Course learning progress">
     <div className="scd-metric main-metric"><ProgressRing percent={percent}/><div>
       <small>COURSE COMPLETION</small><strong>{done} <span>/ {total} episodes</span></strong>
       <p>{progress.enrolled?'Confirmed when a teacher finalizes a lesson.':'Your progress appears after enrollment.'}</p></div></div>
     <div className="scd-metric"><small>EXPECTED STUDY HOURS</small>
       <strong>{durationLabel(totalTime)}</strong><p>Planned learning time for the entire collection</p></div>
     <div className="scd-metric"><small>HOURS CREDITED</small>
       <strong>{durationLabel(earned)}</strong><p>Only after teacher-confirmed completion</p></div>
     <div className="scd-metric"><small>READY TO STUDY</small>
       <strong>{progress.enrolled?progress.assignedUnits:0} <span>assigned</span></strong>
       <p>Lessons your teacher has added to your learning plan</p></div>
   </section>}
   {total>0&&<div className="scd-progress-foot">
    <div className="scd-progress-descriptor"><span>{done} of {total} complete</span><span>{durationLabel(Math.max(0,totalTime-earned))} of planned learning credit remaining</span></div>
    <div className="scd-progress-track"><span style={{width:percent+'%'}}/></div>
   </div>}

   <div className="scd-content">
    <div className="scd-maincol">
     {c.slug==='svo'&&<section className="scd-outcomes" id="results">
      <div className="scd-section-kicker">THE LEARNING EXPERIENCE</div><h2>What you’ll be able to do</h2>
      <p>Five connected chapters build your language from sentence patterns to independent communication.</p>
      <div className="scd-outcome-grid">{learningOutcomes.map((o,i)=><div className="scd-outcome" key={o.name}>
       <div className="scd-outcome-num">{String(i+1).padStart(2,'0')}</div>
       <div><strong>{o.name}</strong><small>{o.sub}</small></div></div>)}</div>
     </section>}
     <section className="scd-episodes" id="episodes">
      <div className="scd-section-heading"><div><div className="scd-section-kicker">YOUR COURSE PLAYLIST</div>
       <h2>Episodes & chapters</h2>
       <p>{c.slug==='svo'?'Three lessons, then a review. Each chapter prepares you for the next.':
        'Follow your teacher’s assignments and collect completion credits as you progress.'}</p></div>
       <span className="scd-episode-total">{total} episodes</span></div>
      {chapterGroups.length?chapterGroups.map(([chapter,group])=>{
       const groupDone=group.filter(u=>unitStatuses.get(u.code)?.status==='completed'&&progress.enrolled).length;
       const groupMinutes=group.reduce((n,u)=>n+(unitStatuses.get(u.code)?.minutes||0),0);
       return <section className="scd-chapter" key={chapter} aria-labelledby={'chapter-'+chapter}>
        <div className="scd-chapter-header">
         <div className="scd-chapter-index">{String(chapter).padStart(2,'0')}</div>
         <div><p>CHAPTER {String(chapter).padStart(2,'0')}</p>
          <h3 id={'chapter-'+chapter}>{c.slug==='svo'?chapters[chapter-1]||'Chapter '+chapter:
           'Episodes '+String((chapter-1)*4+1).padStart(2,'0')+'–'+String(chapter*4).padStart(2,'0')}</h3>
          <small>{group.length} episodes · {durationLabel(groupMinutes)} estimated</small></div>
         <div className="scd-chapter-count">{groupDone} / {group.length} <span>complete</span></div>
        </div>
        <div className="scd-episode-list">{group.map((u,index)=>{
         const unit=unitStatuses.get(u.code)||null;
         const status=progress.enrolled?(unit?.status||'not_assigned'):'not_assigned';
         const href=unitLink(c.slug,u,unit);
         const titled=u.workingTitle;
         const watchLabel=status==='completed'?'Review':
          status==='in_progress'?'Continue':
          status==='awaiting_review'?'View submitted work':
          status==='revision_requested'?'Revise':
          status==='assigned'?'Start':href?'Preview':'Not yet available';
         const source=sourceMap.get(u.code);
         return <article key={u.code} className={'scd-episode scd-unit-'+status}>
          <div className={'scd-episode-thumb'+(u.kind==='review'?' scd-review-thumb':'')}>
           <span>{u.kind==='review'?'REVIEW':'EPISODE'}</span>
           <strong>{u.kind==='review'?'✓':String(Number(u.code.slice(-2))).padStart(2,'0')}</strong>
           <small>{u.cefr}</small></div>
          <div className="scd-episode-copy">
           <div className="scd-episode-meta"><span>{u.kind==='review'?'Assessment':'Learning episode'}</span>
            <span>·</span><span>{durationLabel(unit?.minutes||0)}</span><span>·</span><span>{u.code}</span></div>
           <h4>{titled}</h4>
           <p>{u.outcome}</p>
           <div className={'scd-episode-status status-'+statusTone(status)}>
            <span>{status==='completed'?'✓':status==='awaiting_review'?'◷':status==='not_assigned'?'○':'●'}</span>
            {detailUnitStatus(status)}</div>
           {source&&<details className="scd-source-detail"><summary>Teacher · original Notion task</summary>
            {source.source_instructions&&<p>{source.source_instructions}</p>}
            {source.source_deliverable&&<p><strong>Evidence:</strong> {source.source_deliverable}</p>}
            {source.source_completion&&<p><strong>Done when:</strong> {source.source_completion}</p>}
            {source.source_url&&<a href={source.source_url} target="_blank" rel="noopener noreferrer">Open source record ↗</a>}
           </details>}
          </div>
          <div className="scd-episode-actions">
           {href?<Link href={href} className={unit?.assignmentId?'scd-episode-watch':'scd-episode-preview'}>
            <span aria-hidden="true">▶</span> {watchLabel}</Link>:
            <span className="scd-episode-unavailable">Coming later</span>}
          </div>
         </article>;
        })}</div>
       </section>;
      }):<div className="scd-empty-catalog">
       <span>✧</span><h3>Curated collection in development</h3>
       <p>The curriculum description is ready; its individual learning episodes will appear after they’re reviewed and published.</p>
       <Link href="/courses/stark-english">Browse Stark English ↗</Link></div>}
     </section>
    </div>
    <aside className="scd-sidebar">
     <CollectionKnowledgeCheck slug={c.slug} skills={progress.skills||[]}
      enabled={progress.signedIn&&progress.enrolled} signedIn={progress.signedIn}/>
     <section className="scd-sidebar-card">
      <div className="scd-section-kicker">HOW PROGRESS WORKS</div>
      <h3>Every episode counts when completed.</h3>
      <div className="scd-how-line"><strong>01</strong><p>Open a lesson your teacher assigned, and work through the activities.</p></div>
      <div className="scd-how-line"><strong>02</strong><p>Submit your work. Your teacher reviews it and can request improvements.</p></div>
      <div className="scd-how-line"><strong>03</strong><p>When the teacher finalizes it, the episode is checked off and its estimated duration is credited.</p></div>
      <p className="scd-hours-footnote">Credited hours measure the expected learning workload, not the actual time recorded on a stopwatch. Retaking an episode does not add credits twice.</p>
     </section>
     {c.slug==='svo'&&<section className="scd-sidebar-card">
      <div className="scd-section-kicker">SVO LEARNING METHOD</div>
      <h3>A complete learning cycle</h3>
      <p>Vocabulary check → Flashcards → Context → Express it → Substitution → Grammar → Chunks → Practice → Dictation.</p>
      <p>Weekly vocabulary guideline: <strong>up to 30 unfamiliar items</strong>, with cumulative review across the Series.</p>
     </section>}
     <section className="scd-sidebar-card">
      <div className="scd-section-kicker">YOUR STARK ENGLISH HOME</div>
      <h3>One connected learning record</h3>
      <p>Achievements, evidence and estimated credit hours feed your Stark English course dashboard.</p>
      <Link href="/courses/stark-english">Back to your course dashboard ↗</Link>
     </section>
    </aside>
   </div>
  </div>
 </main>;
}
