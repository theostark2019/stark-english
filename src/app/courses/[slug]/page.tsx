export const dynamic='force-dynamic';
import {notFound} from 'next/navigation';
import {serverClient} from '@/lib/supabase/server';
import {StreamingCourseDashboard} from '@/components/StreamingCourseDashboard';
import {getCourseStreamLearning,type StreamLearning} from '@/lib/course-stream-data';
import {isPortalSlug,type CoursePreview,type CourseStatus} from '@/lib/course-portals';
export default async function CoursePortal({params,searchParams}:{
 params:Promise<{slug:string}>;searchParams:Promise<{q?:string}>
}){
 const {slug}=await params;
 if(!isPortalSlug(slug))notFound();
 const query=((await searchParams).q||'').trim().slice(0,120);
 const sb=await serverClient();
 const [{data:catalog,error},{data:status},{data:{user}}]=await Promise.all([
  sb.rpc('course_preview_catalog'),sb.rpc('student_course_status'),sb.auth.getUser()
 ]);
 if(error||!Array.isArray(catalog))return <section className="panel"><h1>Course dashboard unavailable</h1>
  <p role="alert">The course catalog could not be loaded. {error?.message||'Please try again.'}</p></section>;
 const course=(catalog as CoursePreview[]).find(c=>c.slug===slug);
 if(!course)notFound();
 const account=(status||{signedIn:false,enrolled:[],pending:null}) as CourseStatus;
 let learning:StreamLearning|null=null;
 if(user&&account.enrolled?.includes(slug)){
  try{learning=await getCourseStreamLearning(sb,user.id,slug,course)}
  catch(e){return <section className="panel"><h1>Unable to load student dashboard</h1>
   <p role="alert">Your course is enrolled, but the learning record could not be loaded. Please try again.</p>
   <p><a href="/courses">Back to the course selector</a></p></section>}
 }
 return <StreamingCourseDashboard slug={slug} course={course} status={account} learning={learning} query={query}/>;
}
