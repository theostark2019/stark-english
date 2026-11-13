export const dynamic='force-dynamic';
import {requireSupervisor} from '@/lib/auth';
import {SupervisionDashboard} from '@/components/SupervisionDashboard';
import {roleRank,type SupervisionRow,type Hierarchy} from '@/lib/supervision';
export default async function TeacherSupervision(){
 const {sb,staff}=await requireSupervisor();
 const [{data,error},{count:importedCount}]=await Promise.all([
 sb.rpc('supervision_roster'),
 roleRank(staff.hierarchy)>=5?sb.from('notion_student_registry').select('id',{count:'exact',head:true}):Promise.resolve({count:0})
 ]);
 if(error)return <section className="panel"><h1>Student supervision</h1><p className="error">Unable to load the secured student roster: {error.message}</p></section>;
 return <SupervisionDashboard rows={(data||[]) as SupervisionRow[]} staffRole={staff.hierarchy as Hierarchy} registryCount={importedCount||0}/>;
}
