import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import RegisterScreen from '../../src/screens/RegisterScreen';
import { AuthContext } from '../../src/context/AuthContext';

async function setup(signUp = jest.fn()) {
  const navigation = { goBack: jest.fn() };
  await render(
    <AuthContext.Provider value={{ user: null, loading: false, signUp }}>
      <RegisterScreen navigation={navigation} />
    </AuthContext.Provider>,
  );
  return { navigation, signUp };
}

async function preencher({ nome, email, senha, confirmar }) {
  await fireEvent.changeText(screen.getByLabelText('NOME'), nome);
  await fireEvent.changeText(screen.getByLabelText('E-MAIL'), email);
  await fireEvent.changeText(screen.getByLabelText('SENHA'), senha);
  await fireEvent.changeText(screen.getByLabelText('CONFIRMAR SENHA'), confirmar);
}

describe('RegisterScreen', () => {
  test('cadastra com os dados informados', async () => {
    const { signUp } = await setup(jest.fn().mockResolvedValue());
    const dados = { nome: 'Edy', email: 'edy@x.com', senha: 'abc123', confirmar: 'abc123' };
    await preencher(dados);
    await fireEvent.press(screen.getByTestId('btn-cadastrar'));
    await waitFor(() => expect(signUp).toHaveBeenCalledWith(dados));
  });

  test('exibe erro vindo do cadastro (ex.: senhas diferentes)', async () => {
    await setup(jest.fn().mockRejectedValue(new Error('As senhas não conferem.')));
    await preencher({ nome: 'Edy', email: 'edy@x.com', senha: 'abc123', confirmar: 'outra1' });
    await fireEvent.press(screen.getByTestId('btn-cadastrar'));
    expect(await screen.findByText('As senhas não conferem.')).toBeOnTheScreen();
  });

  test('"Já tenho conta" volta para o login', async () => {
    const { navigation } = await setup();
    await fireEvent.press(screen.getByText('Já tenho conta'));
    expect(navigation.goBack).toHaveBeenCalled();
  });
});
