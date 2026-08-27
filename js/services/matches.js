window.AET=window.AET||{};
(function(){
  'use strict';
  var ui=window.AET.ui,data=window.AET.data;
  function create(o){return data.addMatch({uid:o.uid,displayName:o.displayName,age:o.age,avatar:ui.initials(o.displayName)});}

  async function likeReal(other){
    var auth=window.AET.auth,fb=window.AET.fb;
    if(!auth||!auth.isFirebaseActive()||!fb||!fb.db)return{ok:false,matched:false};
    var me=auth.currentUser();if(!me)return{ok:false,matched:false};
    var db=fb.db;
    try{
      await db.collection('likes').doc(me.uid+'_'+other.uid).set({from:me.uid,to:other.uid,ts:firebase.firestore.FieldValue.serverTimestamp()});
      var reverse=await db.collection('likes').doc(other.uid+'_'+me.uid).get();
      if(reverse.exists){
        var pair=[me.uid,other.uid].sort();
        var matchId=pair.join('_');
        await db.collection('matches').doc(matchId).set({userIds:[me.uid,other.uid],createdAt:firebase.firestore.FieldValue.serverTimestamp(),lastMessage:'',updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
        return{ok:true,matched:true};
      }
      return{ok:true,matched:false};
    }catch(e){console.warn('[AET] likeReal impossible:',e.message);ui.toast('Action impossible : '+e.message,'error');return{ok:false,matched:false};}
  }

  async function loadRealMatches(){
    var auth=window.AET.auth,fb=window.AET.fb;
    if(!auth||!auth.isFirebaseActive()||!fb||!fb.db)return[];
    var me=auth.currentUser();if(!me)return[];
    try{
      var snap=await fb.db.collection('matches').where('userIds','array-contains',me.uid).orderBy('updatedAt','desc').limit(30).get();
      var out=[];
      for(var i=0;i<snap.docs.length;i++){
        var d=snap.docs[i].data();var otherUid=d.userIds.find(function(u){return u!==me.uid;});
        var otherDoc=await fb.db.collection('users').doc(otherUid).get();
        var od=otherDoc.exists?otherDoc.data():{displayName:'Utilisateur'};
        out.push({id:snap.docs[i].id,userIds:d.userIds,real:true,other:{uid:otherUid,displayName:od.displayName,avatar:ui.initials(od.displayName)},lastMessage:d.lastMessage||'',updatedAt:d.updatedAt&&d.updatedAt.toMillis?d.updatedAt.toMillis():Date.now(),unread:0});
      }
      return out;
    }catch(e){console.warn('[AET] loadRealMatches impossible:',e.message);return[];}
  }

  var lastRealMatches=[];
  function render(){
    var auth=window.AET.auth;
    if(auth&&auth.isFirebaseActive()){
      loadRealMatches().then(function(real){lastRealMatches=real;renderList(real);if(window.AET.messages)window.AET.messages.setRealMatches(real);});
    }else{
      renderList(data.state.matches);
    }
  }
  function renderList(ms){
    var list=document.getElementById('matchList');var empty=document.getElementById('matchesEmpty');
    if(!list)return;
    ms=ms||[];
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
  window.AET.matches={create:create,render:render,likeReal:likeReal,loadRealMatches:loadRealMatches,getLastReal:function(){return lastRealMatches;}};
})();