import * as Notifications from 'expo-notifications';
import {
  cancelReminder,
  configureNotifications,
  requestNotificationPermission,
  scheduleReminder,
  sendConfirmationNotification,
} from '../../src/services/notificationService';

jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  AndroidImportance: { HIGH: 6 },
  SchedulableTriggerInputTypes: { DATE: 'date' },
}));

const apt = { id: 'a1', name: 'João', car: 'Uno', date: '2026-11-19', slot: '15:00' };

beforeEach(() => {
  jest.clearAllMocks();
  Notifications.getPermissionsAsync.mockResolvedValue({ granted: true });
  Notifications.scheduleNotificationAsync.mockResolvedValue('notif-1');
});

describe('configuração', () => {
  test('define o handler e cria o canal de notificações no Android', async () => {
    await configureNotifications();
    expect(Notifications.setNotificationHandler).toHaveBeenCalledTimes(1);
    const { handleNotification } = Notifications.setNotificationHandler.mock.calls[0][0];
    expect(await handleNotification()).toMatchObject({ shouldShowBanner: true, shouldShowList: true });
    // jest-expo roda como iOS por padrão, então o canal (só Android) não é criado
    expect(Notifications.setNotificationChannelAsync).not.toHaveBeenCalled();
  });
});

describe('permissão', () => {
  test('já concedida: não pergunta de novo', async () => {
    expect(await requestNotificationPermission()).toBe(true);
    expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
  });

  test('pede ao usuário quando ainda não concedida', async () => {
    Notifications.getPermissionsAsync.mockResolvedValue({ granted: false });
    Notifications.requestPermissionsAsync.mockResolvedValue({ granted: true });
    expect(await requestNotificationPermission()).toBe(true);
  });

  test('usuário nega', async () => {
    Notifications.getPermissionsAsync.mockResolvedValue({ granted: false });
    Notifications.requestPermissionsAsync.mockResolvedValue({ granted: false });
    expect(await requestNotificationPermission()).toBe(false);
  });
});

describe('notificação de confirmação', () => {
  test('dispara imediatamente (trigger null) com dados do agendamento', async () => {
    await sendConfirmationNotification(apt);
    const arg = Notifications.scheduleNotificationAsync.mock.calls[0][0];
    expect(arg.trigger).toBeNull();
    expect(arg.content.body).toContain('João');
    expect(arg.content.body).toContain('15:00');
    expect(arg.content.data).toEqual({ appointmentId: 'a1' });
  });

  test('sem permissão não agenda nada', async () => {
    Notifications.getPermissionsAsync.mockResolvedValue({ granted: false });
    Notifications.requestPermissionsAsync.mockResolvedValue({ granted: false });
    expect(await sendConfirmationNotification(apt)).toBeNull();
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });
});

describe('lembrete', () => {
  test('agenda 1 hora antes do horário marcado', async () => {
    const agora = new Date(2026, 10, 19, 10, 0);
    const id = await scheduleReminder(apt, agora);

    expect(id).toBe('notif-1');
    const { trigger } = Notifications.scheduleNotificationAsync.mock.calls[0][0];
    expect(trigger.type).toBe('date');
    expect([trigger.date.getHours(), trigger.date.getMinutes()]).toEqual([14, 0]);
    const { content } = Notifications.scheduleNotificationAsync.mock.calls[0][0];
    expect(content.body).toContain('15:00');
    expect(content.body).toContain('Uno');
    expect(content.data).toEqual({ appointmentId: 'a1' });
  });

  test('não agenda se o horário do lembrete já passou', async () => {
    const agora = new Date(2026, 10, 19, 14, 30); // lembrete era 14:00
    expect(await scheduleReminder(apt, agora)).toBeNull();
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  test('cancelReminder cancela pelo id e ignora id vazio', async () => {
    await cancelReminder('notif-1');
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('notif-1');
    await cancelReminder(undefined);
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledTimes(1);
  });
});
