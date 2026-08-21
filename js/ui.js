window.AET=window.AET||{};
(function(){
  'use strict';
  function toast(t,k){var h=document.getElementById('toastHost')||(function(){var d=document.createElement('div');d.className='toast-host';d.id='toastHost';document.body.appendChild(d);return d;})();var e=document.createElement('div');e.className='toast '+(k||'');e.textContent=t;h.appendChild(e);setTimeout(function(){e.style.opacity='0';setTimeout(function(){e.remove();},300);},2400);}
  function esc(s){return String(s||'').replace(/[&<>"']/g,function(c){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c];});}
  function initials(t){return (t||'?').split(' ').map(function(x){return x[0];}).slice(0,2).join('').toUpperCase();}
  function timeAgo(ts){var d=typeof ts==='number'?ts:(ts&&ts.toDate?ts.toDate().getTime():Date.now());var s=Math.floor((Date.now()-d)/1000);if(s<60)return "a l instant";if(s<3600)return Math.floor(s/60)+' min';if(s<86400)return Math.floor(s/3600)+' h';return Math.floor(s/86400)+' j';}
  function modal(opts){
    var back=document.getElementById('modalBackdrop')||document.getElementById('adminModal');
    if(!back)return;
    var base=back.id==='adminModal'?document.getElementById('adminModalBase'):document.getElementById('modalBase');
    var content=back.id==='adminModal'?document.getElementById('adminModalContent'):document.getElementById('modalContent');
    back.classList.add('is-open');
    if(base)base.classList.toggle('modal-lg',!!opts.large);
    content.innerHTML=opts.html||'';
    if(opts.onMount)setTimeout(opts.onMount,0);
    function close(){back.classList.remove('is-open');content.innerHTML='';}
    var cb=back.querySelector('.modal__close');if(cb)cb.onclick=close;
    back.onclick=function(e){if(e.target===back)close();};
    function onkey(e){if(e.key==='Escape'){close();document.removeEventListener('keydown',onkey);}}
    document.addEventListener('keydown',onkey);
  }
  window.AET.ui={toast:toast,escapeHtml:esc,initials:initials,timeAgo:timeAgo,modal:modal};
})();