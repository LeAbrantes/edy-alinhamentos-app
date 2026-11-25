import React from 'react';
import { Text } from 'react-native';
import { act, render, screen } from '@testing-library/react-native';
import { AppointmentsProvider, useAppointments } from '../../src/context/AppointmentsContext';
import { subscribeAppointments } from '../../src/services/appointmentService';

jest.mock('../../src/services/appointmentService');

function Probe() {
  const { appointments, loading, error } = useAppointments();
  return <Text testID="estado">{`${loading ? 'carregando' : 'pronto'}|${appointments.length}|${error || ''}`}</Text>;
}

describe('AppointmentsContext', () => {
  test('assina o Firestore, atualiza a lista em tempo real e cancela a escuta ao desmontar', async () => {
    let onData;
    const unsubscribe = jest.fn();
    subscribeAppointments.mockImplementation((data) => {
      onData = data;
      return unsubscribe;
    });

    const { unmount } = await render(<AppointmentsProvider><Probe /></AppointmentsProvider>);
    expect(screen.getByTestId('estado')).toHaveTextContent('carregando|0|');

    await act(async () => onData([{ id: '1' }, { id: '2' }]));
    expect(screen.getByTestId('estado')).toHaveTextContent('pronto|2|');

    await act(async () => onData([{ id: '1' }, { id: '2' }, { id: '3' }])); // novo agendamento chegou
    expect(screen.getByTestId('estado')).toHaveTextContent('pronto|3|');

    await unmount();
    expect(unsubscribe).toHaveBeenCalled();
  });

  test('guarda a mensagem de erro de conexão', async () => {
    let onError;
    subscribeAppointments.mockImplementation((data, erro) => {
      onError = erro;
      return jest.fn();
    });
    await render(<AppointmentsProvider><Probe /></AppointmentsProvider>);
    await act(async () => onError(new Error('permission-denied')));
    expect(screen.getByTestId('estado')).toHaveTextContent('pronto|0|permission-denied');
  });
});
