window.AET=window.AET||{};
(function(){
  'use strict';
  var ui=window.AET.ui,data=window.AET.data;
  function render(){
    var host=document.getElementById('jobsList');if(!host)return;
    var q=(document.getElementById('jobSearch')?document.getElementById('jobSearch').value:'').toLowerCase();
    var ct=(document.getElementById('jobContract')?document.getElementById('jobContract').value:'');
    var list=data.state.jobs.filter(function(j){return (!ct||j.contract===ct)&&(!q||(j.title+' '+j.company+' '+j.city).toLowerCase().indexOf(q)>=0);});
    host.innerHTML=list.map(function(j){return '<article class="job-card" data-jid="'+j.title+'-'+j.company+'"><div class="job-card__head"><div class="job-card__logo">'+ui.escapeHtml((j.company||'?')[0])+'</div><div><div class="job-card__title">'+ui.escapeHtml(j.title)+'</div><div class="job-card__company">'+ui.escapeHtml(j.company)+' &middot; '+ui.escapeHtml(j.city)+'</div></div></div><div class="job-card__tags">'+(j.tags||[]).map(function(t){return '<span class="badge">'+ui.escapeHtml(t)+'</span>';}).join('')+' <span class="badge">'+ui.escapeHtml((j.contract||'').toUpperCase())+'</span></div><div class="job-card__foot"><span class="salary">'+ui.escapeHtml(j.salary||'')+'</span><button class="btn btn-secondary btn-sm" type="button">Postuler</button></div></article>';}).join('')||'<div class="empty"><div class="empty__icon">&#128188;</div><h3>Aucune offre</h3></div>';
    var s=document.getElementById('jobSearch');if(s&&!s.__b){s.addEventListener('input',render);s.__b=true;}
    var c=document.getElementById('jobContract');if(c&&!c.__b){c.addEventListener('change',render);c.__b=true;}
    host.querySelectorAll('[data-jid]').forEach(function(el){el.onclick=function(){ui.toast('Candidature envoyee','success');data.audit('job_apply',el.dataset.jid);};});
  }
  function openPost(){
    ui.modal({html:'<h3>Publier une offre</h3><form id="jobForm"><div class="field"><label class="label">Titre</label><input class="input" name="title" required/></div><div class="field"><label class="label">Entreprise</label><input class="input" name="company" required/></div><div class="field"><label class="label">Ville</label><input class="input" name="city" required/></div><div class="field"><label class="label">Type</label><select class="input" name="contract"><option value="cdi">CDI</option><option value="cdd">CDD</option><option value="freelance">Freelance</option><option value="stage">Stage</option></select></div><div class="field"><label class="label">Salaire</label><input class="input" name="salary" placeholder="2000 - 3000 EUR"/></div><div class="field"><label class="label">Tags</label><input class="input" name="tags" placeholder="JS, Cloud, Mobile"/></div><div class="modal-actions"><button type="button" class="btn btn-secondary" id="cancelJob">Annuler</button><button class="btn btn-primary" type="submit">Publier</button></div></form>',
      onMount:function(){
        var f=document.getElementById('jobForm');var cj=document.getElementById('cancelJob');if(cj)cj.onclick=function(){var mc=document.getElementById('modalClose');if(mc)mc.click();};
        f.onsubmit=function(e){e.preventDefault();var fd=new FormData(f);var j={title:fd.get('title'),company:fd.get('company'),city:fd.get('city'),contract:fd.get('contract'),salary:fd.get('salary'),tags:(fd.get('tags')||'').split(',').map(function(x){return x.trim();}).filter(Boolean)};data.state.jobs.unshift(j);data.audit('job_post',j.title);ui.toast('Offre publiee','success');var mc=document.getElementById('modalClose');if(mc)mc.click();render();};
      }
    });
  }
  function renderSeekers(){
    var host=document.getElementById('jobSeekersList');if(!host)return;
    var q=(document.getElementById('seekerSearch')?document.getElementById('seekerSearch').value:'').toLowerCase();
    var list=(data.state.jobSeekers||[]).filter(function(j){return !q||(j.metier+' '+j.city).toLowerCase().indexOf(q)>=0;});
    host.innerHTML=list.map(function(j){return '<article class="job-card"><div class="job-card__head"><div class="job-card__logo">'+ui.escapeHtml((j.metier||'?')[0])+'</div><div><div class="job-card__title">'+ui.escapeHtml(j.metier)+'</div><div class="job-card__company">'+ui.escapeHtml(j.city||'')+' &middot; '+ui.escapeHtml(j.availability||'Disponibilite non precisee')+'</div></div></div><div class="job-card__tags">'+(j.skills||[]).map(function(t){return '<span class="badge">'+ui.escapeHtml(t)+'</span>';}).join('')+' <span class="badge">'+ui.escapeHtml((j.contract||'').toUpperCase())+'</span></div><div class="job-card__foot"><span class="salary">'+ui.escapeHtml(j.experience||'')+'</span><button class="btn btn-secondary btn-sm" type="button" data-contact="'+j.id+'">Contacter</button></div></article>';}).join('')||'<div class="empty"><div class="empty__icon">&#128188;</div><h3>Aucune demande d emploi</h3><p>Soyez le premier a publier votre recherche.</p></div>';
    var s=document.getElementById('seekerSearch');if(s&&!s.__b){s.addEventListener('input',renderSeekers);s.__b=true;}
    host.querySelectorAll('[data-contact]').forEach(function(el){el.onclick=function(){ui.toast('Mis en relation via la messagerie AET','success');data.audit('seeker_contact',el.dataset.contact);};});
  }
  function openPostSeeker(){
    ui.modal({html:'<h3>Publier ma recherche d emploi</h3><form id="seekerForm"><div class="field"><label class="label">Metier recherche</label><input class="input" name="metier" required/></div><div class="field"><label class="label">Ville</label><input class="input" name="city" required/></div><div class="field"><label class="label">Type de contrat</label><select class="input" name="contract"><option value="cdi">CDI</option><option value="cdd">CDD</option><option value="freelance">Freelance</option><option value="stage">Stage</option></select></div><div class="field"><label class="label">Experience</label><input class="input" name="experience" placeholder="Ex : 3 ans"/></div><div class="field"><label class="label">Disponibilite</label><input class="input" name="availability" placeholder="Ex : Immediate"/></div><div class="field"><label class="label">Competences</label><input class="input" name="skills" placeholder="JS, Vente, Design"/></div><p class="help">Vos coordonnees personnelles restent masquees : les recruteurs vous contactent via la messagerie AET.</p><div class="modal-actions"><button type="button" class="btn btn-secondary" id="cancelSeeker">Annuler</button><button class="btn btn-primary" type="submit">Publier</button></div></form>',
      onMount:function(){
        var f=document.getElementById('seekerForm');var cs=document.getElementById('cancelSeeker');if(cs)cs.onclick=function(){var mc=document.getElementById('modalClose');if(mc)mc.click();};
        f.onsubmit=function(e){e.preventDefault();var fd=new FormData(f);var j={metier:fd.get('metier'),city:fd.get('city'),contract:fd.get('contract'),experience:fd.get('experience'),availability:fd.get('availability'),skills:(fd.get('skills')||'').split(',').map(function(x){return x.trim();}).filter(Boolean)};data.addJobSeeker(j);data.audit('seeker_post',j.metier);ui.toast('Votre recherche a ete publiee','success');var mc=document.getElementById('modalClose');if(mc)mc.click();renderSeekers();};
      }
    });
  }
  window.AET.jobs={render:function(){render();renderSeekers();},openPost:openPost,openPostSeeker:openPostSeeker};
})();