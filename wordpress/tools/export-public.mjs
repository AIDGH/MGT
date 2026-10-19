/** Snapshot only the public content of the existing site. Never writes to that site. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const target=path.join(root,'source');
const base='https://majdglobaltrading.com';
function download(url,file){
  fs.mkdirSync(path.dirname(file),{recursive:true});
  execFileSync('curl',['--fail','--silent','--show-error','--retry','2','--max-time','30',url,'-o',file+'.tmp']);
  fs.renameSync(file+'.tmp',file);
}
function json(url){
  const result=execFileSync('curl',['--fail','--silent','--show-error','--retry','2','--max-time','30',url],{maxBuffer:20*1024*1024});
  return JSON.parse(result);
}
const site=json(base+'/api/public/site'),categories=json(base+'/api/public/categories');
const catalogue=json(base+'/api/public/products?page=1');
for(let page=2;page<=catalogue.pages;page++)catalogue.items.push(...json(`${base}/api/public/products?page=${page}`).items);
if(catalogue.items.length!==catalogue.total)throw new Error('Catalogue changed during export. Retry the snapshot.');
for(const url of new Set([...site.slides.map(slide=>slide.image),...catalogue.items.flatMap(product=>product.images)])){
  const parsed=new URL(url,base);
  if(parsed.origin!==base||parsed.pathname.includes('..'))throw new Error('Only same-origin media are supported.');
  download(parsed.href,path.join(target,'media',parsed.pathname));
}
for(const [name,value] of Object.entries({site,categories,products:catalogue})){
  fs.writeFileSync(path.join(target,name+'.json.tmp'),JSON.stringify(value,null,2));
  fs.renameSync(path.join(target,name+'.json.tmp'),path.join(target,name+'.json'));
}
fs.writeFileSync(path.join(target,'snapshot.json'),JSON.stringify({source:base,exportedAt:new Date().toISOString(),scope:'Published public content only; no admin accounts, drafts, archived items or sessions.',products:catalogue.total,slides:site.slides.length,categories:categories.length},null,2));
console.log(`Saved public content: ${catalogue.total} products, ${site.slides.length} slides, ${categories.length} categories.`);
