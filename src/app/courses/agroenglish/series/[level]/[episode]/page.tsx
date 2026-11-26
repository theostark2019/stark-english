import {notFound,redirect} from 'next/navigation';
import {serverClient} from '@/lib/supabase/server';
import {AGRO_EPISODES} from '@/lib/agro02';
import {Agro02Lesson} from '@/components/Agro02Lesson';
export const dynamic='force-dynamic';
export default async function AgroEpisodePreview({params}:{params:Promise<{level:string;episode:string}>}){
 const {level,episode:number}=await params;
 if(!/^([1-9]|1[0-9]|2[0-4])$/.test(number))notFound();
 const episode=AGRO_EPISODES.find(e=>e.level.toLowerCase()===level.toLowerCase()&&e.episode===Number(number));
 if(!episode)notFound();
 const sb=await serverClient();const {data:{user}}=await sb.auth.getUser();
 if(user){const {data:e}=await sb.from('episodes').select('id').eq('code',episode.code).maybeSingle();
  if(e){const {data:a}=await sb.from('lesson_assignments').select('id').eq('episode_id',e.id).eq('student_id',user.id).order('created_at').limit(1);if(a?.[0])redirect('/lessons/'+a[0].id);}}
 return <Agro02Lesson episode={episode}/>;
}
