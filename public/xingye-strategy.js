(()=>{
document.querySelectorAll('.xy-case').forEach(card=>{
const toggle=card.querySelector('.jr-toggle'),label=toggle?.querySelector('.xy-toggle-label');
if(!toggle||!label)return;
toggle.addEventListener('click',()=>{label.textContent=toggle.getAttribute('aria-expanded')==='true'?(label.dataset.expandedLabel||'收起核心策略'):(label.dataset.collapsedLabel||'查看核心策略')});
card.querySelector('.xy-collapse')?.addEventListener('click',()=>{if(toggle.getAttribute('aria-expanded')==='true')toggle.click();toggle.scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'});toggle.focus({preventScroll:true})});
});
})();
