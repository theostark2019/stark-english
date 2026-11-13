export const dynamic='force-dynamic';
import {redirect} from 'next/navigation';
import {requireSupervisor} from '@/lib/auth';
import {roleRank} from '@/lib/supervision';
import {NotionStudentRegistry,type ImportedStudent,type RegistryAssignmentOptions} from '@/components/NotionStudentRegistry';
export default async function ImportedStudentsPage(){
 const {sb,staff}=await requireSupervisor();
 if(roleRank(staff.hierarchy)<5)redirect('/teacher');
 const [{data,error},{data:options, error:optionsError}]=await Promise.all([
   sb.rpc('supervision_registry_roster'),
   sb.rpc('supervision_registry_assignment_options')
 ]);
 if(error||optionsError)return <main className="supervision-home"><div className="supervision-section">
   <h1>Alunos importados do Notion</h1><p>Não foi possível carregar os registros: {error?.message||optionsError?.message}</p>
 </div></main>;
 const catalog=options as RegistryAssignmentOptions|null;
 return <NotionStudentRegistry students={(data||[]) as ImportedStudent[]} courses={catalog?.courses||[]}/>;
}
