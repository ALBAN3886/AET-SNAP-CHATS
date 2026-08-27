# Audit technique — AET RENCONTRE
_Etat au 26/08/2026 — revue de code complete avant mise en production_

## Corrige dans ce lot

**Bug critique — `js/services/matches.js`**
`renderList()` ecrasait systematiquement les vrais matchs Firebase par les donnees de demo
(`var ms=data.state.matches;` en plein milieu de la fonction, juste apres avoir recu les
vrais matchs en parametre). Consequence en production : un utilisateur connecte via Firebase
ne voyait jamais ses vrais matchs, uniquement les profils demo. Corrige — la fonction utilise
maintenant le parametre recu.

## A savoir avant de deployer

**1. `firebase-config.js` contient deja une vraie configuration Firebase**
(`projectId: aet-rencontre`). Les cles Firebase web (`apiKey`, etc.) sont concues pour etre
publiques — la securite reelle vient des Firestore/Storage Rules, pas de cette cle. Rien
d'urgent, mais verifiez que ce projet Firebase est bien celui que vous voulez utiliser, et que
vous n'avez pas laisse de cle de test/dev qui pointe vers de vraies donnees.

**2. Console admin (`admin.html`) : incomplete pour la prod**
Seule la section "Actualites" lit reellement Firestore. Les sections Utilisateurs,
Signalements, Offres d'emploi et Audit affichent encore des donnees de demonstration meme
quand Firebase est actif. A faire avant mise en prod reelle :
- Brancher `loadUsers`, `loadReports`, `loadJobs`, `loadAudit` sur Firestore (meme logique que
  `loadNews`, deja fonctionnelle, a dupliquer).
- Verifier le custom claim `admin` cote client avant d'afficher le tableau de bord (aujourd'hui
  l'ecran admin s'affiche des qu'un email/mot de passe quelconque est saisi — les Firestore
  Rules bloquent les vraies actions mais l'interface ne devrait meme pas s'afficher).

**3. Cloud Functions vs ecriture directe Firestore**
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
1. Decider du sort des Cloud Functions redondantes (point 3).
2. Completer la console admin pour lire les vraies donnees (point 2) — sinon un admin ne peut
   pas moderer les vrais utilisateurs/signalements une fois l'app en prod.
3. Ajouter la verification du custom claim `admin` avant d'afficher `admin.html`.
4. Definir le vrai projet Firebase de prod et deployer (`docs/SETUP.md`).
5. Tests manuels bout-en-bout : inscription (verif 18+), swipe/match, chat temps reel,
   publication article (moderation), publication offre d'emploi.
