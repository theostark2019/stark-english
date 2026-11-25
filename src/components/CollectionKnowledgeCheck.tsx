'use client';
import {useState} from 'react';
import Link from 'next/link';
import {browserClient} from '@/lib/supabase/browser';
import type {CollectionPriorKnowledge} from '@/lib/stark-catalog';
export function CollectionKnowledgeCheck({slug,skills,enabled,signedIn}:{
 slug:string;skills:CollectionPriorKnowledge[];enabled:boolean;signedIn:boolean;
}){
 const [items,setItems]=useState(skills);
 const [busy,setBusy]=useState<string|null>(null);
 const [error,setError]=useState('');
 const selected=items.filter(x=>x.checked).length;
 async function toggle(key:string,checked:boolean){
  if(!enabled||busy)return;
  setBusy(key);setError('');
  const {error:e}=await browserClient().rpc('stark_collection_self_check',{
   p_slug:slug,p_skill_key:key,p_checked:checked
  });
  setBusy(null);
  if(e){setError('Could not save your self-check: '+e.message);return;}
  setItems(prev=>prev.map(x=>x.key===key?{...x,checked}:x));
 }
 if(!items.length)return null;
 return <section className="scd-knowledge-panel" aria-labelledby="scd-knowledge-title">
  <div className="scd-eyebrow">BEFORE YOU BEGIN</div>
  <div className="scd-panel-title">
   <h2 id="scd-knowledge-title">What do you already know?</h2>
   <span className="scd-knowledge-count">{selected} / {items.length}</span>
  </div>
  <p className="scd-knowledge-intro">Tick the things you believe you can do already. This is a personal self-check, not a test or proof of mastery.</p>
  <div className="scd-knowledge-items">
   {items.map(item=><label key={item.key} className={'scd-knowledge-item'+(item.checked?' is-checked':'')}>
    <input type="checkbox" checked={item.checked} disabled={!enabled||busy!==null}
     onChange={e=>void toggle(item.key,e.target.checked)}/>
    <span className="scd-check-symbol" aria-hidden="true">{item.checked?'✓':'+'}</span>
    <span>{item.label}</span>
   </label>)}
  </div>
  {!enabled&&<p className="scd-knowledge-disabled">
   {!signedIn?<><Link href="/login">Sign in</Link> to save your self-assessment.</>:
    'Enroll in Stark English to save your self-assessment.'}
  </p>}
  {error&&<p role="alert" className="scd-knowledge-error">{error}</p>}
  <p className="scd-knowledge-footer">This checklist never changes your completed lessons or earned hours.</p>
 </section>;
}
