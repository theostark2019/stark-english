export const dynamic='force-dynamic';
import {requireSupervisor} from '@/lib/auth';
import {SupervisionDashboard} from '@/components/SupervisionDashboard';
import type {SupervisionRow,Hierarchy} from '@/lib/supervision';
export default async function TeacherSupervision(){
 const {sb,staff}=await requireSupervisor();
 const {data,error}=await sb.rpc('supervision_roster');
 if(error)return <section className="panel"><h1>Student supervision</h1><p className="error">Unable to load the secured student roster: {error.message}</p></section>;
 return <SupervisionDashboard rows={(data||[]) as SupervisionRow[]} staffRole={staff.hierarchy as Hierarchy}/>;
}
