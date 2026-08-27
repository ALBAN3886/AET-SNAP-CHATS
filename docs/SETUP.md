# Deploiement AET RENCONTRE

## Prerequis
* Node.js 18+
* Firebase CLI : `npm i -g firebase-tools`
* Projet Firebase cree

## Configuration
Editer `firebase-config.js` : remplacer `VOTRE_API_KEY_ICI`, `VOTRE_APP_ID_ICI`, `VOTRE_MEASUREMENT_ID_ICI` par les valeurs reelles.

## Initialiser un compte admin
La console admin (`admin.html`) verifie le custom claim Firebase `admin` avant d'afficher quoi
que ce soit. Un compte normal ne peut jamais se l'attribuer lui-meme : il faut executer ce
script une seule fois, cote serveur, avec les droits Firebase Admin.

1. Recuperer l'UID du compte a promouvoir : Firebase Console -> Authentication -> Users ->
   copier l'UID de la ligne correspondante.
2. Creer un fichier `set-admin.js` local (ne pas le commiter) :
```js
const admin=require('firebase-admin');
admin.initializeApp({credential:admin.credential.applicationDefault()});
admin.auth().setCustomUserClaims('UID_DU_COMPTE',{admin:true}).then(()=>{
  console.log('OK, deconnecter/reconnecter le compte pour que le claim prenne effet.');
  process.exit(0);
});
```
3. Lancer avec les identifiants de service : `gcloud auth application-default login` puis
   `node set-admin.js`.
4. Le compte doit se deconnecter/reconnecter (ou attendre le rafraichissement du token, ~1h)
   pour que `admin.html` reconnaisse le nouveau claim.

## Deployer
```bash
firebase login
firebase use aet-rencontre
firebase deploy --only firestore:rules,firestore:indexes,storage
firebase deploy --only functions
firebase deploy --only hosting
```

## Emulateurs locaux
```bash
firebase emulators:start
```
Ports : Auth 9099, Firestore 8080, Storage 9199, Functions 5001, Hosting 5000.

## Mode demo (sans Firebase)
Aucune cle requise - l'app bascule automatiquement en mode demo avec donnees en memoire. Servir le dossier via `python -m http.server 5000` et ouvrir `http://localhost:5000`.
