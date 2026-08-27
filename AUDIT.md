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

## A savoir avant de deployer

**1. `firebase-config.js` contient deja une vraie configuration Firebase**
(`projectId: aet-rencontre`). Les cles Firebase web (`apiKey`, etc.) sont concues pour etre
publiques — la securite reelle vient des Firestore/Storage Rules, pas de cette cle. Rien
d'urgent, mais verifiez que ce projet Firebase est bien celui que vous voulez utiliser, et que
vous n'avez pas laisse de cle de test/dev qui pointe vers de vraies donnees.

**2. Cloud Functions vs ecriture directe Firestore**
Le client ecrit directement dans Firestore (`likeReal`, `sendMessage` cote `messages.js`)
plutot que d'appeler les Cloud Functions `likeUser` / `sendMessage` deja ecrites dans
`functions/src/index.js`. Ce n'est pas un bug — les Firestore Rules autorisent ces ecritures
directes et c'est un choix d'architecture valable pour limiter la latence — mais les deux
chemins existent en parallele avec des noms de collection differents (`likes` cote client vs
`swipes` cote Cloud Function). A trancher : soit on supprime les Cloud Functions redondantes
(`likeUser`, `sendMessage`), soit on migre le client vers les Cloud Functions pour centraliser
la logique (utile si vous voulez ajouter de la moderation automatique plus tard).

**4. Mode demo vs mode reel**
L'appli bascule automatiquement en demo si `firebase-config.js` n'est pas renseigne. C'est
deja bien fait et pratique pour tester sans backend.

## Prochaines etapes suggerees (par ordre de priorite)
1. Decider du sort des Cloud Functions redondantes (point 2 ci-dessus).
2. Definir le vrai projet Firebase de prod et deployer (`docs/SETUP.md`), puis attribuer le
   claim `admin` a au moins un compte reel (voir `docs/SETUP.md`).
3. Tests manuels bout-en-bout : inscription (verif 18+), swipe/match, chat temps reel,
   publication article (moderation), publication offre d'emploi, moderation admin (bannir un
   utilisateur, fermer un signalement, publier/supprimer une offre).
