'use client';
import {useState} from 'react';
import {browserClient} from '@/lib/supabase/browser';
type Person={id:string;full_name:string;role:string};
type Teacher={user_id:string;active:boolean};
type Group={id:string;name:string};
type Episode={id:string;title:string;code:string;level:string};
export function AssignmentManager({people,teachers,groups,episodes}:{people:Person[];teachers:Teacher[];groups:Group[];episodes:Episode[]}){
 const [studentId,setStudentId]=useState(''),[teacherId,setTeacherId]=useState(''),[episodeId,setEpisodeId]=useState(''),[mode,setMode]=useState('pool'),[groupId,setGroupId]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false);
 const [newTeacher,setNewTeacher]=useState(''),[groupName,setGroupName]=useState('');
 async function assign(e:React.FormEvent){e.preventDefault();setBusy(true);setMessage('');
 const {error}=await browserClient().rpc('admin_assign_lesson',{p_student:studentId,p_episode:episodeId,p_mode:mode,p_teacher:mode==='individual'?teacherId:null,p_group:mode==='group'?groupId:null});
 setMessage(error?error.message:'Lesson assigned successfully');setBusy(false)}
 async function register(e:React.FormEvent){e.preventDefault();setBusy(true);setMessage('');
 const {error}=await browserClient().rpc('admin_register_teacher',{p_teacher:newTeacher,p_specializations:[],p_levels:[]});
 setMessage(error?error.message:'Teacher registered. Refresh to see the updated list.');setBusy(false)}
 async function group(e:React.FormEvent){e.preventDefault();setBusy(true);setMessage('');
 const {error}=await browserClient().rpc('admin_create_teacher_group',{p_name:groupName,p_members:[]});
 setMessage(error?error.message:'Group created. Refresh to add it to assignments.');setBusy(false)}
 return <div className="stack"><section className="panel"><h2>Assign a lesson</h2><form className="stack" onSubmit={assign}>
 <label>Student<select required value={studentId} onChange={e=>setStudentId(e.target.value)}><option value="">Choose student</option>{people.map(x=><option value={x.id} key={x.id}>{x.full_name||x.id.slice(0,8)} · {x.role}</option>)}</select></label>
 <label>Episode<select required value={episodeId} onChange={e=>setEpisodeId(e.target.value)}><option value="">Choose episode</option>{episodes.map(x=><option value={x.id} key={x.id}>{x.code} · {x.title} ({x.level})</option>)}</select></label>
 <label>Reviewer assignment<select value={mode} onChange={e=>setMode(e.target.value)}><option value="pool">Any eligible teacher</option><option value="group">Teacher group</option><option value="individual">Specific teacher</option></select></label>
 {mode==='individual'&&<label>Reviewer<select required value={teacherId} onChange={e=>setTeacherId(e.target.value)}><option value="">Select teacher</option>{teachers.filter(t=>t.active).map(t=><option value={t.user_id} key={t.user_id}>{people.find(x=>x.id===t.user_id)?.full_name||t.user_id.slice(0,8)}</option>)}</select></label>}
 {mode==='group'&&<label>Teacher group<select required value={groupId} onChange={e=>setGroupId(e.target.value)}><option value="">Select group</option>{groups.map(g=><option value={g.id} key={g.id}>{g.name}</option>)}</select></label>}
 <button disabled={busy||!studentId||!episodeId}>Assign lesson</button><p className="muted">Student must already be enrolled in the episode's course. Existing student-episode assignments are updated rather than duplicated.</p></form></section>
 <section className="split"><div className="panel"><h2>Register a teacher</h2><form className="stack" onSubmit={register}><label>Existing user<select required value={newTeacher} onChange={e=>setNewTeacher(e.target.value)}><option value="">Choose a user</option>{people.map(p=><option value={p.id} key={p.id}>{p.full_name||p.id.slice(0,8)}</option>)}</select></label><button disabled={busy}>Add to eligible teacher pool</button></form></div>
 <div className="panel"><h2>Create a teacher group</h2><form className="stack" onSubmit={group}><label>Name<input required minLength={2} maxLength={120} value={groupName} onChange={e=>setGroupName(e.target.value)} placeholder="AgroEnglish instructors"/></label><button disabled={busy}>Create group</button></form><p className="muted">Group membership management will follow in the next release.</p></div></section>
 {message&&<div role="status" className="notice">{message}</div>}</div>
}
