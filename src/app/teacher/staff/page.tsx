export const dynamic='force-dynamic';
import {requireSupervisor} from '@/lib/auth';
import {StaffDirectory} from '@/components/StaffDirectory';
import type {StaffProfile,StaffCandidate,SupervisionRow,Hierarchy} from '@/lib/supervision';
export default async function StaffPage(){
 const {sb,user,staff}=await requireSupervisor();
 const [{data:directory,error},{data:candidates},{data:roster},{data:scopes}]=await Promise.all([
  sb.rpc('supervision_staff_directory'),
  sb.rpc('supervision_staff_candidates'),
  sb.rpc('supervision_roster'),
  sb.from('staff_student_assignments').select('staff_id,student_id,active')
 ]);
 if(error)return <section className="panel"><h1>Staff directory</h1><p className="error">{error.message}</p></section>;
 return <StaffDirectory members={(directory||[]) as StaffProfile[]} candidates={(candidates||[]) as StaffCandidate[]}
  roster={(roster||[]) as SupervisionRow[]} scopes={scopes||[]}
  role={staff.hierarchy as Hierarchy} currentUser={user.id}/>;
}
