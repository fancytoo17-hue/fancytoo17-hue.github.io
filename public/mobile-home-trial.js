(()=>{function size(){document.documentElement.style.setProperty('--home-mobile-scale',document.documentElement.clientWidth/1740);if(innerWidth<=760)document.querySelector('.artboard').dataset.scale=String(document.documentElement.clientWidth/1740)}size();window.addEventListener('resize',size);document.fonts.ready.then(size)})();

// Each headline line responds independently, matching the desktop hover design.
(()=>{
 const hero=document.querySelector('.hero-copy');if(!hero)return;
 const lines=[...hero.querySelectorAll('.headline-line')];
 const touch=matchMedia('(any-pointer:coarse), (max-width:760px)');let timer;
 function clear(){lines.forEach(line=>line.classList.remove('is-touch-accent'));}
 function pulse(e){
  if(!touch.matches&&e.pointerType!=='touch')return;
  const point=e.touches?.[0]||e;
  const line=lines.find(line=>{const r=line.getBoundingClientRect();return point.clientX>=r.left&&point.clientX<=r.right&&point.clientY>=r.top&&point.clientY<=r.bottom});
  clearTimeout(timer);clear();if(!line)return;
  line.classList.add('is-touch-accent');timer=setTimeout(clear,180);
 }
 function release(){clearTimeout(timer);timer=setTimeout(clear,60);}
 hero.addEventListener('pointerdown',pulse,{passive:true});
 hero.addEventListener('touchmove',pulse,{passive:true});
 hero.addEventListener('pointerup',release,{passive:true});
 hero.addEventListener('pointercancel',release,{passive:true});
})();
