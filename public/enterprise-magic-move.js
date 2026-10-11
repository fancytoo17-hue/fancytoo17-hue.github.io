/* Shared-element navigation for the four writing scenes. Static content stays separate. */
(()=>{
  const root=document.querySelector('.writing-reference');
  if(!root)return;
  const grid=root.querySelector('.tab-main-grid');
  const cards=[...grid.children];
  const initial=cards.map(card=>({left:card.offsetLeft,top:card.offsetTop,width:card.offsetWidth,height:card.offsetHeight}));
  const total={width:grid.offsetWidth,height:grid.offsetHeight};
  const reduce=matchMedia('(prefers-reduced-motion:reduce)');
  const names=cards.map(card=>card.querySelector('.h3').textContent.trim());
  const keys={企业叙事:'enterprise',视频引流:'video',文化观察:'culture',知识转译:'knowledge'};
  let active=-1,desired=-1,busy=false,animations=[];
  const content=cards.map((card,i)=>{
    const inner=document.createElement('div');inner.className='writing-card-content';
    Object.assign(inner.style,{width:initial[i].width+'px',height:initial[i].height+'px'});
    inner.append(...card.childNodes);card.append(inner);
    Object.assign(card.style,px(initial[i]));return inner;
  });
  root.classList.add('is-interactive');
  root.dataset.view='overview';
  const details=cards.map((card,i)=>{
    const detail=document.createElement('div');
    detail.className='writing-detail scene-detail';detail.id=keys[names[i]]+'-motion-detail';
    Object.assign(detail.style,{width:total.width+'px',height:total.height+'px'});
    detail.setAttribute('aria-hidden','true');detail.inert=true;
    if(i!==0){
      // These scenes have no authored detail body yet: reuse approved overview material.
      detail.dataset.contentStatus='overview-material-only';
      const header=content[i].querySelector('.features-item-header-w').cloneNode(true);
      header.classList.add('scene-detail-header');
      header.querySelectorAll('[id]').forEach(e=>e.removeAttribute('id'));
      const art=content[i].querySelector('.features-item-bg-w').cloneNode(true);
      art.classList.add('scene-detail-art');
      art.querySelectorAll('[id]').forEach(e=>e.removeAttribute('id'));
      art.style.setProperty('left',(total.width-initial[i].width)/2+'px','important');
      detail.append(header,art);
    }
    card.append(detail);return detail;
  });
  const tabs=[...root.querySelectorAll('.tab-button')].map((link,t)=>{
    const button=document.createElement('button');button.className=link.className;button.style.cssText=link.style.cssText;
    button.type='button';button.append(...link.childNodes);link.replaceWith(button);
    const index=t===0?-1:names.indexOf(button.textContent.trim());
    button.dataset.sceneIndex=index;button.setAttribute('aria-pressed',String(t===0));
    button.removeAttribute('aria-disabled');button.disabled=false;
    button.addEventListener('click',()=>show(index));return button;
  });
  let pointerStart=null;
  root.addEventListener('pointerdown',e=>{pointerStart={x:e.clientX,y:e.clientY}});
  cards.forEach((card,i)=>{
    card.setAttribute('role','button');card.tabIndex=0;
    card.setAttribute('aria-label','展开'+names[i]);card.setAttribute('aria-controls',details[i].id);card.setAttribute('aria-expanded','false');
    card.addEventListener('click',e=>{
      if(window.getSelection()?.toString().trim())return;
      if(pointerStart&&Math.hypot(e.clientX-pointerStart.x,e.clientY-pointerStart.y)>6)return;
      if(e.target.closest('a,button,input,textarea,select,[contenteditable]'))return;
      show(active===i?-1:i);
    });
    card.addEventListener('keydown',e=>{
      if(e.target===card&&(e.key==='Enter'||e.key===' ')){e.preventDefault();show(active===i?-1:i)}
    });
  });
  root.addEventListener('enterprise-return',()=>show(-1));
  root.addEventListener('keydown',e=>{if(e.key==='Escape'){show(-1);tabs[0].focus({preventScroll:true})}});
  const easing='cubic-bezier(.22,1,.36,1)';
  function px(obj){return Object.fromEntries(Object.entries(obj).map(([k,v])=>[k,v+'px']))}
  function tween(el,frames,options){
    const a=el.animate(frames,{fill:'both',...options});animations.push(a);return a.finished.catch(()=>{});
  }
  function localBox(el,index,insideFrame=false,overview=false){
    const g=grid.getBoundingClientRect(),scale=g.width/total.width;
    const c=cards[index].getBoundingClientRect(),r=el.getBoundingClientRect();
    let x=r.left,y=r.top,w=r.width,h=r.height;
    if(insideFrame){
      const frame=details[index].querySelector('iframe'),f=frame.getBoundingClientRect(),s=f.width/frame.offsetWidth;
      x=f.left+r.left*s;y=f.top+r.top*s;w*=s;h*=s;
    }
    // Normalize away the currently expanded/collapsed shell position.
    return {left:(x-c.left)/scale+(overview?initial[index].left:0),
      top:(y-c.top)/scale+(overview?initial[index].top:0),width:w/scale,height:h/scale};
  }
  function textStyle(el){const s=el.ownerDocument.defaultView.getComputedStyle(el);
    return Object.fromEntries(['fontFamily','fontSize','fontWeight','lineHeight','letterSpacing','color'].map(k=>[k,s[k]]));}
  function headerMotion(index,open,duration,jobs,cleanup,switching){
    if(reduce.matches)return;
    const overview=content[index].querySelector('.features-item-header-w');
    const doc=details[index].querySelector('iframe')?.contentDocument;
    const header=details[index].querySelector('.scene-detail-header');
    const title=doc?.querySelector('.Copy__title')||header?.querySelector('.h3');
    const intro=doc?.querySelector('.Copy__footer .CtaButton')||header?.querySelector(':scope > div');
    if(!title||!intro)return;
    const pairs=[[overview.querySelector('.h3'),title],[overview.querySelector(':scope > div'),intro]];
    pairs.forEach(([origin,target])=>{
      const a=localBox(origin,index,false,true),b=localBox(target,index,!!doc,false);
      const from=open?a:b,to=open?b:a,source=open?origin:target,destination=open?target:origin;
      const previous=[origin.style.visibility,target.style.visibility];
      origin.style.visibility='hidden';target.style.visibility='hidden';
      cleanup.push(()=>{origin.style.visibility=previous[0];target.style.visibility=previous[1]});
      const different=origin.textContent.trim()!==target.textContent.trim();
      (different?[source,destination]:[source]).forEach((el,n)=>{
        const layer=document.createElement('div');layer.className='enterprise-shared-heading';layer.setAttribute('aria-hidden','true');layer.textContent=el.textContent.trim();
        Object.assign(layer.style,{position:'absolute',zIndex:'50',pointerEvents:'none',margin:'0',padding:'0',whiteSpace:'nowrap',transformOrigin:'0 0',...textStyle(el),left:from.left+'px',top:from.top+'px'});
        grid.append(layer);cleanup.push(()=>layer.remove());
        jobs.push(tween(layer,[{transform:'translate(0,0)'},{transform:`translate(${to.left-from.left}px,${to.top-from.top}px)`}],{duration,easing}));
        if(different){
          jobs.push(tween(layer,n===0?[{opacity:1},{opacity:0}]:[{opacity:0},{opacity:1}],{duration:duration*.48,delay:n===0?0:duration*.30,easing:'ease-out'}));
          if(switching&&!open&&n===1)layer.style.display='none';
        }else{
          jobs.push(tween(layer,[textStyle(source),textStyle(destination)],{duration,easing}));
          if(switching)jobs.push(tween(layer,open?[{opacity:0},{opacity:1}]:[{opacity:1},{opacity:0}],{duration:duration*.45,delay:open?duration*.18:0,easing:'ease-out'}));
        }
      });
    });
  }
  function artMotion(index,open,duration,jobs,cleanup,switching){
    const target=details[index].querySelector('.scene-detail-art');
    if(!target)return;
    const origin=content[index].querySelector('.features-item-bg-w');
    const a=localBox(origin,index,false,true),b=localBox(target,index,false,false);
    const from=open?a:b,to=open?b:a;
    const layer=origin.cloneNode(true);layer.classList.add('scene-moving-art');layer.setAttribute('aria-hidden','true');
    layer.querySelectorAll('[id]').forEach(e=>e.removeAttribute('id'));
    for(const [k,v] of Object.entries({position:'absolute',left:from.left+'px',top:from.top+'px',right:'auto',bottom:'auto',zIndex:'20',pointerEvents:'none',overflow:'hidden',transform:'none'}))layer.style.setProperty(k.replace(/[A-Z]/g,m=>'-'+m.toLowerCase()),v,'important');
    grid.append(layer);
    const previous=[origin.style.visibility,target.style.visibility];origin.style.visibility='hidden';target.style.visibility='hidden';
    cleanup.push(()=>{layer.remove();origin.style.visibility=previous[0];target.style.visibility=previous[1]});
    jobs.push(tween(layer,[{translate:'0px 0px',opacity:switching&&open?0:1},{translate:`${to.left-from.left}px ${to.top-from.top}px`,opacity:switching&&!open?0:1}],{duration,easing}));
  }
  function geometry(index){
    if(index<0)return initial;
    const selected=initial[index],cx=selected.left+selected.width/2,cy=selected.top+selected.height/2;
    return initial.map((r,i)=>{
      if(i===index)return {left:0,top:0,width:total.width,height:total.height};
      const sameRow=Math.abs(r.top-selected.top)<5;
      if(sameRow)return {left:r.left+r.width/2<cx?0:total.width,top:0,width:0,height:total.height};
      return {left:r.left+r.width/2<cx?0:total.width,top:r.top+r.height/2<cy?0:total.height,width:0,height:0};
    });
  }
  function detailMotion(index,open,duration,jobs){
    const detail=details[index],doc=detail.querySelector('iframe')?.contentDocument;
    detail.querySelectorAll('.video-film').forEach((film,i)=>{
      const rest={opacity:1,translate:'0px 0px'},away={opacity:0,translate:'0px 22px'};
      jobs.push(tween(film,open?[away,rest]:[rest,away],{duration:duration*.6,delay:reduce.matches?0:(open?duration*(.1+i*.04):0),easing}));
    });
    const rows=[...(doc?.querySelectorAll('.NewsroomIndexPost')||[])];
    rows.forEach((row,i)=>{
      const rest={opacity:1,transform:'translate(0,0)'},away={opacity:0,transform:'translate(24px,10px)'};
      jobs.push(tween(row,open?[away,rest]:[rest,away],{duration:duration*(open?.62:.42),delay:reduce.matches?0:(open?duration*(.12+i*.035):i*12),easing}));
    });
    const guides=doc?.querySelector('.Guides');
    if(guides)jobs.push(tween(guides,[{opacity:open?0:1},{opacity:open?1:0}],{duration:duration*.6,easing:'ease-out'}));
  }
  async function show(next){
    desired=next;
    if(busy||next===active)return;
    busy=true;
    const old=active,switching=old>=0&&next>=0;
    const jobs=[],cleanup=[],duration=reduce.matches?0:(next<0?580:740);
    const from=cards.map(card=>{const s=getComputedStyle(card);return Object.fromEntries(['left','top','width','height'].map(k=>[k,s[k]]))});
    animations.forEach(a=>a.cancel());animations=[];
    // Reveal only participating scenes for measurement; keep them inert during motion.
    details.forEach((detail,i)=>{detail.inert=true;detail.setAttribute('aria-hidden','true');if(i===old||i===next)detail.classList.add('is-visible')});
    if(old>=0){headerMotion(old,false,duration,jobs,cleanup,switching);artMotion(old,false,duration,jobs,cleanup,switching)}
    if(next>=0){headerMotion(next,true,duration,jobs,cleanup,switching);artMotion(next,true,duration,jobs,cleanup,switching)}
    active=next;
    root.dataset.view=next<0?'closing':(switching?'switching':'opening');
    const targets=geometry(next);
    cards.forEach((card,i)=>{
      card.inert=false;card.removeAttribute('aria-hidden');
      card.style.zIndex=i===next?'3':i===old?'2':'1';
      card.setAttribute('aria-expanded',String(i===next));card.setAttribute('aria-label',i===next?'返回场景概览':'展开'+names[i]);card.tabIndex=next<0?0:-1;
      Object.assign(card.style,px(targets[i]));jobs.push(tween(card,[from[i],px(targets[i])],{duration,easing}));
      const wasOverview=old<0,willOverview=next<0;
      const rest={opacity:1,transform:'translate(0,0) scale(1)'},away={opacity:0,transform:'translate(20px,8px) scale(.98)'};
      content[i].style.opacity=willOverview?'1':'0';
      if(wasOverview||willOverview)jobs.push(tween(content[i],wasOverview?[rest,away]:[away,rest],{duration:duration*.55,delay:willOverview?duration*.27:0,easing}));
      if(i===old||i===next){
        details[i].classList.add('is-visible');details[i].style.opacity='1';details[i].setAttribute('aria-hidden','true');details[i].inert=true;
        detailMotion(i,i===next,duration,jobs);
      }
    });
    tabs.forEach(tab=>tab.setAttribute('aria-pressed',String(Number(tab.dataset.sceneIndex)===next)));
    await Promise.all(jobs);
    root.dataset.view=next<0?'overview':keys[names[next]];
    details.forEach((detail,i)=>{const visible=i===next;detail.classList.toggle('is-visible',visible);detail.style.opacity=visible?'1':'0';detail.inert=!visible;detail.setAttribute('aria-hidden',String(!visible))});
    content.forEach(el=>{el.style.opacity=next<0?'1':'0';el.setAttribute('aria-hidden',String(next>=0))});
    cleanup.forEach(fn=>fn());animations.forEach(a=>a.cancel());animations=[];
    cards.forEach((card,i)=>{card.inert=next>=0&&i!==next;card.setAttribute('aria-hidden',String(card.inert))});
    if(next>=0&&cards.includes(document.activeElement))tabs.find(tab=>Number(tab.dataset.sceneIndex)===next).focus({preventScroll:true});
    busy=false;if(desired!==active)show(desired);
  }
})();
