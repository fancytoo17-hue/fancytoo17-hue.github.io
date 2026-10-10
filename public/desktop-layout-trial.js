(()=>{const root=document.documentElement,fit=document.querySelector('.viewport-fit'),board=document.querySelector('.artboard'),nav=document.querySelector('.fixed-nav'),overview=document.querySelector('.overview-reference');function syncOverviewHeight(){if(overview)root.style.setProperty('--overview-height',overview.getBoundingClientRect().height+'px')}function tone(){const white=fit.getBoundingClientRect().bottom<=nav.getBoundingClientRect().height;white?delete root.dataset.navColor:root.dataset.navColor='refined';nav.classList.toggle('is-past-hero',white)}function resize(){
 const width=root.clientWidth;
 const scale=Math.min(width*.84,1280)/(1096*1.45);
 const heroScale=scale;
 const heroHeight=1094*heroScale;
 root.style.setProperty('--page-scale',scale);
 root.style.setProperty('--page-width',1740*scale+'px');
 root.style.setProperty('--scaled-nav',102*scale+'px');
 root.style.setProperty('--trial-content-scale',scale*1.45);
 root.style.setProperty('--hero-background-width',width/scale+'px');
 root.style.setProperty('--hero-background-offset',(1740-width/scale)/2+'px');
 fit.style.width=width+'px';fit.style.height=heroHeight+'px';
 // Preserve the approved 1740 x 1094 composition as one scaled unit.
 board.style.left=(width-1740*scale)/2+'px';
 board.style.transform=`scale(${scale})`;
 board.dataset.scale=String(scale);
 const copy=document.querySelector('.hero-copy');
 copy.style.removeProperty('left');copy.style.removeProperty('top');
 copy.style.removeProperty('transform');copy.style.removeProperty('transform-origin');
 nav.style.width=width+'px';
 syncOverviewHeight();tone();
}resize();if(overview)new ResizeObserver(syncOverviewHeight).observe(overview);document.fonts.ready.then(resize);window.addEventListener('resize',resize);window.addEventListener('scroll',tone,{passive:true});const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}}),{threshold:.15});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));})();