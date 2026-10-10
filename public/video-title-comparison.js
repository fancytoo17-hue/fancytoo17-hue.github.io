/* Shared carousel headings for the four chapter details. */
(() => {
  const root = document.querySelector('.writing-reference');
  if (!root) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const instances = [];
  function createCarousel(header, scene, slides) {
    const doc = header.ownerDocument;
    const heading = doc.createElement('h2'); heading.className = 'islands-title';
    const rows = slides[0].map(() => {
      const row = doc.createElement('div'); row.className = 'islands-title-row';
      row.setAttribute('aria-hidden', 'true'); heading.append(row); return row;
    });
    let inView = false, timer, index = 0, singleActive = false;
    const animations = new Set();
  function animate(element, frames, options) {
    const animation = element.animate(frames, { fill: 'both', easing: 'ease-out', ...options });
    animations.add(animation);
    animation.finished.then(() => animations.delete(animation), () => animations.delete(animation));
    return animation;
  }
  function cancel() {
    clearInterval(timer); timer = undefined;
    animations.forEach(animation => animation.cancel()); animations.clear();
  }
  function layer(text, offset, entering) {
    const result = document.createElement('span'); result.className = 'islands-title-layer';
    let characterIndex = offset;
    text.split(' ').forEach((word, wordIndex, words) => {
      const wordElement = document.createElement('span'); wordElement.className = 'islands-title-word';
      for (const character of word) {
        const char = document.createElement('span'); char.className = 'islands-title-char';
        char.textContent = character; char.dataset.order = characterIndex++;
        wordElement.append(char);
        if (entering) {
          const durationOffset = (.05 * characterIndex) ** 2;
          const delay = 500 + Number(char.dataset.order) * 40;
          animate(char, [{ opacity: 0 }, { opacity: 1 }], { delay, duration: 750 + durationOffset * 1000 });
          animate(char, [
            { scale: '1 .92', rotate: '2deg' },
            { scale: '1 1', rotate: '0deg' },
          ], { delay, duration: 300 });
          animate(char, [{ transform: 'skewX(-2deg)' }, { transform: 'skewX(0deg)' }],
            { delay, duration: 300 + durationOffset * 1000 });
        }
      }
      if (wordIndex < words.length - 1) wordElement.append('\u00a0');
      result.append(wordElement);
    });
    return result;
  }
  function render(transition = false, entering = transition) {
    heading.setAttribute('aria-label', slides[index].join(' '));
    heading.dataset.slide = index;
    rows.forEach((row, i) => {
      if (transition) {
        const old = row.lastElementChild;
        if (old) {
          const fades = [...old.querySelectorAll('.islands-title-char')].map(char =>
            animate(char, [{ opacity: getComputedStyle(char).opacity }, { opacity: 0 }],
              { delay: Number(char.dataset.order) * 40, duration: 350 }).finished.catch(() => {}));
          Promise.all(fades).then(() => old.remove());
        }
      } else row.replaceChildren();
      row.append(layer(slides[index][i], i ? Math.round(slides[index][0].length * .25) : 0, entering));
    });
  }

    function sync() {
      if (slides.length === 1) {
        const active = inView && !document.hidden && root.dataset.view === scene;
        if (active === singleActive && heading.childElementCount && rows[0].childElementCount) return;
        singleActive = active;
        cancel(); render(false, active && !reduced.matches);
        return;
      }
      cancel(); render();
      if (!reduced.matches && inView && !document.hidden && root.dataset.view === scene) {
        timer = setInterval(() => { index = (index + 1) % slides.length; render(true); }, 3750);
      }
    }
    header.classList.add('is-islands-title');
    if (scene === 'enterprise') header.style.height = '';
    header.replaceChildren(heading);
    new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; sync(); }).observe(header);
    const instance = {sync, cancel}; instances.push(instance); sync();
    return instance;
  }
  function syncAll() { instances.forEach(instance => instance.sync()); }
  new MutationObserver(syncAll).observe(root, {attributes:true, attributeFilter:['data-view']});
  document.addEventListener('visibilitychange', syncAll);
  reduced.addEventListener('change', syncAll);
  window.addEventListener('pagehide', () => instances.forEach(instance => instance.cancel()));
  const videoHeader = document.querySelector('#video-motion-detail .scene-detail-header');
  if (videoHeader) createCarousel(videoHeader, 'video', [
    ['雅诗兰黛白金系列', '千川信息流视频创作'],
    ['ABCDs脚本公式', 'AI辅助提升创作效率'],
  ]);
  for (const scene of ['culture', 'knowledge']) {
    const header = document.querySelector(`#${scene}-motion-detail .scene-detail-header`);
    if (header) createCarousel(header, scene, scene === 'culture' ? [
      ['7万粉公众号专栏供稿', '用电影故事照见我们的生活'],
      ['情绪识别 · 热点捕捉', '将故事冲突关联到热门议题'],
      ['一手采访 · 多元观点', '用真实人物校准抽象判断'],
      ['文化转译 · 选题重构', '让旧文化回应当代情绪'],
    ] : [
      ['翻译作品两次刊载于', '中宣部主管的国家级电影期刊'],
    ]);
  }
  const frame = document.querySelector('#enterprise-motion-detail iframe');
  function mountEnterprise() {
    const doc = frame?.contentDocument;
    const header = doc?.querySelector('.Copy.variant--Section');
    if (!header || header.dataset.carouselMounted) return;
    header.dataset.carouselMounted = 'true';
    const css = doc.createElement('link'); css.rel = 'stylesheet'; css.href = 'video-title-comparison.css';
    const style = doc.createElement('style');
    style.textContent = `
      :root { --reference-type-unit:var(--enterprise-type-unit); --serif:'Noto Serif SC','Songti SC',serif; }
      .Copy.is-islands-title { position:relative; display:block; margin-bottom:32px; }
      .Copy.is-islands-title > .islands-title { position:relative; margin:0; padding:0 var(--headerPaddingRight) 0 var(--headerPaddingLeft); }
    `;
    doc.head.append(css, style);
    createCarousel(header, 'enterprise', [
      ['从定位开始全面重构', '改版后账号单季度涨粉42%'],
      ['围绕业务搭建内容矩阵', '让每个选题都为生意铺路'],
    ]);
    syncAll();
  }
  frame?.addEventListener('load', mountEnterprise);
  mountEnterprise();
  syncAll();
})();
