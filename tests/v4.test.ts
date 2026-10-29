import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {skills} from '../src/data/skills.ts';
test('V4 preserves the approved portrait pose source byte for byte',()=>{
 assert.equal(readFileSync('src/scene/journey.ts','utf8'),readFileSync('docs/cinematic-v4/backup/journey.ts','utf8'));
});
test('V4 inventories retain all required technologies in their technical categories',()=>{
 const expected:Record<string,string[]>= {Languages:['JavaScript (ES6+)','TypeScript','Python','C#'],Frontend:['HTML5','CSS3','React.js','Next.js','Svelte 5','SvelteKit','Blazor'],Backend:['Node.js','NestJS','Express.js','ASP.NET Core','.NET 8','REST APIs','JWT Authentication'],Data:['PostgreSQL','Prisma ORM','Supabase'],Tools:['Git','GitHub','Postman','Sanity CMS','Stripe Integration']};
 assert.equal(new Set(skills.map(s=>s.name)).size,skills.length);
 for(const [category,names] of Object.entries(expected))assert.deepEqual(skills.filter(s=>s.category===category).map(s=>s.name).sort(),names.sort());
});
