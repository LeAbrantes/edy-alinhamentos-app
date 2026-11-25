import React from 'react';
import { Text } from 'react-native';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '../../src/context/AuthContext';
import {
  clearSession,
  loadSession,
  loginUser,
  registerUser,
  saveSession,
} from '../../src/services/authService';

jest.mock('../../src/services/authService');

function Probe() {
  const { user, loading, signIn, signUp, signOut } = useAuth();
  return (
    <>
      <Text testID="estado">{loading ? 'carregando' : user ? `logado:${user.nome}` : 'deslogado'}</Text>
      <Text testID="entrar" onPress={() => signIn({ email: 'a@b.com', senha: 'abc123' })}>entrar</Text>
      <Text testID="cadastrar" onPress={() => signUp({ nome: 'Novo' })}>cadastrar</Text>
      <Text testID="sair" onPress={signOut}>sair</Text>
    </>
  );
}

const montar = () => render(<AuthProvider><Probe /></AuthProvider>);

beforeEach(() => jest.clearAllMocks());

describe('AuthContext', () => {
  test('sem sessão salva começa deslogado', async () => {
    loadSession.mockResolvedValue(null);
    await montar();
    await waitFor(() => expect(screen.getByTestId('estado')).toHaveTextContent('deslogado'));
  });

  test('restaura a sessão salva ao abrir o app', async () => {
    loadSession.mockResolvedValue({ id: '1', nome: 'Edy', email: 'e@x.com' });
    await montar();
    await waitFor(() => expect(screen.getByTestId('estado')).toHaveTextContent('logado:Edy'));
  });

  test('signIn autentica e salva a sessão', async () => {
    loadSession.mockResolvedValue(null);
    loginUser.mockResolvedValue({ id: '2', nome: 'Maria', email: 'm@x.com' });
    await montar();
    await waitFor(() => expect(screen.getByTestId('estado')).toHaveTextContent('deslogado'));

    await fireEvent.press(screen.getByTestId('entrar'));

    await waitFor(() => expect(screen.getByTestId('estado')).toHaveTextContent('logado:Maria'));
    expect(saveSession).toHaveBeenCalledWith({ id: '2', nome: 'Maria', email: 'm@x.com' });
  });

  test('signUp cria a conta e já entra', async () => {
    loadSession.mockResolvedValue(null);
    registerUser.mockResolvedValue({ id: '3', nome: 'Novo', email: 'n@x.com' });
    await montar();
    await waitFor(() => expect(screen.getByTestId('estado')).toHaveTextContent('deslogado'));

    await fireEvent.press(screen.getByTestId('cadastrar'));

    await waitFor(() => expect(screen.getByTestId('estado')).toHaveTextContent('logado:Novo'));
  });

  test('signOut limpa a sessão', async () => {
    loadSession.mockResolvedValue({ id: '1', nome: 'Edy', email: 'e@x.com' });
    await montar();
    await waitFor(() => expect(screen.getByTestId('estado')).toHaveTextContent('logado:Edy'));

    await fireEvent.press(screen.getByTestId('sair'));

    await waitFor(() => expect(screen.getByTestId('estado')).toHaveTextContent('deslogado'));
    expect(clearSession).toHaveBeenCalled();
  });

  test('falha no login propaga o erro e mantém deslogado', async () => {
    loadSession.mockResolvedValue(null);
    loginUser.mockRejectedValue(new Error('E-mail ou senha inválidos.'));
    let erro;
    function Tentar() {
      const { signIn } = useAuth();
      return <Text testID="tentar" onPress={() => signIn({}).catch((e) => { erro = e.message; })}>x</Text>;
    }
    await render(<AuthProvider><Tentar /></AuthProvider>);
    await fireEvent.press(screen.getByTestId('tentar'));
    await waitFor(() => expect(erro).toBe('E-mail ou senha inválidos.'));
    expect(saveSession).not.toHaveBeenCalled();
  });
});
