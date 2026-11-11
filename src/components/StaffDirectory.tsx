'use client';
import {useMemo,useState} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import {browserClient} from '@/lib/supabase/browser';
import {hierarchy,roleDescriptions,roleRank,type Hierarchy,type StaffProfile,type StaffCandidate,type SupervisionRow} from '@/lib/supervision';

type Scope={staff_id:string;student_id:string;active:boolean};
export function StaffDirectory({members,candidates,roster,scopes,role,currentUser}:{members:StaffProfile[];
 candidates:StaffCandidate[];roster:SupervisionRow[];scopes:Scope[];role:Hierarchy;currentUser:string}){
 const router=useRouter();
 const myRank=roleRank(role),canManage=myRank>=5;
 const [target,setTarget]=useState('');
 const [level,setLevel]=useState<Hierarchy>('Teacher');
 const [manager,setManager]=useState('');
 const [title,setTitle]=useState('');
 const [bio,setBio]=useState('');
 const [enabled,setEnabled]=useState(true);
 const [scopeStaff,setScopeStaff]=useState('');
 const [scopeStudent,setScopeStudent]=useState('');
 const [scopeEnabled,setScopeEnabled]=useState(true);
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState('');
 const selected=members.find(m=>m.user_id===target);
 const availableLevels=hierarchy.filter(x=>myRank===6||roleRank(x)<myRank);
 const manageCandidates=candidates.filter(c=>myRank===6||roleRank(c.current_level||'')<myRank);
 const managers=members.filter(m=>m.active&&roleRank(m.hierarchy)>roleRank(level));
 const assignable=members.filter(m=>m.active&&(myRank>=5?myRank>roleRank(m.hierarchy):
  role==='Leader'&&m.manager_id===currentUser&&roleRank(m.hierarchy)<4));
 const currentAssignments=useMemo(()=>scopes.filter(s=>s.staff_id===scopeStaff&&s.active),[scopes,scopeStaff]);
 function pickUser(user:string){
  setTarget(user);
  const m=members.find(x=>x.user_id===user);
  setLevel((m?.hierarchy||'Teacher') as Hierarchy);
  setManager(m?.manager_id||'');
  setTitle(m?.job_title||'');setBio(m?.biography||'');setEnabled(m?.active??true);
  setMessage('');
 }
 async function manage(){
  if(!target)return;
  setBusy(true);setMessage('');
  const {error}=await browserClient().rpc('manage_supervision_staff',{
   p_user:target,p_hierarchy:level,p_active:enabled,p_manager:manager||null,
   p_job_title:title,p_biography:bio
  });
  setMessage(error?'Unable to save role: '+error.message:'Staff role updated. Roster permissions now follow this hierarchy.');
  setBusy(false);if(!error)router.refresh();
 }
 async function assign(){
  if(!scopeStaff||!scopeStudent)return;
  setBusy(true);setMessage('');
  const {error}=await browserClient().rpc('manage_supervision_roster',{
   p_staff:scopeStaff,p_student:scopeStudent,p_active:scopeEnabled
  });
  setMessage(error?'Unable to update roster: '+error.message:'Student supervision assignment saved.');
  setBusy(false);if(!error)router.refresh();
 }
 return <div className="supervision-home">
  <div className="supervision-hero"><div><p className="supervision-eyebrow">STARK LEARNING / PEOPLE</p>
   <Link href="/teacher" className="supervision-back">← Student supervision</Link><h1>Staff directory</h1>
   <p>Six responsibility levels with different visibility, assessment and management permissions.</p>
  </div><div className="supervision-hero-actions"><Link href="/teacher/profile">My professional profile →</Link></div></div>
  <div className="supervision-role-grid">{hierarchy.map(h=><div className="supervision-role-card" key={h}>
   <span className="supervision-rank">{String(7-roleRank(h)).padStart(2,'0')}</span><h2>{h}</h2>
   <p>{roleDescriptions[h]}</p><small>{members.filter(m=>m.hierarchy===h&&m.active).length} active staff</small>
  </div>)}</div>
  <section className="supervision-section">
   <div className="supervision-section-heading"><div><p className="supervision-eyebrow">STAFF ROSTER</p><h2>People and reporting lines</h2></div><span className="supervision-count">{members.length} staff profiles</span></div>
   <div className="supervision-table-wrap"><table className="supervision-table"><thead><tr><th>Team member</th><th>Hierarchy</th><th>Reports to</th><th>Assigned students</th><th>Access</th></tr></thead>
    <tbody>{members.map(m=><tr key={m.user_id}><td><strong>{m.full_name||'Registered user'}</strong><div className="supervision-sub">{m.job_title||'Role not described'}</div></td>
     <td>{m.hierarchy}</td><td>{members.find(x=>x.user_id===m.manager_id)?.full_name||'—'}</td>
     <td>{m.student_count}</td><td><span className={'supervision-state '+(m.active?'okay':'attention')}>{m.active?'Active':'Inactive'}</span></td></tr>)}</tbody>
   </table></div>
  </section>
  {canManage&&<section className="supervision-section">
    <div className="supervision-section-heading"><div><p className="supervision-eyebrow">PERMISSIONS</p><h2>Assign or change a staff role</h2><p>Only registered accounts may be promoted. A user cannot promote themselves through this form.</p></div></div>
    <div className="supervision-form-grid">
     <label className="supervision-field"><span>Registered account</span><select value={target} onChange={e=>pickUser(e.target.value)}>
      <option value="">Choose an account</option>{manageCandidates.map(c=><option key={c.user_id} value={c.user_id}>{c.full_name||'Unnamed user'} {c.current_level?'· '+c.current_level:''}</option>)}
     </select></label>
     <label className="supervision-field"><span>Hierarchy</span><select value={level} onChange={e=>setLevel(e.target.value as Hierarchy)}>
      {availableLevels.map(x=><option key={x} value={x}>{x}</option>)}</select></label>
     <label className="supervision-field"><span>Reports to</span><select value={manager} onChange={e=>setManager(e.target.value)}>
       <option value="">Independent / school leadership</option>
       {managers.filter(m=>m.user_id!==target).map(m=><option value={m.user_id} key={m.user_id}>{m.full_name} · {m.hierarchy}</option>)}</select></label>
     <label className="supervision-field"><span>Professional title</span><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="English teacher, agronomy coordinator..."/></label>
     <label className="supervision-field wide"><span>Profile description</span><textarea rows={3} value={bio} onChange={e=>setBio(e.target.value)} placeholder="Focus areas, responsibilities and mentoring interests"/></label>
     <label className="supervision-check"><input type="checkbox" checked={enabled} onChange={e=>setEnabled(e.target.checked)}/> Active staff access</label>
    </div>
    {selected?.hierarchy&&<p className="supervision-footnote">Current hierarchy: {selected.hierarchy}. The new level takes effect when you save.</p>}
    <button className="supervision-save" disabled={!target||busy} onClick={()=>void manage()}>{busy?'Saving…':'Save staff role'}</button>
   </section>}
  {assignable.length>0&&<section className="supervision-section">
    <div className="supervision-section-heading"><div><p className="supervision-eyebrow">STUDENT RESPONSIBILITY</p><h2>Assign a student to a staff member</h2><p>Leaders can manage direct-report teams. Principals and coordinators can manage eligible junior staff.</p></div></div>
    <div className="supervision-form-grid">
     <label className="supervision-field"><span>Staff member</span><select value={scopeStaff} onChange={e=>setScopeStaff(e.target.value)}><option value="">Choose staff</option>
      {assignable.map(m=><option key={m.user_id} value={m.user_id}>{m.full_name} · {m.hierarchy}</option>)}</select></label>
     <label className="supervision-field"><span>Student</span><select value={scopeStudent} onChange={e=>setScopeStudent(e.target.value)}><option value="">Choose enrolled student</option>
      {roster.map(s=><option key={s.student_id} value={s.student_id}>{s.student_name} · {s.courses?.join(', ')}</option>)}</select></label>
     <label className="supervision-check"><input type="checkbox" checked={scopeEnabled} onChange={e=>setScopeEnabled(e.target.checked)}/> Grant student access (uncheck to revoke)</label>
    </div>
    <button className="supervision-save" disabled={busy||!scopeStaff||!scopeStudent} onClick={()=>void assign()}>Update student access</button>
    {scopeStaff&&<p className="supervision-footnote">{currentAssignments.length} active student assignments for this team member. Assignments are enforced in Supabase, not only hidden in the interface.</p>}
   </section>}
  {message&&<p role="status" className={'supervision-notice'+(message.startsWith('Unable')?' error':'')}>{message}</p>}
 </div>;
}
