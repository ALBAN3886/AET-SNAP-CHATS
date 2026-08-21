window.AET=window.AET||{};
(function(){
  'use strict';
  var cfg=window.AET_FIREBASE_CONFIG||{};
  var app=null,auth=null,db=null,storage=null;
  function initFb(){
    if(!cfg.apiKey||String(cfg.apiKey).indexOf('VOTRE_')===0){console.warn('[AET] Firebase non configure - mode demo.');return false;}
    try{
      if(!window.firebase.apps.length){app=window.firebase.initializeApp(cfg);}else{app=window.firebase.apps[0];}
      auth=window.firebase.auth();db=window.firebase.firestore();storage=window.firebase.storage();
      window.AET.fb={app:app,auth:auth,db:db,storage:storage};return true;
    }catch(e){console.warn('[AET] Firebase init impossible:',e.message);return false;}
  }
  function currentUser(){return auth?auth.currentUser:(window.AET._demoUser||null);}
  async function signIn(e,p){if(auth){return auth.signInWithEmailAndPassword(e,p);}var u={uid:'demo-'+btoa(e).slice(0,10),email:e,displayName:e.split('@')[0]};window.AET._demoUser=u;return{user:u};}
  async function signUp(p){
    if(auth){
      var c=await auth.createUserWithEmailAndPassword(p.email,p.password);
      await c.user.updateProfile({displayName:p.displayName});
      if(db){await db.collection('users').doc(c.user.uid).set({uid:c.user.uid,email:p.email,displayName:p.displayName,birthdate:p.birthdate||null,city:p.city||'',gender:p.gender||'other',bio:'',photos:[],interests:[],preferences:{ageMin:18,ageMax:50,maxDistance:50,gender:'all'},isVisible:true,isVerified:false,isAdmin:false,createdAt:window.firebase.firestore.FieldValue.serverTimestamp(),lastActive:window.firebase.firestore.FieldValue.serverTimestamp()});}
      return c;
    }
    var u={uid:'demo-'+btoa(p.email).slice(0,10),email:p.email,displayName:p.displayName};window.AET._demoUser=u;return{user:u};
  }
  async function signOut(){if(auth){await auth.signOut();}window.AET._demoUser=null;}
  window.AET.auth={initFb:initFb,currentUser:currentUser,signIn:signIn,signUp:signUp,signOut:signOut};
})();