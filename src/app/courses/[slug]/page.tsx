export const dynamic='force-dynamic';
import {notFound} from 'next/navigation';
import {serverClient} from '@/lib/supabase/server';
import {PortalPreview} from '@/components/CourseExplorer';
import {isPortalSlug,type CoursePreview,type CourseStatus} from '@/lib/course-portals';
export default async function CoursePortal({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;
 if(!isPortalSlug(slug))notFound();
 const sb=await serverClient();
 const [{data:catalog,error},{data:status}]=await Promise.all([
  sb.rpc('course_preview_catalog'),sb.rpc('student_course_status')
 ]);
 if(error||!Array.isArray(catalog))return <section className="panel"><h1>Course unavailable</h1>
  <p role="alert">Unable to load the course preview. {error?.message||'Please try again.'}</p></section>;
 const course=(catalog as CoursePreview[]).find(c=>c.slug===slug);
 if(!course)notFound();
 return <PortalPreview course={course}
  status={(status||{signedIn:false,enrolled:[],pending:null}) as CourseStatus}/>;
}
