'use client';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {browserClient} from '@/lib/supabase/browser';

export type StudentInviteInfo={
 invite_id:string|null;registry_student_id:string;full_name:string;course_title:string;
 status:string|null;issued_at:string|null;expires_at:string|null;claimed_at:string|null;
 claimed_email:string|null;linked_student_id:string|null;
};

export function StudentInvitationControls({studentId,studentName,linkedStudentId,info}:{
 studentId:string;studentName:string;linkedStudentId:string|null;info?:StudentInviteInfo|null;
}){
 const router=useRouter();
 const [url,setUrl]=useState(''),[busy,setBusy]=useState(false);
 const [message,setMessage]=useState(''),[error,setError]=useState(false);
 const [checked,setChecked]=useState(false);
 const [copied,setCopied]=useState(false);
 async function generate(){
  if(busy)return;
  if((info?.status==='issued'||info?.status==='claimed')&&
    !window.confirm('Gerar outro link vai invalidar o convite anterior. Continuar?'))return;
  setBusy(true);setMessage('');setUrl('');setCopied(false);
  const {data,error:err}=await browserClient().rpc('supervision_issue_student_invite',{
    p_registry:studentId,p_days:14
  });
  setBusy(false);
  if(err){setError(true);setMessage('Não foi possível gerar o convite: '+err.message);return;}
  setError(false);
  const link=window.location.origin+'/join#invite='+data.token;
  setUrl(link);
  setMessage('Convite pessoal criado. Copie e compartilhe apenas com o estudante ou responsável. Expira em 14 dias.');
  router.refresh();
 }
 async function copy(){
  if(!url)return;
  try{await navigator.clipboard.writeText(url);setCopied(true);}
  catch{setMessage('Selecione e copie o link no campo abaixo.');}
 }
 async function decide(approve:boolean){
  if(!info?.invite_id||busy)return;
  if(approve&&!checked)return;
  setBusy(true);setMessage('');
  const {error:err}=await browserClient().rpc('supervision_decide_student_invite',{
   p_invite:info.invite_id,p_approve:approve
  });
  setBusy(false);
  if(err){setError(true);setMessage('Falha ao concluir: '+err.message);return;}
  setError(false);setMessage(approve?'Identidade confirmada. Conta, curso, professor e ficha pedagógica vinculados.':'Solicitação recusada. Você pode emitir um novo convite.');
  router.refresh();
 }
 async function revoke(){
  if(!info?.invite_id||busy||!window.confirm('Invalidar este convite pessoal?'))return;
  setBusy(true);setMessage('');
  const {error:err}=await browserClient().rpc('supervision_revoke_student_invite',{p_invite:info.invite_id});
  setBusy(false);setError(Boolean(err));
  setMessage(err?'Erro ao invalidar convite: '+err.message:'Convite invalidado. Um novo link poderá ser gerado.');
  router.refresh();
 }
 const registered=Boolean(linkedStudentId||info?.linked_student_id);
 const state=registered?'connected':info?.status||'not-issued';
 return <div className="student-invite-controls">
  <div className="student-invite-status">
   <strong>Status do convite</strong>
   <span className={'supervision-state '+(registered?'okay':'attention')}>
    {registered?'Conta vinculada':state==='issued'?'Link emitido':state==='claimed'?'Aguardando confirmação de identidade':
     state==='expired'?'Convite expirado':state==='revoked'?'Convite revogado':state==='declined'?'Cadastro recusado':
     'Convite ainda não emitido'}</span>
  </div>
  {registered?
   <p>O cadastro de {studentName} já está vinculado ao LMS. Não é necessário emitir outro link.</p>:
   <>
    <button className="supervision-save" disabled={busy} onClick={()=>void generate()}>
     {busy?'Processando…':state==='issued'||state==='claimed'? 'Gerar novo link (invalida o anterior)':'Gerar convite individual (14 dias)'}
    </button>
    {info?.expires_at&&state==='issued'&&<p className="supervision-footnote">
      O link existente vence em {new Date(info.expires_at).toLocaleDateString('pt-BR')}. Por segurança, o endereço original não pode ser recuperado; gere outro somente se for necessário.
    </p>}
    {url&&<div className="student-invite-link">
      <label htmlFor={'invite-'+studentId}>Link exclusivo para {studentName}</label>
      <textarea id={'invite-'+studentId} value={url} readOnly rows={3} onFocus={e=>e.currentTarget.select()}/>
      <button type="button" onClick={()=>void copy()}>{copied?'Link copiado ✓':'Copiar link'}</button>
      <small>Não publique este endereço em grupos ou páginas abertas.</small>
    </div>}
    {state==='claimed'&&info?.invite_id&&<div className="student-invite-approval">
      <h3>Confirmar a identidade do aluno</h3>
      <p>Uma conta com o e-mail verificado <strong>{info.claimed_email}</strong> aceitou o convite.</p>
      <p>Confirme com {studentName} ou seu responsável pelo canal de contato já conhecido da escola. Não aprove somente porque alguém possui o link.</p>
      <label className="supervision-check"><input type="checkbox" checked={checked} onChange={e=>setChecked(e.target.checked)}/>
        Confirmei a identidade do aluno por outro canal</label>
      <div className="student-invite-actions">
       <button type="button" disabled={!checked||busy} onClick={()=>void decide(true)}>Aprovar e criar matrícula</button>
       <button type="button" disabled={busy} className="secondary" onClick={()=>void decide(false)}>Recusar</button>
      </div>
    </div>}
    {(state==='issued'||state==='claimed')&&<button type="button" className="student-invite-revoke" disabled={busy} onClick={()=>void revoke()}>Invalidar convite atual</button>}
   </>
  }
  {message&&<p role="status" className={'supervision-notice'+(error?' error':'')}>{message}</p>}
 </div>;
}
