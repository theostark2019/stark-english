import Link from 'next/link';
import {collectionStage,collectionUnits,STARK_ICONS,type StarkCatalogCollection,type StarkCatalogKind} from '@/lib/stark-catalog';

export function StarkCatalogShelf({items,kind}:{items:StarkCatalogCollection[];kind:StarkCatalogKind}){
 if(items.length===0)return <p className="stream-course-empty">Novas coleções estão sendo organizadas.</p>;
 return <div className={'stark-catalog-shelf category-'+kind}>
  {items.map((c,i)=><Link key={c.slug} href={'/courses/stark-english/catalog/'+c.slug}
   className={'stark-collection-card stark-kind-'+kind}>
    <span className="stark-collection-art" aria-hidden="true">
     <span className="stark-collection-icon">{c.slug==='svo'?'S·V·O':c.slug==='dvc'?'DVC':STARK_ICONS[kind]}</span>
     <span className="stark-collection-art-index">{String(i+1).padStart(2,'0')}</span>
    </span>
    <span className="stark-collection-meta">
     <span className="stark-collection-eyebrow">{c.cefr} · {collectionStage(c)}</span>
     <strong>{c.title}</strong>
     <span className="stark-collection-desc">{c.description}</span>
     <span className="stark-collection-structure">{collectionUnits(c)}</span>
    </span>
    <span className="stark-collection-arrow" aria-hidden="true">↗</span>
   </Link>)}
 </div>;
}
