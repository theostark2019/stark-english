export const dynamic='force-dynamic';
import {redirect} from 'next/navigation';
import {requireUser} from '@/lib/auth';
import {isPortalSlug} from '@/lib/course-portals';

/** The student home opens their course's streaming dashboard.
 * Multiple enrollments retain a choice screen instead of assuming one course.
 */
export default async function StudentHome(){
 const {sb,user}=await requireUser();
 const {data:enrollments,error}=await sb.from('enrollments')
  .select('course_id').eq('student_id',user.id);
 if(error)return <section className="panel"><h1>My learning</h1>
  <p role="alert">Unable to load your enrolled courses. {error.message}</p></section>;
 if(!enrollments?.length)redirect('/courses');
 const ids=[...new Set(enrollments.map(e=>e.course_id))];
 const {data:courses, error:courseError}=await sb.from('courses')
  .select('slug').in('id',ids);
 if(courseError)return <section className="panel"><h1>My learning</h1>
  <p role="alert">Unable to load your course information. {courseError.message}</p></section>;
 const enrolled=(courses||[]).filter(c=>isPortalSlug(c.slug));
 if(enrolled.length===1)redirect('/courses/'+enrolled[0].slug);
 redirect('/courses');
}
