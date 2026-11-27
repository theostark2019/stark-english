export const dynamic='force-dynamic';
import {redirect} from 'next/navigation';
import {serverClient} from '@/lib/supabase/server';
import {SvoLessonOne} from '@/components/SvoLessonOne';

export default async function SvoFirstLesson(){
 const sb=await serverClient();
 const {data:{user}}=await sb.auth.getUser();
 // Students with an actual teacher assignment always use the persistent workspace.
 if(user){
  const {data:ep}=await sb.from('episodes').select('id').eq('code','SVO-L01').maybeSingle();
  if(ep){
   const {data:assigned}=await sb.from('lesson_assignments')
    .select('id').eq('episode_id',ep.id).eq('student_id',user.id).limit(1).maybeSingle();
   if(assigned)redirect('/lessons/'+assigned.id);
  }
 }
 // Public preview: interactive exercises run, but no record or vocabulary KPI is created.
 return <SvoLessonOne/>;
}
