const admin=require('firebase-admin');
admin.initializeApp();
const db=admin.firestore();
const {onCall,onRequest,HttpsError}=require('firebase-functions/v2/https');
const {beforeUserCreated}=require('firebase-functions/v2/identity');
const {setGlobalOptions}=require('firebase-functions/v2');
setGlobalOptions({region:'europe-west1',maxInstances:10});

function ageOk(bd){if(!bd)return false;const d=new Date(bd);if(isNaN(d))return false;return (Date.now()-d.getTime())/(365.25*86400000)>=18;}

exports.ensureAdult=beforeUserCreated((user)=>{
  if(!user.data||!ageOk(user.data.birthdate)){throw new HttpsError('permission-denied','Vous devez avoir 18 ans ou plus.');}
});

exports.createUserProfile=onCall(async(req)=>{
  const uid=req.auth&&req.auth.uid;if(!uid)throw new HttpsError('unauthenticated','Auth requise');
  const data=req.data||{};
  if(!ageOk(data.birthdate))throw new HttpsError('invalid-argument','18+ requis');
  await db.collection('users').doc(uid).set({
    uid,email:req.auth.token.email||'',displayName:data.displayName||'Utilisateur',
    bio:data.bio||'',city:data.city||'',gender:data.gender||'other',
    age:data.age||null,birthdate:data.birthdate||null,
    interests:data.interests||[],photos:data.photos||[],
    preferences:{ageMin:data.ageMin||18,ageMax:data.ageMax||50,maxDistance:data.maxDistance||50,gender:data.genderPref||'all'},
    isVisible:true,isVerified:false,isAdmin:false,
    createdAt:admin.firestore.FieldValue.serverTimestamp(),
    lastActive:admin.firestore.FieldValue.serverTimestamp()
  },{merge:true});
  return{ok:true};
});

exports.likeUser=onCall(async(req)=>{
  const uid=req.auth&&req.auth.uid;if(!uid)throw new HttpsError('unauthenticated','Auth requise');
  const otherUid=req.data&&req.data.target;if(!otherUid)throw new HttpsError('invalid-argument','Cible requise');
  if(otherUid===uid)throw new HttpsError('invalid-argument','Impossible de se liker soi-meme');
  const reverse=await db.collection('likes').doc(otherUid+'_'+uid).get();
  await db.collection('likes').doc(uid+'_'+otherUid).set({from:uid,to:otherUid,ts:admin.firestore.FieldValue.serverTimestamp()},{merge:true});
  if(reverse.exists){
    const matchId=[uid,otherUid].sort().join('_');
    await db.collection('matches').doc(matchId).set({
      userIds:[uid,otherUid].sort(),
      createdAt:admin.firestore.FieldValue.serverTimestamp(),
      updatedAt:admin.firestore.FieldValue.serverTimestamp(),
      lastMessage:''
    },{merge:true});
    await Promise.all([
      db.collection('notifications').doc(uid).collection('items').add({userId:uid,type:'match',text:'Nouveau match !',read:false,ts:admin.firestore.FieldValue.serverTimestamp()}),
      db.collection('notifications').doc(otherUid).collection('items').add({userId:otherUid,type:'match',text:'Nouveau match !',read:false,ts:admin.firestore.FieldValue.serverTimestamp()})
    ]);
    return{matched:true,matchId};
  }
  return{matched:false};
});

exports.sendMessage=onCall(async(req)=>{
  const uid=req.auth&&req.auth.uid;if(!uid)throw new HttpsError('unauthenticated','Auth requise');
  const {matchId,text}=req.data||{};if(!matchId||!text)throw new HttpsError('invalid-argument','matchId+text requis');
  const snap=await db.collection('matches').doc(matchId).get();if(!snap.exists)throw new HttpsError('not-found','Match introuvable');
  const userIds=snap.data().userIds||[];if(!userIds.includes(uid))throw new HttpsError('permission-denied','Acces refuse');
  await db.collection('matches').doc(matchId).collection('messages').add({senderId:uid,text,createdAt:admin.firestore.FieldValue.serverTimestamp()});
  await db.collection('matches').doc(matchId).update({lastMessage:text,updatedAt:admin.firestore.FieldValue.serverTimestamp()});
  return{ok:true};
});

exports.reportContent=onCall(async(req)=>{
  const uid=req.auth&&req.auth.uid;if(!uid)throw new HttpsError('unauthenticated','Auth requise');
  const {type,target,reason}=req.data||{};
  await db.collection('reports').add({reporterId:uid,type,target,reason:reason||'',status:'open',createdAt:admin.firestore.FieldValue.serverTimestamp()});
  return{ok:true};
});

exports.adminAction=onCall(async(req)=>{
  const uid=req.auth&&req.auth.uid;if(!uid)throw new HttpsError('unauthenticated','Auth requise');
  const token=await admin.auth().getUser(uid).then(u=>u.customClaims||{});
  if(!token.admin)throw new HttpsError('permission-denied','Acces admin requis');
  const {action,target,extra}=req.data||{};
  await db.collection('audit').add({adminId:uid,action,target,extra:extra||'',at:admin.firestore.FieldValue.serverTimestamp()});
  return{ok:true};
});

exports.healthz=onRequest((_req,res)=>res.json({ok:true,service:'aet-rencontre',ts:Date.now()}));
