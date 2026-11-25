import { STATUS } from '../constants/services';
import { addDays, toISODate } from './dates';

// Ordena por data + horário (mais cedo primeiro)
export function sortAppointments(list) {
  return [...list].sort((a, b) => (a.date + a.slot).localeCompare(b.date + b.slot));
}

// Aplica filtro rápido (todos/hoje/semana/pendente) e busca por nome, placa ou carro
export function filterAppointments(list, { filter = 'todos', search = '', now = new Date() } = {}) {
  const today = toISODate(now);
  const weekEnd = toISODate(addDays(now, 7));
  let result = sortAppointments(list);

  if (filter === 'hoje') result = result.filter((a) => a.date === today);
  if (filter === 'semana') result = result.filter((a) => a.date >= today && a.date <= weekEnd);
  if (filter === 'pendente') result = result.filter((a) => a.status === STATUS.CONFIRMADO);

  const term = String(search).trim().toLowerCase();
  if (term) {
    result = result.filter(
      (a) =>
        (a.name || '').toLowerCase().includes(term) ||
        (a.plate || '').toLowerCase().includes(term) ||
        (a.car || '').toLowerCase().includes(term),
    );
  }
  return result;
}

// Horários já ocupados em uma data (cancelados liberam o horário)
export function getTakenSlots(list, date) {
  return list
    .filter((a) => a.date === date && a.status !== STATUS.CANCELADO)
    .map((a) => a.slot);
}

export function computeStats(list, now = new Date()) {
  const today = toISODate(now);
  return {
    total: list.length,
    hoje: list.filter((a) => a.date === today).length,
    confirmados: list.filter((a) => a.status === STATUS.CONFIRMADO).length,
    concluidos: list.filter((a) => a.status === STATUS.CONCLUIDO).length,
  };
}

export function getUpcoming(list, now = new Date(), limit = 8) {
  const today = toISODate(now);
  return sortAppointments(list)
    .filter((a) => a.date >= today && a.status !== STATUS.CANCELADO)
    .slice(0, limit);
}

// Normaliza o campo "service" (antigamente string, hoje lista)
export function getServiceIds(apt) {
  return Array.isArray(apt.service) ? apt.service : [apt.service].filter(Boolean);
}
