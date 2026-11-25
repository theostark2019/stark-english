'use client';
import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {browserClient} from '@/lib/supabase/browser';
import {SVO_L01,SVO_L01_STEPS,comparable,initialSvoAnswers,readyForSubmission,type SvoL01Answers} from '@/lib/svo-lesson-content';

type Attempt={id:string;student_id:string;assignment_id:string;status:string};
type WordRow={word_key:string;status:'learning'|'mastered';correct_streak:number;reviews:number};
type Kpi={weeklyTarget:number;selectedThisWeek:number;masteredThisWeek:number;learningTotal:number;masteredTotal:number};
type Props={attempt?:Attempt|null;initialAnswers?:Partial<SvoL01Answers>|null};
const words=SVO_L01.lexicon;
const stepHelp=[
 'Select words you cannot use confidently yet.',
 'Practice the words you selected. Try recalling before flipping.',
 'Read the book’s examples, highlighting words you marked unfamiliar.',
 'Translate the seven Express it prompts before comparing model answers.',
 'Build two original sentences by changing the subject, verb and object.',
 'Reveal the explanation to discover the pattern.',
 'Practice useful word combinations as chunks.',
 'Choose the best option and check your answer immediately.',
 'Complete five sentence gaps and check the grammar.',
 'Listen to five lesson sentences and write exactly what you hear.'
];
function normalizeAnswers(raw?:Partial<SvoL01Answers>|null):SvoL01Answers{
 const d=initialSvoAnswers();
 if(!raw)return d;
 return {...d,...raw,
  unknown:Array.isArray(raw.unknown)?raw.unknown:[],
  translations:Array.from({length:7},(_,i)=>String(raw.translations?.[i]||'')),
  substitutions:Array.from({length:2},(_,i)=>String(raw.substitutions?.[i]||'')),
  practiceGap:Array.from({length:5},(_,i)=>String(raw.practiceGap?.[i]||'')),
  dictation:Array.from({length:5},(_,i)=>String(raw.dictation?.[i]||'')),
  practiceChoice:raw.practiceChoice||{},flashRatings:raw.flashRatings||{},
  visited:Array.isArray(raw.visited)?raw.visited:[0],
  step:typeof raw.step==='number'&&raw.step>=0&&raw.step<10?raw.step:0
 };
}
function speak(value:string,rate=.88){
 if(typeof window==='undefined'||!('speechSynthesis' in window))return false;
 window.speechSynthesis.cancel();
 const v=new SpeechSynthesisUtterance(value);
 v.lang='en-US';v.rate=rate;
 const voices=window.speechSynthesis.getVoices();
 const preferred=voices.find(x=>x.lang.startsWith('en')&&/aria|samantha|zira|female/i.test(x.name))
   ||voices.find(x=>x.lang.startsWith('en'));
 if(preferred)v.voice=preferred;
 window.speechSynthesis.speak(v);
 return true;
}
function Highlight({value,unknown}:{value:string;unknown:string[]}){
 const items=unknown.map(k=>words.find(w=>w.key===k)?.en).filter((x):x is string=>Boolean(x)).sort((a,b)=>b.length-a.length);
 if(!items.length)return <>{value}</>;
 const chunks=value.split(/(\s+|[.,!?;:])/g);
 return <>{chunks.map((chunk,i)=>items.some(w=>comparable(w)===comparable(chunk))
  ?<mark className="svo-mark" key={i}>{chunk}</mark>:<span key={i}>{chunk}</span>)}</>;
}
export function SvoLessonOne({attempt=null,initialAnswers=null}:Props){
 const [answers,setAnswers]=useState<SvoL01Answers>(()=>normalizeAnswers(initialAnswers));
 const [wordState,setWordState]=useState<Record<string,WordRow>>({});
 const [kpi,setKpi]=useState<Kpi|null>(null);
 const [flipped,setFlipped]=useState(false),[card,setCard]=useState(0);
 const [models,setModels]=useState<Record<number,boolean>>({});
 const [chunkMeanings,setChunkMeanings]=useState<Record<number,boolean>>({});
 const [gapChecks,setGapChecks]=useState<Record<number,boolean>>({});
 const [dictChecks,setDictChecks]=useState<Record<number,boolean>>({});
 const [grammar,setGrammar]=useState(false),[busy,setBusy]=useState(false);
 const [saved,setSaved]=useState(true),[saving,setSaving]=useState(false);
 const [error,setError]=useState(''),[notice,setNotice]=useState('');
 const [subject,setSubject]=useState('I'),[verb,setVerb]=useState('drink');
 const [object,setObject]=useState('milk'),[time,setTime]=useState('');
 const [submitted,setSubmitted]=useState(['submitted','claimed','finalized'].includes(attempt?.status||''));
 const buffer=useRef(answers),saveChain=useRef<Promise<unknown>>(Promise.resolve());
 const real=Boolean(attempt);
 const editable=!real||(attempt?.status==='draft'||attempt?.status==='revision_requested')&&!submitted;
 const step=answers.step;
 const unfamiliar=words.filter(w=>answers.unknown.includes(w.key)&&wordState[w.key]?.status!=='mastered');
 const active=unfamiliar[Math.min(card,unfamiliar.length-1)];
 const verdict=readyForSubmission(answers);
 const filled=answers.translations.filter(x=>x.trim()).length+answers.substitutions.filter(x=>x.trim()).length+
  Object.keys(answers.practiceChoice).length+answers.practiceGap.filter(x=>x.trim()).length+answers.dictation.filter(x=>x.trim()).length;
 const progress=Math.min(100,Math.round(filled/25*100));
 const nounOptions=verb==='drink'?['water','milk','coffee','tea','juice','orange juice','apple juice','grape juice','soda']:
  ['English','Spanish','Portuguese','Math','Geography'];
 const built=subject+' '+verb+' '+object+(time?' every day':'')+'.';
 function change(updater:(v:SvoL01Answers)=>SvoL01Answers){
  if(!editable)return;
  setAnswers(a=>{const next=updater(a);buffer.current=next;setSaved(false);return next});
  setError('');setNotice('');
 }
 function go(i:number){
  if(i<0||i>9)return;
  if(editable)change(a=>({...a,step:i,visited:[...new Set([...a.visited,i])]}));
  else setAnswers(a=>({...a,step:i}));
  setCard(0);setFlipped(false);
  if(typeof window!=='undefined'&&'speechSynthesis' in window)window.speechSynthesis.cancel();
 }
 async function reloadKpis(){
  if(!real)return;
  const sb=browserClient();
  const [a,b]=await Promise.all([sb.rpc('svo_word_progress'),sb.rpc('svo_weekly_word_kpi')]);
  if(a.error){setError(a.error.message);return;}
  setWordState(Object.fromEntries(((a.data||[]) as WordRow[]).map(x=>[x.word_key,x])));
  if(!b.error&&b.data)setKpi(b.data as Kpi);
 }
 useEffect(()=>{void reloadKpis();return()=>{if(typeof window!=='undefined'&&'speechSynthesis'in window)window.speechSynthesis.cancel()};},[attempt?.id]);
 async function save(snapshot:SvoL01Answers){
  if(!attempt||!editable)return true;
  const run=async()=>{
   setSaving(true);
   const {error:e}=await browserClient().from('lesson_responses').upsert({
    attempt_id:attempt.id,activity_key:'svo_l01',field_key:'portfolio',response:{value:snapshot}
   },{onConflict:'attempt_id,activity_key,field_key'});
   if(e){setError('Save failed: '+e.message);setSaving(false);return false;}
   if(buffer.current===snapshot)setSaved(true);
   setSaving(false);return true;
  };
  const next=saveChain.current.then(run,run);
  saveChain.current=next.then(()=>undefined,()=>undefined);
  return await next;
 }
 useEffect(()=>{
  if(!attempt||!editable||saved)return;
  const timer=setTimeout(()=>{void save(buffer.current)},900);
  return()=>clearTimeout(timer);
 },[answers,attempt?.id,editable,saved]);
 async function wordAction(wordKey:string,action:'unknown'|'undo_selection'|'recall_success'|'recall_missed'){
  if(!attempt)return true;
  if(!editable)return false;
  const {error:e}=await browserClient().rpc('svo_word_event',{p_word_key:wordKey,p_action:action});
  if(e){setError(e.message);return false;}
  await reloadKpis();return true;
 }
 async function selectUnknown(wordKey:string,checked:boolean){
  if(busy||!editable)return;
  setBusy(true);
  const ok=await wordAction(wordKey,checked?'unknown':'undo_selection');
  setBusy(false);
  if(!ok)return;
  change(a=>({...a,unknown:checked?[...new Set([...a.unknown,wordKey])]:a.unknown.filter(x=>x!==wordKey)}));
  setCard(0);setFlipped(false);
 }
 async function rate(rating:number){
  if(!active||busy||!editable)return;
  setBusy(true);
  const ok=await wordAction(active.key,rating===0?'recall_success':'recall_missed');
  setBusy(false);
  if(!ok)return;
  change(a=>({...a,flashRatings:{...a.flashRatings,[active.key]:rating}}));
  setCard(i=>unfamiliar.length?(i+1)%unfamiliar.length:0);setFlipped(false);
 }
 function play(line:string,rate=.88){if(!speak(line,rate))setError('Audio not supported in this browser. Try Chrome or Edge with speech synthesis enabled.');}
 async function handIn(){
  if(!attempt||!editable||!verdict.ready||busy)return;
  setBusy(true);setError('');
  const ok=await save(buffer.current);
  await saveChain.current;
  if(!ok){setBusy(false);return;}
  if(!window.confirm('Submit SVO Lesson 1 to your teacher?')){setBusy(false);return;}
  const {error:e}=await browserClient().rpc('submit_lesson_attempt',{p_attempt:attempt.id});
  if(e)setError(e.message);
  else{setSubmitted(true);setSaved(true);setNotice('Lesson submitted. Your teacher will evaluate your evidence and dictation.');}
  setBusy(false);
 }
 return <div className="svo-player">
  <div className="svo-back"><Link href="/courses/stark-english/catalog/svo">← The SVO Protocol</Link>
   <span>{real?'Assigned learning · your answers are saved':'Interactive preview · not saved'}</span></div>
  <header className="svo-hero">
   <div><p>SERIES / SVO PROTOCOL / A1</p><h1>Lesson 1 · To Drink / To Study</h1>
    <div>Vocabulary → Flashcards → Examples → Translation → Substitution → Grammar → Chunks → Practice → Dictation</div></div>
   <div className="svo-hero-percentage"><strong>{progress}%</strong><small>responses completed</small></div>
  </header>
  <section className="svo-kpis">
   <div className="svo-weekly"><div><small>WEEKLY VOCABULARY GOAL</small>
     <strong>{real&&kpi?kpi.selectedThisWeek:'—'} <span>/ 30 items</span></strong></div>
    <div className="svo-meter"><span style={{width:kpi?Math.min(kpi.selectedThisWeek/30*100,100)+'%':'0%'}}/></div>
    <p>New unfamiliar items selected this week. The target is a pace, not proof of mastery.</p></div>
   <div className="svo-mini-kpi"><strong>{real&&kpi?kpi.masteredThisWeek:'—'}</strong><span>Mastered this week</span></div>
   <div className="svo-mini-kpi"><strong>{real&&kpi?kpi.learningTotal:'—'}</strong><span>In review</span></div>
  </section>
  <div className="svo-body">
   <nav className="svo-steps" aria-label="Ten lesson stages"><strong>LEARNING PATH</strong>
    {SVO_L01_STEPS.map((name,i)=><button type="button" key={name} className={i===step?'active':''}
     aria-current={i===step?'step':undefined} onClick={()=>go(i)}>
     <span>{String(i+1).padStart(2,'0')}</span>{name}</button>)}
    <p>Progress is based on completed responses, not simply visiting a page.</p>
   </nav>
   <section className="svo-main">
    <div className="svo-main-title"><small>STEP {step+1} OF 10</small>
     <h2>{SVO_L01_STEPS[step]}</h2><p>{stepHelp[step]}</p></div>
    {step===0&&<div className="svo-panel">
     <div className="svo-section-head"><strong>Original Lesson 1 vocabulary</strong><small>20 words / expressions</small></div>
     <div className="svo-vocab-list">{words.map(w=><label key={w.key} className={answers.unknown.includes(w.key)?'checked':''}>
      <input type="checkbox" checked={answers.unknown.includes(w.key)}
       disabled={!editable||busy||(wordState[w.key]?.status==='mastered'&&!answers.unknown.includes(w.key))}
       onChange={e=>void selectUnknown(w.key,e.target.checked)}/>
      <span><strong>{w.en}</strong><small>{w.kind}</small></span><em>{
       wordState[w.key]?.status==='mastered'?'Mastered':answers.unknown.includes(w.key)?'To review':'I know this'}</em>
     </label>)}</div>
     <p className="svo-message">{answers.unknown.length} marked unfamiliar · They will become your targeted flashcards.</p>
    </div>}
    {step===1&&<div className="svo-panel">
     {!active?<p className="svo-empty">No unfamiliar items selected. <button onClick={()=>go(0)}>Choose words first</button></p>:
     <><div className="svo-section-head"><strong>Practice what you don't know</strong>
       <small>Card {Math.min(card+1,unfamiliar.length)} / {unfamiliar.length}</small></div>
       <button type="button" className={'svo-flashcard'+(flipped?' flipped':'')}
        onClick={()=>setFlipped(v=>!v)}>
        <strong>{flipped?active.pt:active.en}</strong>
        <small>{flipped?active.example:'Think of the meaning, then tap.'}</small></button>
       <div className="svo-button-row"><button onClick={()=>play(active.en)}>▶ Listen</button>
        <button onClick={()=>{setCard((card+1)%unfamiliar.length);setFlipped(false)}}>Skip card →</button></div>
       <div className="svo-ratings">{[['I know it',0],['Knew it, forgot',1],["I've seen it",2],["I don't know",3]].map(([name,n])=>
        <button key={String(n)} type="button" disabled={!editable||busy||!flipped}
         onClick={()=>void rate(Number(n))}>{name}</button>)}</div>
       <p className="svo-note">Two successful recalls mark an unfamiliar word as mastered. A missed recall restarts the streak.</p></>}
    </div>}
    {step===2&&<div className="svo-panel">
     <div className="svo-section-head"><strong>In context · source sentences</strong><small>Highlighted words need attention</small></div>
     {SVO_L01.contexts.map((line,i)=><div className="svo-example" key={i}>
      <small>{String(i+1).padStart(2,'0')}</small><p><Highlight value={line} unknown={answers.unknown}/></p>
      <button onClick={()=>play(line)} aria-label={'Play example '+(i+1)}>▶</button></div>)}
     <details className="svo-details"><summary>Additional examples for each vocabulary item</summary>
      {words.map(w=><div key={w.key}><b>{w.en}</b> · <Highlight value={w.example} unknown={answers.unknown}/></div>)}</details>
    </div>}
    {step===3&&<div className="svo-panel">
     <p className="svo-source">EXPRESS IT · 7 ORIGINAL TRANSLATION PROMPTS · BOOK P.10</p>
     {SVO_L01.translations.map((q,i)=><div className="svo-task" key={i}>
      <label htmlFor={'svo-tr-'+i}>{i+1}. {q.pt}</label>
      <textarea id={'svo-tr-'+i} rows={2} disabled={!editable} value={answers.translations[i]}
       placeholder="Your translation in English…"
       onChange={e=>change(a=>({...a,translations:a.translations.map((v,j)=>j===i?e.target.value:v)}))}/>
      <button className="svo-link" type="button" onClick={()=>setModels(x=>({...x,[i]:!x[i]}))}>
       {models[i]?'Hide possible model':'Compare possible model'}</button>
      {models[i]&&<p className="svo-model">{q.model}</p>}</div>)}
     <p className="svo-note">Translation can have more than one correct answer. The teacher will assess meaningful alternatives.</p>
    </div>}
    {step===4&&<div className="svo-panel">
     <div className="svo-builder">
      <label>Subject<select value={subject} onChange={e=>setSubject(e.target.value)}><option>I</option><option>You</option></select></label>
      <label>Verb<select value={verb} onChange={e=>{setVerb(e.target.value);setObject(e.target.value==='drink'?'milk':'English')}}>
       <option>drink</option><option>study</option></select></label>
      <label>Object<select value={object} onChange={e=>setObject(e.target.value)}>
       {nounOptions.map(n=><option key={n}>{n}</option>)}</select></label>
      <label>Time<select value={time} onChange={e=>setTime(e.target.value)}>
       <option value="">None</option><option value="daily">every day</option></select></label>
     </div>
     <div className="svo-generated"><small>YOUR SENTENCE</small><strong>{built}</strong>
      <button onClick={()=>play(built)}>▶ Listen</button></div>
     <div className="svo-button-row">{[0,1].map(i=><button key={i} disabled={!editable}
      onClick={()=>change(a=>({...a,substitutions:a.substitutions.map((v,j)=>j===i?built:v)}))}>
      Use as sentence {i+1}</button>)}</div>
     {answers.substitutions.map((v,i)=><label key={i} className="svo-field">Original sentence {i+1}
       <input value={v} disabled={!editable} placeholder="Create or improve your own sentence…" onChange={e=>
        change(a=>({...a,substitutions:a.substitutions.map((x,j)=>j===i?e.target.value:x)}))}/></label>)}
     <label className="svo-field">Doubts to discuss with your teacher (optional)<textarea rows={2}
      disabled={!editable} value={answers.doubts} onChange={e=>change(a=>({...a,doubts:e.target.value}))}/></label>
    </div>}
    {step===5&&<div className="svo-panel">
     <div className="svo-grammar-examples"><strong>I drink milk.</strong><strong>You study English.</strong></div>
     <button className="svo-callout-button" onClick={()=>setGrammar(v=>!v)}>
      {grammar?'Hide grammar explanation':'Show grammar explanation ↓'}</button>
     {grammar&&<div className="svo-explanation">
      <h3>Subject + Verb + Object</h3>
      <div className="svo-grammar-grid"><span>I / You<small>SUBJECT</small></span>
       <span>drink / study<small>VERB</small></span><span>milk / English<small>OBJECT</small></span></div>
      <p><b>To drink</b> and <b>to study</b> are infinitives. In Present Simple sentences with <b>I</b> or <b>You</b>, use the base form: <i>I drink</i>, <i>You study</i> (not “I drinks”).</p>
      <p>Use <b>and</b> to connect two objects. Use <b>every day</b> to add when or how often.</p>
      <p><b>I drink orange juice every day.</b> / <b>I study Spanish and English.</b></p>
      <button onClick={()=>play('I drink orange juice every day. I study Spanish and English.')}>▶ Hear examples</button>
     </div>}
    </div>}
    {step===6&&<div className="svo-panel">
     <p className="svo-note">Learn useful combinations as complete chunks, not isolated words.</p>
     {SVO_L01.chunks.map((c,i)=><div className="svo-chunk" key={c.en}>
      <div><strong>{c.en}</strong>{chunkMeanings[i]&&<small>{c.pt}</small>}</div>
      <button onClick={()=>play(c.en)}>▶</button>
      <button onClick={()=>setChunkMeanings(x=>({...x,[i]:!x[i]}))}>{chunkMeanings[i]?'Hide':'Meaning'}</button>
     </div>)}
     <p className="svo-message">Try swapping chunks: I drink orange juice. → I drink apple juice.</p>
    </div>}
    {step===7&&<div className="svo-panel">
     <p className="svo-source">IMMEDIATE PRACTICE · CHOOSE THE BEST OPTION</p>
     {SVO_L01.practiceQuestions.map((q,i)=>{
      const answer=answers.practiceChoice[String(i)];
      return <div className="svo-choice" key={i}><strong>{i+1}. {q.prompt}</strong>
       <div>{q.choices.map((choice,j)=><button key={choice} disabled={!editable}
        className={answer===j?(answer===q.correct?'right':'wrong'):''}
        onClick={()=>change(a=>({...a,practiceChoice:{...a.practiceChoice,[String(i)]:j}}))}>{choice}</button>)}</div>
       {typeof answer==='number'&&<p className={answer===q.correct?'svo-correct':'svo-incorrect'}>
        {answer===q.correct?'✓ '+q.why:'Try another option. Look at the sentence pattern.'}</p>}
      </div>;
     })}
    </div>}
    {step===8&&<div className="svo-panel">
     <p className="svo-source">IMMEDIATE PRACTICE · COMPLETE THE SENTENCES</p>
     {SVO_L01.practiceGaps.map((q,i)=>{
      const value=answers.practiceGap[i]||'',right=comparable(value)===comparable(q.answer);
      return <div className="svo-gap" key={i}><label>{i+1}. {q.prompt}
       <input disabled={!editable} value={value} placeholder={q.hint} onChange={e=>
        change(a=>({...a,practiceGap:a.practiceGap.map((v,j)=>j===i?e.target.value:v)}))}/></label>
       <button onClick={()=>setGapChecks(x=>({...x,[i]:!x[i]}))} disabled={!value.trim()}>Check</button>
       {gapChecks[i]&&<p className={right?'svo-correct':'svo-incorrect'}>{
        right?'✓ Correct': 'Try again. Hint: '+q.hint}</p>}
      </div>;
     })}
    </div>}
    {step===9&&<div className="svo-panel">
     <p className="svo-source">FINAL ACTIVITY · DICTATION · 5 SENTENCES</p>
     <p className="svo-note">Listen and write down exactly what you hear. Use Slow when needed.</p>
     {SVO_L01.dictation.map((line,i)=>{
      const value=answers.dictation[i]||'',right=comparable(value)===comparable(line);
      return <div className="svo-dict" key={i}>
       <div><strong>Sentence {i+1} / 5</strong><button onClick={()=>play(line)}>▶ Play</button>
        <button onClick={()=>play(line,.72)}>▶ Slow</button></div>
       <textarea disabled={!editable} rows={2} placeholder="Write what you hear…" value={value}
        onChange={e=>change(a=>({...a,dictation:a.dictation.map((v,j)=>j===i?e.target.value:v)}))}/>
       <button className="svo-link" disabled={!value.trim()} onClick={()=>setDictChecks(x=>({...x,[i]:!x[i]}))}>Check transcription</button>
       {dictChecks[i]&&<p className={right?'svo-correct':'svo-incorrect'}>{
        right?'✓ Exact match':'Compare and try again: '+line}</p>}
      </div>;
     })}
     <div className="svo-submit"><div><strong>{verdict.ready?'Ready for teacher feedback':'Evidence checklist'}</strong>
      <p>{verdict.ready?'All activities are filled in.':verdict.missing.join(' · ')}</p>
      {real&&<small>{saving?'Saving…':saved?'Saved':'Changes pending'}</small>}</div>
      {real?<button disabled={!editable||!verdict.ready||busy||submitted} onClick={()=>void handIn()}>
       {submitted?'Submitted ✓':busy?'Sending…':'Submit to my teacher →'}</button>:
       <span>Demo · submissions require an assigned account</span>}</div>
    </div>}
    {(notice||error)&&<p className={'svo-alert'+(error?' error':'')} role="status">{error||notice}</p>}
    <div className="svo-navigation"><button disabled={step===0} onClick={()=>go(step-1)}>← Previous</button>
     <span>Step {step+1} / 10 {real?'· '+(saving?'Saving…':saved?'Saved':'Unsaved'):'· Preview'}</span>
     <button disabled={step===9} onClick={()=>go(step+1)}>Next →</button></div>
   </section>
  </div>
  <p className="svo-attribution">Source: The SVO Protocol, Module 1, Lesson 1, p. 10 · New digital practice extends the original exercises. <Link href="/courses/stark-english/catalog/svo">Back to Series →</Link></p>
 </div>;
}
