window.AET=window.AET||{};
(function(){
  'use strict';
  var ui=window.AET.ui,data=window.AET.data;
  var realNews=null;

  function isFbMode(){var auth=window.AET.auth;return auth&&auth.isFirebaseActive();}

  async function fetchRealNews(){
    var fb=window.AET.fb;if(!fb||!fb.db)return[];
    try{
      var snap=await fb.db.collection('news').where('status','==','published').orderBy('createdAt','desc').limit(50).get();
      return snap.docs.map(function(d){return Object.assign({id:d.id},d.data());});
    }catch(e){console.warn('[AET] fetchRealNews impossible:',e.message);return[];}
  }

  function render(cat){
    if(isFbMode()){
      if(realNews===null){
        var host0=document.getElementById('newsGrid');if(host0)host0.innerHTML='<div class="empty"><div class="empty__icon">&#8987;</div><h3>Chargement...</h3></div>';
        fetchRealNews().then(function(list){realNews=list;render(cat);});
        return;
      }
      renderList(realNews,cat,true);
    }else{
      renderList(data.state.news,cat,false);
    }
  }

  function renderList(source,cat,real){
    var host=document.getElementById('newsGrid');var filters=document.getElementById('newsFilters');if(!host)return;
    var cats=['Toutes'].concat(Array.from(new Set(source.map(function(n){return n.category;}).filter(Boolean))));
    if(filters){filters.innerHTML=cats.map(function(c){return '<button class="btn '+(((!cat||cat==='Toutes')&&c==='Toutes')||cat===c?'btn-primary':'btn-secondary')+' btn-sm" data-cat="'+ui.escapeHtml(c)+'">'+ui.escapeHtml(c)+'</button>';}).join('');filters.querySelectorAll('[data-cat]').forEach(function(b){b.onclick=function(){render(b.dataset.cat);};});}
    var list=(!cat||cat==='Toutes')?source:source.filter(function(n){return n.category===cat;});
    host.innerHTML=list.map(function(n){return '<article class="news-card"><div class="news-card__img">'+ui.escapeHtml(n.icon||'A')+'</div><div class="news-card__body"><div class="news-card__cat">'+ui.escapeHtml(n.category||'')+'</div><div class="news-card__title">'+ui.escapeHtml(n.title)+'</div><div class="news-card__excerpt">'+ui.escapeHtml(n.excerpt||'')+'</div><div class="news-card__meta"><span>'+ui.escapeHtml(n.authorName||'AET Editorial')+'</span><span>'+(n.createdAt&&n.createdAt.toMillis?ui.timeAgo(n.createdAt.toMillis()):ui.timeAgo(Date.now()-Math.random()*4.32e7))+'</span></div></div></article>';}).join('')||'<div class="empty"><div class="empty__icon">&#128240;</div><h3>Aucun article</h3>'+(real?'<p>Soyez le premier a proposer un article a la redaction.</p>':'')+'</div>';
  }

  function openPropose(){
    if(!isFbMode()){ui.toast('La proposition d\'articles sera activee avec Firebase.','error');return;}
    var auth=window.AET.auth;var me=auth.currentUser();
    if(!me){ui.toast('Connectez-vous pour proposer un article.','error');return;}
    ui.modal({html:'<h3>Proposer un article</h3><p class="help">Votre article sera visible publiquement seulement apres validation par la moderation AET.</p><form id="newsForm"><div class="field"><label class="label">Titre</label><input class="input" name="title" required/></div><div class="field"><label class="label">Categorie</label><select class="input" name="category"><option>Emploi</option><option>Formation</option><option>Technologie</option><option>Entrepreneuriat</option><option>Societe</option><option>Culture</option><option>Opportunites</option></select></div><div class="field"><label class="label">Resume</label><textarea class="input" name="excerpt" rows="4" required></textarea></div><div class="modal-actions"><button type="button" class="btn btn-secondary" id="cancelNews">Annuler</button><button class="btn btn-primary" type="submit">Envoyer pour moderation</button></div></form>',
      onMount:function(){
        var f=document.getElementById('newsForm');var cn=document.getElementById('cancelNews');if(cn)cn.onclick=function(){var mc=document.getElementById('modalClose');if(mc)mc.click();};
        f.onsubmit=async function(e){
          e.preventDefault();var fd=new FormData(f);var fb=window.AET.fb;
          try{
            await fb.db.collection('news').add({title:fd.get('title'),category:fd.get('category'),excerpt:fd.get('excerpt'),authorId:me.uid,authorName:me.displayName||me.email,status:'pending',createdAt:firebase.firestore.FieldValue.serverTimestamp()});
            ui.toast('Article envoye pour moderation. Il sera publie une fois valide.','success');
            var mc=document.getElementById('modalClose');if(mc)mc.click();
          }catch(err){ui.toast('Erreur : '+err.message,'error');}
        };
      }});
  }

  window.AET.news={render:render,openPropose:openPropose,invalidate:function(){realNews=null;}};
})();
