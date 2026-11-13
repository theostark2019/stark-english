export type PortalSlug='stark-english'|'business-english'|'agroenglish'|'med-english';
export type CoursePreview={
 id:string;slug:string;title:string;description:string;
 seriesCount:number;episodeCount:number;publishedCount:number;
 series:{name:string;count:number;published:number;levels:string[]}[];
 publishedEpisodes:{title:string;code:string;level:string;minutes:number}[];
};
export type CourseStatus={
 signedIn:boolean;enrolled:string[];pending:{courseId:string;slug:string;title:string}|null;
};
export type PortalDesign={
 label:string;icon:string;subtitle:string;headline:string;description:string;
 audience:string;focus:string[];paths:{icon:string;title:string;description:string}[];
 themes:{label:string;value:string}[];accent:string;stage:string;
};
export const PORTALS:Record<PortalSlug,PortalDesign>={
 'stark-english':{
  label:'STARK ENGLISH',icon:'✦',subtitle:'English for life',
  headline:'Make English part of your world.',
  description:'Conversations, stories, culture and real-life projects. Your interests shape what you learn to communicate.',
  audience:'Kids · Teens · Adults',stage:'Life experiences',accent:'coral',
  focus:['Everyday communication','Stories & culture','Games & creative challenges','Travel & personal goals'],
  paths:[
   {icon:'◉',title:'Everyday Conversations',description:'Speak about choices, routines, experiences and the people around you.'},
   {icon:'◈',title:'Stories & Culture',description:'Use short scenes, media and storytelling to build meaning.'},
   {icon:'✳',title:'Creative Challenges',description:'Games, role-play and real outcomes at your own CEFR level.'},
   {icon:'↗',title:'Your World, Your English',description:'Connect your interests and future plans to useful communication.'}
  ],themes:[{label:'APPROACH',value:'Communicative'},{label:'LEVELS',value:'A1 → C2'},{label:'FORMAT',value:'Practice + feedback'}]
 },
 'business-english':{
  label:'BUSINESS ENGLISH',icon:'⌁',subtitle:'English for professional impact',
  headline:'Say what matters. Move work forward.',
  description:'Professional communication built around the situations you actually face at work.',
  audience:'Professionals · Teams · Entrepreneurs',stage:'Workplace communication',accent:'amber',
  focus:['Meetings & decisions','Presentations','Interviews','Negotiation & teamwork'],
  paths:[
   {icon:'▣',title:'Meetings & Decisions',description:'Explain priorities, agree on actions and handle questions clearly.'},
   {icon:'↗',title:'Presentations',description:'Organize evidence, deliver your point and respond to an audience.'},
   {icon:'◇',title:'Interviews & Career',description:'Present achievements, experience and professional goals.'},
   {icon:'⇄',title:'Negotiations',description:'Clarify terms, discuss alternatives and solve misunderstandings.'}
  ],themes:[{label:'APPROACH',value:'Task-based'},{label:'FOCUS',value:'Work situations'},{label:'FORMAT',value:'Practice + feedback'}]
 },
 'agroenglish':{
  label:'AGROENGLISH',icon:'🌿',subtitle:'English for agriculture',
  headline:'From the field to the world.',
  description:'Develop agricultural vocabulary and English you can use to describe the farm, analyze problems and communicate professionally.',
  audience:'Students · Agronomists · Agri-professionals',stage:'Agriculture and science',accent:'green',
  focus:['Agriculture foundations','Crops & livestock','Fieldwork & production','Professional agronomy'],
  paths:[
   {icon:'🌱',title:'A1 Foundations',description:'Agriculture 101, agribiology, chemistry, physics, plants and field routines.'},
   {icon:'⚙',title:'A2 Agricultural Practice',description:'Farm operations and clear technical explanations.'},
   {icon:'🔬',title:'B1 Professional Agronomy',description:'Evidence, recommendations and problem-solving with colleagues.'},
   {icon:'🌎',title:'B2 Global Agriculture',description:'Discuss tradeoffs, sustainability and professional decisions.'}
  ],themes:[{label:'CURRICULUM',value:'48 episodes'},{label:'LEVELS',value:'A1 → B2'},{label:'APPROACH',value:'Field tasks'}]
 },
 'med-english':{
  label:'MED-ENGLISH',icon:'✚',subtitle:'English for healthcare',
  headline:'Learn the language of care.',
  description:'Understand anatomy and clinical situations in English through guided episodes and practical communication.',
  audience:'Medical students · Healthcare professionals',stage:'Anatomy and clinical contexts',accent:'teal',
  focus:['Anatomy & body systems','Patient communication','Clinical explanations','Scientific English'],
  paths:[
   {icon:'♧',title:'Body Systems',description:'Describe the human body and its functions with appropriate precision.'},
   {icon:'♡',title:'Patient Encounters',description:'Use clear English to ask, listen and explain.'},
   {icon:'∿',title:'Clinical Reasoning',description:'Connect observations to explanations and next steps.'},
   {icon:'⊕',title:'Medical Communication',description:'Build confidence with clinical and research vocabulary.'}
  ],themes:[{label:'CURRICULUM',value:'32 episodes'},{label:'LEVELS',value:'A1 → B2'},{label:'APPROACH',value:'Case-based'}]
 }
};
export const PORTAL_ORDER:PortalSlug[]=['stark-english','agroenglish','business-english','med-english'];
export function isPortalSlug(v:string):v is PortalSlug{return v in PORTALS;}
