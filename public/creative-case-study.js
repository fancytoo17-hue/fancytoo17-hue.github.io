(()=>{
document.querySelectorAll('.c2-study').forEach(section=>{
const canvas=section.querySelector('.c2-canvas');
// Match chapter one's 2-second cycle, 400ms slide and content-width corners.
const heading=section.querySelector('.jr-heading'),list=heading.querySelector('.jr-word-list'),frame=heading.querySelector('.jr-selector'),words=[...heading.querySelectorAll('.jr-word')],reduce=matchMedia('(prefers-reduced-motion:reduce)');
let index=0,visible=false;
words.forEach(word=>{const span=document.createElement('span');span.textContent=word.textContent;word.replaceChildren(span)});
function headingWidth(){frame.style.width=(words[index].firstChild.offsetWidth+52)+'px'}
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting}).observe(heading);
const timer=setInterval(()=>{
  if(!visible||reduce.matches||document.hidden)return;
  index++;list.style.transform=`translateY(${-words[0].offsetHeight*index}px)`;headingWidth();
  if(index===words.length-1)setTimeout(()=>{list.style.transition='none';index=0;list.style.transform='translateY(0)';requestAnimationFrame(()=>requestAnimationFrame(()=>list.style.transition=''))},420);
},2000);
window.addEventListener('resize',headingWidth);document.fonts.ready.then(headingWidth);headingWidth();
window.addEventListener('pagehide',()=>clearInterval(timer));

function fit(){section.style.setProperty('--c2-height',`${canvas.getBoundingClientRect().height}px`)}
section.querySelectorAll('.c2-toggle').forEach(toggle=>{
const panel=document.getElementById(toggle.getAttribute('aria-controls'));
toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));panel.inert=!open;panel.classList.toggle('open',open);toggle.querySelector('span').textContent=open?'收起方案详情':'展开查看方案详情'});
});
new ResizeObserver(fit).observe(canvas);window.addEventListener('resize',fit);document.fonts.ready.then(()=>{fit();if(location.hash===`#${section.id}`)section.scrollIntoView()});fit();
});
})();
