import checklist from '@/data/agro02-checklist.json';
import {AGRO02_CONTENT} from './agro02-content';
export type AgroLevel='A1'|'A2'|'B1'|'B2';
export const AGRO_LEVELS:AgroLevel[]=['A1','A2','B1','B2'];
export const AGRO_SERIES:Record<AgroLevel,{title:string;description:string;icon:string}>={
 A1:{title:'Meet the farm',description:'Introduce yourself, describe your world and take part in everyday farm life.',icon:'🌱'},
 A2:{title:'Make things happen',description:'Explain routines, compare choices and solve everyday work problems.',icon:'🚜'},
 B1:{title:'Work with confidence',description:'Connect evidence, explain decisions and contribute to your team.',icon:'🌾'},
 B2:{title:'Lead the conversation',description:'Assess proposals, negotiate precisely and bring people to an informed decision.',icon:'🌍'}
};
export type AgroEpisode=typeof checklist[number]&{level:AgroLevel;model:string;words:{en:string;pt:string}[];translation:string;translationExample:string;chunks:string[];minutes:number};
export const AGRO_EPISODES:AgroEpisode[]=checklist.map(r=>{
 const level=r.level as AgroLevel;
 const [model,glossary,translation,translationExample]=AGRO02_CONTENT[level][r.episode-1];
 return {...r,level,model,translation,translationExample,
  words:glossary.split('|').map(w=>{const [en,pt]=w.split('=');return {en,pt}}),
  chunks:model.split(/(?<=[.!?])\s+|\n/).filter(x=>x.length>15&&!x.startsWith('Practice')).slice(0,3),
  minutes:level==='A1'?30:level==='A2'?40:level==='B1'?50:60};
});
export function agroEpisode(code:string){return AGRO_EPISODES.find(e=>e.code===code);}
export const agroHref=(e:{level:string;episode:number})=>'/courses/agroenglish/series/'+e.level.toLowerCase()+'/'+e.episode;
export const MODEL_AUDIO='https://app.speechify.com/soundbite/f045a4a8b6e442a8af4d674b2187be88';
export type AgroProgress={code:string;assignmentId:string;attemptId:string|null;status:string;dueAt:string|null;score:number|null;verified:boolean;seconds:number};
