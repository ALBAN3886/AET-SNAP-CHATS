# Deploiement AET RENCONTRE

## Prerequis
* Node.js 18+
* Firebase CLI : `npm i -g firebase-tools`
* Projet Firebase cree

## Configuration
Editer `firebase-config.js` : remplacer `VOTRE_API_KEY_ICI`, `VOTRE_APP_ID_ICI`, `VOTRE_MEASUREMENT_ID_ICI` par les valeurs reelles.

## Initialiser admin
```js
const admin=require('firebase-admin');admin.initializeApp();
admin.auth().setCustomUserClaims('UID',{admin:true,age:30});
```

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
