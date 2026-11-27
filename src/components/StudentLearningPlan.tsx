'use client';
import {useMemo,useState} from 'react';
import {useRouter} from 'next/navigation';
import {browserClient} from '@/lib/supabase/browser';

export type LearningGoal={
 id:string;student_id:string;title:string;description:string;domain:string;
 target_value:number;progress_value:number;due_on:string|null;status:'active'|'paused'|'achieved';
 achieved_at:string|null;created_at:string;updated_at:string;created_by:string;
};
export type LearningEvent={
 id:string;goalId:string;eventType:string;units:number;note:string;createdAt:string;
 actorName:string;assignmentId:string|null;episodeTitle:string|null;
};
export type GoalLink={
 goalId:string;assignmentId:string;code:string;title:string;createdAt:string;
};
export type TeacherFeedback={
 id:string;episode:string;code:string;feedback:string;outcome:string;
 createdAt:string;teacherName:string;
};
export type StudentLearningRecord={
 goals:LearningGoal[];goalEvents:LearningEvent[];goalAssignments:GoalLink[];
 feedback:TeacherFeedback[];
};
export type AssignableEpisode={
 episode_id:string;episode_title:string;episode_code:string;episode_level:string;
 series_name:string;course_title:string;assigned_id:string|null;
};
export type StudentLesson={
 id:string;code:string;title:string;dueAt:string|null;submittedAt:string|null;status:string|null;
};
const domains=['Speaking','Listening','Reading','Writing','Vocabulary','Grammar','Professional English','Study habits','Assessment','Other'];
const formatDate=(raw:string|null,withTime=false)=>{
 if(!raw)return 'Not scheduled';
 const d=withTime?new Date(raw):new Date(raw+'T12:00:00');
 return Number.isNaN(d.getTime())?raw:d.toLocaleDateString('en-GB',{year:'numeric',month:'short',day:'numeric',...(withTime?{hour:'2-digit' as const,minute:'2-digit' as const}:{})});
};
function Status({status,success}:{status:string;success:boolean}){
 return status?<p role="status" className={'supervision-notice'+(success?'':' error')}>{status}</p>:null;
}
function ProgressForm({goal,assignments,refresh}:{goal:LearningGoal;assignments:StudentLesson[];refresh:()=>void}){
 const remaining=goal.target_value-goal.progress_value;
 const [note,setNote]=useState(''),[amount,setAmount]=useState(remaining===1?1:1);
 const [assignment,setAssignment]=useState('');
 const [busy,setBusy]=useState(false),[message,setMessage]=useState(''),[okay,setOkay]=useState(true);
 async function record(){
  setBusy(true);setMessage('');
  const {error}=await browserClient().rpc('supervision_record_goal_progress',{
   p_goal:goal.id,p_units:Math.min(amount,remaining),p_note:note.trim(),p_assignment:assignment||null
  });
  setOkay(!error);
  setMessage(error?error.message:'Evidence saved. The student record has been updated.');
  if(!error){setNote('');refresh();}
  setBusy(false);
 }
 return <div className="learning-evidence-editor">
  <label>Progress confirmed <input type="number" min={1} max={remaining} step={1} value={amount} onChange={e=>setAmount(Math.min(remaining,Math.max(1,Number(e.target.value)||1)))}/><span>of {remaining} remaining</span></label>
  <label>Related assignment (optional)
   <select value={assignment} onChange={e=>setAssignment(e.target.value)}>
    <option value="">Evidence not linked to a lesson</option>
    {assignments.map(a=><option value={a.id} key={a.id}>{a.code} · {a.title}</option>)}
   </select></label>
  <label className="learning-wide">Teacher evidence / reason for progress
   <textarea rows={2} maxLength={2500} value={note} placeholder="What did the student demonstrate? What evidence was assessed?" onChange={e=>setNote(e.target.value)}/>
  </label>
  <button type="button" className="supervision-save" disabled={busy||note.trim().length<8} onClick={()=>void record()}>{busy?'Recording…':amount>=remaining?'Confirm achievement':'Record progress'}</button>
  <Status status={message} success={okay}/>
 </div>;
}
export function StudentLearningPlan({studentId,rank,record,episodes,assignments}:{
 studentId:string;rank:number;record:StudentLearningRecord;
 episodes:AssignableEpisode[];assignments:StudentLesson[];
}){
 const router=useRouter();
 const goals=record.goals||[],events=record.goalEvents||[],links=record.goalAssignments||[],feedback=record.feedback||[];
 const [createOpen,setCreateOpen]=useState(false),[assignOpen,setAssignOpen]=useState(false);
 const [goalFilter,setGoalFilter]=useState('all');
 const [title,setTitle]=useState(''),[domain,setDomain]=useState('Speaking');
 const [description,setDescription]=useState(''),[target,setTarget]=useState(1),[due,setDue]=useState('');
 const [episode,setEpisode]=useState(''),[lessonDue,setLessonDue]=useState(''),[goalToLink,setGoalToLink]=useState('');
 const [busy,setBusy]=useState(false),[message,setMessage]=useState(''),[okay,setOkay]=useState(true);
 const [editing,setEditing]=useState<string|null>(null);
 const [statusEditing,setStatusEditing]=useState<string|null>(null);
 const refresh=()=>router.refresh();
 const active=goals.filter(g=>g.status==='active').length;
 const achieved=goals.filter(g=>g.status==='achieved').length;
 const displayed=goals.filter(g=>goalFilter==='all'||g.status===goalFilter);
 const selectedEpisode=episodes.find(x=>x.episode_id===episode);
 const canLinkGoal=goals.some(g=>g.id===goalToLink);
 const summary=useMemo(()=>({
  inProgress:goals.reduce((sum,g)=>sum+g.progress_value,0),
  milestones:goals.reduce((sum,g)=>sum+g.target_value,0),
  linked:new Set(links.map(l=>l.assignmentId)).size
 }),[goals,links]);
 async function createGoal(){
  if(rank<2)return;
  setBusy(true);setMessage('');
  const {error}=await browserClient().rpc('supervision_create_goal',{
   p_student:studentId,p_title:title.trim(),p_domain:domain,p_description:description.trim(),
   p_target:target,p_due:due||null
  });
  setOkay(!error);setMessage(error?error.message:'Learning goal created.');
  if(!error){setTitle('');setDue('');setDescription('');setCreateOpen(false);refresh();}
  setBusy(false);
 }
 async function setState(g:LearningGoal){
  if(rank<2)return;
  setStatusEditing(g.id);setMessage('');
  const next=g.status==='paused'?'active':'paused';
  const {error}=await browserClient().rpc('supervision_set_goal_state',{
   p_goal:g.id,p_state:next,p_note:next==='paused'?'Teaching plan paused':'Teaching plan resumed'
  });
  setOkay(!error);setMessage(error?error.message:'Goal status updated.');
  if(!error)refresh();
  setStatusEditing(null);
 }
 async function assign(){
  if(rank<3)return;
  setBusy(true);setMessage('');
  const {error}=await browserClient().rpc('supervision_assign_lesson',{
   p_student:studentId,p_episode:episode,p_due:lessonDue?new Date(lessonDue).toISOString():null,
   p_goal:goalToLink||null
  });
  setOkay(!error);
  setMessage(error?error.message:selectedEpisode?.assigned_id?'Existing lesson linked to the selected goal.':'Lesson assigned to the student.');
  if(!error){setLessonDue('');setGoalToLink('');setEpisode('');setAssignOpen(false);refresh();}
  setBusy(false);
 }
 return <>
  <section className="supervision-section learning-record-section" id="learning-goals">
   <div className="supervision-section-heading">
    <div><p className="supervision-eyebrow">PEDAGOGICAL ROADMAP</p><h2>Learning goals & achievements</h2>
      <p>Targets, teacher-confirmed evidence and a permanent record of what has been accomplished.</p></div>
    {rank>=2&&<button type="button" className="supervision-save" onClick={()=>{setCreateOpen(!createOpen);setAssignOpen(false);}}>{createOpen?'Close form':'+ Set a goal'}</button>}
   </div>
   <div className="learning-summary">
    <div><strong>{active}</strong><span>Active goals</span></div>
    <div><strong>{achieved}</strong><span>Goals accomplished</span></div>
    <div><strong>{summary.inProgress}/{summary.milestones}</strong><span>Confirmed milestones</span></div>
    <div><strong>{summary.linked}</strong><span>Lessons linked to goals</span></div>
   </div>
   {createOpen&&rank>=2&&<div className="learning-form">
    <div className="supervision-form-grid">
      <label className="supervision-field wide"><span>Learning goal</span><input maxLength={180} value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Explain soil sampling clearly in English"/></label>
      <label className="supervision-field"><span>Skill area</span><select value={domain} onChange={e=>setDomain(e.target.value)}>{domains.map(d=><option key={d}>{d}</option>)}</select></label>
      <label className="supervision-field"><span>Milestones to achieve</span><input type="number" min={1} max={1000} value={target} onChange={e=>setTarget(Math.min(1000,Math.max(1,Number(e.target.value)||1)))}/></label>
      <label className="supervision-field"><span>Target date (optional)</span><input type="date" value={due} onChange={e=>setDue(e.target.value)}/></label>
      <label className="supervision-field wide"><span>Success criteria / observable outcome</span><textarea rows={3} maxLength={2500} placeholder="Describe what the student must demonstrate to achieve the goal." value={description} onChange={e=>setDescription(e.target.value)}/></label>
    </div>
    <button type="button" className="supervision-save" onClick={()=>void createGoal()} disabled={busy||title.trim().length<3}>{busy?'Saving…':'Save learning goal'}</button>
   </div>}
   {goals.length>0&&<div className="learning-filter" aria-label="Filter learning goals">
    {['all','active','achieved','paused'].map(f=><button key={f} type="button" className={goalFilter===f?'current':''} onClick={()=>setGoalFilter(f)}>{f==='all'?'All goals':f==='achieved'?'Accomplished':f==='active'?'In progress':'Paused'}</button>)}
   </div>}
   {!goals.length&&<div className="supervision-empty learning-no-goals"><strong>No learning goals recorded yet.</strong><p>Set a measurable target and confirm each milestone with teaching evidence. No achievements will be invented from lesson views.</p></div>}
   {goals.length>0&&!displayed.length&&<div className="supervision-empty">No goals in this category.</div>}
   <div className="learning-goals-grid">
    {displayed.map(g=>{
     const pct=Math.round(g.progress_value/g.target_value*100);
     const ownEvents=events.filter(e=>e.goalId===g.id);
     const ownLinks=links.filter(x=>x.goalId===g.id);
     const open=editing===g.id;
     return <article key={g.id} className={'learning-goal-card '+(g.status==='achieved'?'completed':'')}>
      <div className="learning-goal-top"><span className="learning-domain">{g.domain}</span><span className={'learning-goal-state '+g.status}>{g.status==='achieved'?'✓ Accomplished':g.status==='paused'?'Paused':'In progress'}</span></div>
      <h3>{g.title}</h3>
      {g.description&&<p className="learning-goal-description">{g.description}</p>}
      <div className="learning-goal-dates"><span>Target: {formatDate(g.due_on)}</span>{g.achieved_at&&<strong>Achieved {formatDate(g.achieved_at,true)}</strong>}</div>
      <div className="learning-goal-progress"><div><strong>{g.progress_value} / {g.target_value} milestones</strong><span>{pct}%</span></div><div className="learning-goal-track"><span style={{width:pct+'%'}}/></div></div>
      {ownLinks.length>0&&<p className="learning-linked"><strong>Linked lessons:</strong> {ownLinks.map(x=>x.code+' · '+x.title).join('; ')}</p>}
      {ownEvents.length>0&&<details className="learning-history"><summary>Evidence history ({ownEvents.length})</summary>
       {ownEvents.map(e=><div key={e.id} className="learning-history-event">
        <span>{formatDate(e.createdAt,true)} · {e.actorName}</span>
        <strong>{e.eventType==='achieved'?'Achievement confirmed':e.eventType==='progress'?'Progress recorded':e.eventType==='created'?'Goal created':e.eventType==='paused'?'Goal paused':'Goal resumed'}{e.units>0?' · +'+e.units:''}</strong>
        <p>{e.note}</p>{e.episodeTitle&&<small>Evidence: {e.episodeTitle}</small>}
       </div>)}</details>}
      {rank>=2&&g.status!=='achieved'&&<div className="learning-goal-actions">
       {g.status==='active'&&<button type="button" onClick={()=>setEditing(open?null:g.id)}>{open?'Close evidence form':'+ Record progress'}</button>}
       <button type="button" disabled={statusEditing===g.id} onClick={()=>void setState(g)}>{statusEditing===g.id?'Updating…':g.status==='paused'?'Resume goal':'Pause goal'}</button>
      </div>}
      {g.status==='active'&&rank>=2&&open&&<ProgressForm key={g.id} goal={g} assignments={assignments} refresh={refresh}/>}
     </article>;
    })}
   </div>
   <Status status={message} success={okay}/>
  </section>

  <section className="supervision-section learning-record-section" id="assignments">
   <div className="supervision-section-heading"><div><p className="supervision-eyebrow">TEACHING PLAN</p><h2>Assign new lessons</h2>
     <p>Choose a published episode from the student's enrolled course, set an optional deadline and connect it to a learning goal.</p></div>
    {rank>=3&&<button type="button" className="supervision-save" onClick={()=>{setAssignOpen(!assignOpen);setCreateOpen(false);}}>{assignOpen?'Close form':'+ Assign a lesson'}</button>}
   </div>
   {rank===1&&<p className="supervision-footnote">Monitors can see assigned work; lesson assignment requires Teacher permissions.</p>}
   {rank===2&&<p className="supervision-footnote">Instructor profiles can review evidence and record goals. New assignments require Teacher permissions or higher.</p>}
   {assignOpen&&rank>=3&&<div className="learning-form">
    <div className="supervision-form-grid">
     <label className="supervision-field wide"><span>Published course episode</span><select value={episode} onChange={e=>setEpisode(e.target.value)}><option value="">Choose a lesson</option>
      {episodes.map(e=><option key={e.episode_id} value={e.episode_id}>{e.course_title} · {e.series_name} · {e.episode_code} {e.episode_title}{e.assigned_id?' (already assigned)':''}</option>)}
     </select></label>
     <label className="supervision-field"><span>Due date (optional)</span><input type="datetime-local" value={lessonDue} onChange={e=>setLessonDue(e.target.value)} disabled={Boolean(selectedEpisode?.assigned_id)}/></label>
     <label className="supervision-field"><span>Link to an existing goal (optional)</span><select value={goalToLink} onChange={e=>setGoalToLink(e.target.value)}><option value="">No goal</option>
      {goals.filter(g=>g.status!=='paused').map(g=><option key={g.id} value={g.id}>{g.title}</option>)}</select></label>
    </div>
    {selectedEpisode?.assigned_id&&<p className="supervision-footnote">This lesson is already assigned. You can link it to a goal without creating a duplicate or changing its deadline.</p>}
    <button type="button" className="supervision-save" disabled={busy||!selectedEpisode||(Boolean(selectedEpisode.assigned_id)&&!canLinkGoal)} onClick={()=>void assign()}>{busy?'Saving…':selectedEpisode?.assigned_id?'Link existing lesson to goal':'Assign lesson to student'}</button>
   </div>}
   {!assignOpen&&<p className="learning-shortcut">Assignment status, submission history and editable deadlines are shown in <strong>Assigned lessons</strong> below. Completed learning goals are recorded independently of whether an assignment was opened.</p>}
  </section>

  <section className="supervision-section learning-record-section" id="teacher-feedback">
   <div className="supervision-section-heading"><div><p className="supervision-eyebrow">DOCUMENTED FEEDBACK</p><h2>Teacher reviews & improvement history</h2>
    <p>Feedback captured when lessons are reviewed, with the outcome and assessment date.</p></div><span className="supervision-count">{feedback.length} reviews</span></div>
   {!feedback.length&&<p className="supervision-footnote">No reviewed lessons yet. Feedback will appear after a teacher reviews a submitted lesson.</p>}
   {feedback.map(r=><article className="learning-feedback-entry" key={r.id}>
    <div><strong>{r.code} · {r.episode}</strong><span>{formatDate(r.createdAt,true)}</span></div>
    <p>{r.feedback}</p><small>{r.teacherName} · {r.outcome==='finalized'?'Finalized':'Revision requested'}</small>
   </article>)}
  </section>
 </>;
}
