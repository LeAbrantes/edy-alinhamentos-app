import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import NewAppointmentScreen from '../../src/screens/NewAppointmentScreen';
import { AppointmentsContext } from '../../src/context/AppointmentsContext';
import { AuthContext } from '../../src/context/AuthContext';
import { ToastContext } from '../../src/context/ToastContext';
import { createAppointment, updateAppointment } from '../../src/services/appointmentService';
import { scheduleReminder, sendConfirmationNotification } from '../../src/services/notificationService';
import { todayISO } from '../../src/utils/dates';

jest.mock('../../src/services/appointmentService');
jest.mock('../../src/services/notificationService');

async function setup(appointments = []) {
  const navigation = { navigate: jest.fn() };
  const showToast = jest.fn();
  await render(
    <AuthContext.Provider value={{ user: { nome: 'Edy', email: 'edy@oficina.com' } }}>
      <ToastContext.Provider value={{ showToast }}>
        <AppointmentsContext.Provider value={{ appointments, loading: false, error: null }}>
          <NewAppointmentScreen navigation={navigation} />
        </AppointmentsContext.Provider>
      </ToastContext.Provider>
    </AuthContext.Provider>,
  );
  return { navigation, showToast };
}

async function preencherFormulario() {
  await fireEvent.changeText(screen.getByLabelText('NOME DO CLIENTE'), 'João Silva');
  await fireEvent.changeText(screen.getByLabelText('TELEFONE / WHATSAPP'), '21999998888');
  await fireEvent.changeText(screen.getByLabelText('VEÍCULO'), 'Fiat Uno Branco');
  await fireEvent.changeText(screen.getByLabelText('PLACA'), 'abc1234');
  await fireEvent.press(screen.getByTestId('service-alinhamento'));
  await fireEvent.press(screen.getByTestId('service-balanceamento'));
  await fireEvent.press(screen.getByTestId('slot-09:00'));
}

beforeEach(() => jest.clearAllMocks());

describe('NewAppointmentScreen', () => {
  test('aplica as máscaras de telefone e placa', async () => {
    await setup();
    await fireEvent.changeText(screen.getByLabelText('TELEFONE / WHATSAPP'), '21999998888');
    await fireEvent.changeText(screen.getByLabelText('PLACA'), 'abc1234');
    expect(screen.getByLabelText('TELEFONE / WHATSAPP').props.value).toBe('(21) 99999-8888');
    expect(screen.getByLabelText('PLACA').props.value).toBe('ABC-1234');
  });

  test('formulário vazio mostra aviso e NÃO salva', async () => {
    const { showToast } = await setup();
    await fireEvent.press(screen.getByTestId('btn-confirmar'));
    expect(showToast).toHaveBeenCalledWith('⚠️ Informe o nome do cliente!');
    expect(createAppointment).not.toHaveBeenCalled();
  });

  test('exige ao menos um serviço e um horário', async () => {
    const { showToast } = await setup();
    await fireEvent.changeText(screen.getByLabelText('NOME DO CLIENTE'), 'João');
    await fireEvent.changeText(screen.getByLabelText('TELEFONE / WHATSAPP'), '21999998888');
    await fireEvent.changeText(screen.getByLabelText('VEÍCULO'), 'Uno');
    await fireEvent.press(screen.getByTestId('btn-confirmar'));
    expect(showToast).toHaveBeenLastCalledWith('⚠️ Selecione pelo menos um serviço!');

    await fireEvent.press(screen.getByTestId('service-freios'));
    await fireEvent.press(screen.getByTestId('btn-confirmar'));
    expect(showToast).toHaveBeenLastCalledWith('⚠️ Selecione o horário!');
  });

  test('horários ocupados ficam desabilitados', async () => {
    const ocupado = { id: 'x', date: todayISO(), slot: '09:00', status: 'confirmado' };
    const cancelado = { id: 'y', date: todayISO(), slot: '10:00', status: 'cancelado' };
    await setup([ocupado, cancelado]);
    expect(screen.getByTestId('slot-09:00')).toBeDisabled();
    expect(screen.getByTestId('slot-10:00')).toBeEnabled(); // cancelado libera o horário
  });

  test('salva, dispara notificações e abre a tela de detalhes', async () => {
    const salvo = { id: 'novo1', name: 'João Silva', date: todayISO(), slot: '09:00' };
    createAppointment.mockResolvedValue(salvo);
    sendConfirmationNotification.mockResolvedValue('n0');
    scheduleReminder.mockResolvedValue('lembrete-1');
    const { navigation, showToast } = await setup();

    await preencherFormulario();
    await fireEvent.press(screen.getByTestId('btn-confirmar'));

    await waitFor(() => expect(navigation.navigate).toHaveBeenCalledWith('Detalhes', { id: 'novo1' }));

    expect(createAppointment).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'João Silva',
        phone: '(21) 99999-8888',
        car: 'Fiat Uno Branco',
        plate: 'ABC-1234',
        slot: '09:00',
        service: ['alinhamento', 'balanceamento'],
        criadoPor: 'edy@oficina.com',
      }),
    );
    expect(sendConfirmationNotification).toHaveBeenCalledWith(salvo);
    expect(scheduleReminder).toHaveBeenCalledWith(salvo);
    expect(updateAppointment).toHaveBeenCalledWith('novo1', { lembreteId: 'lembrete-1' });
    expect(showToast).toHaveBeenCalledWith('✅ Agendamento confirmado!');
    // formulário limpo depois de salvar
    expect(screen.getByLabelText('NOME DO CLIENTE').props.value).toBe('');
  });

  test('falha na notificação não impede o agendamento', async () => {
    createAppointment.mockResolvedValue({ id: 'n2', date: todayISO(), slot: '09:00' });
    sendConfirmationNotification.mockRejectedValue(new Error('sem permissão'));
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    const { navigation } = await setup();

    await preencherFormulario();
    await fireEvent.press(screen.getByTestId('btn-confirmar'));

    await waitFor(() => expect(navigation.navigate).toHaveBeenCalledWith('Detalhes', { id: 'n2' }));
  });

  test('erro do Firebase (horário tomado) é mostrado e nada navega', async () => {
    createAppointment.mockRejectedValue(new Error('Este horário acabou de ser ocupado. Escolha outro.'));
    const { navigation, showToast } = await setup();

    await preencherFormulario();
    await fireEvent.press(screen.getByTestId('btn-confirmar'));

    await waitFor(() =>
      expect(showToast).toHaveBeenCalledWith('⚠️ Este horário acabou de ser ocupado. Escolha outro.'),
    );
    expect(navigation.navigate).not.toHaveBeenCalled();
  });
});
