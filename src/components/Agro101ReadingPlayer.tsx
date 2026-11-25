'use client';
import {useRef,useState} from 'react';
import {AGRO_A1_TEXT,AGRO_A2_TEXT,type AgroMediaManifest} from '@/lib/agro-media';
type Level='A1'|'A2';
export function Agro101ReadingPlayer({media,compact=false}:{media:AgroMediaManifest;compact?:boolean}){
 const [level,setLevel]=useState<Level>('A1');
 const [speed,setSpeed]=useState(1);
 const audioRef=useRef<HTMLAudioElement|null>(null);
 const text=level==='A1'?AGRO_A1_TEXT:AGRO_A2_TEXT;
 const narration=level==='A1'?(media['a1-audio']||'/agro101/a1-audio.mp3'):
  (media['a2-audio']||'/agro101/a2-audio.mp3');
 const photo=level==='A1'?'/agro101/marina-coffee-visit.webp':'/agro101/marina-farm-team.webp';
 function stop(){
  if(audioRef.current){audioRef.current.pause();audioRef.current.currentTime=0;}
 }
 function switchLevel(value:Level){stop();setLevel(value)}
 return <section className={'agrs-reading-module'+(compact?' compact':'')} id="a1-reading">
  <div className="agrs-reading-heading"><div>
   <span className="agrs-mini-kicker">MARINA'S FARM VISITS</span>
   <h2>A story in two levels</h2>
   <p>Start with the simple A1 account, then discover more technical detail in A2.</p>
  </div><div className="agrs-reading-toggle" role="group" aria-label="Choose reading level">
   {(['A1','A2'] as const).map(v=><button type="button" key={v} className={level===v?'selected':''}
    onClick={()=>switchLevel(v)} aria-pressed={level===v}>{v} text</button>)}
  </div></div>
  <div className="agrs-reading-image">
   <img src={photo} alt={level==='A1'?'Marina and a farmer inspecting a coffee plant':
      'Marina learns from a farm team across coffee, soybean and corn fields'} loading="lazy"/>
   <div><span>{level==='A1'?'COFFEE FARM · MEET PAULO':'FARM VISITS · CROPS AND TEAMWORK'}</span></div>
  </div>
  <div className="agrs-reading-content" id={level==='A2'?'a2-reading':undefined}>
   <div className="agrs-reading-tools">
    <div><span className="agrs-level-badge">{level}</span><strong>{level==='A1'?'My name is Marina':'Learning how farms operate'}</strong>
     <small>{level==='A1'?'Simple introduction and familiar words':'Expanded reading and technical vocabulary'}</small></div>
    <div className="agrs-audio-actions">
     <label htmlFor="agrs-speed">Speed</label>
     <select id="agrs-speed" value={speed} onChange={e=>{
      const value=Number(e.target.value);setSpeed(value);
      if(audioRef.current)audioRef.current.playbackRate=value;
     }}><option value={0.8}>0.8×</option><option value={1}>1×</option><option value={1.15}>1.15×</option></select>
     <audio ref={audioRef} key={narration} controls preload="metadata"
      src={narration}
      aria-label={level+' recorded narration'}/>
    </div>
   </div>
   <div className="agrs-reading-paragraphs">{text.split('\n\n').map((p,i)=><p key={i}>{p}</p>)}</div>
   <div className="agrs-reading-bottom">
    <small>Recorded narration for the {level} text</small>
    {level==='A1'?<button type="button" onClick={()=>switchLevel('A2')}>Continue to A2 →</button>:
    <button type="button" onClick={()=>switchLevel('A1')}>← Return to A1</button>}
   </div>
  </div>
 </section>;
}
