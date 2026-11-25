import {
  computeStats,
  filterAppointments,
  getServiceIds,
  getTakenSlots,
  getUpcoming,
  sortAppointments,
} from '../../src/utils/appointments';

const NOW = new Date(2026, 10, 19, 10, 0); // 19/11/2026

const make = (over) => ({
  id: String(Math.random()),
  name: 'Cliente',
  car: 'Carro',
  plate: '',
  date: '2026-11-19',
  slot: '08:00',
  status: 'confirmado',
  service: ['alinhamento'],
  ...over,
});

const lista = [
  make({ id: '1', name: 'João Silva', car: 'Fiat Uno', plate: 'ABC-1234', date: '2026-11-19', slot: '10:00' }),
  make({ id: '2', name: 'Maria Souza', car: 'Gol', plate: 'XYZ-9876', date: '2026-11-19', slot: '08:00', status: 'concluido' }),
  make({ id: '3', name: 'Pedro Lima', car: 'Onix', date: '2026-11-22', slot: '09:00' }),
  make({ id: '4', name: 'Ana Costa', car: 'HB20', date: '2026-12-15', slot: '09:00' }),
  make({ id: '5', name: 'Carlos Dias', car: 'Palio', date: '2026-11-20', slot: '15:00', status: 'cancelado' }),
  make({ id: '6', name: 'Antigo', car: 'Fusca', date: '2026-11-01', slot: '09:00' }),
];

describe('sortAppointments', () => {
  test('ordena por data e depois por horário, sem alterar a lista original', () => {
    const copia = [...lista];
    const ids = sortAppointments(lista).map((a) => a.id);
    expect(ids).toEqual(['6', '2', '1', '5', '3', '4']);
    expect(lista).toEqual(copia);
  });
});

describe('filterAppointments', () => {
  test('todos retorna tudo ordenado', () => {
    expect(filterAppointments(lista, { now: NOW })).toHaveLength(6);
  });

  test('hoje', () => {
    const ids = filterAppointments(lista, { filter: 'hoje', now: NOW }).map((a) => a.id);
    expect(ids).toEqual(['2', '1']);
  });

  test('semana = hoje até +7 dias', () => {
    const ids = filterAppointments(lista, { filter: 'semana', now: NOW }).map((a) => a.id);
    expect(ids).toEqual(['2', '1', '5', '3']);
  });

  test('pendente = apenas confirmados', () => {
    const r = filterAppointments(lista, { filter: 'pendente', now: NOW });
    expect(r.every((a) => a.status === 'confirmado')).toBe(true);
    expect(r).toHaveLength(4);
  });

  test('busca por nome, placa ou carro (sem diferenciar maiúsculas)', () => {
    expect(filterAppointments(lista, { search: 'joão' }).map((a) => a.id)).toEqual(['1']);
    expect(filterAppointments(lista, { search: 'xyz' }).map((a) => a.id)).toEqual(['2']);
    expect(filterAppointments(lista, { search: 'onix' }).map((a) => a.id)).toEqual(['3']);
    expect(filterAppointments(lista, { search: 'zzz' })).toEqual([]);
  });

  test('combina filtro e busca', () => {
    const r = filterAppointments(lista, { filter: 'hoje', search: 'maria', now: NOW });
    expect(r.map((a) => a.id)).toEqual(['2']);
  });
});

describe('getTakenSlots', () => {
  test('retorna horários ocupados da data, ignorando cancelados', () => {
    expect(getTakenSlots(lista, '2026-11-19').sort()).toEqual(['08:00', '10:00']);
    expect(getTakenSlots(lista, '2026-11-20')).toEqual([]); // o único é cancelado
    expect(getTakenSlots(lista, '2030-01-01')).toEqual([]);
  });
});

describe('computeStats', () => {
  test('conta total, hoje, confirmados e concluídos', () => {
    expect(computeStats(lista, NOW)).toEqual({ total: 6, hoje: 2, confirmados: 4, concluidos: 1 });
  });

  test('lista vazia', () => {
    expect(computeStats([], NOW)).toEqual({ total: 0, hoje: 0, confirmados: 0, concluidos: 0 });
  });
});

describe('getUpcoming', () => {
  test('somente de hoje em diante e não cancelados', () => {
    expect(getUpcoming(lista, NOW).map((a) => a.id)).toEqual(['2', '1', '3', '4']);
  });

  test('respeita o limite', () => {
    expect(getUpcoming(lista, NOW, 2)).toHaveLength(2);
  });
});

describe('getServiceIds', () => {
  test('aceita lista, string antiga ou vazio', () => {
    expect(getServiceIds({ service: ['a', 'b'] })).toEqual(['a', 'b']);
    expect(getServiceIds({ service: 'a' })).toEqual(['a']);
    expect(getServiceIds({})).toEqual([]);
  });
});
