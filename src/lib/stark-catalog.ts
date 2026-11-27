export type StarkCatalogKind='series'|'movie'|'short'|'interview';
export type StarkCatalogStatus='concept'|'source_records'|'approved'|'published';
export type StarkCatalogCollection={
 slug:string;title:string;kind:StarkCatalogKind;cefr:string;description:string;
 expectedLessons:number|null;expectedReviews:number;sourceRecords:number;
 status:StarkCatalogStatus;seriesId:string|null;
};
export type StarkCatalogUnit={
 code:string;order:number;block:number|null;kind:'lesson'|'review';cefr:string;
 stage:string;workingTitle:string;titleVerified:boolean;
 outcome:string;status:'draft'|'approved'|'published';
};
export type StarkCollectionDetail=StarkCatalogCollection&{units:StarkCatalogUnit[]};
export type StarkCatalogSource={
 code:string;source_url:string|null;source_instructions:string|null;
 source_deliverable:string|null;source_completion:string|null;
};
export const STARK_CATALOG_KINDS:[
 StarkCatalogKind,StarkCatalogKind,StarkCatalogKind,StarkCatalogKind
]=['series','movie','short','interview'];
export const STARK_SECTION_LABELS:Record<StarkCatalogKind,string>={
 series:'Séries',movie:'Filmes',short:'Shorts',interview:'Entrevistas'
};
export const STARK_ICONS:Record<StarkCatalogKind,string>={
 series:'▣',movie:'▤',short:'▷',interview:'♙'
};
export function collectionStage(c:StarkCatalogCollection):string{
 if(c.status==='published')return 'Conteúdo publicado';
 if(c.status==='approved')return 'Estrutura aprovada';
 if(c.status==='source_records')return 'Materiais identificados · em preparação';
 return 'Coleção planejada';
}
export function collectionUnits(c:StarkCatalogCollection):string{
 if(c.slug==='svo'||c.slug==='dvc')return c.expectedLessons+' aulas · '+c.expectedReviews+' revisões';
 if(c.kind==='short')return c.sourceRecords+' modelos de atividade';
 if(c.expectedLessons!==null)return c.expectedLessons+' aulas propostas';
 return 'Percurso em desenvolvimento';
}

export type CollectionUnitProgress={
 code:string;assignmentId:string|null;
 status:'not_assigned'|'assigned'|'in_progress'|'awaiting_review'|'revision_requested'|'completed';
 minutes:number;
};
export type CollectionPriorKnowledge={key:string;label:string;checked:boolean};
export type CollectionProgress={
 signedIn:boolean;enrolled:boolean;totalUnits:number;assignedUnits:number;
 completedUnits:number;expectedMinutes:number;earnedMinutes:number;
 units:CollectionUnitProgress[];skills:CollectionPriorKnowledge[];
};
export function durationLabel(totalMinutes:number){
 const hours=Math.floor(Math.max(0,totalMinutes)/60);
 const mins=Math.max(0,totalMinutes)%60;
 return hours?hours+'h'+(mins?String(mins).padStart(2,'0'):''):(mins+' min');
}
export function detailUnitStatus(status:CollectionUnitProgress['status']){
 if(status==='completed')return 'Completed';
 if(status==='awaiting_review')return 'Awaiting teacher review';
 if(status==='revision_requested')return 'Revision requested';
 if(status==='in_progress')return 'In progress';
 if(status==='assigned')return 'Assigned · Ready';
 return 'Not assigned';
}
