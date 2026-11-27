import {NextRequest,NextResponse} from 'next/server';
import {serverClient} from '@/lib/supabase/server';
export async function GET(request:NextRequest){
 const url=new URL(request.url);const code=url.searchParams.get('code');
 if(code){const sb=await serverClient();const {error}=await sb.auth.exchangeCodeForSession(code);if(!error)return NextResponse.redirect(new URL('/dashboard',url.origin))}
 return NextResponse.redirect(new URL('/login',url.origin));
}
