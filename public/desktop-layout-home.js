const video=document.querySelector('#cat'),stage=document.querySelector('.stage'),hint=document.querySelector('#hint');
const buttons=[document.querySelector('#toggle')].filter(Boolean);
const LEFT=.55,CENTER=1.60,RIGHT=2.55,FPS=30;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let target=CENTER,ready=false,enabled=!reduced.matches,raf=0,last=0,settled=true,seekCount=0;
function label(){hint.textContent=enabled?'黑猫跟随已开启。':'黑猫跟随已暂停。';const toggle=document.querySelector('#toggle');toggle?.setAttribute('aria-label',enabled?'暂停黑猫跟随':'开启黑猫跟随');toggle?.setAttribute('aria-pressed',String(!enabled));}
function tick(now){raf=0;if(!ready||document.hidden)return;if(video.seeking)return;
 const delta=target-video.currentTime;if(Math.abs(delta)<.018){settled=true;return;}
 if(now-last<30){wake();return;}last=now;settled=false;
 // A seek is asynchronous: sample the latest pointer once, then wait for seeked.
 // Intermediate seeks amplify decoder latency and chase stale pointer positions.
 video.currentTime=Math.max(LEFT,Math.min(RIGHT,Math.round(target*FPS)/FPS));seekCount++;}
function wake(){if(!raf)raf=requestAnimationFrame(tick)}
function setTarget(t){target=Math.max(LEFT,Math.min(RIGHT,t));settled=false;wake()}
function position(x){const r=window.portraitFrameRect(),u=Math.max(0,Math.min(1,(x-r.left)/r.width)),neutral=.73,dead=.025;
 if(Math.abs(u-neutral)<=dead)return CENTER;
 return u<neutral?LEFT+(CENTER-LEFT)*Math.min(1,u/(neutral-dead)):CENTER+(RIGHT-CENTER)*Math.min(1,(u-neutral-dead)/(1-neutral-dead));}
stage.addEventListener('pointermove',e=>{if(ready&&enabled)setTarget(position(e.clientX))});
stage.addEventListener('pointerdown',e=>{if(ready&&enabled)setTarget(position(e.clientX))});
stage.addEventListener('pointerleave',()=>{if(ready&&enabled)setTarget(CENTER)});
stage.addEventListener('keydown',e=>{if(!ready)return;if(['ArrowLeft','ArrowRight','Home'].includes(e.key)){e.preventDefault();setTarget(e.key==='Home'?CENTER:target+(e.key==='ArrowLeft'?-.15:.15))}});

buttons.forEach(button=>button.addEventListener('click',()=>{enabled=!enabled;if(!enabled)setTarget(video.currentTime);label()}));
video.addEventListener('loadeddata',()=>{video.pause();video.currentTime=CENTER;ready=true;buttons.forEach(b=>b.disabled=false);label()},{once:true});
video.addEventListener('seeked',()=>{if(ready)wake()});
video.addEventListener('error',()=>{ready=false;buttons.forEach(b=>b.disabled=true);hint.textContent='视频暂时无法读取，已保留静态画面。请刷新重试。'});
reduced.addEventListener('change',e=>{enabled=!e.matches;if(!enabled)setTarget(CENTER);label()});
document.addEventListener('visibilitychange',()=>{if(document.hidden){if(raf)cancelAnimationFrame(raf);raf=0;}else wake()});
window.motionState=()=>({ready,enabled,target,current:video.currentTime,seeking:video.seeking,settled,seekCount,videoWidth:video.videoWidth,videoHeight:video.videoHeight});

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
