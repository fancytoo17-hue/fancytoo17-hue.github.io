/* User-supplied scheme-one article cards, in the user-confirmed case order.
   Eight supplied images; selected image uses the reference 10:1 expanded-to-collapsed ratio. */
(()=>{
  const detail=document.querySelector('#culture-motion-detail');
  if(!detail||!window.gsap)return;
  const root=detail.closest('.writing-reference');
  detail.querySelector('.scene-detail-art')?.remove();
  detail.dataset.contentStatus='user-scheme-one-trial';
  const stage=document.createElement('div');stage.className='culture-panel-stage';
  stage.setAttribute('role','group');stage.setAttribute('aria-label','文章配图：滑动或方向键切换；点选图片，再次点击已展开图片阅读原文');
  const space=document.createElement('div');space.className='culture-panel-space';
  const frame=document.createElement('div');frame.className='culture-panel-frame';frame.setAttribute('aria-hidden','true');
  const line=document.createElement('div');line.className='culture-panel-line';line.setAttribute('aria-hidden','true');
  const axis=document.createElement('div');axis.className='culture-panel-axis';axis.setAttribute('aria-hidden','true');
  const axisSpace=document.createElement('div');axisSpace.className='culture-panel-axis-space';
  axisSpace.append(line);axis.append(axisSpace);
  const track=document.createElement('div');track.className='culture-panel-track';
  const imageFiles=['article-2.jpg','article-3.jpg','article-7.jpg','article-6.jpg','article-5.jpg','article-387.jpg','article-1.jpg','article-4.jpg'];
  const articles=[{"title": "在你之后，我别无爱人。", "url": "https://mp.weixin.qq.com/s/7zS-dLWbnnl_YCH3cKDXSg"}, {"title": "没人比他更了解女人。", "url": "https://mp.weixin.qq.com/s/9engsJWcDXqdRapUvQe5yQ"}, {"title": "这是每个90后都应该看的电影。", "url": "https://mp.weixin.qq.com/s/43lBA4Ef-n497-ViNdYRvA"}, {"title": "在这部电影里，我看到了爸爸的世界。", "url": "https://mp.weixin.qq.com/s/vn1MObKzXfXyVA5aVPuoyQ"}, {"title": "非常理想，特别现实，这才是爱情片该有的样子。", "url": "https://mp.weixin.qq.com/s/tQobvT6RkrXr9cfobHwHYw"}, {"title": "在这个国家，“人”才是无价的珍宝。", "url": "https://mp.weixin.qq.com/s/7z3S3_WdsXYjeBNpghIbdQ"}, {"title": "涌入电影节的95后", "url": "https://mp.weixin.qq.com/s/j3oE8BKgK_sfGJBha0gOmQ"}, {"title": "“姐姐”的牺牲是理所当然的吗？", "url": "https://mp.weixin.qq.com/s/WvjVprkQoFJS9aDiTVFuuQ"}];
  // Source bounds exclude screenshot chrome and the rounded outer gray corners.
  const cropBounds=[[27,688],[25,686],[29,691],[7,667],[14,739],[15,675],[20,744],[15,740]];
  const cropWidth=1106, cardHeight=725;
  const items=imageFiles.map((file,i)=>{
    const item=document.createElement('a');item.className='culture-panel-item';
    item.href=articles[i].url;item.target='_blank';item.rel='noopener noreferrer';
    item.style.textDecoration='none';item.style.color='inherit';
    item.setAttribute('aria-label',`阅读《${articles[i].title}》原文（新标签页）`);item.setAttribute('aria-current',String(i===0));
    item.tabIndex=i===0?0:-1;
    const image=document.createElement('span');image.className='culture-panel-image';
    const img=document.createElement('img');img.src=`assets/culture-scheme-one/${file}`;
    img.alt='';img.draggable=false;
    const card=document.createElement('span');card.className='culture-panel-card';
    const crop=document.createElement('span');crop.className='culture-panel-crop';
    const [top,bottom]=cropBounds[i];
    crop.style.height=`${(bottom-top)/cardHeight*100}%`;
    img.style.top=`calc(var(--culture-image-width) * ${-top/cropWidth})`;
    crop.append(img);card.append(crop);image.append(card);item.append(image);track.append(item);return item;
  });
  space.append(frame,track);stage.append(space);detail.prepend(axis);detail.append(stage);
  const quote=document.createElement('p');quote.className='culture-case-quote';
  quote.setAttribute('aria-live','polite');quote.setAttribute('aria-atomic','true');
  const quoteText=document.createElement('span');quote.append(quoteText);
  const quoteAnchor=document.createElement('div');quoteAnchor.className='culture-quote-anchor';
  quoteAnchor.append(quote);space.append(quoteAnchor);
  const caseQuotes=[
  [
    "法国新浪潮的祖母",
    "是女性，是导演，不是“女导演”"
  ],
  [
    "上世纪的黑白银幕里",
    "没有爽文，但有我们求而不得的大女主"
  ],
  [
    "我们羡慕的不止群星璀璨",
    "还有“一人一事一生”曾真实发生"
  ],
  [
    "我们已经被生活磨得疲惫不堪",
    "还剩多少余力去关心父母正在失序的世界"
  ],
  [
    "想要知道你爱谁",
    "先得找到你自己"
  ],
  [
    "女性自由最朴素的尺度",
    "是工作养家时不必先把自己装成男人"
  ],
  [
    "拆掉行业光环",
    "也许才是接近理想的第一步"
  ],
  [
    "二选一的答案装不下真实的家庭关系",
    "但有反思总比没有好"
  ]
];
  let quoteTransition,quoteSide;
  function renderQuote(){
    quoteText.textContent=caseQuotes[selected].join('\n');
  }
  function positionQuote(axisX,y,onRight,animate,timing){
    quoteTransition?.kill();gsap.killTweensOf(quote);
    const localX=onRight?22:-22-430;
    const changingSide=quoteSide!==undefined&&quoteSide!==onRight;
    gsap.to(quoteAnchor,{x:axisX,y,...timing});
    const apply=()=>{
      quoteSide=onRight;
      quote.style.textAlign=onRight?'left':'right';
      renderQuote();
      gsap.set(quote,{x:localX+(changingSide?(onRight?10:-10):0)});
    };
    if(!animate||reduce.matches){
      apply();gsap.set(quote,{x:localX,opacity:1});return;
    }
    // Keep the old alignment until fully faded; re-anchor while invisible.
    // Killing the timeline on a new selection prevents stale delayed swaps.
    quoteTransition=gsap.timeline()
      .to(quote,{opacity:0,duration:.14,ease:'power1.out'})
      .call(apply)
      .to(quote,{x:localX,opacity:1,duration:changingSide?.38:.28,ease:'power2.out'});
  }
  const touchMode=matchMedia('(any-pointer:coarse), (max-width:760px)');
  const reduce=matchMedia('(prefers-reduced-motion:reduce)');
  let selected=0,rx=0,ry=0,targetX=0,targetY=0,running=false;
  let touchInput=touchMode.matches,gesture=null,suppressClick=false,dragProgress=0;
  const dragAxis=document.createElement('div');dragAxis.className='culture-drag-axis';dragAxis.tabIndex=0;
  dragAxis.setAttribute('role','slider');dragAxis.setAttribute('aria-label','左右拖动轴线切换文章');
  dragAxis.setAttribute('aria-valuemin','1');dragAxis.setAttribute('aria-valuemax',String(items.length));
  const hitLayer=document.createElement('div');hitLayer.className='culture-axis-hit-layer';
  const hitSpace=document.createElement('div');hitSpace.className='culture-axis-hit-space';
  hitSpace.append(dragAxis);hitLayer.append(hitSpace);detail.append(hitLayer);
  function updateControls(){
    dragAxis.setAttribute('aria-valuenow',String(selected+1));dragAxis.setAttribute('aria-valuetext',articles[selected].title);
    stage.classList.toggle('is-touch-gallery',touchInput);
    items.forEach((item,i)=>{
      item.href=articles[i].url;
      item.setAttribute('aria-label',touchInput&&i!==selected?`选择《${articles[i].title}》，再次点击阅读原文`:`阅读《${articles[i].title}》原文（新标签页）`);
    });
  }
  touchMode.addEventListener('change',()=>{touchInput=touchMode.matches;updateControls();geometry();sync()});
  function geometry(animate=false,progress=selected){
    // Layout coordinates remain correct under the site's shared chapter scaling.
    const w=stage.offsetWidth,trackWidth=w*.8,padding=w*.005;
    // Match the reference image-width ratio, including the existing panel padding.
    const opened=(trackWidth-items.length*padding*2)*10/(items.length+9)+padding*2;
    stage.style.setProperty('--culture-image-width',(opened-padding*2)+'px');
    const closed=(trackWidth-opened)/(items.length-1);
    const expandedWeight=(opened-padding*2)/(closed-padding*2);
    const height=(opened-padding*2)*cardHeight/cropWidth+padding*2;
    const x=w*.1+closed*progress,y=(stage.offsetHeight-height)/2;
    track.style.height=height+'px';items.forEach(item=>item.style.padding=padding+'px');
    stage.style.perspective=w*.5+'px';
    axis.style.perspective=w*.5+'px';hitLayer.style.perspective=w*.5+'px';
    const origin=stage.offsetTop+stage.offsetHeight/2;
    axis.style.perspectiveOrigin=`50% ${origin}px`;
    axisSpace.style.transformOrigin=`50% ${origin}px`;
    hitLayer.style.perspectiveOrigin=`50% ${origin}px`;hitSpace.style.transformOrigin=`50% ${origin}px`;
    updateTitleCutout();
    const timing={duration:animate&&!reduce.matches ? (touchInput?.32:.7) : 0,ease:'power3.out',overwrite:true};
    gsap.to(items,{flexGrow:i=>1+(expandedWeight-1)*Math.max(0,1-Math.abs(i-progress)),...timing});
    gsap.to(frame,{x,y,width:opened,height,...timing});
    const axisX=x+opened/2;
    dragAxis.style.width=44/(stage.getBoundingClientRect().width/w||1)+'px';
    // Keep the axis draggable above/below the photos, but never cover their links.
    const imageTop=stage.offsetTop+y,imageBottom=imageTop+height;
    dragAxis.style.clipPath=`polygon(0 0,100% 0,100% ${imageTop}px,0 ${imageTop}px,0 ${imageBottom}px,100% ${imageBottom}px,100% 100%,0 100%)`;
    gsap.to(dragAxis,{x:axisX,...timing});
    gsap.to(line,{x:axisX,...timing});
    positionQuote(axisX,y-quote.offsetHeight-24,axisX<=w/2,animate,timing);
    updateTitleCutout();
  }
  function updateTitleCutout(){
    const w=stage.offsetWidth;
    const header=detail.querySelector('.scene-detail-header');
    if(header){
      const pad=28;
      // Mask the whole header box so carousel glyph motion never intersects the axis.
      const layers=[...header.querySelectorAll('.islands-title-layer')];
      const titleWidth=layers.length?Math.max(...layers.map(el=>el.offsetWidth)):header.offsetWidth;
      const l=header.offsetLeft-pad,t=header.offsetTop-pad;
      const r=l+titleWidth+pad*2,b=t+header.offsetHeight+pad*2;
      // Opposite winding cuts a transparent hole without repainting the gradient.
      let cutout=`polygon(0px 0px,${w}px 0px,${w}px ${detail.offsetHeight}px,0px ${detail.offsetHeight}px,0px 0px,${l}px ${t}px,${l}px ${b}px,${r}px ${b}px,${r}px ${t}px,${l}px ${t}px,0px 0px`;
      axis.style.clipPath=cutout+')';hitLayer.style.clipPath=axis.style.clipPath;
    }
  }
  function select(index,progress=index,dragging=false){
    index=Math.max(0,Math.min(items.length-1,index));
    if(index===selected&&!dragging)return;
    selected=index;dragProgress=progress;updateControls();
    items.forEach((item,i)=>{item.setAttribute('aria-current',String(i===index));item.tabIndex=i===index?0:-1});
    if(touchInput){targetY=(progress/(items.length-1)-.5)*32;targetX=-5;}
    geometry(!dragging,progress);
  }
  items.forEach((item,i)=>{
    item.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch'&&!touchInput)select(i)});
    item.addEventListener('click',e=>{e.stopPropagation();if(suppressClick){e.preventDefault();return;}if(touchInput&&i!==selected){e.preventDefault();select(i);}else if(!touchInput)select(i)});
    item.addEventListener('focus',()=>{if(!gesture&&!touchInput)select(i)});
    item.addEventListener('keydown',e=>{
      suppressClick=false;
      if(touchInput&&e.key===' '){e.preventDefault();select(i);return;}
      if(touchInput&&e.key==='Enter'&&i!==selected){e.preventDefault();select(i);return;}
      const next=e.key==='ArrowRight'?(i+1)%items.length:e.key==='ArrowLeft'?(i+items.length-1)%items.length:e.key==='Home'?0:e.key==='End'?items.length-1:null;
      if(next===null)return;e.preventDefault();e.stopPropagation();select(next);items[next].focus({preventScroll:true});
    });
  });
  track.addEventListener('dragstart',e=>e.preventDefault());
  detail.addEventListener('pointerdown',e=>{
    if(e.target!==dragAxis&&!track.contains(e.target))return;
    if(e.isPrimary===false){gesture=null;suppressClick=true;return;}
    if(e.pointerType==='touch'&&!touchInput){touchInput=true;updateControls();sync();}
    if(!touchInput&&e.target!==dragAxis)return;
    suppressClick=false;gesture={id:e.pointerId,x:e.clientX,y:e.clientY,start:selected,onAxis:e.target===dragAxis,axis:e.target===dragAxis?'x':null};
    if(e.target===dragAxis)dragAxis.setPointerCapture(e.pointerId);
  });
  detail.addEventListener('pointermove',e=>{
    if(!gesture||gesture.id!==e.pointerId)return;
    const dx=e.clientX-gesture.x,dy=e.clientY-gesture.y;
    if(!gesture.axis&&Math.hypot(dx,dy)>10)gesture.axis=Math.abs(dx)>Math.abs(dy)*1.1?'x':'y';
    if(!gesture.axis)return;
    suppressClick=true;
    if(gesture.axis==='y')return;
    const capture=gesture.onAxis?dragAxis:detail;
    if(!capture.hasPointerCapture(e.pointerId))capture.setPointerCapture(e.pointerId);
    const r=track.getBoundingClientRect(),span=r.width*.55;
    // The axis follows the finger continuously, including intermediate card widths.
    const progress=Math.max(0,Math.min(items.length-1,gesture.start+dx/span*(items.length-1)));
    targetX=Math.max(-12,Math.min(12,-dy*.12-5));
    select(Math.round(progress),progress,true);
  },{passive:true});
  function finishDrag(cancelled=false){
    if(gesture?.axis==='x'){geometry(true,selected);dragProgress=selected;}
    if(cancelled)suppressClick=true;gesture=null;
  }
  detail.addEventListener('pointerup',()=>finishDrag());
  detail.addEventListener('pointercancel',()=>finishDrag(true));
  detail.addEventListener('lostpointercapture',()=>finishDrag());
  dragAxis.addEventListener('click',e=>{e.preventDefault();e.stopPropagation()});
  dragAxis.addEventListener('keydown',e=>{
    const next=e.key==='ArrowRight'?Math.min(7,selected+1):e.key==='ArrowLeft'?Math.max(0,selected-1):e.key==='Home'?0:e.key==='End'?7:null;
    if(next!==null){e.preventDefault();e.stopPropagation();select(next)}
  });
  // Interaction inside the gallery must not trigger the chapter's click-to-return.
  stage.addEventListener('click',e=>e.stopPropagation());
  stage.addEventListener('pointermove',e=>{
    if(reduce.matches||touchInput||gesture||e.pointerType==='touch')return;
    const b=stage.getBoundingClientRect();
    targetY=((e.clientX-b.left)/b.width-.5)*40;
    targetX=(.5-(e.clientY-b.top)/b.height)*40;
  });
  stage.addEventListener('pointerleave',()=>{if(!touchInput&&!gesture){targetX=0;targetY=0}});
  function tick(){
    const a=1-Math.pow(.9,gsap.ticker.deltaRatio());
    rx+=(targetX-rx)*a;ry+=(targetY-ry)*a;
    gsap.set([space,axisSpace,hitSpace],{rotationX:rx,rotationY:ry});
  }
  function sync(){
    const visible=root.dataset.view==='culture'&&!document.hidden&&!reduce.matches;
    if(visible&&!running){gsap.ticker.add(tick);running=true}
    if(!visible&&running){gsap.ticker.remove(tick);running=false;targetX=targetY=rx=ry=0;gsap.set([space,axisSpace,hitSpace],{rotationX:0,rotationY:0})}
  }
  new ResizeObserver(()=>geometry()).observe(stage);
  const titleHeader=detail.querySelector('.scene-detail-header');
  if(titleHeader){
    new ResizeObserver(()=>geometry()).observe(titleHeader);
    new MutationObserver(updateTitleCutout).observe(titleHeader,{childList:true,subtree:true});
  }
  new MutationObserver(()=>{geometry();sync()}).observe(root,{attributes:true,attributeFilter:['data-view']});
  document.addEventListener('visibilitychange',sync);reduce.addEventListener('change',()=>{geometry();sync()});
  updateControls();renderQuote();geometry();sync();
})();
