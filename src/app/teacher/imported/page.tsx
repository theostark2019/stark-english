export const dynamic='force-dynamic';
import {redirect} from 'next/navigation';
import {requireSupervisor} from '@/lib/auth';
import {roleRank} from '@/lib/supervision';
import {NotionStudentRegistry,type ImportedStudent} from '@/components/NotionStudentRegistry';
export default async function ImportedStudentsPage(){
 const {sb,staff}=await requireSupervisor();
 if(roleRank(staff.hierarchy)<5)redirect('/teacher');
 const {data,error}=await sb.rpc('supervision_import_registry');
 if(error)return <main className="supervision-home"><div className="supervision-section">
   <h1>Cadastro inicial do Notion</h1><p>Erro ao carregar o dataset: {error.message}</p>
 </div></main>;
 return <NotionStudentRegistry students={(data||[]) as ImportedStudent[]}/>;
}
