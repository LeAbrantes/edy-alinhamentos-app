import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { subscribeAppointments } from '../services/appointmentService';

export const AppointmentsContext = createContext({
  appointments: [],
  loading: false,
  error: null,
});

// Uma única escuta em tempo real do Firestore compartilhada por todas as telas
export function AppointmentsProvider({ children }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeAppointments(
      (list) => {
        setAppointments(list);
        setError(null);
        setLoading(false);
      },
      (err) => {
        setError(err.message || 'Erro ao carregar agendamentos.');
        setLoading(false);
      },
    );
    return unsubscribe;
  }, []);

  const value = useMemo(() => ({ appointments, loading, error }), [appointments, loading, error]);
  return <AppointmentsContext.Provider value={value}>{children}</AppointmentsContext.Provider>;
}

export const useAppointments = () => useContext(AppointmentsContext);
