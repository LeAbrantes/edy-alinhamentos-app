import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react-native';
import AgendaScreen from '../../src/screens/AgendaScreen';
import { AppointmentsContext } from '../../src/context/AppointmentsContext';

// Datas relativas a hoje, para o teste não "quebrar" com o passar do tempo
const pad = (n) => String(n).padStart(2, '0');
const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const hoje = new Date();
const daquiA = (dias) => {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  return iso(d);
};

const dados = [
  { id: '1', name: 'João Silva', car: 'Fiat Uno', plate: 'ABC-1234', date: iso(hoje), slot: '10:00', status: 'confirmado', service: ['freios'] },
  { id: '2', name: 'Maria Souza', car: 'Gol', plate: 'XYZ-9876', date: iso(hoje), slot: '08:00', status: 'concluido', service: ['scanner'] },
  { id: '3', name: 'Pedro Lima', car: 'Onix', plate: '', date: daquiA(30), slot: '09:00', status: 'confirmado', service: ['troca_oleo'] },
];

async function setup(value = { appointments: dados, loading: false, error: null }) {
  const navigation = { navigate: jest.fn() };
  await render(
    <AppointmentsContext.Provider value={value}>
      <AgendaScreen navigation={navigation} />
    </AppointmentsContext.Provider>,
  );
  return { navigation };
}

describe('AgendaScreen (FlatList)', () => {
  test('lista todos os agendamentos ordenados por data e horário', async () => {
    await setup();
    const lista = screen.getByTestId('lista-agenda');
    const nomes = within(lista).getAllByText(/Silva|Souza|Lima/).map((n) => n.props.children);
    expect(nomes).toEqual(['Maria Souza', 'João Silva', 'Pedro Lima']); // 08:00, 10:00, daqui a 30 dias
  });

  test('filtro "Hoje" mostra só os de hoje', async () => {
    await setup();
    await fireEvent.press(screen.getByTestId('filter-hoje'));
    expect(screen.getByText('João Silva')).toBeOnTheScreen();
    expect(screen.queryByText('Pedro Lima')).not.toBeOnTheScreen();
  });

  test('filtro "Pendentes" esconde os concluídos', async () => {
    await setup();
    await fireEvent.press(screen.getByTestId('filter-pendente'));
    expect(screen.queryByText('Maria Souza')).not.toBeOnTheScreen();
    expect(screen.getByText('João Silva')).toBeOnTheScreen();
  });

  test('busca por placa', async () => {
    await setup();
    await fireEvent.changeText(screen.getByTestId('input-busca'), 'xyz');
    expect(screen.getByText('Maria Souza')).toBeOnTheScreen();
    expect(screen.queryByText('João Silva')).not.toBeOnTheScreen();
  });

  test('mostra mensagem de lista vazia quando nada é encontrado', async () => {
    await setup();
    await fireEvent.changeText(screen.getByTestId('input-busca'), 'inexistente');
    expect(screen.getByText('Nenhum agendamento encontrado.')).toBeOnTheScreen();
  });

  test('mostra "Carregando" enquanto os dados não chegam', async () => {
    await setup({ appointments: [], loading: true, error: null });
    expect(screen.getByText('Carregando agendamentos...')).toBeOnTheScreen();
  });

  test('mostra erro de carregamento', async () => {
    await setup({ appointments: [], loading: false, error: 'Sem permissão' });
    expect(screen.getByText(/Sem permissão/)).toBeOnTheScreen();
  });

  test('tocar em um item abre os detalhes com o id', async () => {
    const { navigation } = await setup();
    await fireEvent.press(screen.getByTestId('apt-card-1'));
    expect(navigation.navigate).toHaveBeenCalledWith('Detalhes', { id: '1' });
  });
});
