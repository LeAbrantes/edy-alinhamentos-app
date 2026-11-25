import React from 'react';
import { render, screen } from '@testing-library/react-native';
import AppNavigator from '../../src/navigation/AppNavigator';
import { AuthContext } from '../../src/context/AuthContext';
import { ToastProvider } from '../../src/context/ToastContext';

// A escuta do Firestore é simulada: entrega uma lista vazia
jest.mock('../../src/services/appointmentService', () => ({
  subscribeAppointments: jest.fn((onData) => {
    onData([]);
    return jest.fn();
  }),
  getAppointmentById: jest.fn(),
  createAppointment: jest.fn(),
  updateAppointment: jest.fn(),
  updateAppointmentStatus: jest.fn(),
}));

const montar = (auth) =>
  render(
    <AuthContext.Provider value={auth}>
      <ToastProvider>
        <AppNavigator />
      </ToastProvider>
    </AuthContext.Provider>,
  );

describe('AppNavigator (navegação)', () => {
  test('carregando sessão mostra indicador de progresso', async () => {
    await montar({ user: null, loading: true });
    expect(screen.queryByTestId('btn-entrar')).not.toBeOnTheScreen();
  });

  test('deslogado => tela de Login', async () => {
    await montar({ user: null, loading: false, signIn: jest.fn() });
    expect(screen.getByTestId('btn-entrar')).toBeOnTheScreen();
  });

  test('logado => abas Agendar / Agenda / Painel', async () => {
    await montar({ user: { nome: 'Edy', email: 'e@x.com' }, loading: false, signOut: jest.fn() });
    expect(screen.getAllByText('Agendar').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Agenda').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Painel').length).toBeGreaterThan(0);
    expect(screen.queryByTestId('btn-entrar')).not.toBeOnTheScreen();
  });
});
