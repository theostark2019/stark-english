'use client';
import Link from 'next/link';
import {useMemo,useState} from 'react';
export type ImportedStudent={
 student_id:string;student_name:string;source_status:string;cefr:string[];study_group:string|null;
 interests:string[];objectives:string[];has_phone:boolean;has_email:boolean;
 linked_student_id:string|null;source_page_url:string;
};
export function NotionStudentRegistry({students}:{students:ImportedStudent[]}){
 const [search,setSearch]=useState('');
 const [cefr,setCefr]=useState('all');
 const [group,setGroup]=useState('all');
 const levels=useMemo(()=>[...new Set(students.flatMap(x=>x.cefr||[]))].sort(),[students]);
 const groups=useMemo(()=>[...new Set(students.map(x=>x.study_group).filter((x):x is string=>Boolean(x)))].sort(),[students]);
 const filtered=useMemo(()=>{
  const q=search.toLocaleLowerCase('pt-BR').trim();
  return students.filter(s=>(!q||[s.student_name,s.study_group,...(s.cefr||[]),...(s.interests||[]),...(s.objectives||[])].join(' ').toLocaleLowerCase('pt-BR').includes(q))
   && (cefr==='all'||s.cefr?.includes(cefr))
   && (group==='all'||s.study_group===group));
 },[students,search,cefr,group]);
 return <div className="supervision-home">
  <div className="supervision-hero"><div><p className="supervision-eyebrow">STARK LEARNING / NOTION DATASET</p>
    <Link className="supervision-back" href="/teacher">← Supervisão</Link>
    <h1>Cadastro inicial de alunos</h1>
    <p>Alunos com status Student no Notion, disponíveis para conferência e futura vinculação às contas do LMS.</p>
    <span className="supervision-role">{students.length} fichas importadas · fonte: Notion People</span>
  </div><div className="supervision-hero-actions"><Link href="/teacher">Dashboard LMS →</Link></div></div>
  <div className="supervision-kpis notion-registry-metrics">
   <div className="supervision-kpi"><p>Alunos cadastrados</p><strong>{students.length}</strong><small>Status Student no Notion</small></div>
   <div className="supervision-kpi"><p>Com nível CEFR</p><strong>{students.filter(s=>s.cefr?.length>0).length}</strong><small>Conforme cadastro original</small></div>
   <div className="supervision-kpi"><p>Grupos encontrados</p><strong>{groups.length}</strong><small>Valores diferentes</small></div>
   <div className="supervision-kpi"><p>Contas vinculadas</p><strong>{students.filter(s=>s.linked_student_id).length}</strong><small>Vínculo seguro com login LMS</small></div>
  </div>
  <section className="supervision-section">
   <div className="supervision-section-heading"><div><p className="supervision-eyebrow">BUSCA E CONFERÊNCIA</p><h2>Alunos do Notion</h2>
    <p>Cadastros importados, ainda sem matrícula automática. Clique no nome para abrir a ficha de origem.</p></div>
    <span className="supervision-count">{filtered.length} de {students.length} registros</span></div>
   <div className="supervision-filters notion-registry-filters">
    <label>Nome ou interesse<input type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar aluno, objetivo, interesse..."/></label>
    <label>CEFR<select value={cefr} onChange={e=>setCefr(e.target.value)}><option value="all">Todos os níveis</option>{levels.map(l=><option key={l} value={l}>{l}</option>)}</select></label>
    <label>Grupo<select value={group} onChange={e=>setGroup(e.target.value)}><option value="all">Todos os grupos</option>{groups.map(g=><option key={g} value={g}>{g}</option>)}</select></label>
   </div>
   <div className="supervision-table-wrap"><table className="supervision-table"><thead><tr>
    <th>Aluno</th><th>CEFR</th><th>Grupo</th><th>Interesses / objetivos</th><th>Vínculo LMS</th><th></th>
   </tr></thead><tbody>{filtered.map(s=><tr key={s.student_id}>
    <td><Link className="supervision-student-name" href={'/teacher/imported/'+s.student_id}>{s.student_name}</Link></td>
    <td>{s.cefr?.join(', ')||'—'}</td><td className="notion-long-cell">{s.study_group||'—'}</td>
    <td className="notion-long-cell">{[...(s.interests||[]),...(s.objectives||[])].slice(0,4).join(' · ')||'Não informado'}</td>
    <td><span className={'supervision-state '+(s.linked_student_id?'okay':'attention')}>{s.linked_student_id?'Vinculado':'Pendente'}</span></td>
    <td><Link className="supervision-view" href={'/teacher/imported/'+s.student_id}>Abrir ficha →</Link></td>
   </tr>)}</tbody></table>
   {filtered.length===0&&<div className="supervision-empty">Nenhum aluno encontrado com esses filtros.</div>}
   </div>
  </section>
  <p className="supervision-footnote">Dados visíveis apenas para Principal e Coordinator. A importação não cria usuários de autenticação, não confere acesso ao portal e não atribui aulas ou créditos. CPF, valores e contratos não foram importados.</p>
 </div>;
}
