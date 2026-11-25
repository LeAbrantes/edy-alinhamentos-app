// Notificações locais (recurso do celular #1): confirmação imediata + lembrete
// programado 1 hora antes do horário agendado.
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { REMINDER_MINUTES_BEFORE } from '../constants/services';
import { formatDate, getReminderDate } from '../utils/dates';

const CHANNEL_ID = 'agendamentos';

// Chamar uma vez ao abrir o app: define como a notificação aparece com o app aberto
// e cria o canal no Android.
export async function configureNotifications() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Agendamentos',
      importance: Notifications.AndroidImportance.HIGH,
      lightColor: '#F26A1B',
    });
  }
}

export async function requestNotificationPermission() {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const asked = await Notifications.requestPermissionsAsync();
  return Boolean(asked.granted);
}

// Notificação imediata ao confirmar um agendamento
export async function sendConfirmationNotification(apt) {
  const allowed = await requestNotificationPermission();
  if (!allowed) return null;
  return Notifications.scheduleNotificationAsync({
    content: {
      title: '✅ Agendamento confirmado',
      body: `${apt.name} • ${formatDate(apt.date)} às ${apt.slot}`,
      data: { appointmentId: apt.id },
    },
    trigger: null, // null = dispara agora
  });
}

// Lembrete antes do horário. Retorna o id da notificação (ou null se já passou do horário).
export async function scheduleReminder(apt, now = new Date()) {
  const when = getReminderDate(apt.date, apt.slot, REMINDER_MINUTES_BEFORE);
  if (when.getTime() <= now.getTime()) return null;

  const allowed = await requestNotificationPermission();
  if (!allowed) return null;

  return Notifications.scheduleNotificationAsync({
    content: {
      title: '🔧 Seu horário na Edy é daqui a pouco',
      body: `${apt.car || 'Veículo'} às ${apt.slot}. Esperamos você na Edy!`,
      data: { appointmentId: apt.id },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: when,
      channelId: CHANNEL_ID,
    },
  });
}

export async function cancelReminder(notificationId) {
  if (!notificationId) return;
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}
