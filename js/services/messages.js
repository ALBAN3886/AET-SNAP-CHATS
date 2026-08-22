window.AET=window.AET||{};
(function(){
  'use strict';
  var ui=window.AET.ui,data=window.AET.data;
  var current=null;
  var realMatches=[];
  var realMatchesLoaded=false;
  var unsubscribe=null;

  function setRealMatches(list){realMatches=list||[];realMatchesLoaded=true;if(current){var stillThere=realMatches.some(function(m){return m.id===current;});if(!stillThere){current=null;if(unsubscribe){unsubscribe();unsubscribe=null;}renderChat();}}}

  function isFirebaseMode(){var auth=window.AET.auth;return auth&&auth.isFirebaseActive();}

  function getMatchList(){return isFirebaseMode()?realMatches:data.state.matches;}

  function open(mid){
    current=mid;
    if(unsubscribe){unsubscribe();unsubscribe=null;}
    renderConvList();renderChat();
  }

  function renderConvList(){
    var host=document.getElementById('convList');if(!host)return;
    if(isFirebaseMode()&&!realMatchesLoaded&&window.AET.matches){
      window.AET.matches.loadRealMatches().then(function(real){setRealMatches(real);renderConvList();});
      host.innerHTML='<div class="empty" style="padding:30px 20px"><div class="empty__icon">&#8987;</div><h3>Chargement...</h3></div>';
      return;
    }
    var ms=getMatchList().slice().sort(function(a,b){return b.updatedAt-a.updatedAt;});
    var badge=document.getElementById('msgBadge');var total=ms.reduce(function(s,m){return s+(m.unread||0);},0);if(badge)badge.textContent=total||'0';
    host.innerHTML=ms.map(function(m){return '<div class="match-tile" data-mid="'+m.id+'" style="border-radius:0;border:none;border-bottom:1px solid var(--gray-200);'+(current===m.id?'background:var(--coral-soft);':'')+'"><div class="avatar">'+ui.escapeHtml(m.other.avatar||ui.initials(m.other.displayName))+'</div><div style="min-width:0"><div class="match-tile__name">'+ui.escapeHtml(m.other.displayName)+'</div><div class="match-tile__msg">'+ui.escapeHtml(m.lastMessage||'Nouvelle connexion')+'</div></div><div class="match-tile__time">'+ui.timeAgo(m.updatedAt)+'</div></div>';}).join('')||'<div class="empty" style="padding:30px 20px"><div class="empty__icon">&#128172;</div><h3>Pas encore de conversation</h3><p>Likez des profils dans Decouvrir pour demarrer une conversation.</p></div>';
    host.querySelectorAll('[data-mid]').forEach(function(el){el.onclick=function(){open(el.dataset.mid);};});
  }

  function bindComposeAndMenu(pane,match){
    var form=document.getElementById('chatForm');
    var menuBtn=document.getElementById('chatMenuBtn');
    if(menuBtn)menuBtn.onclick=function(){
      ui.modal({html:'<h3>'+ui.escapeHtml(match.other.displayName)+'</h3><div class="modal-actions" style="flex-direction:column;gap:8px"><button class="btn btn-secondary btn-full" id="blockUserBtn">Bloquer cette personne</button><button class="btn btn-secondary btn-full" id="reportUserBtn">Signaler cette personne</button><button class="btn btn-danger btn-full" id="deleteConvBtn">Supprimer la conversation</button></div>',
        onMount:function(){
          var bb=document.getElementById('blockUserBtn');if(bb)bb.onclick=function(){blockUser(match);};
          var rb=document.getElementById('reportUserBtn');if(rb)rb.onclick=function(){reportUser(match);};
          var db2=document.getElementById('deleteConvBtn');if(db2)db2.onclick=function(){deleteConv(match);};
        }});
    };
    return form;
  }

  async function blockUser(match){
    var mc=document.getElementById('modalClose');if(mc)mc.click();
    if(match.real){
      var auth=window.AET.auth,fb=window.AET.fb;var me=auth.currentUser();
      try{
        await fb.db.collection('blocks').add({from:me.uid,to:match.other.uid,ts:firebase.firestore.FieldValue.serverTimestamp()});
        await fb.db.collection('matches').doc(match.id).delete();
        ui.toast(match.other.displayName+' a ete bloque(e)','error');
        current=null;if(unsubscribe){unsubscribe();unsubscribe=null;}
        if(window.AET.discovery&&window.AET.discovery.invalidate)window.AET.discovery.invalidate();
        if(window.AET.matches)window.AET.matches.render();
      }catch(e){ui.toast('Erreur : '+e.message,'error');}
    }else{
      data.blockUser(match.other.uid);ui.toast(match.other.displayName+' a ete bloque(e)','error');
      current=null;data.state.matches=data.state.matches.filter(function(m){return m.id!==match.id;});data.save();
      renderConvList();renderChat();
    }
  }
  async function reportUser(match){
    var mc=document.getElementById('modalClose');if(mc)mc.click();
    if(match.real){
      var auth=window.AET.auth,fb=window.AET.fb;var me=auth.currentUser();
      try{
        await fb.db.collection('reports').add({type:'utilisateur',reporterId:me.uid,target:match.other.displayName,targetUid:match.other.uid,reason:'Signale depuis la messagerie',status:'open',ts:firebase.firestore.FieldValue.serverTimestamp()});
        ui.toast('Signalement envoye a la moderation','success');
      }catch(e){ui.toast('Erreur : '+e.message,'error');}
    }else{
      data.state.reports.unshift({type:'utilisateur',target:match.other.displayName,reason:'Signale depuis la messagerie',status:'open',ts:Date.now()});data.save();
      ui.toast('Signalement envoye a la moderation','success');
    }
  }
  async function deleteConv(match){
    var mc=document.getElementById('modalClose');if(mc)mc.click();
    if(match.real){
      var fb=window.AET.fb;
      try{
        await fb.db.collection('matches').doc(match.id).delete();
        current=null;if(unsubscribe){unsubscribe();unsubscribe=null;}
        ui.toast('Conversation supprimee','error');
        if(window.AET.matches)window.AET.matches.render();
      }catch(e){ui.toast('Erreur : '+e.message,'error');}
    }else{
      data.state.matches=data.state.matches.filter(function(m){return m.id!==match.id;});data.save();current=null;
      ui.toast('Conversation supprimee','error');renderConvList();renderChat();
    }
  }

  function renderChat(){
    var pane=document.getElementById('chatPane');if(!pane)return;
    if(!current){pane.innerHTML='<div class="empty" style="margin:auto"><div class="empty__icon">&#128172;</div><h3>Selectionnez une conversation</h3></div>';return;}
    var match=getMatchList().find(function(m){return m.id===current;});if(!match){pane.innerHTML='';return;}
    if(match.real){renderRealChat(pane,match);}
    else{renderDemoChat(pane,match);}
  }

  function chatShell(match,msgsHtml){
    return '<div class="chat__head"><div class="avatar">'+ui.escapeHtml(match.other.avatar||ui.initials(match.other.displayName))+'</div><div style="flex:1"><div style="font-weight:700">'+ui.escapeHtml(match.other.displayName)+'</div><div style="font-size:12px;color:var(--gray-600)">'+(match.real?'Membre AET':'En ligne')+'</div></div><button class="btn btn-secondary btn-sm" id="chatMenuBtn" type="button">&#8942;</button></div><div class="chat__msgs" id="chatMsgs">'+msgsHtml+'</div><form class="chat__compose" id="chatForm"><input id="chatInput" type="text" placeholder="Votre message..." autocomplete="off"/><button class="btn btn-primary" type="submit">Envoyer</button></form>';
  }

  function renderDemoChat(pane,match){
    var ml=(data.state.messages.find(function(x){return x.matchId===current;})||{messages:[]}).messages;
    match.unread=0;
    var msgs=ml.map(function(m){return '<div class="msg'+(m.fromMe?' me':'')+'">'+ui.escapeHtml(m.text)+'<span class="time">'+ui.timeAgo(m.ts)+'</span></div>';}).join('')||'<div class="empty" style="margin:auto"><div class="empty__icon">&#128172;</div><h3>Dites bonjour !</h3></div>';
    pane.innerHTML=chatShell(match,msgs);
    var ms=document.getElementById('chatMsgs');if(ms)ms.scrollTop=ms.scrollHeight;
    var form=bindComposeAndMenu(pane,match);
    if(form)form.onsubmit=function(e){e.preventDefault();var inp=document.getElementById('chatInput');var v=inp.value.trim();if(!v)return;data.addMessage(current,v,true);renderChat();renderConvList();setTimeout(function(){data.addMessage(current,'Bien recu !',false);renderChat();renderConvList();},900);};
  }

  function renderRealChat(pane,match){
    pane.innerHTML=chatShell(match,'<div class="empty" style="margin:auto"><div class="empty__icon">&#8987;</div><h3>Chargement...</h3></div>');
    var form=bindComposeAndMenu(pane,match);
    var fb=window.AET.fb,auth=window.AET.auth;var me=auth.currentUser();
    if(unsubscribe){unsubscribe();unsubscribe=null;}
    unsubscribe=fb.db.collection('matches').doc(match.id).collection('messages').orderBy('ts','asc').limit(200)
      .onSnapshot(function(snap){
        var msgs=snap.docs.map(function(d){var m=d.data();return '<div class="msg'+(m.senderId===me.uid?' me':'')+'">'+ui.escapeHtml(m.text)+'<span class="time">'+(m.ts&&m.ts.toMillis?ui.timeAgo(m.ts.toMillis()):'...')+'</span></div>';}).join('')||'<div class="empty" style="margin:auto"><div class="empty__icon">&#128172;</div><h3>Dites bonjour !</h3></div>';
        var host=document.getElementById('chatMsgs');
        if(host){host.innerHTML=msgs;host.scrollTop=host.scrollHeight;}
      },function(err){
        var host=document.getElementById('chatMsgs');
        if(host)host.innerHTML='<div class="empty" style="margin:auto"><div class="empty__icon">&#9888;</div><h3>Connexion impossible</h3><p>'+ui.escapeHtml(err.message)+'</p></div>';
      });
    if(form)form.onsubmit=function(e){
      e.preventDefault();var inp=document.getElementById('chatInput');var v=inp.value.trim();if(!v)return;inp.value='';
      fb.db.collection('matches').doc(match.id).collection('messages').add({senderId:me.uid,text:v,ts:firebase.firestore.FieldValue.serverTimestamp()})
        .then(function(){return fb.db.collection('matches').doc(match.id).set({lastMessage:v,updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});})
        .catch(function(err){ui.toast('Envoi impossible : '+err.message,'error');});
    };
  }

  window.AET.messages={open:open,renderConvList:renderConvList,renderChat:renderChat,setRealMatches:setRealMatches};
})();
