export const dynamic='force-dynamic';
import Link from 'next/link';
import {redirect} from 'next/navigation';
import {requireSupervisor} from '@/lib/auth';
import {AgroMediaManager} from '@/components/AgroMediaManager';
import type {AgroMediaSlot} from '@/lib/agro-media';
export default async function AgroMediaAdmin(){
 const {sb,staff}=await requireSupervisor();
 if(staff.hierarchy!=='Principal')redirect('/courses/agroenglish');
 const {data, error}=await sb.from('agro_course_media')
  .select('slot,storage_path,mime_type,byte_size')
  .eq('episode_code','AGRO-A1-01');
 return <div className="agrs-page agrs-admin-page"><div className="agrs-shell">
  <div className="agrs-breadcrumb"><Link href="/courses/agroenglish">← AgroEnglish home</Link>
   <span>/</span><strong>Media studio · Principal</strong></div>
  <header className="agrs-admin-hero"><span className="agrs-kicker">STARK LEARNING · COURSE PRODUCTION</span>
   <h1>Agriculture 101 · Media studio</h1><p>Publish the original farm illustrations and the two A1/A2 ElevenLabs recordings into the existing AgroEnglish portal.</p>
  </header>
  {error?<div role="alert">Unable to read the media manifest: {error.message}</div>:
   <AgroMediaManager initial={(data||[]) as {slot:AgroMediaSlot;storage_path:string;mime_type:string;byte_size:number}[]}/>}
  <footer className="agrs-footer"><Link href="/courses/agroenglish/agriculture-101">Preview lesson ↗</Link>
   <Link href="/courses/agroenglish">Back to dashboard ↗</Link></footer>
 </div></div>;
}
