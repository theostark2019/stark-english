export const dynamic='force-dynamic';
import Link from 'next/link';
import {notFound,redirect} from 'next/navigation';
import {serverClient} from '@/lib/supabase/server';
import {SVO_LESSONS,SVO_REVIEWS} from '@/lib/svo-curriculum';
import {SvoCourseLesson} from '@/components/SvoCourseLesson';
import {SvoCourseReview} from '@/components/SvoCourseReview';
export default async function SvoUnit({params}:{params:Promise<{unit:string}>}){
 const {unit}=await params;
 if(!SVO_LESSONS[unit]&&!SVO_REVIEWS[unit])notFound();
 const sb=await serverClient();
 const {data:{user}}=await sb.auth.getUser();
 if(user){
  const {data:episode}=await sb.from('episodes').select('id,status').eq('code',unit).maybeSingle();
  if(episode?.status==='published'){
   const {data:assignment}=await sb.from('lesson_assignments').select('id')
     .eq('episode_id',episode.id).eq('student_id',user.id).limit(1).maybeSingle();
   if(assignment)redirect('/lessons/'+assignment.id);
  }
 }
 return <>{SVO_LESSONS[unit]?<SvoCourseLesson code={unit}/>:<SvoCourseReview code={unit}/>}
  <div className="svo-preview-bottom"><Link href="/courses/stark-english/catalog/svo">View the complete SVO curriculum →</Link></div>
 </>;
}
