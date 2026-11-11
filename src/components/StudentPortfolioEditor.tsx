'use client';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import {browserClient} from '@/lib/supabase/browser';
import {roleRank,displayPercent,type SupervisionRow} from '@/lib/supervision';

type Field={name:string;kind?:'text'|'multi'|'long'|'checkbox'|'date'|'number'|'url';hint?:string};
type Assignment={id:string;code:string;title:string;dueAt:string|null;submittedAt:string|null;status:string|null};
type Staff={id:string;name:string;hierarchy:string};
type Details={academic?:Record<string,unknown>;contact?:Record<string,unknown>|null;
 administration?:Record<string,unknown>|null;notionPageUrl?:string|null;
 assignments?:Assignment[];staff?:Staff[]};
type Section='academic'|'contact'|'administration';
const academic:Field[]=[
 {name:'Nome Completo'},{name:'Status'},{name:'CEFR',kind:'multi',hint:'A1, A2, B1, B2, C1, C2'},
 {name:'Group'},{name:'Curso solicitado'},{name:'Education',kind:'multi'},
 {name:'Occupation',kind:'multi'},{name:'Interesses',kind:'multi'},
 {name:'Experiência com inglês',kind:'long'},{name:'Objetivos',kind:'multi'},
 {name:'Rotina de estudos',kind:'long'},{name:'Adopted Strategy',kind:'long'},
 {name:'Historico',kind:'long'},{name:'Observacoes',kind:'long'},
 {name:'Target',kind:'long'},{name:'Turno'},{name:'Compromisso'},
 {name:'Onboarded',kind:'checkbox'},{name:'Dupla',kind:'url',hint:'Link to paired student'},{name:'Student',kind:'url',hint:'Related Notion student record'}
];
const contact:Field[]=[
 {name:'Contact'},{name:'Email'},{name:'Address'},{name:'Cidade'},{name:'Estado'},
 {name:'Birthdate',kind:'date'},{name:'Guardian',kind:'url',hint:'Guardian reference link'}
];
const administration:Field[]=[
 {name:'CPF',hint:'Restricted school-administration data'}, {name:'Campanha'},
 {name:'Contratos',kind:'multi',hint:'Contract page links'},{name:'Contratos ',kind:'long',hint:'Manual contract notes'},
 {name:'Indicacao'},{name:'Objetivo, prazo e investimento',kind:'long'},
 {name:'PriceRange',kind:'number'}, {name:'Recover',kind:'checkbox'},
 {name:'SDR'},{name:'Sales status'},{name:'Action'},{name:'Trigger'}
];
const definitions:{section:Section;title:string;description:string;fields:Field[];rank:number}[]=[
 {section:'academic',title:'Learning & academic profile',description:'Learning level, routine, interests, goals and mentoring notes.',fields:academic,rank:2},
 {section:'contact',title:'Contact & relationships',description:'Personal contact and guardian references. Restricted to Teachers and above.',fields:contact,rank:3},
 {section:'administration',title:'School administration',description:'Financial, contract and identity fields. Restricted to Coordinators and Principals.',fields:administration,rank:5}
];
function textValue(v:unknown){return Array.isArray(v)?v.join(', '):v===null||v===undefined?'':typeof v==='object'?JSON.stringify(v):String(v);}
function EditSection({studentId,section,title,description,fields,rank,userRank,initial}:{studentId:string;section:Section;
 title:string;description:string;fields:Field[];rank:number;userRank:number;initial:Record<string,unknown>}){
 const [values,setValues]=useState<Record<string,unknown>>(initial);
 const [busy,setBusy]=useState(false),[message,setMessage]=useState('');
 const router=useRouter();const editable=userRank>=rank;
 async function save(){
  setBusy(true);setMessage('');
  const {error}=await browserClient().rpc('save_supervision_portfolio',
   {p_student:studentId,p_section:section,p_fields:values});
  setMessage(error?'Save failed: '+error.message:'Saved successfully.');
  if(!error)router.refresh();
  setBusy(false);
 }
 return <section className="supervision-section supervision-form-section">
  <div className="supervision-section-heading"><div><p className="supervision-eyebrow">{section.toUpperCase()}</p><h2>{title}</h2><p>{description}</p></div>
   {editable&&<button className="supervision-save" onClick={()=>void save()} disabled={busy}>{busy?'Saving…':'Save section'}</button>}</div>
  <div className="supervision-form-grid">
   {fields.map(f=><label key={f.name} className={'supervision-field '+(f.kind==='long'?'wide':'')}>
    <span>{f.name}</span>
    {f.kind==='checkbox'?<input type="checkbox" checked={values[f.name]===true||values[f.name]==='__YES__'} disabled={!editable}
      onChange={e=>setValues(o=>({...o,[f.name]:e.target.checked}))}/>:
    f.kind==='long'?<textarea rows={3} value={textValue(values[f.name])} readOnly={!editable}
      onChange={e=>setValues(o=>({...o,[f.name]:e.target.value}))}/>:
    <input type={f.kind==='date'?'date':f.kind==='number'?'number':f.kind==='url'?'url':'text'}
      value={textValue(values[f.name])} readOnly={!editable}
      onChange={e=>setValues(o=>({...o,[f.name]:f.kind==='multi'?e.target.value.split(',').map(x=>x.trim()).filter(Boolean):
       f.kind==='number'?(e.target.value===''?null:Number(e.target.value)):e.target.value}))}/>}
    {f.hint&&<small>{f.hint}</small>}
   </label>)}
  </div>
  {message&&<p role="status" className={'supervision-notice'+(message.startsWith('Save failed')?' error':'')}>{message}</p>}
 </section>;
}

