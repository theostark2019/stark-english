import lessonsA from '@/data/svo-lessons-02-08.json';
import lessonsB from '@/data/svo-lessons-09-15.json';
import reviews from '@/data/svo-reviews.json';
export type SvoPracticeChoice=[string,string,string[]];
export type SvoGap=[string,string];
export type SvoTranslation=[string,string];
export type SvoLesson={
 code:string;page:number;title:string;level:string;vocab:string;
 context:string[];chunks:string[];grammar:string;grammarExamples:string[];
 express:SvoTranslation[];choose:SvoPracticeChoice[];gaps:SvoGap[];
};
export type SvoReview={
 code:string;page:number;title:string;level:string;lessonCodes:string[];
 change:string;questions:string[];fill:string[];express:string;reviewGuidance:string;
};
const lessonData=[...lessonsA,...lessonsB] as SvoLesson[];
const reviewData=reviews as SvoReview[];
export const SVO_LESSONS:Record<string,SvoLesson>=Object.fromEntries(lessonData.map(l=>[l.code,l]));
export const SVO_REVIEWS:Record<string,SvoReview>=Object.fromEntries(reviewData.map(r=>[r.code,r]));
export type SvoWord={key:string;en:string;pt:string;example:string};
export const svoWordKey=(word:string)=>word.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')
 .replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
export function getSvoWords(lesson:SvoLesson):SvoWord[]{
 return lesson.vocab.split('|').map(pair=>{
  const i=pair.indexOf('=');
  if(i<1)throw Error('Bad SVO vocabulary: '+pair);
  const en=pair.slice(0,i).trim();
  const pt=pair.slice(i+1).trim();
  const term=en.includes('→')?en.split('→')[1].trim():en;
  const source=[...lesson.context,...lesson.grammarExamples,...lesson.express.map(e=>e[1])];
  const example=source.find(s=>s.toLowerCase().includes(term.toLowerCase()))||'';
  return {key:svoWordKey(en),en,pt,example};
 });
}
export const SVO_LESSON_ORDER=[
 'SVO-L01','SVO-L02','SVO-L03','SVO-R01','SVO-L04','SVO-L05','SVO-L06','SVO-R02',
 'SVO-L07','SVO-L08','SVO-L09','SVO-R03','SVO-L10','SVO-L11','SVO-L12','SVO-R04',
 'SVO-L13','SVO-L14','SVO-L15','SVO-R05'
];
export const SVO_10_STEPS=[
 'Vocabulary check','Personal flashcards','Words in context','Express it · Translation','Substitution practice',
 'Grammar explained','Useful chunks','Practice A · Choose','Practice B · Complete','Dictation'
];
export const SVO_5_REVIEW_STEPS=[
 'Change it','Answer it','Create sentences','Express it+','Reflection & submission'
];
export function isSvoContentCode(code:string):boolean{
 return Boolean(SVO_LESSONS[code]||SVO_REVIEWS[code]);
}
export type SvoLessonAnswers={
 unknown:string[];ratings:Record<string,number>;translations:string[];substitutions:string[];
 practiceChoice:Record<string,number>;practiceGap:string[];dictation:string[];doubts:string;
 step:number;visited:number[];
};
export type SvoReviewAnswers={
 changed:string;answers:string[];fills:string[];translation:string;originals:string[];
 reflection:string;step:number;visited:number[];
};
export function newSvoLessonAnswers(lesson:SvoLesson):SvoLessonAnswers{
 return {unknown:[],ratings:{},translations:lesson.express.map(()=>''),substitutions:['',''],
  practiceChoice:{},practiceGap:lesson.gaps.map(()=>''),dictation:lesson.context.slice(0,5).map(()=>''),
  doubts:'',step:0,visited:[0]};
}
export function newSvoReviewAnswers(review:SvoReview):SvoReviewAnswers{
 return {changed:'',answers:review.questions.map(()=>''),fills:review.fill.map(()=>''),translation:'',
  originals:review.code==='SVO-R05'?['','','']:['',''],reflection:'',step:0,visited:[0]};
}
export const normalizeSvo=(s:string)=>s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')
 .replace(/[^a-z0-9 ]/g,'').replace(/\s+/g,' ').trim();
export function lessonCompleteness(l:SvoLesson,a:SvoLessonAnswers){
 const missing:string[]=[];
 if(a.translations.filter(x=>x.trim()).length!==l.express.length)missing.push('Express it translations');
 if(a.substitutions.filter(x=>x.trim()).length<2)missing.push('two original sentences');
 if(Object.keys(a.practiceChoice).length<l.choose.length)missing.push('Practice A choices');
 if(a.practiceGap.filter(x=>x.trim()).length<l.gaps.length)missing.push('Practice B gap answers');
 if(a.dictation.filter(x=>x.trim()).length<5)missing.push('all five dictations');
 return missing;
}
export function reviewCompleteness(r:SvoReview,a:SvoReviewAnswers){
 const missing:string[]=[];
 if(a.changed.trim().length<20)missing.push('Change it paragraph');
 if(a.answers.filter(x=>x.trim()).length<r.questions.length)missing.push('all Answer it questions');
 if(a.fills.filter(x=>x.trim()).length<r.fill.length)missing.push('all sentence completions');
 if(a.translation.trim().length<20)missing.push('Express it+ translation');
 if(a.originals.filter(x=>x.trim()).length<(r.code==='SVO-R05'?3:2))missing.push('original sentences');
 return missing;
}
