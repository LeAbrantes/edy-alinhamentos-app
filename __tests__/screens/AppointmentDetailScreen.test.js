import React from 'react';
import { Alert } from 'react-native';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import AppointmentDetailScreen from '../../src/screens/AppointmentDetailScreen';
import { AppointmentsContext } from '../../src/context/AppointmentsContext';
import { ToastContext } from '../../src/context/ToastContext';
import { getAppointmentById, updateAppointmentStatus } from '../../src/services/appointmentService';
import { cancelReminder } from '../../src/services/notificationService';

jest.mock('../../src/services/appointmentService');
jest.mock('../../src/services/notificationService');

const apt = {
  id: 'abc123',
  name: 'João Silva',
  phone: '(21) 99999-8888',
  car: 'Fiat Uno',
  plate: 'ABC-1234',
  date: '2026-11-19',
  slot: '09:30',
  notes: 'Barulho na roda',
  status: 'confirmado',
  service: ['alinhamento'],
  lembreteId: 'lem-1',
};

async function setup(appointments = [apt], id = 'abc123') {
  const navigation = { goBack: jest.fn() };
  const showToast = jest.fn();
  await render(
    <ToastContext.Provider value={{ showToast }}>
      <AppointmentsContext.Provider value={{ appointments, loading: false, error: null }}>
        <AppointmentDetailScreen route={{ params: { id } }} navigation={navigation} />
      </AppointmentsContext.Provider>
    </ToastContext.Provider>,
  );
  return { navigation, showToast };
}

beforeEach(() => jest.clearAllMocks());

describe('AppointmentDetailScreen', () => {
  test('mostra os dados do agendamento', async () => {
    await setup();
    expect(screen.getByText('João Silva')).toBeOnTheScreen();
    expect(screen.getByText('19 de Novembro de 2026')).toBeOnTheScreen();
    expect(screen.getByText('Barulho na roda')).toBeOnTheScreen();
  });

  test('mostra o horário do lembrete (1 hora antes) quando a notificação foi agendada', async () => {
    await setup();
    expect(screen.getByTestId('aviso-lembrete')).toHaveTextContent(/Lembrete programado para 08:30 de 19 Nov/);
  });

  test('sem lembrete agendado o aviso não aparece', async () => {
    await setup([{ ...apt, lembreteId: undefined }]);
    expect(screen.queryByTestId('aviso-lembrete')).not.toBeOnTheScreen();
  });

  test('agendamento concluído não mostra aviso de lembrete', async () => {
    await setup([{ ...apt, status: 'concluido' }]);
    expect(screen.queryByTestId('aviso-lembrete')).not.toBeOnTheScreen();
  });

  test('concluir atualiza o status, cancela o lembrete e volta', async () => {
    updateAppointmentStatus.mockResolvedValue();
    const { navigation, showToast } = await setup();
    await fireEvent.press(screen.getByTestId('btn-concluir'));

    await waitFor(() => expect(navigation.goBack).toHaveBeenCalled());
    expect(updateAppointmentStatus).toHaveBeenCalledWith('abc123', 'concluido');
    expect(cancelReminder).toHaveBeenCalledWith('lem-1');
    expect(showToast).toHaveBeenCalledWith('✅ Marcado como concluído!');
  });

  test('cancelar pede confirmação antes de alterar', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    await setup();
    await fireEvent.press(screen.getByTestId('btn-cancelar'));

    expect(alertSpy).toHaveBeenCalled();
    expect(updateAppointmentStatus).not.toHaveBeenCalled(); // ainda não confirmou

    // simula o usuário tocando em "Cancelar agendamento" no alerta
    const botoes = alertSpy.mock.calls[0][2];
    updateAppointmentStatus.mockResolvedValue();
    await act(async () => {
      await botoes.find((b) => b.style === 'destructive').onPress();
    });
    expect(updateAppointmentStatus).toHaveBeenCalledWith('abc123', 'cancelado');
  });

  test('agendamento concluído não oferece mais ações', async () => {
    await setup([{ ...apt, status: 'concluido' }]);
    expect(screen.queryByTestId('btn-concluir')).not.toBeOnTheScreen();
    expect(screen.queryByTestId('btn-cancelar')).not.toBeOnTheScreen();
  });

  test('id fora da lista (ainda não sincronizado) é buscado no Firestore', async () => {
    getAppointmentById.mockResolvedValue({ ...apt, id: 'remoto9', name: 'Cliente Remoto' });
    await setup([], 'remoto9');
    expect(await screen.findByText('Cliente Remoto')).toBeOnTheScreen();
    expect(getAppointmentById).toHaveBeenCalledWith('remoto9');
  });

  test('agendamento inexistente mostra "não encontrado"', async () => {
    getAppointmentById.mockResolvedValue(null);
    await setup([], 'fantasma');
    expect(await screen.findByText('Agendamento não encontrado.')).toBeOnTheScreen();
  });
});
