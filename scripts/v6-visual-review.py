"""Build readable QA contact sheets and measure local boundary image changes."""
from PIL import Image, ImageDraw, ImageStat, ImageChops
from pathlib import Path
import json
root=Path('docs/ultimate-4d-v6/qa')
rows=[]
for before in sorted(root.glob('boundary-*-before.png')):
    at=Image.open(str(before).replace('-before.png','-at.png')).convert('RGB')
    first=Image.open(before).convert('RGB')
    last=Image.open(str(before).replace('-before.png','-after.png')).convert('RGB')
    delta=ImageStat.Stat(ImageChops.difference(first,last)).mean
    width,height=first.size
    # An exposed paper edge avoids moving foreground text and certificate sheets.
    crop=(0,int(height*.4),max(4,int(width*.012)),int(height*.6))
    edge=ImageStat.Stat(ImageChops.difference(first.crop(crop),last.crop(crop))).mean
    rows.append({'boundary':before.name.replace('-before.png',''), 'meanRGBDifference':sum(delta)/3,
      'edgeMeanRGBDifference':sum(edge)/3})
    assert sum(edge)/3<10, f'Potential background discontinuity: {before.name}, {edge}'
    frames=[first,at,last]
    thumbwidth=480 if width>760 else 260
    thumbheight=round(height*thumbwidth/width)
    sheet=Image.new('RGB',(thumbwidth*3,thumbheight+30),'#f7f0e6')
    draw=ImageDraw.Draw(sheet)
    for index,(label,frame) in enumerate(zip(['Before','At','After'],frames)):
        sheet.paste(frame.resize((thumbwidth,thumbheight)),(index*thumbwidth,30))
        draw.text((index*thumbwidth+8,8),label,fill='#581c32')
    sheet.save(root/(before.name.replace('-before.png','-comparison.jpg')),quality=88)
for w,h in [(1920,1080),(1440,900),(1366,768),(1024,768),(768,1024),(390,844),(375,667)]:
    tw=360 if w>760 else 260
    th=round(h*tw/w)
    sheet=Image.new('RGB',(tw*4,(th+30)*2),'#f7f0e6')
    draw=ImageDraw.Draw(sheet)
    for i in range(8):
        path=root/f'{w}-{h}-{i}.png'
        if not path.exists(): continue
        im=Image.open(path).convert('RGB').resize((tw,th))
        x=(i%4)*tw;y=(i//4)*(th+30)
        sheet.paste(im,(x,y+30));draw.text((x+8,y+8),f'{w} x {h} / progress {i}',fill='#581c32')
    sheet.save(root/f'contact-{w}.jpg',quality=90)
(root/'visual-diff-report.json').write_text(json.dumps(rows,indent=2))
print(f'{len(rows)} boundary comparisons: no exposed-background discontinuity above 10/255 RGB.')
for width in [1440,390]:
    comparisons=[Image.open(root/f'boundary-{width}-{n}-comparison.jpg').convert('RGB') for n in [.5,1.5,2.5,3.5,4.5,5.5,6.5]]
    rowheight=comparisons[0].height
    journey=Image.new('RGB',(comparisons[0].width,rowheight*len(comparisons)),'#f7f0e6')
    for index,im in enumerate(comparisons):journey.paste(im,(0,index*rowheight))
    journey.save(root/f'transition-review-{width}.jpg',quality=90)
