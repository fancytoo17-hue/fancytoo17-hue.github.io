from pathlib import Path
from PIL import Image, ImageChops, ImageStat
import hashlib, math, json

def optimize(root):
    source=root/'assets/poster-fast.webp'
    original=source.read_bytes()
    assert hashlib.sha256(original).hexdigest()=='68604699545c9b0b9b8afdf45353efb87dc818e0671ecfa578b86b4494d227c3'
    target=root/'assets/poster-delivery-q94.webp'
    im=Image.open(source).convert('RGB')
    im.save(target,'WEBP',quality=94,method=6)
    encoded=Image.open(target).convert('RGB')
    assert encoded.size==im.size
    rms=ImageStat.Stat(ImageChops.difference(im,encoded)).rms
    mse=sum(x*x for x in rms)/3
    psnr=10*math.log10(255**2/mse)
    assert psnr>43 and target.stat().st_size<1000000
    for name in ['index.html','enterprise-layout-comparison.html']:
        p=root/name
        before=p.read_text()
        after=before.replace('assets/poster-fast.webp','assets/poster-delivery-q94.webp')
        assert before.count('assets/poster-fast.webp')==2
        p.write_text(after)
    report={'status':'source_supported','original_bytes':len(original),'optimized_bytes':target.stat().st_size,'dimensions':list(im.size),'psnr_db':round(psnr,2),'visual_review':'pending','scope':'Delivery cover encoding only; original cover, videos, layout and interactions retained.'}
    print(json.dumps(report,ensure_ascii=False))
if __name__=='__main__':
    import sys
    optimize(Path(sys.argv[1]))
