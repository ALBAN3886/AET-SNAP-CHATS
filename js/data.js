window.AET=window.AET||{};
(function(){
  'use strict';
  var NAMES=['Aicha K.','Marc D.','Lea M.','Soro B.','Fatou N.','Kevin L.','Awa C.','Yannick T.','Maimouna D.','Ibrahim S.','Lina B.','Olivier P.','Nadia O.','Cheikh F.','Aminata D.'];
  var CITIES=['Dakar','Abidjan','Bamako','Kinshasa','Lome','Cotonou','Yaounde','Douala','Niamey','Ouagadougou','Paris','Montreal','Bruxelles'];
  var TAGS=['Voyages','Cuisine','Lecture','Sport','Musique','Cinema','Photo','Tech','Art','Mode','Nature','Entrepreneuriat'];
  var BIOS=['Curieux(se) de rencontres serieuses et d echanges durables.','Aime les bons petits-dejeuners et longues discussions.','Passionne(e) de culture et d art.','Ouvert(e) d esprit, aime rire et decouvrir.'];
  var NEWS=[{category:'Communaute',title:'Bienvenue sur AET RENCONTRE',excerpt:'Decouvrez la plateforme pensee pour les adultes francophones.',icon:'A'},{category:'Evenements',title:'Soiree de lancement - Dakar',excerpt:'Premier evenement AET, inscription gratuite.',icon:'S'},{category:'Culture',title:'Selection de la semaine',excerpt:'Musique, litterature, art.',icon:'C'},{category:'Carriere',title:'Les profils les plus completes...',excerpt:'Notre analyse comportementale.',icon:'E'},{category:'Conseils',title:'Ecrire une bio qui sort du lot',excerpt:'5 conseils pratiques.',icon:'B'},{category:'Communiques',title:'Mise a jour - nouveaux filtres emploi',excerpt:'Secteur, ville, contrat.',icon:'A'}];
  var JOBS=[{title:'Developpeur Full-Stack',company:'AET Labs',city:'Dakar',contract:'cdi',salary:'3 500 - 4 500 EUR',tags:['JS','Node','Cloud']},{title:'UX Designer',company:'AET Design',city:'Abidjan',contract:'cdi',salary:'2 800 - 3 500 EUR',tags:['Figma','Mobile']},{title:'Commercial terrain',company:'AET Market',city:'Bamako',contract:'cdd',salary:'1 200 - 1 600 EUR',tags:['Vente','B2B']},{title:'Community Manager',company:'AET Voice',city:'Lome',contract:'freelance',salary:'800 - 1 200 EUR',tags:['Social','Contenu']},{title:'Stagiaire Data',company:'AET Analytics',city:'Paris',contract:'stage',salary:'1 000 - 1 200 EUR',tags:['Python','SQL']},{title:'Coordinateur logistique',company:'AET Move',city:'Kinshasa',contract:'cdi',salary:'2 000 - 2 800 EUR',tags:['Ops','Logistique']}];
  function _u(){var n=NAMES[Math.floor(Math.random()*NAMES.length)];var c=CITIES[Math.floor(Math.random()*CITIES.length)];var b=BIOS[Math.floor(Math.random()*BIOS.length)];var age=22+Math.floor(Math.random()*18);var av=n.split(' ').map(function(x){return x[0];}).join('').slice(0,2).toUpperCase();return{uid:'demo-'+Math.random().toString(36).slice(2,9),displayName:n,age:age,city:c,bio:b,gender:Math.random()>0.5?'woman':'man',avatar:av,photos:[],interests:[TAGS[Math.floor(Math.random()*TAGS.length)],TAGS[Math.floor(Math.random()*TAGS.length)]],isVerified:Math.random()>0.4,isOnline:Math.random()>0.5};}
  var STORAGE_KEY='aet_state_v2';
  var seq=0;function uid(){return 'd-'+(++seq)+'-'+Math.random().toString(36).slice(2,7);}

  function freshState(){
    var pool=[];for(var i=0;i<20;i++)pool.push(_u());
    var state={pool:pool,matches:[],messages:[],news:NEWS.slice(),jobs:JOBS.slice(),jobSeekers:[],notifications:[],reports:[],audit:[]};
    state.matches.push({id:uid(),userIds:['me','A'],other:{uid:'A',displayName:pool[0].displayName,age:pool[0].age,avatar:pool[0].avatar},lastMessage:'Salut ! Tu es dispo ce week-end ?',updatedAt:Date.now()-90000,unread:2});
    state.matches.push({id:uid(),userIds:['me','B'],other:{uid:'B',displayName:pool[1].displayName,age:pool[1].age,avatar:pool[1].avatar},lastMessage:'Merci pour la reco cafe, top !',updatedAt:Date.now()-3600000,unread:0});
    return state;
  }

  function load(){
    try{
      var raw=window.localStorage.getItem(STORAGE_KEY);
      if(!raw)return freshState();
      var parsed=JSON.parse(raw);
      // toujours fusionner avec des defauts pour eviter les champs manquants apres mise a jour du code
      var base=freshState();
      return Object.assign(base,parsed,{pool:(parsed.pool&&parsed.pool.length?parsed.pool:base.pool)});
    }catch(e){return freshState();}
  }

  var state=load();

  var saveTimer=null;
  function save(){
    clearTimeout(saveTimer);
    saveTimer=setTimeout(function(){
      try{window.localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}catch(e){/* quota/private mode: on ignore silencieusement */}
    },150);
  }

  window.AET.data={
    state:state,
    save:save,
    reset:function(){state=freshState();window.AET.data.state=state;save();},
    addMatch:function(o){var id=uid();state.matches.unshift({id:id,userIds:['me',o.uid],other:o,lastMessage:'Nouvelle connexion',updatedAt:Date.now(),unread:0});save();return id;},
    addMessage:function(m,t,me){var ms=state.messages.find(function(x){return x.matchId===m;})||{matchId:m,messages:[]};if(state.messages.indexOf(ms)<0)state.messages.push(ms);ms.messages.push({fromMe:me!==false,text:t,ts:Date.now()});var match=state.matches.find(function(x){return x.id===m;});if(match){match.lastMessage=t;match.updatedAt=Date.now();match.unread=me?0:(match.unread||0)+1;}save();},
    addJobSeeker:function(j){j.id=uid();j.ts=Date.now();state.jobSeekers.unshift(j);save();return j.id;},
    pushNotif:function(t){state.notifications.unshift({id:uid(),text:t,time:new Date(),ts:Date.now(),read:false});save();},
    markNotifsRead:function(){state.notifications.forEach(function(n){n.read=true;});save();},
    audit:function(a,d){state.audit.unshift({ts:Date.now(),action:a,detail:d});save();}
  };
})();