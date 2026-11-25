import type {SupabaseClient} from '@supabase/supabase-js';
export const AGRO_MEDIA_BUCKET='agro-course-media';
export const AGRO_MEDIA_EPISODE='AGRO-A1-01';
export type AgroMediaSlot='hero'|'a1-coffee'|'a1-farmwork'|'a1-visual-story'|
 'a2-mixed-farms'|'a2-photo-story'|'a2-field-notes'|'a1-audio'|'a2-audio';
export type AgroMediaManifest=Partial<Record<AgroMediaSlot,string>>;
export const AGRO_MEDIA_LABELS:Record<AgroMediaSlot,string>={
 hero:'Hero · Marina meets the farm team',
 'a1-coffee':'A1 · coffee farm conversation',
 'a1-farmwork':'A1 · farm work collage',
 'a1-visual-story':'A1 · visual story and field notes',
 'a2-mixed-farms':'A2 · mixed crops and farm visit',
 'a2-photo-story':'A2 · six-scene farm storyboard',
 'a2-field-notes':'A2 · farm visit photo journal',
 'a1-audio':'A1 · Marina reading narration (MP3)',
 'a2-audio':'A2 · agricultural training narration (MP3)'
};
export const AGRO_MEDIA_SLOTS=Object.keys(AGRO_MEDIA_LABELS) as AgroMediaSlot[];
export async function agroMediaManifest(sb:SupabaseClient):Promise<AgroMediaManifest>{
 const {data,error}=await sb.from('agro_course_media')
  .select('slot,storage_path').eq('episode_code',AGRO_MEDIA_EPISODE);
 if(error)return {};
 const results:AgroMediaManifest={};
 for(const item of data||[]){
  if(!AGRO_MEDIA_SLOTS.includes(item.slot as AgroMediaSlot))continue;
  results[item.slot as AgroMediaSlot]=sb.storage.from(AGRO_MEDIA_BUCKET).getPublicUrl(item.storage_path).data.publicUrl;
 }
 return results;
}
export const AGRO_A1_TEXT="My name is Marina.\n\nI am from Lavras, Brazil.\n\nI am an agronomy student, and I visit farms to learn about agriculture.\n\nToday, I am on a coffee farm.\n\nThe farmer is Paulo.\n\nHe grows coffee and works with a small team.\n\nThe farm has fields, plants, and good soil.\n\nWorkers plant young coffee trees, check the leaves, and harvest coffee when it is ready.\n\nPaulo also talks about corn and soybeans.\n\nDifferent farms grow different crops.\n\nI like learning about farming because I want to work with farmers.\n\nAt the end of the visit, I say, “Thank you. Nice to meet you!”";
export const AGRO_A2_TEXT="Marina is visiting an agricultural training event in Minas Gerais.\n\nShe studies agronomy and wants to understand how farms operate.\n\nHer first visit is to a coffee farm, where workers monitor the crop, care for the soil, and harvest coffee during the appropriate season.\n\nThe next farm produces soybeans and corn. Its team uses tractors to prepare fields and transport supplies.\n\nMarina notices that farmers may grow different crops, but they all need to plan their work, manage resources, and communicate with other people.\n\nShe introduces herself to each farm manager, explains her studies, and asks what the team does during the growing season.\n\nThe visits help her connect classroom vocabulary with real agricultural work.";

export const AGRO_SCENES=[
 {title:'A Coffee Farm',sub:'Monitoring the crop',note:'Workers check plant health and harvest coffee during the appropriate season.',slot:'a1-coffee' as const},
 {title:'A Soybean and Corn Farm',sub:'Planning and preparation',note:'The team uses tractors to prepare fields and transport supplies.',slot:'a2-mixed-farms' as const},
 {title:'Different Farms, Shared Work',sub:'Learning from people',note:'Farmers plan, manage resources and communicate across crops.',slot:'a2-photo-story' as const}
];
