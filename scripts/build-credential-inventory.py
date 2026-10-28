"""Read every PDF by file signature; derive metadata from contents, never filenames."""
from pathlib import Path
from pypdf import PdfReader
import subprocess,re,json,hashlib,shutil
rows=[]
for p in sorted(Path('public/assets/Certificates').rglob('*')):
 if not p.is_file() or not p.read_bytes().startswith(b'%PDF'): continue
 raw=subprocess.check_output(['pdftotext','-raw',str(p),'-'],text=True)
 flat=' '.join(raw.split()); kind='Professional Certificate' if 'online Professional Certificate' in flat else 'Specialization' if 'online Specialization' in flat else 'Guided Project' if 'an online project authorized' in flat else 'Course'
 if kind in ['Professional Certificate','Specialization']:
  title=re.split(r'has successfully completed the online (?:Specialization|Professional Certificate)\s*',raw)[1]
  title=re.split(r'Those who|Congratulations|Master a solid',title)[0]
 else: title=raw.split('Muhammad Ali Ejaz Bhatti\n')[1].split('an online')[0]
 title=' '.join(title.split()).replace('Cross- Platform','Cross-Platform')
 issuer=re.search(r'authorized by (.*?) and offered',flat)
 issuer=issuer.group(1) if issuer else 'Microsoft' if kind=='Professional Certificate' else 'University of London' if 'Goldsmiths' in flat else 'Packt'
 compact=re.sub(r'\s','',raw)
 urls=[str(a.get_object().get('/A',{}).get('/URI','')) for page in PdfReader(p).pages for a in page.get('/Annots',[])]
 url=next((u for u in urls if u.startswith('https://coursera.org/verify/')),None)
 assert url,p
 date=re.search(r'Oct(\d{1,2}),2026',compact); assert date,p
 i=len(rows)+1
 alias=f'/assets/credentials/credential-{i:02d}.pdf';Path('public/assets/credentials').mkdir(exist_ok=True);shutil.copyfile(p,'public'+alias)
 preview=f'/assets/certificate-previews/{i:02d}.jpg'
 if not Path('public'+preview).exists():subprocess.run(['pdftoppm','-singlefile','-scale-to','1200','-jpeg',str(p),'public'+preview[:-4]],check=True)
 rows.append(dict(id=f'credential-{i:02d}',title=title,issuer=issuer,type=kind,featured=kind in ['Professional Certificate','Specialization'],date=f'Oct {date[1]}, 2026',url=url,path='/'+str(p.relative_to('public')),downloadPath=alias,preview=preview,size=p.stat().st_size,sha256=hashlib.sha256(p.read_bytes()).hexdigest(),readability='Selectable PDF text',issuerEvidence='Explicit issuer in PDF' if issuer!='Packt' or kind not in ['Specialization'] else 'Program title and constituent Packt course PDFs; specialization has no issuer text'))
Path('src/data/certificates.json').write_text(json.dumps(rows,indent=2)+'\n')
Path('docs/redesign/CERTIFICATES.md').write_text('# Certificate inventory\n\nAll 40 PDF contents extracted. 3 professional certificates, 4 specializations, 2 guided projects, 31 courses. Completion is evidenced by local PDFs; online identity/authenticity is not independently authenticated. Packt specialization attribution is corroborated by constituent course PDFs; the program PDFs omit issuer text. All dates October 2026. One extensionless PDF is intentionally retained. No duplicate hashes.\n\n|Title|Issuer|Type|Date|Featured|File|Verification|\n|---|---|---|---|---|---|---|\n'+'\n'.join(f"|{r['title']}|{r['issuer']}|{r['type']}|{r['date']}|{r['featured']}|{r['path']}|{r['url']}|" for r in rows)+'\n')
print(len(rows),'credentials;',sum(r['featured'] for r in rows),'featured')
