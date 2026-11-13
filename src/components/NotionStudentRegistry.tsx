'use client';
import Link from 'next/link';
import {useMemo,useState} from 'react';

export type ImportedStudent={
 student_id:string;student_name:string;source_status:string;cefr:string[];study_group:string|null;
 interests:string[];objectives:string[];has_phone:boolean;has_email:boolean;
 linked_student_id:string|null;source_page_url:string;
 course_id:string;course_slug:string;course_title:string;teacher_id:string;
 teacher_name:string;teacher_hierarchy:string;assignment_basis:string;
};
export type RegistryCourse={id:string;slug:string;title:string};
export type RegistryTeacher={id:string;name:string;hierarchy:string};
export type RegistryAssignmentOptions={courses:RegistryCourse[];teachers:RegistryTeacher[]};

export function NotionStudentRegistry({students,courses}:{students:ImportedStudent[];courses:RegistryCourse[]}){
 const [search,setSearch]=useState('');
 const [cefr,setCefr]=useState('all');
 const [group,setGroup]=useState('all');
 const [course,setCourse]=useState('all');
 const levels=useMemo(()=>[...new Set(students.flatMap(x=>x.cefr||[]))].sort(),[students]);
 const groups=useMemo(()=>[...new Set(students.map(x=>x.study_group).filter((x):x is string=>Boolean(x)))].sort(),[students]);
 const filtered=useMemo(()=>{
  const q=search.toLocaleLowerCase('pt-BR').trim();
  return students.filter(s=>
    (!q||[s.student_name,s.study_group,s.teacher_name,s.course_title,...(s.cefr||[]),...(s.interests||[]),...(s.objectives||[])]
      .join(' ').toLocaleLowerCase('pt-BR').includes(q))
    && (cefr==='all'||s.cefr?.includes(cefr))
    && (group==='all'||s.study_group===group)
    && (course==='all'||s.course_slug===course));
 },[students,search,cefr,group,course]);
 const countCourse=(slug:string)=>students.filter(s=>s.course_slug===slug).length;
 const uniqueTeachers=[...new Set(students.map(s=>s.teacher_id).filter(Boolean))].length;
 return <div className="supervision-home">
  <div className="supervision-hero"><div><p className="supervision-eyebrow">STARK LEARNING / STUDENT REGISTRY</p>
    <Link className="supervision-back" href="/teacher">← Supervisão</Link>
    <h1>Alunos e atribuições</h1>
    <p>Cadastro inicial dos alunos importados do Notion, organizado por curso e professor responsável.</p>
    <span className="supervision-role">{students.length} alunos cadastrados · {uniqueTeachers} professor{uniqueTeachers===1?'':'es'} responsável{uniqueTeachers===1?'':'eis'}</span>
  </div><div className="supervision-hero-actions"><Link href="/teacher">Dashboard LMS →</Link></div></div>
  <div className="supervision-kpis notion-registry-metrics">
   <div className="supervision-kpi"><p>Alunos cadastrados</p><strong>{students.length}</strong><small>Status Student no Notion</small></div>
   {courses.map(c=><div className="supervision-kpi" key={c.id}>
     <p>{c.title}</p><strong>{countCourse(c.slug)}</strong><small>Alunos atribuídos</small>
   </div>)}
  </div>
  <section className="supervision-section">
   <div className="supervision-section-heading"><div><p className="supervision-eyebrow">CURSOS E PROFESSORES</p><h2>Distribuição dos alunos</h2>
    <p>Cursos atribuídos no cadastro interno. Clique no aluno para conferir a ficha e ajustar o curso ou professor.</p></div>
    <span className="supervision-count">{filtered.length} de {students.length} registros</span></div>
   <div className="supervision-filters notion-registry-filters">
    <label>Buscar aluno<input type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Nome, curso, professor, interesse..."/></label>
    <label>Curso<select value={course} onChange={e=>setCourse(e.target.value)}>
      <option value="all">Todos os cursos</option>
      {courses.map(c=><option key={c.id} value={c.slug}>{c.title}</option>)}
    </select></label>
    <label>CEFR<select value={cefr} onChange={e=>setCefr(e.target.value)}><option value="all">Todos os níveis</option>{levels.map(l=><option key={l} value={l}>{l}</option>)}</select></label>
    <label>Grupo<select value={group} onChange={e=>setGroup(e.target.value)}><option value="all">Todos os grupos</option>{groups.map(g=><option key={g} value={g}>{g}</option>)}</select></label>
   </div>
   <div className="supervision-table-wrap"><table className="supervision-table"><thead><tr>
    <th>Aluno</th><th>Curso</th><th>Professor responsável</th><th>CEFR</th><th>Grupo</th><th>Conta LMS</th><th></th>
   </tr></thead><tbody>{filtered.map(s=><tr key={s.student_id}>
    <td><Link className="supervision-student-name" href={'/teacher/imported/'+s.student_id}>{s.student_name}</Link></td>
    <td><strong>{s.course_title||'Não atribuído'}</strong></td>
    <td>{s.teacher_name||'Não atribuído'}<div className="supervision-sub">{s.teacher_hierarchy||''}</div></td>
    <td>{s.cefr?.join(', ')||'—'}</td>
    <td className="notion-long-cell">{s.study_group||'—'}</td>
    <td><span className={'supervision-state '+(s.linked_student_id?'okay':'attention')}>{s.linked_student_id?'Vinculada':'Pendente'}</span></td>
    <td><Link className="supervision-view" href={'/teacher/imported/'+s.student_id}>Abrir ficha →</Link></td>
   </tr>)}</tbody></table>
   {filtered.length===0&&<div className="supervision-empty">Nenhum aluno encontrado com esses filtros.</div>}
   </div>
  </section>
  <p className="supervision-footnote">A atribuição de curso e professor pertence ao cadastro inicial. Matrícula efetiva no portal, tarefas e indicadores de aprendizagem dependerão da vinculação de cada aluno à sua conta autenticada. Dados pessoais são acessíveis apenas à direção e coordenação.</p>
 </div>;
}
