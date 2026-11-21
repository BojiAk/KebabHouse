// Keep the page usable offline if an external licensed stock image cannot load.
document.querySelectorAll('img[data-local-fallback]').forEach(img=>{img.addEventListener('error',()=>{if(img.dataset.fallbackUsed)return;img.dataset.fallbackUsed='1';img.src=img.dataset.localFallback;});});
