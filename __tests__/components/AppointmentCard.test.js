import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import AppointmentCard from '../../src/components/AppointmentCard';

const apt = {
  id: 'a1',
  name: 'João Silva',
  car: 'Fiat Uno',
  plate: 'ABC-1234',
  date: '2026-11-19',
  slot: '09:30',
  status: 'confirmado',
  service: ['alinhamento', 'balanceamento'],
};

describe('AppointmentCard', () => {
  test('mostra cliente, carro, placa, horário, data, serviços e status', async () => {
    await render(<AppointmentCard appointment={apt} />);
    expect(screen.getByText('João Silva')).toBeOnTheScreen();
    expect(screen.getByText(/Fiat Uno/)).toBeOnTheScreen();
    expect(screen.getByText(/ABC-1234/)).toBeOnTheScreen();
    expect(screen.getByText('09:30')).toBeOnTheScreen();
    expect(screen.getByText('19 Nov')).toBeOnTheScreen();
    expect(screen.getByText(/Alinhamento/)).toBeOnTheScreen();
    expect(screen.getByText(/Balanceamento/)).toBeOnTheScreen();
    expect(screen.getByText('Confirmado')).toBeOnTheScreen();
  });

  test.each([
    ['concluido', 'Concluído'],
    ['cancelado', 'Cancelado'],
  ])('status %s exibe "%s"', async (status, rotulo) => {
    await render(<AppointmentCard appointment={{ ...apt, status }} />);
    expect(screen.getByText(rotulo)).toBeOnTheScreen();
  });

  test('sem status assume confirmado', async () => {
    await render(<AppointmentCard appointment={{ ...apt, status: undefined }} />);
    expect(screen.getByText('Confirmado')).toBeOnTheScreen();
  });

  test('ao tocar chama onPress com o agendamento', async () => {
    const onPress = jest.fn();
    await render(<AppointmentCard appointment={apt} onPress={onPress} />);
    await fireEvent.press(screen.getByTestId('apt-card-a1'));
    expect(onPress).toHaveBeenCalledWith(apt);
  });
});
