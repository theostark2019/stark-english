'use client';
import {useState} from 'react';
import Link from 'next/link';
import type {StudentInviteInfo} from '@/components/StudentInvitationControls';
export function InvitationRoster({rows}:{rows:StudentInviteInfo[]}){
 const [search,setSearch]=useState(''),[filter,setFilter]=useState('all');
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
