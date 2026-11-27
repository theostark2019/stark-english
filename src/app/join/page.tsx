'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {browserClient} from '@/lib/supabase/browser';
export default function Join(){
 const [token,setToken]=useState('');
 const [logged,setLogged]=useState(false);
 const [mode,setMode]=useState<'create'|'login'>('create');
 const [name,setName]=useState(''),[email,setEmail]=useState(''),[password,setPassword]=useState('');
 const [busy,setBusy]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState(false);
 const [outcome,setOutcome]=useState<'none'|'pending_approval'|'enrolled'>('none');
 useEffect(()=>{
  const t=new URLSearchParams(location.hash.substring(1)).get('invite')||'';
  setToken(/^[a-f0-9]{64}$/.test(t)?t:'');
  let active=true;
  browserClient().auth.getUser().then(({data:{user}})=>{
   if(active&&user){setLogged(true);setEmail(user.email||'');}
  });
  return()=>{active=false;};
 },[]);
 async function accept(){
  if(!token||busy)return;
  setBusy(true);setMessage('');
  const {data,error:e}=await browserClient().rpc('student_claim_registration_invite',{p_token:token});
  setBusy(false);
  if(e){setError(true);setMessage(e.message);return;}
  setError(false);
  setOutcome(data.status==='enrolled'?'enrolled':'pending_approval');
  setMessage(data.status==='enrolled'?'Sua conta foi vinculada ao curso e ao professor.':
   'Cadastro recebido. Aguarde a confirmação de identidade pela escola.');
 }
 async function submit(e:React.FormEvent){
  e.preventDefault();if(busy)return;
  setBusy(true);setMessage('');
  const sb=browserClient();
  if(mode==='create'){
   const r=await sb.auth.signUp({email:email.trim(),password,
     options:{data:{full_name:name.trim()},emailRedirectTo:location.origin+'/auth/callback'}});
   setError(Boolean(r.error));
   setMessage(r.error?r.error.message:r.data.session?
     'Conta criada. Confirme o e-mail e aceite o convite.':
     'Verifique seu e-mail para confirmar a conta. Depois, abra novamente este link pessoal para concluir.');
   if(r.data.session)setLogged(true);
  }else{
   const r=await sb.auth.signInWithPassword({email:email.trim(),password});
   setError(Boolean(r.error));setMessage(r.error?r.error.message:'Login efetuado. Agora aceite seu convite.');
   if(r.data.user)setLogged(true);
  }
  setBusy(false);
 }
 return <div className="personal-invite-page">
  <div className="personal-invite-head"><Link href="/courses">✦ STARK LEARNING</Link>
   <small>YOUR PERSONAL LEARNING JOURNEY</small></div>
  <section className="personal-invite-card">
   <p className="personal-invite-eyebrow">CONVITE INDIVIDUAL</p>
   <h1>Welcome to Stark Learning.</h1>
   <p>Crie seu acesso para estudar com seu professor e acompanhar seus objetivos, tarefas e atividades.</p>
   {!token?<div className="student-invite-invalid"><strong>Link pessoal ausente ou inválido.</strong>
     <p>Peça à Stark English um convite individual. Não é possível vincular uma ficha apenas pelo nome.</p>
   </div>:outcome==='enrolled'?<div className="personal-invite-success"><h2>✓ Conta vinculada</h2>
      <p>Seu curso e seu professor já estão disponíveis.</p><Link href="/dashboard">Abrir meu curso →</Link>
    </div>:outcome==='pending_approval'?<div className="personal-invite-success"><h2>✓ Cadastro recebido</h2>
      <p>Seu professor confirmará sua identidade antes de liberar as atividades.</p>
      <Link href="/courses">Conhecer os quatro portais →</Link>
    </div>:logged?<div className="personal-invite-form">
      <h2>Aceite seu convite</h2><p>Você está conectado como <strong>{email}</strong>.</p>
      <button type="button" className="personal-invite-primary" onClick={()=>void accept()} disabled={busy}>
       {busy?'Validando…':'Aceitar convite →'}</button>
      <p className="personal-invite-small">Seu e-mail precisa estar confirmado. Quando necessário, seu professor aprovará o vínculo.</p>
    </div>:<div className="personal-invite-form">
      <div className="personal-invite-tabs"><button type="button" className={mode==='create'?'selected':''} onClick={()=>setMode('create')}>Criar conta</button>
       <button type="button" className={mode==='login'?'selected':''} onClick={()=>setMode('login')}>Já tenho conta</button></div>
      <form onSubmit={e=>void submit(e)}>
       {mode==='create'&&<label>Seu nome completo<input value={name} required minLength={2} maxLength={150} autoComplete="name"
         onChange={e=>setName(e.target.value)}/></label>}
       <label>E-mail<input type="email" value={email} required autoComplete="email" onChange={e=>setEmail(e.target.value)}/></label>
       <label>Senha<input type="password" value={password} required minLength={8}
        autoComplete={mode==='create'?'new-password':'current-password'} onChange={e=>setPassword(e.target.value)}/></label>
       <button disabled={busy} className="personal-invite-primary">{busy?'Aguarde…':mode==='create'?'Criar minha conta →':'Entrar →'}</button>
      </form>
      <p className="personal-invite-small">Após confirmar o e-mail, reabra o mesmo link pessoal para concluir sua inscrição.</p>
    </div>}
   {message&&<p className={'personal-invite-message'+(error?' error':'')} role="status">{message}</p>}
  </section>
  <footer className="personal-invite-foot"><Link href="/courses">Conhecer os cursos</Link>
   <span>Stark English · AgroEnglish · Business English · Med-English</span></footer>
 </div>;
}
