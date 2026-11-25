import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import LoginScreen from '../../src/screens/LoginScreen';
import { AuthContext } from '../../src/context/AuthContext';

function setup(signIn = jest.fn()) {
  const navigation = { navigate: jest.fn() };
  const utils = render(
    <AuthContext.Provider value={{ user: null, loading: false, signIn }}>
      <LoginScreen navigation={navigation} />
    </AuthContext.Provider>,
  );
  return { navigation, signIn, utils };
}

describe('LoginScreen', () => {
  test('renderiza campos e botões', async () => {
    await setup().utils;
    expect(screen.getByLabelText('E-MAIL')).toBeOnTheScreen();
    expect(screen.getByLabelText('SENHA')).toBeOnTheScreen();
    expect(screen.getByTestId('btn-entrar')).toBeOnTheScreen();
    expect(screen.getByTestId('btn-criar-conta')).toBeOnTheScreen();
  });

  test('o campo de senha é protegido (secureTextEntry)', async () => {
    await setup().utils;
    expect(screen.getByLabelText('SENHA').props.secureTextEntry).toBe(true);
  });

  test('envia e-mail e senha digitados para o signIn', async () => {
    const { signIn, utils } = setup(jest.fn().mockResolvedValue());
    await utils;
    await fireEvent.changeText(screen.getByLabelText('E-MAIL'), 'edy@oficina.com');
    await fireEvent.changeText(screen.getByLabelText('SENHA'), 'abc123');
    await fireEvent.press(screen.getByTestId('btn-entrar'));
    await waitFor(() => expect(signIn).toHaveBeenCalledWith({ email: 'edy@oficina.com', senha: 'abc123' }));
  });

  test('mostra a mensagem de erro quando o login falha', async () => {
    const signIn = jest.fn().mockRejectedValue(new Error('E-mail ou senha inválidos.'));
    await setup(signIn).utils;
    await fireEvent.changeText(screen.getByLabelText('E-MAIL'), 'edy@oficina.com');
    await fireEvent.changeText(screen.getByLabelText('SENHA'), 'errada');
    await fireEvent.press(screen.getByTestId('btn-entrar'));
    expect(await screen.findByText('E-mail ou senha inválidos.')).toBeOnTheScreen();
  });

  test('"Criar conta" navega para a tela de cadastro', async () => {
    const { navigation, utils } = setup();
    await utils;
    await fireEvent.press(screen.getByTestId('btn-criar-conta'));
    expect(navigation.navigate).toHaveBeenCalledWith('Cadastro');
  });
});
