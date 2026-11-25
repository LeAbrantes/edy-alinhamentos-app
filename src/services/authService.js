// Cadastro e login de usuários. Os dados ficam na coleção "usuarios" do Firestore
// e a senha NUNCA é guardada: salvamos apenas o hash SHA-256 com salt (veja utils/crypto.js).
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db, isFirebaseConfigured } from '../config/firebase';
import { generateSalt, hashPassword, verifyPassword } from '../utils/crypto';
import { validateLogin, validateRegister } from '../utils/validation';

const USERS = 'usuarios';
export const SESSION_KEY = 'edy_session';

function assertConfigured() {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase não configurado. Preencha o arquivo .env (veja .env.example).');
  }
}

async function findUserByEmail(email) {
  const snap = await getDocs(query(collection(db, USERS), where('email', '==', email)));
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
}

export async function registerUser({ nome, email, senha, confirmar }) {
  const error = validateRegister({ nome, email, senha, confirmar: confirmar ?? senha });
  if (error) throw new Error(error);
  assertConfigured();

  const mail = email.trim().toLowerCase();
  if (await findUserByEmail(mail)) throw new Error('Já existe uma conta com este e-mail.');

  const salt = generateSalt();
  const data = {
    nome: nome.trim(),
    email: mail,
    salt,
    senhaHash: await hashPassword(senha, salt), // nunca grava a senha em texto puro
    criadoEm: new Date().toISOString(),
  };
  const ref = await addDoc(collection(db, USERS), data);
  return { id: ref.id, nome: data.nome, email: data.email };
}

export async function loginUser({ email, senha }) {
  const error = validateLogin({ email, senha });
  if (error) throw new Error(error);
  assertConfigured();

  const user = await findUserByEmail(email.trim().toLowerCase());
  if (!user || !(await verifyPassword(senha, user.salt, user.senhaHash))) {
    throw new Error('E-mail ou senha inválidos.');
  }
  return { id: user.id, nome: user.nome, email: user.email };
}

// Sessão local (mantém o usuário logado ao reabrir o app)
export async function saveSession(user) {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export async function loadSession() {
  try {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export async function clearSession() {
  await AsyncStorage.removeItem(SESSION_KEY);
}
