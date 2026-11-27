/** SVO Protocol — Module 1, Lesson 1. Transcribed from the owner's SVO11 book, p. 10.
 * New interactive exercises extend rather than replace the original Express it prompts.
 * Each subsequent SVO lesson can supply this same data contract.
 */
export type SvoLexeme={key:string;en:string;pt:string;kind:string;example:string};
export type SvoTranslate={pt:string;model:string};
export type SvoQuestion={prompt:string;choices:string[];correct:number;why:string};
export type SvoGap={prompt:string;answer:string;hint:string};
export type SvoLessonDefinition={
 code:string;heading:string;cefr:string;sourcePage:number;
 lexicon:SvoLexeme[];contexts:string[];translations:SvoTranslate[];
 chunks:{en:string;pt:string}[];practiceQuestions:SvoQuestion[];
 practiceGaps:SvoGap[];dictation:string[];
};
export const SVO_L01:SvoLessonDefinition={
 code:'SVO-L01',heading:'To Drink / To Study',cefr:'A1',sourcePage:10,
 lexicon:[
 {key:'drink',en:'drink',pt:'beber',kind:'verb',example:'I drink water.'},
 {key:'study',en:'study',pt:'estudar',kind:'verb',example:'You study English every day.'},
 {key:'water',en:'water',pt:'água',kind:'noun',example:'I drink water.'},
 {key:'milk',en:'milk',pt:'leite',kind:'noun',example:'I drink milk.'},
 {key:'juice',en:'juice',pt:'suco',kind:'noun',example:'You drink juice.'},
 {key:'coffee',en:'coffee',pt:'café',kind:'noun',example:'I drink coffee.'},
 {key:'tea',en:'tea',pt:'chá',kind:'noun',example:'You drink tea.'},
 {key:'soda',en:'soda',pt:'refrigerante',kind:'noun',example:'I drink soda.'},
 {key:'orange',en:'orange',pt:'laranja',kind:'noun / flavour',example:'I drink orange juice every day.'},
 {key:'grape',en:'grape',pt:'uva',kind:'noun / flavour',example:'I drink grape juice.'},
 {key:'apple',en:'apple',pt:'maçã',kind:'noun / flavour',example:'You drink apple juice.'},
 {key:'english',en:'English',pt:'inglês',kind:'language',example:'I study English.'},
 {key:'spanish',en:'Spanish',pt:'espanhol',kind:'language',example:'I study Spanish and English.'},
 {key:'portuguese',en:'Portuguese',pt:'português',kind:'language',example:'You study Portuguese.'},
 {key:'math',en:'Math',pt:'matemática',kind:'school subject',example:'I study Math.'},
 {key:'geography',en:'Geography',pt:'geografia',kind:'school subject',example:'You study geography.'},
 {key:'i',en:'I',pt:'eu',kind:'pronoun',example:'I drink milk.'},
 {key:'you',en:'You',pt:'você',kind:'pronoun',example:'You study English every day.'},
 {key:'and',en:'and',pt:'e',kind:'connector',example:'I study Spanish and English.'},
 {key:'every-day',en:'every day',pt:'todos os dias',kind:'time chunk',example:'I drink water every day.'}
 ],
 contexts:[
 'I drink milk.',
 'I drink water.',
 'I study English.',
 'I drink water every day.',
 'You drink juice.',
 'You study English every day.',
 'I drink orange juice every day.',
 'You drink apple juice.',
 'You study geography.',
 'I study Spanish and English.'
 ],
 translations:[
 {pt:'Eu bebo leite. Você bebe café.',model:'I drink milk. You drink coffee.'},
 {pt:'Eu bebo água todos os dias.',model:'I drink water every day.'},
 {pt:'Você estuda inglês.',model:'You study English.'},
 {pt:'Você estuda geografia e matemática.',model:'You study Geography and Math.'},
 {pt:'Eu bebo suco de uva e você bebe refrigerante.',model:'I drink grape juice and you drink soda.'},
 {pt:'Eu estudo inglês e você estuda espanhol.',model:'I study English and you study Spanish.'},
 {pt:'Você bebe chá e eu bebo refrigerante de laranja.',model:'You drink tea and I drink orange soda.'}
 ],
 chunks:[
 {en:'I drink…',pt:'Eu bebo…'},
 {en:'You study…',pt:'Você estuda…'},
 {en:'orange juice',pt:'suco de laranja'},
 {en:'apple juice',pt:'suco de maçã'},
 {en:'coffee and milk',pt:'café e leite'},
 {en:'Math and Portuguese',pt:'matemática e português'},
 {en:'every day',pt:'todos os dias'}
 ],
 practiceQuestions:[
 {prompt:'I ____ water every day.',choices:['drink','drinks','study'],correct:0,why:'With I, use drink without -s.'},
 {prompt:'You ____ English.',choices:['drinks','study','studies'],correct:1,why:'Study is used with you.'},
 {prompt:'I drink ____ juice.',choices:['orange','English','Math'],correct:0,why:'Orange describes a juice flavour.'},
 {prompt:'I study Spanish ____ English.',choices:['oranges','every','and'],correct:2,why:'And connects two things.'},
 {prompt:'____ drink milk.',choices:['I','Geography','Math'],correct:0,why:'I is the subject of this sentence.'},
 {prompt:'You study English ____.',choices:['every day','juice','grape'],correct:0,why:'Every day tells us when/how often.'}
 ],
 practiceGaps:[
 {prompt:'I ___ milk.',answer:'drink',hint:'verb: beber'},
 {prompt:'You ___ Geography.',answer:'study',hint:'verb: estudar'},
 {prompt:'I drink ___ juice.',answer:'apple',hint:'fruit: maçã'},
 {prompt:'I study Spanish ___ English.',answer:'and',hint:'connector: e'},
 {prompt:'You drink water ___ ___.',answer:'every day',hint:'time expression: todos os dias'}
 ],
 dictation:[
 'I drink milk.',
 'You study English every day.',
 'I drink orange juice every day.',
 'You drink apple juice.',
 'I study Spanish and English.'
 ]
};
export const SVO_L01_STEPS=[
 'Vocabulary check','My flashcards','Words in context','Translate',
 'Substitution','Grammar explained','Useful chunks','Practice · Choose',
 'Practice · Complete','Dictation'
] as const;
export type SvoL01Answers={
 unknown:string[];flashRatings:Record<string,number>;translations:string[];
 substitutions:string[];doubts:string;practiceChoice:Record<string,number>;
 practiceGap:string[];dictation:string[];step:number;visited:number[];
};
export function initialSvoAnswers():SvoL01Answers{return{
 unknown:[],flashRatings:{},translations:Array(7).fill('') as string[],
 substitutions:['',''],doubts:'',practiceChoice:{},practiceGap:Array(5).fill('') as string[],
 dictation:Array(5).fill('') as string[],step:0,visited:[0]
};}
export function comparable(v:string):string{
 return v.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')
  .replace(/[^a-z0-9 ]/g,'').replace(/\s+/g,' ').trim();
}
export function readyForSubmission(a:SvoL01Answers):{ready:boolean;missing:string[]}{
 const missing:string[]=[];
 if(a.translations.length<7||a.translations.some(x=>!x.trim()))missing.push('all 7 Express it translations');
 if(a.substitutions.length<2||a.substitutions.some(x=>!x.trim()))missing.push('2 original substitution sentences');
 if(Object.keys(a.practiceChoice).length<6)missing.push('all 6 choice questions');
 if(a.practiceGap.length<5||a.practiceGap.some(x=>!x.trim()))missing.push('all 5 fill-in exercises');
 if(a.dictation.length<5||a.dictation.some(x=>!x.trim()))missing.push('all 5 dictated sentences');
 return {ready:missing.length===0,missing};
}
