window.AET=window.AET||{};
(function(){
  'use strict';
  var ui=window.AET.ui,data=window.AET.data;
  var realJobs=null,realSeekers=null;

  function isFbMode(){var auth=window.AET.auth;return auth&&auth.isFirebaseActive();}

  function jobCardHtml(j,idAttr){
    return '<article class="job-card" '+idAttr+'><div class="job-card__head"><div class="job-card__logo">'+ui.escapeHtml((j.company||'?')[0])+'</div><div><div class="job-card__title">'+ui.escapeHtml(j.title)+'</div><div class="job-card__company">'+ui.escapeHtml(j.company)+' &middot; '+ui.escapeHtml(j.city)+'</div></div></div><div class="job-card__tags">'+(j.tags||[]).map(function(t){return '<span class="badge">'+ui.escapeHtml(t)+'</span>';}).join('')+' <span class="badge">'+ui.escapeHtml((j.contract||'').toUpperCase())+'</span></div><div class="job-card__foot"><span class="salary">'+ui.escapeHtml(j.salary||'')+'</span><button class="btn btn-secondary btn-sm" type="button" data-apply="'+(j.id||'')+'">Postuler</button></div></article>';
  }

  async function fetchRealJobs(){
    var fb=window.AET.fb;if(!fb||!fb.db)return[];
    try{
      var snap=await fb.db.collection('jobs').orderBy('createdAt','desc').limit(50).get();
      return snap.docs.map(function(d){return Object.assign({id:d.id},d.data());});
    }catch(e){console.warn('[AET] fetchRealJobs impossible:',e.message);return[];}
  }
  async function fetchRealSeekers(){
    var fb=window.AET.fb;if(!fb||!fb.db)return[];
    try{
      var snap=await fb.db.collection('jobSeekers').orderBy('ts','desc').limit(50).get();
      return snap.docs.map(function(d){return Object.assign({id:d.id},d.data());});
    }catch(e){console.warn('[AET] fetchRealSeekers impossible:',e.message);return[];}
  }

  function render(){
    var host=document.getElementById('jobsList');if(!host)return;
    if(isFbMode()){
      if(realJobs===null){
        host.innerHTML='<div class="empty"><div class="empty__icon">&#8987;</div><h3>Chargement...</h3></div>';
        fetchRealJobs().then(function(list){realJobs=list;render();});
        return;
      }
      renderJobList(host,realJobs,true);
    }else{
      renderJobList(host,data.state.jobs,false);
    }
  }

  function renderJobList(host,source,real){
    var q=(document.getElementById('jobSearch')?document.getElementById('jobSearch').value:'').toLowerCase();
    var ct=(document.getElementById('jobContract')?document.getElementById('jobContract').value:'');
    var list=source.filter(function(j){return (!ct||j.contract===ct)&&(!q||(j.title+' '+j.company+' '+j.city).toLowerCase().indexOf(q)>=0);});
    host.innerHTML=list.map(function(j){return jobCardHtml(j,real?'data-jid="'+j.id+'"':'data-jid="'+j.title+'-'+j.company+'"');}).join('')||'<div class="empty"><div class="empty__icon">&#128188;</div><h3>Aucune offre</h3>'+(real?'<p>Soyez le premier a publier une offre.</p>':'')+'</div>';
    var s=document.getElementById('jobSearch');if(s&&!s.__b){s.addEventListener('input',render);s.__b=true;}
    var c=document.getElementById('jobContract');if(c&&!c.__b){c.addEventListener('change',render);c.__b=true;}
    host.querySelectorAll('[data-apply]').forEach(function(el){el.onclick=function(){applyToJob(el.dataset.apply,real);};});
  }

  async function applyToJob(jobId,real){
    if(real&&jobId){
      var auth=window.AET.auth,fb=window.AET.fb;var me=auth.currentUser();
      if(!me){ui.toast('Connectez-vous pour postuler.','error');return;}
      try{
        await fb.db.collection('jobs').doc(jobId).collection('applications').add({applicantId:me.uid,applicantName:me.displayName||me.email,ts:firebase.firestore.FieldValue.serverTimestamp()});
        ui.toast('Candidature envoyee','success');
      }catch(e){ui.toast('Erreur : '+e.message,'error');}
    }else{
      ui.toast('Candidature envoyee (mode demo)','success');data.audit('job_apply',jobId);
    }
  }

  function openPost(){
    ui.modal({html:'<h3>Publier une offre</h3><form id="jobForm"><div class="field"><label class="label">Titre</label><input class="input" name="title" required/></div><div class="field"><label class="label">Entreprise</label><input class="input" name="company" required/></div><div class="field"><label class="label">Ville</label><input class="input" name="city" required/></div><div class="field"><label class="label">Type</label><select class="input" name="contract"><option value="cdi">CDI</option><option value="cdd">CDD</option><option value="freelance">Freelance</option><option value="stage">Stage</option></select></div><div class="field"><label class="label">Salaire</label><input class="input" name="salary" placeholder="2000 - 3000 EUR"/></div><div class="field"><label class="label">Tags</label><input class="input" name="tags" placeholder="JS, Cloud, Mobile"/></div><div class="modal-actions"><button type="button" class="btn btn-secondary" id="cancelJob">Annuler</button><button class="btn btn-primary" type="submit">Publier</button></div></form>',
      onMount:function(){
        var f=document.getElementById('jobForm');var cj=document.getElementById('cancelJob');if(cj)cj.onclick=function(){var mc=document.getElementById('modalClose');if(mc)mc.click();};
        f.onsubmit=async function(e){
          e.preventDefault();var fd=new FormData(f);
          var j={title:fd.get('title'),company:fd.get('company'),city:fd.get('city'),contract:fd.get('contract'),salary:fd.get('salary'),tags:(fd.get('tags')||'').split(',').map(function(x){return x.trim();}).filter(Boolean)};
          if(isFbMode()){
            var auth=window.AET.auth,fb=window.AET.fb;var me=auth.currentUser();
            if(!me){ui.toast('Connectez-vous pour publier.','error');return;}
            try{
              await fb.db.collection('jobs').add(Object.assign({},j,{publisherId:me.uid,publisherName:me.displayName||me.email,createdAt:firebase.firestore.FieldValue.serverTimestamp()}));
              realJobs=null;ui.toast('Offre publiee','success');var mc=document.getElementById('modalClose');if(mc)mc.click();render();
            }catch(err){ui.toast('Erreur : '+err.message,'error');}
          }else{
            data.state.jobs.unshift(j);data.audit('job_post',j.title);ui.toast('Offre publiee','success');var mc2=document.getElementById('modalClose');if(mc2)mc2.click();render();
          }
        };
      }
    });
  }

  function renderSeekers(){
    var host=document.getElementById('jobSeekersList');if(!host)return;
    if(isFbMode()){
      if(realSeekers===null){
        host.innerHTML='<div class="empty"><div class="empty__icon">&#8987;</div><h3>Chargement...</h3></div>';
        fetchRealSeekers().then(function(list){realSeekers=list;renderSeekers();});
        return;
      }
      renderSeekerList(host,realSeekers,true);
    }else{
      renderSeekerList(host,data.state.jobSeekers||[],false);
    }
  }

  function renderSeekerList(host,source,real){
    var q=(document.getElementById('seekerSearch')?document.getElementById('seekerSearch').value:'').toLowerCase();
    var list=source.filter(function(j){return !q||(j.metier+' '+j.city).toLowerCase().indexOf(q)>=0;});
    host.innerHTML=list.map(function(j){return '<article class="job-card"><div class="job-card__head"><div class="job-card__logo">'+ui.escapeHtml((j.metier||'?')[0])+'</div><div><div class="job-card__title">'+ui.escapeHtml(j.metier)+'</div><div class="job-card__company">'+ui.escapeHtml(j.city||'')+' &middot; '+ui.escapeHtml(j.availability||'Disponibilite non precisee')+'</div></div></div><div class="job-card__tags">'+(j.skills||[]).map(function(t){return '<span class="badge">'+ui.escapeHtml(t)+'</span>';}).join('')+' <span class="badge">'+ui.escapeHtml((j.contract||'').toUpperCase())+'</span></div><div class="job-card__foot"><span class="salary">'+ui.escapeHtml(j.experience||'')+'</span><button class="btn btn-secondary btn-sm" type="button" data-contact="'+j.id+'">Contacter</button></div></article>';}).join('')||'<div class="empty"><div class="empty__icon">&#128188;</div><h3>Aucune demande d emploi</h3><p>Soyez le premier a publier votre recherche.</p></div>';
    var s=document.getElementById('seekerSearch');if(s&&!s.__b){s.addEventListener('input',renderSeekers);s.__b=true;}
    host.querySelectorAll('[data-contact]').forEach(function(el){el.onclick=function(){ui.toast('Mis en relation via la messagerie AET','success');data.audit('seeker_contact',el.dataset.contact);};});
  }

  function openPostSeeker(){
    ui.modal({html:'<h3>Publier ma recherche d emploi</h3><form id="seekerForm"><div class="field"><label class="label">Metier recherche</label><input class="input" name="metier" required/></div><div class="field"><label class="label">Ville</label><input class="input" name="city" required/></div><div class="field"><label class="label">Type de contrat</label><select class="input" name="contract"><option value="cdi">CDI</option><option value="cdd">CDD</option><option value="freelance">Freelance</option><option value="stage">Stage</option></select></div><div class="field"><label class="label">Experience</label><input class="input" name="experience" placeholder="Ex : 3 ans"/></div><div class="field"><label class="label">Disponibilite</label><input class="input" name="availability" placeholder="Ex : Immediate"/></div><div class="field"><label class="label">Competences</label><input class="input" name="skills" placeholder="JS, Vente, Design"/></div><p class="help">Vos coordonnees personnelles restent masquees : les recruteurs vous contactent via la messagerie AET.</p><div class="modal-actions"><button type="button" class="btn btn-secondary" id="cancelSeeker">Annuler</button><button class="btn btn-primary" type="submit">Publier</button></div></form>',
      onMount:function(){
        var f=document.getElementById('seekerForm');var cs=document.getElementById('cancelSeeker');if(cs)cs.onclick=function(){var mc=document.getElementById('modalClose');if(mc)mc.click();};
        f.onsubmit=async function(e){
          e.preventDefault();var fd=new FormData(f);
          var j={metier:fd.get('metier'),city:fd.get('city'),contract:fd.get('contract'),experience:fd.get('experience'),availability:fd.get('availability'),skills:(fd.get('skills')||'').split(',').map(function(x){return x.trim();}).filter(Boolean)};
          if(isFbMode()){
            var auth=window.AET.auth,fb=window.AET.fb;var me=auth.currentUser();
            if(!me){ui.toast('Connectez-vous pour publier.','error');return;}
            try{
              await fb.db.collection('jobSeekers').add(Object.assign({},j,{uid:me.uid,name:me.displayName||me.email,ts:firebase.firestore.FieldValue.serverTimestamp()}));
              realSeekers=null;ui.toast('Votre recherche a ete publiee','success');var mc=document.getElementById('modalClose');if(mc)mc.click();renderSeekers();
            }catch(err){ui.toast('Erreur : '+err.message,'error');}
          }else{
            data.addJobSeeker(j);data.audit('seeker_post',j.metier);ui.toast('Votre recherche a ete publiee','success');var mc2=document.getElementById('modalClose');if(mc2)mc2.click();renderSeekers();
          }
        };
      }
    });
  }
  window.AET.jobs={render:function(){render();renderSeekers();},openPost:openPost,openPostSeeker:openPostSeeker,invalidate:function(){realJobs=null;realSeekers=null;}};
})();
