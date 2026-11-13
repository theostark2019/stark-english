import Link from 'next/link';
import {CourseChooseButton} from '@/components/CourseExplorer';
import {PORTALS,type CoursePreview,type CourseStatus,type PortalSlug} from '@/lib/course-portals';
import type {StreamLearning} from '@/lib/course-stream-data';

const categories=[
 {id:'inicio',icon:'⌂',label:'Início'},
 {id:'series',icon:'▣',label:'Séries'},
 {id:'filmes',icon:'▤',label:'Filmes'},
 {id:'shorts',icon:'▷',label:'Shorts'},
 {id:'entrevistas',icon:'♙',label:'Entrevistas'}
];
const levels=['A1','A2','B1','B2','C+'];
const fnum=(v:number)=>new Intl.NumberFormat('pt-BR',{maximumFractionDigits:1}).format(v);
function statusLabel(v:string){
 if(v==='revision_requested')return 'Revisão solicitada';
 if(v==='submitted'||v==='claimed')return 'Aguardando feedback';
 if(v==='draft')return 'Continuar atividade';
 if(v==='finalized')return 'Concluída';
 return 'Pronta para começar';
}
function Cover({slug,variant=0,mini=false}:{slug:PortalSlug;variant?:number;mini?:boolean}){
 return <span className={'stream-art art-'+slug+' art-variant-'+(variant%4)+(mini?' art-mini':'')} aria-hidden="true">
  <svg viewBox="0 0 180 120" className="stream-art-svg" focusable="false">
   {slug==='med-english'?<>
    <path d="M36 19 Q18 20 19 40 L19 63 Q19 87 51 88 Q83 88 83 63 L83 29" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" opacity=".7"/>
    <circle cx="84" cy="25" r="10" fill="none" stroke="currentColor" strokeWidth="4"/>
    <circle cx="41" cy="20" r="7" fill="currentColor"/>
    <path d="M52 88 Q52 108 92 101 Q119 96 119 76" stroke="currentColor" strokeWidth="5" fill="none"/>
    <circle cx="121" cy="70" r="15" fill="currentColor" opacity=".5"/>
    <path d="M109 70 H132 M121 58 V82" stroke="#e4ffff" strokeWidth="4" strokeLinecap="round"/>
    <path d="M32 52 H47 L54 43 L62 62 L70 51 H90" stroke="#e4ffff" strokeWidth="2" opacity=".8" fill="none"/>
   </>:slug==='agroenglish'?<>
    <circle cx="133" cy="32" r="21" fill="currentColor" opacity=".25"/>
    <path d="M0 88 Q35 56 83 82 Q130 56 180 70 V120 H0Z" fill="currentColor" opacity=".22"/>
    <path d="M0 103 Q50 75 95 100 Q130 83 180 92 V120 H0Z" fill="currentColor" opacity=".29"/>
    <path d="M71 105 V38 M71 65 Q46 37 35 49 Q39 68 71 70 M71 54 Q92 31 113 43 Q101 62 71 65" fill="none" stroke="#ebffd6" strokeWidth="4" strokeLinecap="round"/>
   </>:slug==='business-english'?<>
    <rect x="25" y="54" width="41" height="61" rx="2" fill="currentColor" opacity=".3"/>
    <rect x="67" y="19" width="44" height="96" rx="2" fill="currentColor" opacity=".47"/>
    <rect x="113" y="45" width="43" height="70" rx="2" fill="currentColor" opacity=".3"/>
    {[34,47,80,95,126,143].map((x,i)=><g key={x}>
     <rect x={x} y={i===2||i===3?35:65} width="7" height="7" rx="1" fill="#fff0bf" opacity=".8"/>
     <rect x={x} y={i===2||i===3?53:83} width="7" height="7" rx="1" fill="#fff0bf" opacity=".55"/>
    </g>)}
    <path d="M28 36 L52 22 L78 31 L102 8 L132 21" fill="none" stroke="#fff0b7" strokeWidth="3"/>
   </>:<>
    <circle cx="90" cy="59" r="40" stroke="currentColor" strokeWidth="4" fill="currentColor" fillOpacity=".15"/>
    <path d="M50 59 H130 M90 19 Q52 57 90 99 M90 19 Q128 57 90 99 M60 34 Q90 50 120 34 M60 83 Q90 67 120 83" stroke="#ffe3d3" strokeWidth="2" fill="none" opacity=".9"/>
    <path d="M129 14 Q155 17 155 39 L143 53 L128 44" fill="currentColor" opacity=".55"/>
   </>}
  </svg>
  <span className="stream-art-symbol">{PORTALS[slug].icon}</span>
 </span>;
}
type Props={slug:PortalSlug;course:CoursePreview;status:CourseStatus;learning:StreamLearning|null;query:string};
export function StreamingCourseDashboard({slug,course,status,learning,query}:Props){
 const d=PORTALS[slug],enrolled=Boolean(learning?.enrolled);
 const assigned=learning?.assignments||[],completed=learning?.finished||[];
 const currentSeries=course.series||[];
 const filteredSeries=(currentSeries.length?currentSeries.map((s,i)=>({
  title:s.name,description:s.published
   ?s.published+' publicado(s) · '+s.count+' episódios'
   :s.count+' episódios em preparação',
  seriesId:learning?.seriesIds[s.name]||null,level:s.levels.join(' · ')||'CEFR',
  published:s.published,count:s.count,index:i,planned:false
 })):d.paths.map((x,i)=>({title:x.title,description:x.description,
  seriesId:null,level:'CEFR',published:0,count:0,index:i,planned:true
 }))).filter(s=>!query||[s.title,s.description,s.level].join(' ').toLowerCase().includes(query.toLowerCase()));
 const suggestions=(enrolled&&assigned.length?assigned.slice(0,3).map(x=>({
  label:x.series,title:x.title,sub:x.level+' · '+statusLabel(x.status),href:'/lessons/'+x.id
 })):course.publishedEpisodes?.length?course.publishedEpisodes.slice(0,3).map(x=>({
  label:x.level+' · Publicado',title:x.title,sub:'Disponível após atribuição',href:'#series'
 })):d.paths.slice(0,3).map(x=>({
  label:'Série proposta',title:x.title,sub:'Conteúdo em desenvolvimento',href:'#series'
 }))).filter(x=>!query||[x.label,x.title,x.sub].join(' ').toLowerCase().includes(query.toLowerCase()));
 const stats=[
  {icon:'◷',title:'Horas investidas',value:enrolled?fnum(learning?.hours||0)+' h':'—',
   hint:enrolled?'Créditos confirmados':'Entre para ver seus créditos',graph:'⌁'},
  {icon:'▱',title:'Conteúdo adquirido',value:enrolled?String(learning?.completed||0):'—',
   hint:enrolled?(learning?.assigned||0)+' aulas atribuídas':'Aulas finalizadas pelo professor',graph:'▤'},
  {icon:'◎',title:'Eficiência',value:enrolled&&learning?.completionRate!==null?String(learning?.completionRate)+'%':'—',
   hint:'Finalizadas / atribuídas',graph:'◔'},
  {icon:'↗',title:'Eficácia',value:enrolled&&learning?.effectiveness!==null?String(learning?.effectiveness)+'%':'—',
   hint:learning?.reviewCount?'Média de rubricas avaliadas':'Aguardando avaliação',graph:'▥'}
 ];
 const extra=[
  {id:'filmes',title:'Filmes',desc:'Aulões e experiências longas',paths:[d.paths[1],d.paths[0]]},
  {id:'shorts',title:'Shorts',desc:'Dicas e curadoria rápida',paths:[d.paths[2],d.paths[1]]},
  {id:'entrevistas',title:'Entrevistas',desc:'Conversas e experiências',paths:[d.paths[3],d.paths[2]]}
 ];
 return <div className={'stream-course-shell theme-'+slug} id="inicio"><div className="stream-course-width">
  <header className="stream-course-header">
   <Link href="/courses" className="stream-course-brand" aria-label="Escolher curso">
    <span className="stream-course-logo">{d.icon}</span><span><strong>{course.title}</strong><small>{d.subtitle}</small></span>
   </Link>
   <nav className="stream-course-nav" aria-label="Seções do curso">
    {categories.map((x,i)=><a key={x.id} href={'#'+x.id} className={i===0?'selected':''}>
     <span aria-hidden="true">{x.icon}</span>{x.label}</a>)}
   </nav>
   <div className="stream-course-header-tools">
    <form action={'/courses/'+slug} className="stream-course-search" role="search">
     <span aria-hidden="true">⌕</span><input type="search" name="q" placeholder="Buscar conteúdo..." aria-label="Buscar conteúdo" defaultValue={query}/>
     <button type="submit" aria-label="Buscar">↵</button>
    </form>
    <Link href="/courses" className="stream-course-switch">4 cursos ↗</Link>
    <Link href={enrolled?'/dashboard':'/login'} className="stream-course-avatar" aria-label="Meu perfil">
     {enrolled&&learning?.studentFirstName?learning.studentFirstName.slice(0,2).toUpperCase():'✦'}</Link>
   </div>
  </header>
  <section className="stream-course-kpis" aria-label="Indicadores de aprendizagem">
   {stats.map((s,i)=><div className="stream-course-kpi" key={s.title}>
    <span className="stream-course-kpi-icon" aria-hidden="true">{s.icon}</span>
    <div className="stream-course-kpi-body"><h2>{s.title}</h2><strong>{s.value}</strong><p>{s.hint}</p></div>
    <span className={'stream-course-stat-glyph stat-'+i} aria-hidden="true">{s.graph}</span>
   </div>)}
  </section>
  <div className="stream-course-grid">
   <aside className="stream-course-suggestions">
    <section className="stream-course-panel">
     <div className="stream-course-panel-heading"><h2><span className="stream-course-heading-icon">✦</span> Sugestões para você</h2></div>
     {suggestions.length?suggestions.map((s,i)=><Link href={s.href} key={s.label+s.title} className="stream-course-suggestion">
      <Cover slug={slug} variant={i}/><span className="stream-course-suggestion-text">
       <small>{s.label}</small><strong>{s.title}</strong><em>{s.sub}</em></span><span className="stream-course-tiny-play">▶</span></Link>):
      <p className="stream-course-empty">Nenhum conteúdo corresponde à busca.</p>}
     <div className="stream-course-side-note">✧ {enrolled?'Continue suas atividades para receber feedback do professor.':'Explore as séries. As atividades dependem de matrícula e atribuição.'}</div>
    </section>
   </aside>
   <div className="stream-course-center">
    <section className="stream-course-panel" id="continuar">
     <div className="stream-course-panel-heading"><h2><span className="stream-course-heading-icon">▷</span> Continue aprendendo</h2>
      <a href="#series">Ver séries ↗</a></div>
     {enrolled&&assigned.length?<div className="stream-course-continue-cards">
      {assigned.slice(0,3).map((x,i)=><Link href={'/lessons/'+x.id} key={x.id} className="stream-course-episode">
       <Cover slug={slug} variant={i} mini/><span className="stream-course-episode-copy">
        <small>Série · {x.level}</small><strong>{x.title}</strong><em>{statusLabel(x.status)}</em>
       </span><span className="stream-course-tiny-play">▶</span></Link>)}
     </div>:<div className="stream-course-empty stream-course-continue-empty"><span className="stream-course-empty-icon">◌</span>
      <div><strong>{enrolled?completed.length?'Aulas atribuídas concluídas':'Sua próxima aula aparecerá aqui':'Seu espaço de aprendizagem'}</strong>
       <p>{enrolled?'As aulas liberadas pelo professor aparecem aqui.':'Após matrícula e atribuição, você poderá continuar suas atividades neste painel.'}</p></div>
      {!enrolled&&<a href="#escolher-curso">Escolher curso ↗</a>}</div>}
    </section>
    <section className="stream-course-panel stream-course-library" id="series">
     <div className="stream-course-panel-heading"><h2><span className="stream-course-heading-icon">▣</span> Séries</h2>
      <span className="stream-course-label">{currentSeries.length?currentSeries.length+' módulos no catálogo':'Séries em planejamento'}</span></div>
     <div className="stream-course-series-grid">
      {filteredSeries.length?filteredSeries.map((s,i)=>{
       const content=<><Cover slug={slug} variant={i}/><span className="stream-course-series-info">
        <small>{s.planned?'PROPOSTA DE SÉRIE':s.level+' · SÉRIE '+String(i+1).padStart(2,'0')}</small>
        <strong>{s.title}</strong><em>{s.description}</em>
        {!s.planned&&<span className="stream-course-progress-track"><i style={{width:(s.count?s.published/s.count*100:0)+'%'}}/></span>}
       </span><span className="stream-course-tiny-play">{s.seriesId?'▶':'◌'}</span></>;
       return s.seriesId?<Link key={s.title} href={'/series/'+s.seriesId} className="stream-course-series-card">{content}</Link>:
        <article key={s.title} className="stream-course-series-card placeholder">{content}</article>;
      }):<p className="stream-course-empty">Nenhuma série encontrada.</p>}
     </div>
    </section>
    {extra.map((x,k)=><section className="stream-course-panel stream-course-category" id={x.id} key={x.id}>
     <div className="stream-course-panel-heading"><h2><span className="stream-course-heading-icon">{x.id==='filmes'?'▤':x.id==='shorts'?'▷':'♙'}</span> {x.title}</h2>
      <span className="stream-course-label">Em desenvolvimento</span></div>
     <div className="stream-course-category-grid">
      {x.paths.map((v,i)=><article className="stream-course-category-card" key={v.title}>
       <Cover slug={slug} variant={k+i+1}/><span className="stream-course-category-info">
        <strong>{v.title}</strong><small>{x.desc} · Conceito</small></span>
       <span className="stream-course-mini-lock">Em breve</span>
      </article>)}
     </div>
    </section>)}
   </div>
   <aside className="stream-course-right">
    <section className="stream-course-panel" id="concluidas">
     <div className="stream-course-panel-heading"><h2><span className="stream-course-heading-icon">✓</span> Aulas concluídas</h2></div>
     {enrolled&&completed.length?completed.slice(0,5).map(x=><Link href={'/lessons/'+x.id} key={x.id} className="stream-course-completed">
      <span className="stream-course-check">✓</span><strong>{x.title}</strong><small>{x.level}</small></Link>):
      <p className="stream-course-empty">{enrolled?'Aulas finalizadas pelo professor aparecem aqui.':'Entre para acompanhar suas aulas concluídas.'}</p>}
    </section>
    <section className="stream-course-panel stream-course-cefr">
     <div className="stream-course-panel-heading"><h2><span className="stream-course-heading-icon">▥</span> Expectativa CEFR</h2></div>
     <div className="stream-course-cefr-inner"><small>CEFR confirmado pelo professor</small>
      <h3>Aguardando avaliação</h3>
      <div className="stream-course-cefr-track">{levels.map(l=><div key={l}><span>○</span><small>{l}</small></div>)}</div>
      <div className="stream-course-next"><span>◎</span><div><strong>Próximo objetivo</strong>
       <p>{learning?.nextGoal||'Conclua as atividades atribuídas para receber feedback e definir sua próxima meta.'}</p></div></div>
     </div>
    </section>
    <div id="escolher-curso" className="stream-course-choose">
     {enrolled?<section className="stream-course-panel stream-course-my-path">
      <p>✓ SEU CURSO</p><strong>{course.title}</strong>
      <span>{learning?.assigned||0} aulas atribuídas · {completed.length} finalizadas</span>
      <Link href="/courses">Conheça os outros cursos ↗</Link></section>:
      <CourseChooseButton course={course} status={status}/>}
    </div>
   </aside>
  </div>
  <footer className="stream-course-footer">Stark Learning · O contexto aponta o caminho <Link href="/courses">Explorar os quatro portais ↗</Link></footer>
 </div></div>;
}
