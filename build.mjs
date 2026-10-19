import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
const root=fileURLToPath(new URL('.',import.meta.url));
const source=existsSync(join(root,'source','index.html'))?join(root,'source'):root;
const output=join(root,'dist');
rmSync(output,{recursive:true,force:true});mkdirSync(output,{recursive:true});
for(const name of ['index.html','barbearia.html','localizacao.html','contato.html','assets','favicon.ico','favicon-16x16.png','favicon-32x32.png','apple-touch-icon.png','robots.txt','sitemap.xml','llms.txt'])cpSync(join(source,name),join(output,name),{recursive:true});
function count(path){return readdirSync(path,{withFileTypes:true}).reduce((sum,e)=>sum+(e.isDirectory()?count(join(path,e.name)):1),0)}
console.log(`Bravo pronta em dist: ${count(output)} arquivos, sem dependências de produção.`);
