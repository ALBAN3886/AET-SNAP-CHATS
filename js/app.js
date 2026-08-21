window.AET=window.AET||{};
(function(){
  'use strict';
  var ui=window.AET.ui,auth=window.AET.auth,data=window.AET.data;
  function navigate(page){
    document.querySelectorAll('[data-page]').forEach(function(a){a.classList.toggle('is-active',a.dataset.page===page);});
    document.querySelectorAll('.page').forEach(function(p){p.classList.toggle('is-active',p.id==='page-'+page);});
    var t=document.getElementById('pageTitle');if(t)t.textContent={discover:'Decouvrir',matches:'Matchs',messages:'Conversations',news:'Actualites',jobs:'Emploi',profile:'Mon profil'}[page]||'AET';
    location.hash='#'+page;
    if(window.AET.discovery&&page==='discover')window.AET.discovery.render();
    if(window.AET.matches&&page==='matches')window.AET.matches.render();
    if(window.AET.messages&&page==='messages')window.AET.messages.renderConvList();
    if(window.AET.news&&page==='news')window.AET.news.render();
    if(window.AET.jobs&&page==='jobs')window.AET.jobs.render();
    if(page==='profile')renderProfile();
  }
  function renderProfile(){
    var me=(window.AET._demoUser)||{displayName:'Utilisateur',email:'--',uid:'me'};
    var init=ui.initials(me.displayName||'U');
    function set(id,v){var e=document.getElementById(id);if(e)e.textContent=v;}
    set('meName',me.displayName||'Utilisateur');set('meCity','Dakar');set('meAvatar',init);set('topAvatar',init);set('profileAvatar',init);set('profileName',me.displayName||'Utilisateur');set('profileMeta',me.email||'--');
    var ph=document.getElementById('profilePhotos');if(ph)ph.innerHTML=Array.from({length:6}).map(function(_,i){return '<div class="slot">'+(i?'+':'&#128247;')+'</div>';}).join('');
    var ints=document.getElementById('profileInterests');if(ints)ints.innerHTML=['Voyages','Cuisine','Lecture','Sport','Musique'].map(function(x){return '<span class="badge">'+ui.escapeHtml(x)+'</span>';}).join('');
    var prefs=document.getElementById('profilePrefs');if(prefs)prefs.innerHTML='18 - 50 ans &middot; 50 km &middot; Tous genres';
  }
  function showApp(me){
    var as=document.getElementById('authScreen');if(as)as.style.display='none';
    var shell=document.getElementById('appShell');if(shell)shell.style.display='grid';
    window.AET._demoUser=Object.assign({displayName:'Vous'},me||{});
    renderProfile();
    if(window.AET.matches)window.AET.matches.render();
    if(window.AET.messages)window.AET.messages.renderConvList();
    data.audit('login_success',(me&&me.email||'demo'));
    ui.toast('Bienvenue '+(me&&(me.displayName||me.email)||'!'),'success');
  }
  function bindAuthUI(){
    var tabs=document.getElementById('authTabs'),title=document.getElementById('authTitle'),submitBtn=document.getElementById('authSubmit'),signupOnly=document.getElementById('signupOnly'),signupExtra=document.getElementById('signupExtra');
    var mode='login';
    function setMode(m){mode=m;if(tabs)tabs.querySelectorAll('.auth-tab').forEach(function(t){t.classList.toggle('is-active',t.dataset.tab===m);});
      if(m==='signup'){if(title)title.textContent='Creer mon profil';if(submitBtn)submitBtn.textContent='Creer mon compte';if(signupOnly)signupOnly.style.display='block';if(signupExtra)signupExtra.style.display='block';}
      else{if(title)title.textContent='Bienvenue';if(submitBtn)submitBtn.textContent='Se connecter';if(signupOnly)signupOnly.style.display='none';if(signupExtra)signupExtra.style.display='none';}}
    if(tabs)tabs.querySelectorAll('.auth-tab').forEach(function(t){t.addEventListener('click',function(){setMode(t.dataset.tab);});});
    if(new URLSearchParams(location.search).get('signup')==='1')setMode('signup');
    var form=document.getElementById('authForm');
    if(form)form.addEventListener('submit',function(e){e.preventDefault();var fd=new FormData(form);var email=fd.get('email'),password=fd.get('password');
      auth.signIn(email,password).then(function(res){showApp(res.user);}).catch(function(){ui.toast('Mode demo','success');showApp({uid:'me',email:email,displayName:email.split('@')[0]});});});
    var lo=document.getElementById('logoutLink');if(lo)lo.addEventListener('click',function(e){e.preventDefault();auth.signOut().then(function(){var sh=document.getElementById('appShell');if(sh)sh.style.display='none';var as=document.getElementById('authScreen');if(as)as.style.display='flex';});});
    document.querySelectorAll('[data-page]').forEach(function(a){a.addEventListener('click',function(){navigate(a.dataset.page);});});
    var jp=document.getElementById('jobPostBtn');if(jp)jp.addEventListener('click',function(){if(window.AET.jobs)window.AET.jobs.openPost();});
    var ep=document.getElementById('editProfileBtn');if(ep)ep.addEventListener('click',function(){ui.toast('Edition a venir','success');});
    var nb=document.getElementById('notifBtn');if(nb)nb.addEventListener('click',function(){var list=data.state.notifications.slice(0,5);ui.modal({html:'<h3>Notifications</h3>'+(list.length?list.map(function(n){return '<div class="notif-item"><div class="avatar">AET</div><div><div>'+ui.escapeHtml(n.text)+'</div><div style="font-size:12px;color:var(--gray-400);margin-top:2px">A l instant</div></div></div>';}).join(''):'<div class="empty"><div class="empty__icon">&#128276;</div><h3>Aucune notification</h3></div>')});});
    var gs=document.getElementById('globalSearch');if(gs)gs.addEventListener('input',function(e){var q=e.target.value.toLowerCase().trim();if(!q)return;
      if(['annonce','offre','job','emploi'].some(function(x){return q.indexOf(x)>=0;})){e.target.value='';navigate('jobs');ui.toast('Section emploi','success');}
      else if(['article','news','actu'].some(function(x){return q.indexOf(x)>=0;})){e.target.value='';navigate('news');ui.toast('Section actualites','success');}});
    if(location.hash)navigate(location.hash.slice(1));else navigate('discover');
  }
  function boot(){
    var mc=document.getElementById('modalClose');if(mc)mc.onclick=function(){var back=document.getElementById('modalBackdrop');if(back){back.classList.remove('is-open');var c=document.getElementById('modalContent');if(c)c.innerHTML='';}};
    auth.initFb();
    if(location.pathname.endsWith('/admin.html')||location.pathname.endsWith('/admin')||document.getElementById('adminAuth')){if(window.AET.admin)window.AET.admin.start();return;}
    bindAuthUI();
    setTimeout(function(){showApp({uid:'me',email:'demo@aet-rencontre.app',displayName:'Vous'});},200);
  }
  document.addEventListener('DOMContentLoaded',boot);
})();