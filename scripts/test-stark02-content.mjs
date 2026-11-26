import fs from 'node:fs';
import ts from 'typescript';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const checklist=JSON.parse(fs.readFileSync('src/data/agro02-checklist.json','utf8'));
const compile=path=>{
 const source=fs.readFileSync(path,'utf8');
 const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const context={exports:{},Intl,Date};vm.runInNewContext(js,context);return context.exports;
};
const {AGRO02_CONTENT:content}=compile('src/lib/agro02-content.ts');
const {monthlyTuition}=compile('src/lib/stark02.ts');
assert.equal(checklist.length,96);assert.equal(new Set(checklist.map(e=>e.code)).size,96);
for(const level of ['A1','A2','B1','B2']){
 const rows=checklist.filter(e=>e.level===level);assert.equal(rows.length,24);assert.equal(content[level].length,24);
 for(const row of rows){
  assert.ok(row.task&&row.evidence&&row.resources&&row.modality);
  const [model,words,translation,answer]=content[level][row.episode-1];
  assert.ok(model.length>=60,row.code+' model too short');
  const glossary=words.split('|').map(w=>w.split('='));
  assert.ok(glossary.length>=4&&glossary.every(w=>w.length===2&&w[0]&&w[1]),row.code+' missing glossary');
  assert.ok(translation.length>15&&answer.length>15,row.code+' translation missing');
 }
}
assert.equal(monthlyTuition([{price_cents:5000,times_per_week:1}]),20000,'one 30-minute meeting at R$50/week = R$200/month');
assert.equal(monthlyTuition([{price_cents:9000,times_per_week:2}]),72000,'two R$90 meetings/week = R$720/month');
assert.equal(monthlyTuition([{price_cents:5000,times_per_week:1},{price_cents:9000,times_per_week:2}]),92000,'mixed 30/60-minute arrangements');
assert.equal(monthlyTuition([{price_cents:0,times_per_week:1}]),0,'zero-price agreed meeting');
assert.equal(monthlyTuition([{price_cents:12345,times_per_week:3}]),148140,'cent precision');
console.log('PASS: 96 exact checklist entries, 96 models/glossaries/translations, four 24-episode series, and five tuition calculations.');
