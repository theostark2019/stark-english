'use client';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import {browserClient} from '@/lib/supabase/browser';
import {monthlyTuition,brl,starkDate,type StudentRelationshipRecord} from '@/lib/stark02';
type Option={id:string;name:string};
type PlanInput={minutes:number;price:string;times_per_week:number};
export function StudentRelationship({studentId,record,courses=[],teachers=[],assignments=[]}:{studentId:string;record:StudentRelationshipRecord;courses?:Option[];teachers?:Option[];assignments?:{id:string;title:string}[]}){
 const router=useRouter();
 const [busy,setBusy]=useState(false),[message,setMessage]=useState(''),[okay,setOkay]=useState(false);
 const [course,setCourse]=useState(courses[0]?.id||''),[start,setStart]=useState(''),[end,setEnd]=useState('');
 const [plans,setPlans]=useState<PlanInput[]>([{minutes:30,price:'',times_per_week:1}]);
 const [planId,setPlanId]=useState(''),[teacherId,setTeacherId]=useState(teachers[0]?.id||''),[meetingStart,setMeetingStart]=useState('');
 const [tuitionContract,setTuitionContract]=useState(''),[month,setMonth]=useState('');
 const [fromMeeting,setFromMeeting]=useState(''),[homework,setHomework]=useState(''),[amount,setAmount]=useState(1),[unit,setUnit]=useState('lesson'),[assignment,setAssignment]=useState('');
 const active=record.contracts.filter(c=>c.status==='active');
 const planRows=active.flatMap(c=>c.plans.map(p=>({...p,course:c.course})));
 const inputPlans=plans.map(p=>({minutes:p.minutes,price_cents:Math.round(Number(p.price.replace(',','.'))*100),times_per_week:p.times_per_week}));
 const validPlans=inputPlans.every((p,i)=>plans[i].price.trim()!==''&&Number.isFinite(p.price_cents)&&p.price_cents>=0);
 async function action(name:string,params:Record<string,unknown>,success:string){
  setBusy(true);setMessage('');
  try{const {error}=await browserClient().rpc(name,params);if(error)throw error;setOkay(true);setMessage(success);router.refresh();return true}
  catch(e){setOkay(false);setMessage(String((e as {message?:string}).message||e));return false}
  finally{setBusy(false)}
 }
 function changePlan(i:number,patch:Partial<PlanInput>){setPlans(ps=>ps.map((p,n)=>n===i?{...p,...patch}:p))}
 const next=record.meetings.find(m=>m.status==='scheduled'&&new Date(m.starts_at).getTime()>Date.now());
 return <div className="a02-relationship">
  {message&&<p role="status" className={okay?'success':'error'}>{message}</p>}
  <section className="a02-file-section"><div className="a02-heading"><div><p className="a02-eyebrow">THE COURSE IN YOUR LIFE</p><h2>Meetings & commitments</h2></div><Link href="/courses/agroenglish">Choose an AgroEnglish skill →</Link></div>
   <div className="a02-file-summary"><div><small>Next meeting</small><strong>{next?starkDate(next.starts_at,true):'Not scheduled'}</strong><span>{next?next.minutes+' min with '+next.teacher:'Your teacher will agree the next meeting with you.'}</span></div>
    <div><small>Learning commitments</small><strong>{record.commitments.length}</strong><span>Chosen work, deadlines and evidence</span></div>
    <div><small>Teacher feedback</small><strong>{record.commitments.filter(c=>c.status==='revision_requested').length} to revisit</strong><span>Revise after feedback and try again</span></div></div>
   {record.commitments.length===0?<p>No v0.2 commitments yet. Choose a task and agree how much work you will do.</p>:<div className="a02-list">{record.commitments.map(c=><Link key={c.id} href={'/lessons/'+c.assignment_id}><div><strong>{c.title}</strong><small>{c.amount} {c.unit}{Number(c.amount)===1?'':'s'} · {c.dueAt?'Due '+starkDate(c.dueAt,true):'Deadline not set'}</small></div><span>{c.status?.replaceAll('_',' ')||'committed'} →</span></Link>)}</div>}
   {assignments.length>0&&<details><summary>All assigned work · including earlier lessons</summary><div className="a02-list">{assignments.map(a=><Link key={a.id} href={'/lessons/'+a.id}>{a.title} →</Link>)}</div></details>}
  </section>
  <section className="a02-file-section"><p className="a02-eyebrow">FROM ONE MEETING TO THE NEXT</p><h2>Homework</h2><p>Homework can be a lesson, a chapter, an hour or another agreed amount. It is due at the next scheduled meeting in that contract.</p>
   {record.homework.length===0?<p className="muted">No homework recorded here yet.</p>:<div className="a02-list">{record.homework.map(h=><article key={h.id}><div><strong>{h.label}</strong><small>{h.amount} {h.unit}{Number(h.amount)===1?'':'s'} · Due {starkDate(h.dueAt,true)}</small></div>{h.assignment_id&&<Link href={'/lessons/'+h.assignment_id}>Open work →</Link>}</article>)}</div>}
   {record.canTeach&&<details><summary>Assign homework from a meeting</summary><form className="a02-form-grid" onSubmit={e=>{e.preventDefault();void action('stark02_assign_homework',{p_meeting:fromMeeting,p_label:homework,p_amount:amount,p_unit:unit,p_assignment:assignment||null},'Homework assigned. Its deadline is the next scheduled meeting.')}}>
    <label>Meeting<select required value={fromMeeting} onChange={e=>setFromMeeting(e.target.value)}><option value="">Choose the meeting…</option>{record.meetings.filter(m=>m.status!=='cancelled').map(m=><option key={m.id} value={m.id}>{starkDate(m.starts_at,true)} · {m.status}</option>)}</select></label>
    <label>Work to do<input required minLength={3} maxLength={300} value={homework} onChange={e=>setHomework(e.target.value)} placeholder="e.g. Greet a visiting agronomist"/></label>
    <label>Amount<input required type="number" min="0.25" max="1000" step="0.25" value={amount} onChange={e=>setAmount(Number(e.target.value))}/></label>
    <label>Unit<select value={unit} onChange={e=>setUnit(e.target.value)}>{['lesson','episode','chapter','activity','minute','hour'].map(u=><option key={u}>{u}</option>)}</select></label>
    <label className="a02-wide">Related platform assignment (optional)<select value={assignment} onChange={e=>setAssignment(e.target.value)}><option value="">Other agreed work</option>{assignments.map(a=><option key={a.id} value={a.id}>{a.title}</option>)}</select></label>
    <button disabled={busy||!fromMeeting||homework.trim().length<3}>Assign · due next meeting</button></form></details>}
  </section>
  <section className="a02-file-section"><p className="a02-eyebrow">THE TIMED RELATIONSHIP WITH STARK</p><h2>Contracts & meeting arrangements</h2>
   {record.contracts.length===0?<p className="muted">No v0.2 contract has been recorded. Existing contract references remain in the original student file.</p>:record.contracts.map(c=><article className="a02-contract" key={c.id}><div className="a02-heading"><div><h3>{c.course}</h3><p>{starkDate(c.starts_on)} – {starkDate(c.ends_on)} · {c.status}</p></div>{c.monthlyCents!==null&&<div className="a02-price"><strong>{brl(Number(c.monthlyCents))}</strong><span>monthly tuition</span></div>}</div>
    {c.plans.map(p=><p key={p.id}>{p.times_per_week} × {p.minutes}-minute meeting{p.times_per_week===1?'':'s'} per week{p.price_cents!==null?' · '+brl(p.price_cents)+' per meeting':''}</p>)}
    {c.monthlyCents!==null&&<small>Four times the agreed weekly meeting cost. Calendar months with five occurrences do not change this calculation.</small>}</article>)}
   {record.canManage&&<details><summary>Record a contract</summary><form className="a02-form-grid" onSubmit={e=>{e.preventDefault();void action('stark02_create_contract',{p_student:studentId,p_course:course,p_start:start,p_end:end,p_plans:inputPlans},'Contract and meeting arrangements recorded.')}}>
    <label>Course<select required value={course} onChange={e=>setCourse(e.target.value)}>{courses.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
    <label>Starts on<input required type="date" value={start} onChange={e=>setStart(e.target.value)}/></label><label>Ends on<input required type="date" min={start} value={end} onChange={e=>setEnd(e.target.value)}/></label>
    <div className="a02-wide a02-plan-inputs">{plans.map((p,i)=><div key={i} className="a02-plan-row"><label>Minutes<select value={p.minutes} onChange={e=>changePlan(i,{minutes:Number(e.target.value)})}><option value={30}>30</option><option value={60}>60</option></select></label>
     <label>Price per meeting (R$)<input required inputMode="decimal" type="number" min="0" max="1000000" step="0.01" value={p.price} onChange={e=>changePlan(i,{price:e.target.value})}/></label>
     <label>Times per week<input required type="number" min="1" max="14" value={p.times_per_week} onChange={e=>changePlan(i,{times_per_week:Number(e.target.value)})}/></label>{plans.length>1&&<button type="button" className="secondary" onClick={()=>setPlans(p=>p.filter((_,n)=>n!==i))}>Remove</button>}</div>)}
     <button type="button" className="a02-text-button" disabled={plans.length>=8} onClick={()=>setPlans(p=>[...p,{minutes:60,price:'',times_per_week:1}])}>+ Add another meeting arrangement</button></div>
    <p className="a02-wide a02-form-total">Monthly tuition = 4 × weekly cost = <strong>{validPlans?brl(monthlyTuition(inputPlans)):'Enter meeting prices'}</strong></p>
    <button disabled={busy||!validPlans||!course}>Record contract</button><small>No payments are collected by this action.</small></form></details>}
  </section>
  <section className="a02-file-section"><p className="a02-eyebrow">TIME WITH A TEACHER</p><h2>Meetings</h2>
   {record.meetings.length===0?<p className="muted">No meetings scheduled yet.</p>:<div className="a02-list">{record.meetings.map(m=><article key={m.id}><div><strong>{starkDate(m.starts_at,true)} · {m.minutes} minutes</strong><small>{m.teacher} · {m.status}{m.price_cents!==null?' · '+brl(m.price_cents):''}</small></div>{record.canTeach&&<div className="a02-actions"><button className="a02-text-button" disabled={busy||m.status==='held'} onClick={()=>void action('stark02_set_meeting_status',{p_meeting:m.id,p_status:'held'},'Meeting marked held.')}>Mark held</button><button className="a02-text-button" disabled={busy||m.status==='cancelled'} onClick={()=>void action('stark02_set_meeting_status',{p_meeting:m.id,p_status:'cancelled'},'Meeting marked cancelled.')}>Cancel</button></div>}</article>)}</div>}
   {record.canTeach&&<details><summary>Schedule a meeting</summary><form className="a02-form-grid" onSubmit={e=>{e.preventDefault();void action('stark02_schedule_meeting',{p_plan:planId,p_teacher:teacherId,p_start:new Date(meetingStart).toISOString()},'Meeting scheduled. Its duration and price follow the agreement.')}}>
    <label>Meeting arrangement<select required value={planId} onChange={e=>setPlanId(e.target.value)}><option value="">Choose an arrangement…</option>{planRows.map(p=><option key={p.id} value={p.id}>{p.course} · {p.minutes} min{p.price_cents!==null?' · '+brl(p.price_cents):''}</option>)}</select></label>
    <label>Teacher<select required value={teacherId} onChange={e=>setTeacherId(e.target.value)}><option value="">Choose a teacher…</option>{teachers.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></label>
    <label>Date & time<input required type="datetime-local" value={meetingStart} onChange={e=>setMeetingStart(e.target.value)}/><small>Times follow your device's local time.</small></label><button disabled={busy||!planId||!teacherId||!meetingStart}>Schedule meeting</button></form></details>}
  </section>
  {record.financial&&<section className="a02-file-section"><p className="a02-eyebrow">AGREED MONTHLY INVESTMENT</p><h2>Monthly tuition</h2><p>Amounts follow the four-week agreement. These records track tuition; marking one paid records a payment received outside the platform.</p>
   {record.tuitions.length===0?<p className="muted">No monthly tuitions recorded here yet.</p>:<div className="a02-list">{record.tuitions.map(t=><article key={t.id}><div><strong>{starkDate(t.month)} · {brl(Number(t.amount_cents))}</strong><small>{t.status}{t.paid_at?' · Received '+starkDate(t.paid_at):''}</small></div>{record.canManage&&t.status==='pending'&&<button className="secondary" disabled={busy} onClick={()=>void action('stark02_mark_tuition_paid',{p_tuition:t.id},'Payment recorded as received.')}>Record payment received</button>}</article>)}</div>}
   {record.canManage&&<details><summary>Record a monthly tuition</summary><form className="a02-form-grid" onSubmit={e=>{e.preventDefault();void action('stark02_record_tuition',{p_contract:tuitionContract,p_month:month+'-01'},'Monthly tuition recorded using the agreed four-week amount.')}}>
    <label>Contract<select required value={tuitionContract} onChange={e=>setTuitionContract(e.target.value)}><option value="">Choose a contract…</option>{active.map(c=><option key={c.id} value={c.id}>{c.course} · {c.monthlyCents!==null?brl(Number(c.monthlyCents)):''}</option>)}</select></label><label>Month<input required type="month" value={month} onChange={e=>setMonth(e.target.value)}/></label><button disabled={busy||!tuitionContract||!month}>Record tuition</button></form></details>}
  </section>}
 </div>;
}
