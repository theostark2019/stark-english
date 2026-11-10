'use client';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {browserClient} from '@/lib/supabase/browser';
export default function Login(){const router=useRouter();const[email,setEmail]=useState(''),[password,setPassword]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);setError('');const {error}=await browserClient().auth.signInWithPassword({email,password});if(error)setError(error.message);else{router.push('/dashboard');router.refresh()}setBusy(false)}
 return <section className="panel" style={{maxWidth:480,margin:'50px auto'}}><h1>Sign in</h1><form onSubmit={submit} className="stack"><label>Email<input autoComplete="email" type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Password<input type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)}/></label><button disabled={busy}>Sign in</button>{error&&<p role="alert" className="error">{error}</p>}</form></section>
}