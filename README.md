# AET RENCONTRE

Plateforme communautaire adulte : rencontres, messages & matchs, actualites, emploi.
Identite visuelle : corail #E85D75, blanc, noir. Mobile-first.

## Demarrage immediat (mode demo)

Aucune cle necessaire. Servir le dossier via :
```bash
cd aet && python3 -m http.server 5000
```
Ouvrir : http://localhost:5000/ (landing), /app.html (application), /admin.html (console).

## Deploiement Firebase

1. Creer le projet sur Firebase, activer Auth (Email/Password), Firestore, Storage, Functions.
2. Editer `firebase-config.js` avec vos vraies cles.
3. Deployer :
```bash
firebase login && firebase deploy --only firestore:rules,firestore:indexes,storage,functions,hosting
```

## Cloud Functions Node 18

| Fonction | Type | Role |
| --- | --- | --- |
| `ensureAdult` | Auth blocking | bloque comptes < 18 ans |
| `createUserProfile` | onCall | cree `users/{uid}` |
| `likeUser` | onCall | match mutuel + notifs |
| `sendMessage` | onCall | push message + update match |
| `reportContent` | onCall | signalement |
| `adminAction` | onCall | audit log |
| `healthz` | HTTP | GET /healthz |

## Personnalisation

* Couleurs : variables CSS `--coral`, `--coral-dark`, `--coral-soft` dans `css/styles.css`
* Branding : `assets/icons/icon-192.png`, `assets/icons/icon-512.png`
* Contenu seed : `js/data.js` (names, cities, news, jobs)

## Scripts npm

```bash
npm start            # emulators Firebase
npm run deploy       # deploiement complet
npm run deploy:hosting
npm run deploy:rules
npm run deploy:functions
```

## Securite

* Firestore Rules : `users/*` proprietaire/admin, `matches/*` participants, `news` et `jobs` lecture publique.
* Storage Rules : photos 5Mo, CV 8Mo, logos 2Mo, type mime controle.
* Functions : claim `age >= 18` requis pour acceder.

## Schema Firestore

Voir `db/firestore-schema.md`.
