window.AET=window.AET||{};
(function(){
  'use strict';
  var ui=window.AET.ui,data=window.AET.data;
  function create(o){return data.addMatch({uid:o.uid,displayName:o.displayName,age:o.age,avatar:ui.initials(o.displayName)});}
  function render(){
    var list=document.getElementById('matchList');var empty=document.getElementById('matchesEmpty');
    if(!list)return;
    var ms=data.state.matches;
    if(!ms.length){list.innerHTML='';if(empty)empty.style.display='block';return;}
    if(empty)empty.style.display='none';
    list.innerHTML=ms.map(function(m){return '<div class="match-tile" data-mid="'+m.id+'"><div class="avatar">'+ui.escapeHtml(m.other.avatar||ui.initials(m.other.displayName))+'</div><div style="min-width:0"><div class="match-tile__name">'+ui.escapeHtml(m.other.displayName)+'</div><div class="match-tile__msg">'+ui.escapeHtml(m.lastMessage||'Nouvelle connexion')+'</div></div><div class="match-tile__time">'+ui.timeAgo(m.updatedAt)+(m.unread?' &middot; <strong style="color:var(--coral)">'+m.unread+'</strong>':'')+'</div></div>';}).join('');
    list.querySelectorAll('.match-tile').forEach(function(el){el.onclick=function(){
      if(window.AET.messages&&window.AET.messages.open)window.AET.messages.open(el.dataset.mid);
      document.querySelectorAll('[data-page]').forEach(function(x){x.classList.remove('is-active');});
      var mp=document.querySelector('[data-page="messages"]');if(mp)mp.classList.add('is-active');
      document.querySelectorAll('.page').forEach(function(p){p.classList.remove('is-active');});
      var pg=document.getElementById('page-messages');if(pg)pg.classList.add('is-active');
      var t=document.getElementById('pageTitle');if(t)t.textContent='Messages';
    };});
    var total=ms.reduce(function(s,m){return s+(m.unread||0);},0);
    var badge=document.getElementById('matchBadge');if(badge)badge.textContent=total||'0';
  }
  window.AET.matches={create:create,render:render};
})();