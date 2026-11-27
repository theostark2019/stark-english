export const dynamic='force-dynamic';
import {redirect} from 'next/navigation';
import {requireSupervisor} from '@/lib/auth';
import {roleRank} from '@/lib/supervision';
import {CourseRequestsReview,type CourseRequest} from '@/components/CourseRequestsReview';
export default async function CourseRequestsPage(){
 const {sb,staff}=await requireSupervisor();
 if(roleRank(staff.hierarchy)<3)redirect('/teacher');
 const {data,error}=await sb.rpc('teacher_course_requests');
 if(error)return <section className="panel"><h1>Course requests</h1>
   <p role="alert">Unable to load pending choices. {error.message}</p></section>;
 return <CourseRequestsReview requests={(data||[]) as CourseRequest[]}/>;
}
