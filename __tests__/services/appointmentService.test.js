import { addDoc, getDoc, getDocs, onSnapshot, updateDoc } from 'firebase/firestore';
import {
  createAppointment,
  getAppointmentById,
  subscribeAppointments,
  updateAppointmentStatus,
} from '../../src/services/appointmentService';

jest.mock('firebase/firestore', () => ({
  collection: jest.fn((db, name) => ({ name })),
  doc: jest.fn((db, col, id) => ({ col, id })),
  query: jest.fn((col) => col),
  where: jest.fn(),
  addDoc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  onSnapshot: jest.fn(),
  updateDoc: jest.fn(),
}));

const dados = { name: 'João', date: '2026-11-19', slot: '09:00', service: ['freios'] };
const docDe = (data) => ({ data: () => data });

beforeEach(() => jest.clearAllMocks());

describe('createAppointment', () => {
  test('salva com status confirmado e data de criação', async () => {
    getDocs.mockResolvedValue({ docs: [] });
    addDoc.mockResolvedValue({ id: 'a1' });

    const apt = await createAppointment(dados);

    expect(apt.id).toBe('a1');
    expect(apt.status).toBe('confirmado');
    expect(typeof apt.createdAt).toBe('string');
    expect(addDoc).toHaveBeenCalledTimes(1);
  });

  test('recusa horário já ocupado', async () => {
    getDocs.mockResolvedValue({ docs: [docDe({ slot: '09:00', status: 'confirmado' })] });
    await expect(createAppointment(dados)).rejects.toThrow(/horário/i);
    expect(addDoc).not.toHaveBeenCalled();
  });

  test('horário de agendamento cancelado pode ser reutilizado', async () => {
    getDocs.mockResolvedValue({ docs: [docDe({ slot: '09:00', status: 'cancelado' })] });
    addDoc.mockResolvedValue({ id: 'a2' });
    await expect(createAppointment(dados)).resolves.toMatchObject({ id: 'a2' });
  });
});

describe('leitura e atualização', () => {
  test('subscribeAppointments converte os documentos e devolve o unsubscribe', () => {
    const unsubscribe = jest.fn();
    onSnapshot.mockImplementation((col, onNext) => {
      onNext({ docs: [{ id: 'x', data: () => ({ name: 'Ana' }) }] });
      return unsubscribe;
    });
    const onData = jest.fn();

    const result = subscribeAppointments(onData);

    expect(onData).toHaveBeenCalledWith([{ id: 'x', name: 'Ana' }]);
    expect(result).toBe(unsubscribe);
  });

  test('getAppointmentById existente e inexistente', async () => {
    getDoc.mockResolvedValueOnce({ exists: () => true, id: 'a1', data: () => ({ name: 'Ana' }) });
    expect(await getAppointmentById('a1')).toEqual({ id: 'a1', name: 'Ana' });

    getDoc.mockResolvedValueOnce({ exists: () => false });
    expect(await getAppointmentById('nada')).toBeNull();
  });

  test('updateAppointmentStatus grava só o status', async () => {
    await updateAppointmentStatus('a1', 'concluido');
    expect(updateDoc).toHaveBeenCalledWith({ col: 'agendamentos', id: 'a1' }, { status: 'concluido' });
  });
});
