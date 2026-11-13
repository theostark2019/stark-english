export const dynamic='force-dynamic';
import {serverClient} from '@/lib/supabase/server';
import {CourseExplorer} from '@/components/CourseExplorer';
import type {CoursePreview,CourseStatus} from '@/lib/course-portals';
export default async function ChooseCoursePage(){
 const sb=await serverClient();
 const [{data:catalog,error},{data:status}]=await Promise.all([
  sb.rpc('course_preview_catalog'),sb.rpc('student_course_status')
 ]);
 if(error||!Array.isArray(catalog))return <section className="panel"><h1>Explore our courses</h1>
   <p role="alert">The course catalog could not be loaded. {error?.message||'Please try again.'}</p></section>;
 return <CourseExplorer catalog={catalog as CoursePreview[]}
   status={(status||{signedIn:false,enrolled:[],pending:null}) as CourseStatus}/>;
}
