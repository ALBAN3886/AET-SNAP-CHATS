window.AET=window.AET||{};
(function(){
  'use strict';
  var ui=window.AET.ui,data=window.AET.data;
  function render(cat){
    var host=document.getElementById('newsGrid');var filters=document.getElementById('newsFilters');if(!host)return;
    var cats=['Toutes'].concat(Array.from(new Set(data.state.news.map(function(n){return n.category;}))));
    if(filters){filters.innerHTML=cats.map(function(c){return '<button class="btn '+(((!cat||cat==='Toutes')&&c==='Toutes')||cat===c?'btn-primary':'btn-secondary')+' btn-sm" data-cat="'+ui.escapeHtml(c)+'">'+ui.escapeHtml(c)+'</button>';}).join('');filters.querySelectorAll('[data-cat]').forEach(function(b){b.onclick=function(){render(b.dataset.cat);};});}
    var list=(!cat||cat==='Toutes')?data.state.news:data.state.news.filter(function(n){return n.category===cat;});
    host.innerHTML=list.map(function(n){return '<article class="news-card"><div class="news-card__img">'+ui.escapeHtml(n.icon||'A')+'</div><div class="news-card__body"><div class="news-card__cat">'+ui.escapeHtml(n.category)+'</div><div class="news-card__title">'+ui.escapeHtml(n.title)+'</div><div class="news-card__excerpt">'+ui.escapeHtml(n.excerpt||'')+'</div><div class="news-card__meta"><span>AET Editorial</span><span>'+ui.timeAgo(Date.now()-Math.random()*4.32e7)+'</span></div></div></article>';}).join('')||'<div class="empty"><div class="empty__icon">&#128240;</div><h3>Aucun article</h3></div>';
  }
  window.AET.news={render:render};
})();