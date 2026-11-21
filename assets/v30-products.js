(()=>{'use strict';
const modal=document.getElementById('product-modal');if(!modal)return;
const products=[
{title:'KEBAB',image:'assets/kebab-real.png',fallback:'assets/kebab-real.png',description:'Kebab servit cu ingrediente proaspete. Compoziția exactă va fi introdusă după confirmarea meniului.'},
{title:'PIZZA',image:'assets/pizza-real.png',fallback:'assets/pizza-real.png',description:'Pizza — fotografiile sunt orientative; sortimentele și ingredientele vor fi confirmate.'},
{title:'PREPARATE LA GRĂTAR',image:'https://images.pexels.com/photos/28902905/pexels-photo-28902905.jpeg?auto=compress&cs=tinysrgb&w=1100',fallback:'assets/grill.jpg',description:'Preparate la grătar. Detaliile și gramajele vor fi completate din meniul oficial.'}
];
let previous=null;const panel=modal.querySelector('.product-modal-panel');
function openProduct(i){const item=products[i];if(!item)return;previous=document.activeElement;
modal.querySelector('#product-modal-title').textContent=item.title;
const img=modal.querySelector('#product-modal-image');img.onerror=()=>{img.onerror=null;img.src=item.fallback};img.src=item.image;img.alt='Fotografie ilustrativă: '+item.title;
modal.querySelector('#product-modal-description').textContent=item.description;
modal.hidden=false;document.body.classList.add('v30-modal-open');panel.focus({preventScroll:true});}
function closeProduct(){modal.hidden=true;document.body.classList.remove('v30-modal-open');previous?.focus?.({preventScroll:true});}
// Event delegation works for taps and clicks; avoid double firing on mobile.
document.addEventListener('click',e=>{const trigger=e.target.closest('[data-product-trigger]');if(trigger){e.preventDefault();openProduct(Number(trigger.closest('[data-product]').dataset.product));return;}
if(e.target.closest('[data-close-product]'))closeProduct();});
document.addEventListener('keydown',e=>{if(modal.hidden)return;if(e.key==='Escape'){closeProduct();return;}if(e.key==='Tab'){const nodes=[...modal.querySelectorAll('button,a[href]')].filter(x=>x.getClientRects().length);if(!nodes.length)return;const first=nodes[0],last=nodes[nodes.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
})();