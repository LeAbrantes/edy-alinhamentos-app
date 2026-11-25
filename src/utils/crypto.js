// Proteção de senha com HASH: SHA-256 + "salt" (texto aleatório único por usuário).
//
// Hash é um caminho de mão única: a partir de "abc123" se calcula o resumo, mas não existe
// conta que volte do resumo para "abc123". Por isso o banco guarda só o resumo (senhaHash) e
// o salt; no login, o app refaz o cálculo com a senha digitada e compara os resultados.
// O salt impede que duas pessoas com a mesma senha tenham o mesmo hash.
import * as Crypto from 'expo-crypto';

// Gera um salt aleatório (UUID v4) para um novo usuário
export function generateSalt() {
  return Crypto.randomUUID();
}

// SHA-256 de (salt + senha), em hexadecimal (64 caracteres)
export async function hashPassword(password, salt) {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${salt}${String(password ?? '')}`,
  );
}

// Confere a senha digitada com o hash guardado
export async function verifyPassword(plain, salt, storedHash) {
  if (!salt || !storedHash) return false;
  return (await hashPassword(plain, salt)) === storedHash;
}
