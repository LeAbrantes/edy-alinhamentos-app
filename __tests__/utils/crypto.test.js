import { generateSalt, hashPassword, verifyPassword } from '../../src/utils/crypto';

describe('Hash de senha (SHA-256 + salt)', () => {
  test('SHA-256 correto: confere com valor conhecido', async () => {
    // sha256("abc") é um vetor de teste padrão do algoritmo; salt vazio => hash de "abc"
    expect(await hashPassword('abc', '')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    );
  });

  test('o hash tem 64 caracteres hexadecimais e não contém a senha', async () => {
    const hash = await hashPassword('minhaSenha123', 'salt-1');
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(hash).not.toContain('minhaSenha123');
  });

  test('é determinístico: mesma senha e mesmo salt => mesmo hash', async () => {
    expect(await hashPassword('abc123', 's1')).toBe(await hashPassword('abc123', 's1'));
  });

  test('salts diferentes geram hashes diferentes para a MESMA senha', async () => {
    expect(await hashPassword('abc123', 'salt-A')).not.toBe(await hashPassword('abc123', 'salt-B'));
  });

  test('senhas diferentes geram hashes diferentes', async () => {
    expect(await hashPassword('abc123', 's')).not.toBe(await hashPassword('abc124', 's'));
  });

  test('aceita acentos e símbolos na senha', async () => {
    expect(await hashPassword('Sênha@Çã9!', 's')).toMatch(/^[0-9a-f]{64}$/);
  });

  test('generateSalt gera valores únicos', () => {
    const a = generateSalt();
    const b = generateSalt();
    expect(a).not.toBe(b);
    expect(a.length).toBeGreaterThanOrEqual(16);
  });

  test('verifyPassword aceita a senha certa e recusa a errada', async () => {
    const salt = generateSalt();
    const hash = await hashPassword('segredo1', salt);
    expect(await verifyPassword('segredo1', salt, hash)).toBe(true);
    expect(await verifyPassword('segredo2', salt, hash)).toBe(false);
  });

  test('verifyPassword recusa quando faltam salt ou hash guardados', async () => {
    expect(await verifyPassword('abc', undefined, 'x')).toBe(false);
    expect(await verifyPassword('abc', 's', undefined)).toBe(false);
  });
});
