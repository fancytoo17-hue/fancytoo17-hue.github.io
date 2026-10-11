/* Selected enterprise detail: adjusted column spacing and larger previews. */
(() => {
  const root = document.querySelector('.writing-reference');
  const detail = document.querySelector('#enterprise-motion-detail');
  if (!root || !detail) return;
  const frame = document.createElement('iframe');
  frame.title = '企业叙事 · 作品与撰稿思路';
  detail.replaceChildren(frame);
  root.dataset.comparisonLayout = 'spacing';
  let firstLoad = true;
  frame.addEventListener('load', () => {
    const doc = frame.contentDocument;
    // Guard iframe links as well as parent hit-testing on mobile browsers.
    doc?.addEventListener('click', event => {
      if(root.dataset.view !== 'enterprise' || detail.getAttribute('aria-hidden') !== 'false'){
        event.preventDefault();event.stopImmediatePropagation();
      }
    },true);
    let pointerStart = null;
    doc?.addEventListener('pointerdown', event => {
      pointerStart = { x: event.clientX, y: event.clientY };
    });
    doc?.addEventListener('click', event => {
      if (event.button !== 0 || root.dataset.view !== 'enterprise') return;
      if (event.target.closest('a,button,input,textarea,select,[contenteditable]')) return;
      if (doc.getSelection()?.toString().trim()) return;
      if (pointerStart && Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y) > 6) return;
      root.dispatchEvent(new Event('enterprise-return'));
    });
    // Escape returns to the overview even when keyboard focus is inside the iframe.
    frame.contentDocument?.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        root.querySelectorAll('.tab-button')[0].click();
        root.querySelectorAll('.tab-button')[0].focus({ preventScroll: true });
      }
    });
    if (firstLoad) {
      firstLoad = false;
      const scene = new URLSearchParams(location.search).get('scene');
      const sceneTab = {enterprise:1,video:2,culture:3,knowledge:4};
      if (Object.prototype.hasOwnProperty.call(sceneTab, scene)) {
        root.querySelectorAll('.tab-button')[sceneTab[scene]].click();
        if (!location.hash) document.querySelector('#chapter-3').scrollIntoView({ block: 'start' });
      }
    }
  });
  frame.src = 'stripe-newsroom-spacing-trial.html?v=20261004';
})();
