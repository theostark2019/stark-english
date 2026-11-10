import {cookies} from 'next/headers';
import {createServerClient} from '@supabase/ssr';
export async function serverClient(){
 const cookieStore=await cookies();
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!url||!key) throw new Error('Supabase server environment is not configured');
 return createServerClient(url,key,{
  cookies:{
   getAll(){return cookieStore.getAll()},
   setAll(items){
    try{items.forEach(({name,value,options})=>cookieStore.set(name,value,options))}
    catch{/* Server Components cannot set cookies; middleware refreshes sessions. */}
   }
  }
 });
}
