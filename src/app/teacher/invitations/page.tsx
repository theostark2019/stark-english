export const dynamic='force-dynamic';
import {redirect} from 'next/navigation';
import {requireSupervisor} from '@/lib/auth';
import {roleRank} from '@/lib/supervision';
import {InvitationRoster} from '@/components/InvitationRoster';
import type {StudentInviteInfo} from '@/components/StudentInvitationControls';
export default async function InvitationManagement(){
 const {sb,staff}=await requireSupervisor();
 if(roleRank(staff.hierarchy)<5)redirect('/teacher');
 const {data,error}=await sb.rpc('supervision_student_invite_roster');
 if(error)return <div className="panel"><h1>Individual invitations</h1><p role="alert">{error.message}</p></div>;
 return <InvitationRoster rows={(data||[]) as StudentInviteInfo[]}/>;
}
