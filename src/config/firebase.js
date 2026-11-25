// Configuração do Firebase (persistência de dados via Cloud Firestore).
// Os valores vêm do arquivo .env (veja .env.example). Variáveis EXPO_PUBLIC_* são
// embutidas no app pelo Expo no momento do bundle.
import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export function isFirebaseConfigured() {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

function createDb() {
  try {
    // Long polling automático evita travamentos de conexão do Firestore no React Native.
    return initializeFirestore(app, { experimentalAutoDetectLongPolling: true });
  } catch (e) {
    // Em Fast Refresh o Firestore já foi inicializado: reaproveita a instância.
    return getFirestore(app);
  }
}

export const db = createDb();
