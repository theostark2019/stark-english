'use client';
import {useState} from 'react';
import {browserClient} from '@/lib/supabase/browser';
import {AGRO_MEDIA_BUCKET,AGRO_MEDIA_EPISODE,AGRO_MEDIA_LABELS,AGRO_MEDIA_SLOTS,type AgroMediaSlot} from '@/lib/agro-media';

type Row={slot:AgroMediaSlot;storage_path:string;mime_type:string;byte_size:number};
type PackItem={slot:AgroMediaSlot;filename:string;mime:string;base64:string};
type Pack={format:string;version:number;assets:PackItem[]};
const maxBytes=8*1024*1024;
const mimeTypes=['image/jpeg','image/png','image/webp','audio/mpeg'];
const extensions:Record<string,string>={'image/jpeg':'jpg','image/png':'png','image/webp':'webp','audio/mpeg':'mp3'};
function safeFilename(slot:AgroMediaSlot){return slot.replace(/[^a-z0-9-]/g,'')}
function decodeBase64(data:string){
 const binary=atob(data);const bytes=new Uint8Array(binary.length);
 for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
 return bytes;
}
export function AgroMediaManager({initial}:{initial:Row[]}){
 const [rows,setRows]=useState<Row[]>(initial);
 const [uploading,setUploading]=useState(false);
 const [progress,setProgress]=useState('');
 const [notice,setNotice]=useState(''),[error,setError]=useState('');
 const [files,setFiles]=useState<Partial<Record<AgroMediaSlot,File>>>({});
 const active=new Map(rows.map(r=>[r.slot,r]));
 async function send(slot:AgroMediaSlot,file:File){
  if(!mimeTypes.includes(file.type))throw new Error('Unsupported file type for '+slot+': '+file.type);
  if((slot.endsWith('audio')&&!file.type.startsWith('audio/'))||
     (!slot.endsWith('audio')&&!file.type.startsWith('image/')))
   throw new Error('Incorrect media kind for slot '+slot);
  if(file.size<1||file.size>maxBytes)throw new Error(slot+' exceeds the 8 MB size limit');
  const sb=browserClient();
  const path='agriculture101/'+safeFilename(slot)+'-'+crypto.randomUUID()+'.'+extensions[file.type];
  const {error:uploadError}=await sb.storage.from(AGRO_MEDIA_BUCKET)
   .upload(path,file,{contentType:file.type,cacheControl:'3600',upsert:false});
  if(uploadError)throw uploadError;
  const {data:{user}}=await sb.auth.getUser();
  if(!user)throw new Error('Session expired; sign in again');
  const payload={episode_code:AGRO_MEDIA_EPISODE,slot,storage_path:path,mime_type:file.type,
   byte_size:file.size,uploaded_by:user.id,updated_at:new Date().toISOString()};
  const {error:recordError}=await sb.from('agro_course_media').upsert(payload,{onConflict:'episode_code,slot'});
  if(recordError){await sb.storage.from(AGRO_MEDIA_BUCKET).remove([path]);throw recordError;}
  setRows(old=>[...old.filter(x=>x.slot!==slot),{slot,storage_path:path,mime_type:file.type,byte_size:file.size}]);
 }
 async function uploadSelected(){
  const entries=Object.entries(files) as [AgroMediaSlot,File][];
  if(!entries.length)return;
  setUploading(true);setError('');setNotice('');
  try{
   for(let i=0;i<entries.length;i++){
    setProgress('Uploading '+AGRO_MEDIA_LABELS[entries[i][0]]+' ('+(i+1)+'/'+entries.length+')…');
    await send(entries[i][0],entries[i][1]);
   }
   setNotice('All selected media have been published. Refresh the AgroEnglish pages to see the images and audio.');
   setFiles({});
  }catch(e){setError(e instanceof Error?e.message:String(e))}
  finally{setUploading(false);setProgress('');}
 }
 async function importPack(file:File){
  setUploading(true);setError('');setNotice('');
  try{
   const pack=JSON.parse(await file.text()) as Pack;
   if(pack.format!=='stark-agro-media-v1'||pack.version!==1||!Array.isArray(pack.assets))
    throw new Error('This is not a valid AgroEnglish media pack');
   for(let i=0;i<pack.assets.length;i++){
    const a=pack.assets[i];
    if(!AGRO_MEDIA_SLOTS.includes(a.slot))throw new Error('Unknown media slot: '+a.slot);
    const bytes=decodeBase64(a.base64);
    const blob=new Blob([bytes],{type:a.mime});
    const fileToSend=new File([blob],a.filename,{type:a.mime});
    setProgress('Publishing '+AGRO_MEDIA_LABELS[a.slot]+' ('+(i+1)+'/'+pack.assets.length+')…');
    await send(a.slot,fileToSend);
   }
   setNotice('The complete media pack was published. Agriculture 101 now uses your illustrations and recordings.');
  }catch(e){setError(e instanceof Error?e.message:String(e))}
  finally{setUploading(false);setProgress('');}
 }
 return <div className="agrs-manager">
  <p>Publish the images and A1/A2 MP3 recordings for <strong>Agriculture 101 only</strong>.
  These teaching assets appear to students, but their uploaded assignments remain private.</p>
  <section className="agrs-manager-pack">
   <h2>Import the complete lesson media pack</h2>
   <p>Use the prepared <code>agroenglish_agriculture101_media.json</code> pack to publish all nine media slots in one upload.</p>
   <label className="agrs-manager-file"><span>Choose media pack (.json)</span>
    <input type="file" accept=".json,application/json" disabled={uploading}
     onChange={e=>{const f=e.target.files?.[0];if(f)void importPack(f);e.target.value='';}}/></label>
  </section>
  <section className="agrs-manager-individual">
   <h2>Or upload individual images / audio</h2>
   <div className="agrs-manager-slots">{AGRO_MEDIA_SLOTS.map(slot=>{
    const current=active.get(slot),file=files[slot];
    return <label key={slot} className="agrs-manager-slot">
     <strong>{AGRO_MEDIA_LABELS[slot]}</strong>
     <span>{current?'✓ Published ('+Math.ceil(current.byte_size/1024)+' KB)':'Not uploaded yet'}</span>
     <input type="file" accept={slot.endsWith('audio')?'audio/mpeg,.mp3':'image/png,image/jpeg,image/webp'}
      disabled={uploading} onChange={e=>{
       const f=e.target.files?.[0];setFiles(old=>({...old,[slot]:f}));
      }}/>
     <small>{file?.name||'Select a file to replace this slot'}</small>
    </label>;
   })}</div>
   <button disabled={uploading||!Object.values(files).filter(Boolean).length} onClick={()=>void uploadSelected()}>
    {uploading?'Publishing…':'Publish selected files'}</button>
  </section>
  {progress&&<p className="agrs-manager-progress" role="status">{progress}</p>}
  {error&&<p role="alert" className="agrs-manager-error">{error}</p>}
  {notice&&<p role="status" className="agrs-manager-success">{notice}</p>}
 </div>;
}
