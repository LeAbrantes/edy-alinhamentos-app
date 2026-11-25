import { REMINDER_MINUTES_BEFORE } from '../constants/services';

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const FULL_MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];
const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const pad = (n) => String(n).padStart(2, '0');

// Data local no formato AAAA-MM-DD.
// (O site usava toISOString(), que é UTC e "pula" para o dia seguinte à noite no Brasil.)
export function toISODate(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function todayISO(now = new Date()) {
  return toISODate(now);
}

export function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function isValidISODate(str) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(str))) return false;
  const [y, m, d] = str.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

export function formatDate(dateStr, full = false) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  if (full) return `${d} de ${FULL_MONTHS[parseInt(m, 10) - 1]} de ${y}`;
  return `${d} ${MONTHS[parseInt(m, 10) - 1]}`;
}

// Lista de dias para o seletor de datas do formulário
export function buildDateOptions(startDate = new Date(), count = 14) {
  return Array.from({ length: count }, (_, i) => {
    const d = addDays(startDate, i);
    return {
      iso: toISODate(d),
      weekday: i === 0 ? 'Hoje' : WEEKDAYS[d.getDay()],
      day: pad(d.getDate()),
      month: MONTHS[d.getMonth()],
    };
  });
}

// Hora e minuto (HH:MM) de um objeto Date
export function formatTime(date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// Junta data (AAAA-MM-DD) e horário (HH:MM) em um objeto Date local
export function buildDateTime(dateStr, slot) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const [hh, mm] = slot.split(':').map(Number);
  return new Date(y, m - 1, d, hh, mm, 0, 0);
}

// Momento em que o lembrete deve disparar (padrão: 60 min antes do horário marcado)
export function getReminderDate(dateStr, slot, minutesBefore = REMINDER_MINUTES_BEFORE) {
  const when = buildDateTime(dateStr, slot);
  return new Date(when.getTime() - minutesBefore * 60 * 1000);
}
