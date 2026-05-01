import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDtfCAazTf_YIsD9WP1mzVR-AWfzaBBd94",
  authDomain: "greenbyte-998d0.firebaseapp.com",
  projectId: "greenbyte-998d0",
  storageBucket: "greenbyte-998d0.firebasestorage.app",
  messagingSenderId: "6616212059",
  appId: "1:6616212059:web:5f38a3ac143b3eaa24157e"
};

const missingKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingKeys.length) {
  throw new Error(`Missing Firebase env vars: ${missingKeys.join(', ')}`);
}

const firebaseApp = firebase.apps.length ? firebase.app() : firebase.initializeApp(firebaseConfig);
const firebaseAuth = firebase.auth(firebaseApp);

export { firebase, firebaseApp, firebaseAuth, firebaseConfig };
