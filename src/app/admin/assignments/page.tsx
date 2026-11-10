export const dynamic='force-dynamic';
import {requireAdmin} from '@/lib/auth';
import {AssignmentManager} from '@/components/AssignmentManager';
export default async function AdminAssignments(){
 const {sb}=await requireAdmin();
 const [{data:people},{data:teachers},{data:groups},{data:episodes}]=await Promise.all([
  sb.from('profiles').select('id,full_name,role').order('full_name').limit(1000),
  sb.from('teacher_profiles').select('user_id,active'),
  sb.from('teacher_groups').select('id,name').eq('active',true),
  sb.from('episodes').select('id,title,code,level').eq('status','published').order('code').limit(500)
 ]);
 return <><p className="eyebrow">Administration</p><h1>Teachers and lesson assignments</h1><p className="muted">One shared administration flow for AgroEnglish, Med-English and future courses.</p><AssignmentManager people={people||[]} teachers={teachers||[]} groups={groups||[]} episodes={episodes||[]}/></>;
}
