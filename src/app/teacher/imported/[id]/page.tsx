export const dynamic='force-dynamic';
import {notFound,redirect} from 'next/navigation';
import Link from 'next/link';
import {requireSupervisor} from '@/lib/auth';
import {roleRank} from '@/lib/supervision';
type Data={
 id:string;fullName:string;status:string;academic:Record<string,unknown>;
 contact:Record<string,unknown>;linkedStudentId:string|null;
 sourceUrl:string;importedAt:string;updatedAt:string;
};
function show(v:unknown):string{
 if(v===null||v===undefined||v==='')return 'Não informado';
 if(Array.isArray(v))return v.map(show).join(' · ');
 if(typeof v==='boolean')return v?'Sim':'Não';
 return String(v);
}
const academicFields:{label:string;key:string}[]=[
 {label:'Status original',key:'Status'},{label:'CEFR',key:'CEFR'},{label:'Grupo',key:'Group'},
 {label:'Curso solicitado',key:'Curso solicitado'},{label:'Compromisso',key:'Compromisso'},
 {label:'Objetivos',key:'Objetivos'},{label:'Interesses',key:'Interesses'},
 {label:'Formação',key:'Education'},{label:'Ocupação',key:'Occupation'},
 {label:'Experiência com inglês',key:'Experiência com inglês'},
 {label:'Rotina de estudos',key:'Rotina de estudos'},
 {label:'Estratégia adotada',key:'Adopted Strategy'},
 {label:'Meta declarada',key:'Target'},
 {label:'Histórico',key:'Historico'},
 {label:'Observações',key:'Observacoes'},
 {label:'Par de estudos',key:'Dupla'},
 {label:'Onboarded no Notion',key:'Onboarded'}
];
const contactFields:{label:string;key:string}[]=[
 {label:'Contato telefônico',key:'Contact'},{label:'E-mail',key:'Email'},
 {label:'Cidade',key:'Cidade'},{label:'Estado',key:'Estado'},
 {label:'Referência de responsável',key:'Guardian'}
];
export default async function ImportedStudentDetail({params}:{params:Promise<{id:string}>}){
 const {id}=await params;
 const {sb,staff}=await requireSupervisor();
 if(roleRank(staff.hierarchy)<5)redirect('/teacher');
 if(!/^[0-9a-fA-F]{8}-[0-9a-fA-F-]{27,36}$/.test(id))notFound();
 const {data,error}=await sb.rpc('supervision_import_registry_detail',{p_id:id});
 if(error||!data)notFound();
 const s=data as Data;
 return <div className="supervision-home">
   <div className="supervision-hero"><div>
    <p className="supervision-eyebrow">STARK LEARNING / FICHA IMPORTADA</p>
    <Link className="supervision-back" href="/teacher/imported">← Cadastro Notion</Link>
    <h1>{s.fullName}</h1><p>Cadastro pedagógico inicial · origem: People · status {s.status}</p>
    <span className="supervision-role">{s.linkedStudentId?'Conta LMS vinculada':'Aguardando vínculo à conta LMS'}</span>
   </div><div className="supervision-hero-actions">
    <Link href="/teacher/imported">Todos os alunos →</Link>
    {s.linkedStudentId&&<Link href={'/teacher/students/'+s.linkedStudentId}>Dossiê LMS →</Link>}
   </div></div>
   <div className="supervision-student-summary">
    <div><strong>Nível CEFR:</strong> {show(s.academic.CEFR)}</div>
    <div><strong>Grupo:</strong> {show(s.academic.Group)}</div>
    <div><strong>Objetivos:</strong> {show(s.academic.Objetivos)}</div>
    <div><strong>Interesses:</strong> {show(s.academic.Interesses)}</div>
   </div>
   <section className="supervision-section"><div className="supervision-section-heading"><div>
    <p className="supervision-eyebrow">DADOS DO NOTION</p><h2>Perfil pedagógico</h2>
    <p>Campos originais preservados quando preenchidos. Os campos ausentes não foram presumidos.</p>
   </div></div><dl className="notion-student-fields">{academicFields.map(f=><div key={f.key}>
    <dt>{f.label}</dt><dd>{show(s.academic[f.key])}</dd>
   </div>)}</dl></section>
   <section className="supervision-section"><div className="supervision-section-heading"><div>
    <p className="supervision-eyebrow">DADOS RESTRITOS</p><h2>Contato e responsáveis</h2>
    <p>Somente Principal e Coordinator. Dados financeiros e identificadores legais não fazem parte deste dataset.</p>
   </div></div><dl className="notion-student-fields">{contactFields.map(f=><div key={f.key}>
    <dt>{f.label}</dt><dd>{show(s.contact[f.key])}</dd>
   </div>)}</dl></section>
   <section className="supervision-section"><div className="supervision-section-heading"><div>
    <p className="supervision-eyebrow">PRÓXIMA ETAPA</p><h2>Vincular ao Stark Learning</h2></div></div>
    {s.linkedStudentId?<p>Esta ficha já está relacionada a uma conta do LMS. Os registros de atividades devem ser consultados no dossiê pedagógico.</p>:
    <p>Este aluno ainda não tem uma conta LMS associada à ficha do Notion. Nenhum histórico de aulas, streak, envio de tarefa ou conquista foi inventado. O vínculo exigirá confirmação da identidade do aluno durante o onboarding.</p>}
    <p><a href={s.sourceUrl} target="_blank" rel="noopener noreferrer">Abrir registro original no Notion ↗</a></p>
   </section>
  </div>;
}
