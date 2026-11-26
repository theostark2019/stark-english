import Link from 'next/link';
import {AGRO_LEVELS,AGRO_SERIES,AGRO_EPISODES,agroHref,type AgroLevel,type AgroProgress} from '@/lib/agro02';

export function Agro02Dashboard({progress=[],level,query='',recordError=false}:{progress?:AgroProgress[];level?:AgroLevel;query?:string;recordError?:boolean}){
 const current=progress.find(p=>p.status==='revision_requested')||progress.find(p=>['draft','not_started'].includes(p.status));
 const next=AGRO_EPISODES.find(e=>e.code===current?.code)||AGRO_EPISODES[0];
 const seriesLevels=level?[level]:AGRO_LEVELS;
 const minutes=Math.round(progress.reduce((n,p)=>n+p.seconds,0)/60);
 return <div className="a02-page">
  <header className="a02-nav"><Link href="/courses/agroenglish" className="a02-brand">🌾 <span>AgroEnglish<small>STARK LEARNING · 0.2 PREVIEW</small></span></Link>
   <nav aria-label="AgroEnglish"><Link href="/courses/agroenglish">Series</Link><Link href="/learning">My commitments</Link><Link href="/courses">Other courses ↗</Link></nav></header>
  <section className="a02-hero"><div><p className="a02-eyebrow">ENGLISH THAT DOES SOMETHING</p><h1>{level?AGRO_SERIES[level].title:'Your work. Your world. Your English.'}</h1>
   <p>{level?AGRO_SERIES[level].description:'Meet the outcome. Build the language. Practice it. Show what you can do.'}</p>
   <div className="a02-actions"><Link className="a02-primary" href={current?'/lessons/'+current.assignmentId:agroHref(next)}>{current?'Continue your learning':'Meet your first challenge'} →</Link>
    <a className="a02-quiet" href="#series">Explore the four series ↓</a></div></div>
   <div className="a02-hero-mark" aria-hidden="true">{level?AGRO_SERIES[level].icon:'🌱'}<span>FROM FIRST WORDS<br/>TO REAL CONTRIBUTION</span></div></section>
  {recordError&&<p role="alert" className="error">Your learning record could not be loaded. Refresh before relying on the progress shown here.</p>}
  <section className="a02-stats" aria-label="My learning record">
   <div><strong>4 × 24</strong><span>Series × episodes</span></div><div><strong>{minutes}<small> min</small></strong><span>Recorded active study time</span></div>
   <div><strong>{progress.filter(p=>p.status==='finalized').length}</strong><span>Teacher-finalized episodes</span></div><div><strong>{progress.filter(p=>p.verified).length}<small> / 96</small></strong><span>Skills demonstrated at 3–4 / 4</span></div>
  </section>
  <section className="a02-series-area" id="series"><div className="a02-heading"><div><p className="a02-eyebrow">A CLEAR DESTINATION FOR EVERY EPISODE</p><h2>{level?level+' · 24 communicative challenges':'Choose your next series'}</h2></div>
   <form role="search"><input name="q" aria-label="Find a skill" placeholder="Find a skill, task or language…" defaultValue={query}/><button type="submit">Search</button></form></div>
   {!level&&<div className="a02-series-grid">{AGRO_LEVELS.map(l=>{const done=progress.filter(p=>p.code.startsWith('AGRO02-'+l)&&p.verified).length;return <Link key={l} className={'a02-series a02-'+l.toLowerCase()} href={'/courses/agroenglish/series/'+l.toLowerCase()}>
    <div className="a02-series-top"><span>{l}</span><span>24 EPISODES</span></div><div className="a02-series-art" aria-hidden="true">{AGRO_SERIES[l].icon}</div>
    <h3>{AGRO_SERIES[l].title}</h3><p>{AGRO_SERIES[l].description}</p><progress value={done} max={24} aria-label={l+' demonstrated skills'}/><small>{done} / 24 skills demonstrated <b>Explore →</b></small>
   </Link>})}</div>}
   {(level||query)&&seriesLevels.map(l=>{const episodes=AGRO_EPISODES.filter(e=>e.level===l&&(!query||[e.title,e.resources,e.task].join(' ').toLowerCase().includes(query.toLowerCase())));return <div key={l} className="a02-episodes">
    {!level&&<h3>{l} · {AGRO_SERIES[l].title}</h3>}{episodes.length===0&&<p>No matching skills. Try another word.</p>}
    {episodes.map(e=>{const p=progress.find(p=>p.code===e.code);return <Link key={e.code} className="a02-episode-row" href={p?'/lessons/'+p.assignmentId:agroHref(e)}>
     <span className="a02-episode-number">{String(e.episode).padStart(2,'0')}</span><div><h3>{e.title}</h3><p>{e.task}</p><small>{e.resources}</small></div>
     <span className="a02-episode-state">{p?.verified?'✓ Demonstrated':p?.status==='finalized'?'Reviewed · keep practicing':p?.status?.replaceAll('_',' ')||e.minutes+' min estimated'}<b>→</b></span>
    </Link>})}</div>})}
  </section>
  <section className="a02-bottom"><div><p className="a02-eyebrow">YOUR PROOF BECOMES YOUR LEARNING RECORD</p><h2>Show it. Get feedback. Make it stronger.</h2><p>Every episode targets one checklist skill. A teacher reviews your performance on a 0–4 rubric. Scores of 3 or 4 with evidence count as demonstrated skills. A series checklist supports CEFR assessment; it does not certify a whole CEFR level.</p></div><Link href="/learning">Open my student file →</Link></section>
  <details className="a02-legacy"><summary>Earlier AgroEnglish work</summary><p>Your earlier Agriculture 101, Agribiology, submissions and feedback remain available.</p><Link href="/courses/agroenglish/agriculture-101">Original Agriculture 101 →</Link><p><Link href="/learning">Assigned work and student record →</Link></p></details>
 </div>;
}
