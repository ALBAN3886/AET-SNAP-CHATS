window.AET=window.AET||{};
(function(){
  'use strict';
  var cfg=window.AET_FIREBASE_CONFIG||{};
  var app=null,auth=null,db=null,storage=null,functionsApi=null;
  function initFb(){
    if(!cfg.apiKey||String(cfg.apiKey).indexOf('VOTRE_')===0){console.warn('[AET] Firebase non configure - mode demo.');return false;}
    try{
      if(!window.firebase.apps.length){app=window.firebase.initializeApp(cfg);}else{app=window.firebase.apps[0];}
      auth=window.firebase.auth();db=window.firebase.firestore();storage=window.firebase.storage();
      functionsApi=window.firebase.app().functions('europe-west1');
      window.AET.fb={app:app,auth:auth,db:db,storage:storage,functions:functionsApi};return true;
    }catch(e){console.warn('[AET] Firebase init impossible:',e.message);return false;}
  }
  function currentUser(){return auth?auth.currentUser:(window.AET._demoUser||null);}
  function isFirebaseActive(){return !!auth;}
  async function isAdminUser(){
    if(!auth)return true;
    var u=auth.currentUser;if(!u)return false;
    try{var res=await u.getIdTokenResult(true);return res.claims&&res.claims.admin===true;}
    catch(e){console.warn('[AET] verification admin impossible:',e.message);return false;}
  }
  function onAuthChange(cb){
    if(auth){auth.onAuthStateChanged(function(u){cb(u);});}
    else{cb(null);}
  }
  async function getProfile(uid){
    if(!db)return null;
    try{var doc=await db.collection('users').doc(uid).get();return doc.exists?doc.data():null;}catch(e){console.warn('[AET] getProfile impossible:',e.message);return null;}
  }
  async function signIn(e,p){if(auth){return auth.signInWithEmailAndPassword(e,p);}var u={uid:'demo-'+btoa(e).slice(0,10),email:e,displayName:e.split('@')[0]};window.AET._demoUser=u;return{user:u};}
  async function signUp(p){
    if(auth){
      var c=await auth.createUserWithEmailAndPassword(p.email,p.password);
      await c.user.updateProfile({displayName:p.displayName});
      if(db){await db.collection('users').doc(c.user.uid).set({uid:c.user.uid,email:p.email,displayName:p.displayName,birthdate:p.birthdate?new Date(p.birthdate):null,city:p.city||'',gender:p.gender||'other',bio:'',photos:[],interests:[],preferences:{ageMin:18,ageMax:50,maxDistance:50,gender:'all'},isVisible:true,isVerified:false,isAdmin:false,createdAt:window.firebase.firestore.FieldValue.serverTimestamp(),lastActive:window.firebase.firestore.FieldValue.serverTimestamp()});}
      return c;
    }
    var u={uid:'demo-'+btoa(p.email).slice(0,10),email:p.email,displayName:p.displayName};window.AET._demoUser=u;return{user:u};
  }
  async function signOut(){if(auth){await auth.signOut();}window.AET._demoUser=null;}
  window.AET.auth={initFb:initFb,currentUser:currentUser,signIn:signIn,signUp:signUp,signOut:signOut,isFirebaseActive:isFirebaseActive,onAuthChange:onAuthChange,getProfile:getProfile,isAdminUser:isAdminUser};
})();