function DueDateEditor({assignment,editable}:{assignment:Assignment;editable:boolean}){
 const router=useRouter();
 const fmt=(iso:string|null)=>{
  if(!iso)return '';
  const d=new Date(iso);
  const p=(n:number)=>String(n).padStart(2,'0');
  return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())+'T'+p(d.getHours())+':'+p(d.getMinutes());
 };
 const [date,setDate]=useState(fmt(assignment.dueAt));
 const [busy,setBusy]=useState(false),[message,setMessage]=useState('');
 const locked=assignment.status==='submitted'||assignment.status==='claimed'||assignment.status==='revision_requested'||assignment.status==='finalized';
 async function saveDue(){
  setBusy(true);setMessage('');
  const {error}=await browserClient().rpc('set_supervision_homework_due',{p_assignment:assignment.id,
   p_due:date?new Date(date).toISOString():null});
  setMessage(error?'Unable to set due date: '+error.message:'Due date updated.');
  setBusy(false);if(!error)router.refresh();
 }
 if(!editable||locked)return <span>{assignment.dueAt?'Due '+new Date(assignment.dueAt).toLocaleString():'No deadline'}</span>;
 return <div className="supervision-due-editor">
  <input type="datetime-local" aria-label={'Due date for '+assignment.title} value={date} onChange={e=>setDate(e.target.value)}/>
  <button type="button" disabled={busy} onClick={()=>void saveDue()}>{busy?'…':'Save due'}</button>
  {message&&<small role="status">{message}</small>}
 </div>;
}

export function StudentPortfolioEditor({studentId,role,name,metrics,stats,detail,fileCreatedAt}:{studentId:string;role:string;name:string;
 metrics:ReturnType<typeof import('@/lib/supervision').indicators>;stats:SupervisionRow;detail:Details;fileCreatedAt:string|null}){
 const rank=roleRank(role),assignments=detail.assignments||[];
 const metricCards=[
  ['Hours invested',metrics.hours.toFixed(1)+'h','Confirmed credit'],
  ['Lessons completed',String(stats.completed_count)+' / '+String(stats.assigned_count),'Teacher-finalized'],
  ['Mastery',displayPercent(metrics.mastery),'Assessment-based'],
  ['Streak',metrics.streak+' days','Continuous active dates'],
  ['Days active',metrics.active30+' / 30','Recorded learning days'],
  ['Homework assiduity',displayPercent(metrics.homework),stats.homework_due_count?stats.homework_ontime_count+' / '+stats.homework_due_count+' on time':'No due dates']
 ];
 return <>
  <div className="supervision-kpis">{metricCards.map(([label,value,hint])=><div className="supervision-kpi" key={label}>
   <p>{label}</p><strong>{value}</strong><small>{hint}</small>
  </div>)}</div>
  <div className="supervision-student-summary">
   <div><strong>Student:</strong> {name}</div><div><strong>Enrolled:</strong> {stats.enrolled_at?new Date(stats.enrolled_at).toLocaleDateString('en-GB'):'—'}</div><div><strong>File created:</strong> {fileCreatedAt?new Date(fileCreatedAt).toLocaleDateString('en-GB'):'—'}</div>
   <div><strong>Mentors:</strong> {(detail.staff||[]).map(s=>s.name+' ('+s.hierarchy+')').join(', ')||'Unassigned'}</div>
   <div><strong>Last learning activity:</strong> {stats.last_activity||'No activity logged'}</div>
   {detail.notionPageUrl&&<div><a href={detail.notionPageUrl} target="_blank" rel="noopener noreferrer">Open related Notion record ↗</a></div>}
  </div>
  {definitions.map(d=>{
   const contents=detail[d.section];
   if(contents===null||contents===undefined)return null;
   return <EditSection key={d.section} studentId={studentId} section={d.section} title={d.title} description={d.description}
    fields={d.fields} initial={contents} rank={d.rank} userRank={rank}/>;
  })}
  <section className="supervision-section">
   <div className="supervision-section-heading"><div><p className="supervision-eyebrow">LEARNING EVIDENCE</p><h2>Assigned lessons</h2></div><span className="supervision-count">{assignments.length} assignments</span></div>
   <div className="supervision-assignments">{assignments.length?assignments.map(a=><div key={a.id} className="supervision-assignment">
    <div><strong>{a.title}</strong><small>{a.code}</small></div>
    <span>{a.status?.replaceAll('_',' ')||'Not started'}</span>
    <DueDateEditor assignment={a} editable={rank>=3}/>
   </div>):<p>No lesson assignments yet.</p>}</div>
   <p className="supervision-footnote">School records are stored separately from the reference Notion page. These fields do not synchronize automatically with Notion.</p>
  </section>
  <Link className="supervision-back" href="/teacher">← Back to supervision</Link>
 </>;
}
