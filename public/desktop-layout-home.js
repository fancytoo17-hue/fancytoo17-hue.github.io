const video=document.querySelector('#cat'),stage=document.querySelector('.stage'),hint=document.querySelector('#hint');
const buttons=[document.querySelector('#toggle')].filter(Boolean);
const LEFT=.55,CENTER=1.60,RIGHT=2.55,FPS=30;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const mobileMotion=matchMedia('(any-pointer:coarse), (max-width:760px)');
let mobileCurrent=CENTER,mobileFrames=null,mobileIndex=-1,introStart=0,introDone=false,lastMotionTime=0,heroInView=true;
function stopIntro(){introDone=true;introStart=0;}
let target=CENTER,ready=false,enabled=!reduced.matches,raf=0,last=0,settled=true,seekCount=0;
function label(){hint.textContent=enabled?'轻触或划过画面，让黑猫左右转头。':'黑猫跟随已暂停。';const toggle=document.querySelector('#toggle');toggle?.setAttribute('aria-label',enabled?'暂停黑猫跟随':'开启黑猫跟随');toggle?.setAttribute('aria-pressed',String(!enabled));}
function tick(now){raf=0;if(!ready||document.hidden||!heroInView)return;
 if(mobileMotion.matches&&mobileFrames){
  if(!enabled)return;
  if(!introDone){if(!introStart)introStart=now;const t=(now-introStart)/2400;if(t>=1){introDone=true;target=CENTER;}else target=CENTER+Math.sin(t*Math.PI*2)*.85;}
  const dt=Math.min(50,now-(lastMotionTime||now-16));lastMotionTime=now;
  mobileCurrent+=(target-mobileCurrent)*(1-Math.exp(-dt/95));
  const index=Math.max(0,Math.min(40,Math.round((mobileCurrent-LEFT)/(RIGHT-LEFT)*40)));
  if(index!==mobileIndex){mobileIndex=index;window.paintMobileCatFrame(mobileFrames[Math.floor(index/25)],index%25)}
  settled=Math.abs(target-mobileCurrent)<.008;
  if(!settled||!introDone)wake();return;
 }
 if(video.seeking)return;
 const delta=target-video.currentTime;if(Math.abs(delta)<.018){settled=true;return;}
 if(now-last<30){wake();return;}last=now;settled=false;
 // A seek is asynchronous: sample the latest pointer once, then wait for seeked.
 // Intermediate seeks amplify decoder latency and chase stale pointer positions.
 video.currentTime=Math.max(LEFT,Math.min(RIGHT,Math.round(target*FPS)/FPS));seekCount++;}
function wake(){if(!raf)raf=requestAnimationFrame(tick)}
function setTarget(t){stopIntro();target=Math.max(LEFT,Math.min(RIGHT,t));settled=false;wake()}
function position(x){const r=window.portraitFrameRect(),u=Math.max(0,Math.min(1,(x-r.left)/r.width)),neutral=.73,dead=.025;
 if(Math.abs(u-neutral)<=dead)return CENTER;
 return u<neutral?LEFT+(CENTER-LEFT)*Math.min(1,u/(neutral-dead)):CENTER+(RIGHT-CENTER)*Math.min(1,(u-neutral-dead)/(1-neutral-dead));}
