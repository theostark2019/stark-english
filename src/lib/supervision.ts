export type SupervisionRow={
 student_id:string;student_name:string;courses:string[];academic_fields:Record<string,unknown>;
 enrolled_at:string;minutes_confirmed:number;assigned_count:number;completed_count:number;
 mastery_average:number|null;submitted_waiting:number;active_days:string[];last_activity:string|null;
 homework_due_count:number;homework_ontime_count:number
};
export type StaffProfile={
 user_id:string;full_name:string;hierarchy:string;manager_id:string|null;active:boolean;
 job_title:string;biography:string;specializations:string[];cefr_levels:string[];student_count:number
};
export type StaffCandidate={user_id:string;full_name:string;current_level:string|null};
export const hierarchy=['Principal','Coordinator','Leader','Teacher','Instructor','Monitor'] as const;
export type Hierarchy=(typeof hierarchy)[number];
export const roleDescriptions:Record<Hierarchy,string>={
 Principal:'School-wide visibility, staff hierarchy, academic and administrative oversight',
 Coordinator:'School-wide supervision and management of junior staff levels',
 Leader:'Own students and direct-report teams; can assign their supervised rosters',
 Teacher:'Assigned students, academic guidance, contact and lesson assessment',
 Instructor:'Assigned students, academic guidance and lesson assessment',
 Monitor:'Read-only monitoring of assigned students; no review or contact records'
};
export function localDay(d:Date=new Date()){
 const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(d);
 const pick=(s:string)=>parts.find(p=>p.type===s)?.value||'';
 return pick('year')+'-'+pick('month')+'-'+pick('day');
}
export function offsetDay(day:string,n:number){
 const d=new Date(day+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);
}
export function gapDays(from:string,to:string){return Math.round((new Date(to+'T12:00:00Z').getTime()-new Date(from+'T12:00:00Z').getTime())/86400000);}
export function indicators(row:SupervisionRow,today=localDay()){
 const days=new Set(row.active_days||[]);
 const active30=[...days].filter(d=>d>=offsetDay(today,-29)&&d<=today).length;
 let start=days.has(today)?today:offsetDay(today,-1);
 let streak=0;
 while(days.has(start)&&streak<90){streak++;start=offsetDay(start,-1);}
 const assigned=Number(row.assigned_count||0),completed=Number(row.completed_count||0),due=Number(row.homework_due_count||0);
 const ontime=Number(row.homework_ontime_count||0);
 const last=row.last_activity;
 const inactiveDays=last?gapDays(last,today):null;
 const sinceEnrollment=row.enrolled_at?gapDays(row.enrolled_at.slice(0,10),today):null;
 const flag=due>0&&ontime/due<0.5?'Homework follow-up':
   (inactiveDays!==null&&inactiveDays>=7)||(inactiveDays===null&&sinceEnrollment!==null&&sinceEnrollment>=7)?'Inactive 7+ days':'On track';
 return {streak,active30,completion:assigned?Math.round(completed/assigned*100):null,
 homework:due?Math.round(ontime/due*100):null,flag,inactiveDays,
 hours:Number(row.minutes_confirmed||0)/60,mastery:row.mastery_average===null?null:Number(row.mastery_average)};
}
export function displayPercent(v:number|null){return v===null?'—':v+'%';}
export function roleRank(value:string){
 return {Principal:6,Coordinator:5,Leader:4,Teacher:3,Instructor:2,Monitor:1}[value as Hierarchy]||0;
}
