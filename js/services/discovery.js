window.AET=window.AET||{};
(function(){
  'use strict';
  var ui=window.AET.ui,data=window.AET.data,matches=window.AET.matches||{};
  var realPool=null,realLoading=false;

  function ageFromBirthdate(bd){
    if(!bd)return null;
    var d=bd.toDate?bd.toDate():new Date(bd);
    if(isNaN(d))return null;
    var t=new Date();var age=t.getFullYear()-d.getFullYear();var m=t.getMonth()-d.getMonth();
    if(m<0||(m===0&&t.getDate()<d.getDate()))age--;
    return age;
  }

  async function fetchRealPool(){
    var auth=window.AET.auth,fb=window.AET.fb;
    if(!auth||!auth.isFirebaseActive()||!fb||!fb.db)return[];
    var me=auth.currentUser();if(!me)return[];
    try{
      var likesSnap=await fb.db.collection('likes').where('from','==',me.uid).get();
      var alreadyLiked={};likesSnap.forEach(function(d){alreadyLiked[d.data().to]=true;});
      var snap=await fb.db.collection('users').where('isVisible','==',true).limit(30).get();
      var list=[];
      snap.forEach(function(doc){
        if(doc.id===me.uid)return;
        if(alreadyLiked[doc.id])return;
        var u=doc.data();
        list.push({uid:doc.id,displayName:u.displayName||'Utilisateur',age:ageFromBirthdate(u.birthdate)||'--',city:u.city||'',bio:u.bio||'',interests:u.interests||[],isVerified:!!u.isVerified,isOnline:false});
      });
      return list;
    }catch(e){console.warn('[AET] fetchRealPool impossible:',e.message);return[];}
  }

  function cardHtml(u){
    var tags=(u.interests||[]).map(function(t){return '<span class="badge">'+ui.escapeHtml(t)+'</span>';}).join('');
    return '<article class="swipe-card"><div class="swipe-card__media"><span class="swipe-card__chip">'+ui.escapeHtml(u.city||'Lieu non precise')+'</span><span>'+ui.escapeHtml(ui.initials(u.displayName))+'</span>'+(u.isOnline?'<span class="swipe-card__chip online">En ligne</span>':'')+'</div><div class="swipe-card__body"><div class="swipe-card__name">'+ui.escapeHtml(u.displayName)+' <span class="age">'+u.age+'</span></div><div class="swipe-card__meta">'+(u.isVerified?'&#9989; Verifie':'Profil en cours de completion')+(u.bio?' &middot; '+ui.escapeHtml(u.bio):'')+'</div><div class="swipe-card__tags">'+tags+'</div></div><div class="swipe-actions"><button class="btn-circle" data-action="pass">&#10006;</button><button class="btn-circle primary" data-action="like">&#10084;</button><button class="btn-circle success" data-action="super">&#11088;</button></div></article>';
  }

  function bindCard(list,u,onGone){
    list.querySelectorAll('[data-action]').forEach(function(b){b.onclick=function(){
      var a=b.dataset.action;
      if(a==='like'||a==='super'){
        if(matches.likeReal){
          list.innerHTML='<div class="empty"><div class="empty__icon">&#8987;</div><h3>Un instant...</h3></div>';
          matches.likeReal(u).then(function(res){
            if(res.matched){if(window.AET.app&&window.AET.app.celebrateMatch)window.AET.app.celebrateMatch(u);}
            else if(res.ok){ui.toast('Like envoye ! Vous serez notifie(e) en cas de match.','success');}
            onGone();
          });
        }else if(matches.create){
          matches.create(u);if(a==='super')ui.toast('Super like envoye !','success');
          if(window.AET.app&&window.AET.app.celebrateMatch)window.AET.app.celebrateMatch(u);
          onGone();
        }
      }else{ui.toast('Profil passe','');onGone();}
    };});
  }

  function render(){
    var list=document.getElementById('discoverList');if(!list)return;
    var auth=window.AET.auth;
    if(auth&&auth.isFirebaseActive()){
      if(realPool===null){
        if(realLoading)return;
        realLoading=true;
        list.innerHTML='<div class="empty"><div class="empty__icon">&#8987;</div><h3>Chargement des profils...</h3></div>';
        fetchRealPool().then(function(list2){realPool=list2;realLoading=false;render();});
        return;
      }
      if(!realPool.length){list.innerHTML='<div class="empty"><div class="empty__icon">&#128101;</div><h3>Personne d\'autre pour le moment</h3><p>Revenez quand d\'autres membres se seront inscrits, ou invitez vos proches a rejoindre AET.</p></div>';return;}
      var u=realPool[0];
      list.innerHTML=cardHtml(u);
      bindCard(list,u,function(){realPool.shift();render();});
      return;
    }
    var pool=data.state.pool;if(!pool.length){list.innerHTML='<div class="empty"><div class="empty__icon">&#128269;</div><h3>Plus de profils</h3></div>';return;}
    var du=pool[Math.floor(Math.random()*pool.length)];
    list.innerHTML=cardHtml(du);
    bindCard(list,du,function(){setTimeout(render,300);});
  }
  window.AET.discovery={render:render,invalidate:function(){realPool=null;}};
})();