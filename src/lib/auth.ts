import {redirect} from 'next/navigation';
import {serverClient} from './supabase/server';
export async function requireUser(){
 const sb=await serverClient();
 const {data:{user},error}=await sb.auth.getUser();
 if(error||!user) redirect('/login');
 return {sb,user};
}
export async function requireTeacher(){
 const {sb,user}=await requireUser();
 const {data:profile}=await sb.from('teacher_profiles').select('user_id,active').eq('user_id',user.id).maybeSingle();
 if(!profile?.active) redirect('/dashboard');
 return {sb,user};
}
export async function requireAdmin(){
 const {sb,user}=await requireUser();
 const {data:profile}=await sb.from('profiles').select('role').eq('id',user.id).maybeSingle();
 if(profile?.role!=='admin') redirect('/dashboard');
 return {sb,user};
}

export async function requireSupervisor(){
 const {sb,user}=await requireUser();
 const {data:staff}=await sb.from('staff_profiles')
 .select('user_id,hierarchy,active,job_title,biography,specializations,cefr_levels,manager_id')
 .eq('user_id',user.id).maybeSingle();
 if(!staff?.active) redirect('/dashboard');
 return {sb,user,staff};
}
