(() => {
 const image = document.querySelector('.enterprise-article-foreground');
 const reference = document.querySelector('.writing-reference');
 if (!image || !reference) return;
 const frame = document.createElement('div');
 frame.className = image.className; frame.style.cssText = image.style.cssText;
 frame.setAttribute('role','img');
 image.replaceWith(frame);
 const ns = 'http://www.w3.org/2000/svg';
 const svg = document.createElementNS(ns,'svg');
 svg.setAttribute('preserveAspectRatio','xMidYMid meet');
 svg.style.cssText='display:block;width:100%;height:100%;overflow:hidden';
 const defs=document.createElementNS(ns,'defs');
 const clip=document.createElementNS(ns,'clipPath'); clip.id='enterprise-body-crop';
 const rect=document.createElementNS(ns,'rect');clip.append(rect);defs.append(clip);svg.append(defs);
 const artwork=document.createElementNS(ns,'image');artwork.setAttribute('width','1152');artwork.setAttribute('clip-path','url(#enterprise-body-crop)');svg.append(artwork);frame.append(svg);
 const style = document.createElement('style');
 style.textContent = `.writing-reference .enterprise-article-foreground{padding:0!important;border-radius:25px!important;background:#fff!important}`;
 document.head.append(style);
 const crop=[160,625,840,576];
 svg.setAttribute('viewBox',crop.join(' '));
 ['x','y','width','height'].forEach((attribute,i)=>rect.setAttribute(attribute,String(crop[i])));
 artwork.setAttribute('height','1218');
 artwork.setAttribute('href','assets/enterprise-foreground/upgrade.jpg');
 frame.setAttribute('aria-label','汇营销2023全新升级文章截图：完整正文段落');
 const url=new URL(location.href);
 if(url.searchParams.has('enterpriseForeground')){url.searchParams.delete('enterpriseForeground');history.replaceState(null,'',url);}
})();
