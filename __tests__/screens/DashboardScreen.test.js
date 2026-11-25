import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react-native';
import DashboardScreen from '../../src/screens/DashboardScreen';
import { AppointmentsContext } from '../../src/context/AppointmentsContext';
import { AuthContext } from '../../src/context/AuthContext';

const pad = (n) => String(n).padStart(2, '0');
const hoje = new Date();
const HOJE = `${hoje.getFullYear()}-${pad(hoje.getMonth() + 1)}-${pad(hoje.getDate())}`;

const lista = [
  { id: '1', name: 'João Silva', car: 'Uno', date: HOJE, slot: '10:00', status: 'confirmado', service: ['freios'] },
  { id: '2', name: 'Maria Souza', car: 'Gol', date: HOJE, slot: '08:00', status: 'concluido', service: ['scanner'] },
  { id: '3', name: 'Carlos Dias', car: 'Palio', date: HOJE, slot: '15:00', status: 'cancelado', service: ['outros'] },
];

async function setup(signOut = jest.fn()) {
  const navigation = { navigate: jest.fn() };
  await render(
    <AuthContext.Provider value={{ user: { nome: 'Edy', email: 'e@x.com' }, signOut }}>
      <AppointmentsContext.Provider value={{ appointments: lista, loading: false, error: null }}>
        <DashboardScreen navigation={navigation} />
      </AppointmentsContext.Provider>
    </AuthContext.Provider>,
  );
  return { navigation, signOut };
}

describe('DashboardScreen', () => {
  test('mostra saudação e estatísticas', async () => {
    await setup();
    expect(screen.getByText('Olá, Edy')).toBeOnTheScreen();
    // Total 3 | Hoje 3 | Confirmados 1 | Concluídos 1
    expect(screen.getAllByText('3')).toHaveLength(2);
    expect(screen.getAllByText('1')).toHaveLength(2);
  });

  test('lista de próximos não inclui cancelados', async () => {
    await setup();
    const lista = screen.getByTestId('lista-proximos');
    expect(within(lista).getByText('João Silva')).toBeOnTheScreen();
    expect(within(lista).queryByText('Carlos Dias')).not.toBeOnTheScreen();
  });

  test('botão Sair chama signOut', async () => {
    const { signOut } = await setup();
    await fireEvent.press(screen.getByTestId('btn-sair'));
    expect(signOut).toHaveBeenCalled();
  });
});
