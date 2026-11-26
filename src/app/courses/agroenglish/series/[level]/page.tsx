import {notFound} from 'next/navigation';
import {serverClient} from '@/lib/supabase/server';
import {Agro02Dashboard} from '@/components/Agro02Dashboard';
import {AGRO_LEVELS,type AgroLevel} from '@/lib/agro02';
import {getAgro02Progress} from '@/lib/agro02-progress';
export const dynamic='force-dynamic';
export default async function AgroSeries({params,searchParams}:{params:Promise<{level:string}>;searchParams:Promise<{q?:string}>}){
 const level=(await params).level.toUpperCase() as AgroLevel;
 if(!AGRO_LEVELS.includes(level))notFound();
 const query=((await searchParams).q||'').slice(0,120);
 const sb=await serverClient();const {data:{user}}=await sb.auth.getUser();
 let progress:Awaited<ReturnType<typeof getAgro02Progress>>=[];let recordError=false;
 if(user)try{progress=await getAgro02Progress(sb,user.id)}catch{recordError=true}
 return <Agro02Dashboard level={level} progress={progress} query={query} recordError={recordError}/>;
}
