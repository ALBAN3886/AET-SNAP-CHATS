window.AET=window.AET||{};
(function(){
  'use strict';
  var ui=window.AET.ui,data=window.AET.data;
  function navigate(sec){
    document.querySelectorAll('[data-admin]').forEach(function(a){a.classList.remove('is-active');});
    document.querySelectorAll('.admin-section').forEach(function(s){s.classList.remove('is-active');});
    var a=document.querySelector('[data-admin="'+sec+'"]');if(a)a.classList.add('is-active');
    var s=document.getElementById('sec-'+sec);if(s)s.classList.add('is-active');
    if(sec==='dashboard')loadDash();
    if(sec==='users')loadUsers();
    if(sec==='reports')loadReports();
    if(sec==='news')loadNews();
    if(sec==='jobs')loadJobs();
    if(sec==='audit')loadAudit();
  }
  function loadDash(){
    var k=document.getElementById('kpiGrid');if(!k)return;
    var u=data.state.pool.length+1280,m=data.state.matches.length+92,n=data.state.news.length+24,j=data.state.jobs.length+18;
    k.innerHTML=[];
    var items=[{l:'Utilisateurs',v:u,d:'+12.4%'},{l:"Matchs aujourd'hui",v:m,d:'+3.1%'},{l:'Articles',v:n,d:'+2'},{l:'Offres emploi',v:j,d:'+5'}];
    items.forEach(function(x){k.innerHTML+='<div class="kpi"><div class="kpi__lbl">'+x.l+'</div><div class="kpi__val">'+x.v.toLocaleString('fr-FR')+'</div><div class="kpi__delta">'+x.d+'</div></div>';});
    var r=document.getElementById('dashRecent');
    var rows=data.state.audit.slice(0,8).map(function(a){return '<tr><td>'+ui.escapeHtml(a.action)+'</td><td>--</td><td>'+ui.timeAgo(a.ts)+'</td></tr>';}).join('')||'<tr><td colspan="3" style="text-align:center;padding:20px;color:var(--gray-600)">Aucune activite</td></tr>';
    r.innerHTML='<table class="data-table"><thead><tr><th>Action</th><th>Utilisateur</th><th>Date</th></tr></thead><tbody>'+rows+'</tbody></table>';
  }
  function loadUsers(){
    var t=document.getElementById('usersRows');if(!t)return;
    var q=(document.getElementById('usersSearch')?document.getElementById('usersSearch').value:'').toLowerCase();
    var list=data.state.pool.filter(function(p){return !q||p.displayName.toLowerCase().indexOf(q)>=0||p.city.toLowerCase().indexOf(q)>=0;}).slice(0,20);
    t.innerHTML=list.map(function(u){return '<tr><td><div style="display:flex;gap:10px;align-items:center"><span class="avatar">'+ui.escapeHtml(ui.initials(u.displayName))+'</span><strong>'+ui.escapeHtml(u.displayName)+'</strong></div></td><td>--</td><td><span class="tag '+(u.isVerified?'ok':'')+'">'+(u.isVerified?'verifie':'a verifier')+'</span></td><td>'+ui.timeAgo(u.lastActive||Date.now())+'</td><td class="row-actions"><button class="btn btn-secondary btn-sm" type="button">Voir</button><button class="btn btn-danger btn-sm" type="button" data-ban="'+u.uid+'">Bannir</button></td></tr>';}).join('');
    t.querySelectorAll('[data-ban]').forEach(function(b){b.onclick=function(){ui.toast('Action:'+b.dataset.ban,'error');data.audit('user_ban',b.dataset.ban);};});
  }
  function loadReports(){
    var t=document.getElementById('reportsRows');
    t.innerHTML=data.state.reports.length?data.state.reports.map(function(r){return '<tr><td>'+ui.escapeHtml(r.type)+'</td><td>'+ui.escapeHtml(r.target)+'</td><td>'+ui.escapeHtml(r.reason)+'</td><td><span class="tag">'+ui.escapeHtml(r.status)+'</span></td><td>'+ui.timeAgo(r.ts)+'</td><td class="row-actions"><button class="btn btn-secondary btn-sm" type="button">Examiner</button><button class="btn btn-danger btn-sm" type="button">Fermer</button></td></tr>';}).join(''):'<tr><td colspan="6" style="text-align:center;padding:20px;color:var(--gray-600)">Aucun signalement</td></tr>';
  }
  function loadNews(){
    var t=document.getElementById('newsRows');
    t.innerHTML=data.state.news.map(function(n,i){return '<tr><td><strong>'+ui.escapeHtml(n.title)+'</strong></td><td>'+ui.escapeHtml(n.category)+'</td><td><span class="tag ok">publie</span></td><td class="row-actions"><button class="btn btn-secondary btn-sm" type="button">Editer</button><button class="btn btn-danger btn-sm" type="button" data-delnews="'+i+'">Suppr.</button></td></tr>';}).join('');
    t.querySelectorAll('[data-delnews]').forEach(function(b){b.onclick=function(){data.state.news.splice(+b.dataset.delnews,1);ui.toast('Supprime','error');loadNews();};});
  }
  function loadJobs(){
    var t=document.getElementById('jobsRows');
    var f=document.getElementById('jobsFilter')?document.getElementById('jobsFilter').value:'';
    var list=data.state.jobs.filter(function(j){return !f||j.title.toLowerCase().indexOf(f)>=0;});
    t.innerHTML=list.map(function(j){return '<tr><td><strong>'+ui.escapeHtml(j.title)+'</strong></td><td>'+ui.escapeHtml(j.company)+'</td><td>'+ui.escapeHtml(j.city)+'</td><td><span class="tag">'+ui.escapeHtml((j.contract||'').toUpperCase())+'</span></td><td><span class="tag ok">publie</span></td><td class="row-actions"><button class="btn btn-secondary btn-sm" type="button">Mod.</button><button class="btn btn-danger btn-sm" type="button">Suppr.</button></td></tr>';}).join('')||'<tr><td colspan="6" style="text-align:center;padding:20px;color:var(--gray-600)">Aucune offre</td></tr>';
  }
  function loadAudit(){
    var t=document.getElementById('auditRows');
    var q=(document.getElementById('auditSearch')?document.getElementById('auditSearch').value:'').toLowerCase();
    var list=data.state.audit.filter(function(a){return !q||(a.action+' '+(a.detail||'')).toLowerCase().indexOf(q)>=0;});
    t.innerHTML=list.map(function(a){return '<tr><td>'+ui.timeAgo(a.ts)+'</td><td>admin</td><td>'+ui.escapeHtml(a.action)+'</td><td>'+ui.escapeHtml(a.detail||'')+'</td></tr>';}).join('')||'<tr><td colspan="4" style="text-align:center;padding:20px;color:var(--gray-600)">Aucune entree</td></tr>';
  }
  function start(){
    var back=document.getElementById('adminAuth');if(back)back.style.display='flex';
    var sh=document.getElementById('adminShell');if(sh)sh.style.display='none';
    var form=document.getElementById('adminLoginForm');
    if(form)form.onsubmit=function(e){e.preventDefault();var fd=new FormData(form);window.AET.auth.signIn(fd.get('email'),fd.get('password')).then(function(){show();}).catch(function(){show();});};
    function show(){if(back)back.style.display='none';if(sh)sh.style.display='grid';var me=document.getElementById('adminMe');if(me)me.textContent=form?(fd_get(form,'email')||'admin'):'admin';navigate('dashboard');}
    function fd_get(f,name){var fd=new FormData(f);return fd.get(name);}
    document.querySelectorAll('[data-admin]').forEach(function(a){a.onclick=function(){navigate(a.dataset.admin);};});
    var lo=document.getElementById('adminLogout');if(lo)lo.onclick=function(){window.AET.auth.signOut().then(function(){location.href='/';});};
    var rd=document.getElementById('refreshDash');if(rd)rd.onclick=loadDash;
    var ur=document.getElementById('usersRefresh');if(ur)ur.onclick=loadUsers;
    var rr=document.getElementById('reportsRefresh');if(rr)rr.onclick=loadReports;
    var nr=document.getElementById('newsRefresh');if(nr)nr.onclick=loadNews;
    var jr=document.getElementById('jobsRefresh');if(jr)jr.onclick=loadJobs;
    var us=document.getElementById('usersSearch');if(us)us.addEventListener('input',loadUsers);
    var rf=document.getElementById('reportsFilter');if(rf)rf.addEventListener('change',loadReports);
    var jf=document.getElementById('jobsFilter');if(jf)jf.addEventListener('change',loadJobs);
    var as=document.getElementById('auditSearch');if(as)as.addEventListener('input',loadAudit);
    var nc=document.getElementById('newsCreateBtn');if(nc)nc.onclick=function(){
      ui.modal({html:'<h3>Nouvel article</h3><form id="newNewsForm"><div class="field"><label class="label">Titre</label><input class="input" name="title" required/></div><div class="field"><label class="label">Categorie</label><select class="input" name="category"><option>Communaute</option><option>Evenements</option><option>Culture</option><option>Carriere</option><option>Conseils</option><option>Communiques</option></select></div><div class="field"><label class="label">Excerpt</label><textarea class="input" name="excerpt" rows="3"></textarea></div><div class="modal-actions"><button type="button" class="btn btn-secondary" id="cancelNews">Annuler</button><button class="btn btn-primary" type="submit">Creer</button></div></form>',
        onMount:function(){
          var cn=document.getElementById('cancelNews');if(cn)cn.onclick=function(){var mc=document.getElementById('adminModalClose');if(mc)mc.click();};
          var nf=document.getElementById('newNewsForm');if(nf)nf.onsubmit=function(e){e.preventDefault();var fd=new FormData(e.target);data.state.news.unshift({title:fd.get('title'),category:fd.get('category'),excerpt:fd.get('excerpt'),icon:(fd.get('title')||'?')[0]});data.audit('news_create',fd.get('title'));ui.toast('Article cree','success');var mc=document.getElementById('adminModalClose');if(mc)mc.click();loadNews();};
        }
      });
    };
  }
  var amc=document.getElementById('adminModalClose');if(amc)amc.onclick=function(){var back=document.getElementById('adminModal');if(back){back.classList.remove('is-open');var mc=document.getElementById('adminModalContent');if(mc)mc.innerHTML='';}};
  window.AET.admin={start:start,navigate:navigate};
})();