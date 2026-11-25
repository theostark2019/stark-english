export const dynamic='force-dynamic';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {serverClient} from '@/lib/supabase/server';
import {collectionStage,collectionUnits,STARK_SECTION_LABELS,
 type StarkCatalogSource,type StarkCollectionDetail,type StarkCatalogUnit} from '@/lib/stark-catalog';

const phaseNames=[
 'Foundation · First meaningful sentences',
 'Everyday practice · Daily routines',
 'Description · Identification and questions',
 'Interaction · Asking and clarifying',
 'Transfer · Greater independence'
];
function unitLabel(u:StarkCatalogUnit){
 return u.kind==='review'?'Review '+Number(u.code.slice(-2)):u.code;
}
export default async function StarkCollection({params}:{
 params:Promise<{collection:string}>}){
 const {collection}=await params;
 if(!/^[a-z0-9-]{2,80}$/.test(collection))notFound();
 const sb=await serverClient();
 const {data,error}=await sb.rpc('stark_english_collection',{p_slug:collection});
 if(error||!data||data==='null')notFound();
 const c=data as StarkCollectionDetail;
 if(!c.slug||!c.kind||c.slug!==collection)notFound();
 const {data:sourceData}=await sb.rpc('stark_english_collection_sources',{p_slug:collection});
 const sources=new Map(((sourceData||[]) as StarkCatalogSource[]).map(x=>[x.code,x]));
 const groups=new Map<number,StarkCatalogUnit[]>();
 for(const u of (c.units||[])){
  const index=u.block||1;
  groups.set(index,[...(groups.get(index)||[]),u]);
 }
 const back=c.kind==='series'?'series':c.kind==='movie'?'filmes':c.kind==='short'?'shorts':'entrevistas';
 const teacherView=sources.size>0;
 return <div className="stream-course-shell theme-stark-english stark-collection-page">
  <div className="stream-course-width">
   <header className="stark-collection-header">
    <Link href={'/courses/stark-english#'+back}>← Back to {STARK_SECTION_LABELS[c.kind]}</Link>
    <Link href="/courses">Stark Learning · Four courses ↗</Link>
   </header>
   <section className="stark-collection-hero">
    <p className="stark-catalog-eyebrow">STARK ENGLISH / {STARK_SECTION_LABELS[c.kind].toUpperCase()} / {c.cefr}</p>
    <h1>{c.title}</h1>
    <p>{c.description}</p>
    <div className="stark-collection-hero-data">
     <span><strong>{c.expectedLessons??'—'}</strong> {c.slug==='svo'||c.slug==='dvc'?'lessons':'proposed lessons'}</span>
     {c.expectedReviews>0&&<span><strong>{c.expectedReviews}</strong> reviews</span>}
     <span><strong>{c.sourceRecords}</strong> source records</span>
     <span><strong>{collectionStage(c)}</strong> content status</span>
    </div>
   </section>
   <div className="stark-collection-content">
    <section className="stark-collection-learning">
     <div className="stark-collection-info">
      <p className="stark-catalog-eyebrow">TEACHING STRUCTURE</p>
      <h2>{c.units?.length?'Sequence and assessment milestones':'Collection overview'}</h2>
      {c.slug==='svo'?<p>
       SVO uses five blocks of three lessons followed by one review. The structure and instructional requirements
       are documented in the existing Notion task bank. All lesson-topic titles shown here are <strong>working labels</strong>,
       not verified titles from the original book.</p>:
       c.slug==='dvc'?<p>DVC has thirty sequential viewing and communicative lessons with ten reviews,
       each placed after a group of three lessons. The records are imported as curriculum drafts.</p>:
       <p>This collection is part of the draft catalog. Source material and final learning activities must be
       reviewed and assembled before the lessons can be assigned to students.</p>}
     </div>
     {c.units?.length?Array.from(groups.entries()).sort((a,b)=>a[0]-b[0]).map(([block,units])=>
      <section className="stark-unit-block" key={block}>
       <div className="stark-unit-block-title"><span>{String(block).padStart(2,'0')}</span>
        <div><h3>{c.slug==='svo'?(phaseNames[block-1]||'SVO block '+block):
          'DVC Volume '+block+' · Lessons '+(block*3-2)+'–'+(block*3)}</h3>
         <p>Three lessons · One cumulative review</p></div></div>
       <div className="stark-unit-list">{units.map(u=>{
        const src=sources.get(u.code);
        return <article className={'stark-unit-row'+(u.kind==='review'?' unit-review':'')} key={u.code}>
          <div className="stark-unit-no">{u.kind==='review'?'✓':String(Number(u.code.slice(-2))).padStart(2,'0')}</div>
          <div className="stark-unit-main">
           <div className="stark-unit-topline"><span>{unitLabel(u)}</span><span>{u.cefr}</span>
            <span>{u.stage}</span></div>
           <h4>{u.workingTitle}</h4>
           {u.code==='SVO-L01'&&<Link className="svo-catalog-unit-link" href="/courses/stark-english/svo/lesson-1">▶ Try the interactive lesson</Link>}
           <p>{u.outcome}</p>
           <small>{u.kind==='review'?'Review · awaiting assessment validation':
             u.titleVerified?'Source title verified':'Working title · source verification required'}</small>
           {src&&<details className="stark-unit-source">
             <summary>Teacher: original Notion task requirements</summary>
             {src.source_instructions&&<p>{src.source_instructions}</p>}
             {src.source_deliverable&&<p><strong>Deliverable:</strong> {src.source_deliverable}</p>}
             {src.source_completion&&<p><strong>Completion:</strong> {src.source_completion}</p>}
             {src.source_url&&<a href={src.source_url} target="_blank" rel="noopener noreferrer">Open original Notion task ↗</a>}
            </details>}
          </div>
          <span className="stark-unit-status">Draft</span>
         </article>;
       })}</div>
      </section>):<div className="stark-collection-concept">
       <span>✦</span>
       <h3>{c.kind==='short'?'Grammar practice library':c.kind==='movie'?'A focused learning experience':
        c.kind==='interview'?'Authentic interaction':'Series in development'}</h3>
       <p>{collectionUnits(c)}. {c.sourceRecords>0?
        'Source records are identified; activities still need to be converted into reusable student lessons.':
        'Learning materials and exact lesson sequence are still being designed.'}</p>
       <p>Once approved, this collection can connect to the same student assignments, evidence and teacher review workflow as other Stark Learning lessons.</p>
      </div>}
    </section>
    <aside className="stark-collection-aside">
     <div className="stark-collection-side-card">
      <p className="stark-catalog-eyebrow">CURRICULUM STATUS</p><h3>{collectionStage(c)}</h3>
      {c.slug==='svo'?<p>Lesson 1 has an interactive ten-step pilot. Its remaining lessons are still being built and checked.</p>:
      <p>This is the catalog preview. Draft episodes are not available as student submissions and cannot earn credits.</p>}
      {c.slug==='svo'&&<Link className="svo-catalog-pilot" href="/courses/stark-english/svo/lesson-1">▶ Open interactive Lesson 1 pilot</Link>}
      {teacherView&&<p className="stark-teacher-flag">Teacher view: original task directions and Notion links are available under each unit.</p>}
     </div>
     {c.slug==='svo'&&<div className="stark-collection-side-card">
      <p className="stark-catalog-eyebrow">SVO · MINIMUM EVIDENCE</p>
      <h3>What the source requires</h3>
      <p>Each lesson: complete <em>Express it</em>, check answers, record doubts, and write at least two original sentences.</p>
      <p>Each review: work without consulting previous lessons, compare with the key, and write corrections. Review 5 includes three original sentences.</p>
     </div>}
     <div className="stark-collection-side-card">
      <p className="stark-catalog-eyebrow">NEXT STEP</p>
      <h3>Curriculum approval before publication</h3>
      <p>Verify working titles, source book sections, learner activities, assessment criteria and expected evidence.</p>
      <Link href="/courses/stark-english">Return to Stark English ↗</Link>
     </div>
    </aside>
   </div>
  </div>
 </div>;
}
