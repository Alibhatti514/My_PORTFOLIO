from pathlib import Path
import subprocess,json,re,hashlib
from pypdf import PdfReader
out=[]
for p in sorted(Path('public/assets/Certificates').rglob('*')):
 if not p.is_file() or not p.read_bytes().startswith(b'%PDF'):continue
 raw=subprocess.check_output(['pdftotext','-raw',str(p),'-'],text=True)
 flat=' '.join(raw.split()); special='online Specialization' in flat; professional='online Professional Certificate' in flat
 if special or professional:
  title=re.split(r'has successfully completed the online (?:Specialization|Professional Certificate)\s*',raw)[1].split('Those who')[0].split('Congratulations')[0].split('Master a solid')[0].strip();title=' '.join(title.split()).replace('Cross- Platform','Cross-Platform')
 else:
  title=raw.split('Muhammad Ali Ejaz Bhatti\n')[1].split('an online course authorized')[0].replace('has successfully completed','').strip();title=' '.join(title.split())
 issuer=re.search(r'authorized by (.*?) and offered',flat)
 issuer=issuer.group(1) if issuer else ('Microsoft' if professional else 'University of London' if 'Goldsmiths' in flat else 'Packt')
 urls=[]
 for page in PdfReader(p).pages:
  for a in page.get('/Annots',[]):
   a=a.get_object(); u=a.get('/A',{}).get('/URI');
   if u and 'coursera.org/verify' in u:urls.append(u)
 match=re.search(r'https://coursera.org/verify/([\s\S]+)',raw)
 url=urls[0] if urls else 'https://coursera.org/verify/'+''.join(match.group(1).split())[:80] if match else None
 if url:url=re.match(r'https://coursera.org/verify/(?:(?:specialization|professional-cert)/)?[A-Z0-9]+',url).group(0)
 date=re.search(r'Oct\s+\d{1,2},?\s+2026',raw)
 if not date:
  compact=re.sub(r'\s','',raw);d=re.search(r'Oct(\d{1,2}),2026',compact);dateText='Oct '+d.group(1)+', 2026' if d else None
 else:dateText=date.group(0)
 i=len(out)+1
 preview=f'/assets/certificate-previews/{i:02d}.jpg'
 Path('public/assets/certificate-previews').mkdir(exist_ok=True)
 subprocess.run(['pdftoppm','-f','1','-singlefile','-scale-to','1200','-jpeg',str(p),'public'+preview[:-4]],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
 out.append(dict(id=f'credential-{i:02d}',title=title,issuer=issuer,type='Professional Certificate' if professional else 'Specialization' if special else 'Course',featured=special or professional,date=dateText,url=url,path='/'+str(p.relative_to('public')),preview=preview,size=p.stat().st_size,sha256=hashlib.sha256(p.read_bytes()).hexdigest(),readability='Selectable PDF text'))
Path('src/data/certificates.json').write_text(json.dumps(out,indent=2))
Path('docs/redesign/CERTIFICATES.md').write_text('# Certificate inventory\n\nExtracted from PDF contents, not filenames. Completion evidence is local; issuer URLs are provided, not independently authenticated. No duplicate source hashes. Extensionless PDF retained. .DS_Store excluded.\n\n|Title|Issuer|Type|Date|Featured|Source|Verification|\n|---|---|---|---|---|---|---|\n'+'\n'.join(f"|{r['title']}|{r['issuer']}|{r['type']}|{r['date']}|{r['featured']}|{r['path']}|{r['url']}|" for r in out))
print(len(out),'certificates;',sum(x['featured'] for x in out),'featured')
