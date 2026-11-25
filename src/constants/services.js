// Dados fixos do negócio (mesmos do site da oficina)
export const SERVICES = [
  { id: 'borracharia', name: 'Borracharia', icon: '🛞' },
  { id: 'balanceamento', name: 'Balanceamento', icon: '⚖️' },
  { id: 'alinhamento', name: 'Alinhamento', icon: '📐' },
  { id: 'scanner', name: 'Scanner', icon: '🔍' },
  { id: 'troca_oleo', name: 'Troca de Óleo', icon: '🛢️' },
  { id: 'freios', name: 'Freios', icon: '🔧' },
  { id: 'suspensao', name: 'Suspensão', icon: '🔩' },
  { id: 'outros', name: 'Outros', icon: '🔨' },
];

export const SLOTS = [
  '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00',
  '11:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00',
  '16:30', '17:00', '17:30', '18:00'
];

export const STATUS = {
  CONFIRMADO: 'confirmado',
  CONCLUIDO: 'concluido',
  CANCELADO: 'cancelado',
};

export const STATUS_LABEL = {
  confirmado: 'Confirmado',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
};

export const FILTERS = [
  { id: 'todos', label: 'Todos' },
  { id: 'hoje', label: 'Hoje' },
  { id: 'semana', label: 'Esta semana' },
  { id: 'pendente', label: 'Pendentes' },
];

// Antecedência (em minutos) do lembrete enviado antes do horário agendado
export const REMINDER_MINUTES_BEFORE = 60;
