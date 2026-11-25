// CRUD de agendamentos na coleção "agendamentos" do Firestore.
import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { STATUS } from '../constants/services';

const COL = 'agendamentos';

// Escuta a coleção em tempo real. Retorna a função para cancelar a escuta.
export function subscribeAppointments(onData, onError) {
  return onSnapshot(
    collection(db, COL),
    (snap) => onData(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    (err) => onError && onError(err),
  );
}

// Cria um agendamento, recusando horário já ocupado na mesma data.
export async function createAppointment(data) {
  const sameDay = await getDocs(query(collection(db, COL), where('date', '==', data.date)));
  const taken = sameDay.docs.some((d) => {
    const a = d.data();
    return a.slot === data.slot && a.status !== STATUS.CANCELADO;
  });
  if (taken) throw new Error('Este horário acabou de ser ocupado. Escolha outro.');

  const apt = {
    ...data,
    status: STATUS.CONFIRMADO,
    createdAt: new Date().toISOString(),
  };
  const ref = await addDoc(collection(db, COL), apt);
  return { id: ref.id, ...apt };
}

export async function getAppointmentById(id) {
  const snap = await getDoc(doc(db, COL, id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function updateAppointment(id, changes) {
  await updateDoc(doc(db, COL, id), changes);
}

export async function updateAppointmentStatus(id, status) {
  await updateAppointment(id, { status });
}
