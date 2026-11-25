'use client';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {browserClient} from '@/lib/supabase/browser';
import Link from 'next/link';
import type {StudentInviteInfo} from '@/components/StudentInvitationControls';
export function InvitationRoster({rows}:{rows:StudentInviteInfo[]}){
 const [search,setSearch]=useState(''),[filter,setFilter]=useState('all');
 const [bulkBusy,setBulkBusy]=useState(false),[bulkMessage,setBulkMessage]=useState('');
 const [bulkError,setBulkError]=useState(false);
 const router=useRouter();
 async function bulkGenerate(){
  if(bulkBusy||!window.confirm(
   'Criar links individuais para alunos ainda sem convite e baixar uma planilha CSV? Cada link dá início ao cadastro. Guarde a planilha com segurança.'))return;
  setBulkBusy(true);setBulkMessage('');setBulkError(false);
  const {data,error}=await browserClient().rpc('supervision_generate_invites_bulk',{p_days:14});
  setBulkBusy(false);
  if(error){setBulkError(true);setBulkMessage('Erro: '+error.message);return;}
  const items=(data||[]) as {student_id:string;student_name:string;course_title:string;invite_token:string;expires_at:string}[];
  if(!items.length){setBulkMessage('Nenhum novo convite necessário. Os alunos restantes já possuem convites ativos ou contas vinculadas.');router.refresh();return;}
  const escapeCell=(value:string)=>{
   const neutral=/^[\t\r\n ]*[=+@-]/.test(value)?"'"+value:value;
   return '"'+neutral.replaceAll('"','""')+'"';
  };
  const header=['Aluno','Curso','Link pessoal','Validade'];
  const values=items.map(x=>[x.student_name,x.course_title,
    window.location.origin+'/join#invite='+x.invite_token,x.expires_at.slice(0,10)]);
  const csv='\uFEFF'+[header,...values].map(row=>row.map(v=>escapeCell(String(v))).join(';')).join('\r\n');
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});
  const download=URL.createObjectURL(blob);
  const anchor=document.createElement('a');anchor.href=download;anchor.download='stark-learning-convites-individuais.csv';
  document.body.appendChild(anchor);anchor.click();anchor.remove();
  window.setTimeout(()=>URL.revokeObjectURL(download),1000);
  setBulkMessage(items.length+' links pessoais criados e preparados em um CSV. Envie cada linha apenas ao aluno correspondente. Os links não podem ser recuperados depois.');
  router.refresh();
 }
 const stats={
  linked:rows.filter(x=>Boolean(x.linked_student_id)).length,
  pending:rows.filter(x=>x.status==='claimed'&&!x.linked_student_id).length,
  issued:rows.filter(x=>x.status==='issued'&&x.expires_at&&new Date(x.expires_at)>new Date()).length
 };
 const active=rows.filter(r=>{
  const status=r.linked_student_id?'linked':r.status||'not-issued';
  const q=search.trim().toLocaleLowerCase('pt-BR');
  return (!q||[r.full_name,r.course_title].join(' ').toLocaleLowerCase('pt-BR').includes(q))
   &&(filter==='all'||status===filter);
 });
 function label(r:StudentInviteInfo){
  if(r.linked_student_id)return '✓ Vinculado';
  if(r.status==='claimed')return 'Identidade pendente';
  if(r.status==='issued'&&r.expires_at&&new Date(r.expires_at)<=new Date())return 'Expirado';
  if(r.status==='issued')return 'Link enviado / disponível';
  if(r.status==='revoked')return 'Revogado';
  if(r.status==='declined')return 'Recusado';
  if(r.status==='expired')return 'Expirado';
  return 'Sem convite';
 }
 return <div className="supervision-home">
  <div className="supervision-hero"><div><p className="supervision-eyebrow">STARK LEARNING / ONBOARDING</p>
    <Link href="/teacher/imported" className="supervision-back">← Cadastro de alunos</Link>
    <h1>Convites individuais</h1>
    <p>Envie um endereço exclusivo a cada aluno, acompanhe cadastros e confirme identidades antes de liberar o LMS.</p>
  </div><div className="supervision-hero-actions"><Link href="/teacher/imported">Ver alunos importados →</Link>
    <Link href="/teacher">Painel docente →</Link></div></div>
  <div className="supervision-kpis notion-registry-metrics">
   {[['Alunos',rows.length],['Convites ativos',stats.issued],['Aguardando verificação',stats.pending],['Contas vinculadas',stats.linked]].map(([name,num])=>
    <div key={name} className="supervision-kpi"><p>{name}</p><strong>{num}</strong><small>{name==='Convites ativos'?'Links temporários não utilizados':'Cadastro de matrícula'}</small></div>)}
  </div>
  <section className="supervision-section">
    <div className="student-invite-bulk">
      <div><strong>Criar os links de todos os alunos ainda sem convite</strong>
       <p>Gere links exclusivos em lote e baixe uma planilha CSV com nome, curso, link e validade. Não invalida convites já emitidos. Os links só ficam disponíveis neste arquivo e devem ser enviados individualmente.</p></div>
      <button type="button" className="supervision-save" disabled={bulkBusy} onClick={()=>void bulkGenerate()}>
       {bulkBusy?'Gerando links…':'Gerar links pendentes (CSV)'}
      </button>
      {bulkMessage&&<p role="status" className={'supervision-notice'+(bulkError?' error':'')}>{bulkMessage}</p>}
    </div>
    <div className="supervision-section-heading"><div><p className="supervision-eyebrow">LISTA DE CONVITES</p><h2>Enviar e acompanhar convites</h2>
      <p>Abra uma ficha para gerar ou copiar o link. Convites já gerados não são recuperáveis: gere um novo se perder o endereço.</p></div>
      <span className="supervision-count">{active.length} de {rows.length}</span></div>
    <div className="supervision-filters notion-registry-filters">
      <label>Buscar<input type="search" placeholder="Nome ou curso" value={search} onChange={e=>setSearch(e.target.value)}/></label>
      <label>Situação<select value={filter} onChange={e=>setFilter(e.target.value)}>
       <option value="all">Todos</option><option value="not-issued">Sem convite</option><option value="issued">Link emitido</option>
       <option value="claimed">Identidade pendente</option><option value="linked">Vinculados</option>
       <option value="expired">Expirados</option><option value="revoked">Revogados</option>
      </select></label>
    </div>
    <div className="supervision-table-wrap"><table className="supervision-table">
     <thead><tr><th>Aluno</th><th>Curso</th><th>Status do convite</th><th>E-mail de cadastro</th><th></th></tr></thead>
     <tbody>{active.map(r=><tr key={r.registry_student_id}>
      <td><Link href={'/teacher/imported/'+r.registry_student_id} className="supervision-student-name">{r.full_name}</Link></td>
      <td>{r.course_title}</td><td>{label(r)}</td>
      <td>{r.claimed_email||'—'}</td>
      <td><Link href={'/teacher/imported/'+r.registry_student_id+'#invitation'} className="supervision-view">
       {r.status==='claimed'?'Verificar identidade →':r.linked_student_id?'Abrir ficha →':'Gerar / gerenciar link →'}
      </Link></td>
     </tr>)}</tbody></table></div>
   </section>
   <p className="supervision-footnote">Somente Principal e Coordinator podem emitir e gerenciar convites. A inscrição exige e-mail confirmado; alunos sem e-mail de referência precisam de confirmação de identidade. Nenhum link foi enviado automaticamente.</p>
 </div>;
}