// Respond across the whole hero as soon as a finger lands or moves. Scrolling stays native.
const compactHero=mobileMotion;
const controlTarget=e=>e.target.closest('a,button,input,summary');
function steer(e){if(!enabled||controlTarget(e)||e.isPrimary===false)return;setTarget(position(e.clientX));}
stage.addEventListener('pointerdown',steer,{passive:true});
stage.addEventListener('pointermove',steer,{passive:true});
stage.addEventListener('touchmove',e=>{if(enabled&&!controlTarget(e)&&e.touches.length===1)setTarget(position(e.touches[0].clientX))},{passive:true});
stage.addEventListener('pointerleave',e=>{if(e.pointerType!=='touch'&&!mobileMotion.matches&&ready&&enabled)setTarget(CENTER)});
stage.addEventListener('keydown',e=>{if(!enabled||controlTarget(e))return;if(['ArrowLeft','ArrowRight','Home'].includes(e.key)){e.preventDefault();setTarget(e.key==='Home'?CENTER:target+(e.key==='ArrowLeft'?-.15:.15))}});
function loadMobileFrames(){
 if(!mobileMotion.matches||mobileFrames)return;
 const images=[0,1].map(i=>{const image=new Image();image.src=`assets/cat-mobile/cat-motion-${i}.webp`;return image});
 Promise.all(images.map(image=>image.decode())).then(()=>{mobileFrames=images;ready=true;label();if(reduced.matches)window.paintMobileCatFrame(images[0],21);else wake()}).catch(()=>{hint.textContent='互动素材尚未就绪，已保留完整静态画面。'});
}
loadMobileFrames();mobileMotion.addEventListener('change',()=>{loadMobileFrames();if(!mobileMotion.matches){ready=video.readyState>=2;window.ensurePortraitVideo?.()}wake()});
new IntersectionObserver(([entry])=>{heroInView=entry.isIntersecting;if(heroInView)wake();else {if(!introDone)introStart=0;if(raf){cancelAnimationFrame(raf);raf=0;}}},{threshold:0}).observe(stage);

buttons.forEach(button=>button.addEventListener('click',()=>{enabled=!enabled;if(!enabled)setTarget(video.currentTime);label()}));
video.addEventListener('loadeddata',()=>{video.pause();ready=true;wake();buttons.forEach(b=>b.disabled=false);label()},{once:true});
video.addEventListener('seeked',()=>{if(ready)wake()});
video.addEventListener('error',()=>{ready=false;buttons.forEach(b=>b.disabled=true);hint.textContent='视频暂时无法读取，已保留静态画面。请刷新重试。'});
reduced.addEventListener('change',e=>{enabled=!e.matches;if(!enabled)setTarget(CENTER);label()});
document.addEventListener('visibilitychange',()=>{if(document.hidden){if(raf)cancelAnimationFrame(raf);raf=0;}else wake()});
window.motionState=()=>({ready,enabled,target,mobileFrame:mobileIndex,current:mobileMotion.matches?mobileCurrent:video.currentTime,seeking:video.seeking,settled,seekCount,videoWidth:video.videoWidth,videoHeight:video.videoHeight});

// Keep layout stable while reproducing the original 600 ms / 38 ms entrance.
const title=document.querySelector('h1'),tags=document.querySelector('.profile-tags');
if(!reduced.matches){
 document.body.classList.add('entrance-ready');
 const nodes=[]; const walker=document.createTreeWalker(title,NodeFilter.SHOW_TEXT);
 while(walker.nextNode())nodes.push(walker.currentNode);
 const glyphs=[];
 for(const node of nodes){const frag=document.createDocumentFragment();for(const ch of Array.from(node.textContent)){const span=document.createElement('span');span.className='glyph pending';span.textContent=ch;frag.append(span);glyphs.push(span)}node.replaceWith(frag)}
 title.classList.add('is-typing');let n=0,timer;
 function finish(){clearTimeout(timer);glyphs.forEach(g=>g.classList.remove('pending','cursor'));title.classList.remove('is-typing');tags.classList.add('is-visible')}
 function reveal(){if(reduced.matches){finish();return}if(n)glyphs[n-1].classList.remove('cursor');if(n>=glyphs.length){title.classList.remove('is-typing');return}glyphs[n].classList.remove('pending');glyphs[n].classList.add('cursor');n++;timer=setTimeout(reveal,38)}
 Promise.race([document.fonts.load('600 76px "Noto Serif SC"',title.textContent),new Promise(resolve=>setTimeout(resolve,700))]).then(()=>{if(reduced.matches){finish();return}setTimeout(()=>tags.classList.add('is-visible'),400);timer=setTimeout(reveal,600)});
 reduced.addEventListener('change',e=>{if(e.matches)finish()});
}
