/* AET RENCONTRE - remplacer les valeurs VOTRE_*_ICI par votre config Firebase */
window.AET_FIREBASE_CONFIG={
  apiKey:"VOTRE_API_KEY_ICI",
  authDomain:"aet-rencontre.firebaseapp.com",
  projectId:"aet-rencontre",
  storageBucket:"aet-rencontre.appspot.com",
  messagingSenderId:"000000000000",
  appId:"VOTRE_APP_ID_ICI",
  measurementId:"VOTRE_MEASUREMENT_ID_ICI"};
window.AET_USE_FIREBASE=!window.AET_FIREBASE_CONFIG.apiKey.startsWith("VOTRE_");
window.AET_DEMO_MODE=!window.AET_USE_FIREBASE;
