'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {browserClient} from '@/lib/supabase/browser';
import {useSvoUnit,type SvoAttempt,type SvoKpi} from '@/hooks/useSvoUnit';
import {SVO_REVIEWS,SVO_5_REVIEW_STEPS,newSvoReviewAnswers,reviewCompleteness,
 type SvoReviewAnswers} from '@/lib/svo-curriculum';

const descriptions=[
 'Read the original passage, then change details, words, people or time expressions while keeping correct grammar.',
 'Answer the source questions in complete, personal sentences. Do not copy a ready-made answer.',
 'Complete the sentence frames using language from the preceding three lessons.',
 'Translate the source Express it+ paragraph into natural, accurate English.',
 'Write original sentences and reflect on what to practise before your teacher reviews the work.'
];
export function SvoCourseReview({code,attempt=null,initialAnswers=null}:{
 code:string;attempt?:SvoAttempt|null;initialAnswers?:Partial<SvoReviewAnswers>|null;
}){
 const review=SVO_REVIEWS[code];
 if(!review)return null;
 const defaults=newSvoReviewAnswers(review);
 const init:SvoReviewAnswers=initialAnswers?{
  ...defaults,...initialAnswers,
  answers:review.questions.map((_,i)=>String(initialAnswers.answers?.[i]||'')),
  fills:review.fill.map((_,i)=>String(initialAnswers.fills?.[i]||'')),
  originals:defaults.originals.map((_,i)=>String(initialAnswers.originals?.[i]||'')),
  step:typeof initialAnswers.step==='number'&&initialAnswers.step>=0&&initialAnswers.step<5?initialAnswers.step:0
 }:defaults;
 const ctl=useSvoUnit({attempt,initial:init,code,activityKey:'svo_review',
  missing:(answers)=>reviewCompleteness(review,answers)});
 const [kpi,setKpi]=useState<SvoKpi|null>(null);
 useEffect(()=>{
  if(!attempt)return;
  browserClient().rpc('svo_weekly_word_kpi').then(({data})=>{if(data)setKpi(data as SvoKpi)});
 },[attempt?.id]);
 const a=ctl.value,step=a.step;
 const answered=Number(Boolean(a.changed.trim()))+a.answers.filter(x=>x.trim()).length+
  a.fills.filter(x=>x.trim()).length+Number(Boolean(a.translation.trim()))+
  a.originals.filter(x=>x.trim()).length;
 const total=2+review.questions.length+review.fill.length+a.originals.length;
 return <div className="svo-player svo-review-player">
  <div className="svo-back"><Link href="/courses/stark-english/catalog/svo">← SVO Protocol · Full Series</Link>
   <span>{attempt?'Assigned cumulative review · autosave':'Interactive teacher preview · no data saved'}</span></div>
  <header className="svo-hero">
   <div><p>STARK ENGLISH / SVO PROTOCOL / {review.level} / ASSESSMENT</p>
    <h1>{review.title}</h1>
    <div>Original book page {review.page} · {review.lessonCodes.map(c=>'Lesson '+Number(c.slice(-2))).join(' · ')} · Five assessment stages</div></div>
   <div className="svo-hero-percentage"><strong>{Math.round(answered/total*100)}%</strong><small>evidence answered</small></div>
  </header>
  <section className="svo-kpis">
   <div className="svo-weekly"><div><small>CUMULATIVE VOCABULARY · WEEKLY GOAL</small>
    <strong>{kpi?.selectedThisWeek??'—'} <span>/ 30 items</span></strong></div>
    <div className="svo-meter"><span style={{width:(kpi?Math.min(100,kpi.selectedThisWeek/30*100):0)+'%'}}/></div>
    <p>Reviews consolidate the previous lessons. They do not automatically add new vocabulary.</p></div>
   <div className="svo-mini-kpi"><strong>{kpi?.masteredTotal??'—'}</strong><span>Total words mastered</span></div>
   <div className="svo-mini-kpi"><strong>{kpi?.learningTotal??'—'}</strong><span>Awaiting recall</span></div>
  </section>
  <div className="svo-body">
   <nav className="svo-steps" aria-label="Review stages"><strong>REVIEW CHECKPOINT</strong>
    {SVO_5_REVIEW_STEPS.map((name,i)=><button type="button" key={name} className={i===step?'active':''}
     aria-current={i===step?'step':undefined} onClick={()=>ctl.navigate(i,5)}>
     <span>{String(i+1).padStart(2,'0')}</span>{name}</button>)}
    <p>Write independently before checking past lessons. The teacher evaluates the complete work.</p>
   </nav>
   <section className="svo-main">
    <div className="svo-main-title"><small>REVIEW STEP {step+1} / 5</small>
     <h2>{SVO_5_REVIEW_STEPS[step]}</h2><p>{descriptions[step]}</p></div>
    {step===0&&<div className="svo-panel">
     <p className="svo-source">ORIGINAL SOURCE PASSAGE · BOOK PAGE {review.page}</p>
     <blockquote className="svo-source-passage">{review.change}</blockquote>
     <label className="svo-field">My rewritten text · change at least five details
      <textarea rows={10} value={a.changed} disabled={!ctl.editable}
       placeholder="Rewrite the passage with new people, places, vocabulary or times…" onChange={e=>
        ctl.update(v=>({...v,changed:e.target.value}))}/></label>
     <p className="svo-note">Check meaning and grammar after each substitution. Source phrases remain visible for comparison.</p>
    </div>}
    {step===1&&<div className="svo-panel">
     <p className="svo-source">ANSWER IT · {review.questions.length} QUESTIONS FROM THE BOOK</p>
     {review.questions.map((question,i)=><label key={i} className="svo-field">
      {i+1}. {question}<textarea rows={2} value={a.answers[i]||''} disabled={!ctl.editable}
       placeholder="Answer using a complete sentence…" onChange={e=>
        ctl.update(v=>({...v,answers:v.answers.map((x,j)=>j===i?e.target.value:x)}))}/></label>)}
     <p className="svo-note">Avoid one-word answers when a complete sentence is possible, especially in Review 5.</p>
    </div>}
    {step===2&&<div className="svo-panel">
     <p className="svo-source">CREATE SENTENCES · THE ORIGINAL BLANKS AND PATTERNS</p>
     {review.fill.map((prompt,i)=><div className="svo-task" key={i}>
      <label htmlFor={'svor-gap-'+i}>{i+1}. {prompt}</label>
      <textarea id={'svor-gap-'+i} rows={2} value={a.fills[i]||''} disabled={!ctl.editable}
       placeholder="Write the complete sentence with the gaps filled in…" onChange={e=>
        ctl.update(v=>({...v,fills:v.fills.map((x,j)=>j===i?e.target.value:x)}))}/></div>)}
     <p className="svo-note">Use the sentence frame as a starting point. Your response should be a complete sentence, not just the missing word.</p>
    </div>}
    {step===3&&<div className="svo-panel">
     <p className="svo-source">EXPRESS IT+ · ORIGINAL PORTUGUESE PARAGRAPH</p>
     <blockquote className="svo-source-passage">{review.express}</blockquote>
     <label className="svo-field">Translate into English, preserving meaning
      <textarea rows={13} value={a.translation} disabled={!ctl.editable}
       placeholder="My English version…" onChange={e=>ctl.update(v=>({...v,translation:e.target.value}))}/></label>
     <p className="svo-note">This is a meaningful open translation task: a teacher assesses accuracy and clarity, rather than matching one rigid string.</p>
    </div>}
    {step===4&&<div className="svo-panel">
     <p className="svo-source">FINAL TRANSFER · PERSONAL PRODUCTION</p>
     <p className="svo-note">{review.code==='SVO-R05'?
      'Write three original sentences using regular and irregular past verbs, past negatives and questions.':
      'Write two original sentences reusing key grammar from the last three lessons.'}</p>
     {a.originals.map((v,i)=><label className="svo-field" key={i}>
      Original sentence {i+1}<input disabled={!ctl.editable} value={v}
       onChange={e=>ctl.update(x=>({...x,originals:x.originals.map((u,j)=>j===i?e.target.value:u)}))}
       placeholder="Write your own sentence…"/></label>)}
     <label className="svo-field">Reflection · What improved? What still requires practice? (optional)
      <textarea rows={3} value={a.reflection} disabled={!ctl.editable}
       onChange={e=>ctl.update(v=>({...v,reflection:e.target.value}))}/></label>
     <div className="svo-review-guidance"><strong>Teacher focus</strong><p>{review.reviewGuidance}</p></div>
     <div className="svo-submit"><div><strong>{ctl.ready?'Review ready for submission':'Still to complete'}</strong>
      <p>{ctl.ready?'All original review tasks and personal sentences are completed.':
       ctl.missingItems.join(' · ')}</p>
      <small>{ctl.saving?'Saving…':ctl.saved?'Saved':'Changes pending'}</small></div>
      {attempt?<button type="button" disabled={!ctl.editable||!ctl.ready||ctl.busy} onClick={()=>void ctl.submit()}>
       {ctl.submitted?'Submitted ✓':'Send review to teacher →'}</button>:
       <span>Preview mode · no submission</span>}</div>
    </div>}
    {(ctl.error||ctl.notice)&&<p role="status" className={'svo-alert'+(ctl.error?' error':'')}>{ctl.error||ctl.notice}</p>}
    <div className="svo-navigation"><button type="button" disabled={step===0} onClick={()=>ctl.navigate(step-1,5)}>← Previous</button>
     <span>Review step {step+1} / 5 · {attempt?ctl.saving?'Saving…':ctl.saved?'Saved':'Unsaved':'Preview'}</span>
     <button type="button" disabled={step===4} onClick={()=>ctl.navigate(step+1,5)}>Next →</button></div>
   </section>
  </div>
  <p className="svo-attribution">Source: The SVO Protocol, Review {Number(code.slice(-2))}, page {review.page}.
   The four original review sections are retained; personal transfer is added to the LMS.
   {' '}<Link href="/courses/stark-english/catalog/svo">Back to Series →</Link></p>
 </div>;
}
