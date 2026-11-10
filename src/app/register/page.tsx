'use client';
import {useState} from 'react';
import Link from 'next/link';
import {browserClient} from '@/lib/supabase/browser';
export default function Register(){
 const [email,setEmail]=useState('oprofessortheo@gmail.com');
 const [password,setPassword]=useState('');
 const [status,setStatus]=useState('');
 const [busy,setBusy]=useState(false);
 async function signup(e:React.FormEvent){
 e.preventDefault();setBusy(true);setStatus('');
 const {data,error}=await browserClient().auth.signUp({
 email,password,
 options:{data:{full_name:'Professor Theo'},emailRedirectTo:window.location.origin+'/auth/callback'}
 });
 if(error)setStatus(error.message);
 else if(data.user&&!data.session)setStatus('Registration submitted. Check your inbox to confirm the email, then sign in.');
 else setStatus('Account created. You can now sign in.');
 setBusy(false);
 }
 return <section className="panel" style={{maxWidth:480,margin:'50px auto'}}>
 <p className="eyebrow">Stark Learning · New account</p><h1>Create your student login</h1>
 <p className="muted">Register securely with your email and a private password. Passwords are sent to Supabase Auth and are not stored in the application source.</p>
 <form onSubmit={signup} className="stack">
 <label>Email<input required type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)}/></label>
 <label>Password<input required type="password" minLength={8} autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)}/></label>
 <button disabled={busy}>{busy?'Registering…':'Create account'}</button>
 </form>
 {status&&<p role="status" className="notice">{status}</p>}
 <p><Link href="/login">Already registered? Sign in</Link></p>
 </section>
}
