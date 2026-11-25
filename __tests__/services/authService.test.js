import AsyncStorage from '@react-native-async-storage/async-storage';
import { addDoc, getDocs } from 'firebase/firestore';
import {
  clearSession,
  loadSession,
  loginUser,
  registerUser,
  saveSession,
} from '../../src/services/authService';
import { hashPassword } from '../../src/utils/crypto';

jest.mock('firebase/firestore', () => ({
  collection: jest.fn((db, name) => ({ name })),
  query: jest.fn((col) => col),
  where: jest.fn(),
  addDoc: jest.fn(),
  getDocs: jest.fn(),
}));

const vazio = { empty: true, docs: [] };
const comUsuario = (data) => ({ empty: false, docs: [{ id: 'u1', data: () => data }] });

beforeEach(() => {
  jest.clearAllMocks();
  AsyncStorage.clear();
});

describe('registerUser', () => {
  test('grava só o HASH da senha (com salt) e e-mail em minúsculas', async () => {
    getDocs.mockResolvedValue(vazio);
    addDoc.mockResolvedValue({ id: 'novo1' });

    const user = await registerUser({ nome: ' Edy ', email: 'EDY@Oficina.com', senha: 'abc123' });

    const salvo = addDoc.mock.calls[0][1];
    expect(salvo.senha).toBeUndefined(); // a senha em si nunca é gravada
    expect(salvo.salt).toBeTruthy();
    expect(salvo.senhaHash).toBe(await hashPassword('abc123', salvo.salt));
    expect(JSON.stringify(salvo)).not.toContain('abc123');
    expect(salvo.email).toBe('edy@oficina.com');
    expect(salvo.nome).toBe('Edy');
    expect(user).toEqual({ id: 'novo1', nome: 'Edy', email: 'edy@oficina.com' });
    expect(user.senhaHash).toBeUndefined(); // nunca devolve o hash
  });

  test('dois usuários com a mesma senha recebem hashes diferentes (salt)', async () => {
    getDocs.mockResolvedValue(vazio);
    addDoc.mockResolvedValue({ id: 'x' });
    await registerUser({ nome: 'A', email: 'a@x.com', senha: 'mesmaSenha1' });
    await registerUser({ nome: 'B', email: 'b@x.com', senha: 'mesmaSenha1' });
    const [a, b] = addDoc.mock.calls.map((c) => c[1]);
    expect(a.senhaHash).not.toBe(b.senhaHash);
  });

  test('aceita senha com acentos', async () => {
    getDocs.mockResolvedValue(vazio);
    addDoc.mockResolvedValue({ id: 'x' });
    await expect(registerUser({ nome: 'A', email: 'a@x.com', senha: 'sênhaÇã1' })).resolves.toBeTruthy();
  });

  test('recusa e-mail já cadastrado', async () => {
    getDocs.mockResolvedValue(comUsuario({ email: 'edy@oficina.com' }));
    await expect(
      registerUser({ nome: 'Edy', email: 'edy@oficina.com', senha: 'abc123' }),
    ).rejects.toThrow('Já existe uma conta com este e-mail.');
    expect(addDoc).not.toHaveBeenCalled();
  });

  test('valida os campos antes de consultar o Firebase', async () => {
    await expect(registerUser({ nome: '', email: 'x', senha: '1' })).rejects.toThrow();
    expect(getDocs).not.toHaveBeenCalled();
  });
});

describe('loginUser', () => {
  let guardado;
  beforeAll(async () => {
    const salt = 'salt-de-teste';
    guardado = { nome: 'Edy', email: 'edy@oficina.com', salt, senhaHash: await hashPassword('abc123', salt) };
  });

  test('login correto devolve o usuário sem a senha', async () => {
    getDocs.mockResolvedValue(comUsuario(guardado));
    const user = await loginUser({ email: 'EDY@oficina.com', senha: 'abc123' });
    expect(user).toEqual({ id: 'u1', nome: 'Edy', email: 'edy@oficina.com' });
  });

  test('senha errada', async () => {
    getDocs.mockResolvedValue(comUsuario(guardado));
    await expect(loginUser({ email: 'edy@oficina.com', senha: 'errada1' })).rejects.toThrow(
      'E-mail ou senha inválidos.',
    );
  });

  test('usuário inexistente', async () => {
    getDocs.mockResolvedValue(vazio);
    await expect(loginUser({ email: 'nao@existe.com', senha: 'abc123' })).rejects.toThrow(
      'E-mail ou senha inválidos.',
    );
  });

  test('campos vazios', async () => {
    await expect(loginUser({ email: '', senha: '' })).rejects.toThrow('Informe e-mail e senha.');
  });
});

describe('sessão local', () => {
  test('salva, carrega e limpa', async () => {
    expect(await loadSession()).toBeNull();
    await saveSession({ id: '1', nome: 'Edy', email: 'e@x.com' });
    expect(await loadSession()).toEqual({ id: '1', nome: 'Edy', email: 'e@x.com' });
    await clearSession();
    expect(await loadSession()).toBeNull();
  });
});
