import React from 'react';
import { Text } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { ToastProvider, useToast } from '../../src/context/ToastContext';

function Botao() {
  const { showToast } = useToast();
  return <Text testID="botao" onPress={() => showToast('✅ Salvo!')}>mostrar</Text>;
}

describe('ToastContext', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  test('showToast exibe a mensagem', async () => {
    await render(<ToastProvider><Botao /></ToastProvider>);
    await fireEvent.press(screen.getByTestId('botao'));
    expect(screen.getByText('✅ Salvo!')).toBeOnTheScreen();
    await act(async () => jest.advanceTimersByTime(3500)); // termina o ciclo do toast sem erro
  });

  test('useToast fora do Provider não quebra', async () => {
    await render(<Botao />);
    await fireEvent.press(screen.getByTestId('botao'));
  });
});
