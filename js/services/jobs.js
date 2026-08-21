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
  window.AET.jobs={render:render,openPost:openPost};
})();