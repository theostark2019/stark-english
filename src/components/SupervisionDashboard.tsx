'use client';
import {useMemo,useState} from 'react';
import Link from 'next/link';
import {indicators,localDay,displayPercent,type SupervisionRow,type Hierarchy} from '@/lib/supervision';

export function SupervisionDashboard({rows,staffRole,registryCount=0}:{rows:SupervisionRow[];staffRole:Hierarchy;registryCount?:number}){
 const [query,setQuery]=useState('');
 const [course,setCourse]=useState('all');
 const [attention,setAttention]=useState('all');
 const [order,setOrder]=useState('name');
 const today=localDay();
 const enhanced=useMemo(()=>rows.map(r=>({...r,metrics:indicators(r,today)})),[rows,today]);
 const courses=[...new Set(rows.flatMap(r=>r.courses||[]))].sort();
 const filtered=useMemo(()=>{
  const q=query.toLocaleLowerCase().trim();
  return enhanced.filter(r=>(!q||[r.student_name,...(r.courses||[]),String(r.academic_fields?.Group||''),String(r.academic_fields?.CEFR||'')].join(' ').toLocaleLowerCase().includes(q))
  &&(course==='all'||r.courses?.includes(course))
  &&(attention==='all'||r.metrics.flag===attention))
  .sort((a,b)=>order==='active'?(b.metrics.active30-a.metrics.active30):
   order==='homework'?((a.metrics.homework??101)-(b.metrics.homework??101)):
   order==='streak'?(b.metrics.streak-a.metrics.streak):a.student_name.localeCompare(b.student_name));
 },[enhanced,query,course,attention,order]);
 const enrolled=enhanced.length;
 const sum=(f:(r:typeof enhanced[number])=>number)=>enhanced.reduce((n,r)=>n+f(r),0);
 const assessed=enhanced.filter(r=>r.metrics.mastery!==null);
 const homework=enhanced.filter(r=>r.metrics.homework!==null);
 const kpis=[
  {label:'Enrolled students',value:String(enrolled),hint:'Students visible to your role',icon:'♟'},
  {label:'Hours invested',value:sum(r=>r.metrics.hours).toFixed(1)+'h',hint:'Confirmed learning credit',icon:'◷'},
  {label:'Content acquired',value:String(sum(r=>Number(r.completed_count||0))),hint:'Teacher-finalized lessons',icon:'✓'},
  {label:'Efficiency',value:sum(r=>Number(r.assigned_count||0))?Math.round(sum(r=>Number(r.completed_count||0))/sum(r=>Number(r.assigned_count||0))*100)+'%':'—',hint:'Finalized / assigned lessons',icon:'↗'},
  {label:'Average streak',value:(enrolled?sum(r=>r.metrics.streak)/enrolled:0).toFixed(1),hint:'Consecutive learning days',icon:'♨'},
  {label:'Effectiveness',value:assessed.length?Math.round(sum(r=>r.metrics.mastery??0)/assessed.length)+'%':'—',hint:'Only assessed mastery',icon:'◎'},
  {label:'Active in 30 days',value:String(enhanced.filter(r=>r.metrics.active30>0).length),hint:'At least one saved learning day',icon:'◉'},
  {label:'Homework assiduity',value:homework.length?Math.round(homework.reduce((x,r)=>x+Number(r.homework_ontime_count),0)/homework.reduce((x,r)=>x+Number(r.homework_due_count),0)*100)+'%':'—',hint:'Submitted on time / homework due',icon:'▣'},
  {label:'Needs follow-up',value:String(enhanced.filter(r=>r.metrics.flag!=='On track').length),hint:'Inactivity or missed homework',icon:'!'}
 ];
 return <div className="supervision-home">
  <div className="supervision-hero">
   <div><p className="supervision-eyebrow">STARK LEARNING / STAFF WORKSPACE</p>
    <h1>Student supervision</h1>
    <p>Follow engagement, evidence and learning progress across your authorized students.</p>
    <span className="supervision-role">{staffRole} · {new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'})}</span>
   </div>
   <div className="supervision-hero-actions">{registryCount>0&&<Link href="/teacher/imported">Notion: {registryCount} alunos →</Link>}<Link href="/teacher/staff">Staff directory →</Link><Link href="/teacher/profile">My staff profile →</Link><Link href="/teacher/reviews">Teacher reviews →</Link><Link href="/teacher/course-requests">Course choices →</Link></div>
  </div>
  {registryCount>0&&<div className="notion-import-banner"><div><strong>{registryCount} alunos cadastrados com curso e professor</strong><p>O dataset inicial do Notion já possui curso e professor responsável definidos. Acompanhe e ajuste as atribuições na ficha de cada aluno. O vínculo com as contas de login ainda será feito individualmente; os alunos importados não entram nos KPIs de atividade do LMS.</p></div><Link href="/teacher/imported">Ver alunos importados →</Link></div>}
  <div className="supervision-kpis">{kpis.map(k=><div className="supervision-kpi" key={k.label}>
    <span className="supervision-kpi-glyph">{k.icon}</span><p>{k.label}</p><strong>{k.value}</strong><small>{k.hint}</small>
   </div>)}</div>
  <section className="supervision-section">
   <div className="supervision-section-heading"><div><p className="supervision-eyebrow">STUDENT ROSTER</p><h2>Follow every learner in your scope</h2></div>
     <span className="supervision-count">{filtered.length} shown / {rows.length} enrolled</span></div>
   <div className="supervision-filters">
    <label>Search<input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Name, course, group or level"/></label>
    <label>Course<select value={course} onChange={e=>setCourse(e.target.value)}><option value="all">All courses</option>{courses.map(c=><option key={c}>{c}</option>)}</select></label>
    <label>Attention<select value={attention} onChange={e=>setAttention(e.target.value)}><option value="all">All students</option><option>On track</option><option>Inactive 7+ days</option><option>Homework follow-up</option></select></label>
    <label>Sort<select value={order} onChange={e=>setOrder(e.target.value)}><option value="name">Name A–Z</option><option value="active">Most active</option><option value="streak">Longest streak</option><option value="homework">Lowest homework score</option></select></label>
   </div>
   <div className="supervision-table-wrap">
    <table className="supervision-table"><thead><tr>
     <th>Student</th><th>Progress</th><th>Streak</th><th>Days active / 30</th><th>Homework assiduity</th><th>Status</th><th></th>
    </tr></thead>
    <tbody>{filtered.map(r=><tr key={r.student_id}>
     <td><Link className="supervision-student-name" href={'/teacher/students/'+r.student_id}>{r.student_name}</Link>
      <div className="supervision-sub">{r.courses?.join(', ')||'No course'} · {Array.isArray(r.academic_fields?.CEFR)?(r.academic_fields.CEFR as string[]).join(', '):String(r.academic_fields?.CEFR||'Unplaced')}</div>
     </td>
     <td><strong>{r.completed_count}/{r.assigned_count}</strong><div className="supervision-meter"><span style={{width:(r.metrics.completion??0)+'%'}}/></div><span className="supervision-sub">{displayPercent(r.metrics.completion)} completed</span></td>
     <td><strong>{r.metrics.streak} <small>days</small></strong></td>
     <td><strong>{r.metrics.active30} <small>/ 30</small></strong></td>
     <td><strong>{displayPercent(r.metrics.homework)}</strong><div className="supervision-sub">{r.homework_due_count?r.homework_ontime_count+' of '+r.homework_due_count+' due':'No due dates recorded'}</div></td>
     <td><span className={'supervision-state '+(r.metrics.flag==='On track'?'okay':'attention')}>{r.metrics.flag}</span></td>
     <td><Link className="supervision-view" href={'/teacher/students/'+r.student_id}>Open file →</Link></td>
    </tr>)}</tbody></table>
    {!filtered.length&&<div className="supervision-empty">No students match these filters.</div>}
   </div>
  </section>
  <p className="supervision-footnote">Streak counts consecutive dates with recorded work (today, or yesterday if today is not yet active). Days active counts days with saved answers, uploads or submissions in the last 30 calendar days. Homework assiduity counts on-time submissions divided by assignments due in the last 30 days; “—” means no deadlines are available. Reading a lesson without saving work does not count as activity.</p>
 </div>;
}
