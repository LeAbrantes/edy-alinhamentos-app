import {
  addDays,
  buildDateOptions,
  buildDateTime,
  formatDate,
  formatTime,
  getReminderDate,
  isValidISODate,
  toISODate,
} from '../../src/utils/dates';

describe('datas', () => {
  test('toISODate usa a data LOCAL (não UTC)', () => {
    // 23:30 no horário local ainda é o mesmo dia, mesmo que em UTC já seja o dia seguinte
    expect(toISODate(new Date(2026, 10, 19, 23, 30))).toBe('2026-11-19');
    expect(toISODate(new Date(2026, 0, 5, 0, 5))).toBe('2026-01-05');
  });

  test('addDays atravessa mês e ano', () => {
    expect(toISODate(addDays(new Date(2026, 11, 30), 3))).toBe('2027-01-02');
  });

  test('isValidISODate', () => {
    expect(isValidISODate('2026-11-19')).toBe(true);
    expect(isValidISODate('2026-02-30')).toBe(false);
    expect(isValidISODate('19/11/2026')).toBe(false);
    expect(isValidISODate('')).toBe(false);
  });

  test('formatDate curto e completo', () => {
    expect(formatDate('2026-11-19')).toBe('19 Nov');
    expect(formatDate('2026-03-05', true)).toBe('05 de Março de 2026');
    expect(formatDate('')).toBe('');
  });

  test('buildDateOptions gera N dias começando por "Hoje"', () => {
    const opts = buildDateOptions(new Date(2026, 10, 19), 14);
    expect(opts).toHaveLength(14);
    expect(opts[0]).toMatchObject({ iso: '2026-11-19', weekday: 'Hoje', day: '19', month: 'Nov' });
    expect(opts[1]).toMatchObject({ iso: '2026-11-20', weekday: 'Sex' });
    expect(opts[13].iso).toBe('2026-12-02');
  });

  test('formatTime mostra HH:MM com zero à esquerda', () => {
    expect(formatTime(new Date(2026, 10, 19, 8, 5))).toBe('08:05');
    expect(formatTime(new Date(2026, 10, 19, 14, 30))).toBe('14:30');
  });

  test('buildDateTime junta data e horário', () => {
    const d = buildDateTime('2026-11-19', '14:30');
    expect([d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes()]).toEqual([2026, 10, 19, 14, 30]);
  });

  test('getReminderDate = 60 min antes por padrão', () => {
    const r = getReminderDate('2026-11-19', '09:00');
    expect([r.getHours(), r.getMinutes()]).toEqual([8, 0]);
  });

  test('getReminderDate com antecedência personalizada atravessa a meia-noite', () => {
    const r = getReminderDate('2026-11-20', '07:30', 8 * 60);
    expect(toISODate(r)).toBe('2026-11-19');
    expect([r.getHours(), r.getMinutes()]).toEqual([23, 30]);
  });
});
