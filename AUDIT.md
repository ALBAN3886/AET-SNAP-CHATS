# Audit technique — AET RENCONTRE
_Etat au 26/08/2026 — revue de code complete avant mise en production_

## Corrige dans ce lot

**Bug critique — `js/services/matches.js`**
`renderList()` ecrasait systematiquement les vrais matchs Firebase par les donnees de demo
(`var ms=data.state.matches;` en plein milieu de la fonction, juste apres avoir recu les
vrais matchs en parametre). Consequence en production : un utilisateur connecte via Firebase
ne voyait jamais ses vrais matchs, uniquement les profils demo. Corrige — la fonction utilise
maintenant le parametre recu.

**Console admin — verification du role + donnees reelles (`js/services/admin.js`, `js/auth.js`)**
Deux problemes corriges ensemble :
- La connexion admin affichait le tableau de bord des qu'un email/mot de passe quelconque
  etait accepte par Firebase Auth, sans verifier que ce compte a bien le droit admin. Ajout de
  `auth.isAdminUser()` qui lit le custom claim `admin` du token ; si absent, le compte est
  deconnecte et un message d'erreur s'affiche, sans jamais montrer l'interface.
- Les sections Utilisateurs, Signalements, Offres d'emploi et Audit affichaient seulement des
  donnees de demonstration meme en mode Firebase. Elles lisent maintenant Firestore
  (`users`, `reports`, `jobs`, `audit`), avec actions reelles : bannir/reactiver un utilisateur,
  fermer un signalement, publier/supprimer une offre, journal d'audit reel a chaque action
  admin. Voir `docs/SETUP.md` pour attribuer le claim `admin` a un compte.

**Migration likes/messages vers les Cloud Functions (choix : centraliser plutot que garder l'ecriture directe)**
- `functions/src/index.js` : `likeUser` ecrit desormais dans la collection `likes` (au lieu de
  `swipes`, qui n'avait aucune regle de securite associee et etait donc une collection fantome).
- Le client (`js/services/matches.js`, `js/services/messages.js`) appelle maintenant les
  fonctions `likeUser` et `sendMessage` via le SDK Firebase Functions au lieu d'ecrire
  directement dans Firestore. Script `firebase-functions-compat.js` ajoute dans `app.html` et
  `admin.html`, instance initialisee dans `auth.js` (region `europe-west1`, alignee sur
  `functions/src/index.js`).
- **Regles Firestore durcies en consequence** (`firestore.rules`) : creation directe desormais
  refusee sur `likes`, `matches` et `matches/{id}/messages` (`allow create: if false`). Ces
  trois ecritures ne peuvent plus se faire que via les Cloud Functions (qui utilisent le SDK
  Admin, non soumis aux regles). Avant ce changement, un client malveillant aurait pu forger un
  faux match ou envoyer des messages sans passer par la logique metier — c'est desormais
  impossible.
- **Bug corrige au passage** : le chat lisait/ecrivait un champ `ts` alors que le schema
  officiel (`db/firestore-schema.md`) et la Cloud Function utilisaient `createdAt`. Consequence
  reelle : les messages ne s'affichaient pas dans le bon ordre et les signalements envoyes
  depuis la messagerie n'apparaissaient jamais dans la console admin (son `orderBy('createdAt')`
  ne trouvait pas le champ). Tout est aligne sur `createdAt` maintenant.
- A savoir : `firebase deploy --only functions` est necessaire pour que ces changements
  prennent effet (les fonctions modifiees doivent etre redeployees, pas seulement le code
  client).

## A savoir avant de deployer

**1. `firebase-config.js` contient deja une vraie configuration Firebase**
(`projectId: aet-rencontre`). Les cles Firebase web (`apiKey`, etc.) sont concues pour etre
publiques — la securite reelle vient des Firestore/Storage Rules, pas de cette cle. Rien
d'urgent, mais verifiez que ce projet Firebase est bien celui que vous voulez utiliser, et que
vous n'avez pas laisse de cle de test/dev qui pointe vers de vraies donnees.

**2. Mode demo vs mode reel**
L'appli bascule automatiquement en demo si `firebase-config.js` n'est pas renseigne. C'est
deja bien fait et pratique pour tester sans backend.

## Prochaines etapes suggerees (par ordre de priorite)
1. Deployer les Cloud Functions et regles mises a jour :
   `firebase deploy --only functions,firestore:rules` — indispensable, sinon les regles
   bloquent les ecritures directes sans que les fonctions soient encore en place.
2. Definir le vrai projet Firebase de prod et deployer (`docs/SETUP.md`), puis attribuer le
   claim `admin` a au moins un compte reel (voir `docs/SETUP.md`).
3. Tests manuels bout-en-bout : inscription (verif 18+), swipe/match, chat temps reel,
   publication article (moderation), publication offre d'emploi, moderation admin (bannir un
   utilisateur, fermer un signalement, publier/supprimer une offre).
