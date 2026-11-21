/* V16 — on-scroll content reveals only; no page transitions. */
(()=>{if(!document.body.classList.contains('secondary-page'))return;
 const nodes=[...document.querySelectorAll('.section .card,.section .photo,.section .gallery button,.section .detail,.section .contact-panel,.section .split > div,.section .note')];
 const unique=[...new Set(nodes)].filter(el=>!nodes.some(parent=>parent!==el&&parent.contains(el)));
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(reduced||!('IntersectionObserver' in window))return;
 unique.forEach((el,i)=>{el.classList.add('v16-enter');el.dataset.v16Delay=String(i%4)});
 const observer=new IntersectionObserver(entries=>{for(const e of entries){if(e.isIntersecting){e.target.classList.add('v16-in');observer.unobserve(e.target)}}},{threshold:.08,rootMargin:'0px 0px -30px 0px'});
 unique.forEach(el=>observer.observe(el));
})();
