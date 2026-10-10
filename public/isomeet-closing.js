/* Isomeet live-source study, 2026-10-08. Original CTA motion parameters. */
(() => {
  const root = document.querySelector('#portfolio-closing');
  if (!root) return;
  const fit = document.createElement('div');
  fit.className = 'portfolio-closing-fit';
  root.before(fit);fit.append(root);
  function syncHeight() {
    const scale = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--page-scale')) || 1;
    fit.style.setProperty('--closing-height', `${root.offsetHeight * scale}px`);
  }
  new ResizeObserver(syncHeight).observe(root);
  window.addEventListener('resize', syncHeight);
  document.fonts.ready.then(syncHeight);
  syncHeight();
  const bg = root.querySelector('.bottom-cta-bg-w');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(any-hover: hover) and (any-pointer: fine)');
  const ranges = [[30,-30,-20,20],[20,40,20,-20],[10,-20,10,-20],[-20,20,-10,20],[-20,30,30,-30],[30,-20,-20,20]];
  const cards = ranges.map((r,i) => ({el:root.querySelector(`.bottom-cta-bg-img-${i+1}`),r}));
  let visible=false, entered=false, raf=0, last=0, x=.5,y=.5,tx=.5,ty=.5;
  function frame(now) {
    raf=0;
    if (!visible || reduced.matches || !desktop.matches) return;
    const alpha=1-Math.pow(.9,Math.min(64,now-(last||now-16.67))/16.67);last=now;
    x+=(tx-x)*alpha;y+=(ty-y)*alpha;
    cards.forEach(({el,r})=>el.style.translate=`${r[0]+(r[1]-r[0])*x}% ${r[2]+(r[3]-r[2])*y}%`);
    if(Math.abs(tx-x)+Math.abs(ty-y)>.0001) raf=requestAnimationFrame(frame);
  }
  function request(){if(!raf){last=0;raf=requestAnimationFrame(frame);}}
  window.addEventListener('pointermove',e=>{tx=e.clientX/innerWidth;ty=e.clientY/innerHeight;request();},{passive:true});
  document.documentElement.addEventListener('pointerleave',()=>{tx=ty=.5;request();});
  function reset(){cards.forEach(({el})=>el.style.translate='');request();}
  desktop.addEventListener('change',reset);reduced.addEventListener('change',reset);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)request();},{rootMargin:'100px'}).observe(root);
  // Decode photos before revealing them: slow CDN loads must not consume the entrance.
  const photos = [...bg.querySelectorAll('img')];
  let entranceReady = false, inEntranceView = false, entranceAnimation;
  bg.style.opacity = reduced.matches ? '1' : '0';
  const photosReady = Promise.all(photos.map(img => {
    img.loading = 'eager';
    return img.decode().catch(() => {});
  }));
  function reveal() {
    if (!entranceReady || !inEntranceView || entered) return;
    entered = true;
    bg.style.opacity = '1';
    if (!reduced.matches) entranceAnimation = bg.animate(
      [{opacity:0,transform:'scale(1.25)'},{opacity:1,transform:'scale(1)'}],
      {duration:1000,easing:'cubic-bezier(.165,.84,.44,1)'}
    );
  }
  photosReady.then(() => { entranceReady = true; reveal(); });
  let entranceObserver;
  function observeEntrance() {
    entranceObserver?.disconnect();
    // IntersectionObserver percentage margins are relative to width; use viewport-height pixels.
    entranceObserver = new IntersectionObserver(entries => {
      inEntranceView = entries[0].isIntersecting;
      reveal();
    }, {rootMargin:`0px 0px -${innerHeight * .2}px 0px`});
    entranceObserver.observe(bg);
  }
  observeEntrance();
  window.addEventListener('resize', observeEntrance);
  reduced.addEventListener('change', () => {
    if (reduced.matches) { entranceAnimation?.cancel(); bg.style.opacity = '1'; }
  });
  const contact = root.querySelector('.closing-contact');
  const copyButton = contact.querySelector('.closing-hello');
  const copyStatus = contact.querySelector('.closing-contact-announcement');
  const copyResult = contact.querySelector('.closing-contact-result');
  const phone = '13121664213';
  const contactText = `手机（微信同号）：${phone}`;
  let copyTimer, copying = false;
  function legacyCopy() {
    const field = document.createElement('textarea');
    field.value = phone;
    field.readOnly = true;
    field.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
    document.body.append(field);
    field.select(); field.setSelectionRange(0, phone.length);
    let copied = false;
    try { copied = document.execCommand('copy'); }
    finally { field.remove(); copyButton.focus({preventScroll:true}); }
    return copied;
  }
  copyButton.addEventListener('click', async () => {
    if (copying) return;
    copying = true;
    clearTimeout(copyTimer);
    let copied = false;
    try {
      if (navigator.clipboard?.writeText) {
        try { await navigator.clipboard.writeText(phone); copied = true; }
        catch { copied = legacyCopy(); }
      } else { copied = legacyCopy(); }
    } catch { copied = false; }
    finally { copying = false; }
    contact.dataset.copyState = copied ? 'success' : 'error';
    copyStatus.textContent = copied ? '已复制手机号' : `复制未成功，请手动复制：${phone}`;
    copyResult.textContent = copyStatus.textContent;
    if (copied) copyTimer = setTimeout(() => {
      delete contact.dataset.copyState;
      copyStatus.textContent = contactText;
    }, 3000);
  });
})();
