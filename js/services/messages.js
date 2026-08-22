window.AET=window.AET||{};
(function(){
  'use strict';
  var ui=window.AET.ui,data=window.AET.data;
  var current=null;
  function open(mid){current=mid;renderConvList();renderChat();}
  function renderConvList(){
    var host=document.getElementById('convList');if(!host)return;
    var ms=data.state.matches.slice().sort(function(a,b){return b.updatedAt-a.updatedAt;});
    var badge=document.getElementById('msgBadge');var total=ms.reduce(function(s,m){return s+(m.unread||0);},0);if(badge)badge.textContent=total||'0';
    host.innerHTML=ms.map(function(m){return '<div class="match-tile" data-mid="'+m.id+'" style="border-radius:0;border:none;border-bottom:1px solid var(--gray-200);'+(current===m.id?'background:var(--coral-soft);':'')+'"><div class="avatar">'+ui.escapeHtml(m.other.avatar||ui.initials(m.other.displayName))+'</div><div style="min-width:0"><div class="match-tile__name">'+ui.escapeHtml(m.other.displayName)+'</div><div class="match-tile__msg">'+ui.escapeHtml(m.lastMessage||'')+'</div></div><div class="match-tile__time">'+ui.timeAgo(m.updatedAt)+'</div></div>';}).join('')||'<div class="empty" style="padding:30px 20px"><div class="empty__icon">&#128172;</div><h3>Pas encore de conversation</h3></div>';
    host.querySelectorAll('[data-mid]').forEach(function(el){el.onclick=function(){open(el.dataset.mid);};});
  }
  function renderChat(){
    var pane=document.getElementById('chatPane');if(!pane)return;
    if(!current){pane.innerHTML='<div class="empty" style="margin:auto"><div class="empty__icon">&#128172;</div><h3>Selectionnez une conversation</h3></div>';return;}
    var match=data.state.matches.find(function(m){return m.id===current;});if(!match){pane.innerHTML='';return;}
    var ml=(data.state.messages.find(function(x){return x.matchId===current;})||{messages:[]}).messages;
    match.unread=0;
    var msgs=ml.map(function(m){return '<div class="msg'+(m.fromMe?' me':'')+'">'+ui.escapeHtml(m.text)+'<span class="time">'+ui.timeAgo(m.ts)+'</span></div>';}).join('')||'<div class="empty" style="margin:auto"><div class="empty__icon">&#128172;</div><h3>Dites bonjour !</h3></div>';
    pane.innerHTML='<div class="chat__head"><div class="avatar">'+ui.escapeHtml(match.other.avatar||ui.initials(match.other.displayName))+'</div><div style="flex:1"><div style="font-weight:700">'+ui.escapeHtml(match.other.displayName)+'</div><div style="font-size:12px;color:var(--gray-600)">En ligne</div></div><button class="btn btn-secondary btn-sm" id="chatMenuBtn" type="button">&#8942;</button></div><div class="chat__msgs" id="chatMsgs">'+msgs+'</div><form class="chat__compose" id="chatForm"><input id="chatInput" type="text" placeholder="Votre message..." autocomplete="off"/><button class="btn btn-primary" type="submit">Envoyer</button></form>';
    var form=document.getElementById('chatForm');var ms=document.getElementById('chatMsgs');
    if(ms)ms.scrollTop=ms.scrollHeight;
    if(form)form.onsubmit=function(e){e.preventDefault();var inp=document.getElementById('chatInput');var v=inp.value.trim();if(!v)return;data.addMessage(current,v,true);renderChat();renderConvList();setTimeout(function(){data.addMessage(current,'Bien recu !',false);renderChat();renderConvList();},900);};
    var menuBtn=document.getElementById('chatMenuBtn');
    if(menuBtn)menuBtn.onclick=function(){
      ui.modal({html:'<h3>'+ui.escapeHtml(match.other.displayName)+'</h3><div class="modal-actions" style="flex-direction:column;gap:8px"><button class="btn btn-secondary btn-full" id="blockUserBtn">Bloquer cette personne</button><button class="btn btn-secondary btn-full" id="reportUserBtn">Signaler cette personne</button><button class="btn btn-danger btn-full" id="deleteConvBtn">Supprimer la conversation</button></div>',
        onMount:function(){
          var bb=document.getElementById('blockUserBtn');if(bb)bb.onclick=function(){data.blockUser(match.other.uid);ui.toast(match.other.displayName+' a ete bloque(e)','error');var mc=document.getElementById('modalClose');if(mc)mc.click();current=null;data.state.matches=data.state.matches.filter(function(m){return m.id!==match.id;});data.save();renderConvList();renderChat();};
          var rb=document.getElementById('reportUserBtn');if(rb)rb.onclick=function(){data.state.reports.unshift({type:'utilisateur',target:match.other.displayName,reason:'Signale depuis la messagerie',status:'open',ts:Date.now()});data.save();ui.toast('Signalement envoye a la moderation','success');var mc=document.getElementById('modalClose');if(mc)mc.click();};
          var db2=document.getElementById('deleteConvBtn');if(db2)db2.onclick=function(){data.state.matches=data.state.matches.filter(function(m){return m.id!==match.id;});data.save();current=null;ui.toast('Conversation supprimee','error');var mc=document.getElementById('modalClose');if(mc)mc.click();renderConvList();renderChat();};
        }});
    };
  }
  window.AET.messages={open:open,renderConvList:renderConvList,renderChat:renderChat};
})();