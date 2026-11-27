export const dynamic='force-dynamic';
import Link from 'next/link';
import {redirect} from 'next/navigation';
import {serverClient} from '@/lib/supabase/server';
export default async function Agro101ActivitiesPreview(){
 const sb=await serverClient();
 const {data:{user}}=await sb.auth.getUser();
 if(user){
  const {data:episode}=await sb.from('episodes').select('id').eq('code','AGRO-A1-01').maybeSingle();
  if(episode){
   const {data:assignment}=await sb.from('lesson_assignments').select('id')
    .eq('student_id',user.id).eq('episode_id',episode.id).limit(1).maybeSingle();
   if(assignment)redirect('/lessons/'+assignment.id);
  }
 }
 return <div className="agrs-page agrs-preview-activities"><div className="agrs-shell">
  <div className="agrs-breadcrumb"><Link href="/courses/agroenglish/agriculture-101">← Agriculture 101</Link>
   <span>/</span><strong>Interactive activity preview</strong></div>
  <header className="agrs-preview-head"><span className="agrs-kicker">AGROENGLISH · PREVIEW MODE</span>
   <h1>Agriculture 101 · Activities</h1><p>Explore the original lesson’s seven interactive activity stages. This preview is not linked to a student account and does not award completion credits.</p>
  </header>
  <iframe className="agrs-preview-iframe" src="/lessons/agriculture101.html?preview=1"
   title="Agriculture 101 original interactive activities preview" allow="microphone"/>
  <footer className="agrs-footer"><Link href="/courses/agroenglish/agriculture-101">← Back to lesson overview</Link>
   <Link href="/courses/agroenglish">AgroEnglish home ↗</Link></footer>
 </div></div>;
}
