window.AET=window.AET||{};
(function(){
  'use strict';
  var ui=window.AET.ui,data=window.AET.data,matches=window.AET.matches||{};
  function render(){
    var list=document.getElementById('discoverList');if(!list)return;
    var pool=data.state.pool;if(!pool.length){list.innerHTML='<div class="empty"><div class="empty__icon">&#128269;</div><h3>Plus de profils</h3></div>';return;}
    var u=pool[Math.floor(Math.random()*pool.length)];
    var tags=(u.interests||[]).map(function(t){return '<span class="badge">'+ui.escapeHtml(t)+'</span>';}).join('');
    list.innerHTML='<article class="swipe-card"><div class="swipe-card__media"><span class="swipe-card__chip">'+ui.escapeHtml(u.city||'Lieu')+'</span><span>'+ui.escapeHtml(ui.initials(u.displayName))+'</span>'+(u.isOnline?'<span class="swipe-card__chip online">En ligne</span>':'')+'</div><div class="swipe-card__body"><div class="swipe-card__name">'+ui.escapeHtml(u.displayName)+' <span class="age">'+u.age+'</span></div><div class="swipe-card__meta">'+(u.isVerified?'&#9989; Verifie':'')+' &middot; '+ui.escapeHtml(u.bio||'')+'</div><div class="swipe-card__tags">'+tags+'</div></div><div class="swipe-actions"><button class="btn-circle" data-action="pass">&#10006;</button><button class="btn-circle primary" data-action="like">&#10084;</button><button class="btn-circle success" data-action="super">&#11088;</button></div></article>';
    list.querySelectorAll('[data-action]').forEach(function(b){b.onclick=function(){
      var a=b.dataset.action;
      if((a==='like'||a==='super')&&matches.create){matches.create(u);if(a==='super')ui.toast('Super like envoye !','success');if(window.AET.app&&window.AET.app.celebrateMatch)window.AET.app.celebrateMatch(u);}
      else ui.toast('Profil passe','');
      setTimeout(render,300);
    };});
  }
  window.AET.discovery={render:render};
})();