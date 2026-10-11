(() => {
 const detail=document.querySelector('#knowledge-motion-detail');if(!detail)return;
 detail.querySelector('.scene-detail-art')?.remove();
 const works=[{name:'墨西哥当代影像战争',prefix:'mexico'},{name:'《欢愉》：“面具”与“模特”',prefix:'pleasure'}];
 const src=(i,p=0)=>`assets/knowledge-comparison/${works[i].prefix}-${p+1}.png`;
 const stage=document.createElement('section');stage.className='km-stage';stage.setAttribute('aria-label','知识转译稿件');detail.append(stage);
 ['click','wheel','pointerdown'].forEach(type=>stage.addEventListener(type,e=>e.stopPropagation()));
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 let active=-1,busy=false,sheets=[],controls;
 const duration=reduced?0:.7;
 function render(){gsap.killTweensOf(stage.querySelectorAll('*'));active=-1;busy=false;
 stage.innerHTML='<div class="km-lettering" aria-hidden="true"><span>ACADEMIC</span><span>TRANSLATION</span></div>'+works.map((w,i)=>`<div class="km-sheet" role="button" tabindex="0" aria-label="展开阅读 ${w.name}"><div class="km-scroll">${[0,1,2,3].map(p=>`<img src="${src(i,p)}" alt="${w.name}原刊第${p+1}页" draggable="false">`).join('')}</div></div>`).join('')+'<div class="km-controls"><button class="km-close" aria-label="收起稿件">×</button></div>';
 sheets=[...stage.querySelectorAll('.km-sheet')];controls=stage.querySelector('.km-controls');
 sheets.forEach((s,i)=>{s.onclick=()=>open(i);s.onkeydown=e=>{if(active<0&&['Enter',' '].includes(e.key)){e.preventDefault();open(i)}};s.onpointerenter=e=>{if(e.pointerType!=='touch'&&active<0&&!busy)gsap.to(s,{y:-5,duration:reduced?0:.3})};s.onpointerleave=e=>{if(e.pointerType!=='touch'&&active<0&&!busy)gsap.to(s,{y:0,rotation:i?5:-5,duration:reduced?0:.4})};});
 controls.querySelector('.km-close').onclick=close;

 }
 function open(i){if(active>=0||busy)return;active=i;busy=true;const s=sheets[i],other=sheets[1-i];s.classList.add('is-open');s.removeAttribute('role');s.tabIndex=-1;other.inert=true;
 gsap.to(other,{x:i? -90:90,opacity:0,duration});gsap.to(stage.querySelector('.km-lettering'),{opacity:0,duration});
 gsap.to(s,{left:54,top:0,width:940,height:594,y:0,rotation:0,duration,ease:'power3.inOut',onComplete:()=>{busy=false;const scroll=s.firstElementChild;if(works[i].prefix==='pleasure')scroll.scrollTo({top:s.querySelector('img').clientHeight*.65,behavior:reduced?'instant':'smooth'});controls.querySelector('.km-close').focus({preventScroll:true});}});
 gsap.to(controls,{autoAlpha:1,duration:reduced?0:.25,delay:reduced?0:.5});
 }
 function close(){if(active<0||busy)return;busy=true;const i=active,s=sheets[i];s.firstElementChild.scrollTop=0;s.querySelector('img').style.width='';gsap.to(controls,{autoAlpha:0,duration:reduced?0:.15});
 gsap.to(s,{left:i?541:86,top:0,width:420,height:580,rotation:i?5:-5,duration,ease:'power3.inOut',onComplete:()=>{s.classList.remove('is-open');s.setAttribute('role','button');s.tabIndex=0;s.querySelector('img').src=src(i);active=-1;busy=false;sheets[1-i].inert=false;s.focus({preventScroll:true});}});gsap.to(sheets[1-i],{x:0,opacity:1,duration});gsap.to(stage.querySelector('.km-lettering'),{opacity:1,duration});
 }
 document.addEventListener('keydown',e=>{if(active>=0&&e.key==='Escape'){e.stopImmediatePropagation();e.preventDefault();close();}},true);
 render();
})();
