'use client';
import {useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {browserClient} from '@/lib/supabase/browser';
import {roleDescriptions,type Hierarchy} from '@/lib/supervision';
type OwnProfile={user_id:string;hierarchy:string;active:boolean;job_title:string;biography:string;
 specializations:string[];cefr_levels:string[];manager_id:string|null};
export function StaffProfileEditor({initial}:{initial:OwnProfile}){
 const [title,setTitle]=useState(initial.job_title||'');
 const [bio,setBio]=useState(initial.biography||'');
 const [topics,setTopics]=useState((initial.specializations||[]).join(', '));
 const [levels,setLevels]=useState((initial.cefr_levels||[]).join(', '));
 const [busy,setBusy]=useState(false),[status,setStatus]=useState('');
 const router=useRouter();
 async function save(){
  setBusy(true);setStatus('');
  const {error}=await browserClient().rpc('update_own_supervision_profile',{
   p_job_title:title,p_biography:bio,
   p_specializations:topics.split(',').map(s=>s.trim()).filter(Boolean),
   p_cefr_levels:levels.split(',').map(s=>s.trim()).filter(Boolean)
  });
  setStatus(error?'Unable to save: '+error.message:'Professional profile saved.');
  setBusy(false);if(!error)router.refresh();
 }
 const role=initial.hierarchy as Hierarchy;
 return <div className="supervision-home">
  <div className="supervision-hero"><div><p className="supervision-eyebrow">STARK LEARNING / STAFF PROFILE</p>
   <Link className="supervision-back" href="/teacher">← Student supervision</Link>
   <h1>My professional profile</h1><p>Teaching expertise, role and responsibilities within Stark Learning.</p>
   <span className="supervision-role">{role}</span></div>
   <div className="supervision-hero-actions"><Link href="/teacher/staff">View hierarchy →</Link></div>
  </div>
  <section className="supervision-section"><div className="supervision-section-heading"><div>
   <p className="supervision-eyebrow">ROLE & PERMISSIONS</p><h2>{role}</h2>
   <p>{roleDescriptions[role]||'School staff member'}</p></div></div>
   <p className="supervision-footnote">Hierarchy and reporting line are assigned by authorized school management. You may edit your own professional details, not your access level.</p>
  </section>
  <section className="supervision-section">
   <div className="supervision-section-heading"><div><p className="supervision-eyebrow">EDIT YOUR PROFILE</p><h2>Professional information</h2></div></div>
   <div className="supervision-form-grid">
    <label className="supervision-field"><span>Job title</span><input maxLength={120} value={title} onChange={e=>setTitle(e.target.value)}/></label>
    <label className="supervision-field"><span>Specializations (comma-separated)</span><input value={topics} onChange={e=>setTopics(e.target.value)} placeholder="AgroEnglish, IELTS, Business English"/></label>
    <label className="supervision-field"><span>Teaching CEFR levels</span><input value={levels} onChange={e=>setLevels(e.target.value)} placeholder="A1, A2, B1, B2"/></label>
    <label className="supervision-field wide"><span>Biography and responsibilities</span><textarea rows={7} maxLength={3000} value={bio} onChange={e=>setBio(e.target.value)} placeholder="Experience, interests, teaching approach and current responsibilities"/></label>
   </div>
   <button className="supervision-save" disabled={busy} onClick={()=>void save()}>{busy?'Saving…':'Save my profile'}</button>
   {status&&<p className={'supervision-notice'+(status.startsWith('Unable')?' error':'')} role="status">{status}</p>}
  </section>
 </div>;
}
