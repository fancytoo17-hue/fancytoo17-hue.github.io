/* Approved chapter layout and IKEA image selection, 2026-10-09. */
(() => {
  const section = document.querySelector('#creative-study');
  if (!section) return;
  const url = new URL(location.href);
  if (url.searchParams.has('c2Layout') || url.searchParams.has('c2Images')) {
    url.searchParams.delete('c2Layout'); url.searchParams.delete('c2Images');
    history.replaceState(history.state, '', url);
  }
  const wayne = section.querySelector('.c2-wayne');
  const ikea = section.querySelector('.c2-ikea');
  const wayneIntro = [...wayne.querySelectorAll('.xy-intro')].map(p=>p.textContent);
  const wayneDetail = wayne.querySelector('.c2-detail-copy').textContent;
  const ikeaIntro = ikea.querySelector('.xy-intro').textContent;
  const cases = [
    {id:'wayne',project:wayne.querySelector('.xy-project').textContent,
     title:'从一张鹿皮里，找到外国品牌的东方表达',
     takeaway:'以品牌方对文化融合的顾虑作为突破口，帮助故宫IP在一众传统文化IP中成为最合适的联名合作之选',
     paragraphs:[...wayneIntro,wayneDetail],folder:'wayne-trial',source:'073',
     pages:[10,9,19,6,23,24]},
    {id:'ikea',project:ikea.querySelector('.xy-project').textContent,
     title:'在文物中找到开启“模拟人生”的钥匙',
     takeaway:'将文物中的生活在现代复现，让宜家的玩耍理念落地成可全龄参与的“模拟人生”体验。',
     paragraphs:[ikeaIntro,'沿着这条线索，馆藏筛选也有了明确方向。我以宫廷闲趣生活为切入口，最终选出《胤禛行乐图册》《月曼清游图册》《千春燕喜·百花献寿》等自带人物行动和游玩可能的馆藏画卷。','这些文物中的古人身份、游乐场景与戏剧演出，变成游客角色、游园任务与光影剧场，以「逛宫园 过春天」为题，组成了一套可全龄参与的“模拟人生”体验。任务奖励与衍生品零售共同收在旅程末端，让游客动线在情绪高点通向消费环节。'],
     folder:'ikea-comparison',source:'074',pages:[8,21,19,14,16,17]}
  ];
  section.classList.add('c2-comparison');
  const escape = value => value.replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const highlights = ['在与本土品牌的竞争中存在文化融入劣势','接受故宫IP方委托','核心原料——「鹿皮」','“福鹿授喜·巳时而麗”','系列主题延续原方案创意方向','玩耍属于孩子，也属于成人','以宫廷闲趣生活为切入口','游客角色、游园任务与光影剧场','可全龄参与的“模拟人生”体验','任务奖励与衍生品零售'];
  function renderParagraph(text) {
    text=text.replace('但总感觉与本土文化的融合方面还差些火候','但依然有感在与本土品牌的竞争中存在文化融入劣势');
    let html=escape(text);
    for(const phrase of highlights) html=html.replace(escape(phrase),`<span class="xy-keyphrase">${escape(phrase)}</span>`);
    return html;
  }
  for(const item of cases){
    const article=document.createElement('article');article.className='c2-compare-card';article.id=item.id+'-case';article.setAttribute('aria-labelledby',item.id+'-title');
    const imgs=item.pages.map(n=>`<img src="assets/${item.folder}/${item.id==='ikea'&&n===14?'IKEA-2025':'SRC-'+item.source}-p${String(n).padStart(3,'0')}.jpg" alt="" decoding="async">`).join('');
    article.innerHTML=`<div class="c2-cover-collage c2-compare-cover ${item.id}-cover" role="img" aria-label="${escape(item.project)}，完整方案页组合"><div class="c2-sheet-grid">${imgs}</div></div>
      <details class="c2-compare-details"><summary class="c2-compare-summary">
      <span class="c2-compare-project">${escape(item.project)}</span>
      <h3 id="${item.id}-title">${escape(item.title)}</h3>
      <p class="c2-takeaway">${escape(item.takeaway)}</p>
      <span class="c2-compare-prompt">展开查看方案详情</span>
      <svg class="c2-compare-chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m5 9 7 7 7-7"/></svg>
      </summary><div class="c2-compare-prose">${item.paragraphs.map(p=>`<p>${renderParagraph(p)}</p>`).join('')}</div></details>`;
    (item.id==='wayne'?wayne:ikea).replaceWith(article);
    const details=article.querySelector('details');
    details.addEventListener('toggle',()=>{article.querySelector('.c2-compare-prompt').textContent=details.open?'收起方案详情':'展开查看方案详情'});
  }
})();
