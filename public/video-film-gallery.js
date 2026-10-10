/* Original M5 films: click each frame to play or pause in place. */
(()=>{
  const detail=document.querySelector('#video-motion-detail');
  const films=window.portfolioVideoFilms;
  if(!detail||!films?.length)return;
  detail.querySelector('.scene-detail-art')?.remove();
  detail.dataset.contentStatus='four-original-films';
  const deck=document.createElement('div');
  deck.className='video-film-deck';
  deck.setAttribute('role','group');deck.setAttribute('aria-label','四个视频作品');
  const lettering=document.createElement('div');lettering.className='video-film-lettering';
  lettering.setAttribute('aria-hidden','true');
  lettering.innerHTML='<span>VIDEO</span><span>WORKS</span>';
  deck.append(lettering);
  const entries=[];
  const playIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5 19 12 8 18.5Z" fill="currentColor"/></svg>';
  function render(entry){
    entry.card.classList.toggle('is-playing',entry.wanted);
    entry.card.setAttribute('aria-label',(entry.wanted?'暂停：':'播放：')+entry.film.title);
    entry.card.setAttribute('aria-pressed',String(entry.wanted));
  }
  function stop(entry){entry.request++;entry.wanted=false;entry.video.pause();render(entry)}
  function stopAll(){entries.forEach(stop)}
  films.forEach(film=>{
    const card=document.createElement('button');card.type='button';card.className='video-film';
    const video=document.createElement('video');video.poster=film.poster;video.preload='none';
    video.playsInline=true;video.setAttribute('aria-hidden','true');video.tabIndex=-1;
    const play=document.createElement('span');play.className='video-film-play';play.innerHTML=playIcon;
    const error=document.createElement('span');error.className='video-film-error';error.hidden=true;
    error.setAttribute('role','status');error.textContent='暂时无法播放，点击重试';
    const entry={film,card,video,wanted:false,request:0};entries.push(entry);render(entry);
    card.append(video,play,error);
    card.addEventListener('click',e=>{
      e.stopPropagation();
      if(entry.wanted){stop(entry);return}
      entries.forEach(other=>{if(other!==entry)stop(other)});
      error.hidden=true;
      if(!video.hasAttribute('src'))video.src=film.src;
      if(video.ended)video.currentTime=0;
      entry.wanted=true;const request=++entry.request;render(entry);
      video.play().catch(err=>{
        if(request!==entry.request)return;
        stop(entry);
        if(err.name!=='AbortError')error.hidden=false;
      });
    });
    video.addEventListener('playing',()=>{if(!entry.wanted)video.pause()});
    video.addEventListener('pause',()=>{if(video.paused){entry.wanted=false;render(entry)}});
    video.addEventListener('ended',()=>stop(entry));
    video.addEventListener('error',()=>{stop(entry);error.hidden=false});
    deck.append(card);
  });
  detail.append(deck);
  // Stop immediately when a chapter transition starts, including return to overview.
  const root=detail.closest('.writing-reference');
  new MutationObserver(()=>{if(root.dataset.view!=='video')stopAll()})
    .observe(root,{attributes:true,attributeFilter:['data-view']});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stopAll()});
  window.addEventListener('pagehide',stopAll);
})();
