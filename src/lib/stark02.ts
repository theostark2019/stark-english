export type MeetingPlan={id:string;contract_id:string;minutes:number;price_cents:number|null;times_per_week:number};
export type StarkContract={id:string;course_id:string;course:string;starts_on:string;ends_on:string;status:string;plans:MeetingPlan[];monthlyCents:number|null};
export type StarkMeeting={id:string;contract_id:string;student_id:string;teacher_id:string;teacher:string;starts_at:string;minutes:number;price_cents:number|null;status:string};
export type StarkTuition={id:string;contract_id:string;month:string;amount_cents:number;status:string;paid_at:string|null};
export type StarkHomework={id:string;from_meeting:string;due_meeting:string;assignment_id:string|null;label:string;amount:number;unit:string;dueAt:string};
export type StarkCommitment={id:string;assignment_id:string;title:string;code:string;amount:number;unit:string;dueAt:string|null;status:string|null};
export type StudentRelationshipRecord={canManage:boolean;canTeach:boolean;financial:boolean;contracts:StarkContract[];meetings:StarkMeeting[];tuitions:StarkTuition[];homework:StarkHomework[];commitments:StarkCommitment[]};
export function monthlyTuition(plans:{price_cents:number;times_per_week:number}[]){return plans.reduce((n,p)=>n+p.price_cents*p.times_per_week*4,0)}
export const brl=(cents:number)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(cents/100);
export function starkDate(raw:string,time=false){return new Date(raw+(raw.length===10?'T12:00:00Z':'')).toLocaleString('en-GB',{timeZone:'America/Sao_Paulo',day:'numeric',month:'short',year:'numeric',...(time?{hour:'2-digit',minute:'2-digit'}:{})})}
