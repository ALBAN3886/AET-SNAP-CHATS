window.AET=window.AET||{};
(function(){
  'use strict';
  var ui=window.AET.ui,auth=window.AET.auth,data=window.AET.data;
  function navigate(page){
    document.querySelectorAll('[data-page]').forEach(function(a){a.classList.toggle('is-active',a.dataset.page===page);});
    document.querySelectorAll('.page').forEach(function(p){p.classList.toggle('is-active',p.id==='page-'+page);});
    var t=document.getElementById('pageTitle');if(t)t.textContent={home:'Accueil',discover:'Decouvrir',matches:'Matchs',messages:'Conversations',news:'Actualites',jobs:'Emploi',notifications:'Notifications',profile:'Mon profil'}[page]||'AET';
    location.hash='#'+page;
    if(page==='home')renderHome();
    if(window.AET.discovery&&page==='discover')window.AET.discovery.render();
    if(window.AET.matches&&page==='matches')window.AET.matches.render();
    if(window.AET.messages&&page==='messages')window.AET.messages.renderConvList();
    if(window.AET.news&&page==='news')window.AET.news.render();
    if(window.AET.jobs&&page==='jobs')window.AET.jobs.render();
    if(page==='notifications')renderNotifications();
    if(page==='profile')renderProfile();
  }
  function renderHome(){
    var me=(window.AET._demoUser)||{displayName:'Utilisateur'};
    var g=document.getElementById('homeGreeting');if(g)g.textContent='Bonjour '+((me.displayName||'').split(' ')[0]||'')+' 👋';
    var pool=data.state.pool.slice(0,5);
    var reco=document.getElementById('homeRecoProfiles');
    if(reco)reco.innerHTML=pool.length?pool.map(function(u){return '<div class="mini-card"><div class="avatar">'+ui.escapeHtml(ui.initials(u.displayName))+'</div><div class="mini-card__name">'+ui.escapeHtml(u.displayName)+', '+u.age+'</div><div class="mini-card__meta">'+ui.escapeHtml(u.city)+'</div></div>';}).join(''):'<div class="empty"><div class="empty__icon">&#128269;</div><h3>Aucun profil trouve</h3><p>Revenez plus tard.</p></div>';
    var ms=data.state.matches.slice(0,4);
    var mm=document.getElementById('homeRecentMatches');
    if(mm)mm.innerHTML=ms.length?ms.map(function(m){return '<div class="mini-card"><div class="avatar">'+ui.escapeHtml(m.other.avatar||ui.initials(m.other.displayName))+'</div><div class="mini-card__name">'+ui.escapeHtml(m.other.displayName)+'</div><div class="mini-card__meta">'+ui.escapeHtml(m.lastMessage||'Nouvelle connexion')+'</div></div>';}).join(''):'<div class="empty"><div class="empty__icon">&#128149;</div><h3>Aucun match</h3><p>Allez decouvrir des profils.</p></div>';
    var msgs=data.state.matches.filter(function(m){return m.lastMessage;}).slice(0,4);
    var mh=document.getElementById('homeRecentMessages');
    if(mh)mh.innerHTML=msgs.length?msgs.map(function(m){return '<div class="mini-card"><div class="avatar">'+ui.escapeHtml(m.other.avatar||ui.initials(m.other.displayName))+'</div><div class="mini-card__name">'+ui.escapeHtml(m.other.displayName)+'</div><div class="mini-card__meta">'+ui.escapeHtml(m.lastMessage)+'</div></div>';}).join(''):'<div class="empty"><div class="empty__icon">&#128172;</div><h3>Aucun message</h3><p>Vos conversations apparaitront ici.</p></div>';
    var news=data.state.news.slice(0,3);
    var nh=document.getElementById('homeRecentNews');
    if(nh)nh.innerHTML=news.length?news.map(function(n){return '<div class="mini-card"><div class="mini-card__name">'+ui.escapeHtml(n.title)+'</div><div class="mini-card__meta">'+ui.escapeHtml(n.category)+'</div></div>';}).join(''):'<div class="empty"><div class="empty__icon">&#128240;</div><h3>Aucune actualite</h3></div>';
    var jobs=data.state.jobs.slice(0,3);
    var jh=document.getElementById('homeRecentJobs');
    if(jh)jh.innerHTML=jobs.length?jobs.map(function(j){return '<div class="mini-card"><div class="mini-card__name">'+ui.escapeHtml(j.title)+'</div><div class="mini-card__meta">'+ui.escapeHtml(j.company)+' &middot; '+ui.escapeHtml(j.city)+'</div></div>';}).join(''):'<div class="empty"><div class="empty__icon">&#128188;</div><h3>Aucune offre</h3></div>';
  }
  function renderNotifications(){
    var host=document.getElementById('notifList');if(!host)return;
    var list=data.state.notifications;
    host.innerHTML=list.length?list.map(function(n){return '<div class="notif-item'+(n.read?'':' unread')+'"><div class="avatar">AET</div><div><div>'+ui.escapeHtml(n.text)+'</div><div style="font-size:12px;color:var(--gray-400);margin-top:2px">'+ui.timeAgo(n.ts||Date.now())+'</div></div></div>';}).join(''):'<div class="empty"><div class="empty__icon">&#128276;</div><h3>Aucune notification</h3><p>Vous serez alerte des qu il se passe quelque chose.</p></div>';
    updateNotifBadge();
  }
  function updateNotifBadge(){
    var unread=data.state.notifications.filter(function(n){return !n.read;}).length;
    var b=document.getElementById('notifBadgeNav');if(b)b.textContent=unread||'0';
    var d=document.getElementById('notifDot');if(d)d.style.display=unread?'block':'none';
  }
  function updateMobileBadges(){
    var mUn=data.state.matches.reduce(function(s,m){return s+(m.unread||0);},0);
    var mb=document.getElementById('matchBadgeMobile');if(mb){mb.textContent=mUn||'';mb.style.display=mUn?'flex':'none';}
    var msb=document.getElementById('msgBadgeMobile');if(msb){msb.textContent=mUn||'';msb.style.display=mUn?'flex':'none';}
  }
  function renderProfile(){
    var me=(window.AET._demoUser)||{displayName:'Utilisateur',email:'--',uid:'me'};
    var init=ui.initials(me.displayName||'U');
    function set(id,v){var e=document.getElementById(id);if(e)e.textContent=v;}
    set('meName',me.displayName||'Utilisateur');set('meCity','Dakar');set('meAvatar',init);set('topAvatar',init);set('profileAvatar',init);set('profileName',me.displayName||'Utilisateur');set('profileMeta',me.email||'--');
    var ph=document.getElementById('profilePhotos');if(ph)ph.innerHTML=Array.from({length:6}).map(function(_,i){return '<div class="slot">'+(i?'+':'&#128247;')+'</div>';}).join('');
    var ints=document.getElementById('profileInterests');if(ints)ints.innerHTML=['Voyages','Cuisine','Lecture','Sport','Musique'].map(function(x){return '<span class="badge">'+ui.escapeHtml(x)+'</span>';}).join('');
    var prefs=document.getElementById('profilePrefs');if(prefs)prefs.innerHTML='18 - 50 ans &middot; 50 km &middot; Tous genres';
    set('profileAvatarPro',init);set('profileNamePro',me.displayName||'Utilisateur');
    set('proMetier',me.metier||'Non renseigne - completez votre profil professionnel.');
    var ps=document.getElementById('proSkills');if(ps)ps.innerHTML=(me.skills||['A completer']).map(function(x){return '<span class="badge">'+ui.escapeHtml(x)+'</span>';}).join('');
  }
  
  var SESSION_KEY='aet_session_v1';
  function saveSession(u){try{window.localStorage.setItem(SESSION_KEY,JSON.stringify(u));}catch(e){}}
  function loadSession(){try{var raw=window.localStorage.getItem(SESSION_KEY);return raw?JSON.parse(raw):null;}catch(e){return null;}}
  function clearSession(){try{window.localStorage.removeItem(SESSION_KEY);}catch(e){}}

  function showApp(me){
    var as=document.getElementById('authScreen');if(as)as.style.display='none';
    var shell=document.getElementById('appShell');if(shell)shell.style.display='grid';
    window.AET._demoUser=Object.assign({displayName:'Vous'},me||{});
    saveSession(window.AET._demoUser);
    renderProfile();
    if(window.AET.matches)window.AET.matches.render();
    if(window.AET.messages)window.AET.messages.renderConvList();
    updateNotifBadge();updateMobileBadges();
    data.audit('login_success',(me&&me.email||'demo'));
    ui.toast('Bienvenue '+(me&&(me.displayName||me.email)||'!'),'success');
  }
  function ageFromBirthdate(d){if(!d)return null;var b=new Date(d);if(isNaN(b))return null;var t=new Date();var age=t.getFullYear()-b.getFullYear();var m=t.getMonth()-b.getMonth();if(m<0||(m===0&&t.getDate()<b.getDate()))age--;return age;}
  function bindAuthUI(){
    var tabs=document.getElementById('authTabs'),title=document.getElementById('authTitle'),submitBtn=document.getElementById('authSubmit'),signupOnly=document.getElementById('signupOnly'),signupExtra=document.getElementById('signupExtra');
    var mode='login';
    function setMode(m){mode=m;if(tabs)tabs.querySelectorAll('.auth-tab').forEach(function(t){t.classList.toggle('is-active',t.dataset.tab===m);});
      if(m==='signup'){if(title)title.textContent='Creer mon profil';if(submitBtn)submitBtn.textContent='Creer mon compte';if(signupOnly)signupOnly.style.display='block';if(signupExtra)signupExtra.style.display='block';}
      else{if(title)title.textContent='Bienvenue';if(submitBtn)submitBtn.textContent='Se connecter';if(signupOnly)signupOnly.style.display='none';if(signupExtra)signupExtra.style.display='none';}}
    if(tabs)tabs.querySelectorAll('.auth-tab').forEach(function(t){t.addEventListener('click',function(){setMode(t.dataset.tab);});});
    if(new URLSearchParams(location.search).get('signup')==='1')setMode('signup');
    var form=document.getElementById('authForm');
    if(form)form.addEventListener('submit',function(e){
      e.preventDefault();
      var fd=new FormData(form);
      var email=(fd.get('email')||'').trim(),password=fd.get('password')||'';
      if(mode==='signup'){
        var displayName=(fd.get('displayName')||'').trim();
        var birthdate=fd.get('birthdate');
        var city=(fd.get('city')||'').trim();
        var gender=fd.get('gender')||'other';
        if(!displayName){ui.toast('Merci d indiquer votre nom.','error');return;}
        var age=ageFromBirthdate(birthdate);
        if(age===null){ui.toast('Merci d indiquer votre date de naissance.','error');return;}
        if(age<18){ui.toast('Vous devez avoir 18 ans ou plus pour vous inscrire.','error');return;}
        if(!fd.get('consentAge')||!fd.get('consentTerms')){ui.toast('Merci de cocher les cases de consentement.','error');return;}
        auth.signUp({email:email,password:password,displayName:displayName,birthdate:birthdate,city:city,gender:gender}).then(function(res){
          showApp(Object.assign({},res.user,{displayName:displayName,city:city,gender:gender,birthdate:birthdate}));
        }).catch(function(err){ui.toast('Inscription impossible : '+(err&&err.message||'reessayez'),'error');});
      }else{
        if(!email||!password){ui.toast('Merci de renseigner email et mot de passe.','error');return;}
        auth.signIn(email,password).then(function(res){showApp(res.user);}).catch(function(){ui.toast('Mode demo - identifiants non verifies','success');showApp({uid:'me',email:email,displayName:email.split('@')[0]});});
      }
    });
    var lo=document.getElementById('logoutLink');if(lo)lo.addEventListener('click',function(e){e.preventDefault();clearSession();auth.signOut().then(function(){var sh=document.getElementById('appShell');if(sh)sh.style.display='none';var as=document.getElementById('authScreen');if(as)as.style.display='flex';if(form)form.reset();});});
    document.querySelectorAll('[data-page]').forEach(function(a){a.addEventListener('click',function(){navigate(a.dataset.page);});});
    var jp=document.getElementById('jobPostBtn');if(jp)jp.addEventListener('click',function(){if(window.AET.jobs)window.AET.jobs.openPost();});
    var sp=document.getElementById('seekerPostBtn');if(sp)sp.addEventListener('click',function(){if(window.AET.jobs)window.AET.jobs.openPostSeeker();});
    document.querySelectorAll('#jobsModeSwitch [data-jobmode]').forEach(function(btn){btn.addEventListener('click',function(){
      document.querySelectorAll('#jobsModeSwitch [data-jobmode]').forEach(function(b){b.classList.toggle('is-active',b===btn);});
      var isSeek=btn.dataset.jobmode==='seek';
      document.getElementById('jobModeRecruit').style.display=isSeek?'none':'block';
      document.getElementById('jobModeSeek').style.display=isSeek?'block':'none';
      if(window.AET.jobs)window.AET.jobs.render();
    });});
    document.querySelectorAll('#profileModeSwitch [data-profilemode]').forEach(function(btn){btn.addEventListener('click',function(){
      document.querySelectorAll('#profileModeSwitch [data-profilemode]').forEach(function(b){b.classList.toggle('is-active',b===btn);});
      var isPro=btn.dataset.profilemode==='pro';
      document.getElementById('profileModePersonal').style.display=isPro?'none':'block';
      document.getElementById('profileModePro').style.display=isPro?'block':'none';
    });});
    var mr=document.getElementById('markReadBtn');if(mr)mr.addEventListener('click',function(){data.markNotifsRead();renderNotifications();updateNotifBadge();});
    var hp=document.getElementById('homePublish');if(hp)hp.addEventListener('click',function(){navigate('jobs');setTimeout(function(){if(window.AET.jobs)window.AET.jobs.openPost();},250);});
    var ep=document.getElementById('editProfileBtn');if(ep)ep.addEventListener('click',openEditProfile);
    var nb=document.getElementById('notifBtn');if(nb)nb.addEventListener('click',function(){navigate('notifications');});
    var gs=document.getElementById('globalSearch');if(gs)gs.addEventListener('input',function(e){var q=e.target.value.toLowerCase().trim();if(!q)return;
      if(['annonce','offre','job','emploi'].some(function(x){return q.indexOf(x)>=0;})){e.target.value='';navigate('jobs');ui.toast('Section emploi','success');}
      else if(['article','news','actu'].some(function(x){return q.indexOf(x)>=0;})){e.target.value='';navigate('news');ui.toast('Section actualites','success');}});
    if(location.hash)navigate(location.hash.slice(1));else navigate('home');
  }
  function openEditProfile(){
    var me=window.AET._demoUser||{};
    ui.modal({html:'<h3>Modifier mon profil</h3><form id="editProfileForm"><div class="field"><label class="label">Nom affiche</label><input class="input" name="displayName" value="'+ui.escapeHtml(me.displayName||'')+'" required/></div><div class="field"><label class="label">Ville</label><input class="input" name="city" value="'+ui.escapeHtml(me.city||'')+'"/></div><div class="field"><label class="label">Bio</label><textarea class="input" name="bio" rows="3">'+ui.escapeHtml(me.bio||'')+'</textarea></div><div class="field"><label class="label">Centres d interet (separes par virgule)</label><input class="input" name="interests" value="'+ui.escapeHtml((me.interests||['Voyages','Cuisine','Lecture','Sport','Musique']).join(', '))+'"/></div><div class="modal-actions"><button type="button" class="btn btn-secondary" id="cancelEditProfile">Annuler</button><button class="btn btn-primary" type="submit">Enregistrer</button></div></form>',
      onMount:function(){
        var f=document.getElementById('editProfileForm');var c=document.getElementById('cancelEditProfile');if(c)c.onclick=function(){var mc=document.getElementById('modalClose');if(mc)mc.click();};
        f.onsubmit=function(e){e.preventDefault();var fd=new FormData(f);
          var updated=Object.assign({},me,{displayName:fd.get('displayName'),city:fd.get('city'),bio:fd.get('bio'),interests:(fd.get('interests')||'').split(',').map(function(x){return x.trim();}).filter(Boolean)});
          window.AET._demoUser=updated;
          if(auth.isFirebaseActive()&&window.AET.fb&&window.AET.fb.db&&updated.uid){
            window.AET.fb.db.collection('users').doc(updated.uid).set({displayName:updated.displayName,city:updated.city,bio:updated.bio,interests:updated.interests},{merge:true}).catch(function(err){ui.toast('Erreur de sauvegarde : '+err.message,'error');});
          }else{saveSession(updated);}
          renderProfile();ui.toast('Profil mis a jour','success');var mc=document.getElementById('modalClose');if(mc)mc.click();
        };
      }});
  }
  function boot(){
    var mc=document.getElementById('modalClose');if(mc)mc.onclick=function(){var back=document.getElementById('modalBackdrop');if(back){back.classList.remove('is-open');var c=document.getElementById('modalContent');if(c)c.innerHTML='';}};
    var fbOk=auth.initFb();
    if(location.pathname.endsWith('/admin.html')||location.pathname.endsWith('/admin')||document.getElementById('adminAuth')){if(window.AET.admin)window.AET.admin.start();return;}
    bindAuthUI();
    if(fbOk&&auth.isFirebaseActive()){
      auth.onAuthChange(function(fbUser){
        if(fbUser){
          auth.getProfile(fbUser.uid).then(function(profile){
            var base={uid:fbUser.uid,email:fbUser.email,displayName:fbUser.displayName||fbUser.email.split('@')[0]};
            var known=(window.AET._demoUser&&window.AET._demoUser.uid===fbUser.uid)?window.AET._demoUser:{};
            showApp(Object.assign(base,known,profile||{}));
          });
        }else{
          var sh=document.getElementById('appShell');if(sh)sh.style.display='none';
          var as=document.getElementById('authScreen');if(as)as.style.display='flex';
        }
      });
    }else{
      var session=loadSession();
      if(session){showApp(session);}
    }
  }

  function celebrateMatch(u){
    ui.modal({large:true,html:'<div class="match-celebrate"><div class="match-celebrate__hearts">&#128149;</div><h2>C\'est un Match ! ❤️</h2><p>Vous et <strong>'+ui.escapeHtml(u.displayName)+'</strong> vous etes plu.</p><div class="match-celebrate__avatars"><div class="avatar">Vous</div><div class="avatar">'+ui.escapeHtml(ui.initials(u.displayName))+'</div></div><div class="modal-actions"><button class="btn btn-secondary" id="matchContinue">Continuer a decouvrir</button><button class="btn btn-primary" id="matchSayHi">Envoyer un message</button></div></div>',
      onMount:function(){
        var c=document.getElementById('matchContinue');if(c)c.onclick=function(){var mc=document.getElementById('modalClose');if(mc)mc.click();};
        var s=document.getElementById('matchSayHi');if(s)s.onclick=function(){var mc=document.getElementById('modalClose');if(mc)mc.click();navigate('matches');};
      }});
    data.pushNotif('Nouveau match avec '+u.displayName);
    updateNotifBadge();updateMobileBadges();
  }
  window.AET.app={navigate:navigate,updateMobileBadges:updateMobileBadges,updateNotifBadge:updateNotifBadge,celebrateMatch:celebrateMatch};
  document.addEventListener('DOMContentLoaded',boot);
})();