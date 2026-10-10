(()=>{const section=document.querySelector('.jr-study'),canvas=section.querySelector('.jr-canvas'),list=section.querySelector('.jr-word-list'),frame=section.querySelector('.jr-selector'),words=[...section.querySelectorAll('.jr-word')],reduce=matchMedia('(prefers-reduced-motion:reduce)');let index=0,visible=false,paused=reduce.matches,timer;
words.forEach(w=>{const span=document.createElement('span');span.textContent=w.textContent;w.replaceChildren(span)});
function fit(){section.style.setProperty('--jr-height',canvas.getBoundingClientRect().height+'px')}
function width(){frame.style.width=(words[index].firstChild.offsetWidth+52)+'px'}
function next(){if(!visible||paused||document.hidden)return;index++;list.style.transform=`translateY(${-words[0].offsetHeight*index}px)`;width();if(index===words.length-1)setTimeout(()=>{list.style.transition='none';index=0;list.style.transform='translateY(0)';requestAnimationFrame(()=>requestAnimationFrame(()=>list.style.transition=''))},420)}
function pauseState(){section.classList.toggle('paused',paused||!visible);const control=section.querySelector('.jr-pause');if(control){control.setAttribute('aria-pressed',String(paused));control.textContent=paused?'播放动态':'暂停动态'}}
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;pauseState()}).observe(section);
section.querySelector('.jr-pause')?.addEventListener('click',()=>{paused=!paused;pauseState()});reduce.addEventListener('change',()=>{paused=reduce.matches;pauseState()});
section.querySelectorAll('.jr-toggle').forEach(button=>button.addEventListener('click',()=>{const open=button.getAttribute('aria-expanded')!=='true',panel=document.getElementById(button.getAttribute('aria-controls'));button.setAttribute('aria-expanded',String(open));panel.inert=!open;panel.classList.toggle('open',open)}));
new ResizeObserver(fit).observe(canvas);window.addEventListener('resize',()=>{fit();width()});document.fonts.ready.then(()=>{fit();width();if(location.hash==='#chapter-study')section.scrollIntoView()});fit();width();timer=setInterval(next,2000);window.addEventListener('pagehide',()=>clearInterval(timer));
})();
