"""Check final PDF text, embedded verification links, pages and font embedding."""
from pathlib import Path
from pypdf import PdfReader
import json,subprocess
rows=json.loads(Path('src/data/certificates.json').read_text());results=[]
for mode in ['Premium','ATS']:
 path=Path('output/pdf')/f'Resume-{mode}.pdf';reader=PdfReader(path)
 assert len(reader.pages)==2
 text=' '.join(p.extract_text() for p in reader.pages);flat=' '.join(text.split())
 for fact in ['MUHAMMAD','ALI EJAZ','JavaScript','TypeScript','Python','Punjab University','Hawk College','PostgreSQL','Prisma','Upwork','Fiverr']:assert fact in flat,(mode,fact)
 links=[str(a.get_object().get('/A',{}).get('/URI','')) for p in reader.pages for a in p.get('/Annots',[])]
 for c in rows:
  if c['featured']:assert c['title'] in flat and c['url'] in links,(mode,c['id'])
 assert len(links)>=12 and '\ufffd' not in flat
 assert 'completed study' not in flat.lower()
 for fact in ['C#','Svelte 5','SvelteKit','Blazor','Express.js','ASP.NET Core','.NET 8','Supabase','Sanity CMS','Stripe Integration','JWT Authentication']:assert fact in flat,(mode,fact)
 priority=['University of London','Microsoft','Duke University','Packt']
 ordered=sorted([c for c in rows if c['featured']],key=lambda c:priority.index(c['issuer']))
 credential_links=list(dict.fromkeys(u for u in links if u in {c['url'] for c in ordered}))
 assert credential_links==[c['url'] for c in ordered],(mode,'institution ordering')
 fonts=subprocess.check_output(['pdffonts',str(path)],text=True)
 assert all('yes' in line for line in fonts.splitlines()[2:] if line.strip())
 assert path.read_bytes()==Path('public/assets/resume',path.name).read_bytes()
 if mode=='ATS':assert 'Freelance Full Stack Web Developer' in flat
 Path(f'docs/architectural-v7/pdf-preview/{mode}-text.txt').write_text(text)
 results.append(dict(mode=mode,pages=2,hyperlinks=len(links),selectableCharacters=len(text),fonts=fonts))
Path('docs/architectural-v7/pdf-preview/validation.json').write_text(json.dumps(results,indent=2))
print('Both two-page PDFs: selectable text, embedded fonts, nine linked credentials, matching public downloads.')
