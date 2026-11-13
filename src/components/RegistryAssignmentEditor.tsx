'use client';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {browserClient} from '@/lib/supabase/browser';
import type {RegistryAssignmentOptions} from '@/components/NotionStudentRegistry';

export function RegistryAssignmentEditor({registryId,courseId,teacherId,options}:{
 registryId:string;courseId:string;teacherId:string;options:RegistryAssignmentOptions;
}){
 const [course,setCourse]=useState(courseId);
 const [teacher,setTeacher]=useState(teacherId);
 const [busy,setBusy]=useState(false);
 const [feedback,setFeedback]=useState('');
 const [error,setError]=useState(false);
 const router=useRouter();
 const changed=course!==courseId||teacher!==teacherId;
 async function save(){
  if(!changed||!course||!teacher||busy)return;
  setBusy(true);setFeedback('');
  const response=await browserClient().rpc('supervision_set_registry_assignment',{
   p_student_registry_id:registryId,p_course_id:course,p_teacher_id:teacher
  });
  if(response.error){
   setError(true);setFeedback('Falha ao atualizar: '+response.error.message);
  }else{
   setError(false);setFeedback('Atribuição atualizada e registrada no histórico de alterações.');
   router.refresh();
  }
  setBusy(false);
 }
 return <div className="registry-assignment-editor">
   <div className="supervision-form-grid">
    <label className="supervision-field"><span>Curso atribuído</span>
      <select value={course} onChange={e=>setCourse(e.target.value)}>
        {options.courses.map(c=><option key={c.id} value={c.id}>{c.title}</option>)}
      </select>
    </label>
    <label className="supervision-field"><span>Professor responsável</span>
      <select value={teacher} onChange={e=>setTeacher(e.target.value)}>
        {options.teachers.map(t=><option key={t.id} value={t.id}>{t.name||'Professor'} · {t.hierarchy}</option>)}
      </select>
    </label>
   </div>
   <button className="supervision-save" disabled={!changed||!course||!teacher||busy} onClick={()=>void save()}>
    {busy?'Salvando…':'Salvar atribuições'}
   </button>
   {feedback&&<p className={'supervision-notice'+(error?' error':'')} role="status">{feedback}</p>}
   <p className="supervision-footnote">
    Esta atribuição organiza o cadastro pedagógico. Ela não cria login, matrícula ativa no LMS ou aulas automaticamente.
    Alterações ficam registradas para auditoria.
   </p>
 </div>;
}
