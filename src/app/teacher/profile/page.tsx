export const dynamic='force-dynamic';
import {requireSupervisor} from '@/lib/auth';
import {StaffProfileEditor} from '@/components/StaffProfileEditor';
export default async function MyStaffProfile(){
 const {staff}=await requireSupervisor();
 return <StaffProfileEditor initial={staff}/>;
}
