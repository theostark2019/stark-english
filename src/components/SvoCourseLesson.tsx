'use client';
import {useEffect,useMemo,useState} from 'react';
import Link from 'next/link';
import {browserClient} from '@/lib/supabase/browser';
import {useSvoUnit,type SvoAttempt,type SvoKpi,type SvoWordRow} from '@/hooks/useSvoUnit';
import {SVO_LESSONS,SVO_ALL_WORDS,SVO_10_STEPS,getSvoWords,lessonCompleteness,
 newSvoLessonAnswers,normalizeSvo,type SvoLessonAnswers} from '@/lib/svo-curriculum';

function termHighlight(value:string,terms:string[]){
 if(!terms.length)return <>{value}</>;
 const escaped=terms.map(v=>v.includes('→')?v.split('→')[1].trim():v)
  .filter(Boolean).sort((a,b)=>b.length-a.length).map(v=>v.replace(/[.*+?^$()|[\]{}\\]/g,'\\$&'));
 const parts=value.split(new RegExp('\\b('+escaped.join('|')+')\\b','gi'));
 return <>{parts.map((p,i)=>terms.some(w=>normalizeSvo(w.includes('→')?w.split('→')[1].trim():w)===normalizeSvo(p))
  ?<mark key={i} className="svo-mark">{p}</mark>:<span key={i}>{p}</span>)}</>;
}
const help=[
 'Select the unfamiliar items. Previously studied words stay in your cumulative review queue.',
 'Recall first, flip, then rate. The deck combines today’s unfamiliar items and older words awaiting mastery.',
 'Read the book’s In context examples. Expand the word list for an illustration of every vocabulary item.',
 'Translate the original Portuguese Express it prompts. Only reveal the comparison model after an attempt.',
 'Change the sentence content and write two meaningful original sentences using this lesson’s patterns.',
 'Identify the grammar pattern in the examples, then reveal the explanation.',
 'Listen and retrieve complete chunks you can reuse when speaking or writing.',
 'Choose the correct form; get immediate feedback.',
 'Complete the sentences independently, then check your wording.',
 'Hear five source sentences and type what you understood.'
];
export function SvoCourseLesson({code,attempt=null,initialAnswers=null}:{
 code:string;attempt?:SvoAttempt|null;initialAnswers?:Partial<SvoLessonAnswers>|null;
}){
 const lesson=SVO_LESSONS[code];
 if(!lesson)return null;
 const defaults=newSvoLessonAnswers(lesson);
 const init:SvoLessonAnswers=initialAnswers?{
  ...defaults,...initialAnswers,
  unknown:Array.isArray(initialAnswers.unknown)?initialAnswers.unknown:[],
  translations:lesson.express.map((_,i)=>String(initialAnswers.translations?.[i]||'')),
  substitutions:Array.from({length:2},(_,i)=>String(initialAnswers.substitutions?.[i]||'')),
  practiceGap:lesson.gaps.map((_,i)=>String(initialAnswers.practiceGap?.[i]||'')),
  dictation:lesson.context.slice(0,5).map((_,i)=>String(initialAnswers.dictation?.[i]||'')),
  practiceChoice:initialAnswers.practiceChoice||{},ratings:initialAnswers.ratings||{},
  step:typeof initialAnswers.step==='number'&&initialAnswers.step<10&&initialAnswers.step>=0?initialAnswers.step:0
 }:defaults;
 const ctl=useSvoUnit({attempt,initial:init,code,activityKey:'svo_course',
  missing:(a)=>lessonCompleteness(lesson,a)});
 const answers=ctl.value;
 const step=answers.step;
 const words=useMemo(()=>getSvoWords(lesson),[code]);
 const [wordInfo,setWordInfo]=useState<Record<string,SvoWordRow>>({});
 const [kpi,setKpi]=useState<SvoKpi|null>(null);
 const [cardIndex,setCardIndex]=useState(0),[flipped,setFlipped]=useState(false);
 const [translationReveal,setTranslationReveal]=useState<Record<number,boolean>>({});
 const [chunkReveal,setChunkReveal]=useState<Record<number,boolean>>({});
 const [gapChecked,setGapChecked]=useState<Record<number,boolean>>({});
 const [dictChecked,setDictChecked]=useState<Record<number,boolean>>({});
 const [grammar,setGrammar]=useState(false),[sourceIndex,setSourceIndex]=useState(0);
 const [wordBusy,setWordBusy]=useState(false);
 const fetchWords=async()=>{
  if(!attempt)return;
  const sb=browserClient();
  const [a,b]=await Promise.all([sb.rpc('svo_word_progress'),sb.rpc('svo_weekly_word_kpi')]);
  if(a.error){ctl.setError('Word progress: '+a.error.message);return;}
  const all=(a.data||[]) as SvoWordRow[];
  setWordInfo(Object.fromEntries(all.map(w=>[w.word_key,w])));
  if(!b.error&&b.data)setKpi(b.data as SvoKpi);
 };
 useEffect(()=>{void fetchWords()},[attempt?.id,code]);
 const selected=words.filter(w=>answers.unknown.includes(w.key));
 const carry=Object.values(wordInfo).filter(w=>w.status==='learning')
  .map(w=>SVO_ALL_WORDS[w.word_key]).filter(Boolean);
 const deck=[...new Map([...selected,...carry].map(w=>[w.key,w])).values()]
  .filter(w=>wordInfo[w.key]?.status!=='mastered').slice(0,30);
 const active=deck[Math.min(cardIndex,deck.length-1)];
 const filled=answers.translations.filter(x=>x.trim()).length+
  answers.substitutions.filter(x=>x.trim()).length+Object.keys(answers.practiceChoice).length+
  answers.practiceGap.filter(x=>x.trim()).length+answers.dictation.filter(x=>x.trim()).length;
 const total=lesson.express.length+2+lesson.choose.length+lesson.gaps.length+5;
 const percent=Math.round(Math.min(1,filled/total)*100);
 async function event(key:string,action:'unknown'|'undo_selection'|'recall_success'|'recall_missed'){
  if(!attempt)return true;
  const {error}=await browserClient().rpc('svo_word_event',{p_word_key:key,p_action:action});
  if(error){ctl.setError(error.message);return false;}
  await fetchWords();return true;
 }
 async function toggle(key:string,flag:boolean){
  if(wordBusy||!ctl.editable)return;
  setWordBusy(true);
  const ok=await event(key,flag?'unknown':'undo_selection');
  setWordBusy(false);
  if(!ok)return;
  ctl.update(a=>({...a,unknown:flag?[...new Set([...a.unknown,key])]:a.unknown.filter(w=>w!==key)}));
  setCardIndex(0);
 }
 async function rate(n:number){
  if(!active||wordBusy||!ctl.editable)return;
  setWordBusy(true);
  const ok=await event(active.key,n===0?'recall_success':'recall_missed');
  setWordBusy(false);
  if(!ok)return;
  ctl.update(a=>({...a,ratings:{...a.ratings,[active.key]:n}}));
  setCardIndex(i=>deck.length?(i+1)%deck.length:0);setFlipped(false);
 }
 function navigate(i:number){ctl.navigate(i,10);setCardIndex(0);setFlipped(false);}
 const unknownTerms=words.filter(w=>answers.unknown.includes(w.key)).map(w=>w.en);
 const sourcedExamples=[...lesson.context,...lesson.grammarExamples,...lesson.express.map(e=>e[1])];
 return <div className="svo-player svo-course-player">
  <div className="svo-back"><Link href="/courses/stark-english/catalog/svo">← SVO Protocol · Full Series</Link>
   <span>{attempt?'Assigned lesson · autosave enabled':'Interactive preview · no student work is saved'}</span></div>
  <header className="svo-hero"><div><p>STARK ENGLISH / SERIES / THE SVO PROTOCOL / {lesson.level}</p>
    <h1>{code.replace('SVO-L','Lesson ')} · {lesson.title}</h1>
    <div>Original Lesson {Number(code.slice(-2))} · Book page {lesson.page} · 10 learning steps</div></div>
    <div className="svo-hero-percentage"><strong>{percent}%</strong><small>practice answered</small></div></header>
  <section className="svo-kpis">
   <div className="svo-weekly"><div><small>MY WEEKLY VOCABULARY TARGET</small>
    <strong>{kpi?.selectedThisWeek??'—'} <span>/ 30 items</span></strong></div>
    <div className="svo-meter"><span style={{width:(kpi?Math.min(100,kpi.selectedThisWeek/30*100):0)+'%'}}/></div>
    <p>{kpi&&kpi.selectedThisWeek>30?'You have selected over 30 new items this week. Prioritize recall and consolidation.':
     'Select only words you actually need to learn. Words selected are not yet mastered.'}</p></div>
   <div className="svo-mini-kpi"><strong>{kpi?.masteredThisWeek??'—'}</strong><span>Mastered this week</span></div>
   <div className="svo-mini-kpi"><strong>{kpi?.learningTotal??'—'}</strong><span>Cumulative review queue</span></div>
  </section>
  <div className="svo-body">
   <nav className="svo-steps" aria-label="SVO lesson steps"><strong>YOUR LEARNING PATH</strong>
    {SVO_10_STEPS.map((name,i)=><button type="button" key={name} className={i===step?'active':''}
     aria-current={i===step?'step':undefined} onClick={()=>navigate(i)}>
     <span>{String(i+1).padStart(2,'0')}</span>{name}</button>)}
    <p>Your answers are saved per lesson. Vocabulary is cumulative across the whole Series.</p>
   </nav>
   <section className="svo-main"><div className="svo-main-title"><small>STEP {step+1} / 10</small>
    <h2>{SVO_10_STEPS[step]}</h2><p>{help[step]}</p></div>
    {step===0&&<div className="svo-panel">
     <div className="svo-section-head"><strong>Vocabulary from the original lesson</strong><small>{words.length} terms</small></div>
     <div className="svo-vocab-list">{words.map(w=><label key={w.key} className={answers.unknown.includes(w.key)?'checked':''}>
      <input type="checkbox" checked={answers.unknown.includes(w.key)} disabled={!ctl.editable||wordBusy}
       onChange={e=>void toggle(w.key,e.target.checked)}/>
      <span><strong>{w.en}</strong><small>{w.pt}</small></span>
      <em>{wordInfo[w.key]?.status==='mastered'?'Mastered':answers.unknown.includes(w.key)?'Review':'Known'}</em>
     </label>)}</div><p className="svo-message">{selected.length} unfamiliar terms selected today. The next stage focuses on these.</p>
    </div>}
    {step===1&&<div className="svo-panel">
      {!active?<p className="svo-empty">No unfamiliar terms need practice. Choose words in Step 1 or continue to context examples.</p>:<>
       <div className="svo-section-head"><strong>Targeted vocabulary recall</strong><small>Card {Math.min(cardIndex+1,deck.length)} / {deck.length} · {selected.some(x=>x.key===active.key)?'This lesson':'Cumulative'}</small></div>
       <button className={'svo-flashcard'+(flipped?' flipped':'')} type="button" onClick={()=>setFlipped(x=>!x)}>
        <strong>{flipped?active.pt:active.en}</strong>
        <small>{flipped?active.example||'Create an example using today’s grammar.':'Recall its meaning before flipping.'}</small></button>
       <div className="svo-button-row">
        <button type="button" onClick={()=>ctl.play(active.en)}>▶ Listen</button>
        <button type="button" onClick={()=>{setCardIndex((cardIndex+1)%deck.length);setFlipped(false)}}>Next card →</button>
       </div>
       <div className="svo-ratings">{[['I know it',0],['Knew it, forgot',1],["I've seen it",2],["I don't know",3]].map(([label,n])=>
        <button key={n} type="button" disabled={!ctl.editable||wordBusy||!flipped} onClick={()=>void rate(Number(n))}>{label}</button>)}</div>
       <p className="svo-note">Two successful recalls count as mastery; a missed recall resets that word’s confidence streak. The deck includes previously selected words not yet mastered.</p>
      </>}
    </div>}
    {step===2&&<div className="svo-panel">
     <div className="svo-section-head"><strong>In context · From the SVO book</strong><small>Page {lesson.page}</small></div>
     {lesson.context.map((line,i)=><div className="svo-example" key={i}><small>{String(i+1).padStart(2,'0')}</small>
      <p>{termHighlight(line,unknownTerms)}</p><button type="button" onClick={()=>ctl.play(line)}>▶</button></div>)}
     <details className="svo-details"><summary>Example for every vocabulary item (including extra teacher-written models)</summary>
      {words.map(w=><div key={w.key}><b>{w.en}</b> · {w.example||'Practice this word with a sentence from today’s grammar.'}
        {' '}<button type="button" onClick={()=>ctl.play(w.example||w.en)}>▶</button>
        {w.example&&!sourcedExamples.includes(w.example)&&<small> · Supplementary model</small>}
      </div>)}</details>
    </div>}
    {step===3&&<div className="svo-panel">
     <p className="svo-source">EXPRESS IT · PORTUGUESE → ENGLISH · BOOK PAGE {lesson.page}</p>
     {lesson.express.map(([pt,model],i)=><div className="svo-task" key={i}>
      <label htmlFor={'svot-'+i}>{i+1}. {pt}</label>
      <textarea id={'svot-'+i} rows={2} value={answers.translations[i]||''} disabled={!ctl.editable}
       onChange={e=>ctl.update(a=>({...a,translations:a.translations.map((v,j)=>j===i?e.target.value:v)}))}
       placeholder="Translate into English without looking at the model…"/>
      <button type="button" className="svo-link" onClick={()=>setTranslationReveal(o=>({...o,[i]:!o[i]}))}>
       {translationReveal[i]?'Hide suggested answer':'Compare with possible translation'}</button>
      {translationReveal[i]&&<p className="svo-model">{model}</p>}
     </div>)}<p className="svo-note">These are suggested models. The teacher can accept equivalent, accurate English.</p>
    </div>}
    {step===4&&<div className="svo-panel">
     <p className="svo-source">SUBSTITUTION · TRANSFER THE SOURCE PATTERN</p>
     <label className="svo-field">Choose a sentence from the reading
      <select className="svo-lesson-select" value={sourceIndex} onChange={e=>setSourceIndex(Number(e.target.value))}>
       {lesson.context.map((line,i)=><option key={i} value={i}>{i+1}. {line}</option>)}</select></label>
     <div className="svo-generated"><small>MODEL</small><strong>{lesson.context[sourceIndex]}</strong>
      <button onClick={()=>ctl.play(lesson.context[sourceIndex])}>▶ Listen</button></div>
     <p className="svo-note">Keep the grammar pattern. Change the person, object, action, place or time as appropriate. Check verb forms after changing the subject.</p>
     <div className="svo-button-row">{[0,1].map(i=><button key={i} type="button" disabled={!ctl.editable}
      onClick={()=>ctl.update(a=>({...a,substitutions:a.substitutions.map((v,j)=>j===i?lesson.context[sourceIndex]:v)}))}>
      Use model as starting point {i+1}</button>)}</div>
     {[0,1].map(i=><label className="svo-field" key={i}>New sentence {i+1}
      <input disabled={!ctl.editable} value={answers.substitutions[i]||''}
       onChange={e=>ctl.update(a=>({...a,substitutions:a.substitutions.map((v,j)=>j===i?e.target.value:v)}))}
       placeholder="Create a new, meaningful variation…"/></label>)}
     <label className="svo-field">What is still difficult? (optional)
      <textarea rows={2} disabled={!ctl.editable} value={answers.doubts||''}
       onChange={e=>ctl.update(a=>({...a,doubts:e.target.value}))}/></label>
    </div>}
    {step===5&&<div className="svo-panel">
     <div className="svo-grammar-examples">{lesson.grammarExamples.slice(0,3).map(s=><strong key={s}>{s}</strong>)}</div>
     <button type="button" className="svo-callout-button" onClick={()=>setGrammar(x=>!x)}>
      {grammar?'Hide grammar':'Show explanation ↓'}</button>
     {grammar&&<div className="svo-explanation"><h3>{lesson.title}</h3>
      <p>{lesson.grammar}</p>
      <h4>Patterns you can reuse</h4>
      {lesson.grammarExamples.map(s=><p key={s}>• {s}</p>)}
      <button type="button" onClick={()=>ctl.play(lesson.grammarExamples.join(' '))}>▶ Listen to examples</button>
     </div>}
    </div>}
    {step===6&&<div className="svo-panel">
     <p className="svo-note">Chunks help you retrieve meaningful language more easily than isolated vocabulary.</p>
     {lesson.chunks.map((c,i)=><div className="svo-chunk" key={i}>
      <div><strong>{c}</strong>{chunkReveal[i]&&<small>Use this whole phrase in one of your new sentences.</small>}</div>
      <button type="button" onClick={()=>ctl.play(c)}>▶</button>
      <button type="button" onClick={()=>setChunkReveal(o=>({...o,[i]:!o[i]}))}>{chunkReveal[i]?'Hide':'Practice tip'}</button>
     </div>)}
    </div>}
    {step===7&&<div className="svo-panel"><p className="svo-source">IMMEDIATE PRACTICE A · CHOOSE</p>
     {lesson.choose.map(([prompt,answer,options],i)=>{
      const selectedIndex=answers.practiceChoice[String(i)];
      return <div className="svo-choice" key={i}><strong>{i+1}. {prompt}</strong>
       <div>{options.map((choice,j)=><button key={choice} type="button" disabled={!ctl.editable}
        className={selectedIndex===j?(choice===answer?'right':'wrong'):''}
        onClick={()=>ctl.update(a=>({...a,practiceChoice:{...a.practiceChoice,[String(i)]:j}}))}>{choice}</button>)}</div>
       {typeof selectedIndex==='number'&&<p className={options[selectedIndex]===answer?'svo-correct':'svo-incorrect'}>
        {options[selectedIndex]===answer?'✓ Correct!':'Try again using the grammar pattern.'}</p>}</div>;
     })}
    </div>}
    {step===8&&<div className="svo-panel"><p className="svo-source">IMMEDIATE PRACTICE B · COMPLETE</p>
     {lesson.gaps.map(([prompt,answer],i)=>{
      const given=answers.practiceGap[i]||'',ok=normalizeSvo(given)===normalizeSvo(answer);
      return <div className="svo-gap" key={i}><label>{i+1}. {prompt}
       <input value={given} disabled={!ctl.editable} placeholder="Type the missing word or phrase"
        onChange={e=>ctl.update(a=>({...a,practiceGap:a.practiceGap.map((x,j)=>j===i?e.target.value:x)}))}/></label>
       <button type="button" disabled={!given.trim()} onClick={()=>setGapChecked(o=>({...o,[i]:!o[i]}))}>Check</button>
       {gapChecked[i]&&<p className={ok?'svo-correct':'svo-incorrect'}>{ok?'✓ Correct.':'Not yet. Compare with the grammar examples and try again.'}</p>}</div>;
     })}
    </div>}
    {step===9&&<div className="svo-panel">
     <p className="svo-source">DICTATION · FIVE SOURCE SENTENCES</p>
     <p className="svo-note">Listen once at normal speed, then again if needed. Write the complete sentence. The audio uses browser text-to-speech.</p>
     {lesson.context.slice(0,5).map((line,i)=>{
      const value=answers.dictation[i]||'',ok=normalizeSvo(value)===normalizeSvo(line);
      return <div className="svo-dict" key={i}><div><strong>Sentence {i+1} of 5</strong>
       <button type="button" onClick={()=>ctl.play(line)}>▶ Play</button>
       <button type="button" onClick={()=>ctl.play(line,.72)}>▶ Slow</button></div>
       <textarea rows={2} value={value} disabled={!ctl.editable}
        placeholder="Write what you hear…" onChange={e=>ctl.update(a=>({...a,dictation:a.dictation.map((v,j)=>j===i?e.target.value:v)}))}/>
       <button type="button" className="svo-link" disabled={!value.trim()} onClick={()=>setDictChecked(o=>({...o,[i]:!o[i]}))}>Check transcription</button>
       {dictChecked[i]&&<p className={ok?'svo-correct':'svo-incorrect'}>
        {ok?'✓ Exact match.':'Compare and revise: '+line}</p>}</div>;
     })}
     <div className="svo-submit"><div><strong>{ctl.ready?'Ready to submit':'Complete your evidence'}</strong>
      <p>{ctl.ready?'The original translations, two sentences, both practice activities and dictation are filled in.':
       ctl.missingItems.join(' · ')}</p><small>{ctl.saving?'Saving…':ctl.saved?'Saved':'Changes pending'}</small></div>
      {attempt?<button type="button" disabled={!ctl.editable||!ctl.ready||ctl.busy} onClick={()=>void ctl.submit()}>
       {ctl.submitted?'Submitted ✓':'Submit to teacher →'}</button>:
       <span>Preview · assignment required to save or submit</span>}</div>
    </div>}
    {(ctl.error||ctl.notice)&&<p role="status" className={'svo-alert'+(ctl.error?' error':'')}>{ctl.error||ctl.notice}</p>}
    <div className="svo-navigation"><button type="button" disabled={step===0} onClick={()=>navigate(step-1)}>← Previous</button>
     <span>{step+1} / 10 · {attempt?ctl.saving?'Saving…':ctl.saved?'Saved':'Unsaved':'Preview'}</span>
     <button type="button" disabled={step===9} onClick={()=>navigate(step+1)}>Next →</button></div>
   </section>
  </div>
  <p className="svo-attribution">The SVO Protocol · Lesson {Number(code.slice(-2))}, p. {lesson.page}.
   Original material provides vocabulary, contexts, patterns and Express it; supplementary practice is adapted for digital study.
   {' '}<Link href="/courses/stark-english/catalog/svo">Back to SVO →</Link></p>
 </div>;
}
