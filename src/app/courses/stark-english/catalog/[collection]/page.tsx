export const dynamic='force-dynamic';
import {notFound} from 'next/navigation';
import {serverClient} from '@/lib/supabase/server';
import {CinematicCollectionDetail} from '@/components/CinematicCollectionDetail';
import type {CollectionProgress,StarkCatalogSource,StarkCollectionDetail} from '@/lib/stark-catalog';

export default async function StarkCollection({params}:{
 params:Promise<{collection:string}>}){
 const {collection}=await params;
 if(!/^[a-z0-9-]{2,80}$/.test(collection))notFound();
 const sb=await serverClient();
 const [{data:detail,error},{data:progressData},{data:sourceData}]=await Promise.all([
  sb.rpc('stark_english_collection',{p_slug:collection}),
  sb.rpc('stark_collection_progress',{p_slug:collection}),
  sb.rpc('stark_english_collection_sources',{p_slug:collection})
 ]);
 if(error||!detail||detail==='null')notFound();
 const c=detail as StarkCollectionDetail;
 if(!c.slug||c.slug!==collection||!c.kind)notFound();
 const progress=(progressData||{
  signedIn:false,enrolled:false,totalUnits:(c.units||[]).length,
  assignedUnits:0,completedUnits:0,expectedMinutes:0,earnedMinutes:0,units:[],skills:[]
 }) as CollectionProgress;
 return <CinematicCollectionDetail c={c} progress={progress}
  sources={(sourceData||[]) as StarkCatalogSource[]}/>;
}
