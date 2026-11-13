'use client';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import {browserClient} from '@/lib/supabase/browser';

export type CourseRequest={
 request_id:string;student_id:string;student_name:string;course_id:string;
 course_slug:string;course_title:string;requested_at:string;
};
export function CourseRequestsReview({requests}:{requests:CourseRequest[]}){
 const [busy,setBusy]=useState<string|null>(null);
 const [message,setMessage]=useState('');
 const [failed,setFailed]=useState(false);
 const router=useRouter();
 async function review(request:CourseRequest,approve:boolean){
  if(busy)return;setBusy(request.request_id);setMessage('');
  const {error}=await browserClient().rpc('teacher_review_course_request',{
   p_request:request.request_id,p_approve:approve,p_note:approve?'Approved from teacher supervision':'Not approved at this time'
  });
  setBusy(null);setFailed(Boolean(error));
  setMessage(error?'Unable to process request: '+error.message:
   approve?'Course access approved. The student is now enrolled and supervised.':'The course request was declined.');
  if(!error)router.refresh();
 }
 return <div className="supervision-home">
  <div className="supervision-hero"><div><p className="supervision-eyebrow">STARK LEARNING / COURSE REQUESTS</p>
   <Link className="supervision-back" href="/teacher">← Supervision</Link>
   <h1>Student course choices</h1>
   <p>Review requests to join another course. Students can preview freely, but cannot change their enrollments without your approval.</p>
   <span className="supervision-role">{requests.length} pending requests</span>
  </div><div className="supervision-hero-actions"><Link href="/courses">Preview all courses →</Link></div></div>
  <section className="supervision-section">
   <div className="supervision-section-heading"><div><p className="supervision-eyebrow">AWAITING APPROVAL</p>
    <h2>Course access decisions</h2><p>Approving adds a course enrollment while preserving the student's previous work and assigned lessons.</p></div>
    <span className="supervision-count">{requests.length} pending</span></div>
   {requests.length?<div className="supervision-table-wrap"><table className="supervision-table">
     <thead><tr><th>Student</th><th>Requested course</th><th>Requested on</th><th>Decision</th></tr></thead>
     <tbody>{requests.map(r=><tr key={r.request_id}>
      <td><strong>{r.student_name||'Student'}</strong></td><td>{r.course_title}</td>
      <td>{new Date(r.requested_at).toLocaleDateString('en-GB')}</td>
      <td><div className="course-approval-actions"><button disabled={busy===r.request_id} onClick={()=>void review(r,true)}>{busy===r.request_id?'Saving…':'Approve'}</button>
       <button className="course-approval-decline" disabled={busy===r.request_id} onClick={()=>void review(r,false)}>Decline</button></div></td>
      </tr>)}</tbody></table></div>:
     <div className="supervision-empty"><strong>No course requests are waiting for review.</strong>
       <p>When a student chooses a course outside their enrollment, the request will appear here.</p></div>}
   {message&&<p role="status" className={'supervision-notice'+(failed?' error':'')}>{message}</p>}
  </section>
 </div>;
}
